import os
import json
import logging
import re
from typing import List, Dict, Any, Tuple, Optional
from groq import Groq

from backend.services.data_service import OrderDataService
from backend.services.order_tools import GROQ_TOOLS, OrderToolsHandler

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the AI Order Assistant, a helpful and precise assistant for managing and analyzing order dataset records.

Your capabilities:
1. Look up specific orders by ID using `lookup_order(order_id)`.
2. Search and filter orders by category, city, order status, or date range using `filter_orders(category, city, status, start_date, end_date)`.
3. Perform metrics analysis, revenue calculations, customer spend rankings, top products, or category/city breakdowns using `analyze_orders(metric, category, city, status, month, year)`.

Guidelines:
- ALWAYS rely on tool calls to fetch factual data. Do NOT guess or hallucinate order numbers or revenue totals.
- Output all financial figures in Indian Rupees (₹), e.g. ₹15,999.
- Present search results, order lookups, and analytics using clean Markdown formatting (tables, bullet points, bold key stats).
- If a requested order is not found or a filter yields 0 results, politely inform the user and suggest alternative queries.
- Maintain a professional, polite, and clear tone.
"""


class AIService:
    def __init__(self, data_service: OrderDataService):
        self.data_service = data_service
        self.tools_handler = OrderToolsHandler(data_service)

    @property
    def groq_api_key(self) -> str:
        """Dynamically resolve GROQ_API_KEY from environment."""
        return os.getenv("GROQ_API_KEY", "").strip()

    @property
    def groq_base_url(self) -> str:
        """Dynamically resolve Groq API Base URL from environment."""
        return os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()

    @property
    def api_key(self) -> str:
        """Dynamically resolve active API key (GROQ_API_KEY required)."""
        return self.groq_api_key

    @property
    def model_name(self) -> str:
        """Dynamically resolve active Groq model identifier from environment."""
        if self.groq_api_key:
            return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        return "local-fallback"

    def _get_groq_client(self) -> Groq:
        key = self.groq_api_key
        if not key:
            raise ValueError("GROQ_API_KEY is not configured in backend environment.")
        return Groq(api_key=key, base_url=self.groq_base_url)

    def process_chat(self, user_message: str, history: List[Dict[str, str]]) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Processes user query using Groq API tool calling.
        If Groq is unconfigured or rate limited/error occurs, falls back to intelligent local data engine.
        Returns tuple of (assistant_reply, executed_tool_calls).
        """
        if self.groq_api_key:
            return self._process_chat_groq(user_message, history)

        # No API Key configured -> Use Intelligent Local Data Engine
        reply, tools = self._local_fallback_process(user_message)
        return "*(Groq API Key Not Configured: Using local data engine)*\n\n" + reply, tools

    def _process_chat_groq(self, user_message: str, history: List[Dict[str, str]]) -> Tuple[str, List[Dict[str, Any]]]:
        """Execute chat using official Groq SDK with model llama-3.3-70b-versatile and tool calling."""
        try:
            client = self._get_groq_client()
        except Exception as e:
            logger.warning(f"Could not initialize Groq client: {e}. Falling back to local data engine.")
            reply, tools = self._local_fallback_process(user_message)
            return f"*(Groq Initialization Error [{type(e).__name__}]: Using local data engine)*\n\n" + reply, tools

        # Build initial messages array starting with system prompt
        messages: List[Dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-10:]:
            role = h.get("role", "user")
            role_mapped = "assistant" if role in ["assistant", "model"] else "user"
            content_text = h.get("content", "")
            if content_text and not h.get("error"):
                messages.append({"role": role_mapped, "content": content_text})

        messages.append({"role": "user", "content": user_message})

        executed_tools: List[Dict[str, Any]] = []
        max_turns = 5

        for turn in range(max_turns):
            try:
                response = client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    tools=GROQ_TOOLS,
                    tool_choice="auto",
                    temperature=0.2
                )
            except Exception as api_err:
                err_type = type(api_err).__name__
                err_str = str(api_err)

                # Safe logging: redact sensitive key strings
                safe_err_log = re.sub(r'(gsk_|sk-|AIza)[a-zA-Z0-9_-]+', '[REDACTED_KEY]', err_str)
                logger.error(f"Groq API Error: {safe_err_log}")

                # Precise error classification
                if "401" in err_str or "invalid_api_key" in err_str.lower() or "authentication" in err_str.lower():
                    note_prefix = f"*(Groq API Error: Invalid API Key [{err_type}]: Switched to local data engine)*\n\n"
                elif "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                    note_prefix = f"*(Groq API Rate Limit / Quota Exceeded [{err_type}]: Switched to local data engine)*\n\n"
                elif "404" in err_str or "model_not_found" in err_str.lower():
                    note_prefix = f"*(Groq API Error: Model Not Found [{err_type}]: Switched to local data engine)*\n\n"
                else:
                    note_prefix = f"*(Groq API Error [{err_type}]: Switched to local data engine)*\n\n"

                fallback_reply, fallback_tools = self._local_fallback_process(user_message)
                return note_prefix + fallback_reply, fallback_tools

            msg = response.choices[0].message
            if msg.tool_calls:
                messages.append(msg)
                for tool_call in msg.tool_calls:
                    tool_name = tool_call.function.name
                    raw_args = tool_call.function.arguments
                    if isinstance(raw_args, str):
                        try:
                            tool_args = json.loads(raw_args)
                        except Exception:
                            tool_args = {}
                    else:
                        tool_args = raw_args or {}

                    result = self.tools_handler.execute_tool(tool_name, tool_args)

                    executed_tools.append({
                        "tool": tool_name,
                        "arguments": json.dumps(tool_args, ensure_ascii=False) if isinstance(tool_args, dict) else str(tool_args),
                        "result": result
                    })

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps(result, ensure_ascii=False)
                    })
            else:
                final_text = msg.content or "No response generated."
                return final_text, executed_tools

        return "Completed processing your request.", executed_tools

    def generate_dashboard_insights(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate evidence-based AI sales insights from computed stats using Groq API.
        If Groq is unavailable or quota exceeded, returns deterministic local engine insights.
        """
        stats = self.data_service.get_dashboard_stats(category=category, status=status, month=month, year=year)
        kpis = stats.get("kpis", {})

        if kpis.get("total_orders", 0) == 0:
            return {
                "insights": "No orders matched the selected filter criteria to generate insights.",
                "is_ai_generated": False,
                "stats_summary": stats
            }

        prompt = (
            f"Analyze the following order dataset metrics and generate executive sales insights:\n"
            f"- Total Orders: {kpis.get('total_orders')}\n"
            f"- Gross Revenue: ₹{kpis.get('total_revenue_inr'):,.2f}\n"
            f"- Delivered Revenue: ₹{kpis.get('delivered_revenue_inr'):,.2f}\n"
            f"- Average Order Value (AOV): ₹{kpis.get('avg_order_value_inr'):,.2f}\n"
            f"- Order Status Counts: Delivered: {kpis.get('delivered_orders')}, Cancelled: {kpis.get('cancelled_orders')}, "
            f"Returned: {kpis.get('returned_orders')}, Processing: {kpis.get('processing_orders')}, Shipped: {kpis.get('shipped_orders')}\n"
            f"- Top Categories: {json.dumps(stats.get('category_breakdown', []))}\n"
            f"- Top Products: {json.dumps(stats.get('top_products', []))}\n"
            f"- Monthly Revenue Trend: {json.dumps(stats.get('monthly_trend', []))}\n\n"
            f"Please write a structured summary in Markdown covering:\n"
            f"1. **Best-Performing Product & Category**\n"
            f"2. **Monthly Sales Patterns & Trends**\n"
            f"3. **Order Status & Cancellation Analysis**\n"
            f"4. **Notable Insights & Operational Recommendations**"
        )

        if self.groq_api_key:
            try:
                client = self._get_groq_client()
                response = client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                if response and response.choices and response.choices[0].message.content:
                    return {
                        "insights": response.choices[0].message.content,
                        "is_ai_generated": True,
                        "stats_summary": stats
                    }
            except Exception as e:
                logger.warning(f"Groq Insights generation error: {e}")

        # Deterministic fallback insights using actual computed stats
        top_cat = stats['category_breakdown'][0]['category'] if stats.get('category_breakdown') else 'N/A'
        top_cat_rev = stats['category_breakdown'][0]['revenue'] if stats.get('category_breakdown') else 0
        top_prod = stats['top_products'][0]['product'] if stats.get('top_products') else 'N/A'
        top_prod_rev = stats['top_products'][0]['revenue'] if stats.get('top_products') else 0

        deliv_pct = round((kpis.get('delivered_orders', 0) / kpis.get('total_orders', 1)) * 100, 1)
        canc_pct = round((kpis.get('cancelled_orders', 0) / kpis.get('total_orders', 1)) * 100, 1)
        ret_pct = round((kpis.get('returned_orders', 0) / kpis.get('total_orders', 1)) * 100, 1)

        fallback_md = (
            f"*(Local Data Engine Insights - Groq API Offline)*\n\n"
            f"### 🏆 1. Best-Performing Category & Product\n"
            f"- **Top Category:** **{top_cat}** generated highest revenue at **₹{top_cat_rev:,.2f}**.\n"
            f"- **Top Product:** **{top_prod}** led individual product sales at **₹{top_prod_rev:,.2f}**.\n\n"
            f"### 📈 2. Revenue & Order Performance\n"
            f"- **Gross Revenue:** **₹{kpis.get('total_revenue_inr'):,.2f}** across **{kpis.get('total_orders')}** total orders.\n"
            f"- **Average Order Value (AOV):** **₹{kpis.get('avg_order_value_inr'):,.2f}**.\n\n"
            f"### 🚚 3. Order Status & Fulfillment Distribution\n"
            f"- **Delivered:** {kpis.get('delivered_orders')} orders ({deliv_pct}% fulfillment rate).\n"
            f"- **Cancelled:** {kpis.get('cancelled_orders')} orders ({canc_pct}% cancellation rate).\n"
            f"- **Returned:** {kpis.get('returned_orders')} orders ({ret_pct}% return rate).\n\n"
            f"### ⚠️ 4. Key Takeaways & Recommendations\n"
            f"- High fulfillment velocity in **{top_cat}** indicates strong customer demand.\n"
            f"- Monitor **{kpis.get('cancelled_orders')} cancelled order(s)** to reduce potential revenue loss."
        )

        return {
            "insights": fallback_md,
            "is_ai_generated": False,
            "stats_summary": stats
        }

    def _local_fallback_process(self, user_message: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Rule-based parser used when GROQ_API_KEY is not set or API is unreachable/rate-limited.
        Parses intent from user query and runs genuine data tools directly.
        """
        msg_lower = user_message.lower().strip()
        executed_tools: List[Dict[str, Any]] = []

        # 1. Order Lookup (e.g. ORD-1001, ord 1005, or order 1002)
        ord_match = re.search(r'ord[-\s]?(\d{4})', msg_lower)
        if not ord_match and ("lookup" in msg_lower or "order" in msg_lower):
            ord_match = re.search(r'\b(\d{4})\b', msg_lower)

        if ord_match:
            digits = ord_match.group(1)
            ord_id = f"ORD-{digits}"
            res = self.data_service.lookup_order(ord_id)
            executed_tools.append({"tool": "lookup_order", "arguments": json.dumps({"order_id": ord_id}), "result": res})
            if res.get("found"):
                reply = (
                    f"### Order Details for `{res['order_id']}`\n\n"
                    f"- **Customer:** {res['customer_name']} ({res['city']})\n"
                    f"- **Product:** {res['product']} ({res['category']})\n"
                    f"- **Quantity:** {res['quantity']} unit(s)\n"
                    f"- **Unit Price:** ₹{res['unit_price_inr']:,.2f}\n"
                    f"- **Total Amount:** ₹{res['total_inr']:,.2f}\n"
                    f"- **Order Date:** {res['order_date']}\n"
                    f"- **Payment Method:** {res['payment_method']}\n"
                    f"- **Status:** `{res['status'].upper()}`\n"
                )
            else:
                reply = res.get("message", f"Order {ord_id} was not found.")
            return reply, executed_tools

        # 2. Status Breakdown / Summary
        if "status" in msg_lower and any(w in msg_lower for w in ["breakdown", "summary", "all", "distribution", "list", "show", "count", "report"]):
            has_specific_status = any(s in msg_lower for s in ["delivered", "cancelled", "returned", "processing", "shipped"])
            if not has_specific_status or "breakdown" in msg_lower or "summary" in msg_lower:
                res = self.data_service.analyze_orders(metric="status_breakdown")
                executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "status_breakdown"}), "result": res})
                breakdown = res.get("breakdown", [])
                lines = [
                    "### Order Status Breakdown\n",
                    "| Status | Orders | Percentage | Total Value |",
                    "|---|---|---|---|"
                ]
                for item in breakdown:
                    lines.append(
                        f"| `{item['status'].upper()}` | {item['order_count']} | {item['percentage_of_orders']}% | {item['formatted_value']} |"
                    )
                return "\n".join(lines), executed_tools

        # 3. Specific Status Filtering (delivered, cancelled, returned, processing, shipped)
        for s in ["delivered", "cancelled", "returned", "processing", "shipped"]:
            if s in msg_lower:
                res = self.data_service.filter_orders(status=s)
                executed_tools.append({"tool": "filter_orders", "arguments": json.dumps({"status": s}), "result": res})
                orders = res.get("orders", [])
                lines = [f"### Orders with Status: `{s.upper()}` (Total: {res['count']})\n"]
                for o in orders[:10]:
                    lines.append(f"- **{o['order_id']}**: {o['product']} ({o['customer_name']}, {o['city']}) - ₹{o['total_inr']:,.2f}")
                if res['count'] > 10:
                    lines.append(f"\n*(Showing top 10 of {res['count']} matching orders)*")
                return "\n".join(lines), executed_tools

        # 4. Customer Spend Rankings / Top Customers
        if any(w in msg_lower for w in ["customer", "customers", "ranking", "rankings", "top buyer", "top spender"]):
            res = self.data_service.analyze_orders(metric="customer_ranking")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "customer_ranking"}), "result": res})
            rankings = res.get("rankings", [])
            lines = [
                "### Top Customer Spend Rankings\n",
                "| Rank | Customer | City | Orders | Total Spend |",
                "|---|---|---|---|---|"
            ]
            for r in rankings[:5]:
                lines.append(f"| #{r['rank']} | {r['customer_name']} | {r['city']} | {r['order_count']} | {r['formatted_spend']} |")
            return "\n".join(lines), executed_tools

        # 5. Category Breakdown / Category Revenue
        if any(w in msg_lower for w in ["category", "categories", "department"]):
            res = self.data_service.analyze_orders(metric="category_breakdown")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "category_breakdown"}), "result": res})
            breakdown = res.get("breakdown", [])
            lines = [
                "### Revenue by Product Category\n",
                "| Category | Total Revenue | Share | Units Sold |",
                "|---|---|---|---|"
            ]
            for c in breakdown:
                lines.append(f"| **{c['category']}** | {c['formatted_revenue']} | {c['percentage_of_total']}% | {c['total_units_sold']} |")
            return "\n".join(lines), executed_tools

        # 6. City Breakdown / City Revenue
        if any(w in msg_lower for w in ["city", "cities", "location", "locations"]):
            res = self.data_service.analyze_orders(metric="city_breakdown")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "city_breakdown"}), "result": res})
            breakdown = res.get("breakdown", [])
            lines = [
                "### Revenue by City\n",
                "| City | Total Revenue | Share | Orders |",
                "|---|---|---|---|"
            ]
            for c in breakdown:
                lines.append(f"| **{c['city']}** | {c['formatted_revenue']} | {c['percentage_of_total']}% | {c['order_count']} |")
            return "\n".join(lines), executed_tools

        # 7. Top Product / Product Sales
        if any(w in msg_lower for w in ["product", "products", "item", "items", "best seller", "top selling"]):
            res = self.data_service.analyze_orders(metric="top_product")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "top_product"}), "result": res})
            products = res.get("products", [])
            lines = [
                "### Product Sales Ranking\n",
                "| Rank | Product | Category | Units Sold | Total Revenue |",
                "|---|---|---|---|---|"
            ]
            for p in products[:5]:
                lines.append(f"| #{p['rank']} | **{p['product']}** | {p['category']} | {p['total_units_sold']} | {p['formatted_revenue']} |")
            return "\n".join(lines), executed_tools

        # 8. Average Order Value (AOV)
        if any(w in msg_lower for w in ["avg", "average", "aov"]):
            res = self.data_service.analyze_orders(metric="avg_order_value")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "avg_order_value"}), "result": res})
            aov_formatted = res.get("formatted_value", f"₹{res.get('value_inr', 0):,.2f}")
            cnt = res.get("order_count", 0)
            return f"The **Average Order Value (AOV)** across {cnt} order(s) is **{aov_formatted}**.", executed_tools

        # 9. Order Count / Total Orders
        if any(w in msg_lower for w in ["count", "how many", "total orders", "number of orders"]):
            res = self.data_service.analyze_orders(metric="order_count")
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "order_count"}), "result": res})
            cnt = res.get("count", 0)
            return f"There are a total of **{cnt} orders** recorded in the system dataset.", executed_tools

        # 10. Revenue / Sales Calculation (with month detection)
        if any(w in msg_lower for w in ["revenue", "sales", "total inr", "earnings", "income", "june", "july", "august", "september"]):
            month = None
            if "june" in msg_lower or "06" in msg_lower:
                month = 6
            elif "july" in msg_lower or "07" in msg_lower:
                month = 7
            elif "august" in msg_lower or "08" in msg_lower:
                month = 8
            elif "september" in msg_lower or "09" in msg_lower:
                month = 9

            res = self.data_service.analyze_orders(metric="total_revenue", month=month, year=2026)
            executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "total_revenue", "month": month}), "result": res})
            rev_formatted = res.get("formatted_value", f"₹{res.get('value_inr', 0):,.2f}")
            cnt = res.get("order_count", 0)
            m_name = f" in month {month}" if month else ""
            return f"The total revenue{m_name} across {cnt} order(s) is **{rev_formatted}**.", executed_tools

        # 11. General Summary Fallback
        res = self.data_service.analyze_orders(metric="total_revenue")
        executed_tools.append({"tool": "analyze_orders", "arguments": json.dumps({"metric": "total_revenue"}), "result": res})
        rev_formatted = res.get("formatted_value", f"₹{res.get('value_inr', 0):,.2f}")
        cnt = res.get("order_count", 0)
        return (
            f"Here is the dataset summary for your request:\n\n"
            f"- **Total Orders Loaded:** {cnt}\n"
            f"- **Total Revenue:** {rev_formatted}\n\n"
            f"You can ask specific questions like:\n"
            f"- *\"Show status breakdown of all orders\"*\n"
            f"- *\"Lookup order ORD-1001\"*\n"
            f"- *\"What is the total revenue in July 2026?\"*\n"
            f"- *\"Show top 5 spending customers\"*\n"
        ), executed_tools

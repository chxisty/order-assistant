import json
from typing import Dict, Any, List
from google import genai
from google.genai import types
from backend.services.data_service import OrderDataService

# Gemini Function Declarations using Google Gen AI SDK
GEMINI_TOOLS = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="lookup_order",
                description="Look up detailed information for a specific order by order_id (e.g., 'ORD-1001').",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "order_id": types.Schema(
                            type=types.Type.STRING,
                            description="The order identifier, e.g. 'ORD-1001'."
                        )
                    },
                    required=["order_id"]
                )
            ),
            types.FunctionDeclaration(
                name="filter_orders",
                description="Filter and search orders by category, city, order status, or date range.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "category": types.Schema(
                            type=types.Type.STRING,
                            description="Product category (e.g., 'Electronics', 'Accessories', 'Stationery', 'Furniture')."
                        ),
                        "city": types.Schema(
                            type=types.Type.STRING,
                            description="Customer city (e.g., 'Hyderabad', 'Pune', 'Bengaluru', 'Chennai', 'Kochi', 'Thiruvananthapuram')."
                        ),
                        "status": types.Schema(
                            type=types.Type.STRING,
                            description="Order status (e.g., 'delivered', 'returned', 'cancelled', 'processing', 'shipped')."
                        ),
                        "start_date": types.Schema(
                            type=types.Type.STRING,
                            description="Start date in YYYY-MM-DD format (e.g. '2026-06-01')."
                        ),
                        "end_date": types.Schema(
                            type=types.Type.STRING,
                            description="End date in YYYY-MM-DD format (e.g. '2026-08-31')."
                        )
                    },
                    required=[]
                )
            ),
            types.FunctionDeclaration(
                name="analyze_orders",
                description="Calculate business metrics, total revenue, average order value, top customer rankings, top products, or category/city/status breakdowns.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "metric": types.Schema(
                            type=types.Type.STRING,
                            description="Metric to analyze. Options: total_revenue, avg_order_value, order_count, customer_ranking, top_product, category_breakdown, city_breakdown, status_breakdown."
                        ),
                        "category": types.Schema(
                            type=types.Type.STRING,
                            description="Filter analysis by product category."
                        ),
                        "city": types.Schema(
                            type=types.Type.STRING,
                            description="Filter analysis by city."
                        ),
                        "status": types.Schema(
                            type=types.Type.STRING,
                            description="Filter analysis by order status."
                        ),
                        "month": types.Schema(
                            type=types.Type.INTEGER,
                            description="Filter analysis by month (1 to 12)."
                        ),
                        "year": types.Schema(
                            type=types.Type.INTEGER,
                            description="Filter analysis by 4-digit year (e.g., 2026)."
                        )
                    },
                    required=["metric"]
                )
            )
        ]
    )
]

# Legacy OpenAI tools dictionary retained for fallback compatibility
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "lookup_order",
            "description": "Look up detailed information for a specific order by order_id (e.g., 'ORD-1001').",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order identifier, e.g. 'ORD-1001'."
                    }
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "filter_orders",
            "description": "Filter and search orders by category, city, order status, or date range.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string"},
                    "city": {"type": "string"},
                    "status": {"type": "string"},
                    "start_date": {"type": "string"},
                    "end_date": {"type": "string"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_orders",
            "description": "Calculate business metrics, total revenue, average order value, top customer rankings, top products, or category/city/status breakdowns.",
            "parameters": {
                "type": "object",
                "properties": {
                    "metric": {"type": "string"},
                    "category": {"type": "string"},
                    "city": {"type": "string"},
                    "status": {"type": "string"},
                    "month": {"type": "integer"},
                    "year": {"type": "integer"}
                },
                "required": ["metric"]
            }
        }
    }
]


class OrderToolsHandler:
    def __init__(self, data_service: OrderDataService):
        self.data_service = data_service

    def execute_tool(self, tool_name: str, arguments: Any) -> Dict[str, Any]:
        """Parse arguments dict or JSON string and route execution to appropriate DataService method."""
        if isinstance(arguments, str):
            try:
                kwargs = json.loads(arguments)
            except Exception as e:
                return {"error": f"Invalid arguments format: {str(e)}"}
        elif isinstance(arguments, dict):
            kwargs = arguments
        else:
            kwargs = {}

        if tool_name == "lookup_order":
            order_id = kwargs.get("order_id", "")
            return self.data_service.lookup_order(order_id)

        elif tool_name == "filter_orders":
            return self.data_service.filter_orders(
                category=kwargs.get("category"),
                city=kwargs.get("city"),
                status=kwargs.get("status"),
                start_date=kwargs.get("start_date"),
                end_date=kwargs.get("end_date")
            )

        elif tool_name == "analyze_orders":
            return self.data_service.analyze_orders(
                metric=kwargs.get("metric", "total_revenue"),
                category=kwargs.get("category"),
                city=kwargs.get("city"),
                status=kwargs.get("status"),
                month=kwargs.get("month"),
                year=kwargs.get("year")
            )

        else:
            return {"error": f"Unknown tool name: {tool_name}"}

import os
import pandas as pd
from typing import Optional, Dict, Any, List


class OrderDataService:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.df = self._load_data()

    def _load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Order data CSV not found at: {self.csv_path}")
        
        df = pd.read_csv(self.csv_path)
        # Clean column names
        df.columns = [col.strip() for col in df.columns]
        
        # Ensure correct data types
        df['order_id'] = df['order_id'].astype(str).str.strip()
        df['order_date_dt'] = pd.to_datetime(df['order_date'], errors='coerce')
        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
        df['unit_price_inr'] = pd.to_numeric(df['unit_price_inr'], errors='coerce').fillna(0)
        df['total_inr'] = pd.to_numeric(df['total_inr'], errors='coerce').fillna(0)
        df['customer_name'] = df['customer_name'].astype(str).str.strip()
        df['city'] = df['city'].astype(str).str.strip()
        df['product'] = df['product'].astype(str).str.strip()
        df['category'] = df['category'].astype(str).str.strip()
        df['payment_method'] = df['payment_method'].astype(str).str.strip()
        df['status'] = df['status'].astype(str).str.strip()
        
        return df

    def lookup_order(self, order_id: str) -> Dict[str, Any]:
        """Look up a specific order by order_id."""
        if not order_id:
            return {"found": False, "message": "No order_id provided."}
        
        clean_id = str(order_id).strip().upper()
        # Handle cases where user passes "1001" instead of "ORD-1001"
        if not clean_id.startswith("ORD-") and clean_id.isdigit():
            clean_id = f"ORD-{clean_id}"

        match = self.df[self.df['order_id'].str.upper() == clean_id]
        if match.empty:
            return {
                "found": False,
                "order_id": order_id,
                "message": f"Order '{order_id}' was not found in the records."
            }
        
        row = match.iloc[0]
        order_details = {
            "found": True,
            "order_id": row['order_id'],
            "order_date": str(row['order_date']),
            "customer_name": row['customer_name'],
            "city": row['city'],
            "product": row['product'],
            "category": row['category'],
            "quantity": int(row['quantity']),
            "unit_price_inr": float(row['unit_price_inr']),
            "total_inr": float(row['total_inr']),
            "payment_method": row['payment_method'],
            "status": row['status']
        }
        return order_details

    def filter_orders(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Filter orders by category, city, status, and date range."""
        filtered_df = self.df.copy()

        applied_filters = {}

        if category and category.strip() and category.lower() != "all":
            cat_clean = category.strip().lower()
            filtered_df = filtered_df[filtered_df['category'].str.lower() == cat_clean]
            applied_filters['category'] = category.strip()

        if city and city.strip() and city.lower() != "all":
            city_clean = city.strip().lower()
            filtered_df = filtered_df[filtered_df['city'].str.lower() == city_clean]
            applied_filters['city'] = city.strip()

        if status and status.strip() and status.lower() != "all":
            status_clean = status.strip().lower()
            filtered_df = filtered_df[filtered_df['status'].str.lower() == status_clean]
            applied_filters['status'] = status.strip()

        if start_date and start_date.strip():
            try:
                s_dt = pd.to_datetime(start_date.strip())
                filtered_df = filtered_df[filtered_df['order_date_dt'] >= s_dt]
                applied_filters['start_date'] = start_date.strip()
            except Exception:
                pass

        if end_date and end_date.strip():
            try:
                e_dt = pd.to_datetime(end_date.strip())
                filtered_df = filtered_df[filtered_df['order_date_dt'] <= e_dt]
                applied_filters['end_date'] = end_date.strip()
            except Exception:
                pass

        total_matches = len(filtered_df)
        if total_matches == 0:
            return {
                "count": 0,
                "applied_filters": applied_filters,
                "orders": [],
                "summary": {
                    "total_revenue_inr": 0,
                    "avg_order_value_inr": 0
                },
                "message": "No orders found matching the specified filters."
            }

        orders_list = []
        for _, row in filtered_df.iterrows():
            orders_list.append({
                "order_id": row['order_id'],
                "order_date": str(row['order_date']),
                "customer_name": row['customer_name'],
                "city": row['city'],
                "product": row['product'],
                "category": row['category'],
                "quantity": int(row['quantity']),
                "total_inr": float(row['total_inr']),
                "status": row['status']
            })

        summary = {
            "total_revenue_inr": float(filtered_df['total_inr'].sum()),
            "avg_order_value_inr": float(round(filtered_df['total_inr'].mean(), 2)),
            "total_items_sold": int(filtered_df['quantity'].sum())
        }

        return {
            "count": total_matches,
            "applied_filters": applied_filters,
            "orders": orders_list[:50],  # cap list for AI response size safety
            "summary": summary
        }

    def analyze_orders(
        self,
        metric: str,
        category: Optional[str] = None,
        city: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Perform analytics calculations over orders dataframe."""
        filtered_df = self.df.copy()
        applied_filters = {}

        if category and category.strip() and category.lower() != "all":
            cat_clean = category.strip().lower()
            filtered_df = filtered_df[filtered_df['category'].str.lower() == cat_clean]
            applied_filters['category'] = category.strip()

        if city and city.strip() and city.lower() != "all":
            city_clean = city.strip().lower()
            filtered_df = filtered_df[filtered_df['city'].str.lower() == city_clean]
            applied_filters['city'] = city.strip()

        if status and status.strip() and status.lower() != "all":
            status_clean = status.strip().lower()
            filtered_df = filtered_df[filtered_df['status'].str.lower() == status_clean]
            applied_filters['status'] = status.strip()

        if month is not None:
            try:
                m_val = int(month)
                filtered_df = filtered_df[filtered_df['order_date_dt'].dt.month == m_val]
                applied_filters['month'] = m_val
            except (ValueError, TypeError):
                pass

        if year is not None:
            try:
                y_val = int(year)
                filtered_df = filtered_df[filtered_df['order_date_dt'].dt.year == y_val]
                applied_filters['year'] = y_val
            except (ValueError, TypeError):
                pass

        if len(filtered_df) == 0:
            return {
                "metric": metric,
                "count": 0,
                "applied_filters": applied_filters,
                "message": "No orders matched the criteria for analysis."
            }

        metric_clean = str(metric).lower().strip()

        if metric_clean in ["total_revenue", "revenue", "sales"]:
            total_rev = float(filtered_df['total_inr'].sum())
            return {
                "metric": "total_revenue",
                "value_inr": total_rev,
                "formatted_value": f"₹{total_rev:,.2f}",
                "order_count": len(filtered_df),
                "applied_filters": applied_filters
            }

        elif metric_clean in ["avg_order_value", "average_order_value", "aov"]:
            aov = float(round(filtered_df['total_inr'].mean(), 2))
            return {
                "metric": "avg_order_value",
                "value_inr": aov,
                "formatted_value": f"₹{aov:,.2f}",
                "order_count": len(filtered_df),
                "applied_filters": applied_filters
            }

        elif metric_clean in ["order_count", "total_orders", "count"]:
            return {
                "metric": "order_count",
                "count": len(filtered_df),
                "applied_filters": applied_filters
            }

        elif metric_clean in ["customer_ranking", "top_customer", "top_customers", "customers"]:
            customer_stats = filtered_df.groupby('customer_name').agg(
                total_spend_inr=('total_inr', 'sum'),
                order_count=('order_id', 'count'),
                city=('city', 'first')
            ).reset_index().sort_values(by='total_spend_inr', ascending=False)

            rankings = []
            for rank, row in enumerate(customer_stats.iterrows(), start=1):
                r_data = row[1]
                rankings.append({
                    "rank": rank,
                    "customer_name": r_data['customer_name'],
                    "total_spend_inr": float(r_data['total_spend_inr']),
                    "formatted_spend": f"₹{r_data['total_spend_inr']:,.2f}",
                    "order_count": int(r_data['order_count']),
                    "city": r_data['city']
                })

            top_cust = rankings[0] if rankings else None
            return {
                "metric": "customer_ranking",
                "top_customer": top_cust,
                "rankings": rankings,
                "applied_filters": applied_filters
            }

        elif metric_clean in ["top_product", "products", "product_ranking"]:
            product_stats = filtered_df.groupby('product').agg(
                total_revenue_inr=('total_inr', 'sum'),
                total_units_sold=('quantity', 'sum'),
                order_count=('order_id', 'count'),
                category=('category', 'first')
            ).reset_index().sort_values(by='total_revenue_inr', ascending=False)

            products = []
            for rank, row in enumerate(product_stats.iterrows(), start=1):
                p_data = row[1]
                products.append({
                    "rank": rank,
                    "product": p_data['product'],
                    "category": p_data['category'],
                    "total_revenue_inr": float(p_data['total_revenue_inr']),
                    "formatted_revenue": f"₹{p_data['total_revenue_inr']:,.2f}",
                    "total_units_sold": int(p_data['total_units_sold']),
                    "order_count": int(p_data['order_count'])
                })

            return {
                "metric": "top_product",
                "top_product": products[0] if products else None,
                "products": products,
                "applied_filters": applied_filters
            }

        elif metric_clean in ["category_breakdown", "category", "categories"]:
            cat_stats = filtered_df.groupby('category').agg(
                total_revenue_inr=('total_inr', 'sum'),
                order_count=('order_id', 'count'),
                total_units_sold=('quantity', 'sum')
            ).reset_index().sort_values(by='total_revenue_inr', ascending=False)

            breakdown = []
            total_rev = filtered_df['total_inr'].sum()
            for row in cat_stats.iterrows():
                c_data = row[1]
                rev = float(c_data['total_revenue_inr'])
                pct = round((rev / total_rev * 100), 2) if total_rev > 0 else 0
                breakdown.append({
                    "category": c_data['category'],
                    "total_revenue_inr": rev,
                    "formatted_revenue": f"₹{rev:,.2f}",
                    "percentage_of_total": pct,
                    "order_count": int(c_data['order_count']),
                    "total_units_sold": int(c_data['total_units_sold'])
                })

            return {
                "metric": "category_breakdown",
                "breakdown": breakdown,
                "applied_filters": applied_filters
            }

        elif metric_clean in ["city_breakdown", "city", "cities"]:
            city_stats = filtered_df.groupby('city').agg(
                total_revenue_inr=('total_inr', 'sum'),
                order_count=('order_id', 'count')
            ).reset_index().sort_values(by='total_revenue_inr', ascending=False)

            breakdown = []
            total_rev = filtered_df['total_inr'].sum()
            for row in city_stats.iterrows():
                ct_data = row[1]
                rev = float(ct_data['total_revenue_inr'])
                pct = round((rev / total_rev * 100), 2) if total_rev > 0 else 0
                breakdown.append({
                    "city": ct_data['city'],
                    "total_revenue_inr": rev,
                    "formatted_revenue": f"₹{rev:,.2f}",
                    "percentage_of_total": pct,
                    "order_count": int(ct_data['order_count'])
                })

            return {
                "metric": "city_breakdown",
                "breakdown": breakdown,
                "applied_filters": applied_filters
            }

        elif metric_clean in ["status_breakdown", "status"]:
            status_stats = filtered_df.groupby('status').agg(
                order_count=('order_id', 'count'),
                total_value_inr=('total_inr', 'sum')
            ).reset_index().sort_values(by='order_count', ascending=False)

            breakdown = []
            total_count = len(filtered_df)
            for row in status_stats.iterrows():
                st_data = row[1]
                cnt = int(st_data['order_count'])
                val = float(st_data['total_value_inr'])
                pct = round((cnt / total_count * 100), 2) if total_count > 0 else 0
                breakdown.append({
                    "status": st_data['status'],
                    "order_count": cnt,
                    "percentage_of_orders": pct,
                    "total_value_inr": val,
                    "formatted_value": f"₹{val:,.2f}"
                })

            return {
                "metric": "status_breakdown",
                "breakdown": breakdown,
                "applied_filters": applied_filters
            }

        else:
            # General summary default for unrecognized or general metrics
            total_rev = float(filtered_df['total_inr'].sum())
            aov = float(round(filtered_df['total_inr'].mean(), 2))
            return {
                "metric": metric,
                "summary": {
                    "total_revenue_inr": total_rev,
                    "avg_order_value_inr": aov,
                    "order_count": len(filtered_df)
                },
                "applied_filters": applied_filters
            }

    def get_dashboard_stats(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None,
        month: Optional[int] = None,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Compute aggregated statistics, KPI metrics, trends, and chart data for dashboard."""
        filtered_df = self.df.copy()
        applied_filters = {}

        if category and category.strip() and category.lower() != "all":
            filtered_df = filtered_df[filtered_df['category'].str.lower() == category.strip().lower()]
            applied_filters['category'] = category.strip()

        if status and status.strip() and status.lower() != "all":
            filtered_df = filtered_df[filtered_df['status'].str.lower() == status.strip().lower()]
            applied_filters['status'] = status.strip()

        if month is not None and str(month).strip() and str(month).lower() != "all":
            try:
                m_val = int(month)
                filtered_df = filtered_df[filtered_df['order_date_dt'].dt.month == m_val]
                applied_filters['month'] = m_val
            except (ValueError, TypeError):
                pass

        if year is not None and str(year).strip() and str(year).lower() != "all":
            try:
                y_val = int(year)
                filtered_df = filtered_df[filtered_df['order_date_dt'].dt.year == y_val]
                applied_filters['year'] = y_val
            except (ValueError, TypeError):
                pass

        total_orders = len(filtered_df)
        if total_orders == 0:
            return {
                "applied_filters": applied_filters,
                "kpis": {
                    "total_revenue_inr": 0.0,
                    "delivered_revenue_inr": 0.0,
                    "total_orders": 0,
                    "avg_order_value_inr": 0.0,
                    "delivered_orders": 0,
                    "cancelled_orders": 0,
                    "returned_orders": 0,
                    "processing_orders": 0,
                    "shipped_orders": 0,
                },
                "monthly_trend": [],
                "category_breakdown": [],
                "status_breakdown": [],
                "top_products": [],
                "all_products": []
            }

        # KPIs
        gross_revenue = float(filtered_df['total_inr'].sum())
        delivered_df = filtered_df[filtered_df['status'].str.lower() == 'delivered']
        delivered_revenue = float(delivered_df['total_inr'].sum())
        aov = float(round(filtered_df['total_inr'].mean(), 2))

        status_counts = filtered_df['status'].str.lower().value_counts().to_dict()
        delivered_cnt = int(status_counts.get('delivered', 0))
        cancelled_cnt = int(status_counts.get('cancelled', 0))
        returned_cnt = int(status_counts.get('returned', 0))
        processing_cnt = int(status_counts.get('processing', 0))
        shipped_cnt = int(status_counts.get('shipped', 0))

        # Monthly Trend (grouped by YYYY-MM)
        df_trend = filtered_df.copy()
        df_trend['year_month'] = df_trend['order_date_dt'].dt.strftime('%Y-%m')
        df_trend['month_label'] = df_trend['order_date_dt'].dt.strftime('%b %Y')

        trend_grouped = df_trend.groupby(['year_month', 'month_label']).agg(
            revenue=('total_inr', 'sum'),
            orders=('order_id', 'count')
        ).reset_index().sort_values('year_month')

        monthly_trend = []
        for _, row in trend_grouped.iterrows():
            monthly_trend.append({
                "month_code": row['year_month'],
                "month_label": row['month_label'],
                "revenue": float(row['revenue']),
                "orders": int(row['orders'])
            })

        # Category Breakdown
        cat_grouped = filtered_df.groupby('category').agg(
            revenue=('total_inr', 'sum'),
            orders=('order_id', 'count'),
            units=('quantity', 'sum')
        ).reset_index().sort_values('revenue', ascending=False)

        category_breakdown = []
        for _, row in cat_grouped.iterrows():
            rev = float(row['revenue'])
            pct = round((rev / gross_revenue * 100), 2) if gross_revenue > 0 else 0
            category_breakdown.append({
                "category": row['category'],
                "revenue": rev,
                "percentage": pct,
                "orders": int(row['orders']),
                "units": int(row['units'])
            })

        # Status Breakdown
        stat_grouped = filtered_df.groupby('status').agg(
            orders=('order_id', 'count'),
            value=('total_inr', 'sum')
        ).reset_index().sort_values('orders', ascending=False)

        status_breakdown = []
        for _, row in stat_grouped.iterrows():
            cnt = int(row['orders'])
            pct = round((cnt / total_orders * 100), 2) if total_orders > 0 else 0
            status_breakdown.append({
                "status": row['status'].capitalize(),
                "orders": cnt,
                "percentage": pct,
                "value": float(row['value'])
            })

        # Top Products
        prod_grouped = filtered_df.groupby(['product', 'category']).agg(
            revenue=('total_inr', 'sum'),
            units=('quantity', 'sum'),
            orders=('order_id', 'count')
        ).reset_index().sort_values('revenue', ascending=False)

        all_products = []
        for rank, row in enumerate(prod_grouped.iterrows(), start=1):
            p_data = row[1]
            all_products.append({
                "rank": rank,
                "product": p_data['product'],
                "category": p_data['category'],
                "revenue": float(p_data['revenue']),
                "units": int(p_data['units']),
                "orders": int(p_data['orders'])
            })

        return {
            "applied_filters": applied_filters,
            "kpis": {
                "total_revenue_inr": gross_revenue,
                "delivered_revenue_inr": delivered_revenue,
                "total_orders": total_orders,
                "avg_order_value_inr": aov,
                "delivered_orders": delivered_cnt,
                "cancelled_orders": cancelled_cnt,
                "returned_orders": returned_cnt,
                "processing_orders": processing_cnt,
                "shipped_orders": shipped_cnt,
            },
            "monthly_trend": monthly_trend,
            "category_breakdown": category_breakdown,
            "status_breakdown": status_breakdown,
            "top_products": all_products[:5],
            "all_products": all_products
        }

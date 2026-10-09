import pytest
import os
from backend.services.data_service import OrderDataService

@pytest.fixture
def data_service():
    # Find CSV path dynamically
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "..", "..", "data", "orders.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(current_dir, "..", "data", "orders.csv")
    return OrderDataService(csv_path)


def test_data_service_load(data_service):
    assert data_service.df is not None
    assert len(data_service.df) > 0
    assert "order_id" in data_service.df.columns
    assert "total_inr" in data_service.df.columns


def test_lookup_order_valid(data_service):
    res = data_service.lookup_order("ORD-1001")
    assert res["found"] is True
    assert res["order_id"] == "ORD-1001"
    assert res["customer_name"] == "Rahul Sharma"
    assert res["city"] == "Hyderabad"
    assert res["product"] == "Wireless Mouse"
    assert res["category"] == "Electronics"
    assert res["total_inr"] == 1598.0
    assert res["status"] == "delivered"


def test_lookup_order_case_insensitive_and_numeric(data_service):
    res = data_service.lookup_order("ord-1001")
    assert res["found"] is True
    assert res["order_id"] == "ORD-1001"

    res_num = data_service.lookup_order("1002")
    assert res_num["found"] is True
    assert res_num["order_id"] == "ORD-1002"


def test_lookup_order_missing(data_service):
    res = data_service.lookup_order("ORD-9999")
    assert res["found"] is False
    assert "not found" in res["message"].lower()


def test_filter_orders_by_category(data_service):
    res = data_service.filter_orders(category="Electronics")
    assert res["count"] > 0
    for order in res["orders"]:
        assert order["category"].lower() == "electronics"


def test_filter_orders_by_city(data_service):
    res = data_service.filter_orders(city="Chennai")
    assert res["count"] > 0
    for order in res["orders"]:
        assert order["city"].lower() == "chennai"


def test_filter_orders_by_status(data_service):
    res = data_service.filter_orders(status="delivered")
    assert res["count"] > 0
    for order in res["orders"]:
        assert order["status"].lower() == "delivered"


def test_filter_orders_by_date_range(data_service):
    res = data_service.filter_orders(start_date="2026-06-01", end_date="2026-06-30")
    assert res["count"] > 0
    for order in res["orders"]:
        assert order["order_date"] >= "2026-06-01"
        assert order["order_date"] <= "2026-06-30"


def test_filter_orders_empty_result(data_service):
    res = data_service.filter_orders(category="NonExistentCategory")
    assert res["count"] == 0
    assert len(res["orders"]) == 0
    assert "No orders found" in res["message"]


def test_analyze_orders_revenue(data_service):
    res = data_service.analyze_orders(metric="total_revenue")
    assert res["metric"] == "total_revenue"
    assert res["value_inr"] > 0
    assert "₹" in res["formatted_value"]


def test_analyze_orders_revenue_by_month(data_service):
    res = data_service.analyze_orders(metric="total_revenue", month=7, year=2026)
    assert res["metric"] == "total_revenue"
    assert res["order_count"] > 0
    assert res["applied_filters"]["month"] == 7


def test_analyze_orders_avg_order_value(data_service):
    res = data_service.analyze_orders(metric="avg_order_value")
    assert res["metric"] == "avg_order_value"
    assert res["value_inr"] > 0


def test_analyze_orders_customer_ranking(data_service):
    res = data_service.analyze_orders(metric="customer_ranking")
    assert res["metric"] == "customer_ranking"
    assert len(res["rankings"]) > 0
    top = res["top_customer"]
    assert top is not None
    assert top["rank"] == 1
    assert "total_spend_inr" in top


def test_analyze_orders_category_breakdown(data_service):
    res = data_service.analyze_orders(metric="category_breakdown")
    assert res["metric"] == "category_breakdown"
    assert len(res["breakdown"]) > 0
    cats = [b["category"] for b in res["breakdown"]]
    assert "Electronics" in cats


def test_analyze_orders_city_breakdown(data_service):
    res = data_service.analyze_orders(metric="city_breakdown")
    assert res["metric"] == "city_breakdown"
    assert len(res["breakdown"]) > 0


def test_analyze_orders_top_product(data_service):
    res = data_service.analyze_orders(metric="top_product")
    assert res["metric"] == "top_product"
    assert len(res["products"]) > 0
    top = res["top_product"]
    assert "product" in top
    assert "total_revenue_inr" in top

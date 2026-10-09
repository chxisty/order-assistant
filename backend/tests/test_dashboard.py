import pytest
import os
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.data_service import OrderDataService

client = TestClient(app)

@pytest.fixture
def data_service():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "..", "..", "data", "orders.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(current_dir, "..", "data", "orders.csv")
    return OrderDataService(csv_path)


def test_get_dashboard_stats_kpis(data_service):
    stats = data_service.get_dashboard_stats()
    assert "kpis" in stats
    kpis = stats["kpis"]
    assert kpis["total_orders"] == 60
    assert kpis["total_revenue_inr"] > 0
    assert kpis["delivered_orders"] > 0
    assert kpis["cancelled_orders"] > 0
    assert kpis["returned_orders"] > 0
    assert "monthly_trend" in stats
    assert "category_breakdown" in stats
    assert "status_breakdown" in stats
    assert len(stats["top_products"]) == 5


def test_get_dashboard_stats_filtered_category(data_service):
    stats = data_service.get_dashboard_stats(category="Electronics")
    kpis = stats["kpis"]
    assert kpis["total_orders"] > 0
    assert stats["applied_filters"]["category"] == "Electronics"
    for cat in stats["category_breakdown"]:
        assert cat["category"].lower() == "electronics"


def test_get_dashboard_stats_filtered_status(data_service):
    stats = data_service.get_dashboard_stats(status="delivered")
    kpis = stats["kpis"]
    assert kpis["total_orders"] > 0
    assert kpis["cancelled_orders"] == 0
    assert kpis["returned_orders"] == 0


def test_dashboard_stats_endpoint():
    response = client.get("/api/dashboard/stats?category=Electronics")
    assert response.status_code == 200
    json_data = response.json()
    assert "kpis" in json_data
    assert json_data["kpis"]["total_orders"] > 0


def test_dashboard_insights_endpoint():
    response = client.post("/api/dashboard/insights", json={"category": "Electronics"})
    assert response.status_code == 200
    json_data = response.json()
    assert "insights" in json_data
    assert len(json_data["insights"]) > 0
    assert "stats_summary" in json_data

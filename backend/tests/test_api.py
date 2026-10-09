import pytest
import os
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"
    assert json_data["orders_loaded"] > 0
    assert "timestamp" in json_data
    assert "groq_configured" in json_data
    assert json_data["provider"] == "groq"


def test_environment_variable_loading():
    from backend.main import load_environment_variables, ai_service
    load_environment_variables()
    response = client.get("/health")
    json_data = response.json()
    expected = ai_service.is_groq_configured if ai_service else False
    assert json_data["groq_configured"] == expected


def test_chat_endpoint_valid_lookup():
    payload = {
        "message": "Lookup order ORD-1001",
        "history": []
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "reply" in json_data
    assert len(json_data["reply"]) > 0
    assert "ORD-1001" in json_data["reply"] or "Wireless Mouse" in json_data["reply"]


def test_chat_endpoint_valid_analytics():
    payload = {
        "message": "What is the total revenue in July 2026?",
        "history": []
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "revenue" in json_data["reply"].lower() or "₹" in json_data["reply"]


def test_chat_endpoint_missing_order_query():
    payload = {
        "message": "Lookup order ORD-9999",
        "history": []
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "not found" in json_data["reply"].lower() or "ord-9999" in json_data["reply"].lower()


def test_chat_endpoint_empty_message_validation():
    payload = {
        "message": "   ",
        "history": []
    }
    response = client.post("/chat", json=payload)
    assert response.status_code in [400, 422]


def test_chat_endpoint_invalid_json():
    response = client.post("/chat", json={})
    assert response.status_code == 422


def test_get_order_by_id_valid():
    response = client.get("/api/orders/ORD-1001")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["found"] is True
    assert json_data["order_id"] == "ORD-1001"
    assert json_data["customer_name"] == "Rahul Sharma"
    assert json_data["product"] == "Wireless Mouse"
    assert json_data["quantity"] == 2
    assert json_data["total_inr"] == 1598.0
    assert json_data["status"] == "delivered"


def test_get_order_by_id_not_found():
    response = client.get("/api/orders/ORD-9999")
    assert response.status_code == 404
    json_data = response.json()
    assert "not found" in json_data["detail"].lower()


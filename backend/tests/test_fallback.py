import pytest
import os
from unittest.mock import patch, MagicMock
from google.genai.errors import APIError
from backend.services.data_service import OrderDataService
from backend.services.ai_service import AIService

@pytest.fixture
def ai_service():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "..", "..", "data", "orders.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(current_dir, "..", "data", "orders.csv")
    ds = OrderDataService(csv_path)
    return AIService(ds)


def test_fallback_status_breakdown(ai_service):
    query = "Show status breakdown of all orders"
    reply, tools = ai_service._local_fallback_process(query)
    
    assert len(tools) > 0
    assert tools[0]["tool"] == "analyze_orders"
    assert "status_breakdown" in tools[0]["arguments"]
    assert "DELIVERED" in reply
    assert "CANCELLED" in reply
    assert "RETURNED" in reply


def test_gemini_rate_limit_error_fallback(ai_service):
    query = "Show status breakdown of all orders"
    
    # Mock Gemini client to raise APIError 429 / RESOURCE_EXHAUSTED
    with patch.object(ai_service, "_get_client") as mock_client_func:
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = APIError(
            429,
            "RESOURCE_EXHAUSTED: Quota exceeded for gemini-2.5-flash",
            {}
        )
        mock_client_func.return_value = mock_client

        reply, tools = ai_service.process_chat(query, [])

        # Verify rate limit warning header is present in response
        assert "Rate Limit" in reply or "Quota" in reply or "RESOURCE_EXHAUSTED" in reply
        # Verify specific status breakdown tool was executed
        assert len(tools) > 0
        assert tools[0]["tool"] == "analyze_orders"
        assert "DELIVERED" in reply


def test_gemini_tool_calling_flow(ai_service):
    query = "Lookup order ORD-1001"
    
    # Mock Gemini client returning function_calls then text
    with patch.object(ai_service, "_get_client") as mock_client_func:
        mock_client = MagicMock()

        # Step 1: Gemini requests lookup_order function call
        mock_call = MagicMock()
        mock_call.name = "lookup_order"
        mock_call.args = {"order_id": "ORD-1001"}

        mock_resp_1 = MagicMock()
        mock_resp_1.function_calls = [mock_call]
        mock_resp_1.candidates = [MagicMock()]

        # Step 2: Gemini returns final text response after function result
        mock_resp_2 = MagicMock()
        mock_resp_2.function_calls = None
        mock_resp_2.text = "Order ORD-1001 for Wireless Mouse is DELIVERED."

        mock_client.models.generate_content.side_effect = [mock_resp_1, mock_resp_2]
        mock_client_func.return_value = mock_client

        reply, tools = ai_service.process_chat(query, [])

        assert len(tools) == 1
        assert tools[0]["tool"] == "lookup_order"
        assert "ORD-1001" in reply

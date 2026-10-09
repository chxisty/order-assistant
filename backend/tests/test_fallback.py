import pytest
import os
from unittest.mock import patch, MagicMock
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


def test_groq_rate_limit_error_fallback(ai_service):
    query = "Show status breakdown of all orders"
    
    with patch.object(type(ai_service), "groq_api_key", "gsk_TestKeyMock"):
        with patch.object(ai_service, "_get_groq_client") as mock_client_func:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = Exception(
                "429: Rate limit reached for model llama-3.3-70b-versatile"
            )
            mock_client_func.return_value = mock_client

            reply, tools = ai_service.process_chat(query, [])

            assert "Rate Limit" in reply or "Quota" in reply or "429" in reply
            assert len(tools) > 0
            assert tools[0]["tool"] == "analyze_orders"
            assert "DELIVERED" in reply


def test_groq_tool_calling_flow(ai_service):
    query = "Lookup order ORD-1001"
    
    with patch.object(type(ai_service), "groq_api_key", "gsk_TestKeyMock"):
        with patch.object(ai_service, "_get_groq_client") as mock_client_func:
            mock_client = MagicMock()

            # Step 1: Groq requests lookup_order tool call
            mock_tool_call = MagicMock()
            mock_tool_call.id = "call_abc123"
            mock_tool_call.function.name = "lookup_order"
            mock_tool_call.function.arguments = '{"order_id": "ORD-1001"}'

            mock_msg_1 = MagicMock()
            mock_msg_1.tool_calls = [mock_tool_call]

            mock_resp_1 = MagicMock()
            mock_resp_1.choices = [MagicMock(message=mock_msg_1)]

            # Step 2: Groq returns final text response after tool execution
            mock_msg_2 = MagicMock()
            mock_msg_2.tool_calls = None
            mock_msg_2.content = "Order ORD-1001 for Wireless Mouse is DELIVERED."

            mock_resp_2 = MagicMock()
            mock_resp_2.choices = [MagicMock(message=mock_msg_2)]

            mock_client.chat.completions.create.side_effect = [mock_resp_1, mock_resp_2]
            mock_client_func.return_value = mock_client

            reply, tools = ai_service.process_chat(query, [])

            assert len(tools) == 1
            assert tools[0]["tool"] == "lookup_order"
            assert "ORD-1001" in reply

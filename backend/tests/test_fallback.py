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


def test_model_configuration_default(ai_service):
    with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_real_key_123"}, clear=False):
        assert ai_service.model_name == "openai/gpt-oss-120b"
        assert ai_service.is_groq_configured is True


def test_is_groq_configured_placeholder(ai_service):
    with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_your_groq_api_key_here"}, clear=False):
        assert ai_service.is_groq_configured is False


def test_fallback_status_breakdown(ai_service):
    query = "Show status breakdown of all orders"
    reply, tools = ai_service._local_fallback_process(query)
    
    assert len(tools) > 0
    assert tools[0]["tool"] == "analyze_orders"
    assert "status_breakdown" in tools[0]["arguments"]
    assert "DELIVERED" in reply
    assert "CANCELLED" in reply
    assert "RETURNED" in reply


def test_groq_auth_error_fallback(ai_service):
    query = "Show status breakdown of all orders"
    
    with patch.object(type(ai_service), "groq_api_key", "gsk_invalid_test_key"):
        with patch.object(ai_service, "_get_groq_client") as mock_client_func:
            mock_client = MagicMock()
            mock_err = Exception("Error code: 401 - {'error': {'message': 'Invalid API Key', 'code': 'invalid_api_key'}}")
            mock_err.status_code = 401
            mock_client.chat.completions.create.side_effect = mock_err
            mock_client_func.return_value = mock_client

            reply, tools = ai_service.process_chat(query, [])

            assert "Authentication Error" in reply
            assert len(tools) > 0
            assert tools[0]["tool"] == "analyze_orders"
            assert "DELIVERED" in reply


def test_sales_insights_auth_fallback(ai_service):
    with patch.object(type(ai_service), "groq_api_key", "gsk_invalid_test_key"):
        with patch.object(ai_service, "_get_groq_client") as mock_client_func:
            mock_client = MagicMock()
            mock_err = Exception("Error code: 401 - Invalid API Key gsk_invalid_test_key")
            mock_err.status_code = 401
            mock_client.chat.completions.create.side_effect = mock_err
            mock_client_func.return_value = mock_client

            insights_res = ai_service.generate_dashboard_insights()

            assert insights_res["is_ai_generated"] is False
            assert insights_res["provider"] == "local"
            assert "Insights" in insights_res["insights"]


def test_groq_tool_calling_flow(ai_service):
    query = "Lookup order ORD-1001"
    
    with patch.object(type(ai_service), "groq_api_key", "gsk_real_test_key"):
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
            _, kwargs = mock_client.chat.completions.create.call_args_list[0]
            assert kwargs["model"] == "openai/gpt-oss-120b"

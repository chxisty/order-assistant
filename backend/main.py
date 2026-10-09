import os
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from backend.services.data_service import OrderDataService
from backend.services.ai_service import AIService

def load_environment_variables():
    """
    Reliably load environment variables from .env files located in:
    1. backend/.env
    2. root .env
    3. backend/.env.txt / root .env.txt (Windows text extension fallback)
    """
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(backend_dir)
    
    candidate_paths = [
        os.path.join(backend_dir, ".env"),
        os.path.join(root_dir, ".env"),
        os.path.join(backend_dir, ".env.txt"),
        os.path.join(root_dir, ".env.txt"),
    ]
    
    for path in candidate_paths:
        if os.path.isfile(path):
            load_dotenv(dotenv_path=path, override=True)

load_environment_variables()

app = FastAPI(
    title="Order Assistant API",
    description="FastAPI Backend for AI Order Assistant with Groq API tool calling over CSV data.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve path to orders.csv
backend_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(backend_dir)

raw_csv_env = os.environ.get("CSV_PATH", "").strip()

csv_candidates = []
if raw_csv_env:
    csv_candidates.append(raw_csv_env)
    csv_candidates.append(os.path.join(root_dir, raw_csv_env))
    csv_candidates.append(os.path.join(backend_dir, raw_csv_env))

csv_candidates.extend([
    os.path.join(root_dir, "data", "orders.csv"),
    os.path.join(backend_dir, "..", "data", "orders.csv"),
    os.path.join(backend_dir, "data", "orders.csv"),
])

CSV_PATH = None
for candidate in csv_candidates:
    if candidate and os.path.exists(candidate):
        CSV_PATH = os.path.abspath(candidate)
        break

if not CSV_PATH:
    CSV_PATH = os.path.join(root_dir, "data", "orders.csv")

# Initialize services
try:
    data_service = OrderDataService(CSV_PATH)
    ai_service = AIService(data_service)
except Exception as err:
    print(f"Error initializing OrderDataService at {CSV_PATH}: {err}")
    data_service = None
    ai_service = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of message sender: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or query text")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turn history")


class ChatResponse(BaseModel):
    reply: str
    tool_calls_executed: List[Dict[str, Any]]
    success: bool = True


class DashboardFilterRequest(BaseModel):
    category: Optional[str] = Field(default=None, description="Product category filter")
    status: Optional[str] = Field(default=None, description="Order status filter")
    month: Optional[Any] = Field(default=None, description="Month filter (1-12 or str)")
    year: Optional[Any] = Field(default=None, description="Year filter (e.g. 2026)")


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint confirming service status and dataset loading."""
    if data_service is None or data_service.df is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order data service is not initialized."
        )
    
    groq_key = bool(os.getenv("GROQ_API_KEY", "").strip())
    
    return {
        "status": "ok",
        "orders_loaded": len(data_service.df),
        "groq_configured": groq_key,
        "provider": "groq",
        "model": ai_service.model_name if ai_service else "local-fallback",
        "timestamp": time.time()
    }


@app.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
@app.post("/api/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_endpoint(request: ChatRequest):
    """
    POST /chat endpoint accepting user query and chat history.
    Validates payload and returns AI reply with executed tool details.
    """
    if data_service is None or ai_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend data services are currently unavailable."
        )

    clean_message = request.message.strip()
    if not clean_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty or blank whitespace."
        )

    # Convert history models to dict format for ai_service
    formatted_history = [
        {"role": h.role, "content": h.content}
        for h in (request.history or [])
    ]

    try:
        reply, tool_calls = ai_service.process_chat(clean_message, formatted_history)
        return ChatResponse(
            reply=reply,
            tool_calls_executed=tool_calls,
            success=True
        )
    except Exception as e:
        print(f"Unhandled error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred processing your chat request: {str(e)}"
        )


@app.get("/api/dashboard/stats", status_code=status.HTTP_200_OK)
def get_dashboard_stats_endpoint(
    category: Optional[str] = None,
    status_val: Optional[str] = None,
    month: Optional[str] = None,
    year: Optional[str] = None
):
    """
    GET /api/dashboard/stats endpoint calculating KPI cards, trends, and category/status breakdowns.
    """
    if data_service is None or data_service.df is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend data service is not initialized."
        )

    try:
        m_int = int(month) if month and month.isdigit() else None
        y_int = int(year) if year and year.isdigit() else None
        
        stats = data_service.get_dashboard_stats(
            category=category,
            status=status_val,
            month=m_int,
            year=y_int
        )
        return stats
    except Exception as e:
        print(f"Error computing dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error computing dashboard stats: {str(e)}"
        )


@app.post("/api/dashboard/insights", status_code=status.HTTP_200_OK)
@app.get("/api/dashboard/insights", status_code=status.HTTP_200_OK)
def get_dashboard_insights_endpoint(
    category: Optional[str] = None,
    status_val: Optional[str] = None,
    month: Optional[str] = None,
    year: Optional[str] = None,
    request: Optional[DashboardFilterRequest] = None
):
    """
    POST/GET /api/dashboard/insights endpoint generating structured AI sales insights.
    """
    if data_service is None or ai_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend data services are currently unavailable."
        )

    cat = (request.category if request and request.category else category)
    st = (request.status if request and request.status else status_val)
    m_raw = (request.month if request and request.month else month)
    y_raw = (request.year if request and request.year else year)

    m_int = int(m_raw) if m_raw and str(m_raw).isdigit() else None
    y_int = int(y_raw) if y_raw and str(y_raw).isdigit() else None

    try:
        insights_res = ai_service.generate_dashboard_insights(
            category=cat,
            status=st,
            month=m_int,
            year=y_int
        )
        return insights_res
    except Exception as e:
        print(f"Error generating dashboard insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating dashboard insights: {str(e)}"
        )


@app.get("/api/orders/{order_id}", status_code=status.HTTP_200_OK)
def get_order_by_id_endpoint(order_id: str):
    """
    GET /api/orders/{order_id} endpoint looking up a specific order record by ID.
    """
    if data_service is None or data_service.df is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order data service is not initialized."
        )

    result = data_service.lookup_order(order_id)
    if not result.get("found"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", f"Order '{order_id}' was not found in the records.")
        )
    return result


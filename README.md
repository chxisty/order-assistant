# AI Order Assistant

An intelligent full-stack AI Web Application built for order dataset tracking, querying, and business analytics using Python FastAPI, Pandas, OpenAI function calling, and Next.js with TypeScript and Tailwind CSS.

---

## 🌟 Key Features

- **Genuine OpenAI Function Calling**: Leverages `tools` definitions (`lookup_order`, `filter_orders`, `analyze_orders`) allowing GPT-4o-mini to dynamically select and invoke data tools.
- **FastAPI & Pandas Data Engine**: High-performance backend calculating analytics directly from `data/orders.csv`.
- **Modern Responsive UI**: Next.js 16 app with interactive conversation history, example question pills, live backend health status indicator, Markdown tables rendering, and tool call transparency badges.
- **Resilient Fallback & Guardrails**: Includes a local rule-based fallback engine if the OpenAI API key is missing or unreachable, strict input validation, and defensive error boundaries.
- **100% Test Coverage Suite**: Automated Pytest suite covering lookup, missing IDs, multi-criteria filtering, revenue metrics, customer rankings, and API endpoints.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, React Markdown
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pandas, Pydantic, python-dotenv
- **AI Integration**: OpenAI API (`gpt-4o-mini`) with Genuine Function/Tool Calling
- **Testing**: Pytest & Starlette TestClient
- **Deployment**: Render (Backend) & Vercel (Frontend)

---

## 📁 Project Structure

```text
order-assistant/
├── data/
│   └── orders.csv             # 60 Order records dataset
├── backend/
│   ├── main.py                # FastAPI app entrypoint with /chat & /health
│   ├── requirements.txt       # Backend dependencies
│   ├── Procfile               # Render deployment start command
│   ├── conftest.py            # Pytest configuration
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py    # Pandas DataFrame operations & metrics logic
│   │   ├── order_tools.py     # OpenAI tool schemas & execution router
│   │   └── ai_service.py       # OpenAI chat handler & tool calling loop
│   └── tests/
│       ├── __init__.py
│       ├── test_data_service.py  # Unit tests for data operations
│       └── test_api.py           # Integration tests for FastAPI endpoints
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (page, layout, globals.css)
│   │   ├── components/        # Header, ChatInput, ChatMessageItem, ExampleQuestions
│   │   └── types/             # TypeScript definitions
│   ├── package.json           # Frontend dependencies
│   ├── vercel.json            # Vercel deployment configuration
│   └── .env.example           # Frontend environment variable template
├── render.yaml                # Render Infrastructure-as-Code spec
├── README.md                  # Setup & execution guide
├── WRITEUP.md                 # Architecture, tool calling, guardrails writeup
└── .env.example               # Root environment variable template
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites

- **Python**: 3.10+
- **Node.js**: v18+ (npm v9+)
- **OpenAI API Key** (optional for local fallback mode, required for live AI model)

---

### Step 1: Clone & Configure Environment

```bash
cd order-assistant
```

1. **Create backend environment file `backend/.env`**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Edit `backend/.env` and add your `OPENAI_API_KEY`:*
   ```env
   OPENAI_API_KEY=sk-proj-your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Create frontend environment file `frontend/.env.local`**:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

---

### Step 2: Set Up & Run Backend

1. **Create & activate Python virtual environment**:
   ```bash
   # Windows (PowerShell/CMD):
   python -m venv backend/venv
   backend\venv\Scripts\activate

   # Linux/macOS:
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   ```

2. **Install Backend Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run Backend Server**:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   *The backend will run at `http://localhost:8000`. You can verify health at `http://localhost:8000/health`.*

---

### Step 3: Run Pytest Test Suite

In a terminal with the virtual environment activated:

```bash
pytest backend/tests/ -v
```

*Expected output: All 22 tests passing.*

---

### Step 4: Set Up & Run Frontend

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

*The frontend application will start at `http://localhost:3000`.*

---

## 🔍 Example Queries to Try

- 🔍 **Order Lookup**: `Lookup order ORD-1001`
- ❌ **Missing Order**: `Lookup order ORD-9999`
- 📊 **Revenue Calculation**: `What is the total revenue in July 2026?`
- 👑 **Customer Spend Ranking**: `Show top 5 spending customers`
- 📍 **City & Status Filter**: `List all delivered orders in Chennai`
- 📈 **Category Analysis**: `Which category generated the highest revenue?`

---

## 🌐 Production Deployment Guide

### Deploying Backend to Render

1. Push code to your GitHub repository.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your repository.
5. Set the following configuration:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `OPENAI_API_KEY`: `sk-proj-...`
     - `CSV_PATH`: `data/orders.csv`
6. Click **Deploy Web Service**. Render will assign a public URL (e.g. `https://order-assistant-backend.onrender.com`).

---

### Deploying Frontend to Vercel

1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Select the `frontend` folder as Root Directory.
5. Set Environment Variable:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://order-assistant-backend.onrender.com` (your Render URL)
6. Click **Deploy**. Vercel will build and assign your production frontend URL.

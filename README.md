# Order Assistant — Premium AI Analytics Dashboard

An intelligent full-stack e-commerce workspace for order dataset tracking, querying, and sales analytics built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Python FastAPI**, **Pandas**, and **Groq API** (`llama-3.3-70b-versatile`) with genuine tool calling.

- 🌐 **Live Website:** [https://order-assistant-lemon.vercel.app/](https://order-assistant-lemon.vercel.app/)
- 🐙 **GitHub Repository:** [https://github.com/chxisty/order-assistant](https://github.com/chxisty/order-assistant)
- ⚙️ **Backend API Documentation:** [https://order-assistant-3owc.onrender.com/docs](https://order-assistant-3owc.onrender.com/docs)

---

## 🌟 Key Features

- **Genuine Groq API Tool Calling**: Leverages the official `groq` Python SDK (`llama-3.3-70b-versatile`) with function declarations (`lookup_order`, `filter_orders`, `analyze_orders`), allowing Groq AI to dynamically select and invoke backend data tools.
- **FastAPI & Pandas Data Engine**: High-performance backend calculating analytics directly from `data/orders.csv` (60 verified order records).
- **Premium Dark Navy Dashboard & Light Theme**: Polished dark SaaS dashboard interface featuring a responsive collapsible sidebar (`#0D1428`), top header with global search, welcome hero banner, 4 dynamic KPI cards, 2-column analytics preview (monthly revenue area chart & status donut chart), quick actions, and a functional Light/Dark theme toggle with `localStorage` persistence.
- **Dedicated Order Lookup Page**: Direct order search by ID (e.g., `ORD-1001` through `ORD-1060`) displaying customer name, city, product, category, quantity, unit price, total revenue, order date, payment method, status badge, and an AI chat query trigger.
- **Executive AI Sales Insights**: Dedicated insights module generating executive sales recommendations using Groq AI or deterministic local data fallback.
- **Resilient Local Fallback Engine**: If the Groq API key is unconfigured, rate-limited, or quota-exceeded, the system seamlessly uses a local pandas data engine to answer queries directly, clearly labeling fallback output.
- **Comprehensive Backend Test Suite**: 33 automated Pytest tests covering order lookup, multi-criteria filtering, analytics metrics, API endpoints, error handling, and local fallback paths.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, React Markdown, Remark GFM
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pandas, Pydantic, python-dotenv, Groq Python SDK (`groq`)
- **AI Integration**: Groq API (`llama-3.3-70b-versatile`, Base URL: `https://api.groq.com/openai/v1`) with genuine tool calling
- **Testing**: Pytest & Starlette `TestClient`
- **Deployment**: Render (Backend Web Service) & Vercel (Frontend Web App)

---

## 📁 Project Structure

```text
order-assistant/
├── data/
│   └── orders.csv             # 60 Order records CSV dataset
├── backend/
│   ├── main.py                # FastAPI app entrypoint (/health, /chat, /api/dashboard/stats, /api/dashboard/insights, /api/orders/{id})
│   ├── requirements.txt       # Backend dependencies (fastapi, pandas, groq, uvicorn, pytest)
│   ├── Procfile               # Deployment process manager config
│   ├── conftest.py            # Pytest configuration
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py    # Pandas DataFrame operations & analytics metrics logic
│   │   ├── order_tools.py     # Groq tool declarations (lookup_order, filter_orders, analyze_orders)
│   │   └── ai_service.py       # Groq API handler & tool execution loop with local fallback
│   └── tests/
│       ├── __init__.py
│       ├── test_api.py           # FastAPI health, chat, & GET /api/orders/{id} tests
│       ├── test_dashboard.py     # Dashboard stats & insights endpoint tests
│       ├── test_data_service.py  # Pandas lookup, filter, & analyze unit tests
│       └── test_fallback.py     # Fallback engine & rate-limit error handler tests
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (page.tsx, layout.tsx, globals.css, icon.png)
│   │   ├── components/        # Sidebar, TopHeader, WelcomeHero, KpiCardsSection, SalesAnalyticsPreview,
│   │   │                      # QuickActions, AiSalesInsightsCard, OrderLookupView, Dashboard, ChatMessageItem, ChatInput
│   │   ├── context/           # ThemeContext (Light & Dark theme state & persistence)
│   │   └── types/             # TypeScript interfaces for Chat, Health, & Tool calls
│   ├── public/
│   │   └── order-assistant-logo.png  # Branded Order Assistant logo asset
│   ├── package.json           # Frontend dependencies (next, react, tailwindcss, recharts, lucide-react)
│   ├── vercel.json            # Vercel frontend deployment configuration
│   └── .env.example           # Frontend environment variable template
├── render.yaml                # Render Infrastructure-as-Code specification
├── .env.example               # Root environment variable template
├── README.md                  # Project setup & execution documentation
└── WRITEUP.md                 # Architecture, tool calling design, & fallback documentation
```

---

## 🔐 Environment Variables

The backend uses `python-dotenv` to automatically load environment variables from `.env`, `.env.txt`, or root environment files. A template is provided in `.env.example`.

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `GROQ_API_KEY` | Backend | Required Groq API Key (Obtain from Groq Console) | `gsk_your_groq_api_key_here` |
| `GROQ_MODEL` | Backend | Groq LLM model identifier | `llama-3.3-70b-versatile` |
| `GROQ_BASE_URL` | Backend | Groq OpenAI-compatible Base URL | `https://api.groq.com/openai/v1` |
| `CSV_PATH` | Backend | Path to the order dataset CSV file | `data/orders.csv` |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Public API base URL for the FastAPI backend | `https://order-assistant-3owc.onrender.com` |

> ⚠️ **Security Note:** Never commit actual API keys or `.env` files to Git repositories. Configure environment variables in Render and Vercel deployment dashboards.

---

## 🚀 Local Development Setup

### Prerequisites

- **Python**: 3.10+ (Tested on Python 3.12)
- **Node.js**: v18+ or v20+ (npm v9+)
- **Groq API Key**: Obtain API key from Groq Console *(Optional: local deterministic engine operates if key is unconfigured)*

---

### Step 1: Clone Repository & Configure Environment

```bash
git clone https://github.com/chxisty/order-assistant.git
cd order-assistant
```

1. **Create backend environment file (`backend/.env` or root `.env`)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set your `GROQ_API_KEY`:*
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   GROQ_BASE_URL=https://api.groq.com/openai/v1
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

2. **Create frontend environment file (`frontend/.env.local`)**:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

---

### Step 2: Set Up & Run Backend Server

From the repository root directory in Windows PowerShell:

1. **Create and activate Python virtual environment**:
   ```powershell
   python -m venv backend/venv
   .\backend\venv\Scripts\Activate.ps1
   ```

2. **Install Backend Dependencies**:
   ```powershell
   pip install -r backend/requirements.txt
   ```

3. **Start FastAPI Server**:
   ```powershell
   .\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - API Server: `http://localhost:8000`
   - Health Check: `http://localhost:8000/health`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### Step 3: Run Pytest Backend Test Suite

In Windows PowerShell with virtual environment activated:

```powershell
.\backend\venv\Scripts\python.exe -m pytest backend/tests/ -v
```

*Expected output: All 33 tests passing.*

---

### Step 4: Set Up & Run Frontend Development Server

In a separate terminal window from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

- Web Application: `http://localhost:3000`

---

## 🔍 Example Queries & Features to Try

- 🔍 **Order Lookup**: `Lookup order ORD-1001` or search `ORD-1025` on the Order Lookup page.
- 📊 **Revenue Analytics**: `What is the total revenue in July 2026?`
- 👑 **Top Customer Spend**: `Show top 5 spending customers`
- 📍 **City & Status Filtering**: `List all delivered orders in Chennai`
- 📈 **Category Revenue**: `Which category generated the highest revenue?`
- 🤖 **AI Sales Insights**: Click **"Generate Insights"** on the home dashboard for executive AI recommendations.
- ☀️/🌙 **Theme Toggle**: Click the Sun/Moon icon in the header to switch between Dark Navy and Light themes.

---

## 🌐 Live Production Deployments

- 🌐 **Live Web Application (Vercel):** [https://order-assistant-lemon.vercel.app/](https://order-assistant-lemon.vercel.app/)
- ⚙️ **Backend Web Service (Render):** [https://order-assistant-3owc.onrender.com](https://order-assistant-3owc.onrender.com)
- 📖 **Swagger API Documentation:** [https://order-assistant-3owc.onrender.com/docs](https://order-assistant-3owc.onrender.com/docs)

### Deployment Configuration Summary

1. **Backend Web Service (Render)**:
   - Configured via `render.yaml` with Python 3 environment.
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - Required Environment Variables:
     - `GROQ_API_KEY`: Required Groq API Key
     - `GROQ_MODEL`: `llama-3.3-70b-versatile`
     - `GROQ_BASE_URL`: `https://api.groq.com/openai/v1`
     - `CSV_PATH`: `data/orders.csv`

2. **Frontend Web App (Vercel)**:
   - Configured with `frontend` root directory.
   - Environment variable: `NEXT_PUBLIC_BACKEND_URL=https://order-assistant-3owc.onrender.com`.

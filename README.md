# Order Assistant — Premium AI Analytics Dashboard

An intelligent full-stack e-commerce workspace for order dataset tracking, querying, and sales analytics built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Python FastAPI**, **Pandas**, and **Google Gemini API** with genuine function calling.

---

## 🌟 Key Features

- **Genuine Gemini Function Calling**: Leverages the official `google-genai` SDK (`gemini-2.5-flash`) with function declarations (`lookup_order`, `filter_orders`, `analyze_orders`), allowing Gemini AI to dynamically select and invoke backend data tools.
- **FastAPI & Pandas Data Engine**: High-performance backend calculating analytics directly from `data/orders.csv` (60 verified order records).
- **Premium Dark Navy Dashboard & Light Theme**: Polished dark SaaS dashboard interface featuring a responsive collapsible sidebar (`#0D1428`), top header with global search, welcome hero banner, 4 dynamic KPI cards, 2-column analytics preview (monthly revenue area chart & status donut chart), quick actions, and a functional Light/Dark theme toggle with `localStorage` persistence.
- **Dedicated Order Lookup Page**: Direct order search by ID (e.g., `ORD-1001` through `ORD-1060`) displaying customer name, city, product, category, quantity, unit price, total revenue, order date, payment method, status badge, and an AI chat query trigger.
- **Executive AI Sales Insights**: Dedicated insights module generating executive sales recommendations using Gemini AI or deterministic local data fallback.
- **Resilient Local Fallback Engine**: If the Gemini API key is unconfigured, rate-limited, or quota-exceeded, the system seamlessly uses a local pandas data engine to answer queries directly, clearly labeling fallback output.
- **Comprehensive Backend Test Suite**: 33 automated Pytest tests covering order lookup, multi-criteria filtering, analytics metrics, API endpoints, error handling, and local fallback paths.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, React Markdown, Remark GFM
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pandas, Pydantic, python-dotenv, Google Gen AI SDK (`google-genai`)
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`) with genuine function/tool calling *(Optional OpenAI API support supported via backend configuration)*
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
│   ├── requirements.txt       # Backend dependencies (fastapi, pandas, google-genai, uvicorn, pytest)
│   ├── Procfile               # Deployment process manager config
│   ├── conftest.py            # Pytest configuration
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py    # Pandas DataFrame operations & analytics metrics logic
│   │   ├── order_tools.py     # Gemini tool declarations (lookup_order, filter_orders, analyze_orders)
│   │   └── ai_service.py       # Gemini API handler & tool execution loop with local fallback
│   └── tests/
│       ├── __init__.py
│       ├── test_api.py           # FastAPI health, chat, & GET /api/orders/{id} tests
│       ├── test_dashboard.py     # Dashboard stats & insights endpoint tests
│       ├── test_data_service.py  # Pandas lookup, filter, & analyze unit tests
│       └── test_fallback.py     # Fallback engine & rate-limit error handler tests
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (page.tsx, layout.tsx, globals.css)
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
| `GEMINI_API_KEY` | Backend | Google Gemini API key (Free Tier available at Google AI Studio) | `your_gemini_api_key_here` |
| `GEMINI_MODEL` | Backend | Gemini model identifier for tool calling | `gemini-2.5-flash` |
| `OPENAI_API_KEY` | Backend (Optional) | OpenAI API key if using OpenAI backend option | `sk-proj-your-key-here` |
| `OPENAI_MODEL` | Backend (Optional) | OpenAI model identifier | `gpt-4o-mini` |
| `CSV_PATH` | Backend | Path to the order dataset CSV file | `data/orders.csv` |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Public API base URL for the FastAPI backend | `http://localhost:8000` |

> ⚠️ **Security Note:** Never commit actual API keys or `.env` files to Git repositories. Configure environment variables in Render and Vercel deployment dashboards.

---

## 🚀 Local Development Setup

### Prerequisites

- **Python**: 3.10+ (Tested on Python 3.12)
- **Node.js**: v18+ or v20+ (npm v9+)
- **Google Gemini API Key**: Free tier API key from [Google AI Studio](https://aistudio.google.com/) *(Optional: local deterministic engine operates if key is unconfigured)*

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
   *Edit `.env` and set your `GEMINI_API_KEY`:*
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
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

## 🌐 Production Deployment Guide

### Option A: Backend Web Service (Render)

1. Sign in to [Render](https://dashboard.render.com/) and create a **New Web Service**.
2. Connect your GitHub repository `chxisty/order-assistant`.
3. Configure settings according to `render.yaml`:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** in Render settings:
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `CSV_PATH`: `data/orders.csv`
5. Deploy Web Service and copy your public backend URL (e.g. `https://order-assistant-backend.onrender.com`).

---

### Option B: Frontend Web App (Vercel)

1. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import repository `chxisty/order-assistant`.
3. Set **Root Directory** to `frontend`.
4. Add **Environment Variable**:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://order-assistant-backend.onrender.com` (your Render backend URL)
5. Click **Deploy**.

> 📌 **Deployment Status Note:** Render and Vercel setup instructions are provided for cloud hosting. Ensure environment variables (`GEMINI_API_KEY` on Render and `NEXT_PUBLIC_BACKEND_URL` on Vercel) are properly configured in production project settings.

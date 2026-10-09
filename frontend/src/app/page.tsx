'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { Sidebar, NavTab } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { WelcomeHero } from '../components/WelcomeHero';
import { KpiCardsSection } from '../components/KpiCardsSection';
import { SalesAnalyticsPreview } from '../components/SalesAnalyticsPreview';
import { QuickActions } from '../components/QuickActions';
import { AiSalesInsightsCard } from '../components/AiSalesInsightsCard';
import { OrderLookupView } from '../components/OrderLookupView';
import { Dashboard } from '../components/Dashboard';
import { ExampleQuestions } from '../components/ExampleQuestions';
import { ChatMessageItem } from '../components/ChatMessageItem';
import { ChatInput } from '../components/ChatInput';
import { Message, BackendHealth } from '../types/chat';
import { AlertTriangle, Bot, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lookupOrderId, setLookupOrderId] = useState('ORD-1001');

  // Stats state for KPI cards & analytics preview on home page
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### Welcome to Order Assistant AI! 👋\n\nI am your intelligent e-commerce assistant. I have loaded and verified all **60 order records** from your dataset.\n\nYou can ask me to:\n- 🔍 **Look up orders:** e.g., *"Lookup order ORD-1001"*\n- 📊 **Calculate analytics:** e.g., *"What is the total revenue in July 2026?"*\n- 👑 **Rank top customers:** e.g., *"Show top 5 spending customers"*\n- 🏷️ **Filter records:** e.g., *"List all delivered orders in Chennai"*\n- 📈 **Category & City breakdowns:** e.g., *"Which category generated the highest revenue?"*`,
      timestamp: '10:00 AM'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeTab]);

  // Fetch backend health
  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        const data: BackendHealth = await res.json();
        setHealth(data);
        setApiError(null);
      } else {
        setHealth(null);
        setApiError(`Backend service returned status ${res.status}`);
      }
    } catch (err) {
      setHealth(null);
      setApiError(`Could not connect to backend at ${BACKEND_URL}. Ensure FastAPI is running on port 8000.`);
    } finally {
      setLoadingHealth(false);
    }
  };

  // Fetch stats for home dashboard preview
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } fontally: {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchStats();
  }, []);

  // Send message to backend AI assistant
  const handleSendMessage = async (text: string) => {
    setApiError(null);
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const historyPayload = updatedMessages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errDetail = errData.detail || `Server returned error ${response.status}`;
        throw new Error(errDetail);
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.tool_calls_executed || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Error communicating with chat API:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `**API Connection Error:** ${err.message || 'Failed to fetch response from backend.'}\n\nPlease verify that the FastAPI backend is running at \`${BACKEND_URL}\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: "Conversation history cleared. How can I help you with your order data?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setApiError(null);
  };

  // Top Search Handler
  const handleSearchSubmit = (query: string) => {
    const isOrderId = /^ord-\d{4}$/i.test(query.trim());
    if (isOrderId) {
      setLookupOrderId(query.trim().toUpperCase());
      setActiveTab('lookup');
    } else {
      setActiveTab('chat');
      handleSendMessage(query);
    }
  };

  const handleAskAiFromLookup = (question: string) => {
    setActiveTab('chat');
    handleSendMessage(question);
  };

  return (
    <div className="flex h-screen w-full bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 overflow-hidden font-sans transition-colors">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <TopHeader
          health={health}
          loadingHealth={loadingHealth}
          onRefreshHealth={checkHealth}
          onSearchSubmit={handleSearchSubmit}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          setActiveTab={setActiveTab}
        />

        {/* API Error Alert Banner */}
        {apiError && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={checkHealth}
              className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Main Body Scroll Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* View 1: Home Dashboard */}
            {activeTab === 'home' && (
              <div className="space-y-6 animate-fade-in">
                {/* Welcome Hero */}
                <WelcomeHero onNavigate={setActiveTab} />

                {/* KPI Cards (Dynamic CSV Sourced) */}
                <KpiCardsSection stats={stats} loading={loadingStats} />

                {/* Sales Analytics Preview (2 Column: Line Chart + Donut Chart) */}
                <SalesAnalyticsPreview stats={stats} loading={loadingStats} onNavigate={setActiveTab} />

                {/* Quick Actions Card */}
                <QuickActions onNavigate={setActiveTab} />

                {/* AI Sales Insights Section */}
                <AiSalesInsightsCard />
              </div>
            )}

            {/* View 2: Sales Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                <Dashboard />
              </div>
            )}

            {/* View 3: AI Order Assistant Chat */}
            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-120px)] flex flex-col min-h-0 overflow-hidden bg-[#101A30] dark:bg-[#101A30] light:bg-white rounded-2xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 shadow-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                      AI Order Assistant
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    Function Calling Active &bull; Gemini 2.5 Flash
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                  {messages.map((msg) => (
                    <ChatMessageItem key={msg.id} message={msg} />
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#080D1B] border border-slate-800 max-w-xs animate-pulse text-xs text-slate-400">
                      <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Analyzing orders with Gemini...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="pt-3 border-t border-slate-800/80 shrink-0 space-y-2">
                  <ExampleQuestions
                    onSelectQuestion={handleSendMessage}
                    disabled={isLoading}
                  />
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    onClearHistory={handleClearHistory}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* View 4: Order Lookup */}
            {activeTab === 'lookup' && (
              <OrderLookupView initialOrderId={lookupOrderId} onAskAi={handleAskAiFromLookup} />
            )}

            {/* View 5: Dedicated Sales Insights */}
            {activeTab === 'insights' && (
              <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <AiSalesInsightsCard />
                <div className="rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-6 shadow-xl text-xs space-y-3">
                  <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
                    Understanding Sales Insights
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Our AI insights engine aggregates data directly from your verified 60 order records in <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">data/orders.csv</code>. Insights calculate total revenue, top selling items (like Standing Desks and Noise Cancelling Headphones), city distribution, and status performance.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

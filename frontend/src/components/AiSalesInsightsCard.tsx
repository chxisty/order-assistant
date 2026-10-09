'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Loader2, Bot, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const AiSalesInsightsCard: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: null, status: null, month: null })
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.error("Error generating insights:", err);
      setError(err.message || 'Failed to generate insights from backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-purple-500/30 dark:border-purple-500/30 light:border-purple-300 p-6 shadow-xl">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              AI Sales Insights
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Powered by Gemini
              </span>
            </h3>
            <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-0.5">
              Get intelligent insights about your sales, products and order trends.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Sales...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{insights ? 'Regenerate Insights' : 'Generate Insights'}</span>
            </>
          )}
        </button>
      </div>

      {/* Output Display Area */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {insights && (
        <div className="mt-4 p-5 rounded-xl bg-[#080D1B]/80 dark:bg-[#080D1B]/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs space-y-3 animate-fade-in">
          
          {/* Metadata pill */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              {insights.provider === 'gemini' ? 'Gemini AI Analysis' : 'Local Data Engine Insights'}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(insights.timestamp * 1000).toLocaleTimeString()}
            </span>
          </div>

          {/* Markdown Content */}
          <div className="prose-custom max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insights.insights}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="mt-2 p-4 rounded-xl bg-[#080D1B]/40 dark:bg-[#080D1B]/40 light:bg-slate-50 border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 text-center text-xs text-slate-400">
          Click "Generate Insights" to run automated AI revenue, product, and city analytics on your 60 order records.
        </div>
      )}

    </div>
  );
};

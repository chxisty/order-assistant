'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Filter,
  RefreshCw,
  AlertTriangle,
  Package,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#10b981', // emerald
  Cancelled: '#f43f5e', // rose
  Returned: '#f59e0b',  // amber
  Processing: '#3b82f6',// blue
  Shipped: '#8b5cf6'    // purple
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];

export function Dashboard() {
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [month, setMonth] = useState('All');

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status_val', status);
      if (month !== 'All') params.append('month', month);

      const res = await fetch(`${BACKEND_URL}/api/dashboard/stats?${params.toString()}`);
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [category, status, month]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category !== 'All' ? category : null,
          status: status !== 'All' ? status : null,
          month: month !== 'All' ? month : null
        })
      });
      if (!res.ok) throw new Error(`Insights request failed: HTTP ${res.status}`);
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.error("Error generating AI insights:", err);
      setInsightsError(err.message || 'Failed to generate insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleResetFilters = () => {
    setCategory('All');
    setStatus('All');
    setMonth('All');
    setInsights(null);
  };

  const kpis = stats?.kpis || {};
  const monthlyTrend = stats?.monthly_trend || [];
  const categoryBreakdown = stats?.category_breakdown || [];
  const statusBreakdown = stats?.status_breakdown || [];
  const topProducts = stats?.top_products || [];
  const allProducts = stats?.all_products || [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Top Filter Bar & Actions */}
      <div className="bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Stationery">Stationery</option>
              <option value="Furniture">Furniture</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
            </select>

            {/* Month Filter */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            >
              <option value="All">All Months (2026)</option>
              <option value="6">June 2026</option>
              <option value="7">July 2026</option>
              <option value="8">August 2026</option>
              <option value="9">September 2026</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 transition-colors border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 rounded-xl bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 transition-colors disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={handleGenerateInsights}
              disabled={loadingInsights || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loadingInsights ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-200" />
              )}
              <span>Generate AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStats} className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-medium">Retry</button>
        </div>
      )}

      {/* AI Sales Insights Panel (if generated) */}
      {insights && (
        <div className="bg-gradient-to-tr from-indigo-950/80 via-gray-900 to-blue-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3 border-b border-indigo-800/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Executive AI Sales Insights</h3>
                <p className="text-[11px] text-gray-400">Synthesized trends &amp; evidence-based data analysis</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              insights.is_ai_generated
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {insights.is_ai_generated ? '🤖 Groq Model Generated' : '📊 Deterministic Data Engine'}
            </span>
          </div>

          <div className="prose-custom max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insights.insights}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Total Revenue */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              ₹{(kpis.total_revenue_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>Delivered: ₹{(kpis.delivered_revenue_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {kpis.total_orders || 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Order Volume</p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              ₹{(kpis.avg_order_value_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Per Order Average</p>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 tracking-tight">
              {kpis.delivered_orders || 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Successfully Fulfilled</p>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelled</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-rose-400 tracking-tight">
              {kpis.cancelled_orders || 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Order Cancellations</p>
          </div>
        </div>

        {/* Returned Orders */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Returned</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-400 tracking-tight">
              {kpis.returned_orders || 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Customer Returns</p>
          </div>
        </div>

      </div>

      {/* Visualizations Row 1: Monthly Trend Line Chart & Category Revenue Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Trend Line/Area Chart */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Monthly Revenue Trend</h3>
            </div>
            <span className="text-xs text-gray-500">2026 Sales Run Rate</span>
          </div>

          <div className="h-64 w-full">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month_label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No data for selected filters</div>
            )}
          </div>
        </div>

        {/* Revenue by Category Bar Chart */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Revenue by Product Category</h3>
            </div>
            <span className="text-xs text-gray-500">Category Share</span>
          </div>

          <div className="h-64 w-full">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No category data</div>
            )}
          </div>
        </div>

      </div>

      {/* Visualizations Row 2: Order Status Distribution & Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Status Distribution Pie/Donut Chart */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Order Status Distribution</h3>
            </div>
          </div>

          <div className="h-64 w-full">
            {statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="orders"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusBreakdown.map((entry: any, index: number) => (
                      <Cell key={`status-cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Orders`, 'Count']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No status data</div>
            )}
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Top 5 Products by Revenue</h3>
            </div>
            <span className="text-xs text-gray-500">Highest Performers</span>
          </div>

          <div className="h-64 w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <YAxis type="category" dataKey="product" stroke="#9ca3af" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No product data</div>
            )}
          </div>
        </div>

      </div>

      {/* Product Quantity & Sales Summary Table */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Product Sales &amp; Quantity Summary</h3>
            <p className="text-xs text-gray-400">Detailed dataset aggregated by individual product</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">
            {allProducts.length} Unique Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-800/80 text-gray-200 uppercase font-semibold border-b border-gray-700/80">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allProducts.map((p: any) => (
                <tr key={p.product} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-gray-400 font-mono">#{p.rank}</td>
                  <td className="py-3 px-4 font-semibold text-white">{p.product}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-gray-800 border border-gray-700 text-gray-300">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">{p.units} units</td>
                  <td className="py-3 px-4">{p.orders} orders</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                    ₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {allProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No products match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LineChart as LineChartIcon, PieChart as PieChartIcon, ArrowRight, Layers } from 'lucide-react';
import { NavTab } from './Sidebar';

interface SalesAnalyticsPreviewProps {
  stats: any;
  loading: boolean;
  onNavigate: (tab: NavTab) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#10B981', // emerald
  Cancelled: '#F43F5E', // rose
  Returned: '#F59E0B',  // amber
  Processing: '#3B82F6',// blue
  Shipped: '#8B5CF6'    // purple
};

export const SalesAnalyticsPreview: React.FC<SalesAnalyticsPreviewProps> = ({
  stats,
  loading,
  onNavigate
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  const monthlyTrendData = stats?.monthly_trend || [];
  const statusBreakdownData = stats?.status_breakdown || [];

  // Filter trend data if specific month selected
  const filteredTrendData = selectedMonth === 'All'
    ? monthlyTrendData
    : monthlyTrendData.filter((item: any) => item.month_label.includes(selectedMonth));

  const formatRupee = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column (8 cols on desktop): Sales Overview Monthly Revenue Chart */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-5 shadow-lg">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
                Sales Overview
              </h3>
              <p className="text-[11px] text-slate-400">Monthly revenue trend (INR)</p>
            </div>
          </div>

          {/* Time-Period Filter Pills */}
          <div className="flex items-center bg-[#080D1B] dark:bg-[#080D1B] light:bg-slate-100 p-1 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs">
            {['All', 'Jun', 'Jul', 'Aug', 'Sep'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedMonth === m
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Body */}
        <div className="h-64 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs animate-pulse">
              Loading revenue chart...
            </div>
          ) : filteredTrendData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No revenue data available for selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis
                  dataKey="month_label"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={formatRupee}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1428',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400">Source: Real CSV Order Dataset</span>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View Full Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Right Column (5 cols on desktop): Order Status Distribution Donut Chart */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-5 shadow-lg">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Order Status Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Breakdown of 60 total orders</p>
          </div>
        </div>

        {/* Donut Chart and Legend Container */}
        <div className="flex-1 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
          
          {/* Donut Chart */}
          <div className="w-44 h-44 shrink-0 relative flex items-center justify-center">
            {loading ? (
              <div className="text-slate-500 text-xs animate-pulse">Loading status...</div>
            ) : statusBreakdownData.length === 0 ? (
              <div className="text-slate-500 text-xs">No status data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="orders"
                  >
                    {statusBreakdownData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#94A3B8'}
                        stroke="#101A30"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1428',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} orders (${item.payload.percentage}%)`,
                      item.payload.status
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Breakdown Legend */}
          <div className="w-full space-y-2">
            {statusBreakdownData.map((item: any) => {
              const color = STATUS_COLORS[item.status] || '#94A3B8';
              return (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#080D1B]/50 dark:bg-[#080D1B]/50 light:bg-slate-50 border border-slate-800/40 dark:border-slate-800/40 light:border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-200 dark:text-slate-200 light:text-slate-800">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-semibold">{item.orders}</span>
                    <span className="text-slate-500 text-[11px] w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};

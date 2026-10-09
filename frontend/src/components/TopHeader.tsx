'use client';

import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  Menu,
  RefreshCw,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BackendHealth } from '../types/chat';
import { NavTab } from './Sidebar';

interface TopHeaderProps {
  health: BackendHealth | null;
  loadingHealth: boolean;
  onRefreshHealth: () => void;
  onSearchSubmit: (query: string) => void;
  onOpenMobileSidebar: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  health,
  loadingHealth,
  onRefreshHealth,
  onSearchSubmit,
  onOpenMobileSidebar,
  setActiveTab
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearchSubmit(searchQuery.trim());
  };

  return (
    <header className="sticky top-0 z-30 bg-[#080D1B]/90 dark:bg-[#080D1B]/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 py-3 sm:px-6 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Mobile Menu & Brand Icon */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" /> AI Workspace
            </span>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products, or ask a question..."
              className="w-full pl-10 pr-20 py-2 text-xs rounded-xl bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right Side: Theme Toggle & Health Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Backend Status Pill */}
          {health ? (
            <div className="hidden lg:flex items-center gap-2 bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">Connected</span>
              <span className="text-slate-600 dark:text-slate-600 light:text-slate-400">|</span>
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">{health.orders_loaded} Orders</span>
              <span className="text-slate-600 dark:text-slate-600 light:text-slate-400">|</span>
              <span className="text-cyan-400 font-medium">{health.model || "Gemini AI"}</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 bg-amber-950/40 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-800/50 text-xs">
              <Activity className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Connecting...</span>
            </div>
          )}

          <button
            onClick={onRefreshHealth}
            disabled={loadingHealth}
            title="Refresh system status"
            className="p-2 rounded-xl bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

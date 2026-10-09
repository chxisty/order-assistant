'use client';

import React from 'react';
import Image from 'next/image';
import { Activity, RefreshCw, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';
import { BackendHealth } from '../types/chat';

interface HeaderProps {
  health: BackendHealth | null;
  loadingHealth: boolean;
  onRefreshHealth: () => void;
  activeTab: 'chat' | 'dashboard';
  setActiveTab: (tab: 'chat' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  loadingHealth,
  onRefreshHealth,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30 shadow-lg shadow-blue-500/20 shrink-0 bg-gray-950">
            <Image
              src="/order-assistant-logo.png"
              alt="Order Assistant Logo"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Order Assistant</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>
            <p className="text-xs text-gray-400">Intelligent E-Commerce Data Analytics &amp; Order Tracking</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Sales Dashboard</span>
          </button>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {health ? (
            <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-gray-200 font-medium">Connected</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{health.orders_loaded} Orders</span>
              <span className="text-gray-500">|</span>
              <span className={health.gemini_configured || health.openai_configured ? "text-emerald-400" : "text-amber-400"}>
                {health.gemini_configured || health.openai_configured ? (health.model || "AI Active") : "Local Engine"}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-amber-950/40 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-800/50">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting to Backend...</span>
            </div>
          )}

          <button
            onClick={onRefreshHealth}
            disabled={loadingHealth}
            title="Refresh backend status"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

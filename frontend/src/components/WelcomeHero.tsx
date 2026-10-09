'use client';

import React from 'react';
import Image from 'next/image';
import { Bot, LayoutDashboard, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { NavTab } from './Sidebar';

interface WelcomeHeroProps {
  onNavigate: (tab: NavTab) => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101A30] via-[#131F3B] to-[#182647] dark:from-[#101A30] dark:via-[#131F3B] dark:to-[#182647] light:from-blue-50 light:via-slate-50 light:to-indigo-50 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-6 sm:p-8 shadow-xl shadow-blue-950/20">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Column: Headings & Buttons */}
        <div className="flex-1 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Driven E-Commerce Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Order Assistant</span>
          </h1>

          <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-xl leading-relaxed">
            Your AI-powered workspace for order management, sales analytics, and business insights.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101A30]/80 dark:bg-[#101A30]/80 light:bg-white hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold text-xs border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 transition-all shadow-md"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>View Sales Dashboard</span>
            </button>
          </div>
        </div>

        {/* Right Column: Branded Graphic & Analytics Cards */}
        <div className="relative shrink-0 w-full md:w-64 flex justify-center items-center">
          <div className="relative w-44 h-44 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-1 border border-blue-500/30 shadow-2xl flex items-center justify-center">
            
            {/* Glowing Backdrop */}
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl" />

            {/* Central Branded Logo Container */}
            <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-[#080D1B] border border-slate-700/80 flex items-center justify-center p-3 shadow-inner">
              <Image
                src="/order-assistant-logo.png"
                alt="Order Assistant Branded Graphic"
                fill
                sizes="144px"
                className="object-contain p-2"
                priority
              />
            </div>

            {/* Floating Metric Badge 1 */}
            <div className="absolute -top-3 -right-3 bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-cyan-500/30 rounded-xl px-2.5 py-1 text-[10px] font-bold text-cyan-400 shadow-lg flex items-center gap-1.5 animate-pulse">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>60 Orders</span>
            </div>

            {/* Floating Metric Badge 2 */}
            <div className="absolute -bottom-3 -left-3 bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-purple-500/30 rounded-xl px-2.5 py-1 text-[10px] font-bold text-purple-400 shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>AI Verified</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

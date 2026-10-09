'use client';

import React from 'react';
import { Search, Bot, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { NavTab } from './Sidebar';

interface QuickActionsProps {
  onNavigate: (tab: NavTab) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'lookup',
      title: 'Look Up Order',
      description: 'Search order records by ID (e.g. ORD-1001) for instant customer & shipping details.',
      icon: Search,
      tab: 'lookup' as NavTab,
      gradient: 'from-blue-600/20 via-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      id: 'chat',
      title: 'Ask AI Assistant',
      description: 'Ask Groq AI complex order questions with automatic pandas tool calling.',
      icon: Bot,
      tab: 'chat' as NavTab,
      gradient: 'from-purple-600/20 via-purple-500/10 to-transparent',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    },
    {
      id: 'insights',
      title: 'Explore Sales Insights',
      description: 'View computed revenue trends, top spending categories, and AI recommendations.',
      icon: TrendingUp,
      tab: 'insights' as NavTab,
      gradient: 'from-cyan-600/20 via-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400'
    }
  ];

  return (
    <div className="rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-5 shadow-lg">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
          Quick Actions
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.tab)}
              className={`group relative overflow-hidden text-left p-4 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border ${action.borderColor} hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5 shadow-md`}
            >
              {/* Subtle Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10 flex items-start justify-between gap-3 mb-2">
                <div className={`p-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-700/60 shadow-inner ${action.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div className="relative z-10 space-y-1">
                <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900 group-hover:text-cyan-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 leading-snug">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

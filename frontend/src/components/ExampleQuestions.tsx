'use client';

import React from 'react';
import { Search, TrendingUp, Users, PackageCheck, BarChart3, HelpCircle } from 'lucide-react';

interface ExampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const EXAMPLES = [
  {
    icon: Search,
    label: "Order Lookup",
    prompt: "Lookup order ORD-1001",
    color: "from-blue-500/10 to-indigo-500/10 hover:border-blue-500/40 text-blue-300"
  },
  {
    icon: TrendingUp,
    label: "Monthly Revenue",
    prompt: "What is the total revenue in July 2026?",
    color: "from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/40 text-emerald-300"
  },
  {
    icon: Users,
    label: "Top Customers",
    prompt: "Show top 5 spending customers",
    color: "from-purple-500/10 to-pink-500/10 hover:border-purple-500/40 text-purple-300"
  },
  {
    icon: PackageCheck,
    label: "Filter by City & Status",
    prompt: "List all delivered orders in Chennai",
    color: "from-amber-500/10 to-orange-500/10 hover:border-amber-500/40 text-amber-300"
  },
  {
    icon: BarChart3,
    label: "Category Breakdown",
    prompt: "Which category generated the highest revenue?",
    color: "from-cyan-500/10 to-blue-500/10 hover:border-cyan-500/40 text-cyan-300"
  },
  {
    icon: HelpCircle,
    label: "Status Summary",
    prompt: "Show status breakdown of all orders",
    color: "from-rose-500/10 to-red-500/10 hover:border-rose-500/40 text-rose-300"
  }
];

export const ExampleQuestions: React.FC<ExampleQuestionsProps> = ({ onSelectQuestion, disabled }) => {
  return (
    <div className="py-3 px-2">
      <p className="text-xs font-semibold text-gray-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
        <span>Suggested Questions</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {EXAMPLES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(item.prompt)}
              disabled={disabled}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-800 bg-gradient-to-r ${item.color} text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group`}
            >
              <div className="p-1.5 rounded-lg bg-gray-900/60 border border-gray-700/50 group-hover:bg-gray-800">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-gray-200 group-hover:text-white truncate">
                  {item.label}
                </span>
                <span className="block text-[11px] text-gray-400 truncate mt-0.5">
                  &quot;{item.prompt}&quot;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

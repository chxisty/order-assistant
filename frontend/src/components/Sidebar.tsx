'use client';

import React from 'react';
import Image from 'next/image';
import {
  Home,
  LayoutDashboard,
  Bot,
  Search,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

export type NavTab = 'home' | 'dashboard' | 'chat' | 'lookup' | 'insights';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Order Assistant', icon: Bot },
    { id: 'lookup', label: 'Order Lookup', icon: Search },
    { id: 'insights', label: 'Sales Insights', icon: TrendingUp }
  ];

  const handleNavClick = (id: NavTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D1428] text-slate-100 border-r border-slate-800/80 transition-all duration-300">
      {/* Sidebar Header & Brand Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30 shadow-md shadow-blue-500/20 shrink-0 bg-[#080D1B]">
            <Image
              src="/order-assistant-logo.png"
              alt="Order Assistant Logo"
              fill
              sizes="40px"
              className="object-contain p-1"
              priority
            />
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
                Order Assistant
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">AI Analytics Suite</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80"
          title="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5 space-x-3'
              } rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Branding Section */}
      <div className="p-4 border-t border-slate-800/80 shrink-0 bg-[#0A1021]">
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <p className="text-[11px] font-semibold text-slate-300">Smarter Orders. Better Insights.</p>
            </div>
            <p className="text-[10px] text-slate-500">v2.5 AI Edition &bull; Real CSV Data</p>
          </div>
        ) : (
          <div className="flex justify-center" title="Smarter Orders. Better Insights.">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky/Fixed Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen shrink-0 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-out Panel */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

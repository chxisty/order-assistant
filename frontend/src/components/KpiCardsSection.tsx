'use client';

import React from 'react';
import { ShoppingBag, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

interface KpiCardsSectionProps {
  stats: any;
  loading: boolean;
}

export const KpiCardsSection: React.FC<KpiCardsSectionProps> = ({ stats, loading }) => {
  const kpis = stats?.kpis;

  const totalOrders = kpis?.total_orders ?? 0;
  const totalRevenue = kpis?.total_revenue_inr ?? 0;
  const avgOrderValue = kpis?.avg_order_value_inr ?? 0;
  const deliveredOrders = kpis?.delivered_orders ?? 0;

  const deliveredPercentage = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0';

  const cards = [
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: loading ? '...' : totalOrders.toLocaleString(),
      subtext: loading ? '' : 'Total processed order records',
      icon: ShoppingBag,
      iconColor: 'text-blue-400',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: loading ? '...' : `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,
      subtext: loading ? '' : `Gross revenue from CSV dataset`,
      icon: DollarSign,
      iconColor: 'text-cyan-400',
      bgGlow: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/20'
    },
    {
      id: 'avg-order-value',
      title: 'Average Order Value',
      value: loading ? '...' : `₹${avgOrderValue.toFixed(2)}`,
      subtext: loading ? '' : 'Per transaction mean value',
      icon: TrendingUp,
      iconColor: 'text-purple-400',
      bgGlow: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'delivered-orders',
      title: 'Delivered Orders',
      value: loading ? '...' : `${deliveredOrders.toLocaleString()} (${deliveredPercentage}%)`,
      subtext: loading ? '' : `Successfully fulfilled orders`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border ${card.borderColor} p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.bgGlow} rounded-full blur-xl pointer-events-none`} />

            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
                {card.value}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 light:text-slate-500">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

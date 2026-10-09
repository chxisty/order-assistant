'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Bot,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileQuestion,
  RefreshCw
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface OrderLookupViewProps {
  initialOrderId?: string;
  onAskAi?: (question: string) => void;
}

export const OrderLookupView: React.FC<OrderLookupViewProps> = ({
  initialOrderId = 'ORD-1001',
  onAskAi
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrder = async (idToFetch: string) => {
    const cleanId = idToFetch.trim().toUpperCase();
    if (!cleanId) {
      setOrderResult(null);
      setError(null);
      setNotFoundMessage(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFoundMessage(null);
    setHasSearched(true);

    try {
      // 1. Try direct fast endpoint /api/orders/{cleanId}
      const directRes = await fetch(`${BACKEND_URL}/api/orders/${cleanId}`);
      if (directRes.ok) {
        const data = await directRes.json();
        if (data && data.found) {
          setOrderResult(data);
          return;
        }
      } else if (directRes.status === 404) {
        const errData = await directRes.json().catch(() => ({}));
        setOrderResult(null);
        setNotFoundMessage(errData.detail || `Order "${cleanId}" was not found in dataset.`);
        return;
      }

      // 2. Fallback to /chat tool call query
      const chatRes = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `lookup order ${cleanId}`,
          history: []
        })
      });

      if (!chatRes.ok) throw new Error(`Server returned HTTP ${chatRes.status}`);
      const chatData = await chatRes.json();
      
      const toolCall = chatData.tool_calls_executed?.find((t: any) => t.tool === 'lookup_order');
      if (toolCall && toolCall.result) {
        const resObj = toolCall.result;
        if (resObj.found) {
          setOrderResult(resObj);
        } else {
          setOrderResult(null);
          setNotFoundMessage(resObj.message || `Order "${cleanId}" was not found in dataset.`);
        }
      } else {
        setOrderResult(null);
        setNotFoundMessage(`Order "${cleanId}" was not found in dataset.`);
      }
    } catch (err: any) {
      console.error("Error looking up order:", err);
      setError(err.message || "Failed to communicate with order lookup backend.");
      setOrderResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const handleSampleClick = (sampleId: string) => {
    setOrderId(sampleId);
    fetchOrder(sampleId);
  };

  const getStatusBadge = (statusStr: string) => {
    const status = (statusStr || '').toLowerCase();
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Cancelled
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Returned
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Shipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> {statusStr || 'Processing'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Title & Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" /> Order Lookup
        </h2>
        <p className="text-xs text-slate-400">
          Enter an Order ID (e.g. ORD-1001 to ORD-1060) to inspect real CSV record details.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-1001, ORD-1025..."
            className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 text-white dark:text-white light:text-slate-900 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 focus:outline-none focus:border-blue-500 transition-all font-mono shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Search className="w-4 h-4 text-white" />}
          <span>Search</span>
        </button>
      </form>

      {/* Quick Sample Buttons */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="text-slate-400 font-medium">Quick samples:</span>
        {['ORD-1001', 'ORD-1015', 'ORD-1030', 'ORD-1050', 'ORD-1060'].map((id) => (
          <button
            key={id}
            onClick={() => handleSampleClick(id)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-[#101A30] dark:bg-[#101A30] light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 text-[11px] font-mono border border-slate-700/50 transition-colors disabled:opacity-50"
          >
            {id}
          </button>
        ))}
      </div>

      {/* Loading Feedback Indicator */}
      {loading && (
        <div className="p-8 rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-center space-y-3 shadow-lg">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Searching order records in CSV dataset...</p>
        </div>
      )}

      {/* Initial Empty State Card (Before Searching) */}
      {!loading && !hasSearched && !orderResult && !error && !notFoundMessage && (
        <div className="p-8 rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-300 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Enter an Order ID to view its details.
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Type an ID in the input field above (e.g. <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded font-mono">ORD-1001</code>) or click one of the quick sample buttons.
            </p>
          </div>
        </div>
      )}

      {/* API Failure / Error Message */}
      {!loading && error && (
        <div className="p-5 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-rose-200">Lookup API Connection Error</p>
              <p className="text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchOrder(orderId)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Search</span>
          </button>
        </div>
      )}

      {/* Order Not Found State */}
      {!loading && notFoundMessage && !error && (
        <div className="p-8 rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-amber-500/30 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Order Not Found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {notFoundMessage}
            </p>
          </div>
        </div>
      )}

      {/* Valid Order Result Card */}
      {!loading && orderResult && (
        <div className="rounded-2xl bg-[#101A30] dark:bg-[#101A30] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-6 shadow-xl space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 inline-block">
                {orderResult.order_id}
              </span>
              <h3 className="text-xl font-extrabold text-white dark:text-white light:text-slate-900 mt-1">
                {orderResult.product}
              </h3>
            </div>
            <div>
              {getStatusBadge(orderResult.status)}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Customer */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Customer Name</p>
                <p className="font-semibold text-white dark:text-white light:text-slate-900 mt-0.5">{orderResult.customer_name}</p>
              </div>
            </div>

            {/* City */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">City Location</p>
                <p className="font-semibold text-white dark:text-white light:text-slate-900 mt-0.5">{orderResult.city}</p>
              </div>
            </div>

            {/* Category */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <Tag className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Product Category</p>
                <p className="font-semibold text-white dark:text-white light:text-slate-900 mt-0.5">{orderResult.category}</p>
              </div>
            </div>

            {/* Quantity & Unit Price */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Quantity & Unit Price</p>
                <p className="font-semibold text-white dark:text-white light:text-slate-900 mt-0.5">
                  {orderResult.quantity} unit(s) &bull; ₹{Number(orderResult.unit_price_inr ?? orderResult.unit_price ?? 0).toLocaleString('en-IN')}/unit
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Total Revenue</p>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">
                  ₹{Number(orderResult.total_inr ?? orderResult.total_price ?? 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Date & Payment Method */}
            <div className="p-3.5 rounded-xl bg-[#080D1B]/60 dark:bg-[#080D1B]/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Order Date & Payment</p>
                <p className="font-semibold text-white dark:text-white light:text-slate-900 mt-0.5">
                  {orderResult.order_date} ({orderResult.payment_method})
                </p>
              </div>
            </div>

          </div>

          {/* Action CTA */}
          {onAskAi && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onAskAi(`Give me full details and analytics for order ${orderResult.order_id}`)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/30"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Assistant About This Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

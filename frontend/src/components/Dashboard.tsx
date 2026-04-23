'use client';

import { useState, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import {
  TrendUp,
  ShoppingCart,
  Clock,
  Receipt,
  Warning,
  Circle,
  ArrowRight,
  Monitor,
  CurrencyDollar,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TodaySummary {
  total_revenue: number;
  total_transactions: number;
  transactions: any[];
}

export function Dashboard() {
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await transactionsApi.todaySummary() as { data: TodaySummary };
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="pos-card p-6 h-32 pos-skeleton" />
        ))}
      </div>
      <div className="pos-card h-80 pos-skeleton" />
    </div>
  );

  const avgOrder = summary?.total_transactions
    ? Math.round((summary.total_revenue || 0) / summary.total_transactions)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {mounted ? new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue Card */}
        <div className="pos-card p-6 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendUp size={18} className="text-indigo-600" weight="bold" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            Rp {(summary?.total_revenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Circle size={8} weight="fill" className="text-emerald-500" />
            Live — updates every second
          </p>
        </div>

        {/* Transactions Card */}
        <div className="pos-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Transactions</p>
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={18} className="text-emerald-600" weight="bold" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {summary?.total_transactions || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2">Total transactions today</p>
        </div>

        {/* Avg Order Value Card */}
        <div className="pos-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Avg. Order Value</p>
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <CurrencyDollar size={18} className="text-amber-600" weight="bold" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            Rp {avgOrder.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-400 mt-2">Per transaction average</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 pos-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pos-table-header">Reference</th>
                  <th className="pos-table-header">Time</th>
                  <th className="pos-table-header text-right">Amount</th>
                  <th className="pos-table-header text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.transactions?.slice(0, 5).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors duration-100">
                    <td className="pos-table-cell">
                      <span className="font-mono text-xs text-slate-500">
                        #{tx.id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="pos-table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700">
                          {mounted ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {mounted ? new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="pos-table-cell text-right">
                      <span className="font-semibold text-slate-900">
                        Rp {tx.total_amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="pos-table-cell text-center">
                      <span className="pos-badge-green">Completed</span>
                    </td>
                  </tr>
                ))}
                {(!summary?.transactions || summary.transactions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-slate-400">
                      No transactions yet today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="pos-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">System Status</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-slate-500">Memory usage</p>
                  <p className="text-xs font-medium text-slate-700">65%</p>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">AI Engine</span>
                <span className="pos-badge-green">Online</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Database</span>
                <span className="pos-badge-green">Connected</span>
              </div>
            </div>
          </div>

          <div className="pos-card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center gap-2 mb-2">
              <Warning size={14} className="text-amber-500" weight="fill" />
              <h4 className="text-xs font-semibold text-slate-700">Inventory Alert</h4>
            </div>
            <p className="text-sm text-slate-700">2 products are running low on stock</p>
            <button className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Review inventory →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import {
  CurrencyDollar,
  ShoppingCart,
  Clock,
  ArrowRight,
  Receipt,  
  Warning,
  Circle,
  Lightning,
  Monitor
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

  useEffect(() => {
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
    <div className="flex items-center justify-center h-64 border-4 border-black bg-white animate-pulse">
      <span className="text-xl font-black uppercase tracking-[0.5em]">SYSTEM_INITIALIZING_...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Top Section: Focal Point Revenue */}
      <div className="brutal-card-lg p-10 bg-black text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#D4FF00]">
            <Lightning size={24} weight="fill" />
            <span className="text-sm font-black uppercase tracking-[0.4em] font-mono">Realtime_Revenue_Stream</span>
          </div>
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
            RP_{summary?.total_revenue?.toLocaleString() || '0'}
          </h2>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            METRIC_SYNCED: {new Date().toLocaleTimeString()} // INTERVAL: 1S
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="px-8 py-6 border-4 border-[#D4FF00] bg-black">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">TXN_COUNT</p>
            <p className="text-4xl font-black">{summary?.total_transactions || '0'}</p>
          </div>
          <div className="px-8 py-6 border-4 border-white bg-white text-black">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">AVG_ORDER_VALUE</p>
            <p className="text-3xl font-black italic">RP_{summary?.total_transactions ? Math.round(summary.total_revenue / summary.total_transactions).toLocaleString() : 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Transaction Activity Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={20} weight="bold" />
              <h3 className="text-lg font-black uppercase tracking-tighter italic">Recent_Activity_Log</h3>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest border-b-4 border-black hover:bg-[#D4FF00] hover:text-black px-2 transition-none">View_Full_Log</button>
          </div>

          <div className="brutal-card p-0 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="brutal-table-header text-left">Ref_ID</th>
                    <th className="brutal-table-header text-left">Timestamp</th>
                    <th className="brutal-table-header text-right">Amount</th>
                    <th className="brutal-table-header text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black">
                  {summary?.transactions?.slice(0, 5).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#F4F4F0] transition-none group">
                      <td className="brutal-table-cell font-mono">#{tx.id.toString().padStart(4, '0')}</td>
                      <td className="brutal-table-cell">
                        <span className="text-[10px] block opacity-60 font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </td>
                      <td className="brutal-table-cell text-right font-black italic">
                        RP_{tx.total_amount.toLocaleString()}
                      </td>
                      <td className="brutal-table-cell text-center">
                        <span className="brutal-badge bg-[#00FF41]">COMPLETED</span>
                      </td>
                    </tr>
                  ))}
                  {(!summary?.transactions || summary.transactions.length === 0) && (
                    <tr>
                      <td colSpan={4} className="brutal-table-cell text-center py-20 text-gray-300 tracking-[0.5em]">NO_DATA_LOGGED</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Monitor Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Monitor size={20} weight="bold" />
              <h3 className="text-lg font-black uppercase tracking-tighter italic">System_Monitor</h3>
            </div>

            <div className="space-y-4">
              <div className="brutal-card p-6 border-l-[16px] border-l-[#D4FF00]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Memory_Usage</h4>
                <div className="h-6 border-4 border-black bg-white overflow-hidden p-1">
                  <div className="h-full bg-black w-[65%]" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase">
                  <span>665.2MB / 1024MB</span>
                  <span className="text-[#00FF41]">STABLE</span>
                </div>
              </div>

              <div className="brutal-card p-6 border-l-[16px] border-l-[#FF003C]">
                <div className="flex items-center gap-2 mb-2 text-[#FF003C]">
                  <Warning size={16} weight="fill" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Inventory_Alert</h4>
                </div>
                <p className="text-sm font-black uppercase leading-tight italic">2_PRODUCTS_CRITICAL_STOCK</p>
                <button className="mt-4 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 hover:bg-[#FF003C] transition-none">Resolve_Now</button>
              </div>
            </div>
          </div>

          <button className="w-full brutal-btn-primary flex items-center justify-center gap-4">
            <Circle size={14} weight="fill" className="text-[#00FF41] animate-pulse" />
            GENERATE_RECONCILIATION_REPORT
          </button>
        </div>
      </div>
    </div>
  );
}

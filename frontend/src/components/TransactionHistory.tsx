'use client';

import { useState, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import { 
  Receipt, 
  Tag, 
  CreditCard, 
  Money, 
  CaretRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TransactionItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Transaction {
  id: number;
  user_id: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_method: string;
  ai_prompt: string | null;
  items: TransactionItem[];
  created_at: string;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionsApi.getAll() as { data: Transaction[] };
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 border-4 border-black animate-pulse bg-white">
      <span className="text-xl font-black uppercase tracking-[0.5em]">Syncing_Ledger_...</span>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="brutal-card p-0 bg-white overflow-hidden">
        <div className="p-6 border-b-4 border-black bg-black text-white flex justify-between items-center italic">
          <div className="flex items-center gap-4">
            <Receipt size={24} weight="bold" className="text-[#D4FF00]" />
            <h3 className="text-xl font-black uppercase tracking-tighter underline decoration-4 underline-offset-4 decoration-[#D4FF00]">Master_Transaction_Ledger</h3>
          </div>
          <div className="bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-white">
            RECORDS: {transactions.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="brutal-table-header text-left">Ref_ID</th>
                <th className="brutal-table-header text-left">Timestamp</th>
                <th className="brutal-table-header text-left">Manifest</th>
                <th className="brutal-table-header text-right">Total_RP</th>
                <th className="brutal-table-header text-center">Method</th>
                <th className="brutal-table-header text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F4F4F0] transition-none group cursor-default">
                  <td className="brutal-table-cell">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black font-mono tracking-tighter">#{transaction.id.toString().padStart(5, '0')}</span>
                      {transaction.ai_prompt && (
                        <span className="text-[8px] font-black bg-black text-white px-2 py-0.5 border border-black uppercase italic tracking-tighter group-hover:bg-[#D4FF00] group-hover:text-black">AI_CORE</span>
                      )}
                    </div>
                  </td>
                  <td className="brutal-table-cell">
                    <div className="flex flex-col font-mono">
                      <span className="text-[11px] font-black uppercase tracking-tighter">
                        {new Date(transaction.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_')}
                      </span>
                      <span className="text-[9px] font-bold opacity-60 uppercase mt-1">
                        {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="brutal-table-cell">
                    <div className="flex flex-wrap gap-2">
                      {transaction.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1 border-2 border-black text-[9px] font-black uppercase italic bg-white group-hover:bg-black group-hover:text-white transition-none">
                          <Tag size={10} weight="bold" />
                          <span>{item.name}</span>
                          <span className="text-[#FF003C]">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="brutal-table-cell text-right font-black italic text-lg tracking-tighter">
                    {transaction.total_amount.toLocaleString()}
                  </td>
                  <td className="brutal-table-cell text-center">
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 border-4 border-black bg-white group-hover:bg-black group-hover:text-white transition-none shadow-[4px_4px_0px_0px_#000] group-hover:shadow-none translate-x-0 translate-y-0 group-hover:translate-x-[4px] group-hover:translate-y-[4px]">
                      {transaction.payment_method === 'cash' ? <Money size={16} weight="bold" /> : <CreditCard size={16} weight="bold" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{transaction.payment_method}</span>
                    </div>
                  </td>
                  <td className="brutal-table-cell text-right">
                    <button className="p-3 border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-none shadow-[4px_4px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="brutal-table-cell text-center py-40 text-gray-300 tracking-[1em] font-black uppercase">LEDGER_EMPTY_NULL</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

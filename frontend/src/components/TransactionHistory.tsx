'use client';

import { useState, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import {
  Receipt,
  CreditCard,
  Money,
  CaretRight,
  Robot,
  Package,
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
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 pos-skeleton rounded-lg" />
      <div className="pos-card h-72 pos-skeleton" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Full history of all processed transactions
        </p>
      </div>

      <div className="pos-card overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Transaction Ledger</h3>
          </div>
          <span className="pos-badge-gray">{transactions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pos-table-header">Reference</th>
                <th className="pos-table-header">Date & Time</th>
                <th className="pos-table-header">Items</th>
                <th className="pos-table-header text-right">Total</th>
                <th className="pos-table-header text-center">Method</th>
                <th className="pos-table-header text-right"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                  <td className="pos-table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">
                        #{transaction.id.toString().padStart(5, '0')}
                      </span>
                      {transaction.ai_prompt && (
                        <span
                          title={`AI prompt: ${transaction.ai_prompt}`}
                          className="pos-badge-blue flex items-center gap-1"
                        >
                          <Robot size={10} weight="fill" />
                          AI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="pos-table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-700">
                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {new Date(transaction.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="pos-table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {transaction.items.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600"
                        >
                          {item.name}
                          <span className="text-slate-400">×{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="pos-table-cell text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      Rp {transaction.total_amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="pos-table-cell text-center">
                    <span className={cn(
                      "pos-badge flex items-center gap-1.5 justify-center w-fit mx-auto",
                      transaction.payment_method === 'cash'
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {transaction.payment_method === 'cash'
                        ? <Money size={11} weight="fill" />
                        : <CreditCard size={11} weight="fill" />
                      }
                      {transaction.payment_method === 'cash' ? 'Cash' : 'Card'}
                    </span>
                  </td>
                  <td className="pos-table-cell text-right">
                    <button className="p-1.5 rounded-md text-slate-300 group-hover:text-slate-500 hover:bg-slate-100 transition-colors duration-150">
                      <CaretRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Package size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No transactions recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

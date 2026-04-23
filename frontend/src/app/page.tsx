'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { AICommandCenter } from '@/components/AICommandCenter';
import { ProductManager } from '@/components/ProductManager';
import { TransactionHistory } from '@/components/TransactionHistory';
import { LoginForm } from '@/components/LoginForm';
import { api } from '@/lib/api';
import { UserCircle, Circle } from '@phosphor-icons/react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me') as any;
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchUser();
  };

  const handleLogout = () => {
    api.clearToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'cashier': return <AICommandCenter />;
      case 'products': return <ProductManager />;
      case 'transactions': return <TransactionHistory />;
      default: return <Dashboard />;
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    cashier: 'AI Cashier',
    products: 'Products',
    transactions: 'Transactions',
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900">{tabTitles[activeTab]}</h2>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Circle size={7} weight="fill" className="text-emerald-500" />
              <p className="text-xs text-slate-400">System online</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-900">{user?.name || '—'}</p>
              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserCircle size={20} weight="fill" className="text-indigo-600" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

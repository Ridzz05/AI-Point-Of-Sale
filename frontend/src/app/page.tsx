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
      case 'dashboard':
        return <Dashboard />;
      case 'cashier':
        return <AICommandCenter />;
      case 'products':
        return <ProductManager />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black font-sans selection:bg-[#D4FF00] selection:text-black">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Strict Header */}
        <header className="h-16 bg-white border-b-4 border-black px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] bg-black text-white px-4 py-2 italic border-2 border-black">
              {activeTab.replace('-', '_')}
            </h2>
            <div className="h-6 w-1 bg-black/10" />
            <div className="flex items-center gap-2">
              <Circle size={10} weight="fill" className="text-[#00FF41]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
                HOST_NODE: POS_ALPHA_01
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{user?.name || 'NULL'}</p>
              <p className="text-[8px] font-black text-[#FF003C] mt-1 uppercase tracking-widest italic">ROOT_ACCESS_LEVEL</p>
            </div>
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <UserCircle size={24} weight="bold" />
            </div>
          </div>
        </header>

        {/* Content Environment - Off-White Kotor */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#F4F4F0]">
          <div className="max-w-none">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

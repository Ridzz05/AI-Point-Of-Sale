'use client';

import { useState, useEffect } from 'react';
import { AICommandCenter } from '@/components/AICommandCenter';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  UserCircle,
  Clock,
  Calendar,
  SignOut,
  Circle,
  Sparkle,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CashierPage() {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = api.getToken();
    if (!token) {
      router.push('/');
      return;
    }
    fetchUser();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me') as any;
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150">
              <ArrowLeft size={16} />
              Back
            </button>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Sparkle size={13} weight="fill" className="text-white" />
            </div>
            <h1 className="text-sm font-semibold text-slate-900">
              SmartPOS <span className="font-normal text-slate-400">— AI Cashier</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <Circle size={7} weight="fill" className="text-emerald-500" />
            <span className="text-xs text-slate-400">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Date & Time */}
          <div className="hidden xl:flex items-center gap-5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>
                {mounted
                  ? time.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="font-mono">
                {mounted
                  ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '--:--:--'}
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-900">{user?.name || '—'}</p>
              <p className="text-[11px] text-slate-400">Cashier</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserCircle size={20} weight="fill" className="text-indigo-600" />
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <AICommandCenter />
        </div>
      </main>
    </div>
  );
}

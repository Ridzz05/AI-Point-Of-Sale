'use client';

import { useState, useEffect } from 'react';
import { AICommandCenter } from '@/components/AICommandCenter';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  UserCircle, 
  Clock, 
  Monitor,
  Calendar,
  SignOut,
  Circle,
  Cpu
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CashierPage() {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
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
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans flex flex-col selection:bg-[#D4FF00] selection:text-black">
      {/* Strict Neo-Brutalist Header */}
      <header className="h-20 bg-black text-white px-8 flex items-center justify-between z-50 border-b-8 border-[#D4FF00] sticky top-0">
        <div className="flex items-center gap-10">
          <Link href="/">
            <button className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] hover:text-[#D4FF00] transition-none group">
              <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-none" />
              TERMINATE_SESSION
            </button>
          </Link>
          <div className="h-10 w-1 bg-white/10" />
          <div className="flex items-center gap-4">
            <Monitor size={24} weight="bold" className="text-[#D4FF00]" />
            <h1 className="font-black text-lg uppercase tracking-tighter italic">POS_TERM_001 // <span className="text-[#00FF41]">ONLINE</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="hidden xl:flex items-center gap-10">
            <div className="flex items-center gap-3">
              <Calendar size={20} weight="bold" className="text-gray-500" />
              <span className="text-xs font-black uppercase tracking-widest font-mono">
                {time.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={20} weight="bold" className="text-gray-500" />
              <span className="text-xs font-black uppercase tracking-widest font-mono">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="h-10 w-1 bg-white/10" />

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] mb-1">OPERATOR_ID</p>
              <p className="text-xs font-black uppercase italic tracking-tighter text-[#D4FF00]">{user?.name || 'NULL_USER'}</p>
            </div>
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center border-4 border-[#D4FF00] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <UserCircle size={32} weight="bold" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:text-[#FF003C] transition-none"
            >
              <SignOut size={28} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Terminal Environment */}
      <main className="flex-1 p-8 md:p-16 lg:p-24 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none select-none">
          <Cpu size={800} weight="thin" />
        </div>

        <div className="max-w-[1800px] mx-auto h-full relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b-[8px] border-black pb-10 gap-10">
            <div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.5em] text-gray-400 mb-4">
                <span className="w-3 h-3 bg-black" />
                Stream_Buffer_Active
              </div>
              <h2 className="text-8xl font-black text-black tracking-tighter uppercase italic leading-none">
                AI_CASHIER_CORE
              </h2>
            </div>
            <div className="flex gap-6">
              <div className="px-8 py-4 border-4 border-black bg-white flex items-center gap-4 shadow-[8px_8px_0px_0px_#000]">
                <Circle size={12} weight="fill" className="text-[#00FF41] animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest">Neural_Sync_Ready</span>
              </div>
              <div className="px-8 py-4 border-4 border-black bg-black text-white flex items-center gap-4 italic shadow-[8px_8px_0px_0px_#D4FF00]">
                <span className="text-sm font-black uppercase tracking-widest text-[#D4FF00]">Encrypted_Link</span>
              </div>
            </div>
          </div>
          
          <AICommandCenter />
        </div>
      </main>

      {/* Heavy Brutalist Footer */}
      <footer className="h-12 bg-black text-white px-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em]">
        <div className="flex gap-12">
          <span className="flex items-center gap-3 opacity-60 hover:opacity-100 cursor-help transition-none"><kbd className="bg-[#D4FF00] text-black px-2 py-0.5">F1</kbd> HELP_RESOURCES</span>
          <span className="flex items-center gap-3 opacity-60 hover:opacity-100 cursor-help transition-none"><kbd className="bg-[#D4FF00] text-black px-2 py-0.5">F2</kbd> GLOBAL_INV_SCAN</span>
          <span className="flex items-center gap-3 opacity-60 hover:opacity-100 cursor-help transition-none"><kbd className="bg-[#FF003C] text-white px-2 py-0.5">F12</kbd> EMERGENCY_HALT</span>
        </div>
        <div className="flex items-center gap-4 italic text-[#D4FF00]">
          <div className="w-2 h-2 bg-[#00FF41]" />
          LINK_STATUS: [STABLE] // ENGINE: [OPTIMIZED]
        </div>
      </footer>
    </div>
  );
}

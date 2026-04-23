'use client';

import { cn } from '@/lib/utils';
import { 
  SquaresFour, 
  Monitor, 
  Package, 
  Receipt, 
  SignOut 
} from '@phosphor-icons/react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Navigation({ activeTab, onTabChange, onLogout }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: SquaresFour },
    { id: 'cashier', label: 'CASHIER', icon: Monitor },
    { id: 'products', label: 'PRODUCTS', icon: Package },
    { id: 'transactions', label: 'TRANSACTIONS', icon: Receipt },
  ];

  return (
    <aside className="w-56 border-r-4 border-black bg-white flex flex-col h-screen sticky top-0 z-50">
      <div className="p-6 border-b-4 border-black bg-black text-white">
        <h1 className="text-2xl font-black tracking-tight uppercase italic">
          AI_POS
        </h1>
        <p className="text-[10px] font-black mt-1 tracking-[0.2em] text-[#D4FF00]">
          SYSTEM_v0.1_STABLE
        </p>
      </div>

      <nav className="flex-1 p-0 space-y-0 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          const content = (
            <button
              key={tab.id}
              onClick={() => tab.id !== 'cashier' && onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 border-b-2 border-black transition-none group text-left",
                isActive 
                  ? "bg-black text-white" 
                  : "bg-white text-black hover:bg-[#D4FF00]"
              )}
            >
              <Icon 
                size={20} 
                weight={isActive ? "fill" : "bold"}
                className="shrink-0"
              />
              <span className="text-xs font-black uppercase tracking-widest font-mono">
                {tab.label}
              </span>
              {isActive && (
                <div className="ml-auto text-[10px] font-black bg-[#D4FF00] text-black px-1.5 leading-none py-1">ON</div>
              )}
            </button>
          );

          if (tab.id === 'cashier') {
            return (
              <a href="/cashier" key={tab.id} className="block no-underline">
                {content}
              </a>
            );
          }

          return content;
        })}
      </nav>

      <div className="p-4 border-t-4 border-black">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white text-black border-4 border-black hover:bg-[#FF003C] hover:text-white hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <SignOut size={20} weight="bold" />
          <span className="text-xs font-black uppercase tracking-widest font-mono">SHUTDOWN</span>
        </button>
      </div>
    </aside>
  );
}

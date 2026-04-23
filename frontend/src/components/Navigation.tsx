'use client';

import { cn } from '@/lib/utils';
import {
  SquaresFour,
  Monitor,
  Package,
  Receipt,
  SignOut,
  Sparkle,
} from '@phosphor-icons/react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Navigation({ activeTab, onTabChange, onLogout }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
    { id: 'cashier', label: 'AI Cashier', icon: Monitor },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkle size={18} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-none">SmartPOS</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-none">AI-Powered</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const content = (
            <button
              key={tab.id}
              onClick={() => tab.id !== 'cashier' && onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors duration-150",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                size={18}
                weight={isActive ? "fill" : "regular"}
                className="shrink-0"
              />
              <span className={cn(
                "text-sm",
                isActive ? "font-medium" : "font-normal"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
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

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
        >
          <SignOut size={18} weight="regular" />
          <span className="text-sm font-normal">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

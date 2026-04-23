'use client';

import { useState } from 'react';
import { authApi, api } from '@/lib/api';
import { Sparkle, EnvelopeSimple, LockSimple, ArrowRight, CircleNotch } from '@phosphor-icons/react';

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(email, password) as { data: { token: string } };
      api.setToken(response.data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-start justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Sparkle size={22} weight="fill" className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">SmartPOS</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Intelligent point-of-sale for modern businesses.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-md">
            Process transactions with voice commands, monitor inventory in real-time, and get AI-powered business insights — all in one place.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">99.9%</p>
            <p className="text-indigo-200 text-xs mt-0.5">Uptime</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">AI</p>
            <p className="text-indigo-200 text-xs mt-0.5">Powered</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">v2</p>
            <p className="text-indigo-200 text-xs mt-0.5">Latest</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkle size={20} weight="fill" className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-lg">SmartPOS</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="pos-label">Email address</label>
              <div className="relative">
                <EnvelopeSimple
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="pos-input pl-9"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="pos-label">Password</label>
              <div className="relative">
                <LockSimple
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pos-input pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pos-btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <CircleNotch size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Demo credentials: test@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
}

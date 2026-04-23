'use client';

import { useState, useRef, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import {
  Sparkle,
  Warning,
  CheckCircle,
  ShoppingCart,
  Receipt,
  Microphone,
  ArrowRight,
  X,
  CircleNotch,
  MicrophoneSlash,
  Robot,
  ListBullets,
  ChartBar,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ParsedItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ParsedResult {
  intent: 'transaction' | 'inventory_check' | 'analysis';
  items: ParsedItem[];
  total_amount: number;
  success: boolean;
  message: string;
  data?: {
    highlights?: string[];
    recommended_action?: string;
  };
}

const EXAMPLE_PROMPTS = [
  'Sell 2 Cappuccino and 1 Croissant',
  'Check all available products',
  'Analyze current stock levels',
];

export function AICommandCenter() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [txnSuccess, setTxnSuccess] = useState(false);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setTxnSuccess(false);

    try {
      const response = await transactionsApi.processAIPrompt(prompt) as { data: ParsedResult };
      setResult(response.data);
      if (!response.data.success) {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process command');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!result || !result.success) return;
    try {
      await transactionsApi.create({
        items: result.items,
        paid_amount: result.total_amount,
        payment_method: 'cash',
        ai_prompt: prompt,
      });
      setTxnSuccess(true);
      setTimeout(() => {
        setPrompt('');
        setResult(null);
        setTxnSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleProcess();
    }
  };

  const getIntentIcon = () => {
    if (!result) return null;
    switch (result.intent) {
      case 'transaction': return <ShoppingCart size={16} className="text-indigo-600" />;
      case 'inventory_check': return <ListBullets size={16} className="text-emerald-600" />;
      case 'analysis': return <ChartBar size={16} className="text-amber-600" />;
    }
  };

  const getIntentBadgeClass = () => {
    if (!result) return '';
    switch (result.intent) {
      case 'transaction': return 'pos-badge-blue';
      case 'inventory_check': return 'pos-badge-green';
      case 'analysis': return 'bg-amber-100 text-amber-700 pos-badge';
    }
  };

  const getIntentLabel = () => {
    if (!result) return '';
    switch (result.intent) {
      case 'transaction': return 'Transaction';
      case 'inventory_check': return 'Inventory';
      case 'analysis': return 'Analysis';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">AI Cashier</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Type or speak a command to process transactions, check stock, or get insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* === Input Panel === */}
        <div className="lg:col-span-3 space-y-4">
          <div className="pos-card overflow-hidden">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Robot size={16} className="text-indigo-600" weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Command Input</h3>
                <p className="text-xs text-slate-400">Powered by Gemini AI</p>
              </div>
              {/* Recording indicator */}
              {isRecording && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-medium text-red-600">Recording...</span>
                </div>
              )}
            </div>

            {/* Textarea */}
            <div className="p-5">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="E.g. &quot;Sell 2 Cappuccino and 1 Croissant&quot; or &quot;Check stock levels&quot;..."
                  className={cn(
                    "w-full h-36 p-4 pr-14 rounded-lg bg-slate-50 border text-sm text-slate-900 placeholder:text-slate-400 resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white",
                    "transition-all duration-150",
                    isRecording ? "border-red-300 bg-red-50/30 ring-2 ring-red-500/10" : "border-slate-200"
                  )}
                />
                {/* Mic button */}
                <button
                  onClick={toggleRecording}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                  className={cn(
                    "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                    isRecording
                      ? "bg-red-500 text-white shadow-md animate-mic-pulse"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                  )}
                >
                  {isRecording
                    ? <MicrophoneSlash size={16} weight="fill" />
                    : <Microphone size={16} weight="bold" />
                  }
                </button>
              </div>

              {/* Example chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mx-5 mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                <Warning size={16} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
                <div>
                  <p className="text-xs font-medium text-red-700">Command failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Process Button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleProcess}
                disabled={loading || !prompt.trim()}
                className="pos-btn-primary w-full flex items-center justify-center gap-2.5 py-3"
              >
                {loading ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Processing command...
                  </>
                ) : (
                  <>
                    <Sparkle size={16} weight="fill" />
                    Process Command
                    <span className="ml-auto text-xs text-indigo-300 hidden sm:block">⌘ Enter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* === Result Panel === */}
        <div className="lg:col-span-2 sticky top-6">
          <div className="pos-card overflow-hidden min-h-[400px] flex flex-col">
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Result</h3>
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <span className={getIntentBadgeClass()}>
                    {getIntentLabel()}
                  </span>
                  {result.success ? (
                    <span className="pos-badge-green">Valid</span>
                  ) : (
                    <span className="pos-badge-red">Failed</span>
                  )}
                </div>
              )}
              {result && (
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Panel body */}
            <div className="flex-1 flex flex-col">
              {txnSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={28} className="text-emerald-600" weight="fill" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900">Transaction Complete</h4>
                  <p className="text-sm text-slate-500 mt-1">The transaction has been recorded successfully.</p>
                </div>
              ) : result?.success ? (
                <>
                  <div className="p-5 flex-1 space-y-5">
                    {/* AI Message */}
                    <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Robot size={13} className="text-white" weight="fill" />
                      </div>
                      <p className="text-sm text-indigo-900 leading-relaxed">{result.message}</p>
                    </div>

                    {/* Transaction items */}
                    {result.intent === 'transaction' && result.items.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Items</p>
                        <div className="space-y-2">
                          {result.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">
                                Rp {item.subtotal.toLocaleString('id-ID')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inventory / Analysis highlights */}
                    {(result.intent === 'analysis' || result.intent === 'inventory_check') && result.data?.highlights && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Details</p>
                        <div className="space-y-1.5">
                          {result.data.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-slate-50 transition-colors">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-500">{i + 1}</span>
                              </div>
                              <p className="text-sm text-slate-700">{h}</p>
                            </div>
                          ))}
                        </div>
                        {result.data.recommended_action && (
                          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                            <Warning size={14} className="text-amber-500 shrink-0 mt-0.5" weight="fill" />
                            <p className="text-xs text-amber-800 leading-relaxed">{result.data.recommended_action}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    {result.intent === 'transaction' ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span>Rp {result.total_amount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Tax (0%)</span>
                            <span>Rp 0</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-sm font-semibold text-slate-900">Total</span>
                            <span className="text-xl font-bold text-slate-900">
                              Rp {result.total_amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleCreateTransaction}
                          className="pos-btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                          <CheckCircle size={16} weight="fill" />
                          Confirm Transaction
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setResult(null); setError(null); setPrompt(''); }}
                        className="pos-btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        New command
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart size={26} className="text-slate-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">Ready to process</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-[200px] leading-relaxed">
                    Type a command or use voice input to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { transactionsApi } from '@/lib/api';
import {
  Terminal,
  Lightning,
  Warning,
  CheckCircle,
  Printer,
  ShoppingCart,
  Receipt,
  ArrowRight,
  Microphone
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

export function AICommandCenter() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID'; // Default to Indonesian

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
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

    try {
      const response = await transactionsApi.processAIPrompt(prompt) as { data: ParsedResult };
      setResult(response.data);
      if (!response.data.success) {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!result || !result.success) return;

    try {
      const paidAmount = result.total_amount;
      await transactionsApi.create({
        items: result.items,
        paid_amount: paidAmount,
        payment_method: 'cash',
        ai_prompt: prompt,
      });
      alert('TXN_COMPLETED_SUCCESSFULLY');
      setPrompt('');
      setResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Input Side - Terminal UI */}
      <div className="space-y-8">
        <div className="brutal-card-lg overflow-hidden bg-white">
          <div className="bg-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-[#D4FF00]" weight="bold" />
              <span className="text-xs font-black font-mono text-white uppercase tracking-[0.2em]">AI_COMMAND_BUFFER_v4.0</span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 border-2 border-white" />
              <div className="w-3 h-3 border-2 border-white bg-white" />
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="relative">
              <div className="absolute -top-3 -left-2 bg-[#D4FF00] border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest z-10">
                Awaiting_Input
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="TYPE_COMMAND_E.G._'JUAL_2_KOPI'..."
                className="w-full h-64 p-6 bg-white border-4 border-black font-mono text-lg uppercase tracking-tight focus:outline-none focus:bg-[#F4F4F0] placeholder:text-black/20 resize-none transition-none shadow-[6px_6px_0px_0px_#000]"
              />
              
              {/* Voice Command Button */}
              <button
                onClick={toggleRecording}
                className={cn(
                  "absolute bottom-4 right-4 flex items-center gap-2 p-4 border-4 border-black transition-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                  isRecording 
                    ? "bg-[#FF003C] text-white shadow-none translate-x-[4px] translate-y-[4px]" 
                    : "bg-white text-black shadow-[4px_4px_0px_0px_#000]"
                )}
              >
                <Microphone 
                  size={24} 
                  weight="bold" 
                  className={cn(isRecording && "animate-blink-brutal")}
                />
                {isRecording && (
                  <span className="text-[10px] font-black uppercase font-mono animate-blink-brutal">
                    [ RECORDING... ]
                  </span>
                )}
              </button>
            </div>
            
            <button
              onClick={handleProcess}
              disabled={loading || !prompt.trim()}
              className={cn(
                "w-full h-20 border-4 border-black font-black uppercase tracking-[0.3em] text-xl flex items-center justify-center gap-4 transition-none active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
                loading || !prompt.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_#000]"
              )}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin" />
                  ANALYZING_...
                </>
              ) : (
                <>
                  <Lightning size={24} weight="fill" />
                  EXECUTE_COMMAND
                </>
              )}
            </button>

            {error && (
              <div className="p-4 border-4 border-[#FF003C] bg-[#FF003C]/10 text-[#FF003C] font-black uppercase text-xs flex items-center gap-3 italic shadow-[4px_4px_0px_0px_#FF003C]">
                <Warning size={20} weight="bold" />
                EXECUTION_ERROR: {error}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="brutal-card p-6 bg-[#D4FF00]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-black/60">Logic_Engine</p>
            <p className="text-sm font-black uppercase">FUZZY_MATCHING_v2</p>
          </div>
          <div className="brutal-card p-6">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-black/40">Latency</p>
            <p className="text-sm font-black uppercase">0.84MS_CORE_SYNC</p>
          </div>
        </div>
      </div>

      {/* Output Side - Nihilist Receipt */}
      <div className="sticky top-12">
        <div className="brutal-card-lg bg-white overflow-hidden">
          <div className="p-6 border-b-4 border-black bg-[#F4F4F0] flex justify-between items-center italic">
            <div className="flex items-center gap-3">
              <Receipt size={24} weight="bold" />
              <h3 className="text-lg font-black uppercase tracking-tighter underline decoration-4 underline-offset-4">Processed_Result</h3>
            </div>
            {result && (
              <div className={cn(
                "brutal-badge px-4 py-2 text-xs",
                result.success ? "bg-[#00FF41]" : "bg-[#FF003C] text-white"
              )}>
                {result.success ? 'VALID_TXN' : 'INVALID_TXN'}
              </div>
            )}
          </div>

          <div className="min-h-[400px] flex flex-col">
            {result?.success ? (
              <>
                <div className="p-8 flex-1 space-y-10">
                  {/* AI Message */}
                  <div className="p-6 border-4 border-black bg-black text-white relative">
                    <div className="absolute -top-3 -right-2 bg-white text-black border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">
                      AI_INSIGHT
                    </div>
                    <p className="text-sm font-black uppercase leading-tight italic tracking-tight">
                      "{result.message}"
                    </p>
                  </div>

                  {/* Transaction Mode */}
                  {result.intent === 'transaction' && (
                    <div className="space-y-6">
                      <div className="flex justify-between text-xs font-black uppercase border-b-4 border-black pb-2 tracking-[0.2em]">
                        <span>Manifest_Item</span>
                        <span>Total_RP</span>
                      </div>
                      <div className="space-y-6 divide-y-2 divide-dashed divide-black">
                        {result.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start pt-4 first:pt-0">
                            <div>
                              <p className="text-lg font-black uppercase tracking-tighter">
                                {item.quantity}X {item.name}
                              </p>
                              <p className="text-[10px] font-black text-gray-400 mt-1 uppercase">UNIT_PRICE: {item.price.toLocaleString()}</p>
                            </div>
                            <p className="text-lg font-black italic">
                              {item.subtotal.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis/Inventory Mode */}
                  {(result.intent === 'analysis' || result.intent === 'inventory_check') && result.data && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-300">
                      {result.data.highlights && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Stream_Analysis</h4>
                          <div className="space-y-2">
                            {result.data.highlights.map((h, i) => (
                              <div key={i} className="p-4 border-2 border-black bg-white flex gap-4 italic text-sm font-bold uppercase leading-none">
                                <span className="text-[#FF003C]">[{i+1}]</span>
                                {h}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {result.data.recommended_action && (
                        <div className="p-8 border-4 border-black bg-[#D4FF00] shadow-[8px_8px_0px_0px_#000]">
                          <div className="flex items-center gap-3 mb-3">
                            <Warning size={20} weight="fill" />
                            <span className="text-xs font-black uppercase tracking-widest">SYSTEM_URGENT_ACTION</span>
                          </div>
                          <p className="text-lg font-black uppercase tracking-tighter italic leading-none">{result.data.recommended_action}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Area */}
                <div className="p-8 border-t-4 border-black bg-white space-y-6">
                  {result.intent === 'transaction' ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-black uppercase tracking-widest text-gray-500">
                          <span>Subtotal_Net</span>
                          <span>{result.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black uppercase tracking-widest text-gray-500">
                          <span>Tax_Vat_0%</span>
                          <span>0</span>
                        </div>
                        <div className="pt-6 border-t-4 border-black flex justify-between items-baseline">
                          <span className="text-xl font-black uppercase italic tracking-tighter">Grand_Total</span>
                          <span className="text-6xl font-black tracking-tighter">
                            {result.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={handleCreateTransaction} 
                        className="w-full h-24 bg-black text-white border-4 border-black font-black uppercase tracking-[0.4em] text-2xl hover:bg-[#00FF41] hover:text-black transition-none active:translate-x-[6px] active:translate-y-[6px] active:shadow-none shadow-[8px_8px_0px_0px_#000] flex items-center justify-center gap-6"
                      >
                        <CheckCircle size={36} weight="bold" />
                        COMMIT_TXN
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setResult(null)} 
                      className="w-full h-20 bg-black text-white border-4 border-black font-black uppercase tracking-widest text-lg hover:bg-white hover:text-black transition-none shadow-[6px_6px_0px_0px_#000]"
                    >
                      FLUSH_BUFFER_DATA
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-[#F4F4F0] relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none uppercase font-black text-[12rem] leading-none break-all select-none">
                  NULL_DATA_NULL_DATA_NULL_DATA
                </div>
                <div className="w-40 h-40 border-8 border-black flex items-center justify-center mb-10 rotate-45 group-hover:rotate-0 transition-transform duration-1000 bg-white shadow-[12px_12px_0px_0px_#000]">
                  <ShoppingCart size={80} weight="bold" className="-rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-[0.4em] italic mb-4">READY_FOR_SYNC</h3>
                <p className="text-xs font-bold uppercase max-w-[300px] tracking-widest leading-loose text-gray-500">
                  Input command stream to populate terminal buffer. AI parser v4.0 is active.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

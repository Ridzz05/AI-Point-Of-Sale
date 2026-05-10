import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatTeardropText, PaperPlaneTilt, X, Minus } from "@phosphor-icons/react";
import axios from 'axios';

export default function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
        }
    }, [messages]);

    const handleInit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(route('support.init'), guestInfo);
            setConversation(res.data.conversation);
            setIsInitialized(true);
            setMessages([{
                sender_type: 'agent',
                content: `Halo ${guestInfo.name}! Saya ${res.data.agent?.name || 'CS'} siap membantu Anda. Apa yang bisa kami bantu hari ini?`
            }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !conversation) return;

        const newMessage = {
            sender_type: 'guest',
            content: input
        };

        setMessages(prev => [...prev, newMessage]);
        const currentInput = input;
        setInput('');

        try {
            await axios.post(route('support.send', conversation.id), {
                content: currentInput,
                sender_type: 'guest'
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all bg-primary text-black"
                    size="icon"
                >
                    <ChatTeardropText size={32} weight="bold" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-background border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-black">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></div>
                    <span className="font-bold text-sm">Customer Support</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 text-black" onClick={() => setIsOpen(false)}>
                        <Minus size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 text-black" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!isInitialized ? (
                    <div className="p-6 flex flex-col justify-center h-full gap-4">
                        <div className="text-center space-y-2 mb-4">
                            <h3 className="font-bold text-lg">Mulai Percakapan</h3>
                            <p className="text-xs text-muted-foreground">Isi data diri Anda agar kami dapat menghubungi Anda kembali.</p>
                        </div>
                        <form onSubmit={handleInit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nama Lengkap</label>
                                <Input 
                                    placeholder="Masukkan nama Anda..." 
                                    value={guestInfo.name}
                                    onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                                    required
                                    className="rounded-xl bg-muted/30"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Email (Opsional)</label>
                                <Input 
                                    type="email"
                                    placeholder="email@contoh.com" 
                                    value={guestInfo.email}
                                    onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                                    className="rounded-xl bg-muted/30"
                                />
                            </div>
                            <Button type="submit" className="w-full rounded-xl h-12 mt-2 font-bold" disabled={isLoading}>
                                {isLoading ? 'Menghubungkan...' : 'Mulai Chat'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender_type === 'guest' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                                            msg.sender_type === 'guest' 
                                            ? 'bg-primary text-black rounded-tr-none' 
                                            : 'bg-muted border rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t bg-muted/20">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <Input 
                                    placeholder="Ketik pesan Anda..." 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    className="pr-12 rounded-xl border-none bg-background shadow-inner h-11"
                                />
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    className="absolute right-1 h-9 w-9 rounded-lg"
                                    disabled={!input.trim()}
                                >
                                    <PaperPlaneTilt size={18} weight="bold" />
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

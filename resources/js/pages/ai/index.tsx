import React, { useState, useRef, useEffect } from "react"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/layouts/authenticated-layout"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Robot, PaperPlaneTilt, User, CircleNotch } from "@phosphor-icons/react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function AIIndex({ initialMessages = [] }: { initialMessages?: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(
        initialMessages.length > 0 
        ? initialMessages 
        : [{ role: 'assistant', content: "Hello! I am your CRM AI Assistant. How can I help you today? I can analyze your projects, customers, or financial stats." }]
    )
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight)
        }
    }, [messages])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await axios.post(route('ai.chat'), { message: userMessage })
            const aiResponse = response.data.choices[0].message.content
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
        } catch (error: any) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I encountered an error: " + (error.response?.data?.error || error.message) 
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="AI Assistant" />
            <div className="flex flex-col h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)] w-full max-w-5xl mx-auto overflow-hidden">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-hidden bg-background">
                    <ScrollArea className="h-full px-2 md:px-6 py-4 md:py-6" ref={scrollRef}>
                        <div className="space-y-4 md:space-y-6 w-full max-w-4xl mx-auto">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 md:gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary/10">
                                            {msg.role === 'assistant' ? (
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    <Robot weight="bold" className="h-4 w-4 md:h-5 md:w-5" />
                                                </AvatarFallback>
                                            ) : (
                                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                    <User weight="bold" className="h-4 w-4 md:h-5 md:w-5" />
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={`relative rounded-2xl px-4 py-2.5 md:px-5 md:py-3.5 text-sm shadow-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-black font-medium rounded-tr-none' 
                                            : 'bg-muted/50 border rounded-tl-none'
                                        }`}>
                                            <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? '' : 'dark:prose-invert'}`}>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-4">
                                        <Avatar className="h-9 w-9 border-2 border-primary/20 animate-pulse">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                <Robot weight="bold" className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted/50 border rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground italic">Menganalisis sistem...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Input Section */}
                <div className="px-2 md:px-6 py-3 md:py-6 border-t bg-background/95 backdrop-blur">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={sendMessage} className="relative flex items-center">
                            <Input 
                                placeholder="Tanyakan bisnis Anda..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="pr-14 h-12 md:h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 shadow-inner text-sm md:text-base"
                            />
                            <div className="absolute right-2 flex items-center gap-1">
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={isLoading || !input.trim()} 
                                    className="h-9 w-9 md:h-10 md:w-10 rounded-xl transition-all active:scale-95"
                                >
                                    {isLoading ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt weight="bold" className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                        <div className="flex justify-center gap-4 mt-3">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                Tip: Tanyakan "Berapa total pendapatan bulan ini?"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
        )}>
            {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <p className="text-sm font-bold">{message}</p>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

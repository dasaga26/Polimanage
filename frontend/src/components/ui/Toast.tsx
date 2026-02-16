import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    message: string;
    duration?: number;
    onClose: () => void;
}

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
};

export function Toast({ type, message, duration = 5000, onClose }: ToastProps) {
    const Icon = icons[type];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-4 rounded-lg border shadow-lg',
                'animate-in slide-in-from-right-full duration-300',
                'max-w-md w-full',
                styles[type]
            )}
        >
            <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[type])} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Container para los toasts
export function ToastContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed top-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none">
            <div className="pointer-events-auto">{children}</div>
        </div>
    );
}

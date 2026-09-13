'use client';

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast, Toast as ToastType } from './ToastProvider';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-sky-50 border-sky-200 text-sky-900',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-sky-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:inset-x-auto z-50 flex flex-col gap-2 w-auto sm:w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  const Icon = icons[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-200 ${colors[toast.type]}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
      <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 hover:bg-black/5 active:bg-black/10 transition-all"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

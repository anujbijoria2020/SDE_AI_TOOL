import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-[90%] sm:w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-xs font-semibold leading-relaxed animate-fade-in ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="text-green-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-0.5 rounded-md hover:bg-black/5 shrink-0 transition-colors ml-4 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

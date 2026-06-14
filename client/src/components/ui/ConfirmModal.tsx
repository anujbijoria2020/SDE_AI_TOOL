import React from 'react';
import Button from './Button';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isLoading = false,
  confirmButtonVariant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-border-main overflow-hidden flex flex-col p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text-primary p-1 hover:bg-hover-bg rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmButtonVariant} 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

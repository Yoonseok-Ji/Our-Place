import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-4xl sm:rounded-3xl shadow-xl animate-slide-up max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
          {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-brand-50 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

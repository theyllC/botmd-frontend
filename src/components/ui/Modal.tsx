'use client';

import { Fragment, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-50 bg-secondary-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-full bg-white rounded-lg border border-secondary-200 shadow-card-hover animate-slide-up pointer-events-auto my-8 sm:my-0',
            sizes[size]
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between px-4 py-3 border-b border-secondary-200">
              <div>
                {title && <h2 className="text-[15px] font-semibold text-secondary-900">{title}</h2>}
                {description && <p className="mt-0.5 text-xs text-secondary-500">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="text-secondary-400 hover:text-secondary-700 rounded-md p-1 hover:bg-secondary-100 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="px-4 py-4">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-secondary-200 bg-secondary-50/60 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

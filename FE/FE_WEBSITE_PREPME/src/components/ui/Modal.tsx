import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@utils/isValidPhoneNumber.ts';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  className,
}: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'relative w-full rounded-2xl bg-white dark:bg-slate-900',
            'border border-slate-200 shadow-2xl dark:border-slate-700',
            sizeMap[size],
            className,
          )}
        >
          {(title || showClose) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 pt-5 pb-4 dark:border-slate-800">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="ml-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
    <div className="mt-2 flex justify-end gap-3">
      <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button variant={variant} size="sm" onClick={onConfirm} isLoading={isLoading}>
        {confirmText}
      </Button>
    </div>
  </Modal>
);

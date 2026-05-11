import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    info: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-50 dark:bg-red-500/10',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8 pb-0 flex justify-end">
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-10 pb-10 text-center">
              <div className={`mx-auto h-20 w-20 ${iconColors[variant]} rounded-[2rem] flex items-center justify-center mb-6`}>
                <AlertTriangle className="h-10 w-10" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 text-sm">{message}</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-4 rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-xl uppercase tracking-widest text-xs ${colors[variant]}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

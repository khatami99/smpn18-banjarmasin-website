import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, X } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function PromptDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = "Masukkan nilai...",
  defaultValue = ""
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

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

            <div className="px-10 pb-10">
              <div className="h-16 w-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Link2 className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight text-center">{title}</h3>
              
              <div className="space-y-6">
                <input
                  autoFocus
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onConfirm(value);
                      onClose();
                    }
                  }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-4 rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onConfirm(value);
                      onClose();
                    }}
                    className="px-6 py-4 rounded-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

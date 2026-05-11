import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  colorScheme?: 'navy' | 'emerald' | 'amber' | 'blue' | 'rose';
}

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  colorScheme = 'navy'
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const colorClasses = {
    navy: 'bg-school-navy dark:bg-school-yellow border-school-navy dark:border-school-yellow',
    emerald: 'bg-emerald-600 border-emerald-600',
    amber: 'bg-amber-500 border-amber-500',
    blue: 'bg-blue-600 border-blue-600',
    rose: 'bg-rose-600 border-rose-600'
  };

  const textClasses = {
    navy: 'text-school-navy dark:text-slate-400 hover:bg-school-navy dark:hover:bg-school-yellow hover:text-white dark:hover:text-school-navy',
    emerald: 'text-emerald-600 hover:bg-emerald-600 hover:text-white',
    amber: 'text-amber-500 hover:bg-amber-500 hover:text-white',
    blue: 'text-blue-600 hover:bg-blue-600 hover:text-white',
    rose: 'text-rose-600 hover:bg-rose-600 hover:text-white'
  };

  const activeTextClasses = {
    navy: 'text-white dark:text-school-navy',
    emerald: 'text-white',
    amber: 'text-white',
    blue: 'text-white',
    rose: 'text-white'
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 pb-8 transition-colors duration-500">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-800 dark:hover:border-slate-200 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-800 disabled:hover:text-slate-400 dark:disabled:hover:text-slate-500 transition-all font-bold"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isActive = currentPage === page;
          
          // Only show limited numbers if many pages
          if (
            totalPages > 7 && 
            page !== 1 && 
            page !== totalPages && 
            Math.abs(page - currentPage) > 1
          ) {
            if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-slate-300 dark:text-slate-700">...</span>;
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-[10px] text-[10px] font-black transition-all ${
                isActive 
                  ? `${colorClasses[colorScheme]} ${activeTextClasses[colorScheme]} shadow-lg` 
                  : `bg-transparent ${textClasses[colorScheme]}`
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-800 dark:hover:border-slate-200 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-800 disabled:hover:text-slate-400 dark:disabled:hover:text-slate-500 transition-all font-bold"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

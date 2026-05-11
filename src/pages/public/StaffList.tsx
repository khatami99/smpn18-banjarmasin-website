import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Mail, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStaff, Staff } from '../../services/schoolService';

export default function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Semua');

  useEffect(() => {
    return getStaff(setStaff);
  }, []);

  const roles = ['Semua', ...Array.from(new Set(staff.map(s => s.role)))];

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'Semua' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-school-red font-black uppercase tracking-widest text-[10px] mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="text-left">
              <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4 inline-block">SDM Unggul</span>
              <h1 className="text-4xl md:text-6xl font-black text-school-navy dark:text-white tracking-tight">Tenaga Pendidik <br /> & Kependidikan</h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 mb-12 shadow-xl shadow-black/5 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama pengajar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-school-yellow/10 focus:border-school-yellow transition-all font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar pt-2">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-shrink-0 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  selectedRole === role 
                    ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-lg shadow-school-navy/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredStaff.map((staf, i) => (
              <motion.div
                layout
                key={staf.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group p-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-black/5 transition-all"
              >
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-8 border border-slate-200 dark:border-slate-700 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={staf.image || `https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=600&h=800&auto=format&fit=crop`} 
                    alt={staf.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                     <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-5 w-5" />
                     </div>
                  </div>
                </div>
                <div className="px-2">
                  <h4 className="font-black text-xl text-school-navy dark:text-white mb-2 leading-tight">{staf.name}</h4>
                  <p className="text-[10px] font-black text-school-red uppercase tracking-widest mb-6">{staf.role}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tidak ada data ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400">Coba gunakan kata kunci pencarian atau filter yang lain.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, Award, Loader2, X } from 'lucide-react';
import { getAchievements, Achievement } from '../../services/schoolService';
import Pagination from '../../components/admin/Pagination';

export default function PrestasiList() {
  const [prestasi, setPrestasi] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const unsub = getAchievements(setPrestasi);
    setLoading(false);
    return unsub;
  }, []);

  const paginatedPrestasi = prestasi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="font-sans">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-24">
          <span className="text-school-red dark:text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Panggung Juara</span>
          <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight text-school-navy dark:text-white">Rekam Jejak <br /> Prestasi ALAMANDA</h1>
          <p className="text-school-slate dark:text-slate-400 text-lg max-w-2xl leading-relaxed italic">
            "Setiap kemenangan adalah buah dari kerja keras, disiplin, dan dedikasi yang tak henti-hentinya dipupuk di lingkungan SMPN 18."
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-300">
             <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div>
            <div className="grid gap-12">
              {paginatedPrestasi.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  onClick={() => setSelectedAchievement(item)}
                  className="group relative cursor-pointer"
                >
                    <div className="absolute -inset-4 bg-slate-50 dark:bg-slate-800 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-12 p-8 border-b border-slate-100 dark:border-slate-800 group-last:border-none">
                      <div className="h-32 w-32 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-[3rem] overflow-hidden flex items-center justify-center text-school-red dark:text-school-yellow group-hover:bg-school-navy dark:group-hover:bg-school-yellow group-hover:text-white dark:group-hover:text-school-navy transition-all duration-700">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?q=80&w=2072&auto=format&fit=crop'} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                            <span className="text-xs font-black text-school-red uppercase tracking-widest">{item.year}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <span className="text-xs font-bold text-school-slate dark:text-slate-400 uppercase tracking-widest">{item.rank}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <span className="text-[10px] px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-full font-black uppercase text-school-navy dark:text-white tracking-tighter">
                              {item.winner}
                            </span>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-black text-school-navy dark:text-white group-hover:text-school-red dark:group-hover:text-school-yellow transition-colors leading-tight">
                            {item.title}
                          </h3>
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>

            {prestasi.length > itemsPerPage && (
              <div className="mt-16">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={prestasi.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  colorScheme="amber"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detail Prestasi</h2>
                <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-6 w-6 dark:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center gap-6 mb-8">
                   <div className="h-20 w-20 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                      <Trophy className="h-10 w-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-school-navy dark:text-white leading-tight mb-1">{selectedAchievement.title}</h3>
                      <p className="text-sm font-bold text-school-red">{selectedAchievement.winner}</p>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peringkat</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.rank}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tahun</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.year}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.category || 'Umum'}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Deskripsi Prestasi</h4>
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl whitespace-pre-wrap">
                     {selectedAchievement.description || 'Data deskripsi prestasi tidak tersedia.'}
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Users, Palette, Star, Trophy, Music, Code, Camera, Loader2, Info, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getExtracurriculars, Extracurricular } from '../../services/schoolService';
import Pagination from '../../components/admin/Pagination';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Users': <Users />,
  'Palette': <Palette />,
  'Star': <Star />,
  'Trophy': <Trophy />,
  'Music': <Music />,
  'Camera': <Camera />,
  'Info': <Info />,
};

export default function EkstrakurikulerList() {
  const [ekskuls, setEkskuls] = useState<Extracurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEkskul, setSelectedEkskul] = useState<Extracurricular | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const unsub = getExtracurriculars(setEkskuls);
    setLoading(false);
    return unsub;
  }, []);

  const paginatedEkskuls = ekskuls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="font-sans">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-24">
          <span className="text-school-red dark:text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Pengembangan Diri</span>
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-school-navy dark:text-white">Eksplorasi Bakat <br /> & Minat Siswa</h1>
          <p className="text-school-slate dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
            Kami menyediakan berbagai wadah bagi siswa untuk mengembangkan potensi di luar jam akademis, mulai dari seni, olahraga, hingga literasi digital.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-300">
             <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 gap-8">
              {paginatedEkskuls.map((ekskul, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={ekskul.id} 
                    onClick={() => setSelectedEkskul(ekskul)}
                    className="group p-12 rounded-[3.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-10 items-center hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xl hover:border-school-yellow transition-all duration-500 cursor-pointer"
                  >
                    <div className="h-24 w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-school-red dark:text-school-yellow shadow-inner group-hover:bg-school-red dark:group-hover:bg-school-yellow group-hover:text-white dark:group-hover:text-school-navy transition-all">
                      {ekskul.icon && ICON_MAP[ekskul.icon] ? 
                        <div className="h-10 w-10 flex items-center justify-center mt-[-4px]">
                          {ICON_MAP[ekskul.icon]}
                        </div> : 
                        <Star className="h-10 w-10" />
                      }
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-school-slate dark:text-slate-400 mb-2 block">{ekskul.category}</span>
                      <h3 className="text-2xl font-black text-school-navy dark:text-white mb-3">{ekskul.name}</h3>
                      <p className="text-school-navy/60 dark:text-slate-400 font-medium leading-relaxed mb-4 line-clamp-2">{ekskul.description}</p>
                      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-school-navy/30 dark:text-white/30 uppercase tracking-widest">
                            <Users className="h-3 w-3" /> {ekskul.mentor}
                         </div>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>

            {ekskuls.length > itemsPerPage && (
              <div className="mt-12">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={ekskuls.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  colorScheme="blue"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEkskul && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detail Ekstrakurikuler</h2>
                <button onClick={() => setSelectedEkskul(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-6 w-6 dark:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
                  <img src={selectedEkskul.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop'} alt={selectedEkskul.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-3xl font-black text-school-navy dark:text-white mb-2">{selectedEkskul.name}</h3>
                <span className="inline-block px-4 py-1 bg-school-red/10 text-school-red rounded-full text-[10px] font-black uppercase tracking-widest mb-6">{selectedEkskul.category}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 whitespace-pre-wrap">{selectedEkskul.description}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-3 w-3 text-school-red" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pembimbing</p>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedEkskul.mentor || '-'}</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-3 w-3 text-school-red" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal</p>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedEkskul.schedule || '-'}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  Search,
  Filter,
  Palette,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getPrograms, SchoolProgram } from '../../services/schoolService';

export default function ProgramList() {
  const [programs, setPrograms] = useState<SchoolProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getPrograms((data) => {
      setPrograms(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-school-navy">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-school-yellow/10 rounded-full blur-[120px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-school-red/10 rounded-full blur-[120px] translate-y-1/2"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="h-4 w-4 text-school-yellow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Inovasi Kita</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Program <span className="text-school-yellow italic">Sekolah</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-lg font-medium leading-relaxed"
          >
            Berbagai inisiatif dan program unggulan SMPN 18 Banjarmasin untuk mewujudkan pendidikan yang berkualitas, inovatif, dan berkarakter.
          </motion.p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="relative z-20 -mt-10 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 flex flex-col md:flex-row gap-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari program sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none focus:ring-2 focus:ring-school-navy outline-none font-bold text-slate-600 dark:text-white transition-all"
              />
            </div>
            <button className="px-8 py-4 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </motion.div>
        </div>
      </section>

      {/* Program Grid */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 border-4 border-school-navy border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Memuat Program...</p>
            </div>
          ) : filteredPrograms.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPrograms.map((program) => (
                <motion.div 
                  key={program.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all flex flex-col"
                >
                  <Link to={`/program/${program.id}`} className="block relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={program.image || 'https://images.unsplash.com/photo-1577891720206-8850bb3c59de?q=80&w=800&auto=format&fit=crop'} 
                      alt={program.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute top-6 right-6">
                      <div className="bg-school-yellow text-school-navy px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                        Sejak {program.startYear}
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <h3 className="text-2xl font-black text-white tracking-tight">{program.name}</h3>
                    </div>
                  </Link>

                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-3 mb-8 font-medium leading-relaxed">
                      {stripHtml(program.description)}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-school-navy dark:text-school-yellow" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Program</span>
                      </div>
                      <Link 
                        to={`/program/${program.id}`}
                        className="h-10 w-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-school-navy dark:group-hover:bg-school-yellow rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white dark:group-hover:text-school-navy transition-all shadow-sm"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight mb-2">Program Tidak Ditemukan</h3>
              <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

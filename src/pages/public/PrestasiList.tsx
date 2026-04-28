import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Award, Loader2 } from 'lucide-react';
import { getAchievements, Achievement } from '../../services/schoolService';

export default function PrestasiList() {
  const [prestasi, setPrestasi] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = getAchievements(setPrestasi);
    setLoading(false);
    return unsub;
  }, []);

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
          <div className="grid gap-12">
            {prestasi.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="group relative"
              >
                  <div className="absolute -inset-4 bg-slate-50 dark:bg-slate-800 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                  <div className="relative flex flex-col md:flex-row items-center gap-12 p-8 border-b border-slate-100 dark:border-slate-800 group-last:border-none">
                    <div className="h-32 w-32 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-[3rem] overflow-hidden flex items-center justify-center text-school-red dark:text-school-yellow group-hover:bg-school-navy dark:group-hover:bg-school-yellow group-hover:text-white dark:group-hover:text-school-navy transition-all duration-700">
                        {item.image ? (
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                           <Trophy className="h-12 w-12" />
                        )}
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
        )}
      </main>
    </div>
  );
}


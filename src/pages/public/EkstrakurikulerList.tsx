import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Palette, Star, Trophy, Music, Code, Camera, Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getExtracurriculars, Extracurricular } from '../../services/schoolService';

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

  useEffect(() => {
    const unsub = getExtracurriculars(setEkskuls);
    setLoading(false);
    return unsub;
  }, []);

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
          <div className="grid md:grid-cols-2 gap-8">
            {ekskuls.map((ekskul, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={ekskul.id} 
                  className="group p-12 rounded-[3.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-10 items-center hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xl hover:border-school-yellow transition-all duration-500"
                >
                  <div className="h-24 w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-school-red dark:text-school-yellow shadow-inner group-hover:bg-school-red dark:group-hover:bg-school-yellow group-hover:text-white dark:group-hover:text-school-navy transition-all">
                    {ekskul.icon && ICON_MAP[ekskul.icon] ? 
                      React.cloneElement(ICON_MAP[ekskul.icon] as React.ReactElement, { className: "h-10 w-10" }) : 
                      <Star className="h-10 w-10" />
                    }
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-school-slate dark:text-slate-400 mb-2 block">{ekskul.category}</span>
                    <h3 className="text-2xl font-black text-school-navy dark:text-white mb-3">{ekskul.name}</h3>
                    <p className="text-school-navy/60 dark:text-slate-400 font-medium leading-relaxed mb-4">{ekskul.description}</p>
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-school-navy/30 dark:text-white/30 uppercase tracking-widest">
                          <Users className="h-3 w-3" /> {ekskul.mentor}
                       </div>
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


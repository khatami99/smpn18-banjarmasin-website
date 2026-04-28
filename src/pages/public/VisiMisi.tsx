import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Target, Shield, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSchoolSettings, SchoolSettings } from '../../services/schoolService';

export default function VisiMisi() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSchoolSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-school-red" />
      </div>
    );
  }

  return (
    <div className="font-sans">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-school-navy dark:text-white">Visi & Misi</h1>
          <div className="h-2 w-24 bg-school-yellow mx-auto rounded-full"></div>
        </motion.div>

        <section className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-school-red rounded-2xl flex items-center justify-center text-white">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-school-navy dark:text-white">Visi Sekolah</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-12 rounded-[3rem]">
            <p className="text-2xl md:text-3xl font-black text-school-navy dark:text-slate-200 leading-tight italic text-center">
              "{settings?.vision || "Belum diatur"}"
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-school-navy dark:bg-school-yellow rounded-2xl flex items-center justify-center text-white dark:text-school-navy transition-colors">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-school-navy dark:text-white">Misi Sekolah</h2>
          </div>
          <div className="grid gap-6">
            {(settings?.mission || []).map((misi, idx) => (
              <div key={idx} className="flex gap-6 items-start p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl hover:border-school-yellow hover:shadow-xl transition-all group">
                <span className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-black text-school-red group-hover:bg-school-yellow transition-colors">
                  {idx + 1}
                </span>
                <p className="text-lg font-bold text-school-navy/80 dark:text-slate-300 leading-relaxed">
                  {misi}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


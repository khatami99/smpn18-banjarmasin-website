import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SchoolLogo } from './SchoolLogo';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolSettings } from '../services/schoolService';

export function Footer() {
  const [school, setSchool] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSchool(snap.data() as SchoolSettings);
    });
  }, []);

  const data = school || {
    schoolName: "SMP Negeri 18 Banjarmasin",
    name: "SMP Negeri 18 Banjarmasin"
  };

  const schoolName = (data as any).schoolName || (data as any).name;

  return (
    <footer className="bg-school-navy dark:bg-slate-950 text-white pt-24 md:pt-32 pb-16 px-6 rounded-t-[3rem] md:rounded-t-[5rem] transition-colors duration-500 mt-20">
      <div className="mx-auto max-w-7xl">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 pb-20 border-b border-white/5">
            <div className="flex items-center gap-5 group">
               <SchoolLogo size="h-16" variant="white" className="opacity-40 group-hover:opacity-100 transition-opacity" />
               <div className="text-left">
                 <span className="block text-2xl font-black uppercase tracking-tighter">{schoolName}</span>
                 <span className="block text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mt-1">Cerdas • Beradab • Inovatif</span>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-8">
               {['YouTube', 'Instagram', 'Facebook', 'X (Twitter)'].map(soc => (
                 <a key={soc} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                   {soc}
                 </a>
               ))}
            </div>
         </div>
         
         <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/10 italic text-center sm:text-left">
              Sistem Informasi Digital SMPN 18 Banjarmasin
            </p>
            <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-white/20">
               <Link to="/login" className="hover:text-white transition-colors">Admin Login</Link>
               <span>© 2026 Developed for ALAMANDA</span>
            </div>
         </div>
      </div>
    </footer>
  );
}

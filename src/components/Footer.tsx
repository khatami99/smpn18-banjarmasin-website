import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SchoolLogo } from './SchoolLogo';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolSettings } from '../services/schoolService';
import { motion } from 'motion/react';
import { Instagram, Youtube,  Shield } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { url } from 'inspector';

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

  const socialLinks = [
    { name: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: 'hover:text-red-500', url: 'https://www.youtube.com/@alamanda18channel76' },
    { name: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: 'hover:text-pink-500', url: 'https://www.instagram.com/smpn18alamanda_bjm/' },
    { name: 'TikTok', icon: <SiTiktok className="h-4 w-4" />, color: 'hover:text-sky-400', url: 'https://www.tiktok.com/@smpn18alamandabjm' },
  ];

  return (
    <footer className="relative bg-school-navy dark:bg-slate-950 text-white pt-24 md:pt-32 pb-12 px-6 rounded-t-[3.5rem] md:rounded-t-[6rem] transition-all duration-500 mt-20 overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-1/4 h-64 w-64 bg-school-yellow/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 bg-school-red/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-7xl relative z-10">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 pb-16 border-b border-white/10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 group"
            >
               <div className="relative">
                 <div className="absolute inset-0 bg-white/5 blur-xl rounded-full group-hover:bg-white/10 transition-all duration-500" />
                 <SchoolLogo size="h-20 w-20" variant="white" className="relative drop-shadow-2xl transition-all duration-500" />
               </div>
               <div className="text-left">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-2">{schoolName}</h2>
                 <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                   <span className="h-1 w-1 bg-school-yellow rounded-full" />
                   Kejar Impian • Raih Harapan • Alamanda Jaya
                 </p>
               </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-4 md:gap-6"
            >
               {socialLinks.map((soc, idx) => (
                 <a 
                   key={soc.name} 
                   href={soc.url} 
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 group ${soc.color}`}
                 >
                   <span className="scale-110 group-hover:rotate-12 transition-transform duration-300">{soc.icon}</span>
                   <span className="text-[11px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                     {soc.name}
                   </span>
                 </a>
               ))}
            </motion.div>
         </div>
         
         <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic text-center md:text-left">
                Website Resmi SMPN 18 Banjarmasin
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
               <Link 
                 to="/login" 
                 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 text-white/60 hover:text-white"
               >
                 <Shield className="h-3.5 w-3.5" />
                 Admin Login
               </Link>
               <div className="text-[9px] font-black uppercase tracking-widest text-white/30 flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-right">
                  <span>© 2026 Developed by franticPufferfish</span>
                  {/* <span className="hidden sm:inline text-white/10">•</span>
                  <span className="text-white/20">All Rights Reserved</span> */}
               </div>
            </div>
         </div>
      </div>
    </footer>
  );
}
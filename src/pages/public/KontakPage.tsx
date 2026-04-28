import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Phone, Mail, Instagram, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSchoolSettings, SchoolSettings } from '../../services/schoolService';

export default function KontakPage() {
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
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-school-red" />
      </div>
    );
  }

  const contactItems = [
    { label: 'Telepon Kantor', value: settings?.phone || '(0511) 123456', icon: <Phone />, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    { label: 'E-mail Resmi', value: settings?.email || 'info@smpn18bjm.sch.id', icon: <Mail />, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { label: 'Instagram', value: '@smpn18bjm', icon: <Instagram />, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    { label: 'WhatsApp Bisnis', value: settings?.phone || '+62 811 555 123', icon: <MessageCircle />, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="font-sans">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
           <div>
              <header className="mb-20">
                <span className="text-school-red dark:text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Kontak Resmi</span>
                <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight text-school-navy dark:text-white">Mari Terhubung <br /> Dengan Kami</h1>
                <p className="text-school-slate dark:text-slate-400 text-lg leading-relaxed">
                  Punya pertanyaan tentang pendaftaran, administrasi, atau sekadar ingin bertegur sapa? Tim layanan kami siap membantu Anda.
                </p>
              </header>

              <div className="grid sm:grid-cols-2 gap-8">
                {contactItems.map((item, i) => (
                  <div key={i} className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-school-red dark:hover:border-school-yellow transition-all group bg-slate-50 dark:bg-slate-900">
                    <div className={`h-12 w-12 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6" })}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-school-slate dark:text-slate-500 mb-2">{item.label}</p>
                    <p className="font-bold text-school-navy dark:text-white break-words">{item.value}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="lg:sticky lg:top-32">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-[4rem] p-12 border-8 border-white dark:border-slate-700 shadow-2xl transition-all">
                 <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-school-navy dark:text-white">
                   <div className="h-2 w-8 bg-school-yellow"></div>
                   Kunjungi Kami
                 </h2>
                 <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                       <MapPin className="h-6 w-6 text-school-red flex-shrink-0" />
                       <div>
                          <p className="font-black uppercase text-[10px] tracking-widest text-school-slate dark:text-slate-500 mb-2">Alamat Fisik</p>
                          <p className="font-bold text-lg leading-relaxed text-school-navy dark:text-slate-300">{settings?.address || "Jl. Pemuda No. 18, Banjarmasin"}</p>
                       </div>
                    </div>
                    <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-600 shadow-inner group relative cursor-pointer">
                        <div className="absolute inset-0 bg-school-navy/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="bg-white text-school-navy px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">Buka di Google Maps</span>
                        </div>
                        <img src="https://picsum.photos/seed/map/800/800" alt="Map" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}


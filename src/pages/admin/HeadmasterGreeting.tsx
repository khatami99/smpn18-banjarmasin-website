import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, Save, Loader2, Quote, FileText, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { SchoolSettings, getStaff, Staff } from '../../services/schoolService';

export default function HeadmasterGreetingManagement() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    headmasterQuote: '',
    headmasterGreeting: ''
  });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SchoolSettings;
        setSettings(data);
        setFormData({
          headmasterQuote: data.headmasterQuote || '',
          headmasterGreeting: data.headmasterGreeting || ''
        });
      }
      setLoading(false);
    });

    const unsubscribeStaff = getStaff(setStaff);

    return () => {
      unsubSettings();
      unsubscribeStaff();
    };
  }, []);

  const headmasterStaff = staff.find(s => s.role === 'Kepala Sekolah');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'global'), {
        headmasterQuote: formData.headmasterQuote,
        headmasterGreeting: formData.headmasterGreeting,
        updatedAt: Timestamp.now()
      });
      toast.success("Berhasil menyimpan sambutan kepala sekolah!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan sambutan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-700">
         <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Sambutan Kepala Sekolah</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight whitespace-pre-wrap">Kelola teks sambutan yang muncul di halaman depan dan halaman detail sambutan.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary / Quote Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-school-yellow/10 flex items-center justify-center text-school-yellow">
                  <Quote className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Ringkasan Sambutan</h2>
                   <p className="text-xs font-medium text-slate-400">Muncul di halaman utama (landing page).</p>
                </div>
             </div>
             
             <textarea 
                value={formData.headmasterQuote}
                onChange={(e) => setFormData({ ...formData, headmasterQuote: e.target.value })}
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-yellow/5 focus:border-school-yellow transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 italic"
                placeholder="Tuliskan ringkasan sambutan di sini..."
             />
             <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <InfoIcon /> Tips: Gunakan kalimat pembuka yang hangat dan padat.
             </p>
          </div>

          {/* Full Greeting Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-school-navy/10 flex items-center justify-center text-school-navy dark:text-school-yellow">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Sambutan Lengkap</h2>
                   <p className="text-xs font-medium text-slate-400">Muncul di halaman "/profil/sambutan".</p>
                </div>
             </div>
             
             <textarea 
                value={formData.headmasterGreeting}
                onChange={(e) => setFormData({ ...formData, headmasterGreeting: e.target.value })}
                className="w-full h-80 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 font-medium text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-relaxed"
                placeholder="Tuliskan sambutan lengkap kepala sekolah di sini..."
             />
          </div>

          <div className="flex justify-end pt-4">
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
             >
               {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
               Simpan Perubahan
             </button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
           <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 sticky top-28">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 text-center flex items-center justify-center gap-2">
                 <UserCircle className="h-4 w-4" />
                 Profil Kepala Sekolah
              </h3>
              
              <div className="flex flex-col items-center text-center">
                 <div className="h-32 w-32 rounded-[2.5rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden mb-6">
                    {headmasterStaff?.image ? (
                        <img src={headmasterStaff.image} alt={headmasterStaff.name} className="w-full h-full object-cover" />
                    ) : (
                        <img src="https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=600&h=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Placeholder" />
                    )}
                 </div>
                 
                 <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{headmasterStaff?.name || 'Belum Diatur'}</h4>
                 <p className="text-[10px] font-black text-school-red uppercase tracking-widest mb-8">Kepala Sekolah</p>
                 
                 <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-8" />
                 
                 <div className="space-y-4 w-full">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left ml-1">Status Data</p>
                    <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                       <div className={`h-2.5 w-2.5 rounded-full ${headmasterStaff ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{headmasterStaff ? 'Personil Ditemukan' : 'Personil Belum Ada'}</span>
                    </div>
                    {!headmasterStaff && (
                       <p className="text-[9px] text-red-500/80 font-bold leading-relaxed px-1">
                          * Tambahkan personil dengan jabatan "Kepala Sekolah" di menu Guru & Staff untuk menampilkan foto & nama otomatis.
                       </p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

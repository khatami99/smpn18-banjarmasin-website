import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SchoolSettings } from '../../services/schoolService';

export default function SambutanKepalaSekolah() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) setSettings(docSnap.data() as SchoolSettings);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="font-sans">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 mb-8 transition-colors">
             <div className="h-48 w-48 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] overflow-hidden">
                <img 
                  src={settings?.headmasterImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=principal"} 
                  alt="Kepala Sekolah" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-school-navy dark:text-white">Sambutan Kepala Sekolah</h1>
          <p className="text-school-red font-bold uppercase tracking-[0.3em] text-xs underline decoration-school-yellow underline-offset-8 transition-all">{settings?.headmasterName || 'Kepala Sekolah'}</p>
        </motion.div>

        <article className="prose prose-slate dark:prose-invert max-w-none text-school-navy/80 dark:text-slate-300 leading-relaxed space-y-6 text-lg">
          <p className="font-bold text-school-navy dark:text-school-yellow text-2xl italic mb-8">
            "Assalamu’alaikum Warahmatullahi Wabarakatuh,"
          </p>
          <p>
            {settings?.headmasterQuote || "Puji syukur kita panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa, atas limpahan rahmat dan hidayah-Nya sehingga website resmi SMP Negeri 18 Banjarmasin ini dapat hadir di hadapan masyarakat sekalian."}
          </p>
          {!settings?.headmasterQuote && (
            <>
              <p>
                Di era digital ini, akses informasi yang cepat dan akurat adalah kebutuhan mutlak. Website ini hadir sebagai jendela informasi bagi seluruh warga sekolah, orang tua siswa, alumni, serta masyarakat luas untuk mengenal lebih jauh profil, kegiatan, dan prestasi yang telah diraih oleh SMPN 18 Banjarmasin.
              </p>
              <p>
                Kami berkomitmen untuk terus berinovasi dalam memberikan layanan pendidikan yang berkualitas, berkarakter, dan adaptif terhadap perkembangan teknologi. Besar harapan kami, melalui media ini, tali silaturahmi dapat semakin erat dan kolaborasi antar pihak dapat terjalin dengan lebih harmoni demi masa depan generasi penerus bangsa yang kita cintai.
              </p>
            </>
          )}
          <p className="pt-8 font-bold">
            Wassalamu’alaikum Warahmatullahi Wabarakatuh.
          </p>
        </article>
      </main>
    </div>
  );
}

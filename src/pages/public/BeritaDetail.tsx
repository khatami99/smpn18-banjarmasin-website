import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NewsItem } from '../../services/schoolService';
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BeritaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setNews({ id: docSnap.id, ...docSnap.data() } as NewsItem);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link disalin ke clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 text-school-red animate-spin" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 text-center">
        <h2 className="text-3xl font-black text-school-navy dark:text-white mb-4 uppercase tracking-tighter">Berita Tidak Ditemukan</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Maaf, berita yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
        <Link to="/berita" className="bg-school-navy text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-32">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100 dark:from-slate-900/50 to-transparent -z-10" />

      <article className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb / Back */}
        <div className="mb-12 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-school-navy dark:hover:text-white uppercase tracking-widest transition-colors group"
          >
            <div className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Kembali
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-all">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="bg-school-navy text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-school-yellow">
            {news.category}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Calendar className="h-3.5 w-3.5 text-school-red" />
            <span>{news.date}</span>
          </div>
        </div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-school-navy dark:text-white leading-[1.1] tracking-tighter mb-12"
        >
          {news.title}
        </motion.h1>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-video w-full rounded-[3rem] overflow-hidden bg-slate-200 dark:bg-slate-800 mb-16 shadow-2xl relative"
        >
          <img 
            src={news.image || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'} 
            alt={news.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-medium prose-headings:font-black prose-headings:text-school-navy dark:prose-headings:text-white">
          <div 
            className="flex flex-col gap-4 font-medium leading-[1.8] text-lg text-slate-700 dark:text-slate-300 news-content-render"
            dangerouslySetInnerHTML={{ __html: news.content || news.excerpt }}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-school-red">
                <User className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diterbitkan Oleh</p>
                <p className="text-sm font-black text-school-navy dark:text-white uppercase tracking-tight">Admin SMPN 18 Banjarmasin</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Bagikan:</p>
             {[Share2, Facebook, Twitter, LinkIcon].map((Icon, idx) => (
                <button key={idx} className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-school-navy hover:text-white dark:hover:bg-school-yellow dark:hover:text-school-navy transition-all">
                   <Icon className="h-5 w-5" />
                </button>
             ))}
          </div>
        </div>
      </article>

      {/* Other News Suggestion */}
      <section className="mt-40 bg-slate-100 dark:bg-slate-900/50 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-3xl font-black text-school-navy dark:text-white uppercase tracking-tighter italic underline decoration-school-yellow decoration-4 underline-offset-8">Berita Lainnya</h3>
            <Link to="/berita" className="text-xs font-black text-school-red uppercase tracking-widest flex items-center gap-2 group">
              Lihat Semua
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
             {/* Mocking other news or fetching real ones would be good, for now keep it simple or empty if not implemented */}
             <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-slate-400 font-bold italic text-sm">Berita terkait akan tampil di sini...</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

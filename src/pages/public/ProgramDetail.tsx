import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import DOMPurify from 'dompurify';
import { 
  Calendar, 
  ArrowLeft, 
  FileText, 
  Download, 
  ExternalLink,
  Users,
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { getProgramById, SchoolProgram } from '../../services/schoolService';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<SchoolProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProgramById(id).then(data => {
        setProgram(data);
        setLoading(false);
      });
    }
  }, [id]);

  // Helper to strip HTML for meta description or fallback
  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="h-16 w-16 border-4 border-school-navy border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Memuat Detail Program...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-6">
          <Info className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Program Tidak Ditemukan</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">Maaf, program sekolah yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/program" className="bg-school-navy text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={program.image || 'https://images.unsplash.com/photo-1577891720206-8850bb3c59de?q=80&w=2000&auto=format&fit=crop'} 
            alt={program.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full mx-auto max-w-7xl px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/program" className="inline-flex items-center gap-3 text-white/70 hover:text-school-yellow transition-colors group">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Daftar Program</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="bg-school-yellow text-school-navy px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                Sejak {program.startYear}
              </div>
              <div className="bg-white/10 backdrop-blur-md text-white/80 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10">
                <Calendar className="h-3 w-3 inline-block mr-2 -mt-0.5" />
                Dibuat {new Date(program.createdAt?.toDate()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl">
              {program.name}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-20 -mt-10 pb-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-12"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-school-navy dark:text-school-yellow">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Detail & Deskripsi</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gambaran Umum Program</p>
                  </div>
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(program.description) }}
                  />
                </div>
              </div>

              {/* Documentation Section */}
              {program.documents && program.documents.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-school-navy dark:text-school-yellow">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Dokumen Penunjang</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Materi & Panduan Program</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {program.documents.map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-school-navy dark:hover:border-school-yellow transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                            <FileText className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-black text-slate-700 dark:text-white text-sm line-clamp-1">{doc.title}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Unduh PDF / Dokumen</p>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 group-hover:text-school-navy dark:group-hover:text-school-yellow transition-all">
                          <Download className="h-4 w-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
              >
                <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-8">Statistik Program</h4>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Tahun Mulai</span>
                    <span className="font-black text-school-navy dark:text-school-yellow">{program.startYear}</span>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Status</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest">Aktif</span>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Unit Kerja</span>
                    <span className="font-black text-slate-700 dark:text-white">Akademik</span>
                  </div>
                </div>
              </motion.div>

              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 dark:border-slate-800 py-5 rounded-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                Cetak Halaman Ini
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

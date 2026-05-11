import React, { useState, useEffect, useMemo } from 'react';
import { 
  getNews, 
  getAchievements, 
  getStaff, 
  getExtracurriculars,
  getPrograms,
  NewsItem, 
  Achievement, 
  Staff,
  Extracurricular,
  SchoolProgram,
  deleteNews
} from '../../services/schoolService';
import { Newspaper, Trophy, Users, Edit2, Trash2, Star, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [ekskuls, setEkskuls] = useState<Extracurricular[]>([]);
  const [programs, setPrograms] = useState<SchoolProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [newsPage, setNewsPage] = useState(1);
  const [achievementsPage, setAchievementsPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [ekskulPage, setEkskulPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const itemsPerPage = {
    news: 5,
    achievements: 4,
    staff: 4,
    ekskul: 4
  };

  const currentNews = useMemo(() => {
    const start = (newsPage - 1) * itemsPerPage.news;
    return news.slice(start, start + itemsPerPage.news);
  }, [news, newsPage]);

  const currentAchievements = useMemo(() => {
    const start = (achievementsPage - 1) * itemsPerPage.achievements;
    return achievements.slice(start, start + itemsPerPage.achievements);
  }, [achievements, achievementsPage]);

  const currentStaff = useMemo(() => {
    const start = (staffPage - 1) * itemsPerPage.staff;
    return staff.slice(start, start + itemsPerPage.staff);
  }, [staff, staffPage]);

  const currentEkskul = useMemo(() => {
    const start = (ekskulPage - 1) * itemsPerPage.ekskul;
    return ekskuls.slice(start, start + itemsPerPage.ekskul);
  }, [ekskuls, ekskulPage]);

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNews(id);
      toast.success("Berita berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus berita.");
    }
  };

  useEffect(() => {
    const unsubNews = getNews((data) => {
      setNews(data);
      setLoading(false);
    });
    const unsubAchievements = getAchievements(setAchievements);
    const unsubStaff = getStaff(setStaff);
    const unsubEkskul = getExtracurriculars(setEkskuls);
    const unsubPrograms = getPrograms(setPrograms);
    
    return () => {
      unsubNews();
      unsubAchievements();
      unsubStaff();
      unsubEkskul();
      unsubPrograms();
    };
  }, []);

  const stats = [
    { label: 'Berita Terbit', value: news.length.toString(), icon: <Newspaper className="h-6 w-6" />, color: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Prestasi Siswa', value: achievements.length.toString(), icon: <Trophy className="h-6 w-6" />, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { label: 'Ekstrakurikuler', value: ekskuls.length.toString(), icon: <Star className="h-6 w-6" />, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    { label: 'Program Sekolah', value: programs.length.toString(), icon: <Target className="h-6 w-6" />, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
  ];

  // Robust HTML stripper for previews
  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 border-4 border-school-navy dark:border-school-yellow border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Ringkasan Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Selamat datang di pusat kendali <span className="text-school-navy dark:text-school-yellow font-bold">SMPN 18 Banjarmasin</span>.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden h-48"
          >
            <div className="relative z-10">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
              <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
            </div>
            <div className="flex justify-end">
              <div className={`relative z-10 h-14 w-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform flex-shrink-0`}>
                {stat.icon}
              </div>
            </div>
            {/* Background Decoration */}
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 ${stat.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      <div className="space-y-12">
        {/* News & Achievements Row */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-3">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                Berita Utama
              </h3>
              <Link to="/admin/news" className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 shadow-sm">LIHAT SEMUA</Link>
            </div>
            <div className="flex-1">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Konten</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {news.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-8 py-16 text-center text-slate-300 dark:text-slate-700 italic text-sm">Belum ada berita yang diterbitkan.</td>
                      </tr>
                    ) : (
                      currentNews.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner">
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Newspaper className="h-6 w-6" /></div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 group-hover:text-school-navy dark:group-hover:text-school-yellow transition-colors">{item.title}</span>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase rounded-md tracking-wider">{item.category}</span>
                                  <span className="text-[9px] text-slate-400 font-medium italic">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                              <Link to={`/admin/news?edit=${item.id}`} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Edit2 className="h-4 w-4" /></Link>
                              <button onClick={() => setDeleteId(item.id!)} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {news.length > itemsPerPage.news && (
              <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800">
                <Pagination 
                  currentPage={newsPage}
                  totalItems={news.length}
                  itemsPerPage={itemsPerPage.news}
                  onPageChange={setNewsPage}
                  colorScheme="navy"
                />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-3">
                <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></span>
                Prestasi Rekap
              </h3>
              <Link to="/admin/achievements" className="text-[10px] font-black text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-amber-100 dark:border-amber-500/20 shadow-sm">LIHAT SEMUA</Link>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              {achievements.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-200 dark:text-slate-800 py-12">
                  <Trophy className="h-16 w-16" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-50">KOSONG</p>
                </div>
              ) : (
                currentAchievements.map((item) => (
                  <Link to={`/admin/achievements?edit=${item.id}`} key={item.id} className="flex gap-4 items-center p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-850 hover:shadow-xl hover:shadow-amber-500/5 transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-500/20 group">
                    <div className="h-12 w-12 bg-white dark:bg-slate-700 shadow-sm text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white group-hover:rotate-12 transition-all">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 dark:text-slate-200 text-sm truncate uppercase tracking-tight">{item.title}</p>
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 tracking-widest">{item.rank}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {achievements.length > itemsPerPage.achievements && (
              <div className="mt-8 relative z-10">
                <Pagination 
                  currentPage={achievementsPage}
                  totalItems={achievements.length}
                  itemsPerPage={itemsPerPage.achievements}
                  onPageChange={setAchievementsPage}
                  colorScheme="amber"
                />
              </div>
            )}
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <Trophy className="h-48 w-48 -rotate-12" />
            </div>
          </div>
        </div>

        {/* Staff & Ekskul Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-3">
                <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                Personil Sekolah
              </h3>
              <Link to="/admin/staff" className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 shadow-sm">LIHAT SEMUA</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 h-[280px]">
               {staff.length === 0 ? (
                 <div className="col-span-2 flex items-center justify-center text-slate-300 py-12 italic">Belum ada staff.</div>
               ) : (
                 currentStaff.map(item => (
                   <div key={item.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all group">
                      <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Users className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.role}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
            {staff.length > itemsPerPage.staff && (
              <div className="mt-8">
                <Pagination 
                  currentPage={staffPage}
                  totalItems={staff.length}
                  itemsPerPage={itemsPerPage.staff}
                  onPageChange={setStaffPage}
                  colorScheme="emerald"
                />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-3">
                <span className="h-2 w-2 bg-rose-500 rounded-full"></span>
                Ekstrakurikuler
              </h3>
              <Link to="/admin/extracurricular" className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-rose-100 dark:border-rose-500/20 shadow-sm">LIHAT SEMUA</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 h-[280px]">
               {ekskuls.length === 0 ? (
                 <div className="col-span-2 flex items-center justify-center text-slate-300 py-12 italic">Belum ada ekskul.</div>
               ) : (
                 currentEkskul.map(item => (
                   <div key={item.id} className="flex flex-col p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-50 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 bg-white dark:bg-slate-700 shadow-sm rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 transition-all">
                           <Star className="h-5 w-5" />
                        </div>
                        <p className="font-black text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-rose-600 transition-colors uppercase tracking-tight">{item.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">{item.description}</p>
                   </div>
                 ))
               )}
            </div>
            {ekskuls.length > itemsPerPage.ekskul && (
              <div className="mt-8">
                <Pagination 
                  currentPage={ekskulPage}
                  totalItems={ekskuls.length}
                  itemsPerPage={itemsPerPage.ekskul}
                  onPageChange={setEkskulPage}
                  colorScheme="rose"
                />
              </div>
            )}
          </div>
        </div>

        {/* Programs Overhaul */}
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-10">
           <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-4">
                <span className="h-10 w-1.5 bg-indigo-500 rounded-full"></span>
                Program Unggulan
              </h3>
              <Link to="/admin/programs" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-5 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 shadow-sm">LIHAT SEMUA</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-6 text-slate-200 dark:text-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <Target className="h-20 w-20 opacity-30" />
                  <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40 italic">BELUM ADA PROGRAM TERDAFTAR</p>
                </div>
              ) : (
                programs.slice(0, 3).map((prog, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={prog.id} 
                    className="group relative h-full p-8 rounded-[3rem] bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-5 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all cursor-default"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                        <Target className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl uppercase border border-indigo-50 dark:border-indigo-500/10">{prog.startYear}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-black text-xl text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{prog.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-4 leading-loose tracking-tight italic">
                        "{stripHtml(prog.description)}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {(prog.documents || []).length > 0 ? (
                            prog.documents?.slice(0, 3).map((_, i) => (
                              <div key={i} className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                                <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">DOC</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-300 uppercase tracking-widest font-black">No Docs</span>
                          )}
                        </div>
                        {(prog.documents || []).length > 3 && (
                          <span className="text-[10px] font-black text-slate-400">+{prog.documents!.length - 3}</span>
                        )}
                      </div>
                      <Link 
                        to={`/admin/programs?edit=${prog.id}`} 
                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 group/link"
                      >
                        Edit Detail <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/[0.03] rounded-[3rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))
              )}
            </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDeleteNews(deleteId)}
        title="Hapus Berita"
        message="Anda yakin ingin menghapus berita ini secara permanen?"
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  getNews, 
  getAchievements, 
  getStaff, 
  getExtracurriculars,
  NewsItem, 
  Achievement, 
  Staff,
  Extracurricular
} from '../../services/schoolService';
import { Newspaper, Trophy, Users, TrendingUp, Plus, Edit2, Trash2, Search, ExternalLink, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [ekskuls, setEkskuls] = useState<Extracurricular[]>([]);

  useEffect(() => {
    const unsubNews = getNews(setNews);
    const unsubAchievements = getAchievements(setAchievements);
    const unsubStaff = getStaff(setStaff);
    const unsubEkskul = getExtracurriculars(setEkskuls);
    return () => {
      unsubNews();
      unsubAchievements();
      unsubStaff();
      unsubEkskul();
    };
  }, []);

  const stats = [
    { label: 'Berita Terbit', value: news.length.toString(), icon: <Newspaper className="h-6 w-6" />, color: 'bg-blue-500' },
    { label: 'Prestasi Siswa', value: achievements.length.toString(), icon: <Trophy className="h-6 w-6" />, color: 'bg-amber-500' },
    { label: 'Ekstrakurikuler', value: ekskuls.length.toString(), icon: <Palette className="h-6 w-6" />, color: 'bg-rose-500' },
    { label: 'Guru & Staff', value: staff.length.toString(), icon: <Users className="h-6 w-6" />, color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Ringkasan Sistem</h1>
          <p className="text-slate-500 font-medium">Selamat datang di pusat kendali SMPN 18 Banjarmasin.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin/news?action=add"
            className="bg-school-navy text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-school-navy/10 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Berita Baru
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all"
          >
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`h-14 w-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recents Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-3">
              <span className="h-8 w-1 bg-school-red rounded-full"></span>
              Berita Terbaru
            </h3>
            <button className="text-xs font-bold text-school-navy bg-slate-50 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Berita</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {news.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <Newspaper className="h-12 w-12 opacity-20" />
                        <p className="text-sm font-medium">Belum ada berita yang diterbitkan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  news.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm line-clamp-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">{item.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white rounded-lg transition-all shadow-sm"><Edit2 className="h-4 w-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Achievements */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col">
          <h3 className="font-black text-lg text-slate-900 mb-8 flex items-center gap-3">
            <span className="h-8 w-1 bg-amber-500 rounded-full"></span>
            Prestasi Terkini
          </h3>
          <div className="space-y-6 flex-1">
            {achievements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300 pb-12">
                <Trophy className="h-12 w-12 opacity-20" />
                <p className="text-sm font-medium">Belum ada data prestasi.</p>
              </div>
            ) : (
              achievements.slice(0, 4).map((item) => (
                <div key={item.id} className="flex gap-4 items-center p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                  <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.rank} • {item.winner}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-slate-50 text-school-navy text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">Kelola Semua Prestasi</button>
        </div>
      </div>

      <div className="mt-8 bg-school-navy rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10">
          <h4 className="text-2xl font-black mb-2">Butuh Bantuan?</h4>
          <p className="text-blue-200/60 font-medium">Panduan manajemen konten sudah tersedia untuk memudahkan pengelolaan web sekolah.</p>
        </div>
        <button className="relative z-10 bg-white text-school-navy px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all">
          <ExternalLink className="h-4 w-4" />
          Baca Dokumentasi
        </button>
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>
    </div>
  );
}

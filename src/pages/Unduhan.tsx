import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Calendar, Music, BookOpen, Search, Filter } from 'lucide-react';

interface DownloadItem {
  id: string;
  title: string;
  category: 'Akademik' | 'Administrasi' | 'Lainnya';
  date: string;
  size: string;
  type: string;
}

const downloadData: DownloadItem[] = [
  { id: '1', title: 'Kalender Pendidikan 2024/2025', category: 'Akademik', date: '12 Juli 2024', size: '1.2 MB', type: 'PDF' },
  { id: '2', title: 'Formulir Pendaftaran Siswa Baru', category: 'Administrasi', date: '01 Mei 2024', size: '850 KB', type: 'DOCX' },
  { id: '3', title: 'Jadwal Mata Pelajaran Semester Ganjil', category: 'Akademik', date: '15 Juli 2024', size: '450 KB', type: 'PDF' },
  { id: '4', title: 'Tata Tertib Siswa SMPN 18', category: 'Administrasi', date: '10 Juli 2024', size: '2.1 MB', type: 'PDF' },
  { id: '5', title: 'Lirik Lagu Mars SMPN 18 Banjarmasin', category: 'Lainnya', date: '05 Jan 2024', size: '150 KB', type: 'PDF' },
  { id: '6', title: 'Modul Pembelajaran Mandiri Kelas 7', category: 'Akademik', date: '20 Juli 2024', size: '5.4 MB', type: 'PDF' },
  { id: '7', title: 'Surat Izin Orang Tua (Template)', category: 'Administrasi', date: '12 Feb 2024', size: '120 KB', type: 'DOCX' },
];

export default function Unduhan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Semua' | 'Akademik' | 'Administrasi' | 'Lainnya'>('Semua');

  const filteredItems = downloadData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-school-yellow/10 text-school-yellow rounded-full mb-6">
              <Download className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Pusat Unduhan</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white mb-6 leading-tight">
              ARSIP & <span className="text-school-yellow uppercase italic">DOKUMEN</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
              Unduh formulir, materi pembelajaran, dan informasi resmi lainnya dari SMPN 18 Banjarmasin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="px-6 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-school-yellow transition-all text-slate-700 dark:text-slate-300 font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1 md:pb-0">
              {['Semua', 'Akademik', 'Administrasi', 'Lainnya'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-school-navy text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'Semua' ? <Filter className="h-4 w-4" /> : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-school-navy/10 dark:hover:shadow-none transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-school-yellow/10 transition-colors duration-500">
                      {item.category === 'Akademik' && <BookOpen className="h-7 w-7 text-school-navy dark:text-slate-300 group-hover:text-school-yellow" />}
                      {item.category === 'Administrasi' && <FileText className="h-7 w-7 text-school-navy dark:text-slate-300 group-hover:text-school-yellow" />}
                      {item.category === 'Lainnya' && <Calendar className="h-7 w-7 text-school-navy dark:text-slate-300 group-hover:text-school-yellow" />}
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-school-navy dark:text-white mb-2 leading-tight group-hover:text-school-yellow transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-bold mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {item.size}
                    </div>
                  </div>

                  <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-school-navy dark:text-slate-300 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 group-hover:bg-school-navy group-hover:text-white transition-all shadow-sm">
                    <Download className="h-4 w-4" />
                    Unduh Sekarang
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
              <Search className="h-16 w-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
              <p className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">Dokumen tidak ditemukan</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

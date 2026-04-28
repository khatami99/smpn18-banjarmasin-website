import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNews, NewsItem } from '../../services/schoolService';

export default function BeritaList() {
  const [berita, setBerita] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  useEffect(() => {
    const unsub = getNews(setBerita);
    setLoading(false);
    return unsub;
  }, []);

  const filteredBerita = berita.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-16">
          <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Warta Sekolah</span>
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-school-navy dark:text-white">Kabar Terbaru <br /> SMPN 18 Banjarmasin</h1>
          <div className="flex flex-wrap gap-4">
             {['Semua', 'Akademik', 'Kesiswaan', 'Pengumuman'].map(tag => (
               <button 
                key={tag} 
                onClick={() => setCategoryFilter(tag)}
                className={`px-6 py-2 rounded-full border transition-all text-xs font-bold ${categoryFilter === tag ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy border-school-navy dark:border-school-yellow' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-school-navy dark:hover:border-school-yellow'}`}
               >
                 {tag}
               </button>
             ))}
          </div>
        </header>

        <div className="mb-10 block md:hidden">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-3 border border-slate-200 dark:border-slate-700">
               <Search className="h-4 w-4 text-slate-400 mr-2" />
               <input 
                type="text" 
                placeholder="Cari berita..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs font-bold outline-none flex-1 text-school-navy dark:text-white" 
              />
            </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-300">
             <Loader2 className="h-8 w-8 animate-spin text-school-red" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBerita.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  className="group cursor-pointer"
                >
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden mb-6 border border-slate-200 dark:border-slate-700 relative shadow-sm group-hover:shadow-xl transition-all">
                    <img 
                      src={item.image || `https://picsum.photos/seed/${item.id}/800/600`} 
                      alt="News" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute top-4 left-4">
                        <span className="bg-school-navy dark:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-school-yellow shadow-lg">
                          {item.category}
                        </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-school-slate dark:text-slate-400 uppercase tracking-widest mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-school-navy dark:text-white group-hover:text-school-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm text-school-navy/60 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredBerita.length === 0 && (
          <div className="text-center py-32 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
             <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Berita tidak ditemukan</h3>
             <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Coba gunakan kata kunci atau kategori yang lain.</p>
             <button 
               onClick={() => { setSearchQuery(''); setCategoryFilter('Semua'); }}
               className="mt-8 text-xs font-black uppercase tracking-widest text-school-red dark:text-school-yellow hover:underline"
             >
               Reset Pencarian
             </button>
          </div>
        )}
      </main>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, Search, Loader2, X, Maximize2, Calendar, Tag } from 'lucide-react';
import { getGallery, GalleryItem } from '../../services/schoolService';
import Pagination from '../../components/admin/Pagination';

export default function GaleriPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const unsub = getGallery((data) => {
      setGallery(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = ['Semua', ...new Set(gallery.map(item => item.category))];

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedGallery = filteredGallery.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <section className="mb-16 text-center">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-school-red font-black uppercase tracking-[0.4em] text-[10px] mb-4 block"
          >
            Lensa Kegiatan
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-school-navy dark:text-white mb-6 tracking-tight"
          >
            Galeri ALAMANDA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Dokumentasi setiap momen berharga, prestasi, dan keceriaan seluruh civitas akademika SMP Negeri 18 Banjarmasin dalam mewujudkan Generasi Alamanda.
          </motion.p>
        </section>

        {/* Filters & Search */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-black/5 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-lg shadow-school-navy/20 dark:shadow-school-yellow/10' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Cari foto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-school-yellow dark:text-white text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="h-10 w-10 text-school-navy animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Galeri...</p>
          </div>
        ) : filteredGallery.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedGallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index % itemsPerPage) * 0.05 }}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                >
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1523050853064-85a1a1b5c477?q=80&w=2070&auto=format&fit=crop'} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-school-navy/80 via-school-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 text-left">
                    <span className="text-[10px] font-black text-school-yellow uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Tag className="h-3 w-3" /> {item.category}
                    </span>
                    <h3 className="text-white font-black text-lg leading-tight mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold text-white/50">{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 'Momen Sekolah'}</span>
                       <Maximize2 className="h-4 w-4 text-white p-1 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredGallery.length > itemsPerPage && (
              <div className="mt-16">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={filteredGallery.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  colorScheme="navy"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-50 dark:border-slate-800">
             <ImageIcon className="h-16 w-16 text-slate-100 mx-auto mb-6" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada foto ditemukan</p>
          </div>
        )}
      </main>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-slate-950/95 backdrop-blur-xl">
             <motion.button 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               onClick={() => setSelectedPhoto(null)}
               className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
             >
                <X className="h-8 w-8" />
             </motion.button>
             
             <motion.div 
               layoutId={selectedPhoto.id}
               className="max-w-6xl w-full flex flex-col md:flex-row bg-black rounded-[4rem] overflow-hidden shadow-2xl relative"
             >
                <div className="flex-[2] bg-slate-900 flex items-center justify-center p-4">
                   <img 
                    src={selectedPhoto.image} 
                    alt={selectedPhoto.title} 
                    className="max-h-[70vh] object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                   />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900 p-12 flex flex-col justify-center text-left">
                   <span className="text-[10px] font-black text-school-red dark:text-school-yellow uppercase tracking-widest mb-4 inline-block">{selectedPhoto.category}</span>
                   <h2 className="text-3xl font-black text-school-navy dark:text-white leading-tight mb-6">{selectedPhoto.title}</h2>
                   
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-school-navy dark:text-slate-300">
                            <Calendar className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diunggah Pada</p>
                            <p className="font-bold text-school-navy dark:text-white">{selectedPhoto.createdAt ? new Date(selectedPhoto.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Momen Sekolah'}</p>
                         </div>
                      </div>
                      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                         <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                           "Setiap foto adalah saksi bisu dari perjalanan panjang SMPN 18 Banjarmasin dalam membina karakter dan mengasah bakat generasi penerus bangsa."
                         </p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Image as ImageIcon, Plus, Trash2, Save, X, Loader2, Camera, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from 'sonner';

interface GalleryItem {
  id?: string;
  title: string;
  image: string;
  category: string;
  createdAt?: any;
}

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<GalleryItem>({
    title: '',
    image: '',
    category: 'Kegiatan Siswa'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1523050853064-85a1a1b5c477?q=80&w=2070&auto=format&fit=crop',
        createdAt: Timestamp.now()
      });
      toast.success("Berhasil menambah foto galeri!");
      setShowModal(false);
      setFormData({ title: '', image: '', category: 'Kegiatan Siswa' });
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan foto. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success("Foto berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus foto.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 transition-colors duration-500">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Galeri Sekolah</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Kelola foto-foto kegiatan dan fasilitas sekolah.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/10 dark:shadow-school-yellow/20"
        >
          <Plus className="h-4 w-4" />
          Tambah Foto
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 text-school-red animate-spin" />
          <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Memuat Galeri...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group relative"
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     onClick={() => item.id && setDeleteId(item.id)}
                     className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-red-500 transition-colors"
                   >
                     <Trash2 className="h-6 w-6" />
                   </button>
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-black uppercase text-school-red dark:text-red-400 tracking-widest block mb-2">{item.category}</span>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</h4>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
               <p className="text-slate-400 dark:text-slate-600 font-bold uppercase text-xs tracking-widest">Belum ada foto yang diunggah.</p>
            </div>
          )}
        </div>
      )}

      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          colorScheme="rose"
        />
      )}

      {/* Modal Tambah */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-school-navy/80 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-transparent dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                   <Camera className="h-6 w-6 text-school-red dark:text-red-400" />
                   Tambah Foto Galeri
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Keterangan Foto</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 focus:border-school-navy dark:focus:border-slate-400 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="Contoh: Upacara Bendera Senin"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Upload Foto</label>
                  <div className="relative h-48 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden group hover:border-school-navy dark:hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-4">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            type="button"
                            onClick={() => document.getElementById('gallery-upload')?.click()}
                            className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/40 transition-all border border-white/30"
                          >
                            <ImageIcon className="h-5 w-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, image: ''})}
                            className="bg-red-500/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-red-500/40 transition-all border border-white/20"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                        className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform"
                      >
                        <div className="h-12 w-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm text-slate-400 dark:text-slate-500">
                          <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Pilih Foto</span>
                      </button>
                    )}
                    <input 
                      id="gallery-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.src = reader.result as string;
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const MAX_SIZE = 1200;

                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }

                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                              setFormData({...formData, image: compressedDataUrl});
                            };
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Kategori</label>
                  <div className="relative">
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 focus:border-school-navy dark:focus:border-slate-400 outline-none transition-all font-bold appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                    >
                      <option>Kegiatan Siswa</option>
                      <option>Fasilitas Sekolah</option>
                      <option>Prestasi</option>
                      <option>Umum</option>
                    </select>
                    <Filter className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Foto
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Hapus Foto Galeri"
        message="Hapus foto ini secara permanen?"
      />
    </div>
  );
}

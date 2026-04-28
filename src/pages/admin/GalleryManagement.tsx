import React, { useState, useEffect } from 'react';
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
        createdAt: Timestamp.now()
      });
      alert("Berhasil menambah foto galeri!");
      setShowModal(false);
      setFormData({ title: '', image: '', category: 'Kegiatan Siswa' });
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan foto. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus foto ini?")) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      alert("Gagal menghapus foto.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Galeri Sekolah</h1>
          <p className="text-slate-500 font-medium">Kelola foto-foto kegiatan dan fasilitas sekolah.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-school-navy text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/10"
        >
          <Plus className="h-4 w-4" />
          Tambah Foto
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 text-school-red animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Memuat Galeri...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id} 
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group relative"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     onClick={() => item.id && handleDelete(item.id)}
                     className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-red-500 transition-colors"
                   >
                     <Trash2 className="h-6 w-6" />
                   </button>
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-black uppercase text-school-red tracking-widest block mb-2">{item.category}</span>
                <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada foto yang diunggah.</p>
            </div>
          )}
        </div>
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
              className="absolute inset-0 bg-school-navy/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                   <Camera className="h-6 w-6 text-school-red" />
                   Tambah Foto Galeri
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Keterangan Foto</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-school-navy outline-none transition-all font-medium"
                    placeholder="Contoh: Upacara Bendera Senin"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">URL Gambar</label>
                  <input 
                    type="url" 
                    required
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-school-navy outline-none transition-all font-medium"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-school-navy outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option>Kegiatan Siswa</option>
                    <option>Fasilitas Sekolah</option>
                    <option>Prestasi</option>
                    <option>Umum</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] bg-school-red text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

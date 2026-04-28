import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Newspaper, Plus, Trash2, Edit2, Search, Filter, Calendar, Clock, Image as ImageIcon, Save, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsItem {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string; // Added field
  createdAt?: any;
}

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsItem>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Akademik',
    image: 'https://picsum.photos/seed/school/800/600',
    date: new Date().toISOString().split('T')[0] // Default today
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setShowModal(true);
    }

    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image: formData.image,
        date: formData.date,
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'news', editingItem.id), payload);
        alert("Berhasil memperbarui berita!");
      } else {
        payload.createdAt = Timestamp.now();
        if (auth.currentUser?.uid) {
           payload.authorId = auth.currentUser.uid;
        }
        await addDoc(collection(db, 'news'), payload);
        alert("Berhasil menambah berita baru!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan berita. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus berita ini permanen?")) return;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      alert("Gagal menghapus berita.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Akademik',
      image: 'https://picsum.photos/seed/school/800/600',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manajemen Berita</h1>
          <p className="text-slate-500 font-medium">Publikasikan kegiatan dan informasi terbaru sekolah.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-school-navy text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20"
        >
          <Plus className="h-5 w-5" />
          Tulis Berita Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="bg-school-navy text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-school-yellow">{item.category}</span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  <Calendar className="h-3 w-3 text-school-red" />
                  <span>{item.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 leading-tight flex-1">{item.title}</h3>
                
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => openEdit(item)}
                    className="flex-1 bg-slate-50 text-slate-600 h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-school-navy hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id!)}
                    className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Berita' : 'Tulis Berita Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField 
                       label="Judul Utama" 
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})} 
                       placeholder="Contoh: SMPN 18 Juara Umum Lomba Adiwiyata"
                    />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                       <select 
                         value={formData.category} 
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all"
                       >
                         <option value="Akademik">Akademik</option>
                         <option value="Kesiswaan">Kesiswaan</option>
                         <option value="Pengumuman">Pengumuman</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <InputField 
                       label="URL Gambar Cover" 
                       value={formData.image} 
                       onChange={e => setFormData({...formData, image: e.target.value})} 
                       placeholder="https://..."
                    />
                    <InputField 
                       label="Tanggal Berita" 
                       type="date"
                       value={formData.date} 
                       onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                    <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                       <img src={formData.image} alt="Preview" className="h-full w-full object-contain opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-school-red">Ringkasan (Excerpt)</label>
                   <textarea 
                     value={formData.excerpt} 
                     onChange={e => setFormData({...formData, excerpt: e.target.value})}
                     rows={2}
                     placeholder="Ringkasan singkat untuk tampilan kartu berita..."
                     className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all resize-none"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-school-red">Konten Berita Lengkap</label>
                   <textarea 
                     value={formData.content} 
                     onChange={e => setFormData({...formData, content: e.target.value})}
                     rows={10}
                     placeholder="Tuliskan berita lengkap di sini..."
                     className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all resize-none leading-relaxed"
                   />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs">Batal</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-school-navy text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20 disabled:opacity-50"
                 >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (e: any) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

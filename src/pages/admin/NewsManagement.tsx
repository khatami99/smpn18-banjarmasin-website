import React, { useState, useEffect, useMemo } from 'react';
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
import { Newspaper, Plus, Trash2, Edit2, Search, Filter, Calendar, Clock, Image as ImageIcon, Save, X, Loader2, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import PromptDialog from '../../components/admin/PromptDialog';
import { toast } from 'sonner';

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
    image: '',
    date: new Date().toISOString().split('T')[0] // Default today
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const location = useLocation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return news.slice(startIndex, startIndex + itemsPerPage);
  }, [news, currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setShowModal(true);
    }

    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      setNews(items);
      
      // Handle edit param after data is loaded
      const editId = params.get('edit');
      if (editId) {
        const itemToEdit = items.find(n => n.id === editId);
        if (itemToEdit) {
          openEdit(itemToEdit);
        }
      }
      
      setLoading(false);
    });
    return unsub;
  }, [location.search]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.image) {
      toast.error("Harap pilih gambar cover terlebih dahulu.");
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop',
        date: formData.date,
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'news', editingItem.id), payload);
        toast.success("Berhasil memperbarui berita!");
      } else {
        payload.createdAt = Timestamp.now();
        if (auth.currentUser?.uid) {
           payload.authorId = auth.currentUser.uid;
        }
        await addDoc(collection(db, 'news'), payload);
        toast.success("Berhasil menambah berita baru!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan berita. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      toast.success("Berita berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus berita.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Akademik',
      image: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  const handleInsertImage = (url: string) => {
    if (url) {
      const selection = document.querySelector('.ql-editor');
      if (selection) {
        setFormData(prev => ({
          ...prev,
          content: prev.content + `<p><img src="${url}" style="max-width: 100%; border-radius: 1rem;" /></p>`
        }));
      }
    }
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 transition-colors duration-500">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Manajemen Berita</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Publikasikan kegiatan dan informasi terbaru sekolah.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10"
        >
          <Plus className="h-5 w-5" />
          Tulis Berita Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-700">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentNews.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all"
            >
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-school-yellow dark:border-school-navy">{item.category}</span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  <Calendar className="h-3 w-3 text-school-red" />
                  <span>{item.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight flex-1">{item.title}</h3>
                
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => openEdit(item)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-school-navy dark:hover:bg-school-yellow dark:hover:text-school-navy hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(item.id!)}
                    className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalItems={news.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          colorScheme="navy"
        />
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingItem ? 'Edit Berita' : 'Tulis Berita Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X className="h-6 w-6" /></button>
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
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                       <div className="relative">
                         <select 
                           value={formData.category} 
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all appearance-none relative"
                         >
                           <option value="Akademik">Akademik</option>
                           <option value="Kesiswaan">Kesiswaan</option>
                           <option value="Pengumuman">Pengumuman</option>
                         </select>
                         <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Upload Gambar Cover</label>
                       <div className="relative h-48 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden group hover:border-school-navy dark:hover:border-school-yellow transition-all flex flex-col items-center justify-center gap-4">
                          {formData.image ? (
                            <>
                              <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button 
                                  type="button"
                                  onClick={() => document.getElementById('file-upload')?.click()}
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
                              onClick={() => document.getElementById('file-upload')?.click()}
                              className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform"
                            >
                              <div className="h-12 w-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm text-slate-400 dark:text-slate-500">
                                <Plus className="h-6 w-6" />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pilih Gambar</span>
                            </button>
                          )}
                          <input 
                            id="file-upload"
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
                                    // Inisialisasi Canvas untuk kompresi
                                    const canvas = document.createElement('canvas');
                                    let width = img.width;
                                    let height = img.height;

                                    // Batasi resolusi maksimal (misal 1200px) agar file tidak raksasa
                                    const MAX_WIDTH = 1200;
                                    const MAX_HEIGHT = 1200;

                                    if (width > height) {
                                      if (width > MAX_WIDTH) {
                                        height *= MAX_WIDTH / width;
                                        width = MAX_WIDTH;
                                      }
                                    } else {
                                      if (height > MAX_HEIGHT) {
                                        width *= MAX_HEIGHT / height;
                                        height = MAX_HEIGHT;
                                      }
                                    }

                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    ctx?.drawImage(img, 0, 0, width, height);

                                    // Kompres kualitas ke 0.7 (70%) - biasanya sudah sangat cukup dan jauh lebih kecil
                                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                    
                                    // Cek apakah hasil akhir masih terlalu besar (opsional, 70% di 1200px biasanya < 200kb)
                                    setFormData({...formData, image: compressedDataUrl});
                                  };
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                       </div>
                    </div>
                    <InputField 
                       label="Tanggal Berita" 
                       type="date"
                       value={formData.date} 
                       onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 text-school-red">Ringkasan (Excerpt)</label>
                   <textarea 
                     value={formData.excerpt} 
                     onChange={e => setFormData({...formData, excerpt: e.target.value})}
                     rows={2}
                     placeholder="Ringkasan singkat untuk tampilan kartu berita..."
                     className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all resize-none"
                   />
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-school-red">Konten Berita Lengkap</label>
                      <button 
                        type="button"
                        onClick={() => setShowPrompt(true)}
                        className="text-[10px] font-black text-blue-500 hover:text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5"
                      >
                        <LinkIcon className="h-3 w-3" /> Sisipkan Gambar via URL
                      </button>
                   </div>
                   <div className="quill-container dark-quill">
                      <ReactQuill 
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({...formData, content})}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Tuliskan berita lengkap di sini..."
                        className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-200"
                      />
                   </div>
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-2">* Gunakan fitur sisipkan gambar via URL untuk menjaga kecepatan website.</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all uppercase tracking-widest text-xs">Batal</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
                 >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Hapus Berita"
        message="Apakah Anda yakin ingin menghapus berita ini secara permanen? Tindakan ini tidak dapat dibatalkan."
      />

      <PromptDialog 
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onConfirm={handleInsertImage}
        title="Sisipkan Gambar"
        placeholder="Masukkan URL gambar (https://...)"
      />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (e: any) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

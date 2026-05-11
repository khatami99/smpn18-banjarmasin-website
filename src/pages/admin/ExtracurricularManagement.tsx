import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit2, Save, X, Loader2, Star, Users, Palette, Trophy, Music, Camera, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Extracurricular } from '../../services/schoolService';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from 'sonner';

const ICON_OPTIONS = [
  { name: 'Users', icon: <Users className="h-4 w-4" /> },
  { name: 'Palette', icon: <Palette className="h-4 w-4" /> },
  { name: 'Star', icon: <Star className="h-4 w-4" /> },
  { name: 'Trophy', icon: <Trophy className="h-4 w-4" /> },
  { name: 'Music', icon: <Music className="h-4 w-4" /> },
  { name: 'Camera', icon: <Camera className="h-4 w-4" /> },
  { name: 'Info', icon: <Info className="h-4 w-4" /> },
];

export default function ExtracurricularManagement() {
  const [items, setItems] = useState<Extracurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Extracurricular | null>(null);
  const [formData, setFormData] = useState<Extracurricular>({
    name: '',
    description: '',
    category: 'Pilihan',
    mentor: '',
    schedule: '',
    icon: 'Star',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(collection(db, 'extracurriculars'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Extracurricular)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop',
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'extracurriculars', editingItem.id), payload);
        toast.success("Berhasil memperbarui data ekskul!");
      } else {
        await addDoc(collection(db, 'extracurriculars'), {
          ...payload,
          createdAt: Timestamp.now()
        });
        toast.success("Berhasil menambah data ekskul!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data ekskul. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'extracurriculars', id));
      toast.success("Ekskul berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Pilihan',
      mentor: '',
      schedule: '',
      icon: 'Star',
      image: ''
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 transition-colors duration-500">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Manajemen Ekstrakurikuler</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Kelola daftar klub dan kegiatan pengembangan diri siswa.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10"
        >
          <Plus className="h-5 w-5" />
          Tambah Ekskul
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-700">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 group hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-school-navy dark:text-school-yellow group-hover:bg-school-navy dark:group-hover:bg-school-yellow group-hover:text-white dark:group-hover:text-school-navy transition-all">
                   {ICON_OPTIONS.find(i => i.name === item.icon)?.icon || <Star className="h-6 w-6" />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-school-navy dark:hover:text-school-yellow"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(item.id!)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              
              <span className="text-[10px] font-black uppercase text-school-navy dark:text-school-yellow tracking-widest mb-1 block">{item.category}</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{item.description}</p>
              
              <div className="space-y-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Users className="h-3 w-3" /> Mentor: {item.mentor || '-'}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Star className="h-3 w-3" /> Jadwal: {item.schedule || '-'}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          colorScheme="navy"
        />
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingItem ? 'Edit Ekskul' : 'Tambah Ekskul Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField label="Nama Ekstrakurikuler" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                       <div className="relative">
                         <select 
                           required
                           value={formData.category} 
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-slate-200 outline-none focus:border-school-navy transition-all shadow-inner appearance-none relative text-sm"
                         >
                           <option value="Wajib">Wajib</option>
                           <option value="Pilihan">Pilihan</option>
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Ikon</label>
                       <div className="flex flex-wrap gap-2">
                          {ICON_OPTIONS.map(opt => (
                            <button 
                              key={opt.name}
                              type="button"
                              onClick={() => setFormData({...formData, icon: opt.name})}
                              className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all ${formData.icon === opt.name ? 'border-school-navy bg-school-navy/5 dark:bg-school-yellow/20 text-school-navy dark:text-school-yellow' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                            >
                              {opt.icon}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <InputField label="Pembimbing / Mentor" value={formData.mentor || ''} onChange={e => setFormData({...formData, mentor: e.target.value})} />
                    <InputField label="Jadwal Latihan" value={formData.schedule || ''} onChange={e => setFormData({...formData, schedule: e.target.value})} placeholder="Spt: Sabtu, 14:00 - 16:00" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi Kegiatan</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        required
                        className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-900 dark:text-slate-200 outline-none focus:border-school-navy transition-all resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Foto Sampul Ekskul</label>
                      <div className="relative h-40 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden group hover:border-school-navy dark:hover:border-school-yellow transition-all flex flex-col items-center justify-center">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button 
                                 type="button" 
                                 onClick={() => document.getElementById('ekskul-upload')?.click()}
                                 className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/40 border border-white/20"
                               >
                                 <Camera className="h-5 w-5" />
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => setFormData({...formData, image: ''})}
                                 className="bg-red-500/20 backdrop-blur-md p-2 rounded-xl text-white hover:bg-red-500/40 border border-white/10"
                               >
                                 <Trash2 className="h-5 w-5" />
                               </button>
                            </div>
                          </>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => document.getElementById('ekskul-upload')?.click()}
                            className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform"
                          >
                            <div className="h-10 w-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center text-slate-300 dark:text-slate-500">
                               <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Unggah Foto</span>
                          </button>
                        )}
                        <input 
                          id="ekskul-upload"
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
                                  const MAX_SIZE = 1000;

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
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all text-sm uppercase tracking-widest">Batal</button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Data
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
        title="Hapus Ekstrakurikuler"
        message="Apakah Anda yakin ingin menghapus ekstrakurikuler ini?"
      />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text"
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-slate-200 outline-none focus:border-school-navy transition-all shadow-inner text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

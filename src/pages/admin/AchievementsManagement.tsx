import React, { useState, useEffect, useMemo } from 'react';
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
import { db } from '../../lib/firebase';
import { Trophy, Plus, Trash2, Edit2, Save, X, Loader2, Star, Award, Calendar, Camera, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from 'sonner';

interface AchievementItem {
  id?: string;
  title: string;
  winner: string;
  rank: string;
  year: string;
  category: string;
  image?: string;
  createdAt?: any;
}

export default function AchievementsManagement() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
  const [formData, setFormData] = useState<AchievementItem>({
    title: '',
    winner: '',
    rank: '',
    year: new Date().getFullYear().toString(),
    category: 'Akademik',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const location = useLocation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentAchievements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return achievements.slice(startIndex, startIndex + itemsPerPage);
  }, [achievements, currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = query(collection(db, 'achievements'), orderBy('year', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AchievementItem));
      setAchievements(items);

      // Handle edit param
      const editId = params.get('edit');
      if (editId) {
        const itemToEdit = items.find(a => a.id === editId);
        if (itemToEdit) {
          setEditingItem(itemToEdit);
          setFormData({ ...itemToEdit });
          setShowModal(true);
        }
      }

      setLoading(false);
    });
    return unsub;
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        winner: formData.winner,
        rank: formData.rank,
        year: formData.year,
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?q=80&w=2072&auto=format&fit=crop',
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'achievements', editingItem.id), payload);
        toast.success("Berhasil memperbarui data prestasi!");
      } else {
        await addDoc(collection(db, 'achievements'), {
          ...payload,
          createdAt: Timestamp.now()
        });
        toast.success("Berhasil menambah data prestasi!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan prestasi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'achievements', id));
      toast.success("Data prestasi berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      winner: '',
      rank: '',
      year: new Date().getFullYear().toString(),
      category: 'Akademik',
      image: ''
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 transition-colors duration-500">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Data Prestasi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Dokumentasi kebanggaan dan sertifikat prestasi siswa.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 dark:hover:bg-amber-300 transition-all shadow-xl shadow-amber-500/20 dark:shadow-amber-400/10"
        >
          <Plus className="h-5 w-5" />
          Input Prestasi Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-700">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAchievements.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all outline outline-1 outline-transparent hover:outline-amber-500/10 focus-within:outline-amber-500/10"
            >
              <div className="h-16 w-16 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-amber-100 dark:ring-amber-500/20">
                <Trophy className="h-8 w-8" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] italic">{item.year}</span>
                   <div className="h-px w-8 bg-slate-100 dark:bg-slate-800"></div>
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.category}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{item.title}</h3>
                <p className="text-[11px] font-black text-school-red dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Star className="h-3 w-3 text-amber-500" /> {item.rank}
                </p>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Pemenang: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.winner}</span></p>
              </div>

              <div className="flex gap-2 mt-10">
                <button 
                  onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-white dark:hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button 
                  onClick={() => setDeleteId(item.id!)}
                  className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalItems={achievements.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          colorScheme="amber"
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
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingItem ? 'Edit Prestasi' : 'Input Prestasi Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="space-y-6">
                <InputField 
                   label="Nama Perlombaan / Acara" 
                   value={formData.title} 
                   onChange={e => setFormData({...formData, title: e.target.value})} 
                   placeholder="Contoh: Juara 1 Karate Tingkat Kota"
                />
                
                <div className="grid grid-cols-2 gap-6">
                  <InputField 
                    label="Pemenang (Siswa/Tim)" 
                    value={formData.winner} 
                    onChange={e => setFormData({...formData, winner: e.target.value})} 
                    placeholder="Contoh: Andi Wijaya / Tim Basket"
                  />
                  <InputField 
                    label="Peringkat / Medali" 
                    value={formData.rank} 
                    onChange={e => setFormData({...formData, rank: e.target.value})} 
                    placeholder="Contoh: Juara 1 / Emas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <InputField 
                    label="Tahun" 
                    value={formData.year} 
                    onChange={e => setFormData({...formData, year: e.target.value})} 
                    placeholder="2026"
                  />
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                     <div className="relative">
                       <select 
                         value={formData.category} 
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner appearance-none relative"
                       >
                         <option value="Akademik">Akademik</option>
                         <option value="Olahraga">Olahraga</option>
                         <option value="Seni">Seni</option>
                         <option value="Organisasi">Organisasi</option>
                       </select>
                       <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Foto Bukti / Dokumentasi</label>
                  <div className="relative h-48 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem] overflow-hidden group hover:border-amber-500 dark:hover:border-amber-400 transition-all flex flex-col items-center justify-center">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                             type="button" 
                             onClick={() => document.getElementById('achievement-upload')?.click()}
                             className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/40 border border-white/20"
                           >
                             <Camera className="h-6 w-6" />
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, image: ''})}
                             className="bg-red-500/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-red-500/40 border border-white/10"
                           >
                             <Trash2 className="h-6 w-6" />
                           </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => document.getElementById('achievement-upload')?.click()}
                        className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform"
                      >
                        <div className="h-12 w-12 bg-white dark:bg-slate-700 rounded-[1.25rem] shadow-sm flex items-center justify-center text-slate-300 dark:text-slate-500">
                           <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Unggah Dokumentasi</span>
                      </button>
                    )}
                    <input 
                      id="achievement-upload"
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
              </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all uppercase tracking-widest text-xs">Batal</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-amber-600 dark:hover:bg-amber-300 transition-all shadow-xl shadow-amber-500/20 dark:shadow-amber-400/10 disabled:opacity-50"
                 >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Catat Prestasi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Hapus Prestasi"
        message="Apakah Anda yakin ingin menghapus data prestasi ini?"
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
        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

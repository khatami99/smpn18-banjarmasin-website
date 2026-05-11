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
import { Users, Plus, Trash2, Edit2, Save, X, Loader2, GraduationCap, Image as ImageIcon, Camera, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from 'sonner';

interface StaffItem {
  id?: string;
  name: string;
  role: string;
  subject?: string;
  image?: string;
  order: number;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StaffItem | null>(null);
  const [formData, setFormData] = useState<StaffItem>({
    name: '',
    role: 'Guru',
    subject: '',
    image: '',
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const currentStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return staff.slice(startIndex, startIndex + itemsPerPage);
  }, [staff, currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(collection(db, 'staff'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffItem)));
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
        image: formData.image || `https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=600&h=800&auto=format&fit=crop`,
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'staff', editingItem.id), payload);
        toast.success("Berhasil memperbarui data staff!");
      } else {
        await addDoc(collection(db, 'staff'), {
          ...payload,
          order: staff.length,
          createdAt: Timestamp.now()
        });
        toast.success("Berhasil menambah data staff!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data staff. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'staff', id));
      toast.success("Data staff berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Guru',
      subject: '',
      image: '',
      order: staff.length
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 transition-colors duration-500">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Direktori Guru & Staff</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Kelola daftar pengajar dan personil sekolah.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10"
        >
          <Plus className="h-5 w-5" />
          Tambah Personil Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-700">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentStaff.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all text-center p-8"
            >
              <div className="relative mx-auto mb-6">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=600&h=800&auto=format&fit=crop`} alt={item.name} className="w-full h-full object-cover opacity-50" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy rounded-xl flex items-center justify-center shadow-lg">
                   <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-tight">{item.name}</h3>
                <p className="text-[10px] font-black text-school-navy dark:text-school-yellow uppercase tracking-widest mb-3">{item.role}</p>
                {item.subject && (
                   <p className="inline-block px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-700 italic">
                     {item.subject}
                   </p>
                )}
              </div>

              <div className="flex gap-2 mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-10 rounded-xl flex items-center justify-center gap-2 hover:bg-school-navy dark:hover:bg-school-yellow hover:text-white dark:hover:text-school-navy transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button 
                  onClick={() => setDeleteId(item.id!)}
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination 
          currentPage={currentPage}
          totalItems={staff.length}
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
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingItem ? 'Edit Data Personil' : 'Tambah Personil Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField 
                       label="Nama Lengkap & Gelar" 
                       value={formData.name} 
                       onChange={e => setFormData({...formData, name: e.target.value})} 
                       placeholder="Contoh: Dra. H. Siti Aminah, M.Pd"
                       required
                    />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Jabatan / Peran</label>
                       <div className="relative">
                         <select 
                           required
                           value={formData.role} 
                           onChange={e => setFormData({...formData, role: e.target.value})}
                           className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all shadow-inner appearance-none relative"
                         >
                           <option value="Guru">Guru</option>
                           <option value="Tata Usaha">Tata Usaha</option>
                           <option value="Tenaga Kebersihan">Tenaga Kebersihan</option>
                           <option value="Tenaga Keamanan">Tenaga Keamanan</option>
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <InputField 
                       label="Mata Pelajaran (Opsional)" 
                       value={formData.subject || ''} 
                       onChange={e => setFormData({...formData, subject: e.target.value})} 
                       placeholder="Contoh: Matematika, IPA"
                    />
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Foto Profil</label>
                      <div className="relative h-40 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden group hover:border-emerald-500 dark:hover:border-emerald-400 transition-all flex flex-col items-center justify-center">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button 
                                 type="button" 
                                 onClick={() => document.getElementById('staff-upload')?.click()}
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
                            onClick={() => document.getElementById('staff-upload')?.click()}
                            className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform"
                          >
                            <div className="h-10 w-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center text-slate-300 dark:text-slate-500">
                               <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Unggah Foto</span>
                          </button>
                        )}
                        <input 
                          id="staff-upload"
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
                                  const MAX_SIZE = 800; // Ukuran lebih kecil untuk avatar

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
                                  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
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

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-between border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-700 shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                         {formData.image && <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Preview Kartu</p>
                         <p className="font-bold text-slate-900 dark:text-white text-sm">{formData.name || 'Nama Belum Diisi'}</p>
                      </div>
                   </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all uppercase tracking-widest text-xs">Batal</button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editingItem ? 'Simpan' : 'Tambah'}
                      </button>
                    </div>
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
        title="Hapus Data Personil"
        message="Hapus data guru/staff ini?"
      />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required = false, type = "text" }: { label: string, value: string, onChange: (e: any) => void, placeholder?: string, required?: boolean, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

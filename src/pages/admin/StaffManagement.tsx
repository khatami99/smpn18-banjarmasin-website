import React, { useState, useEffect } from 'react';
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
import { Users, Plus, Trash2, Edit2, Save, X, Loader2, GraduationCap, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    role: 'Guru Mata Pelajaran',
    subject: '',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'staff', editingItem.id), payload);
        alert("Berhasil memperbarui data staff!");
      } else {
        await addDoc(collection(db, 'staff'), {
          ...payload,
          order: staff.length,
          createdAt: Timestamp.now()
        });
        alert("Berhasil menambah data staff!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data staff. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus data staff ini?")) return;
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Guru Mata Pelajaran',
      subject: '',
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      order: staff.length
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Direktori Guru & Staff</h1>
          <p className="text-slate-500 font-medium tracking-tight">Kelola daftar pengajar dan personil sekolah.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
        >
          <Plus className="h-5 w-5" />
          Tambah Personil Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all text-center p-8"
            >
              <div className="relative mx-auto mb-6">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                   <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{item.name}</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">{item.role}</p>
                {item.subject && (
                   <p className="inline-block px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-100 italic">
                     {item.subject}
                   </p>
                )}
              </div>

              <div className="flex gap-2 mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }}
                  className="flex-1 bg-slate-50 text-slate-600 h-10 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id!)}
                  className="w-10 h-10 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-500 transition-all font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Data Personil' : 'Tambah Personil Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField 
                       label="Nama Lengkap & Gelar" 
                       value={formData.name} 
                       onChange={e => setFormData({...formData, name: e.target.value})} 
                       placeholder="Contoh: Dra. H. Siti Aminah, M.Pd"
                       required
                    />
                    <InputField 
                       label="Jabatan / Peran" 
                       value={formData.role} 
                       onChange={e => setFormData({...formData, role: e.target.value})} 
                       placeholder="Spt: Guru Mata Pelajaran, Tata Usaha"
                       required
                    />
                  </div>
                  <div className="space-y-6">
                    <InputField 
                       label="Mata Pelajaran (Opsional)" 
                       value={formData.subject || ''} 
                       onChange={e => setFormData({...formData, subject: e.target.value})} 
                       placeholder="Contoh: Matematika, IPA"
                    />
                    <InputField 
                       label="URL Foto (Avatar)" 
                       value={formData.image || ''} 
                       onChange={e => setFormData({...formData, image: e.target.value})} 
                       placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2rem] flex items-center justify-between border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-lg overflow-hidden border border-slate-200">
                         <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preview Kartu</p>
                         <p className="font-bold text-slate-900 text-sm">{formData.name || 'Nama Belum Diisi'}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs">Batal</button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editingItem ? 'Simpan' : 'Tambah'}
                      </button>
                   </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required = false, type = "text" }: { label: string, value: string, onChange: (e: any) => void, placeholder?: string, required?: boolean, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-300"
      />
    </div>
  );
}

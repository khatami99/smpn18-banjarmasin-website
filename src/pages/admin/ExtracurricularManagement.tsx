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
import { Plus, Trash2, Edit2, Save, X, Loader2, Star, Users, Palette, Trophy, Music, Camera, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Extracurricular } from '../../services/schoolService';

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
    icon: 'Star'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'extracurriculars', editingItem.id), payload);
        alert("Berhasil memperbarui data ekskul!");
      } else {
        await addDoc(collection(db, 'extracurriculars'), {
          ...payload,
          createdAt: Timestamp.now()
        });
        alert("Berhasil menambah data ekskul!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data ekskul. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus ekskul ini?")) return;
    try {
      await deleteDoc(doc(db, 'extracurriculars', id));
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Pilihan',
      mentor: '',
      schedule: '',
      icon: 'Star'
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manajemen Ekstrakurikuler</h1>
          <p className="text-slate-500 font-medium tracking-tight">Kelola daftar klub dan kegiatan pengembangan diri siswa.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          Tambah Ekskul
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 group hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   {ICON_OPTIONS.find(i => i.name === item.icon)?.icon || <Star className="h-6 w-6" />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(item.id!)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1 block">{item.category}</span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{item.description}</p>
              
              <div className="space-y-2 pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Users className="h-3 w-3" /> Mentor: {item.mentor || '-'}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Star className="h-3 w-3" /> Jadwal: {item.schedule || '-'}
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
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Ekskul' : 'Tambah Ekskul Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField label="Nama Ekstrakurikuler" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <InputField label="Kategori" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Spt: Wajib, Pilihan, Olahraga" required />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Ikon</label>
                       <div className="flex flex-wrap gap-2">
                          {ICON_OPTIONS.map(opt => (
                            <button 
                              key={opt.name}
                              type="button"
                              onClick={() => setFormData({...formData, icon: opt.name})}
                              className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all ${formData.icon === opt.name ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Kegiatan</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        required
                        className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all text-sm uppercase tracking-widest">Batal</button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Data
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

function InputField({ label, value, onChange, placeholder, required = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text"
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-inner text-sm"
      />
    </div>
  );
}

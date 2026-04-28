import React, { useState, useEffect } from 'react';
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
import { Trophy, Plus, Trash2, Edit2, Save, X, Loader2, Star, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    category: 'Akademik'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('year', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AchievementItem)));
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
        title: formData.title,
        winner: formData.winner,
        rank: formData.rank,
        year: formData.year,
        category: formData.category,
        image: formData.image || '',
        updatedAt: Timestamp.now()
      };

      if (editingItem?.id) {
        await updateDoc(doc(db, 'achievements', editingItem.id), payload);
        alert("Berhasil memperbarui data prestasi!");
      } else {
        await addDoc(collection(db, 'achievements'), {
          ...payload,
          createdAt: Timestamp.now()
        });
        alert("Berhasil menambah data prestasi!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan prestasi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus data prestasi ini?")) return;
    try {
      await deleteDoc(doc(db, 'achievements', id));
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      winner: '',
      rank: '',
      year: new Date().getFullYear().toString(),
      category: 'Akademik'
    });
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Data Prestasi</h1>
          <p className="text-slate-500 font-medium tracking-tight">Dokumentasi kebanggaan dan sertifikat prestasi siswa.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
        >
          <Plus className="h-5 w-5" />
          Input Prestasi Baru
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-300">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all"
            >
              <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-amber-100">
                <Trophy className="h-8 w-8" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] italic">{item.year}</span>
                   <div className="h-px w-8 bg-slate-100"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{item.title}</h3>
                <p className="text-[11px] font-black text-school-red uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Star className="h-3 w-3" /> {item.rank}
                </p>
                <p className="text-sm font-medium text-slate-400">Pemenang: <span className="text-slate-700 font-bold">{item.winner}</span></p>
              </div>

              <div className="flex gap-2 mt-10">
                <button 
                  onClick={() => { setEditingItem(item); setFormData({ ...item }); setShowModal(true); }}
                  className="flex-1 bg-slate-50 text-slate-600 h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
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
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Prestasi' : 'Input Prestasi Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="p-8 space-y-6">
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
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                     <select 
                       value={formData.category} 
                       onChange={e => setFormData({...formData, category: e.target.value})}
                       className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner"
                     >
                       <option value="Akademik">Akademik</option>
                       <option value="Olahraga">Olahraga</option>
                       <option value="Seni">Seni</option>
                       <option value="Organisasi">Organisasi</option>
                     </select>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs">Batal</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-amber-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                 >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Catat Prestasi'}
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
        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner placeholder:text-slate-200"
      />
    </div>
  );
}

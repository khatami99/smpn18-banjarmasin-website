import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Image as ImageIcon,
  FileText,
  Calendar,
  Sparkles,
  Target,
  ArrowRight,
  Upload,
  Loader2
} from 'lucide-react';
import { 
  getPrograms, 
  addProgram, 
  updateProgram, 
  deleteProgram, 
  SchoolProgram 
} from '../../services/schoolService';

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean'],
  ]
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

export default function ProgramManagement() {
  const [programs, setPrograms] = useState<SchoolProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<SchoolProgram, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    startYear: new Date().getFullYear().toString(),
    description: '',
    image: '',
    documents: []
  });

  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = getPrograms(setPrograms);
    return () => unsubscribe();
  }, []);

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        // Compress to 0.7 quality and save as DataURL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, image: compressedDataUrl }));
        setIsUploadingImg(false);
      };
    };
    setIsUploadingImg(true);
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB for Firestore compatibility)
    if (file.size > 1024 * 1024) {
      alert('Ukuran file terlalu besar (maksimal 1MB). Silakan perkecil ukuran dokumen atau gunakan link eksternal.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocUrl(reader.result as string);
      if (!docTitle) setDocTitle(file.name);
      setIsUploadingDoc(false);
    };
    setIsUploadingDoc(true);
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (program?: SchoolProgram) => {
    if (program) {
      setEditingId(program.id!);
      setFormData({
        name: program.name,
        startYear: program.startYear,
        description: program.description,
        image: program.image || '',
        documents: program.documents || []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        startYear: new Date().getFullYear().toString(),
        description: '',
        image: '',
        documents: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateProgram(editingId, formData);
      } else {
        await addProgram(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Upload failed') || err.message?.includes('storage/')) {
        alert(`Gagal mengunggah file: Terjadi kesalahan CORS atau Izin. Pastikan Firebase Storage sudah dikonfigurasi dengan benar di Cloud Console.`);
      } else {
        alert(`Gagal menyimpan program: ${err.message || 'Silakan periksa koneksi dan izin Anda.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus program ini secara permanen?')) {
      await deleteProgram(id);
    }
  };

  const addDocument = () => {
    if (!docTitle || !docUrl) return;
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), { title: docTitle, url: docUrl }]
    }));
    setDocTitle('');
    setDocUrl('');
  };

  const removeDocument = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== idx)
    }));
  };

  // Robust HTML stripper for previews
  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-16 p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-school-navy/5 dark:bg-school-yellow/10 rounded-[1.5rem] shadow-sm">
              <Target className="h-10 w-10 text-school-navy dark:text-school-yellow" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                Manajemen Program
              </h2>
              <div className="h-1.5 w-24 bg-school-yellow rounded-full mt-1"></div>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl">
            Kelola inovasi, inisiatif strategis, dan berbagai program unggulan sekolah untuk masa depan siswa.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95 shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/20"
        >
          <Plus className="h-6 w-6" />
          Tambah Program Baru
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12">
        <div className="relative mb-16">
          <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
            <Search className="h-7 w-7 text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Cari program sekolah..."
            className="w-full pl-24 pr-12 py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-transparent focus:border-school-navy/20 dark:focus:border-school-yellow/20 focus:ring-4 focus:ring-school-navy/5 outline-none font-bold text-xl text-slate-700 dark:text-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPrograms.map((program) => (
              <motion.div 
                layout
                key={program.id}
                className="group bg-white dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:border-school-navy/20 dark:hover:border-school-yellow/20 transition-all duration-500"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={program.image || 'https://images.unsplash.com/photo-1577891720206-8850bb3c59de?q=80&w=600&auto=format&fit=crop'} 
                    alt={program.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <button 
                      onClick={() => handleOpenModal(program)}
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-school-navy dark:text-school-yellow shadow-xl hover:scale-110 active:scale-90 transition-all"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(program.id!)}
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-red-500 shadow-xl hover:scale-110 active:scale-90 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase px-3 py-1.5 bg-school-yellow text-school-navy rounded-xl tracking-[0.2em] shadow-sm">
                      Mulai {program.startYear}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-4 group-hover:text-school-navy dark:group-hover:text-school-yellow transition-colors line-clamp-1">{program.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed italic">
                    {stripHtml(program.description)}
                  </p>
                  <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <FileText className="h-4 w-4" />
                      {program.documents?.length || 0} Lampiran
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-school-navy group-hover:text-school-navy transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white dark:border-slate-900 shadow-xl">
              <Sparkles className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Belum ada program?</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Klik tombol "Tambah Program Baru" untuk memulai mendokumentasikan inisiatif luar biasa sekolah kita.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 m-4 relative"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  {editingId ? 'Edit Program' : 'Tambah Program Baru'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-school-navy dark:text-school-yellow uppercase tracking-[0.3em] ml-1">Informasi Dasar</h3>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Program</label>
                        <input 
                          required
                          type="text"
                          placeholder="Masukkan nama program..."
                          className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all shadow-inner"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tahun Peluncuran</label>
                        <input 
                          required
                          type="text"
                          placeholder="Contoh: 2024"
                          className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 focus:border-school-navy transition-all shadow-inner"
                          value={formData.startYear}
                          onChange={(e) => setFormData({...formData, startYear: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-school-navy dark:text-school-yellow uppercase tracking-[0.3em] ml-1">Identitas Visual</h3>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Gambar Cover</label>
                        <input 
                          type="file" 
                          id="img-upload"
                          ref={imgInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImgUpload} 
                        />
                        <label 
                          htmlFor="img-upload"
                          className="w-full aspect-video rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-school-navy dark:hover:border-school-yellow transition-all group overflow-hidden relative shadow-inner block"
                        >
                          {formData.image ? (
                            <>
                              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="h-8 w-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <ImageIcon className="h-7 w-7 text-slate-300" />
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pilih Gambar Cover</p>
                                <p className="text-[9px] text-slate-400 font-medium italic">Rasio 16:9 disarankan</p>
                              </div>
                            </>
                          )}
                          {isUploadingImg && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 text-school-navy dark:text-school-yellow animate-spin" />
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-school-navy dark:text-school-yellow uppercase tracking-[0.3em] ml-1">Detail Narasi</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi Lengkap Program</label>
                      <div className="h-[440px] flex flex-col">
                        <ReactQuill 
                          theme="snow"
                          value={formData.description}
                          onChange={(content) => setFormData({...formData, description: content})}
                          modules={QUILL_MODULES}
                          formats={QUILL_FORMATS}
                          className="flex-1 h-full bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-200"
                          placeholder="Ceritakan keunggulan, tujuan, dan dampak program ini secara mendalam..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[10px] font-black text-school-navy dark:text-school-yellow uppercase tracking-[0.3em] mb-1">Arsip Dokumen Penunjang</h4>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight">Lampirkan PDF atau panduan program untuk diunduh publik.</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-3">
                      <input 
                        type="text"
                        placeholder="Judul Dokumen (cth: Panduan Pendaftaran)"
                        className="flex-[1.5] h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 transition-all"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                      />
                      <div className="flex-1">
                        <input 
                          type="file" 
                          id="doc-upload"
                          ref={docInputRef} 
                          className="hidden" 
                          onChange={handleDocUpload} 
                        />
                        <label
                          htmlFor="doc-upload"
                          className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-400 dark:text-slate-500 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group cursor-pointer"
                        >
                          <span className="truncate max-w-[120px]">{docUrl.startsWith('data:') ? 'File Terunggah' : (docUrl ? 'Link Terpasang' : 'Pilih Berkas...')}</span>
                          {isUploadingDoc ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-slate-300 group-hover:text-school-navy" />}
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <input 
                        type="text"
                        placeholder="Atau masukkan URL dokumen (Drive/Dropbox/dll)..."
                        className="flex-1 h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-slate-200 outline-none focus:ring-4 focus:ring-school-navy/5 transition-all"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={addDocument}
                        disabled={!docUrl || isUploadingDoc}
                        className="px-8 h-14 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                      >
                        Lampirkan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.documents?.map((doc, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx} 
                          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-school-navy transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-school-navy transition-colors">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-700 dark:text-white text-xs truncate">{doc.title}</p>
                              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest truncate">{doc.url.split('/').pop()?.slice(-20)}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                      {(!formData.documents || formData.documents.length === 0) && (
                        <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-[2rem] text-center">
                          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Belum ada lampiran dokumen</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pb-4 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan Program'}
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

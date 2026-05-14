import React, { useState, useEffect } from 'react';
import { Save, School, Tag, Award, Hash, Star, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Users, Phone, Mail, GraduationCap, Target, MapPin, Map, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'vision' | 'contact' | 'auth'>('general');
  const [settings, setSettings] = useState({
    schoolName: "SMP Negeri 18 Banjarmasin",
    tagline: "Mewujudkan Generasi Alamanda",
    address: "Jl. Pemuda No. 18, Banjarmasin",
    phone: "",
    email: "",
    mapsUrl: "",
    instagram: "",
    accreditation: "A",
    npsn: "12345678",
    motto: "Amanah, Mandiri, Adaptif",
    studentCount: "768",
    teacherCount: "54",
    classCount: "24",
    headmasterName: "",
    headmasterQuote: "",
    vision: "",
    mission: [] as string[]
  });
  const [newMissionPoint, setNewMissionPoint] = useState('');

  const [authData, setAuthData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const getMapsUrl = (input: string) => {
    if (!input) return "";
    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }

        // Ambil ID/Username saat ini dari Database
        const authSnap = await getDoc(doc(db, 'system', 'auth'));
        if (authSnap.exists()) {
          setAuthData(prev => ({ ...prev, username: authSnap.data().username || 'admin18' }));
        } else {
          setAuthData(prev => ({ ...prev, username: 'admin18' }));
        }

      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setMessage({ type: 'success', text: 'Pengaturan sekolah berhasil diperbarui!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAuth = async () => {
    // Validasi
    if (authData.newPassword && authData.newPassword !== authData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (!authData.currentPassword) {
      setMessage({ type: 'error', text: 'Masukkan Password Saat Ini untuk keamanan.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      // 1. Cek password saat ini di database
      const authSnap = await getDoc(doc(db, 'system', 'auth'));
      const currentStored = authSnap.exists() ? authSnap.data() : { username: 'admin18', password: 'alamanda18' };

      if (authData.currentPassword !== currentStored.password) {
        throw new Error("Password saat ini salah.");
      }

      // 2. Update Kredensial Baru
      const newCredentials = {
        username: authData.username || currentStored.username,
        password: authData.newPassword || currentStored.password,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'admin'
      };

      await setDoc(doc(db, 'system', 'auth'), newCredentials);

      setMessage({ type: 'success', text: 'ID & Password berhasil diperbarui! Gunakan kredensial baru ini untuk login berikutnya.' });
      setAuthData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal memperbarui keamanan: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-slate-400 dark:text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 font-sans transition-colors duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Pusat Konfigurasi</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Kelola identitas digital dan keamanan sistem sekolah Anda.</p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Identitas Sekolah
        </button>
        <button 
          onClick={() => setActiveTab('vision')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'vision' ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Visi & Misi
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'contact' ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Kontak & Lokasi
        </button>
        <button 
          onClick={() => setActiveTab('auth')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'auth' ? 'bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          Keamanan & Login
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-[2rem] flex items-center gap-4 mb-8 border ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <p className="font-bold text-sm tracking-tight">{message.text}</p>
        </motion.div>
      )}

      {activeTab === 'general' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 md:p-12 space-y-10">
            <div className="space-y-8">
              <InputField 
                label="Nama Sekolah Resmi" 
                icon={<School className="h-4 w-4" />}
                value={settings.schoolName}
                onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
              />
              <InputField 
                label="Tagline / Slogan" 
                icon={<Tag className="h-4 w-4" />}
                value={settings.tagline}
                onChange={(e) => setSettings({...settings, tagline: e.target.value})}
              />
              <InputField 
                label="Motto Utama" 
                icon={<Star className="h-4 w-4" />}
                value={settings.motto}
                onChange={(e) => setSettings({...settings, motto: e.target.value})}
              />
              
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <InputField 
                  label="Akreditasi" 
                  icon={<Award className="h-4 w-4" />}
                  value={settings.accreditation}
                  onChange={(e) => setSettings({...settings, accreditation: e.target.value})}
                />
                <InputField 
                  label="NPSN" 
                  icon={<Hash className="h-4 w-4" />}
                  value={settings.npsn}
                  onChange={(e) => setSettings({...settings, npsn: e.target.value})}
                />
                <InputField 
                  label="Siswa Aktif" 
                  icon={<Users className="h-4 w-4" />}
                  value={settings.studentCount}
                  onChange={(e) => setSettings({...settings, studentCount: e.target.value})}
                />
                <InputField 
                  label="Rombel" 
                  icon={<Target className="h-4 w-4" />}
                  value={settings.classCount}
                  onChange={(e) => setSettings({...settings, classCount: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSaveGeneral}
              disabled={saving}
              className="flex items-center gap-3 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Simpan Identitas Sekolah
            </button>
          </div>
        </div>
      )}

      {activeTab === 'vision' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 md:p-12 space-y-10">
            <div className="space-y-8">
              <InputField 
                label="Visi Sekolah" 
                icon={<Target className="h-4 w-4" />}
                isTextArea
                value={settings.vision}
                onChange={(e) => setSettings({...settings, vision: e.target.value})}
                placeholder="Contoh: Terwujudnya insan yang berakhlak mulia, cerdas..."
              />

              <div className="space-y-6">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-school-red"><CheckCircle2 className="h-4 w-4" /></span>
                  Misi Sekolah (Poin-poin)
                </label>
                
                <div className="space-y-4">
                  {settings.mission.map((point, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm">
                        {point}
                      </div>
                      <button 
                        onClick={() => {
                          const newMission = [...settings.mission];
                          newMission.splice(index, 1);
                          setSettings({...settings, mission: newMission});
                        }}
                        className="h-14 w-14 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <AlertCircle className="h-5 w-5 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <input 
                    type="text"
                    value={newMissionPoint}
                    onChange={(e) => setNewMissionPoint(e.target.value)}
                    placeholder="Tambah poin misi baru..."
                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-school-navy/5 dark:focus:ring-school-yellow/5 focus:bg-white dark:focus:bg-slate-900 focus:border-school-navy dark:focus:border-school-yellow outline-none transition-all font-bold text-slate-700 dark:text-slate-200 shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (newMissionPoint.trim()) {
                          setSettings({
                            ...settings, 
                            mission: [...settings.mission, newMissionPoint.trim()]
                          });
                          setNewMissionPoint('');
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newMissionPoint.trim()) {
                        setSettings({
                          ...settings, 
                          mission: [...settings.mission, newMissionPoint.trim()]
                        });
                        setNewMissionPoint('');
                      }
                    }}
                    className="px-8 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy rounded-2xl font-bold hover:shadow-lg transition-all"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSaveGeneral}
              disabled={saving}
              className="flex items-center gap-3 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Simpan Visi & Misi
            </button>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 md:p-12 space-y-10">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                  label="Alamat Fisik Sekolah" 
                  icon={<MapPin className="h-4 w-4" />}
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  placeholder="Jl. Kelayan Besar 1 RT.3 Kel.Tanjung Pagar"
                />
                <InputField 
                  label="URL Embed Google Maps" 
                  icon={<Map className="h-4 w-4" />}
                  value={settings.mapsUrl}
                  onChange={(e) => setSettings({...settings, mapsUrl: e.target.value})}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>

              {settings.mapsUrl && (
                <div className="mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preview Map:</p>
                  <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <iframe 
                      src={getMapsUrl(settings.mapsUrl)}
                      className="w-full h-full border-0"
                      allowFullScreen={true}
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                  label="Email Resmi Sekolah" 
                  icon={<Mail className="h-4 w-4" />}
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  placeholder="info@smpn18bjm.sch.id"
                />
                <InputField 
                  label="Nomor Telepon Sekolah" 
                  icon={<Phone className="h-4 w-4" />}
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  placeholder="(0511) 3254397"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                  label="Username Instagram Sekolah" 
                  icon={<Instagram className="h-4 w-4" />}
                  value={settings.instagram}
                  onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                  placeholder="@smpn18bjm"
                />
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSaveGeneral}
              disabled={saving}
              className="flex items-center gap-3 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Simpan Informasi Kontak
            </button>
          </div>
        </div>
      )}

      {activeTab === 'auth' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-10 md:p-12 space-y-8">
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-6 rounded-2xl mb-8">
                <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-500 tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Perhatian Internal
                </p>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                  Semua admin menggunakan ID & Password yang sama. Disarankan untuk merahasiakan kredensial ini dan hanya membagikannya kepada staf yang berwenang.
                </p>
              </div>

              <InputField 
                label="ID Administrator (Username)" 
                icon={<Hash className="h-4 w-4" />}
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
                placeholder="Contoh: admin18"
              />

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <InputField 
                  label="Password Saat Ini (Wajib)" 
                  icon={<Lock className="h-4 w-4" />}
                  value={authData.currentPassword}
                  onChange={(e) => setAuthData({...authData, currentPassword: e.target.value})}
                  type="password"
                  placeholder="Masukkan password sekarang untuk konfirmasi"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="relative group">
                  <InputField 
                    label="Password Baru (Biarkan kosong jika tidak ganti)" 
                    icon={<Lock className="h-4 w-4" />}
                    value={authData.newPassword}
                    onChange={(e) => setAuthData({...authData, newPassword: e.target.value})}
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password baru"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 bottom-3 text-slate-400 hover:text-school-navy dark:hover:text-school-yellow transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <InputField 
                  label="Konfirmasi Password Baru" 
                  icon={<Lock className="h-4 w-4" />}
                  value={authData.confirmPassword}
                  onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
                />
              </div>

              <button 
                onClick={handleUpdateAuth}
                disabled={saving || !authData.currentPassword}
                className="w-full py-5 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Simpan Perubahan Keamanan
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, icon, value, onChange, isTextArea = false, type = "text", placeholder = "" }: { 
  label: string, 
  icon: React.ReactNode, 
  value: string, 
  onChange: (e: React.ChangeEvent<any>) => void,
  isTextArea?: boolean,
  type?: string,
  placeholder?: string
}) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span className="text-school-red">{icon}</span>
        {label}
      </label>
      {isTextArea ? (
        <textarea 
          value={value}
          onChange={onChange}
          rows={4}
          placeholder={placeholder}
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-school-navy/5 dark:focus:ring-school-yellow/5 focus:bg-white dark:focus:bg-slate-900 focus:border-school-navy dark:focus:border-school-yellow outline-none transition-all resize-none font-bold text-slate-700 dark:text-slate-200 shadow-inner"
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-school-navy/5 dark:focus:ring-school-yellow/5 focus:bg-white dark:focus:bg-slate-900 focus:border-school-navy dark:focus:border-school-yellow outline-none transition-all font-bold text-slate-700 dark:text-slate-200 shadow-inner"
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Save, School, Tag, MapPin, Award, Hash, Star, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Target, Zap, Trash2, Users, Phone, Mail, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'auth'>('general');
  const [settings, setSettings] = useState({
    schoolName: "SMP Negeri 18 Banjarmasin",
    tagline: "Mewujudkan Generasi Alamanda",
    address: "Jl. Pemuda No. 18, Banjarmasin",
    phone: "",
    email: "",
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

  const [authData, setAuthData] = useState({
    email: auth.currentUser?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
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
    if (authData.newPassword && authData.newPassword !== authData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      // Update Email/ID if changed
      if (authData.email !== user.email) {
        await updateEmail(user, authData.email);
        // Also update the admins collection to match new email
        await updateDoc(doc(db, 'admins', user.uid), { email: authData.email });
      }

      // Update Password if provided
      if (authData.newPassword) {
        await updatePassword(user, authData.newPassword);
      }

      setMessage({ type: 'success', text: 'Kredensial login berhasil diperbarui!' });
      setAuthData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Sesi anda telah berakhir. Silakan logout dan login kembali untuk mengubah keamanan.' });
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui keamanan: ' + err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Pusat Konfigurasi</h1>
        <p className="text-slate-500 font-medium tracking-tight">Kelola identitas digital dan keamanan sistem sekolah Anda.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-school-navy text-white shadow-xl shadow-school-navy/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
        >
          Identitas Sekolah
        </button>
        <button 
          onClick={() => setActiveTab('auth')}
          className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'auth' ? 'bg-school-navy text-white shadow-xl shadow-school-navy/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
        >
          Keamanan & Login
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-[2rem] flex items-center gap-4 mb-8 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <p className="font-bold text-sm tracking-tight">{message.text}</p>
        </motion.div>
      )}

      {activeTab === 'general' ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <span className="h-6 w-1 bg-emerald-500 rounded-full"></span>
                   Statistik Sekolah
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <InputField 
                    label="Jumlah Siswa" 
                    icon={<Users className="h-4 w-4" />}
                    value={settings.studentCount}
                    onChange={(e) => setSettings({...settings, studentCount: e.target.value})}
                   />
                   <InputField 
                    label="Jumlah Guru/Staff" 
                    icon={<GraduationCap className="h-4 w-4" />}
                    value={settings.teacherCount}
                    onChange={(e) => setSettings({...settings, teacherCount: e.target.value})}
                   />
                   <InputField 
                    label="Jumlah Rombel" 
                    icon={<Hash className="h-4 w-4" />}
                    value={settings.classCount}
                    onChange={(e) => setSettings({...settings, classCount: e.target.value})}
                   />
                 </div>
              </div>
            </div>

              <InputField 
                label="Alamat Lengkap Sekolah" 
                icon={<MapPin className="h-4 w-4" />}
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                isTextArea
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                  label="Nomor Telepon / WhatsApp" 
                  icon={<Phone className="h-4 w-4" />}
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                />
                <InputField 
                  label="Email Sekolah" 
                  icon={<Mail className="h-4 w-4" />}
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                />
              </div>

            <div className="pt-6 border-t border-slate-50">
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                 <span className="h-6 w-1 bg-school-yellow rounded-full"></span>
                 Visi & Misi Sekolah
               </h3>
               <div className="space-y-8">
                  <InputField 
                    label="Visi Sekolah" 
                    icon={<Target className="h-4 w-4" />}
                    value={settings.vision}
                    onChange={(e) => setSettings({...settings, vision: e.target.value})}
                    isTextArea
                  />
                  
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-school-red"><Zap className="h-4 w-4" /></span>
                        Misi Sekolah (Editor Daftar)
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, mission: [...settings.mission, '']})}
                        className="text-[10px] bg-slate-100 px-3 py-1 rounded-lg text-slate-600 hover:bg-school-red hover:text-white transition-all shadow-sm"
                      >
                         Tambah Poin
                      </button>
                    </label>
                    <div className="grid gap-3">
                      {settings.mission.map((m, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            value={m}
                            onChange={(e) => {
                              const newMission = [...settings.mission];
                              newMission[idx] = e.target.value;
                              setSettings({...settings, mission: newMission});
                            }}
                            placeholder={`Misi ke-${idx + 1}`}
                            className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-school-navy outline-none transition-all font-bold text-slate-700 shadow-inner"
                          />
                          <button 
                            onClick={() => {
                              const newMission = settings.mission.filter((_, i) => i !== idx);
                              setSettings({...settings, mission: newMission});
                            }}
                            className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                          >
                             <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                 <span className="h-6 w-1 bg-school-red rounded-full"></span>
                 Profil Kepala Sekolah
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Nama Kepala Sekolah" 
                    icon={<Users className="h-4 w-4" />}
                    value={settings.headmasterName}
                    onChange={(e) => setSettings({...settings, headmasterName: e.target.value})}
                  />
                  <InputField 
                    label="Kutipan Sambutan (Singkat)" 
                    icon={<Star className="h-4 w-4" />}
                    value={settings.headmasterQuote}
                    onChange={(e) => setSettings({...settings, headmasterQuote: e.target.value})}
                    isTextArea
                  />
               </div>
            </div>
          </div>

          <div className="p-10 md:p-12 bg-slate-50/50 flex justify-end">
            <button 
              onClick={handleSaveGeneral}
              disabled={saving}
              className="flex items-center gap-3 bg-school-navy text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Perbarui Informasi Sekolah
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
           <div className="p-10 md:p-12 space-y-8">
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mb-8">
                <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Perhatian Keamanan
                </p>
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                  Mengubah kredensial login akan memaksa Anda keluar dari sistem jika ID (Email) diubah. Pastikan Anda mencatat password baru Anda dengan aman.
                </p>
              </div>

              <InputField 
                label="Email / ID Admin" 
                icon={<Hash className="h-4 w-4" />}
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
              />

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="relative group">
                  <InputField 
                    label="Password Baru" 
                    icon={<Lock className="h-4 w-4" />}
                    value={authData.newPassword}
                    onChange={(e) => setAuthData({...authData, newPassword: e.target.value})}
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 bottom-3 text-slate-400"
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
                />
              </div>
           </div>

           <div className="p-10 md:p-12 bg-slate-50/50 flex justify-end">
            <button 
              onClick={handleUpdateAuth}
              disabled={saving}
              className="flex items-center gap-3 bg-school-red text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-xl shadow-school-red/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
              Simpan Perubahan Keamanan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, icon, value, onChange, isTextArea = false, type = "text" }: { 
  label: string, 
  icon: React.ReactNode, 
  value: string, 
  onChange: (e: React.ChangeEvent<any>) => void,
  isTextArea?: boolean,
  type?: string
}) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-school-red">{icon}</span>
        {label}
      </label>
      {isTextArea ? (
        <textarea 
          value={value}
          onChange={onChange}
          rows={4}
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-school-navy/5 focus:bg-white focus:border-school-navy outline-none transition-all resize-none font-bold text-slate-700 shadow-inner"
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-school-navy/5 focus:bg-white focus:border-school-navy outline-none transition-all font-bold text-slate-700 shadow-inner"
        />
      )}
    </div>
  );
}

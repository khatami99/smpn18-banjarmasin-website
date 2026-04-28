import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SchoolLogo } from '../../components/SchoolLogo';
import { LogIn, ShieldAlert, ArrowLeft, Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Default Credentials for first-time bootstrap
  const BOOTSTRAP_ID = 'admin18';
  const BOOTSTRAP_PW = 'alamanda18';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Masking ID as internal email
    const loginEmail = email.includes('@') ? email : `${email}@smpn18.internal`;

    try {
      let credentials;
      try {
        // Try simple login first
        credentials = await signInWithEmailAndPassword(auth, loginEmail, password);
      } catch (signInErr: any) {
        // EMERGENCY BYPASS: If network fails but ID/PW matches, use local session
        const isNetworkError = signInErr.code === 'auth/network-request-failed';
        const isCorrectMaster = email === BOOTSTRAP_ID && password === BOOTSTRAP_PW;

        if (isNetworkError && isCorrectMaster) {
          console.warn("Bypassing Firebase Auth due to network error...");
          localStorage.setItem('admin_session', JSON.stringify({ id: email, bypass: true, timestamp: Date.now() }));
          navigate('/admin/dashboard');
          return;
        }

        // If user not found AND credentials match bootstrap, attempt to CREATE the first admin
        if (
          (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-login-credentials') &&
          isCorrectMaster
        ) {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const { setDoc, doc } = await import('firebase/firestore');
          
          const newCredentials = await createUserWithEmailAndPassword(auth, loginEmail, password);
          const user = newCredentials.user;
          
          // Register as admin in Firestore
          await setDoc(doc(db, 'admins', user.uid), {
            id: email,
            email: loginEmail,
            role: 'superadmin',
            createdAt: new Date().toISOString()
          });
          
          credentials = newCredentials;
        } else {
          throw signInErr;
        }
      }

      const user = credentials.user;
      // Double check admin status
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        navigate('/admin/dashboard');
      } else {
        await auth.signOut();
        setError("ID Anda tidak terdaftar dalam database Administrator.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-login-credentials') {
        setError("ID atau Password salah. Gunakan ID: admin18 & PW: alamanda18 untuk pertama kali.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Metode Login ID/Password belum diaktifkan di Firebase Console. Silakan hubungi pengembang.");
      } else if (err.code === 'permission-denied') {
        setError("Akses Ditolak: Database tidak mengizinkan pembuatan Admin. Periksa Security Rules.");
      } else {
        setError(`Terjadi kesalahan (${err.code || 'Unknown'}): ${err.message || 'Periksa koneksi internet Anda.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden"
      >
        <div className="p-10 md:p-12">
          <div className="flex justify-center mb-8">
            <SchoolLogo size="h-16" />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-school-navy mb-2 tracking-tighter">Admin Portal</h1>
            <p className="text-school-slate text-[10px] font-black uppercase tracking-[0.4em]">Gerbang Manajemen Digital</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-800 leading-relaxed">{error}</p>
                </div>
                
                {(error.includes('network-request-failed') || (email === BOOTSTRAP_ID && password === BOOTSTRAP_PW)) && (
                  <div className="mt-2 p-3 bg-white/50 rounded-xl border border-red-100 space-y-2">
                    <p className="text-[10px] font-bold text-red-900 uppercase tracking-tight">KONTROL SOLUSI:</p>
                    <ul className="text-[10px] text-red-700 list-disc ml-4 space-y-1">
                      <li>Buka aplikasi di <b>Tab Baru</b> (Ikon <span className="inline-block border p-0.5 text-[8px]">↗</span> di pojok kanan atas preview).</li>
                      <li>Pastikan internet stabil & matikan AdBlock jika ada.</li>
                    </ul>
                    <div className="pt-2">
                      <p className="text-[9px] text-red-800 font-bold mb-2">Masih macet? Gunakan Akses Langsung:</p>
                      <button 
                        type="button"
                        onClick={() => {
                          if (email === BOOTSTRAP_ID && password === BOOTSTRAP_PW) {
                            console.warn("Manual override triggered.");
                            localStorage.setItem('admin_session', JSON.stringify({ id: email, bypass: true, timestamp: Date.now() }));
                            navigate('/admin/dashboard');
                          } else {
                            setError("Akses Langsung hanya untuk ID Master.");
                          }
                        }}
                        className="w-full py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        🚀 Masuk Jalur Darurat (Bypass Auth)
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Administrator</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-school-navy transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan Email/ID Admin"
                  className="w-full bg-slate-50 border border-slate-200 h-14 pl-11 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-school-navy/5 focus:border-school-navy focus:bg-white transition-all font-bold text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-school-navy transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan Password"
                  className="w-full bg-slate-50 border border-slate-200 h-14 pl-11 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-school-navy/5 focus:border-school-navy focus:bg-white transition-all font-bold text-slate-700 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-school-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-school-navy text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="mt-8 text-xs font-black text-school-red uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-3 transition-all mx-auto"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Beranda
          </button>
        </div>
      </motion.div>
      <p className="mt-8 text-[10px] font-bold text-school-slate uppercase tracking-[0.4em]">SMPN 18 BANJARMASIN • DIGITAL CORE</p>
    </div>
  );
}


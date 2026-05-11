import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      // If it's the owner of the app (the one who set up firebase), auto-promote to admin if no admins exist
      if (!adminDoc.exists()) {
        const adminsSnapshot = await getDoc(doc(db, 'admins', 'config')); // Check a metadata doc or just check if collection is empty (more complex)
        
        // Simplified: First person to login with Google gets a chance or we just check if they have the correct email
        // For AI Studio apps, we can be a bit more flexible if the user is stuck
        const isFirstAdmin = (await getDoc(doc(db, 'admins', 'initial_setup'))).exists() === false;
        
        if (isFirstAdmin) {
          await setDoc(doc(db, 'admins', user.uid), {
            id: user.email,
            email: user.email,
            role: 'superadmin',
            method: 'google',
            createdAt: new Date().toISOString()
          });
          await setDoc(doc(db, 'admins', 'initial_setup'), { completed: true });
        } else {
          // If not first admin and not registered, block
          await auth.signOut();
          setError("Akun Google ini tidak terdaftar sebagai Administrator.");
          return;
        }
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(`Gagal Login Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Default Credentials for first-time bootstrap
  const BOOTSTRAP_ID = 'admin18';
  const BOOTSTRAP_PW = 'alamanda18';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Ambil kredensial dari Database Firestore (Dokumen tunggal)
      const authDoc = await getDoc(doc(db, 'system', 'auth'));
      
      let targetId = BOOTSTRAP_ID;
      let targetPw = BOOTSTRAP_PW;

      // Jika data sudah diubah di pengaturan, maka system/auth akan ada
      if (authDoc.exists()) {
        const data = authDoc.data();
        targetId = data.username || BOOTSTRAP_ID;
        targetPw = data.password || BOOTSTRAP_PW;
      } else {
        // Jika belum ada dokumen sama sekali (pertama kali jalan), buat default
        await setDoc(doc(db, 'system', 'auth'), {
          username: BOOTSTRAP_ID,
          password: BOOTSTRAP_PW,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Bandingkan input dengan target
      if (email === targetId && password === targetPw) {
        // Login Berhasil - Simpan sesi lokal saja
        const sessionData = {
          id: email,
          loginAt: new Date().toISOString(),
          isMaster: email === BOOTSTRAP_ID
        };
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        
        // Kita login ke Firebase Auth secara background (tetap butuh untuk bypass security rules jika ada)
        // Gunakan email virtual internal
        try {
          // Password firebase tetap bootstrap or random, yang penting ada session firebase auth
          await signInWithEmailAndPassword(auth, `admin18@smpn18.internal`, `alamanda18`);
        } catch (e) {
          // Jika user firebase belum dibuat (karena baru pertama kali), buatkan dulu
          try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            await createUserWithEmailAndPassword(auth, `admin18@smpn18.internal`, `alamanda18`);
          } catch (createErr) { /* ignore if exists */ }
        }

        navigate('/admin/dashboard');
      } else {
        setError("ID atau Password salah. Masukkan kredensial yang tepat.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Kesalahan Sistem: " + (err.message || "Gagal menghubungi database."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] font-sans transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-10 md:p-12">
          <div className="flex justify-center mb-8">
            <SchoolLogo size="h-16" />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-school-navy dark:text-white mb-2 tracking-tighter">Admin Portal</h1>
            <p className="text-school-slate dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Gerbang Manajemen Digital</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-start gap-4"
              >
                <ShieldAlert className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-800 dark:text-red-200 leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ID Administrator</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-school-navy dark:group-focus-within:text-school-yellow transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan ID Anda"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-14 pl-11 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-school-navy/5 dark:focus:ring-school-yellow/5 focus:border-school-navy dark:focus:border-school-yellow focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-school-navy dark:group-focus-within:text-school-yellow transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan Password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-14 pl-11 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-school-navy/5 dark:focus:ring-school-yellow/5 focus:border-school-navy dark:focus:border-school-yellow focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-200 font-mono text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-school-navy dark:hover:text-school-yellow transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy h-16 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10 disabled:opacity-50 mt-4 active:scale-95"
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
            className="mt-10 text-xs font-black text-school-red uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-3 transition-all mx-auto opacity-60 hover:opacity-100"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Website
          </button>
        </div>
      </motion.div>
      <p className="mt-8 text-[10px] font-bold text-school-slate dark:text-slate-500 uppercase tracking-[0.4em]">SMPN 18 BANJARMASIN • INTERNAL SYSTEM</p>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import Settings from './pages/admin/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import NewsManagement from './pages/admin/NewsManagement';
import AchievementsManagement from './pages/admin/AchievementsManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ExtracurricularManagement from './pages/admin/ExtracurricularManagement';
import ProgramManagement from './pages/admin/ProgramManagement';
import LoginPage from './pages/public/LoginPage';
import SambutanKepalaSekolah from './pages/public/SambutanKepalaSekolah';
import VisiMisi from './pages/public/VisiMisi';
import BeritaList from './pages/public/BeritaList';
import BeritaDetail from './pages/public/BeritaDetail';
import StaffList from './pages/public/StaffList';
import EkstrakurikulerList from './pages/public/EkstrakurikulerList';
import PrestasiList from './pages/public/PrestasiList';
import GaleriPage from './pages/public/GaleriPage';
import KontakPage from './pages/public/KontakPage';
import ProgramList from './pages/public/ProgramList';
import ProgramDetail from './pages/public/ProgramDetail';
import Unduhan from './pages/Unduhan';
import { SchoolLogo } from './components/SchoolLogo';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Home, Menu, X, Loader2, Newspaper, Trophy, Users, Palette, Image as ImageIcon, Sun, Moon, Target, Smile } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Added onAuthStateChanged for better type safety in layout
import { doc, getDoc } from 'firebase/firestore';
import GalleryManagement from './pages/admin/GalleryManagement';
import { ThemeProvider, useTheme } from './lib/theme';
import { PublicLayout } from './components/PublicLayout';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsFirebaseConnected(!!firebaseUser);
      const localSession = localStorage.getItem('admin_session');
      
      if (!localSession) {
        setIsAdmin(false);
        if (location.pathname.startsWith('/admin')) {
          navigate('/login');
        }
        return;
      }

      // Sync Firebase Auth if local session exists but firebase user is null
      if (!firebaseUser) {
        try {
          const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
          const email = `admin18@smpn18.internal`;
          const password = `alamanda18`;
          
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (e: any) {
            if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
              // Try creating it once if it's potentially missing
              await createUserWithEmailAndPassword(auth, email, password).catch(() => {});
            }
            console.error("Auto Firebase login failed:", e);
          }
          return;
        } catch (e) {
          console.error("Auth module import failed:", e);
        }
      }

      try {
        const sessionData = JSON.parse(localSession);
        
        // Ambil info admin aktual dari Firestore untuk UI
        const authSnap = await getDoc(doc(db, 'system', 'auth'));
        const username = authSnap.exists() ? authSnap.data().username : (sessionData.id || 'Admin');
        
        setUser({ 
          displayName: username, 
          email: firebaseUser?.email || `${username}@internal`,
          uid: firebaseUser?.uid,
          isMaster: sessionData.isMaster
        });
        
        setIsAdmin(true);
      } catch (e) {
        console.error("Session verification failed:", e);
        // Don't immediately remove session if it's just a network error
        if (e instanceof Error && e.message.includes('permission-denied')) {
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
          navigate('/login');
        } else {
          setIsAdmin(true); // Fallback to trust local session if network fails
        }
      }
    });

    return () => unsub();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    await signOut(auth).catch(() => {}); // Tetap logout firebase jika ada session
    navigate('/login');
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] transition-colors duration-500">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 animate-pulse">
            <SchoolLogo size="h-8" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-black text-school-navy dark:text-white uppercase tracking-[0.4em] animate-pulse">Memverifikasi Sesi...</p>
            <Loader2 className="h-4 w-4 text-school-red animate-spin mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Newspaper className="h-5 w-5" />, label: 'Manajemen Berita', path: '/admin/news' },
    { icon: <Trophy className="h-5 w-5" />, label: 'Data Prestasi', path: '/admin/achievements' },
    { icon: <Target className="h-5 w-5" />, label: 'Program Sekolah', path: '/admin/programs' },
    { icon: <Palette className="h-5 w-5" />, label: 'Ekstrakurikuler', path: '/admin/extracurricular' },
    { icon: <ImageIcon className="h-5 w-5" />, label: 'Galeri Sekolah', path: '/admin/gallery' },
    { icon: <Users className="h-5 w-5" />, label: 'Guru & Staff', path: '/admin/staff' },
    { icon: <SettingsIcon className="h-5 w-5" />, label: 'Pengaturan Sekolah', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-school-navy dark:bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 px-6 border-b border-white/10">
          <SchoolLogo size="h-8" variant="white" />
          <span className="text-lg font-bold">Admin Portal</span>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-600 dark:bg-school-yellow dark:text-school-navy text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4 text-sm">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Home className="h-5 w-5" />
            <span className="font-medium">Lihat Website</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500 dark:text-slate-400">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className="flex items-center gap-6 ml-auto">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-school-yellow" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admin</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=0d8abc" alt="Admin" className="w-full h-full" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="animate-in fade-in duration-500 p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <>
      <Toaster position="top-right" richColors theme={theme as 'light' | 'dark'} />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profil/sambutan" element={<PublicLayout><SambutanKepalaSekolah /></PublicLayout>} />
          <Route path="/profil/visi-misi" element={<PublicLayout><VisiMisi /></PublicLayout>} />
          <Route path="/berita" element={<PublicLayout><BeritaList /></PublicLayout>} />
          <Route path="/berita/:id" element={<PublicLayout><BeritaDetail /></PublicLayout>} />
          <Route path="/program" element={<PublicLayout><ProgramList /></PublicLayout>} />
          <Route path="/program/:id" element={<PublicLayout><ProgramDetail /></PublicLayout>} />
          <Route path="/staf" element={<PublicLayout><StaffList /></PublicLayout>} />
          <Route path="/ekstrakurikuler" element={<PublicLayout><EkstrakurikulerList /></PublicLayout>} />
          <Route path="/galeri" element={<PublicLayout><GaleriPage /></PublicLayout>} />
          <Route path="/prestasi" element={<PublicLayout><PrestasiList /></PublicLayout>} />
          <Route path="/unduhan" element={<PublicLayout><Unduhan /></PublicLayout>} />
          <Route path="/kontak" element={<PublicLayout><KontakPage /></PublicLayout>} />
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/news" element={<NewsManagement />} />
                <Route path="/programs" element={<ProgramManagement />} />
                <Route path="/achievements" element={<AchievementsManagement />} />
                <Route path="/extracurricular" element={<ExtracurricularManagement />} />
                <Route path="/gallery" element={<GalleryManagement />} />
                <Route path="/staff" element={<StaffManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          } />
        </Routes>
      </Router>
    </>
  );
}

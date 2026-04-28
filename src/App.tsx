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
import LoginPage from './pages/public/LoginPage';
import SambutanKepalaSekolah from './pages/public/SambutanKepalaSekolah';
import VisiMisi from './pages/public/VisiMisi';
import BeritaList from './pages/public/BeritaList';
import EkstrakurikulerList from './pages/public/EkstrakurikulerList';
import PrestasiList from './pages/public/PrestasiList';
import KontakPage from './pages/public/KontakPage';
import Unduhan from './pages/Unduhan';
import { SchoolLogo } from './components/SchoolLogo';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Home, Menu, X, Loader2, Newspaper, Trophy, Users, Palette, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import GalleryManagement from './pages/admin/GalleryManagement';
import { ThemeProvider } from './lib/theme';
import { PublicLayout } from './components/PublicLayout';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: (() => void) | null = null;

    const checkAuth = async () => {
      // Check emergency local session first
      const localSession = localStorage.getItem('admin_session');
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          if (sessionData.bypass) {
            setUser({ displayName: 'Master Admin (Mode Darurat)', email: 'admin18@internal' });
            setIsAdmin(true);
            return;
          }
        } catch (e) {
          localStorage.removeItem('admin_session');
        }
      }

      unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              await signOut(auth);
              navigate('/login');
            }
          } catch (e) {
            console.error("Firestore auth check failed:", e);
            setIsAdmin(true); 
          }
        } else {
          const stillLocal = localStorage.getItem('admin_session');
          if (!stillLocal) {
            setIsAdmin(false);
            if (location.pathname.startsWith('/admin')) {
              navigate('/login');
            }
          }
        }
      });
    };

    checkAuth();
    return () => {
      if (unsub) (unsub as () => void)();
    };
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    await signOut(auth).catch(() => {});
    navigate('/login');
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-200 animate-pulse">
            <SchoolLogo size="h-8" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-black text-school-navy uppercase tracking-[0.4em] animate-pulse">Memverifikasi Sesi...</p>
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
    { icon: <Palette className="h-5 w-5" />, label: 'Ekstrakurikuler', path: '/admin/extracurricular' },
    { icon: <ImageIcon className="h-5 w-5" />, label: 'Galeri Sekolah', path: '/admin/gallery' },
    { icon: <Users className="h-5 w-5" />, label: 'Guru & Staff', path: '/admin/staff' },
    { icon: <SettingsIcon className="h-5 w-5" />, label: 'Pengaturan Sekolah', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-school-navy text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 px-6 border-b border-white/10">
          <SchoolLogo size="h-8" variant="white" />
          <span className="text-lg font-bold">Admin SMPN 18</span>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
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
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.displayName || 'Administrator'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'admin'}`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>
        
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

function DashboardPlaceholder() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Berita" value="12" subtitle="3 bulan terakhir" />
        <StatCard title="Total Guru" value="48" subtitle="Aktif mengajar" />
        <StatCard title="Pengunjung Hari Ini" value="156" subtitle="+12% dari kemarin" />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <p className="text-4xl font-bold text-slate-900 mt-2">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profil/sambutan" element={<PublicLayout><SambutanKepalaSekolah /></PublicLayout>} />
          <Route path="/profil/visi-misi" element={<PublicLayout><VisiMisi /></PublicLayout>} />
          <Route path="/berita" element={<PublicLayout><BeritaList /></PublicLayout>} />
          <Route path="/ekstrakurikuler" element={<PublicLayout><EkstrakurikulerList /></PublicLayout>} />
          <Route path="/prestasi" element={<PublicLayout><PrestasiList /></PublicLayout>} />
          <Route path="/unduhan" element={<PublicLayout><Unduhan /></PublicLayout>} />
          <Route path="/kontak" element={<PublicLayout><KontakPage /></PublicLayout>} />
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/news" element={<NewsManagement />} />
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
    </ThemeProvider>
  );
}


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Sun, 
  Moon,
  Home,
  Newspaper,
  Trophy,
  Palette,
  Phone,
  Info,
  Target,
  Download
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { useTheme } from '../lib/theme';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Berita', href: '/berita', icon: <Newspaper className="h-4 w-4" />, isHash: false },
    { label: 'Ekstrakurikuler', href: '/ekstrakurikuler', icon: <Palette className="h-4 w-4" />, isHash: false },
    { label: 'Prestasi', href: '/prestasi', icon: <Trophy className="h-4 w-4" />, isHash: false },
    { label: 'Unduhan', href: '/unduhan', icon: <Download className="h-4 w-4" />, isHash: false },
    { label: 'Kontak', href: '/kontak', icon: <Phone className="h-4 w-4" />, isHash: false },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-school-navy/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-6 h-20 md:h-24 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 md:gap-4 flex-shrink-0 group">
          <SchoolLogo size="h-10 md:h-12" variant="white" className="group-hover:scale-110 transition-transform" />
          <div className="leading-tight">
            <span className="text-sm md:text-xl font-black uppercase tracking-tighter text-white">SMPN 18 Banjarmasin</span>
            <p className="text-[8px] md:text-[10px] font-black text-school-yellow uppercase tracking-[0.5em] mt-0.5 md:mt-1 font-mono">A L A M A N D A</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {/* Profil Sekolah Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button className="flex items-center gap-1.5 text-[11px] font-black text-white/70 hover:text-school-yellow transition-colors py-3 group uppercase tracking-widest outline-none">
              Profil Sekolah
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-school-yellow' : 'text-white/30 group-hover:text-school-yellow'}`} />
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-full right-0 w-64 bg-school-navy dark:bg-slate-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-2 mt-1 overflow-hidden"
                >
                  {[
                    { label: 'Sambutan Kepala Sekolah', href: '/profil/sambutan' },
                    { label: 'Visi & Misi', href: '/profil/visi-misi' }
                  ].map((link, idx) => (
                    <Link 
                      key={idx} 
                      to={link.href} 
                      className="block p-4 rounded-2xl hover:bg-white/5 text-[11px] font-black text-white/50 hover:text-school-yellow transition-all uppercase tracking-widest"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map(link => (
            <Link 
              key={link.label}
              to={link.href} 
              className={`text-[11px] font-black transition-colors uppercase tracking-widest ${location.pathname === link.href ? 'text-school-yellow' : 'text-white/70 hover:text-school-yellow'}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-6 w-px bg-white/10 mx-2"></div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-90 flex items-center justify-center"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-school-yellow fill-school-yellow/20" /> : <Moon className="h-4 w-4 fill-white/10" />}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-white/5 rounded-xl text-white"
          >
           {theme === 'dark' ? <Sun className="h-5 w-5 text-school-yellow" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 bg-school-yellow text-school-navy rounded-xl shadow-lg shadow-school-yellow/20"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-white dark:bg-slate-900 z-[101] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-school-navy rounded-xl">
                    <SchoolLogo size="h-6" variant="white" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-black text-school-navy dark:text-white uppercase tracking-tight">Menu Utama</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">SMPN 18 BJM</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-school-navy dark:hover:text-white bg-gray-100 dark:bg-slate-800 rounded-xl"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
                {/* Home Link */}
                <Link 
                  to="/" 
                  className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${location.pathname === '/' ? 'bg-school-navy text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <Home className={`h-5 w-5 ${location.pathname === '/' ? 'text-school-yellow' : 'text-slate-400'}`} />
                  BERANDA
                </Link>

                <div className="py-2 px-2">
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Sekolah</p>
                </div>

                <Link 
                  to="/profil/sambutan" 
                  className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${location.pathname === '/profil/sambutan' ? 'bg-school-navy text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <Info className={`h-5 w-5 ${location.pathname === '/profil/sambutan' ? 'text-school-yellow' : 'text-slate-400'}`} />
                  SAMBUTAN KEPSEK
                </Link>
                <Link 
                  to="/profil/visi-misi" 
                  className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${location.pathname === '/profil/visi-misi' ? 'bg-school-navy text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <Target className={`h-5 w-5 ${location.pathname === '/profil/visi-misi' ? 'text-school-yellow' : 'text-slate-400'}`} />
                  VISI & MISI
                </Link>

                <div className="py-2 px-2">
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Informasi</p>
                </div>

                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    to={link.href} 
                    className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase ${location.pathname === link.href ? 'bg-school-navy text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  >
                    <span className={`${location.pathname === link.href ? 'text-school-yellow' : 'text-slate-400'}`}>
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ONLINE</p>
                </div>
                <SchoolLogo size="h-5" variant="color" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

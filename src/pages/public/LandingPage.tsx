import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  Menu, 
  Image as ImageIcon, 
  CheckCircle2, 
  Star, 
  ChevronDown, 
  Trophy, 
  Palette, 
  Phone,
  Award,
  Hash,
  School,
  Clock,
  MessageCircle,
  Quote,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { SchoolLogo } from '../../components/SchoolLogo';
import { 
  getNews, 
  getAchievements, 
  getStaff, 
  getSchoolSettings,
  getGallery,
  getExtracurriculars,
  getPrograms,
  NewsItem, 
  Achievement, 
  Staff,
  SchoolSettings,
  GalleryItem,
  Extracurricular,
  SchoolProgram
} from '../../services/schoolService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { useTheme } from '../../lib/theme';
import Pagination from '../../components/admin/Pagination';
import { X } from 'lucide-react';

export default function LandingPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [liveAchievements, setLiveAchievements] = useState<Achievement[]>([]);
  const [liveStaff, setLiveStaff] = useState<Staff[]>([]);
  const [liveGallery, setLiveGallery] = useState<GalleryItem[]>([]);
  const [liveEkskuls, setLiveEkskuls] = useState<Extracurricular[]>([]);
  const [livePrograms, setLivePrograms] = useState<SchoolProgram[]>([]);
  const [liveSettings, setLiveSettings] = useState<SchoolSettings | null>(null);
  const { theme } = useTheme();

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  // Detail Modals State
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedEkskul, setSelectedEkskul] = useState<Extracurricular | null>(null);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8 } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const GalleryMarquee = () => {
    // Collect images from all sections
    const allImages = [
      ...liveGallery.map(i => i.image),
      ...liveNews.filter(n => n.image).map(n => n.image),
      ...liveEkskuls.filter(e => e.image).map(e => e.image!),
      ...livePrograms.filter(p => p.image).map(p => p.image!),
      ...liveAchievements.filter(a => a.image).map(a => a.image!),
    ].filter(img => img && img.trim() !== '');

    if (allImages.length === 0) return null;

    // Use a mix of all images for the marquee
    const items = [...allImages, ...allImages, ...allImages];
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-8 opacity-45 dark:opacity-25">
          {[...Array(4)].map((_, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const duration = 70 + (rowIndex * 20);
            const startX = isEven ? "0%" : "-33.33%";
            const endX = isEven ? "-33.33%" : "0%";
            
            return (
              <motion.div 
                key={`ultra-row-${rowIndex}`}
                className="flex gap-4 md:gap-6 w-max"
                initial={false}
                animate={{ x: [startX, endX] }}
                transition={{ 
                  duration, 
                  ease: "linear", 
                  repeat: Infinity,
                }}
                style={{ willChange: "transform" }}
              >
                {items.map((imgUrl, index) => (
                  <div 
                    key={`marquee-photo-${rowIndex}-${index}`} 
                    className="w-48 h-32 md:w-80 md:h-52 rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-md border border-white/40 dark:border-slate-800/40"
                  >
                    <img 
                      src={imgUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
        {/* Subtle Overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40 dark:from-slate-950/20 dark:via-transparent dark:to-slate-950/20" />
      </div>
    );
  };

  // Pagination States for Landing Page Sections
  const [newsPage, setNewsPage] = useState(1);
  const [achievementsPage, setAchievementsPage] = useState(1);
  const [ekskulPage, setEkskulPage] = useState(1);

  // Reset to page 1 if data changes
  useEffect(() => {
    setNewsPage(1);
  }, [liveNews.length]);

  useEffect(() => {
    setAchievementsPage(1);
  }, [liveAchievements.length]);

  useEffect(() => {
    setEkskulPage(1);
  }, [liveEkskuls.length]);
  
  const itemsPerPage = {
    news: 3,
    achievements: 4,
    ekskul: 4
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const displayedStaff = liveStaff.slice(0, 8);

  const paginatedNews = liveNews.length > 0 
    ? liveNews.slice((newsPage - 1) * itemsPerPage.news, newsPage * itemsPerPage.news)
    : [];
  const paginatedAchievements = liveAchievements.slice((achievementsPage - 1) * itemsPerPage.achievements, achievementsPage * itemsPerPage.achievements);
  const paginatedEkskuls = liveEkskuls.slice((ekskulPage - 1) * itemsPerPage.ekskul, ekskulPage * itemsPerPage.ekskul);

  useEffect(() => {
    // Register real-time listeners for public collections
    const unsubscribeNews = getNews(setLiveNews);
    const unsubscribeAchievements = getAchievements(setLiveAchievements);
    const unsubscribeStaff = getStaff(setLiveStaff);
    const unsubscribeGallery = getGallery(setLiveGallery);
    const unsubscribeEkskuls = getExtracurriculars(setLiveEkskuls);
    const unsubscribePrograms = getPrograms(setLivePrograms);

    // Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setLiveSettings(snap.data() as SchoolSettings);
    });

    return () => {
      unsubscribeNews();
      unsubscribeAchievements();
      unsubscribeStaff();
      unsubscribeGallery();
      unsubscribeEkskuls();
      unsubscribePrograms();
      unsubSettings();
    };
  }, []);

  const headmasterStaff = liveStaff.find(s => s.role === 'Kepala Sekolah');

  const school = liveSettings || {
    schoolName: "SMP Negeri 18 Banjarmasin",
    tagline: "Mewujudkan Generasi Alamanda",
    motto: "Amanah, Mandiri, Adaptif",
    address: "Jl. Kelayan Besar 1 RT.3 Kel.Tanjung Pagar",
    headmasterName: "Kepala Sekolah",
    headmasterQuote: "",
    headmasterImage: "",
    email: "info@smpn18bjm.sch.id",
    phone: "(0511) 3254397",
    mapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3521.4433467359313!2d114.59798697437695!3d-3.3459399413449336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2de4214137890267%3A0x6f8f97091ca5e78b!2sSMPN%2018%20Banjarmasin!5e1!3m2!1sid!2sid!4v1778731317053!5m2!1sid!2sid",
    studentCount: "768",
    teacherCount: "54",
    classCount: "24",
    accreditation: "A"
  };

  const headmasterName = headmasterStaff?.name || school.headmasterName || 'Kepala Sekolah';
  const headmasterImage = headmasterStaff?.image || school.headmasterImage || 'https://images.unsplash.com/photo-1544717305-27a734ef1904?q=80&w=600&h=800&auto=format&fit=crop';
  const headmasterQuote = school.headmasterQuote || 'Selamat datang di digital portal resmi SMPN 18 Banjarmasin, wadah informasi untuk seluruh warga sekolah.';

  const name = school.schoolName || (school as any).name;

  const stats = [
    { label: 'Siswa Aktif', value: school.studentCount || '768', icon: <Users className="h-5 w-5" /> },
    { label: 'Guru & Staff', value: liveStaff.length > 0 ? liveStaff.length.toString() : (school.teacherCount || '54'), icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Rombel', value: school.classCount || '24', icon: <ImageIcon className="h-5 w-5" /> },
    { label: 'Akreditasi', value: school.accreditation || 'A', icon: <Calendar className="h-5 w-5" /> },
  ];

  const getMapsUrl = (input: string) => {
    if (!input) return "";
    // If user pasted the whole iframe tag
    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <header className="relative bg-white dark:bg-slate-950 pt-20 pb-40 px-6 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <GalleryMarquee />
        <div className="mx-auto max-w-7xl text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-school-yellow/10 dark:bg-school-yellow/5 blur-3xl rounded-full animate-pulse"></div>
                <SchoolLogo size="h-48 md:h-56" className="relative drop-shadow-2xl" />
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-7xl font-black leading-tight tracking-tighter mb-4 text-school-yellow drop-shadow-sm"
            >
              {name}
            </motion.h1>
            
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-6xl font-black text-school-navy dark:text-white leading-tight tracking-tighter mb-4"
            >
              Mewujudkan Generasi
            </motion.h2>

            <motion.h2 
              variants={itemVariants}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-[5.5rem] font-black text-school-red leading-tight tracking-[0.2em] mb-8 drop-shadow-sm"
            >
              A L A M A N D A
            </motion.h2>

            <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg md:text-xl text-school-slate dark:text-slate-400 font-medium italic">
                "{school.tagline}"
              </p>
              <p className="text-sm md:text-base text-school-navy/60 dark:text-white/40 font-bold uppercase tracking-[0.3em]">
                {school.motto}
              </p>
            </motion.div>

          </motion.div>
        </div>
      </header>

      {/* STATS - Gaya Abang Sederhana */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-5xl">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((item, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 border-l-4 border-l-school-yellow border-y border-r border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-school-red mb-4">{item.label}</p>
                <p className="text-4xl font-black text-school-navy dark:text-white">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION SAMBUTAN SINGKAT */}
      <section className="py-32 px-6 bg-white dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
           <div className="flex flex-col lg:flex-row gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-left"
              >
                 <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4">Sambutan Hangat</span>
                 <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white mb-8 tracking-tight">Kepala Sekolah <br /> SMPN 18 Banjarmasin</h3>
                  <div className="relative mb-10">
                    <p className="text-2xl md:text-3xl font-black text-school-slate dark:text-slate-400 italic leading-tight">
                      "{headmasterQuote}"
                    </p>
                    <div className="absolute -top-6 -left-6 text-school-yellow/20 -z-10">
                       <Quote className="h-20 w-20" />
                    </div>
                 </div>
                 <p className="font-black text-lg text-school-navy dark:text-white mb-1">{headmasterName}</p>
                 <p className="text-[10px] font-black text-school-red uppercase tracking-widest mb-10">Kepala Sekolah</p>
                 <Link to="/profil/sambutan" className="inline-flex items-center gap-2 bg-school-navy dark:bg-school-yellow dark:text-school-navy text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm group shadow-xl shadow-school-navy/20">
                    Baca Sambutan Lengkap
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="w-full max-w-md lg:max-w-lg aspect-[5/6] bg-slate-100 dark:bg-slate-800 rounded-[4rem] overflow-hidden transition-all duration-700 shadow-2xl relative group"
              >
                 <img 
                   src={headmasterImage} 
                   alt="Kepala Sekolah" 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none rounded-[4rem]" />
              </motion.div>
           </div>
        </div>
      </section>
 
      {/* SECTION PROGRAM UNGGULAN */}
      {livePrograms.length > 0 && (
        <section className="py-32 px-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-left">
              <div>
                <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4 inline-block">Inovasi Sekolah</span>
                <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white tracking-tight">Program Sekolah</h3>
              </div>
              <Link to="/program" className="bg-school-navy dark:bg-school-yellow dark:text-school-navy text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20">
                Lihat Semua Program
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {livePrograms.slice(0, 3).map((prog, i) => (
                <motion.div 
                   key={prog.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="group bg-white dark:bg-slate-800 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all"
                >
                   <Link to={`/program/${prog.id}`} className="block relative aspect-video overflow-hidden">
                      <img 
                        src={prog.image || 'https://images.unsplash.com/photo-1577891720206-8850bb3c59de?q=80&w=800&auto=format&fit=crop'} 
                        alt={prog.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-6 left-6">
                        <span className="bg-school-yellow text-school-navy px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 block w-fit">Sejak {prog.startYear}</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{prog.name}</h4>
                      </div>
                   </Link>
                   <div className="p-8 text-left">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                        {stripHtml(prog.description)}
                      </p>
                      <Link to={`/program/${prog.id}`} className="inline-flex items-center gap-2 text-school-red font-black uppercase tracking-widest text-[10px] group/btn">
                        Lihat Detail Program
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION BERITA */}
      <section id="berita" className="py-32 px-6 bg-school-navy dark:bg-slate-950 border-y border-white/5 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-6"
          >
            <div>
               <span className="text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center gap-2">
                 <div className="h-1 w-8 bg-school-red rounded-full"></div>
                 Update Kegiatan
               </span>
               <h3 className="text-4xl font-black text-white">Warta & Pengumuman</h3>
            </div>
            <Link to="/berita" className="bg-school-yellow text-school-navy px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-school-yellow/10 flex items-center gap-2 group">
              Halaman Berita Selengkapnya 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-12 min-h-[400px]"
          >
            {(paginatedNews.length > 0 ? paginatedNews : (liveNews.length === 0 ? [1, 2, 3] : [])).map((item, i) => {
              const isLive = typeof item === 'object' && item !== null;
              const newsItem = isLive ? (item as NewsItem) : null;
              
              const title = isLive ? newsItem?.title : "Agenda Tahunan Sekolah dan Persiapan Ujian Akhir Semester";
              const date = isLive ? newsItem?.date : "17 April 2026";
              const excerpt = isLive ? newsItem?.excerpt : "Seluruh elemen sekolah bersiap untuk menyambut pekan ujian dengan berbagai bimbingan belajar tambahan...";
              const category = isLive ? newsItem?.category : "Informasi";
              const image = (isLive && newsItem?.image) ? newsItem.image : (isLive ? 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop' : `https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop`);

              return (
                <motion.div 
                  key={isLive ? (newsItem?.id || i) : `placeholder-${i}`} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 dark:bg-slate-900 border border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:bg-white/10 transition-all h-full flex flex-col"
                >
                  <Link to={isLive ? `/berita/${newsItem?.id}` : '#'} className="block h-full flex flex-col">
                    <div className="aspect-video bg-slate-800 overflow-hidden relative">
                      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-school-navy text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-school-yellow">{category}</span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                      <h4 className="text-xl font-bold text-white my-4 line-clamp-2 leading-tight group-hover:text-school-yellow transition-colors">
                        {title}
                      </h4>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-8 leading-relaxed flex-1">{excerpt}</p>
                      <div className="text-school-yellow font-bold text-xs uppercase tracking-widest flex items-center gap-2 group/btn mt-auto">
                        Selengkapnya 
                        <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {liveNews.length > itemsPerPage.news && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex justify-center mt-12"
            >
              <Pagination 
                currentPage={newsPage}
                totalItems={liveNews.length}
                itemsPerPage={itemsPerPage.news}
                onPageChange={setNewsPage}
                colorScheme="navy"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION EKSTRAKURIKULER */}
      <section id="ekstrakurikuler" className="py-32 px-6 bg-blue-50/50 dark:bg-slate-900 border-y border-blue-100 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
          >
            <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4">Pengembangan Diri</span>
            <h3 className="text-4xl font-black text-school-navy dark:text-white mb-16">Ekstrakurikuler Sekolah</h3>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {paginatedEkskuls.map((ekskul, i) => (
              <motion.div 
                key={ekskul.id} 
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedEkskul(ekskul)}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center group hover:bg-school-navy dark:hover:bg-school-yellow transition-all duration-500 cursor-pointer shadow-md hover:shadow-school-yellow/20"
              >
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center text-school-red group-hover:text-white dark:group-hover:text-school-navy mb-6 shadow-md shadow-black/5 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Star className="h-6 w-6" />
                </div>
                <span className="font-bold uppercase tracking-[0.2em] text-sm mb-2 group-hover:text-white dark:group-hover:text-school-navy text-center">{ekskul.name}</span>
                <span className="text-[10px] opacity-60 font-medium uppercase tracking-widest group-hover:text-school-yellow dark:group-hover:text-school-navy transition-colors line-clamp-1">{ekskul.category}</span>
              </motion.div>
            ))}
          </motion.div>

          {liveEkskuls.length > itemsPerPage.ekskul && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex justify-center mt-12"
            >
              <Pagination 
                currentPage={ekskulPage}
                totalItems={liveEkskuls.length}
                itemsPerPage={itemsPerPage.ekskul}
                onPageChange={setEkskulPage}
                colorScheme="blue"
              />
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <Link 
              to="/ekstrakurikuler" 
              className="inline-flex items-center gap-3 bg-school-navy dark:bg-school-yellow text-white dark:text-school-navy px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-yellow-400 transition-all shadow-2xl shadow-school-navy/20 dark:shadow-school-yellow/10 group"
            >
              Lihat Semua Kegiatan Siswa
              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION PRESTASI */}
      <section id="prestasi" className="py-32 px-6 bg-school-navy dark:bg-slate-950 border-y border-white/5 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8"
          >
            <div className="max-w-xl text-left">
              <span className="text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-red underline-offset-8 decoration-4 inline-block">Kebanggaan Sekolah</span>
              <h3 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Apresiasi Prestasi <br/> Generasi ALAMANDA
              </h3>
            </div>
            <Link to="/prestasi" className="bg-school-yellow text-school-navy px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-school-yellow/20">
              Kumpulan Informasi Prestasi
            </Link>
          </motion.div>
 
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {paginatedAchievements.map((pres, i) => (
              <motion.div 
                key={(pres as any).id || i}
                variants={{
                  hidden: { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
                }}
                whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
                onClick={() => setSelectedAchievement(pres)}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-[3rem] flex flex-col sm:flex-row gap-8 items-center group hover:shadow-2xl transition-all cursor-pointer shadow-md"
              >
                <div className="h-24 w-24 flex-shrink-0 bg-white/10 rounded-[2rem] flex items-center justify-center text-school-yellow group-hover:bg-school-yellow group-hover:text-school-navy transition-all duration-700 shadow-md">
                  <Trophy className="h-10 w-10" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-school-yellow uppercase tracking-widest">{pres.year}</span>
                    <div className="h-px w-8 bg-white/20"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {(pres as any).loc || 'Umum'}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-white leading-tight group-hover:text-school-yellow transition-colors">
                    {pres.title}
                  </h4>
                  {pres.winner && <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-widest">{pres.winner}</p>}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {liveAchievements.length > itemsPerPage.achievements && (
            <div className="flex justify-center">
              <Pagination 
                currentPage={achievementsPage}
                totalItems={liveAchievements.length}
                itemsPerPage={itemsPerPage.achievements}
                onPageChange={setAchievementsPage}
                colorScheme="amber"
              />
            </div>
          )}
        </div>
      </section>

      {/* SECTION GALERI */}
      {liveGallery.length > 0 && (
        <section className="py-32 px-6 bg-slate-50 dark:bg-slate-900 overflow-hidden border-y border-slate-300 dark:border-slate-800 transition-colors duration-300">
          <div className="mx-auto max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8"
            >
              <div className="max-w-xl text-left">
                <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center gap-2">
                  <div className="h-1 w-8 bg-school-yellow rounded-full"></div>
                  Lensa Kegiatan
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white mb-4 tracking-tight">Galeri ALAMANDA</h3>
              </div>
              <Link to="/galeri" className="bg-school-navy dark:bg-school-yellow dark:text-school-navy text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/10">
                Lihat Galeri Lengkap
              </Link>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex gap-6 overflow-x-auto pb-12 px-4 hide-scrollbar snap-x cursor-grab"
            >
              {liveGallery.map((photo, i) => (
                <motion.div 
                  key={photo.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
                    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.6, ease: "backOut" } }
                  }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className="flex-shrink-0 w-[300px] md:w-[400px] aspect-[4/3] rounded-[2.5rem] overflow-hidden relative group snap-center shadow-xl shadow-black/5 dark:shadow-black/20"
                >
                  <img src={photo.image} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-school-navy/80 via-transparent p-8 flex flex-col justify-end text-left opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-black text-school-yellow uppercase tracking-widest mb-2">{photo.category}</span>
                     <h4 className="text-white font-bold text-lg leading-tight">{photo.title}</h4>
                  </div>
                </motion.div>
              ))}
              <motion.div 
                variants={itemVariants}
                className="flex-shrink-0 w-[300px] flex items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700"
              >
                 <Link to="/galeri" className="text-center group">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-school-navy dark:text-white mx-auto mb-4 group-hover:bg-school-navy dark:group-hover:bg-school-yellow dark:group-hover:text-school-navy group-hover:text-white transition-all">
                       <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-school-navy dark:text-white text-sm">Lihat Lebih Banyak</p>
                 </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION STAFF */}
      {liveStaff.length > 0 && (
        <section id="staf" className="py-32 px-6 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
          <div className="mx-auto max-w-7xl">
            <div className="text-left mb-16">
              <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4 inline-block">Tenaga Pendidik</span>
              <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white tracking-tight">Guru & Pengajar</h3>
            </div>
            
            <motion.div 
              ref={scrollRef}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-8 overflow-x-auto pb-12 px-4 hide-scrollbar snap-x scroll-smooth cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: 'smooth' }}
            >
              {displayedStaff.map((staf, i) => (
                <motion.div 
                  key={staf.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="flex-shrink-0 w-[240px] md:w-[280px] snap-center group/card"
                >
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6 border border-slate-200 dark:border-slate-700 relative group shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={staf.image || `https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=600&h=800&auto=format&fit=crop`} 
                      alt={staf.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-school-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                       <span className="text-[10px] font-black text-school-yellow uppercase tracking-widest mb-1">{staf.role}</span>
                       <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-tight">{staf.name.split(',')[0]}</h4>
                    </div>
                    {/* Floating badge for teachers */}
                    <div className="absolute top-6 right-6 h-10 w-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                       <GraduationCap className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-lg text-school-navy dark:text-white mb-1 group-hover/card:text-school-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis">{staf.name}</h4>
                    <p className="text-[10px] font-black text-school-red dark:text-school-yellow uppercase tracking-widest">{staf.role}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* Extra card for "See More" */}
              <Link 
                to="/staf"
                className="flex-shrink-0 w-[240px] md:w-[280px] snap-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                  <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:text-school-red group-hover:bg-white dark:group-hover:bg-slate-800 transition-all mb-6">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                  <p className="font-black text-school-navy dark:text-white uppercase tracking-widest text-center text-sm">Lihat Seluruh Direktori</p>
              </Link>
            </motion.div>

            {/* Navigation Buttons Below */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <button 
                onClick={() => scroll('left')}
                className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-school-red hover:border-school-red transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-school-red hover:border-school-red transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION KONTAK */}
      <section id="kontak" className="py-32 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-left"
              >
                 <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-4">Hubungi Kami</span>
                 <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white mb-8 tracking-tight">Informasi Layanan <br/> & Korespondensi</h3>
                 <p className="text-school-slate dark:text-slate-400 mb-12 text-lg leading-relaxed max-w-lg">
                   Hubungi kami melalui saluran berikut.
                 </p>
                 
                 <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                       <div className="h-14 w-14 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center text-school-red flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                          <MapPin className="h-6 w-6" />
                       </div>
                        <div>
                          <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-school-slate dark:text-slate-500 mb-2">Lokasi</p>
                          <p className="font-bold text-school-navy dark:text-white text-lg leading-relaxed">{school.address}</p>
                       </div>
                    </div>
                    <div className="flex gap-6 items-start">
                       <div className="h-14 w-14 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center text-school-red flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                          <Phone className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-school-slate dark:text-slate-500 mb-2">Nomor Telepon</p>
                          <p className="font-bold text-school-navy dark:text-white text-lg leading-relaxed">
                            {school.email} <br/> 
                            {school.phone}
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-[4rem] overflow-hidden relative shadow-2xl shadow-black/5 group border-8 border-slate-200 dark:border-slate-800"
              >
                 <iframe 
                   src={getMapsUrl(school.mapsUrl)} 
                   className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
                   allowFullScreen={true} 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                 ></iframe>
              </motion.div>
           </div>
        </div>
      </section>

      {/* FLOAT WA BUTTON */}
      <a 
        href={`https://wa.me/${school.phone?.replace(/[^0-9]/g, '') || '628123456789'}?text=Halo%20Admin%20SMPN%2018%20Banjarmasin,%20saya%20ingin%20bertanya...`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold text-sm group-hover:max-w-xs group-hover:ml-3 transition-all duration-500">
          Tanya Kami (WhatsApp)
        </span>
      </a>

      {/* DETAIL MODALS */}
      <AnimatePresence>
        {selectedEkskul && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detail Ekstrakurikuler</h2>
                <button onClick={() => setSelectedEkskul(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-6 w-6 dark:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
                  <img src={selectedEkskul.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop'} alt={selectedEkskul.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-3xl font-black text-school-navy dark:text-white mb-2">{selectedEkskul.name}</h3>
                <span className="inline-block px-4 py-1 bg-school-red/10 text-school-red rounded-full text-[10px] font-black uppercase tracking-widest mb-6">{selectedEkskul.category}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{selectedEkskul.description}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pembimbing</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedEkskul.mentor || '-'}</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jadwal</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedEkskul.schedule || '-'}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedAchievement && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detail Prestasi</h2>
                <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-6 w-6 dark:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center gap-6 mb-8">
                   <div className="h-20 w-20 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                      <Trophy className="h-10 w-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-school-navy dark:text-white leading-tight mb-1">{selectedAchievement.title}</h3>
                      <p className="text-sm font-bold text-school-red">{selectedAchievement.winner}</p>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peringkat</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.rank}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tahun</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.year}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedAchievement.category || 'Umum'}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Deskripsi Prestasi</h4>
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl">
                     {selectedAchievement.description || 'Data deskripsi prestasi tidak tersedia.'}
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

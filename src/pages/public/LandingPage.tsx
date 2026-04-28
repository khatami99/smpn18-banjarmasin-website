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
  Moon
} from 'lucide-react';

import { SchoolLogo } from '../../components/SchoolLogo';
import { 
  getNews, 
  getAchievements, 
  getStaff, 
  getSchoolSettings,
  getGallery,
  NewsItem, 
  Achievement, 
  Staff,
  SchoolSettings,
  GalleryItem
} from '../../services/schoolService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { useTheme } from '../../lib/theme';

export default function LandingPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [liveAchievements, setLiveAchievements] = useState<Achievement[]>([]);
  const [liveStaff, setLiveStaff] = useState<Staff[]>([]);
  const [liveGallery, setLiveGallery] = useState<GalleryItem[]>([]);
  const [liveSettings, setLiveSettings] = useState<SchoolSettings | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Register real-time listeners for public collections
    const unsubscribeNews = getNews(setLiveNews);
    const unsubscribeAchievements = getAchievements(setLiveAchievements);
    const unsubscribeStaff = getStaff(setLiveStaff);
    const unsubscribeGallery = getGallery(setLiveGallery);

    // Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setLiveSettings(snap.data() as SchoolSettings);
    });

    return () => {
      unsubscribeNews();
      unsubscribeAchievements();
      unsubscribeStaff();
      unsubscribeGallery();
      unsubSettings();
    };
  }, []);

  const school = liveSettings || {
    schoolName: "SMP Negeri 18 Banjarmasin",
    tagline: "Mewujudkan Generasi Alamanda",
    motto: "Amanah, Mandiri, Adaptif",
    address: "Jl. Pemuda No. 18, Banjarmasin",
    headmasterName: "Kepala Sekolah",
    headmasterQuote: "",
    headmasterImage: ""
  };

  const name = (school as any).schoolName || (school as any).name;

  const stats = [
    { label: 'Siswa Aktif', value: (school as any).studentCount || '768', icon: <Users className="h-5 w-5" /> },
    { label: 'Guru & Staff', value: (school as any).teacherCount || '54', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Rombel', value: (school as any).classCount || '24', icon: <ImageIcon className="h-5 w-5" /> },
    { label: 'Akreditasi', value: (school as any).accreditation || 'A', icon: <Calendar className="h-5 w-5" /> },
  ];

  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <header className="relative bg-white dark:bg-slate-950 pt-20 pb-32 px-6 overflow-hidden border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-school-yellow/10 dark:bg-school-yellow/5 blur-3xl rounded-full"></div>
                <SchoolLogo size="h-48 md:h-56" className="relative drop-shadow-2xl" />
              </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tighter mb-4 text-school-yellow drop-shadow-sm">
              {name}
            </h1>
            
            <h2 className="text-3xl md:text-6xl font-black text-school-navy dark:text-white leading-tight tracking-tighter mb-4">
              Mewujudkan Generasi
            </h2>

            <h2 className="text-5xl md:text-[5.5rem] font-black text-school-red leading-tight tracking-[0.2em] mb-8 drop-shadow-sm">
              A L A M A N D A
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg md:text-xl text-school-slate dark:text-slate-400 font-medium italic">
                "{school.tagline}"
              </p>
              <p className="text-sm md:text-base text-school-navy/60 dark:text-white/40 font-bold uppercase tracking-[0.3em]">
                {school.motto}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
               <Link to="/profil/sambutan" className="bg-school-navy dark:bg-school-yellow dark:text-school-navy text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-school-navy/20 dark:shadow-school-yellow/5 hover:scale-105 transition-all flex items-center gap-2 group">
                 Lihat Profil Sekolah
                 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
               <a href="#berita" className="bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-school-navy dark:text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                 Baca Berita Terbaru
               </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* STATS - Gaya Abang Sederhana */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border-l-4 border-l-school-yellow border-y border-r border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-school-red mb-4">{item.label}</p>
                <p className="text-4xl font-black text-school-navy dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION SAMBUTAN SINGKAT */}
      <section className="py-32 px-6 bg-white dark:bg-slate-950 overflow-hidden border-b border-slate-50 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
           <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 text-left">
                 <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-2">Sambutan Hangat</span>
                 <h3 className="text-4xl md:text-5xl font-black text-school-navy dark:text-white mb-8 tracking-tight">Kepala Sekolah <br /> SMPN 18 Banjarmasin</h3>
                 <div className="relative mb-10">
                    <p className="text-2xl md:text-3xl font-black text-school-slate dark:text-slate-400 italic leading-tight">
                      "{school.headmasterQuote || 'Selamat datang di digital portal resmi SMPN 18 Banjarmasin, wadah informasi untuk seluruh warga sekolah.'}"
                    </p>
                    <div className="absolute -top-6 -left-6 text-school-yellow/20 -z-10">
                       <Quote className="h-20 w-20" />
                    </div>
                 </div>
                 <p className="font-black text-lg text-school-navy dark:text-white mb-1">{school.headmasterName || 'Master Admin'}</p>
                 <p className="text-[10px] font-black text-school-red uppercase tracking-widest mb-10">Kepala Sekolah</p>
                 <Link to="/profil/sambutan" className="inline-flex items-center gap-2 bg-school-navy dark:bg-school-yellow dark:text-school-navy text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm group shadow-xl shadow-school-navy/20">
                    Baca Sambutan Lengkap
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
              <div className="w-full max-w-md lg:max-w-lg aspect-[5/6] bg-slate-100 dark:bg-slate-800 rounded-[4rem] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl relative group">
                 <img 
                   src={school.headmasterImage || 'https://images.unsplash.com/photo-1544717305-27a734ef1904?q=80&w=600&h=800&auto=format&fit=crop'} 
                   alt="Kepala Sekolah" 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none rounded-[4rem]" />
              </div>
           </div>
        </div>
      </section>

      {/* SECTION BERITA */}
      <section id="berita" className="py-32 px-6 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-6">
            <div>
               <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center gap-2">
                 <div className="h-1 w-8 bg-school-yellow rounded-full"></div>
                 Update Kegiatan
               </span>
               <h3 className="text-4xl font-black text-school-navy dark:text-white">Warta & Pengumuman</h3>
            </div>
            <Link to="/berita" className="font-bold text-school-red flex items-center gap-2 group transition-all">
              Halaman Berita Selengkapnya 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {(liveNews.length > 0 ? liveNews : [1, 2, 3]).map((item, i) => {
              const isLive = typeof item === 'object';
              const title = isLive ? item.title : "Agenda Tahunan Sekolah dan Persiapan Ujian Akhir Semester";
              const date = isLive ? item.date : "17 April 2026";
              const excerpt = isLive ? item.excerpt : "Seluruh elemen sekolah bersiap untuk menyambut pekan ujian dengan berbagai bimbingan belajar tambahan...";
              const category = isLive ? item.category : "Informasi";
              const image = isLive ? item.image : `https://picsum.photos/seed/sch${i}/800/600`;

              return (
                <div key={isLive ? item.id : i} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 group hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-school-navy text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-school-yellow">{category}</span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-school-slate dark:text-slate-400 uppercase tracking-widest mb-4">
                      <Calendar className="h-3 w-3" />
                      <span>{date}</span>
                    </div>
                    <h4 className="text-xl font-bold text-school-navy dark:text-white my-4 line-clamp-2 leading-tight group-hover:text-school-red transition-colors">
                      {title}
                    </h4>
                    <p className="text-sm text-school-slate dark:text-slate-400 line-clamp-2 mb-8 leading-relaxed flex-1">{excerpt}</p>
                    <button className="text-school-red font-bold text-xs uppercase tracking-widest flex items-center gap-2 group/btn mt-auto">
                      Selengkapnya 
                      <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION EKSTRAKURIKULER */}
      <section id="ekstrakurikuler" className="py-32 px-6 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-2">Pengembangan Diri</span>
          <h3 className="text-4xl font-black text-school-navy dark:text-white mb-16">Ekstrakurikuler Wajib & Pilihan</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Pramuka', icon: <Users className="h-6 w-6" />, desc: 'Disiplin & Kepanduan' },
              { name: 'Seni Tari', icon: <Palette className="h-6 w-6" />, desc: 'Budaya & Kreativitas' },
              { name: 'PMR', icon: <Star className="h-6 w-6" />, desc: 'Kemanusiaan' },
              { name: 'Olahraga', icon: <Trophy className="h-6 w-6" />, desc: 'Kesehatan & Sportivitas' }
            ].map((ekskul, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center group hover:bg-school-navy dark:hover:bg-school-yellow transition-all duration-500 cursor-pointer shadow-sm hover:shadow-school-yellow/20">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-school-red mb-6 shadow-md shadow-black/5 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  {ekskul.icon}
                </div>
                <span className="font-bold uppercase tracking-[0.2em] text-sm mb-2 group-hover:text-white dark:group-hover:text-school-navy">{ekskul.name}</span>
                <span className="text-[10px] opacity-60 font-medium uppercase tracking-widest group-hover:text-school-yellow dark:group-hover:text-school-navy transition-colors">{ekskul.desc}</span>
              </div>
            ))}
          </div>
          <button onClick={() => window.location.href='/ekstrakurikuler'} className="inline-block mt-20 text-sm font-bold text-school-red uppercase tracking-widest border-b-2 border-school-yellow pb-1 hover:border-school-red transition-all">
            Lihat Semua Kegiatan Siswa →
          </button>
        </div>
      </section>

      {/* SECTION PRESTASI */}
      <section id="prestasi" className="py-32 px-6 bg-school-navy text-white rounded-[4rem] mx-4 md:mx-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-xl text-left">
              <span className="text-school-yellow font-black uppercase tracking-[0.3em] text-[10px] mb-4 block italic">Kebanggaan Sekolah</span>
              <h3 className="text-4xl md:text-5xl font-black leading-tight">
                Apresiasi Prestasi <br/> Generasi ALAMANDA
              </h3>
            </div>
            <Link to="/prestasi" className="bg-school-red text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-school-yellow hover:text-school-navy transition-all shadow-xl shadow-black/20">
              Kumpulan Informasi Prestasi
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(liveAchievements.length > 0 ? liveAchievements : [
              { title: 'Juara 1 Lomba Sains Terapan Nasional', loc: 'Banjarmasin', year: '2026' },
              { title: 'Medali Emas Kejuaraan Karate Tingkat Kota', loc: 'Banjarmasin', year: '2025' }
            ]).map((pres, i) => (
              <div key={(pres as any).id || i} className="bg-white/5 border border-white/10 p-12 rounded-[3rem] flex flex-col sm:flex-row gap-8 items-center group hover:bg-white/10 transition-all">
                <div className="h-24 w-24 flex-shrink-0 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-all duration-700 shadow-inner">
                  <Trophy className="h-10 w-10" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">{pres.year}</span>
                    <div className="h-px w-8 bg-white/20"></div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {(pres as any).loc || 'Umum'}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                    {pres.title}
                  </h4>
                  {pres.winner && <p className="text-sm text-white/40 mt-2 font-bold uppercase tracking-widest">{pres.winner}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION KONTAK */}
      <section id="kontak" className="py-32 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="text-left">
                 <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-2">Hubungi Kami</span>
                 <h3 className="text-4xl md:text-5xl font-black text-school-navy mb-8 tracking-tight">Informasi Layanan <br/> & Korespondensi</h3>
                 <p className="text-school-slate mb-12 text-lg leading-relaxed max-w-lg">
                   Punya pertanyaan? Tim kami siap melayani kebutuhan informasi wali murid, siswa, maupun masyarakat umum.
                 </p>
                 
                 <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                       <div className="h-14 w-14 rounded-3xl bg-slate-50 flex items-center justify-center text-school-red flex-shrink-0 shadow-sm border border-slate-100">
                          <MapPin className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-school-slate mb-2">Lokasi Fisik</p>
                          <p className="font-bold text-school-navy text-lg leading-relaxed">{school.address}</p>
                       </div>
                    </div>
                    <div className="flex gap-6 items-start">
                       <div className="h-14 w-14 rounded-3xl bg-slate-50 flex items-center justify-center text-school-red flex-shrink-0 shadow-sm border border-slate-100">
                          <Phone className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-school-slate mb-2">Saluran Digital</p>
                          <p className="font-bold text-school-navy text-lg leading-relaxed">(0511) 123456 • info@smpn18bjm.sch.id</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="h-[500px] bg-slate-100 rounded-[4rem] overflow-hidden relative shadow-2xl shadow-black/5 group border-8 border-slate-50">
                 <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 flex-col gap-6 group-hover:bg-slate-300 transition-colors duration-500">
                    <div className="p-8 bg-white rounded-full shadow-2xl animate-bounce">
                       <MapPin className="h-10 w-10 text-school-red" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Tampilan Peta Interaktif</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION GALERI */}
      {liveGallery.length > 0 && (
        <section className="py-32 px-6 bg-slate-50 overflow-hidden">
          <div className="mx-auto max-w-7xl text-center">
            <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center justify-center gap-2">
              <div className="h-1 w-8 bg-school-yellow rounded-full"></div>
              Lensa Kegiatan
              <div className="h-1 w-8 bg-school-yellow rounded-full"></div>
            </span>
            <h3 className="text-4xl font-black text-school-navy mb-16 tracking-tight">Galeri ALAMANDA</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {liveGallery.map((photo, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={photo.id} 
                  className={`relative group overflow-hidden rounded-[2rem] aspect-square ${i % 3 === 0 ? 'lg:col-span-2 lg:row-span-2 aspect-auto h-full' : ''}`}
                >
                  <img src={photo.image} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-school-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end text-left">
                     <span className="text-[10px] font-black text-school-yellow uppercase tracking-widest mb-2">{photo.category}</span>
                     <h4 className="text-white font-bold text-lg leading-tight">{photo.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION STAFF */}
      {liveStaff.length > 0 && (
        <section id="staf" className="py-32 px-6 bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl text-center">
            <span className="text-school-red font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-school-yellow underline-offset-8 decoration-2">Tenaga Pendidik</span>
            <h3 className="text-4xl font-black text-school-navy dark:text-white mb-16 tracking-tight">Guru & Staff Pengajar</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {liveStaff.slice(0, 8).map((staf, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={staf.id} 
                  className="group text-left"
                >
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6 border border-slate-100 dark:border-slate-800 relative group-hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={staf.image || 'https://images.unsplash.com/photo-1544717297-fa154da09f5b?q=80&w=400&h=500&auto=format&fit=crop'} 
                      alt={staf.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-school-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="px-2">
                    <h4 className="font-black text-lg text-school-navy dark:text-white leading-tight mb-1">{staf.name}</h4>
                    <p className="text-[10px] font-black text-school-red uppercase tracking-widest">{staf.role} {staf.subject ? `• ${staf.subject}` : ''}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {liveStaff.length > 8 && (
              <p className="mt-16 text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Dan {liveStaff.length - 8} Staff Lainnya</p>
            )}
          </div>
        </section>
      )}

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
    </div>
  );
}

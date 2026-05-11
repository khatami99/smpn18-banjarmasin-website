import { collection, addDoc, Timestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'sonner';

export const seedNews = async () => {
  const newsRef = collection(db, 'news');
  
  // Check if data already exists
  const q = query(newsRef, limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    if (!window.confirm("Data berita sudah ada. Apakah Anda ingin menambah 5 berita contoh lagi?")) {
      return;
    }
  }

  const sampleNews = [
    {
      title: "SMPN 18 Banjarmasin Raih Juara Umum Lomba Adiwiyata Tingkat Kota",
      excerpt: "Prestasi membanggakan kembali diraih oleh keluarga besar SMPN 18 Banjarmasin dalam ajang penghargaan lingkungan sekolah sehat.",
      content: "Banjarmasin - SMPN 18 Banjarmasin berhasil mengukir prestasi gemilang dengan meraih gelar Juara Umum dalam ajang Lomba Sekolah Adiwiyata tingkat Kota Banjarmasin tahun 2024. Penghargaan ini diberikan langsung oleh Walikota Banjarmasin atas dedikasi sekolah dalam menjaga kelestarian lingkungan dan inklusi pendidikan karakter berbasis lingkungan.\n\nKepala Sekolah menyatakan bahwa keberhasilan ini adalah buah kerja keras seluruh siswa, guru, dan staf yang bahu-membahu menciptakan ekosistem sekolah yang bersih, hijau, dan asri.",
      category: "Akademik",
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800",
      date: "2024-04-15",
      createdAt: Timestamp.now()
    },
    {
      title: "Kegiatan Market Day: Melatih Jiwa Kewirausahaan Siswa Sejak Dini",
      excerpt: "Halaman sekolah berubah menjadi pasar kreatif dalam kegiatan Market Day yang diikuti oleh seluruh siswa kelas 7 dan 8.",
      content: "Kegiatan Market Day yang rutin diadakan setiap semester kembali digelar dengan meriah. Siswa-siswi belajar bagaimana cara memproduksi barang, menentukan harga, hingga melakukan promosi kepada pembeli. Produk yang dijual beragam, mulai dari makanan tradisional Banjar hingga kerajinan tangan hasil daur ulang sampah plastik.",
      category: "Kesiswaan",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
      date: "2024-04-20",
      createdAt: Timestamp.now()
    },
    {
      title: "Workshop Literasi Digital bagi Guru dan Staf SMPN 18",
      excerpt: "Meningkatkan kualitas pengajaran di era digital, sekolah mengadakan pelatihan penggunaan AI dalam pembelajaran.",
      content: "Di era teknologi yang berkembang pesat, guru dituntut untuk terus berinovasi. Workshop ini menghadirkan narasumber ahli yang membahas cara mengoptimalkan platform pembelajaran digital untuk menciptakan suasana kelas yang lebih interaktif dan menyenangkan bagi siswa.",
      category: "Akademik",
      image: "https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80&w=800",
      date: "2024-04-25",
      createdAt: Timestamp.now()
    },
    {
      title: "Persiapan Ujian Akhir Semester Genap Tahun Ajaran 2023/2024",
      excerpt: "Diberitahukan kepada seluruh siswa agar mulai mempersiapkan diri menghadapi ujian yang akan dilaksanakan bulan depan.",
      content: "Pengumuman resmi mengenai jadwal ujian akhir semester telah dikeluarkan. Pihak sekolah menghimbau agar orang tua dapat mendampingi putra-putrinya dalam belajar di rumah dan menjaga kesehatan agar dapat mengikuti ujian dengan maksimal.",
      category: "Pengumuman",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
      date: "2024-05-01",
      createdAt: Timestamp.now()
    },
    {
      title: "Kemenangan Tim Basket Putra di Turnamen Antar SMP se-Kalsel",
      excerpt: "Semangat pantang menyerah membawa tim basket kebanggaan sekolah meraih trofi juara kedua.",
      content: "Tim basket putra SMPN 18 Banjarmasin menunjukkan performa luar biasa dalam ajang tahunan Basket antar sekolah menengah pertama. Meskipun harus puas dengan posisi kedua, kerja tim dan sportivitas yang ditunjukkan menjadi teladan bagi siswa lainnya.",
      category: "Kesiswaan",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
      date: "2024-04-10",
      createdAt: Timestamp.now()
    }
  ];

  let count = 0;
  for (const item of sampleNews) {
    await addDoc(newsRef, item);
    count++;
  }

  toast.success(`Berhasil menambahkan ${count} berita contoh!`);
};

# 🏫 Website Resmi SMPN 18 Banjarmasin

Website **SMPN 18 Banjarmasin** yang dilengkapi dengan sistem manajemen konten (CMS) internal untuk memudahkan pengelolaan informasi sekolah.

---

## ✨ Fitur Utama

-   **🏠 Beranda Dinamis**: Banner hero dengan animasi menarik dan ringkasan informasi sekolah.
-   **📖 Profil Sekolah**: Halaman sambutan Kepala Sekolah, Visi & Misi, serta sejarah sekolah.
-   **📰 Berita & Informasi**: Update kegiatan dan pengumuman terbaru sekolah.
-   **🏆 Prestasi**: Galeri capaian siswa-siswi SMPN 18 Banjarmasin.
-   **🎨 Ekstrakurikuler**: Informasi detail mengenai klub dan kegiatan luar kelas.
-   **📥 Pusat Unduhan**: Area bagi siswa/wali murid untuk mengunduh dokumen penting (PDF/DOCX).
-   **👨‍🏫 Dashboard Admin**: Panel khusus untuk mengelola data konten secara real-time.
-   **🌓 Mode Gelap/Terang**: Antarmuka yang ramah mata dengan dukungan Dark Mode.
-   **📱 Mobile Friendly**: Desain responsif yang optimal di semua perangkat (HP, Tablet, Laptop).

---

## 🛠️ Stack Teknologi

-   **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Animation**: [Motion](https://motion.dev/) (Framer Motion)
-   **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
-   **Bundler**: [Vite](https://vitejs.dev/)
-   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
Pastikan Anda sudah menginstal:
-   [Node.js](https://nodejs.org/) (Versi 18 ke atas)
-   npm atau yarn

### 2. Instalasi
Clone repository dan instal dependensi:
```bash
git clone https://github.com/username/smpn18-banjarmasin.git
cd smpn18-banjarmasin
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root folder dan masukkan konfigurasi Firebase Anda:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🏗️ Build untuk Produksi
Untuk melakukan kompilasi file yang siap dideploy:
```bash
npm run build
```
File hasil build akan berada di dalam direktori `dist/`.

---

## 🔒 Keamanan
Project ini menggunakan **Firestore Security Rules** untuk memastikan data admin tidak dapat diakses atau diubah oleh pihak yang tidak bertanggung jawab. Verifikasi email wajib dilakukan untuk akses ke dashboard admin.

---

## 📝 Lisensi
Aplikasi ini dibangun untuk kepentingan **SMPN 18 Banjarmasin**. Silakan gunakan atau modifikasi untuk keperluan pendidikan.

---

**Dibuat oleh [Muhammad Sauqi Khatami](mailto:sauqikhatami084@gmail.com)**

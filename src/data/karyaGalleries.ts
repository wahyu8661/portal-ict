export type KaryaGallerySlug = 'nf11-1-ak2' | 'aplikasi' | 'videoiklan' | 'videovlog';

export interface InfografisGalleryData {
  slug: 'nf11-1-ak2';
  kind: 'infografis';
  kategori: string;
  title: string;
  desc: string;
  kelas: string;
  mapel: string;
  images: { src: string; title: string; by: string; kelas: string }[];
}

export interface AplikasiGalleryData {
  slug: 'aplikasi';
  kind: 'aplikasi';
  kategori: string;
  title: string;
  tagline: string;
  by: string;
  kelas: string;
  mapel: string;
  desc: string;
  downloadUrl: string;
  downloadHint: string;
  features: string[];
  screenshots: { src: string; caption: string }[];
}

export interface VideoProsesGalleryData {
  slug: 'videoiklan';
  kind: 'video-proses';
  kategori: string;
  title: string;
  desc: string;
  by: string;
  kelas: string;
  mapel: string;
  videoProses: string;
  videoHasil: string;
}

export interface VlogGalleryData {
  slug: 'videovlog';
  kind: 'vlog';
  kategori: string;
  title: string;
  desc: string;
  kelas: string;
  mapel: string;
  videos: { url: string; title: string; by: string; kelas: string }[];
}

export type KaryaGalleryData =
  | InfografisGalleryData
  | AplikasiGalleryData
  | VideoProsesGalleryData
  | VlogGalleryData;

export const KARYA_GALLERIES: Record<KaryaGallerySlug, KaryaGalleryData> = {
  'nf11-1-ak2': {
    slug: 'nf11-1-ak2',
    kind: 'infografis',
    kategori: 'Infografis',
    title: 'Perbandingan Metode Pengembangan Perangkat Digital',
    desc: 'Kumpulan karya infografis siswa Kelas 11 yang membandingkan berbagai metode pengembangan perangkat lunak (MPPL) seperti Waterfall, Agile, Scrum, Prototype, hingga Spiral secara ringkas dan visual.',
    kelas: 'Kelas 11',
    mapel: 'Informatika',
    images: [
      { src: '/galeri-karya/NF11-1-AK2/img/1.png', title: 'Infografis Perbandingan MPPL — Karya 01', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/2.jpg', title: 'Infografis Perbandingan MPPL — Karya 02', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/3.png', title: 'Infografis Perbandingan MPPL — Karya 03', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/4.png', title: 'Infografis Perbandingan MPPL — Karya 04', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/5.png', title: 'Infografis Perbandingan MPPL — Karya 05', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/6.png', title: 'Infografis Perbandingan MPPL — Karya 06', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/7.jpg', title: 'Infografis Perbandingan MPPL — Karya 07', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/8.jpg', title: 'Infografis Perbandingan MPPL — Karya 08', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/9.jpg', title: 'Infografis Perbandingan MPPL — Karya 09', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
      { src: '/galeri-karya/NF11-1-AK2/img/10.jpg', title: 'Infografis Perbandingan MPPL — Karya 10', by: 'Kelompok Kelas 11', kelas: 'Kelas 11' },
    ],
  },
  aplikasi: {
    slug: 'aplikasi',
    kind: 'aplikasi',
    kategori: 'Aplikasi',
    title: 'KuizQu — Aplikasi Quiz Otomatis Android',
    tagline: 'Scan, Quiz, Master!',
    by: 'Marsya & Najwa',
    kelas: 'Kelas 12 Akhwat',
    mapel: 'Informatika / KKA',
    desc: 'KuizQu mengubah materi belajarmu menjadi kuis latihan instan melalui AI. Dirancang untuk siswa, mahasiswa, dan pembelajar mandiri agar belajar terasa lebih aktif — cukup pindai catatan atau buku, AI langsung menyusun soal kuis beserta skor instan.',
    downloadUrl:
      'https://drive.google.com/file/d/1-ZoPLhOKa_l_nkqRlZqGFvBheZ2S3CTJ/view?usp=sharing',
    downloadHint: 'File APK untuk Android, siap dipasang langsung pada perangkat.',
    features: [
      'Scan Materi — memindai materi dari buku, catatan, atau dokumen.',
      'Auto Quiz Generator — membuat soal kuis secara otomatis berdasarkan materi yang dipindai.',
      'Beragam Tingkat Kesulitan — pilihan tingkat kesulitan soal sesuai kemampuan belajar pengguna.',
      'Hasil & Nilai Instan — menampilkan skor akhir dan evaluasi pengerjaan kuis secara langsung.',
    ],
    screenshots: [
      {
        src: 'https://res.cloudinary.com/dsucuk7do/image/upload/v1787977705/WhatsApp_Image_2026-08-29_at_11.18.23_2_apkadm.jpg',
        caption: 'Halaman Beranda',
      },
      {
        src: 'https://res.cloudinary.com/dsucuk7do/image/upload/v1787977700/WhatsApp_Image_2026-08-29_at_11.18.23_3_fdl26l.jpg',
        caption: 'Halaman Scan',
      },
      {
        src: 'https://res.cloudinary.com/dsucuk7do/image/upload/v1787977705/WhatsApp_Image_2026-08-29_at_11.18.23_jzftvi.jpg',
        caption: 'Halaman Quiz',
      },
      {
        src: 'https://res.cloudinary.com/dsucuk7do/image/upload/v1787977704/WhatsApp_Image_2026-08-29_at_11.18.22_btvfhb.jpg',
        caption: 'Halaman Hasil',
      },
    ],
  },
  videoiklan: {
    slug: 'videoiklan',
    kind: 'video-proses',
    kategori: 'Video',
    title: 'Membuat Video Iklan',
    desc: 'Dokumentasi praktik langsung siswa Kelas 8 dalam menerapkan teknik videografi — mulai dari tahap perencanaan naskah dan pengambilan gambar hingga video iklan promosi produk yang siap tayang.',
    by: 'Kelas VIII Ikhwan',
    kelas: 'Kelas 8 · VIII Ikhwan',
    mapel: 'Informatika',
    videoProses:
      'https://res.cloudinary.com/dsucuk7do/video/upload/v1785714275/before_arftts.mp4',
    videoHasil:
      'https://res.cloudinary.com/dsucuk7do/video/upload/v1785714270/after_wq3st1.mp4',
  },
  videovlog: {
    slug: 'videovlog',
    kind: 'vlog',
    kategori: 'Video',
    title: 'Vlog Pembelajaran: A Day With Malware',
    desc: 'Kumpulan vlog siswa Kelas 9 mengenai pengalaman belajar materi Malware. Siswa memaparkan bahaya malware pada komputer sekaligus membagikan tips dan trik praktis agar perangkat tetap aman.',
    kelas: 'Kelas 9',
    mapel: 'Informatika',
    videos: [
      {
        url: 'https://drive.google.com/file/d/1mvyq5b4gQNVcWOFe4Zw8vagWSFmPmgz0/view?usp=sharing',
        title: 'Vlog Malware — Kelompok 1',
        by: 'Aina, Alysia, Nada, Nadia, Nadira, Ruasa',
        kelas: 'Kelas 9',
      },
      {
        url: 'https://drive.google.com/file/d/19Yr1lUFD9rHusff7JsOlIbvFNo8zfX9B/view?usp=sharing',
        title: 'Vlog Malware — Kelompok 2',
        by: 'Azra, Fioreli, Gitta, Rizqa, Malika, Tsamara',
        kelas: 'Kelas 9',
      },
      {
        url: 'https://drive.google.com/file/d/1fG8uadBsTkpuZ-ovm8OZy_aPOWrwSsp5/view?usp=sharing',
        title: 'Vlog Malware — Kelompok 3',
        by: 'Alya Zahra Adviandry, Jasmine Olivia Ferdian, Khalisha Naura Rayyani, Vania Aerylin Aliya, Risky Dwi Harlian, Irdina Arselia',
        kelas: 'Kelas 9',
      },
      {
        url: 'https://drive.google.com/file/d/1CC5--ZxvLLbKoYS-zBYydSxZxRykKEat/view?usp=sharing',
        title: 'Vlog Malware — Kelompok 4',
        by: 'Aurelie, Almira, Callysta, Lediska, Seana, Zahra',
        kelas: 'Kelas 9',
      },
    ],
  },
};

export const KARYA_GALLERY_TABS: { slug: KaryaGallerySlug; label: string; emoji: string }[] = [
  { slug: 'nf11-1-ak2', label: 'Infografis MPPL (Kls 11)', emoji: '📊' },
  { slug: 'aplikasi', label: 'Aplikasi KuizQu (Kls 12)', emoji: '📱' },
  { slug: 'videoiklan', label: 'Video Iklan (Kls 8)', emoji: '🎬' },
  { slug: 'videovlog', label: 'Vlog Malware (Kls 9)', emoji: '🎥' },
];

export function resolveKaryaGallerySlug(raw?: string): KaryaGallerySlug | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).toLowerCase();
  if (decoded.includes('nf11-1-ak2') && !decoded.includes('format kosong')) {
    return 'nf11-1-ak2';
  }
  if (decoded.includes('aplikasi-karya') || decoded.includes('/aplikasi')) {
    return 'aplikasi';
  }
  if (decoded.includes('videoiklan') || decoded.includes('video-karyaiklan')) {
    return 'videoiklan';
  }
  if (decoded.includes('videovlog') || decoded.includes('galeri-vlog')) {
    return 'videovlog';
  }
  return null;
}

export function extractGoogleDriveId(url: string): string | null {
  const m =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

export function toVideoEmbedSrc(url: string): string {
  const yt = extractYoutubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1`;
  const gd = extractGoogleDriveId(url);
  if (gd) return `https://drive.google.com/file/d/${gd}/preview`;
  return url;
}

export function toVideoThumbSrc(url: string): string | null {
  const yt = extractYoutubeId(url);
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  const gd = extractGoogleDriveId(url);
  if (gd) return `https://drive.google.com/thumbnail?id=${gd}&sz=w600`;
  return null;
}

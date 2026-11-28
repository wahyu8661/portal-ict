export interface PlatformItem {
  id: string;
  no: number;
  title: string;
  shortDesc: string;
  desc: string;
  examples: string[];
  iconName: 'users' | 'play' | 'feather' | 'network' | 'vr';
  insight: string;
}

export interface FeatureItem {
  id: string;
  no: number;
  title: string;
  category: 'sosial' | 'konten' | 'ekonomi';
  shortDesc: string;
  desc: string;
  examples: string[];
  iconName:
    | 'handshake'
    | 'camera'
    | 'star'
    | 'comments'
    | 'newspaper'
    | 'bookmark'
    | 'heart'
    | 'bag';
}

export interface QuizQuestion {
  category: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ArcadeItem {
  name: string;
  clue: string;
  cat: 'platform' | 'fitur' | 'software' | 'hardware' | 'operasional';
}

export interface MatchingPair {
  id: number;
  left: string;
  rightCode: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  rightText: string;
}

export interface EssayItem {
  q: string;
  hint: string;
}

export interface DsiTpItem {
  id: string;
  code: string;
  title: string;
  description: string;
  branchLabel: string;
  targetView: 'platform' | 'fitur' | 'profesi' | 'games';
}

export const DSI_MODULE_META = {
  mapel: 'Informatika',
  kelas: 'Kelas 12',
  urutan: '4',
  judul: 'Dampak sosial informatika',
  deskripsi: 'yuk pelajari tentang dunia informatika di lingkup yang lebih luas di dunia nyata',
  tag: 'DSI',
  link: '#/materi/dsi',
  hostedAssetPath: '/assets/aistudio/pembelajaran_interaktif_3d_dampak_sosial_informatika_ecbf4dc4.html',
} as const;

export const DSI_CAPAIAN_PEMBELAJARAN = {
  fase: 'Fase F · SMA Kelas XII',
  elemen: 'Dampak Sosial Informatika (DSI)',
  description:
    'Peserta didik mampu memahami perkembangan dan pemanfaatan informatika secara lebih luas di dunia nyata, menganalisis dampak sosial, budaya, ekonomi, hukum, dan etika dari penggunaan media sosial beserta ekosistem digitalnya, serta mengenali ragam profesi, kompetensi, dan peluang karier di bidang teknologi informasi secara kritis dan bertanggung jawab.',
} as const;

export const DSI_TUJUAN_PEMBELAJARAN: DsiTpItem[] = [
  {
    id: 'tp-1',
    code: 'TP 1',
    title: 'Klasifikasi Platform Media Sosial',
    description:
      'Mengidentifikasi dan membedakan 5 jenis platform media sosial (Collaborative Projects, Content Communities, Blogs & Microblogs, Social Networking Sites, Virtual Social Worlds) beserta contoh nyatanya.',
    branchLabel: 'Cabang Platform',
    targetView: 'platform',
  },
  {
    id: 'tp-2',
    code: 'TP 2',
    title: 'Analisis Fitur & Dampak Nyata',
    description:
      'Menganalisis peran 8 fitur media sosial (relasi, berbagi media, ulasan daring, forum, publikasi, bookmarking, minat, dan e-commerce) serta mengevaluasi manfaat dan risiko sosial-ekonominya.',
    branchLabel: 'Cabang Fitur',
    targetView: 'fitur',
  },
  {
    id: 'tp-3',
    code: 'TP 3',
    title: 'Pemetaan Profesi Bidang Informatika',
    description:
      'Mengelompokkan tugas, wewenang, dan sertifikasi profesi TI pada bidang Perangkat Lunak (Software), Perangkat Keras (Hardware), dan Operasional Sistem Informasi.',
    branchLabel: 'Cabang Profesi TI',
    targetView: 'profesi',
  },
  {
    id: 'tp-4',
    code: 'TP 4',
    title: 'Etika Digital & Evaluasi Pemahaman',
    description:
      'Menunjukkan sikap literasi digital yang kritis, aman, dan produktif serta mengukur pemahaman melalui kuis, arcade sortir, pencocokan konsep, dan studi kasus esai.',
    branchLabel: 'Games & Quiz',
    targetView: 'games',
  },
];

export const DSI_VIDEO_PEMANTIK = {
  videoId: 'T8m3mlcXPiU',
  watchUrl: 'https://www.youtube.com/watch?v=T8m3mlcXPiU',
  embedUrl: 'https://www.youtube.com/embed/T8m3mlcXPiU?rel=0',
  title: 'Video Pemantik: Dampak Sosial Informatika di Dunia Nyata',
  subtitle:
    'Tonton video pengantar ini sebelum menjelajahi Mindmap 3D untuk mengamati bagaimana teknologi informasi mengubah interaksi sosial, ekonomi digital, dan peluang profesi.',
  prompts: [
    'Perubahan nyata apa yang paling terasa dari pemanfaatan media sosial di lingkungan sekitarmu?',
    'Bagaimana cara membedakan manfaat produktif dan risiko negatif (hoaks, privasi, kecanduan layar) saat menggunakan platform digital?',
    'Profesi informatika apa saja yang berperan di balik layanan digital yang kamu pakai setiap hari?',
  ],
} as const;

export const PLATFORM_DATA: PlatformItem[] = [
  {
    id: 'plat-1',
    no: 1,
    title: 'Collaborative Projects',
    shortDesc: 'membuat & menyunting konten bersama',
    desc: 'Platform kolaboratif yang memungkinkan pengguna secara bersama-sama membuat dan menyunting konten pengetahuan.',
    examples: ['Wikipedia'],
    iconName: 'users',
    insight:
      'Mendorong budaya berbagi ilmu terbuka (crowdsourcing), namun pembaca tetap perlu memverifikasi kebenaran referensi.',
  },
  {
    id: 'plat-2',
    no: 2,
    title: 'Content Communities',
    shortDesc: 'berbagi video, foto, dan audio',
    desc: 'Digunakan untuk berbagi berbagai jenis konten multimedia seperti video, foto, dan audio kepada publik.',
    examples: ['YouTube', 'Vimeo'],
    iconName: 'play',
    insight:
      'Membuka peluang karir kreator konten dan edukasi visual, sekaligus menuntut penghormatan terhadap hak cipta.',
  },
  {
    id: 'plat-3',
    no: 3,
    title: 'Blogs & Microblogs',
    shortDesc: 'menulis dan membagikan opini',
    desc: 'Media digital untuk menulis dan membagikan opini, artikel, maupun informasi secara terbuka dan cepat.',
    examples: ['Blog', 'Twitter'],
    iconName: 'feather',
    insight:
      'Mempercepat arus informasi publik; literasi digital diperlukan agar terhindar dari hoaks.',
  },
  {
    id: 'plat-4',
    no: 4,
    title: 'Social Networking Sites',
    shortDesc: 'membangun relasi sosial',
    desc: 'Menghubungkan pengguna melalui profil untuk membangun dan menjaga relasi sosial maupun profesional.',
    examples: ['Facebook', 'LinkedIn'],
    iconName: 'network',
    insight:
      'Memperluas jejaring lintas wilayah; pengguna wajib menjaga keamanan privasi data pribadi.',
  },
  {
    id: 'plat-5',
    no: 5,
    title: 'Virtual Social Worlds',
    shortDesc: 'jejaring sosial di dunia virtual',
    desc: 'Menggabungkan jejaring sosial dan dunia virtual interaktif berbasis avatar di lingkungan 3D.',
    examples: ['Game online', 'dunia virtual 3D'],
    iconName: 'vr',
    insight:
      'Menghadirkan interaksi imersif lintas negara; memerlukan keseimbangan waktu dengan kehidupan nyata.',
  },
];

export const FEATURE_DATA: FeatureItem[] = [
  {
    id: 'fit-1',
    no: 1,
    title: 'Relationship Networks',
    category: 'sosial',
    shortDesc: 'membangun hubungan',
    desc: 'Fokus membangun dan menjaga hubungan antar pengguna.',
    examples: ['Facebook', 'LinkedIn'],
    iconName: 'handshake',
  },
  {
    id: 'fit-2',
    no: 2,
    title: 'Media Sharing Networks',
    category: 'konten',
    shortDesc: 'berbagi foto & video',
    desc: 'Berbagi foto, video, dan konten visual secara luas.',
    examples: ['Instagram', 'YouTube'],
    iconName: 'camera',
  },
  {
    id: 'fit-3',
    no: 3,
    title: 'Online Reviews',
    category: 'ekonomi',
    shortDesc: 'memberi ulasan',
    desc: 'Memberikan ulasan berbasis lokasi dan pengalaman pengguna.',
    examples: ['TripAdvisor', 'Yelp'],
    iconName: 'star',
  },
  {
    id: 'fit-4',
    no: 4,
    title: 'Forum Diskusi',
    category: 'sosial',
    shortDesc: 'diskusi topik tertentu',
    desc: 'Diskusi dan bertukar informasi berdasarkan topik atau minat tertentu.',
    examples: ['Kaskus', 'Reddit'],
    iconName: 'comments',
  },
  {
    id: 'fit-5',
    no: 5,
    title: 'Social Publishing Platforms',
    category: 'konten',
    shortDesc: 'mempublikasikan artikel',
    desc: 'Mempublikasikan artikel, opini, tulisan reflektif, atau vlog.',
    examples: ['Blog', 'Medium'],
    iconName: 'newspaper',
  },
  {
    id: 'fit-6',
    no: 6,
    title: 'Bookmarking Sites',
    category: 'konten',
    shortDesc: 'menyimpan konten',
    desc: 'Mengumpulkan dan menyimpan konten inspiratif dari internet.',
    examples: ['Pinterest'],
    iconName: 'bookmark',
  },
  {
    id: 'fit-7',
    no: 7,
    title: 'Interest-Based Networks',
    category: 'sosial',
    shortDesc: 'menghubungkan minat sama',
    desc: 'Menghubungkan pengguna yang memiliki hobi atau minat yang sama.',
    examples: ['Goodreads', 'IMDB'],
    iconName: 'heart',
  },
  {
    id: 'fit-8',
    no: 8,
    title: 'E-Commerce',
    category: 'ekonomi',
    shortDesc: 'transaksi jual beli daring',
    desc: 'Memfasilitasi transaksi jual beli barang dan jasa secara daring.',
    examples: ['Tokopedia', 'Shopee'],
    iconName: 'bag',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    category: 'Jenis Platform',
    q: 'Platform media sosial yang memungkinkan pengguna secara kolaboratif membuat dan menyunting konten bersama seperti Wikipedia disebut...',
    options: [
      'Content Communities',
      'Collaborative Projects',
      'Social Networking Sites',
      'Virtual Social Worlds',
    ],
    answer: 1,
    explanation:
      'Collaborative Projects adalah platform kolaboratif untuk membuat dan menyunting konten bersama, contohnya Wikipedia.',
  },
  {
    category: 'Jenis Platform',
    q: 'YouTube dan Vimeo termasuk ke dalam jenis platform media sosial...',
    options: [
      'Blogs & Microblogs',
      'Virtual Social Worlds',
      'Content Communities',
      'Online Reviews',
    ],
    answer: 2,
    explanation:
      'Content Communities digunakan untuk berbagi konten multimedia seperti video, foto, dan audio (YouTube, Vimeo).',
  },
  {
    category: 'Jenis Fitur',
    q: 'Fitur media sosial yang berfokus mengumpulkan dan menyimpan konten inspiratif dari internet seperti Pinterest adalah...',
    options: [
      'Bookmarking Sites',
      'Forum Diskusi',
      'Social Publishing Platforms',
      'Interest-Based Networks',
    ],
    answer: 0,
    explanation:
      'Bookmarking Sites (contoh: Pinterest) berfungsi mengumpulkan dan menyimpan konten dari internet.',
  },
  {
    category: 'Jenis Fitur',
    q: 'Goodreads dan IMDB merupakan contoh fitur media sosial yang menghubungkan pengguna berdasarkan kesamaan hobi atau minat, yaitu...',
    options: [
      'Relationship Networks',
      'Online Reviews',
      'Interest-Based Networks',
      'E-Commerce',
    ],
    answer: 2,
    explanation:
      'Interest-Based Networks menghubungkan pengguna dengan minat yang sama, seperti pecinta buku (Goodreads) atau film (IMDB).',
  },
  {
    category: 'Jenis Fitur',
    q: 'Manakah pasangan yang TEPAT antara fitur media sosial dan contohnya?',
    options: [
      'Online Reviews — Kaskus & Reddit',
      'Forum Diskusi — TripAdvisor & Yelp',
      'E-Commerce — Tokopedia & Shopee',
      'Social Publishing — Wikipedia',
    ],
    answer: 2,
    explanation:
      'E-Commerce memfasilitasi transaksi jual beli secara daring, dengan contoh populer Tokopedia dan Shopee.',
  },
  {
    category: 'Profesi Software',
    q: 'Profesi yang bertugas menganalisa sistem, kelebihan/kekurangan, studi kelayakan, hingga merancang desain sistem adalah...',
    options: ['Programmer', 'Sistem Analis', 'EDP Operator', 'Technical Engineer'],
    answer: 1,
    explanation:
      'Sistem Analis melakukan analisa, studi kelayakan, dan desain sistem sebelum diimplementasikan oleh Programmer.',
  },
  {
    category: 'Profesi Software',
    q: 'Apa perbedaan utama antara Web Designer dan Web Programmer?',
    options: [
      'Web Designer memperbaiki hardware, Web Programmer mengatur jaringan',
      'Web Designer merencanakan & mendesain web, Web Programmer mengimplementasikannya menjadi program web',
      'Web Designer mengelola hak akses server, Web Programmer mengolah data EDP',
      'Keduanya memiliki tugas yang persis sama',
    ],
    answer: 1,
    explanation:
      'Web Designer merencanakan, menganalisis, dan mendesain aplikasi web, sedangkan Web Programmer membuat program web sesuai rancangan tersebut.',
  },
  {
    category: 'Profesi Hardware',
    q: 'Profesi di bidang perangkat keras yang menangani teknis jaringan komputer mulai dari maintenance hingga troubleshooting adalah...',
    options: [
      'Networking Engineer',
      'System Administrator',
      'Technical Engineer',
      'Web Programmer',
    ],
    answer: 0,
    explanation:
      'Networking Engineer berkecimpung di bidang teknis jaringan komputer dari maintenance hingga troubleshooting.',
  },
  {
    category: 'Operasional SI',
    q: 'Siapakah profesi yang memiliki wewenang PALING TINGGI terhadap sebuah sistem informasi (mengelola hardware, software, dan SDM)?',
    options: ['System Administrator', 'Sistem Analis', 'EDP Operator', 'MIS Director'],
    answer: 3,
    explanation:
      'MIS Director memiliki wewenang paling tinggi dalam memanajemen sistem informasi secara keseluruhan.',
  },
  {
    category: 'Operasional SI',
    q: 'Orang yang bertugas mengoperasikan program-program Electronic Data Processing di dalam perusahaan disebut...',
    options: ['MIS Director', 'EDP Operator', 'Technical Engineer', 'Programmer'],
    answer: 1,
    explanation:
      'EDP Operator bertugas mengoperasikan program yang berhubungan dengan Electronic Data Processing.',
  },
];

export const ARCADE_ITEMS: ArcadeItem[] = [
  { name: 'Wikipedia', clue: 'Menyunting konten bersama', cat: 'platform' },
  { name: 'YouTube & Vimeo', clue: 'Berbagi video & audio', cat: 'platform' },
  { name: 'Virtual Social Worlds', clue: 'Dunia virtual 3D berbasis avatar', cat: 'platform' },
  { name: 'Blogs & Microblogs', clue: 'Menulis & membagikan opini', cat: 'platform' },
  { name: 'TripAdvisor & Yelp', clue: 'Ulasan berbasis lokasi', cat: 'fitur' },
  { name: 'Pinterest', clue: 'Bookmarking Sites', cat: 'fitur' },
  { name: 'Tokopedia & Shopee', clue: 'Transaksi E-Commerce daring', cat: 'fitur' },
  { name: 'Kaskus & Reddit', clue: 'Forum Diskusi topik tertentu', cat: 'fitur' },
  { name: 'Goodreads & IMDB', clue: 'Interest-Based Networks', cat: 'fitur' },
  { name: 'Sistem Analis', clue: 'Studi kelayakan & desain sistem', cat: 'software' },
  { name: 'Programmer', clue: 'Membuat program/aplikasi', cat: 'software' },
  { name: 'Web Designer', clue: 'Perencanaan & desain web', cat: 'software' },
  { name: 'Web Programmer', clue: 'Implementasi kode web', cat: 'software' },
  { name: 'Technical Engineer', clue: 'Perbaikan perangkat komputer', cat: 'hardware' },
  { name: 'Networking Engineer', clue: 'Troubleshooting jaringan', cat: 'hardware' },
  { name: 'EDP Operator', clue: 'Electronic Data Processing', cat: 'operasional' },
  { name: 'System Administrator', clue: 'Mengatur hak akses sistem', cat: 'operasional' },
  { name: 'MIS Director', clue: 'Wewenang tertinggi SI', cat: 'operasional' },
];

export const MATCHING_PAIRS: MatchingPair[] = [
  {
    id: 1,
    left: '1. Collaborative Projects',
    rightCode: 'E',
    rightText:
      'Platform kolaboratif yang memungkinkan pengguna menulis dan menyunting konten bersama',
  },
  {
    id: 2,
    left: '2. Content Communities',
    rightCode: 'C',
    rightText: 'Media berbagi konten video, gambar, dan audio seperti YouTube',
  },
  {
    id: 3,
    left: '3. Social Networking Sites',
    rightCode: 'D',
    rightText:
      'Media sosial yang berfokus pada membangun hubungan antar pengguna seperti Facebook',
  },
  {
    id: 4,
    left: '4. Blogs & Microblogs',
    rightCode: 'A',
    rightText:
      'Media sosial untuk menulis dan berbagi artikel atau pendapat secara terbuka seperti blog dan Twitter',
  },
  {
    id: 5,
    left: '5. Forum Diskusi',
    rightCode: 'G',
    rightText: 'Media untuk berdiskusi dan bertukar informasi berdasarkan topik tertentu',
  },
  {
    id: 6,
    left: '6. Online Reviews',
    rightCode: 'F',
    rightText:
      'Media sosial berbasis ulasan lokasi atau layanan untuk membantu pengambilan keputusan',
  },
  {
    id: 7,
    left: '7. E-Commerce',
    rightCode: 'B',
    rightText: 'Platform jual beli online yang memungkinkan transaksi secara daring',
  },
];

export const ESSAY_AKT1: EssayItem[] = [
  {
    q: '1. Jelaskan apa yang dimaksud dengan platform media sosial.',
    hint: 'Media digital berbasis internet untuk berinteraksi, membangun relasi, berbagi konten, berdiskusi, hingga bertransaksi ekonomi secara daring.',
  },
  {
    q: '2. Sebutkan dan jelaskan tiga jenis platform media sosial beserta contoh masing-masing.',
    hint: 'Collaborative Projects (Wikipedia), Content Communities (YouTube/Vimeo), Social Networking Sites (Facebook/LinkedIn).',
  },
  {
    q: '3. Apa perbedaan antara Social Networking Sites dan Content Communities? Jelaskan berdasarkan fungsi dan jenis konten yang dibagikan.',
    hint: 'Social Networking Sites berfokus pada profil & relasi sosial antar pengguna, sedangkan Content Communities berfokus pada distribusi konten media (video, foto, audio).',
  },
  {
    q: '4. Jelaskan peran fitur Online Reviews dalam kehidupan masyarakat digital serta dampak positif dan negatifnya.',
    hint: 'Membantu pengambilan keputusan konsumen. Positif: transparansi kualitas layanan. Negatif: risiko ulasan palsu (fake review).',
  },
  {
    q: '5. Jelaskan dampak sosial dari penggunaan media sharing networks bagi pelajar jika digunakan secara tidak bijak.',
    hint: 'Kecanduan layar, gangguan fokus belajar, perbandingan sosial, kebocoran privasi, dan risiko cyberbullying.',
  },
];

export const ESSAY_AKT3: EssayItem[] = [
  {
    q: '1. Tuliskan perbedaan dari profesi dan pekerjaan.',
    hint: 'Pekerjaan adalah aktivitas mencari nafkah tanpa selalu menuntut keahlian khusus; Profesi menuntut keahlian, pendidikan/sertifikasi, dan kode etik khusus.',
  },
  {
    q: '2. Sebutkan 3 jenis profesi Teknik Informatika dan jelaskan.',
    hint: 'Programmer (membuat program), Networking Engineer (maintenance & troubleshooting jaringan), System Administrator (administrasi & hak akses sistem).',
  },
  {
    q: '3. Sebutkan jenis-jenis sertifikat profesi di bidang informatika dan jelaskan.',
    hint: 'Cisco CCNA / MikroTik MTCNA (Jaringan), CompTIA Security+ (Keamanan Siber), AWS/Google Cloud (Komputasi Awan), Sertifikasi BNSP (Kompetensi Nasional).',
  },
  {
    q: '4. Apa perbedaan tugas antara System Analyst dan Programmer berdasarkan peran masing-masing dalam pengembangan sistem?',
    hint: 'System Analyst merancang analisis kebutuhan, studi kelayakan & desain sistem; Programmer mengimplementasikan rancangan tersebut ke dalam kode program.',
  },
];

export function isDsiMateriLink(raw?: string): boolean {
  if (!raw) return false;
  const decoded = decodeURIComponent(raw).toLowerCase();
  return (
    decoded === '#/materi/dsi' ||
    decoded.endsWith('/materi/dsi') ||
    decoded.includes('pembelajaran_interaktif_3d_dampak_sosial_informatika')
  );
}

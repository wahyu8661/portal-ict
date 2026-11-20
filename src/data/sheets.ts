export type Mapel = 'Informatika' | 'KKA';
export type StatusKey = 'todo' | 'review' | 'done';

export interface MateriItem {
  id?: number;
  Mapel?: string;
  Kelas?: string;
  Urutan?: string;
  Judul?: string;
  Deskripsi?: string;
  Tag?: string;
  Image?: string;
  Link?: string;
}

export interface TugasItem {
  id?: number;
  Mapel?: string;
  Kelas?: string;
  'Info Waktu'?: string;
  Jenis?: string;
  Status?: string;
  Judul?: string;
  Deskripsi?: string;
  Image?: string;
  Link?: string;
}

export interface NilaiItem {
  id?: number;
  NISN?: string;
  Mapel?: string;
  Nama?: string;
  Kelas?: string;
  Komponen?: string;
  Skor?: string;
}

export interface KaryaItem {
  id?: number;
  Mapel?: string;
  Kategori?: string;
  Judul?: string;
  Pembuat?: string;
  Kelas?: string;
  Image?: string;
  Link?: string;
}

export interface InfoItem {
  id?: number;
  Jenis?: string;
  Judul?: string;
  Deskripsi?: string;
  'Info Tambahan'?: string;
  Image?: string;
  Link?: string;
}

export const SHEET_URLS = {
  materi:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcsoSottRastpnwgSl8pSf1Qvk3fEszZm_x0zIJDmNGnnZdEbo8cfu2THjfT1MnLuys3soUykIMRDk/pub?gid=0&single=true&output=csv',
  tugas:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcsoSottRastpnwgSl8pSf1Qvk3fEszZm_x0zIJDmNGnnZdEbo8cfu2THjfT1MnLuys3soUykIMRDk/pub?gid=287326237&single=true&output=csv',
  nilai:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcsoSottRastpnwgSl8pSf1Qvk3fEszZm_x0zIJDmNGnnZdEbo8cfu2THjfT1MnLuys3soUykIMRDk/pub?gid=1026703172&single=true&output=csv',
  karya:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcsoSottRastpnwgSl8pSf1Qvk3fEszZm_x0zIJDmNGnnZdEbo8cfu2THjfT1MnLuys3soUykIMRDk/pub?gid=1183817522&single=true&output=csv',
  info:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcsoSottRastpnwgSl8pSf1Qvk3fEszZm_x0zIJDmNGnnZdEbo8cfu2THjfT1MnLuys3soUykIMRDk/pub?gid=614160338&single=true&output=csv',
};

export const DEFAULT_MATERI: MateriItem[] = [];
export const DEFAULT_TUGAS: TugasItem[] = [];
export const DEFAULT_NILAI: NilaiItem[] = [];
export const DEFAULT_KARYA: KaryaItem[] = [];
export const DEFAULT_INFO: InfoItem[] = [];

export const KELAS_LIST = [
  'Kelas 7',
  'Kelas 8',
  'Kelas 9',
  'Kelas 10',
  'Kelas 11',
  'Kelas 12',
];

export const STATUS_LABEL: Record<StatusKey, string> = {
  todo: 'Belum dikerjakan',
  review: 'Menunggu penilaian',
  done: 'Selesai',
};

export function statusKey(s?: string): StatusKey {
  const lower = (s || '').toLowerCase();
  if (lower.startsWith('menunggu')) return 'review';
  if (lower.startsWith('selesai')) return 'done';
  return 'todo';
}

export function normalizeKelas(raw?: string): string {
  const trimmed = (raw || '').trim();
  const match = trimmed.match(/^kelas\s*(\d+)$/i);
  if (match) return `Kelas ${match[1]}`;
  return trimmed;
}

export const KAT_META: Record<string, { gradClass: string; emoji: string }> = {
  Website: { gradClass: 'grad-website', emoji: '🌐' },
  Poster: { gradClass: 'grad-poster', emoji: '🎨' },
  Infografis: { gradClass: 'grad-infografis', emoji: '📊' },
  Game: { gradClass: 'grad-game', emoji: '🕹️' },
  Video: { gradClass: 'grad-video', emoji: '🎬' },
  Chatbot: { gradClass: 'grad-chatbot', emoji: '💬' },
  'Model AI': { gradClass: 'grad-model-ai', emoji: '🤖' },
  'Computer Vision': { gradClass: 'grad-cv', emoji: '👁️' },
  Aplikasi: { gradClass: 'grad-aplikasi', emoji: '📱' },
};

export const JENIS_GRAD_CLASS: Record<string, string> = {
  instagram: 'grad-ig',
  video: 'grad-vid',
  vlog: 'grad-vid',
  galeri: 'grad-gal',
  image: 'grad-gal',
  pengumuman: 'grad-pengumuman',
  drive: 'grad-website',
  sintak: 'grad-chatbot',
  '5d planer': 'grad-aplikasi',
  link: 'grad-website',
  materi: 'grad-gal',
  'pengumpulan tugas': 'grad-pengumuman',
  aplikasi: 'grad-aplikasi',
};

export const JENIS_EMOJI: Record<string, string> = {
  instagram: '📸',
  video: '▶️',
  vlog: '🎥',
  galeri: '🖼️',
  image: '🖼️',
  pengumuman: '📢',
  drive: '📁',
  sintak: '💻',
  '5d planer': '📐',
  link: '🔗',
  materi: '📚',
  'pengumpulan tugas': '📝',
  aplikasi: '📱',
};

export function getInfoVisual(jenis?: string): { gradClass: string; emoji: string } {
  const key = (jenis || '').trim().toLowerCase();
  return {
    gradClass: JENIS_GRAD_CLASS[key] || 'grad-default',
    emoji: JENIS_EMOJI[key] || '📌',
  };
}

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && next === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const filtered = rows.filter((r) => r.some((v) => v.trim() !== ''));
  if (!filtered.length) return [];

  const headers = filtered[0].map((h) => h.trim());
  return filtered.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim();
    });
    return obj;
  });
}

export async function fetchSheet<T = Record<string, string>>(url: string): Promise<T[] | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return parseCSV(text) as unknown as T[];
  } catch (e) {
    console.warn('Gagal mengambil data sheet.', e);
    return null;
  }
}

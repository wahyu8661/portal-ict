import { supabase } from '../lib/supabase';
import {
  fetchSheet,
  type InfoItem,
  type KaryaItem,
  type MateriItem,
  type NilaiItem,
  normalizeKelas,
  SHEET_URLS,
  type TugasItem,
} from './sheets';

export type TableName = 'materi' | 'tugas' | 'nilai' | 'karya' | 'info';
export type DataSourceMode = 'supabase' | 'sheets' | 'empty';

export interface TableStatus {
  table: TableName;
  exists: boolean;
  count: number;
  error?: string;
}

export interface SheetTableAnalysis {
  table: TableName;
  rowCount: number;
  headers: string[];
  emptyCounts: Record<string, number>;
  distinctValues: Record<string, string[]>;
  anomalies: string[];
  rows: Record<string, string>[];
}

export interface PortalLoadResult {
  materi: MateriItem[];
  tugas: TugasItem[];
  nilai: NilaiItem[];
  karya: KaryaItem[];
  info: InfoItem[];
  sources: Record<TableName, DataSourceMode>;
}

export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- Skema Database Pembelajaran Informatika & KKA (SMP–SMA Attaufiq Jambi)
-- Jalankan skrip ini di Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

create table if not exists public.materi (
  id bigserial primary key,
  mapel text not null,
  kelas text not null,
  urutan integer not null default 1,
  judul text not null,
  deskripsi text default '',
  tag text default '',
  link text default '',
  image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.tugas (
  id bigserial primary key,
  mapel text not null,
  kelas text not null,
  jenis text not null default 'Tugas',
  judul text not null,
  deskripsi text default '',
  status text not null default '',
  info_waktu text default '',
  link text default '',
  image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.nilai (
  id bigserial primary key,
  nisn text not null,
  nama text not null,
  kelas text not null,
  mapel text not null,
  komponen text not null,
  skor integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.karya (
  id bigserial primary key,
  mapel text not null,
  kategori text not null,
  judul text not null,
  pembuat text default '',
  kelas text not null,
  link text default '',
  image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.info (
  id bigserial primary key,
  jenis text not null default 'Pengumuman',
  judul text not null,
  deskripsi text default '',
  info_tambahan text default '',
  link text default '',
  image text default '',
  created_at timestamptz not null default now()
);

-- Indeks untuk mempercepat filter per mapel, kelas, dan pencarian NISN
create index if not exists idx_materi_mapel_kelas on public.materi (mapel, kelas, urutan);
create index if not exists idx_tugas_mapel_kelas on public.tugas (mapel, kelas);
create index if not exists idx_nilai_nisn_mapel on public.nilai (nisn, mapel);
create index if not exists idx_karya_mapel_kat on public.karya (mapel, kategori);

-- Aktifkan Row Level Security (RLS) dan izinkan akses portal & dashboard guru
alter table public.materi enable row level security;
alter table public.tugas enable row level security;
alter table public.nilai enable row level security;
alter table public.karya enable row level security;
alter table public.info enable row level security;

drop policy if exists "portal_all_materi" on public.materi;
create policy "portal_all_materi" on public.materi for all using (true) with check (true);

drop policy if exists "portal_all_tugas" on public.tugas;
create policy "portal_all_tugas" on public.tugas for all using (true) with check (true);

drop policy if exists "portal_all_nilai" on public.nilai;
create policy "portal_all_nilai" on public.nilai for all using (true) with check (true);

drop policy if exists "portal_all_karya" on public.karya;
create policy "portal_all_karya" on public.karya for all using (true) with check (true);

drop policy if exists "portal_all_info" on public.info;
create policy "portal_all_info" on public.info for all using (true) with check (true);

-- Refresh schema cache PostgREST agar API langsung mengenali tabel baru
notify pgrst, 'reload schema';
`;

// ---------- Row Mappers (Supabase DB <-> Portal Item Format) ----------

function mapDbToMateri(r: Record<string, unknown>): MateriItem {
  return {
    id: Number(r.id),
    Mapel: String(r.mapel ?? ''),
    Kelas: normalizeKelas(String(r.kelas ?? '')),
    Urutan: String(r.urutan ?? 1),
    Judul: String(r.judul ?? ''),
    Deskripsi: String(r.deskripsi ?? ''),
    Tag: String(r.tag ?? ''),
    Link: String(r.link ?? ''),
    Image: String(r.image ?? ''),
  };
}

function mapMateriToDb(item: MateriItem, normalize = true) {
  return {
    mapel: (item.Mapel || 'Informatika').trim(),
    kelas: normalize ? normalizeKelas(item.Kelas || 'Kelas 10') : (item.Kelas || '').trim(),
    urutan: parseInt(String(item.Urutan || '1'), 10) || 1,
    judul: (item.Judul || '').trim(),
    deskripsi: (item.Deskripsi || '').trim(),
    tag: (item.Tag || '').trim(),
    link: (item.Link || '').trim(),
    image: (item.Image || '').trim(),
  };
}

function mapDbToTugas(r: Record<string, unknown>): TugasItem {
  return {
    id: Number(r.id),
    Mapel: String(r.mapel ?? ''),
    Kelas: normalizeKelas(String(r.kelas ?? '')),
    Jenis: String(r.jenis ?? 'Tugas'),
    Judul: String(r.judul ?? ''),
    Deskripsi: String(r.deskripsi ?? ''),
    Status: String(r.status ?? ''),
    'Info Waktu': String(r.info_waktu ?? ''),
    Link: String(r.link ?? ''),
    Image: String(r.image ?? ''),
  };
}

function mapTugasToDb(item: TugasItem, normalize = true) {
  const rawJenis = (item.Jenis || 'Tugas').trim();
  const normalizedJenis =
    normalize && rawJenis.toLowerCase() === 'bahan'
      ? 'Bahan'
      : normalize && rawJenis.toLowerCase() === 'kuis'
        ? 'Kuis'
        : normalize && rawJenis.toLowerCase() === 'tugas'
          ? 'Tugas'
          : rawJenis || 'Tugas';

  return {
    mapel: (item.Mapel || 'Informatika').trim(),
    kelas: normalize ? normalizeKelas(item.Kelas || 'Kelas 10') : (item.Kelas || '').trim(),
    jenis: normalizedJenis,
    judul: (item.Judul || '').trim(),
    deskripsi: (item.Deskripsi || '').trim(),
    status: (item.Status || '').trim(),
    info_waktu: (item['Info Waktu'] || '').trim(),
    link: (item.Link || '').trim(),
    image: (item.Image || '').trim(),
  };
}

function mapDbToNilai(r: Record<string, unknown>): NilaiItem {
  return {
    id: Number(r.id),
    NISN: String(r.nisn ?? ''),
    Nama: String(r.nama ?? ''),
    Kelas: normalizeKelas(String(r.kelas ?? '')),
    Mapel: String(r.mapel ?? ''),
    Komponen: String(r.komponen ?? ''),
    Skor: String(r.skor ?? 0),
  };
}

function mapNilaiToDb(item: NilaiItem, normalize = true) {
  return {
    nisn: (item.NISN || '').trim(),
    nama: (item.Nama || '').trim(),
    kelas: normalize ? normalizeKelas(item.Kelas || 'Kelas 10') : (item.Kelas || '').trim(),
    mapel: (item.Mapel || 'Informatika').trim(),
    komponen: (item.Komponen || '').trim(),
    skor: parseInt(String(item.Skor || '0'), 10) || 0,
  };
}

function mapDbToKarya(r: Record<string, unknown>): KaryaItem {
  return {
    id: Number(r.id),
    Mapel: String(r.mapel ?? ''),
    Kategori: String(r.kategori ?? ''),
    Judul: String(r.judul ?? ''),
    Pembuat: String(r.pembuat ?? ''),
    Kelas: normalizeKelas(String(r.kelas ?? '')),
    Link: String(r.link ?? ''),
    Image: String(r.image ?? ''),
  };
}

function mapKaryaToDb(item: KaryaItem, normalize = true) {
  return {
    mapel: (item.Mapel || 'Informatika').trim(),
    kategori: (item.Kategori || '').trim(),
    judul: (item.Judul || '').trim(),
    pembuat: (item.Pembuat || '').trim(),
    kelas: normalize ? normalizeKelas(item.Kelas || 'Kelas 10') : (item.Kelas || '').trim(),
    link: (item.Link || '').trim(),
    image: (item.Image || '').trim(),
  };
}

function mapDbToInfo(r: Record<string, unknown>): InfoItem {
  return {
    id: Number(r.id),
    Jenis: String(r.jenis ?? ''),
    Judul: String(r.judul ?? ''),
    Deskripsi: String(r.deskripsi ?? ''),
    'Info Tambahan': String(r.info_tambahan ?? ''),
    Link: String(r.link ?? ''),
    Image: String(r.image ?? ''),
  };
}

function mapInfoToDb(item: InfoItem) {
  return {
    jenis: (item.Jenis || 'Pengumuman').trim(),
    judul: (item.Judul || '').trim(),
    deskripsi: (item.Deskripsi || '').trim(),
    info_tambahan: (item['Info Tambahan'] || '').trim(),
    link: (item.Link || '').trim(),
    image: (item.Image || '').trim(),
  };
}

// ---------- Fetch & Dual-Source Loader ----------

async function fetchSupabaseTable<T>(
  table: TableName,
  mapper: (r: Record<string, unknown>) => T
): Promise<{ exists: boolean; rows: T[]; error?: string }> {
  const query =
    table === 'materi'
      ? supabase.from(table).select('*').order('urutan', { ascending: true }).order('id', { ascending: true })
      : supabase.from(table).select('*').order('id', { ascending: true });

  const { data, error } = await query;
  if (error) {
    return { exists: false, rows: [], error: error.message };
  }
  return {
    exists: true,
    rows: (data || []).map((row) => mapper(row as Record<string, unknown>)),
  };
}

export async function loadPortalData(): Promise<PortalLoadResult> {
  const [sbMateri, sbTugas, sbNilai, sbKarya, sbInfo] = await Promise.all([
    fetchSupabaseTable('materi', mapDbToMateri),
    fetchSupabaseTable('tugas', mapDbToTugas),
    fetchSupabaseTable('nilai', mapDbToNilai),
    fetchSupabaseTable('karya', mapDbToKarya),
    fetchSupabaseTable('info', mapDbToInfo),
  ]);

  const needSheetFallback =
    !sbMateri.exists ||
    sbMateri.rows.length === 0 ||
    !sbTugas.exists ||
    sbTugas.rows.length === 0 ||
    !sbNilai.exists ||
    sbNilai.rows.length === 0 ||
    !sbKarya.exists ||
    sbKarya.rows.length === 0 ||
    !sbInfo.exists ||
    sbInfo.rows.length === 0;

  let shMateri: MateriItem[] | null = null;
  let shTugas: TugasItem[] | null = null;
  let shNilai: NilaiItem[] | null = null;
  let shKarya: KaryaItem[] | null = null;
  let shInfo: InfoItem[] | null = null;

  if (needSheetFallback) {
    [shMateri, shTugas, shNilai, shKarya, shInfo] = await Promise.all([
      !sbMateri.exists || sbMateri.rows.length === 0 ? fetchSheet<MateriItem>(SHEET_URLS.materi) : Promise.resolve(null),
      !sbTugas.exists || sbTugas.rows.length === 0 ? fetchSheet<TugasItem>(SHEET_URLS.tugas) : Promise.resolve(null),
      !sbNilai.exists || sbNilai.rows.length === 0 ? fetchSheet<NilaiItem>(SHEET_URLS.nilai) : Promise.resolve(null),
      !sbKarya.exists || sbKarya.rows.length === 0 ? fetchSheet<KaryaItem>(SHEET_URLS.karya) : Promise.resolve(null),
      !sbInfo.exists || sbInfo.rows.length === 0 ? fetchSheet<InfoItem>(SHEET_URLS.info) : Promise.resolve(null),
    ]);
  }

  const pick = <T,>(
    sb: { exists: boolean; rows: T[] },
    sh: T[] | null
  ): { items: T[]; mode: DataSourceMode } => {
    if (sb.exists && sb.rows.length > 0) return { items: sb.rows, mode: 'supabase' };
    if (sh && sh.length > 0) return { items: sh, mode: 'sheets' };
    if (sb.exists) return { items: sb.rows, mode: 'supabase' };
    return { items: [], mode: 'empty' };
  };

  const rMateri = pick(sbMateri, shMateri);
  const rTugas = pick(sbTugas, shTugas);
  const rNilai = pick(sbNilai, shNilai);
  const rKarya = pick(sbKarya, shKarya);
  const rInfo = pick(sbInfo, shInfo);

  return {
    materi: rMateri.items,
    tugas: rTugas.items,
    nilai: rNilai.items,
    karya: rKarya.items,
    info: rInfo.items,
    sources: {
      materi: rMateri.mode,
      tugas: rTugas.mode,
      nilai: rNilai.mode,
      karya: rKarya.mode,
      info: rInfo.mode,
    },
  };
}

// ---------- Check Supabase Table Availability ----------

export async function checkSupabaseTables(): Promise<TableStatus[]> {
  const tables: TableName[] = ['materi', 'tugas', 'nilai', 'karya', 'info'];
  return Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        return {
          table,
          exists: false,
          count: 0,
          error: error.message,
        };
      }
      return {
        table,
        exists: true,
        count: count ?? 0,
      };
    })
  );
}

// ---------- Spreadsheet Analyzer ----------

export async function analyzeSpreadsheetData(): Promise<SheetTableAnalysis[]> {
  const tables: TableName[] = ['materi', 'tugas', 'nilai', 'karya', 'info'];
  return Promise.all(
    tables.map(async (table) => {
      const rows = (await fetchSheet<Record<string, string>>(SHEET_URLS[table])) || [];
      const headers = rows.length ? Object.keys(rows[0]) : [];
      const emptyCounts: Record<string, number> = {};
      headers.forEach((h) => {
        emptyCounts[h] = rows.filter((r) => !r[h] || !r[h].trim()).length;
      });

      const distinctValues: Record<string, string[]> = {};
      ['Mapel', 'Kelas', 'Jenis', 'Status', 'Kategori'].forEach((col) => {
        if (headers.includes(col)) {
          distinctValues[col] = Array.from(
            new Set(rows.map((r) => (r[col] || '').trim()))
          );
        }
      });

      const anomalies: string[] = [];
      if (headers.includes('Kelas')) {
        const nonStandardKelas = distinctValues['Kelas']?.filter(
          (k) => k && k !== normalizeKelas(k)
        );
        if (nonStandardKelas?.length) {
          anomalies.push(
            `Penulisan Kelas tidak konsisten (${nonStandardKelas.join(', ')}) — akan dinormalisasi saat migrasi.`
          );
        }
      }
      if (table === 'tugas' && emptyCounts['Status'] === rows.length && rows.length > 0) {
        anomalies.push(
          'Semua baris Status kosong; portal otomatis membacanya sebagai "Belum dikerjakan".'
        );
      }
      if (table === 'tugas' && distinctValues['Jenis']?.includes('bahan')) {
        anomalies.push(
          'Kolom Jenis berisi nilai huruf kecil ("bahan") selain "Tugas".'
        );
      }
      if (table === 'karya' && emptyCounts['Pembuat'] > 0) {
        anomalies.push(`${emptyCounts['Pembuat']} dari ${rows.length} karya belum memiliki nama Pembuat.`);
      }
      if (table === 'info' && emptyCounts['Info Tambahan'] === rows.length && rows.length > 0) {
        anomalies.push('Kolom "Info Tambahan" seluruhnya kosong.');
      }
      if (table === 'nilai' && rows.length <= 1) {
        anomalies.push('Tab Nilai saat ini baru berisi 1 data contoh (NISN 3312001).');
      }

      return {
        table,
        rowCount: rows.length,
        headers,
        emptyCounts,
        distinctValues,
        anomalies,
        rows,
      };
    })
  );
}

// ---------- Migration (Google Sheets -> Supabase) ----------

export async function migrateTableToSupabase(
  table: TableName,
  rows: Record<string, string>[],
  options: { replaceExisting: boolean; normalize: boolean }
): Promise<{ inserted: number; error?: string }> {
  if (options.replaceExisting) {
    const { error: delError } = await supabase.from(table).delete().gte('id', 0);
    if (delError) {
      return { inserted: 0, error: delError.message };
    }
  }

  if (!rows.length) return { inserted: 0 };

  let payload: Record<string, unknown>[] = [];
  if (table === 'materi') payload = rows.map((r) => mapMateriToDb(r as MateriItem, options.normalize));
  else if (table === 'tugas') payload = rows.map((r) => mapTugasToDb(r as TugasItem, options.normalize));
  else if (table === 'nilai') payload = rows.map((r) => mapNilaiToDb(r as NilaiItem, options.normalize));
  else if (table === 'karya') payload = rows.map((r) => mapKaryaToDb(r as KaryaItem, options.normalize));
  else if (table === 'info') payload = rows.map((r) => mapInfoToDb(r as InfoItem));

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += BATCH) {
    const chunk = payload.slice(i, i + BATCH);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      return { inserted, error: error.message };
    }
    inserted += chunk.length;
  }

  return { inserted };
}

// ---------- Direct Supabase CRUD for Dashboard ----------

export async function fetchSupabaseRowsDirect(table: TableName) {
  if (table === 'materi') return fetchSupabaseTable('materi', mapDbToMateri);
  if (table === 'tugas') return fetchSupabaseTable('tugas', mapDbToTugas);
  if (table === 'nilai') return fetchSupabaseTable('nilai', mapDbToNilai);
  if (table === 'karya') return fetchSupabaseTable('karya', mapDbToKarya);
  return fetchSupabaseTable('info', mapDbToInfo);
}

export async function createSupabaseRow(
  table: TableName,
  item: MateriItem | TugasItem | NilaiItem | KaryaItem | InfoItem
): Promise<{ error?: string }> {
  let payload: Record<string, unknown>;
  if (table === 'materi') payload = mapMateriToDb(item as MateriItem, true);
  else if (table === 'tugas') payload = mapTugasToDb(item as TugasItem, true);
  else if (table === 'nilai') payload = mapNilaiToDb(item as NilaiItem, true);
  else if (table === 'karya') payload = mapKaryaToDb(item as KaryaItem, true);
  else payload = mapInfoToDb(item as InfoItem);

  const { error } = await supabase.from(table).insert(payload);
  return { error: error?.message };
}

export async function updateSupabaseRow(
  table: TableName,
  id: number,
  item: MateriItem | TugasItem | NilaiItem | KaryaItem | InfoItem
): Promise<{ error?: string }> {
  let payload: Record<string, unknown>;
  if (table === 'materi') payload = mapMateriToDb(item as MateriItem, true);
  else if (table === 'tugas') payload = mapTugasToDb(item as TugasItem, true);
  else if (table === 'nilai') payload = mapNilaiToDb(item as NilaiItem, true);
  else if (table === 'karya') payload = mapKaryaToDb(item as KaryaItem, true);
  else payload = mapInfoToDb(item as InfoItem);

  const { error } = await supabase.from(table).update(payload).eq('id', id);
  return { error: error?.message };
}

export async function deleteSupabaseRow(
  table: TableName,
  id: number
): Promise<{ error?: string }> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error: error?.message };
}

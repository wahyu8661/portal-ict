import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Database,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';
import {
  type InfoItem,
  type KaryaItem,
  KELAS_LIST,
  type Mapel,
  type MateriItem,
  type NilaiItem,
  type TugasItem,
} from '../data/sheets';
import {
  analyzeSpreadsheetData,
  checkSupabaseTables,
  createSupabaseRow,
  deleteSupabaseRow,
  fetchSupabaseRowsDirect,
  migrateTableToSupabase,
  type SheetTableAnalysis,
  SUPABASE_SCHEMA_SQL,
  type TableName,
  type TableStatus,
  updateSupabaseRow,
} from '../data/supabaseDb';
import { SUPABASE_URL } from '../lib/supabase';

interface DashboardViewProps {
  onBackToPortal: () => void;
  onDataChanged: () => void;
}

type DashboardMainTab = 'crud' | 'migration';

const TABLE_LABELS: Record<TableName, string> = {
  materi: 'Materi',
  tugas: 'Tugas & Kuis',
  nilai: 'Nilai Siswa',
  karya: 'Karya Siswa',
  info: 'Info & Update',
};

const ALL_TABLES: TableName[] = ['materi', 'tugas', 'nilai', 'karya', 'info'];

const KARYA_CATEGORIES = [
  'Website',
  'Infografis',
  'Poster',
  'Game',
  'Video',
  'Chatbot',
  'Model AI',
  'Computer Vision',
  'Aplikasi',
];

const INFO_JENIS_LIST = [
  'Pengumuman',
  'Video',
  'Drive',
  'Materi',
  'Aplikasi',
  'Galeri',
  'Instagram',
  'Pengumpulan tugas',
  'sintak',
  'link',
];

function createEmptyForm(table: TableName): Record<string, string> {
  if (table === 'materi') {
    return {
      Mapel: 'Informatika',
      Kelas: 'Kelas 10',
      Urutan: '1',
      Judul: '',
      Deskripsi: '',
      Tag: '',
      Link: '',
      Image: '',
    };
  }
  if (table === 'tugas') {
    return {
      Mapel: 'Informatika',
      Kelas: 'Kelas 10',
      Jenis: 'Tugas',
      Status: 'Belum dikerjakan',
      'Info Waktu': '',
      Judul: '',
      Deskripsi: '',
      Link: '',
      Image: '',
    };
  }
  if (table === 'nilai') {
    return {
      NISN: '',
      Nama: '',
      Kelas: 'Kelas 10',
      Mapel: 'Informatika',
      Komponen: '',
      Skor: '85',
    };
  }
  if (table === 'karya') {
    return {
      Mapel: 'Informatika',
      Kelas: 'Kelas 10',
      Kategori: 'Website',
      Judul: '',
      Pembuat: '',
      Link: '',
      Image: '',
    };
  }
  return {
    Jenis: 'Pengumuman',
    Judul: '',
    Deskripsi: '',
    'Info Tambahan': '',
    Link: '',
    Image: '',
  };
}

export function DashboardView({ onBackToPortal, onDataChanged }: DashboardViewProps) {
  const [mainTab, setMainTab] = useState<DashboardMainTab>('crud');
  const [activeTable, setActiveTable] = useState<TableName>('materi');

  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [checkingTables, setCheckingTables] = useState(false);

  // CRUD State
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>(() =>
    createEmptyForm('materi')
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // List filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMapel, setFilterMapel] = useState<string>('Semua');
  const [filterKelas, setFilterKelas] = useState<string>('Semua');

  // Migration & Analysis State
  const [analyses, setAnalyses] = useState<SheetTableAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysisTab, setSelectedAnalysisTab] = useState<TableName>('materi');
  const [sqlCopied, setSqlCopied] = useState(false);
  const [selectedMigrateTables, setSelectedMigrateTables] = useState<Record<TableName, boolean>>({
    materi: true,
    tugas: true,
    nilai: true,
    karya: true,
    info: true,
  });
  const [normalizeOnMigrate, setNormalizeOnMigrate] = useState(true);
  const [replaceOnMigrate, setReplaceOnMigrate] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<
    { table: TableName; inserted: number; error?: string }[]
  >([]);

  const refreshTableStatuses = useCallback(async () => {
    setCheckingTables(true);
    const statuses = await checkSupabaseTables();
    setTableStatuses(statuses);
    setCheckingTables(false);
  }, []);

  const loadActiveTableRows = useCallback(async (table: TableName) => {
    setLoadingRows(true);
    setTableError(null);
    const res = await fetchSupabaseRowsDirect(table);
    if (!res.exists) {
      setRows([]);
      setTableError(res.error || `Tabel ${table} belum tersedia di Supabase.`);
    } else {
      setRows(res.rows as unknown as Record<string, unknown>[]);
    }
    setLoadingRows(false);
  }, []);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    const result = await analyzeSpreadsheetData();
    setAnalyses(result);
    setAnalyzing(false);
  }, []);

  useEffect(() => {
    refreshTableStatuses();
    runAnalysis();
  }, [refreshTableStatuses, runAnalysis]);

  useEffect(() => {
    setEditingId(null);
    setFormState(createEmptyForm(activeTable));
    setFeedback(null);
    setConfirmDeleteId(null);
    setSearchTerm('');
    setFilterMapel('Semua');
    setFilterKelas('Semua');
    loadActiveTableRows(activeTable);
  }, [activeTable, loadActiveTableRows]);

  const currentStatus = tableStatuses.find((s) => s.table === activeTable);

  function updateField(key: string, val: string) {
    setFormState((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = formState as unknown as
      | MateriItem
      | TugasItem
      | NilaiItem
      | KaryaItem
      | InfoItem;

    const res =
      editingId !== null
        ? await updateSupabaseRow(activeTable, editingId, payload)
        : await createSupabaseRow(activeTable, payload);

    setSaving(false);

    if (res.error) {
      setFeedback({ type: 'err', msg: `Gagal menyimpan: ${res.error}` });
      return;
    }

    setFeedback({
      type: 'ok',
      msg:
        editingId !== null
          ? 'Data berhasil diperbarui di Supabase.'
          : 'Data baru berhasil ditambahkan ke Supabase.',
    });
    setEditingId(null);
    setFormState(createEmptyForm(activeTable));
    await Promise.all([loadActiveTableRows(activeTable), refreshTableStatuses()]);
    onDataChanged();
  }

  function startEdit(row: Record<string, unknown>) {
    const id = Number(row.id);
    setEditingId(id);
    const nextForm = createEmptyForm(activeTable);
    Object.keys(nextForm).forEach((k) => {
      nextForm[k] = String(row[k] ?? nextForm[k] ?? '');
    });
    setFormState(nextForm);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: number) {
    const res = await deleteSupabaseRow(activeTable, id);
    setConfirmDeleteId(null);
    if (res.error) {
      setFeedback({ type: 'err', msg: `Gagal menghapus: ${res.error}` });
      return;
    }
    setFeedback({ type: 'ok', msg: 'Data berhasil dihapus dari Supabase.' });
    if (editingId === id) {
      setEditingId(null);
      setFormState(createEmptyForm(activeTable));
    }
    await Promise.all([loadActiveTableRows(activeTable), refreshTableStatuses()]);
    onDataChanged();
  }

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterMapel !== 'Semua' && 'Mapel' in r && String(r.Mapel || '') !== filterMapel) {
        return false;
      }
      if (filterKelas !== 'Semua' && 'Kelas' in r && String(r.Kelas || '') !== filterKelas) {
        return false;
      }
      if (!q) return true;
      return Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [rows, searchTerm, filterMapel, filterKelas]);

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    } catch {
      setSqlCopied(false);
    }
  }

  async function handleRunMigration() {
    setMigrating(true);
    setMigrationResults([]);
    const results: { table: TableName; inserted: number; error?: string }[] = [];

    for (const table of ALL_TABLES) {
      if (!selectedMigrateTables[table]) continue;
      const analysis = analyses.find((a) => a.table === table);
      const sheetRows = analysis?.rows || [];
      const res = await migrateTableToSupabase(table, sheetRows, {
        replaceExisting: replaceOnMigrate,
        normalize: normalizeOnMigrate,
      });
      results.push({ table, ...res });
      setMigrationResults([...results]);
    }

    setMigrating(false);
    await refreshTableStatuses();
    await loadActiveTableRows(activeTable);
    onDataChanged();
  }

  const selectedAnalysis = analyses.find((a) => a.table === selectedAnalysisTab);
  const totalSheetRows = analyses.reduce((acc, a) => acc + a.rowCount, 0);
  const allTablesExist =
    tableStatuses.length === ALL_TABLES.length && tableStatuses.every((s) => s.exists);

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <div className="container dash-topbar-inner">
          <div className="dash-brand">
            <button type="button" className="dash-back-btn" onClick={onBackToPortal}>
              <ArrowLeft size={16} />
              <span>Kembali ke Portal</span>
            </button>
            <div>
              <h1>Dashboard Guru &amp; Migrasi Supabase</h1>
              <p className="dash-sub-url">Target: {SUPABASE_URL}</p>
            </div>
          </div>

          <div className="dash-main-tabs">
            <button
              type="button"
              className={`dash-main-tab${mainTab === 'crud' ? ' active' : ''}`}
              onClick={() => setMainTab('crud')}
            >
              <Database size={16} />
              <span>Input &amp; Kelola Data</span>
            </button>
            <button
              type="button"
              className={`dash-main-tab${mainTab === 'migration' ? ' active' : ''}`}
              onClick={() => setMainTab('migration')}
            >
              <UploadCloud size={16} />
              <span>Analisis &amp; Migrasi Spreadsheet</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container dash-content">
        {mainTab === 'crud' ? (
          <>
            <div className="dash-table-pills">
              {ALL_TABLES.map((tbl) => {
                const st = tableStatuses.find((s) => s.table === tbl);
                return (
                  <button
                    key={tbl}
                    type="button"
                    className={`dash-table-pill${activeTable === tbl ? ' active' : ''}`}
                    onClick={() => setActiveTable(tbl)}
                  >
                    <span>{TABLE_LABELS[tbl]}</span>
                    <span className={`dash-count-badge${st?.exists ? ' ok' : ' missing'}`}>
                      {st ? (st.exists ? st.count : 'Belum ada') : '...'}
                    </span>
                  </button>
                );
              })}
            </div>

            {currentStatus && !currentStatus.exists ? (
              <div className="dash-alert warn">
                <AlertTriangle size={20} />
                <div className="dash-alert-body">
                  <strong>
                    Tabel <code>public.{activeTable}</code> belum dibuat di Supabase.
                  </strong>
                  <p>
                    Jalankan skrip SQL pembuatan tabel terlebih dahulu agar form input dan daftar
                    data dapat menyimpan langsung ke Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setMainTab('migration')}
                >
                  Buka Panduan Setup &amp; Migrasi →
                </button>
              </div>
            ) : null}

            <div className="dash-crud-grid">
              {/* FORM INPUT / EDIT */}
              <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="dash-card-head">
                  <h2>
                    {editingId !== null
                      ? `Edit ${TABLE_LABELS[activeTable]} (#${editingId})`
                      : `Tambah ${TABLE_LABELS[activeTable]}`}
                  </h2>
                  {editingId !== null ? (
                    <button
                      type="button"
                      className="dash-link-btn"
                      onClick={() => {
                        setEditingId(null);
                        setFormState(createEmptyForm(activeTable));
                      }}
                    >
                      Batal Edit
                    </button>
                  ) : null}
                </div>

                {feedback ? (
                  <div className={`dash-feedback ${feedback.type}`}>
                    {feedback.type === 'ok' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                ) : null}

                {activeTable === 'materi' && (
                  <>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="f-mapel">Mapel</label>
                        <select
                          id="f-mapel"
                          value={formState.Mapel}
                          onChange={(e) => updateField('Mapel', e.target.value as Mapel)}
                        >
                          <option value="Informatika">Informatika</option>
                          <option value="KKA">KKA</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="f-kelas">Kelas</label>
                        <select
                          id="f-kelas"
                          value={formState.Kelas}
                          onChange={(e) => updateField('Kelas', e.target.value)}
                        >
                          {KELAS_LIST.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="f-urutan">Urutan</label>
                        <input
                          id="f-urutan"
                          type="number"
                          min={1}
                          required
                          value={formState.Urutan}
                          onChange={(e) => updateField('Urutan', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="f-tag">Tag / Topik</label>
                        <input
                          id="f-tag"
                          type="text"
                          placeholder="contoh: Berpikir Komputasional"
                          value={formState.Tag}
                          onChange={(e) => updateField('Tag', e.target.value)}
                        />
                      </div>
                    </div>
                    <label htmlFor="f-judul">Judul Materi</label>
                    <input
                      id="f-judul"
                      type="text"
                      required
                      placeholder="contoh: Pengenalan Mikrokontroler"
                      value={formState.Judul}
                      onChange={(e) => updateField('Judul', e.target.value)}
                    />
                    <label htmlFor="f-desk">Deskripsi</label>
                    <textarea
                      id="f-desk"
                      rows={3}
                      placeholder="Ringkasan materi pembelajaran..."
                      value={formState.Deskripsi}
                      onChange={(e) => updateField('Deskripsi', e.target.value)}
                    />
                    <label htmlFor="f-link">Tautan Materi (URL)</label>
                    <input
                      id="f-link"
                      type="url"
                      placeholder="https://..."
                      value={formState.Link}
                      onChange={(e) => updateField('Link', e.target.value)}
                    />
                    <label htmlFor="f-img">URL Gambar Sampul (Opsional)</label>
                    <input
                      id="f-img"
                      type="url"
                      placeholder="https://..."
                      value={formState.Image}
                      onChange={(e) => updateField('Image', e.target.value)}
                    />
                  </>
                )}

                {activeTable === 'tugas' && (
                  <>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="t-mapel">Mapel</label>
                        <select
                          id="t-mapel"
                          value={formState.Mapel}
                          onChange={(e) => updateField('Mapel', e.target.value)}
                        >
                          <option value="Informatika">Informatika</option>
                          <option value="KKA">KKA</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="t-kelas">Kelas</label>
                        <select
                          id="t-kelas"
                          value={formState.Kelas}
                          onChange={(e) => updateField('Kelas', e.target.value)}
                        >
                          {KELAS_LIST.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="t-jenis">Jenis</label>
                        <select
                          id="t-jenis"
                          value={formState.Jenis}
                          onChange={(e) => updateField('Jenis', e.target.value)}
                        >
                          <option value="Tugas">Tugas</option>
                          <option value="Kuis">Kuis</option>
                          <option value="Bahan">Bahan</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="t-status">Status</label>
                        <select
                          id="t-status"
                          value={formState.Status}
                          onChange={(e) => updateField('Status', e.target.value)}
                        >
                          <option value="Belum dikerjakan">Belum dikerjakan</option>
                          <option value="Menunggu penilaian">Menunggu penilaian</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </div>
                    <label htmlFor="t-waktu">Info Waktu / Tenggat</label>
                    <input
                      id="t-waktu"
                      type="text"
                      placeholder="contoh: Pekan 4 / Batas Jumat 17.00"
                      value={formState['Info Waktu']}
                      onChange={(e) => updateField('Info Waktu', e.target.value)}
                    />
                    <label htmlFor="t-judul">Judul Tugas / Kuis</label>
                    <input
                      id="t-judul"
                      type="text"
                      required
                      placeholder="contoh: Kuis Algoritma Dasar"
                      value={formState.Judul}
                      onChange={(e) => updateField('Judul', e.target.value)}
                    />
                    <label htmlFor="t-desk">Deskripsi</label>
                    <textarea
                      id="t-desk"
                      rows={3}
                      placeholder="Instruksi pengerjaan..."
                      value={formState.Deskripsi}
                      onChange={(e) => updateField('Deskripsi', e.target.value)}
                    />
                    <label htmlFor="t-link">Tautan Form / Pengumpulan (URL)</label>
                    <input
                      id="t-link"
                      type="url"
                      placeholder="https://..."
                      value={formState.Link}
                      onChange={(e) => updateField('Link', e.target.value)}
                    />
                    <label htmlFor="t-img">URL Gambar (Opsional)</label>
                    <input
                      id="t-img"
                      type="url"
                      placeholder="https://..."
                      value={formState.Image}
                      onChange={(e) => updateField('Image', e.target.value)}
                    />
                  </>
                )}

                {activeTable === 'nilai' && (
                  <>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="n-nisn">NISN / Nomor Induk</label>
                        <input
                          id="n-nisn"
                          type="text"
                          required
                          placeholder="contoh: 3312001"
                          value={formState.NISN}
                          onChange={(e) => updateField('NISN', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="n-nama">Nama Siswa</label>
                        <input
                          id="n-nama"
                          type="text"
                          required
                          placeholder="contoh: Ahmad Fauzan"
                          value={formState.Nama}
                          onChange={(e) => updateField('Nama', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="n-mapel">Mapel</label>
                        <select
                          id="n-mapel"
                          value={formState.Mapel}
                          onChange={(e) => updateField('Mapel', e.target.value)}
                        >
                          <option value="Informatika">Informatika</option>
                          <option value="KKA">KKA</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="n-kelas">Kelas</label>
                        <select
                          id="n-kelas"
                          value={formState.Kelas}
                          onChange={(e) => updateField('Kelas', e.target.value)}
                        >
                          {KELAS_LIST.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="n-komp">Komponen Penilaian</label>
                        <input
                          id="n-komp"
                          type="text"
                          required
                          placeholder="contoh: Tugas Harian / UTS / Proyek"
                          value={formState.Komponen}
                          onChange={(e) => updateField('Komponen', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="n-skor">Skor (0–100)</label>
                        <input
                          id="n-skor"
                          type="number"
                          min={0}
                          max={100}
                          required
                          value={formState.Skor}
                          onChange={(e) => updateField('Skor', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTable === 'karya' && (
                  <>
                    <div className="dash-row-2">
                      <div>
                        <label htmlFor="k-mapel">Mapel</label>
                        <select
                          id="k-mapel"
                          value={formState.Mapel}
                          onChange={(e) => updateField('Mapel', e.target.value)}
                        >
                          <option value="Informatika">Informatika</option>
                          <option value="KKA">KKA</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="k-kelas">Kelas</label>
                        <select
                          id="k-kelas"
                          value={formState.Kelas}
                          onChange={(e) => updateField('Kelas', e.target.value)}
                        >
                          {KELAS_LIST.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label htmlFor="k-kat">Kategori Karya</label>
                    <input
                      id="k-kat"
                      type="text"
                      list="karya-cat-list"
                      required
                      placeholder="Website, Infografis, Aplikasi, Video..."
                      value={formState.Kategori}
                      onChange={(e) => updateField('Kategori', e.target.value)}
                    />
                    <datalist id="karya-cat-list">
                      {KARYA_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <label htmlFor="k-judul">Judul Karya</label>
                    <input
                      id="k-judul"
                      type="text"
                      required
                      placeholder="contoh: Aplikasi Rekomendasi Laptop"
                      value={formState.Judul}
                      onChange={(e) => updateField('Judul', e.target.value)}
                    />
                    <label htmlFor="k-pembuat">Nama Pembuat / Kelompok</label>
                    <input
                      id="k-pembuat"
                      type="text"
                      placeholder="contoh: Kelompok 1 / Nama Siswa"
                      value={formState.Pembuat}
                      onChange={(e) => updateField('Pembuat', e.target.value)}
                    />
                    <label htmlFor="k-link">Tautan Karya (URL)</label>
                    <input
                      id="k-link"
                      type="url"
                      placeholder="https://..."
                      value={formState.Link}
                      onChange={(e) => updateField('Link', e.target.value)}
                    />
                    <label htmlFor="k-img">URL Gambar Preview</label>
                    <input
                      id="k-img"
                      type="url"
                      placeholder="https://..."
                      value={formState.Image}
                      onChange={(e) => updateField('Image', e.target.value)}
                    />
                  </>
                )}

                {activeTable === 'info' && (
                  <>
                    <label htmlFor="i-jenis">Jenis Info</label>
                    <input
                      id="i-jenis"
                      type="text"
                      list="info-jenis-list"
                      required
                      placeholder="Pengumuman, Video, Drive, Materi..."
                      value={formState.Jenis}
                      onChange={(e) => updateField('Jenis', e.target.value)}
                    />
                    <datalist id="info-jenis-list">
                      {INFO_JENIS_LIST.map((j) => (
                        <option key={j} value={j} />
                      ))}
                    </datalist>
                    <label htmlFor="i-judul">Judul Info</label>
                    <input
                      id="i-judul"
                      type="text"
                      required
                      placeholder="contoh: Jadwal Praktikum Lab ICT 1"
                      value={formState.Judul}
                      onChange={(e) => updateField('Judul', e.target.value)}
                    />
                    <label htmlFor="i-desk">Deskripsi</label>
                    <textarea
                      id="i-desk"
                      rows={3}
                      placeholder="Keterangan singkat..."
                      value={formState.Deskripsi}
                      onChange={(e) => updateField('Deskripsi', e.target.value)}
                    />
                    <label htmlFor="i-tambahan">Info Tambahan (Tanggal / Catatan)</label>
                    <input
                      id="i-tambahan"
                      type="text"
                      placeholder="contoh: 20 Nov 2026"
                      value={formState['Info Tambahan']}
                      onChange={(e) => updateField('Info Tambahan', e.target.value)}
                    />
                    <label htmlFor="i-link">Tautan (URL)</label>
                    <input
                      id="i-link"
                      type="url"
                      placeholder="https://..."
                      value={formState.Link}
                      onChange={(e) => updateField('Link', e.target.value)}
                    />
                    <label htmlFor="i-img">URL Gambar (Opsional)</label>
                    <input
                      id="i-img"
                      type="url"
                      placeholder="https://..."
                      value={formState.Image}
                      onChange={(e) => updateField('Image', e.target.value)}
                    />
                  </>
                )}

                <button
                  type="submit"
                  className="btn-block dash-submit-btn"
                  disabled={saving || Boolean(currentStatus && !currentStatus.exists)}
                >
                  <Plus size={16} />
                  <span>
                    {saving
                      ? 'Menyimpan...'
                      : editingId !== null
                        ? 'Simpan Perubahan'
                        : 'Simpan ke Supabase'}
                  </span>
                </button>
              </form>

              {/* DATA LIST TABLE */}
              <div className="dash-card dash-list-card">
                <div className="dash-list-toolbar">
                  <div className="dash-search-box">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Cari data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {activeTable !== 'info' && (
                    <>
                      <select
                        aria-label="Filter Mapel"
                        value={filterMapel}
                        onChange={(e) => setFilterMapel(e.target.value)}
                      >
                        <option value="Semua">Semua Mapel</option>
                        <option value="Informatika">Informatika</option>
                        <option value="KKA">KKA</option>
                      </select>
                      <select
                        aria-label="Filter Kelas"
                        value={filterKelas}
                        onChange={(e) => setFilterKelas(e.target.value)}
                      >
                        <option value="Semua">Semua Kelas</option>
                        {KELAS_LIST.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  <button
                    type="button"
                    className="dash-icon-btn"
                    title="Muat ulang dari Supabase"
                    onClick={() => {
                      loadActiveTableRows(activeTable);
                      refreshTableStatuses();
                    }}
                  >
                    <RefreshCw size={15} className={loadingRows ? 'spin' : ''} />
                  </button>
                </div>

                {tableError ? (
                  <div className="dash-empty-box">
                    <p>{tableError}</p>
                  </div>
                ) : loadingRows ? (
                  <div className="dash-empty-box">
                    <p>Memuat data dari Supabase...</p>
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="dash-empty-box">
                    <p>
                      Belum ada data yang sesuai di tabel <code>{activeTable}</code>.
                    </p>
                  </div>
                ) : (
                  <div className="dash-table-scroll">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          {activeTable === 'materi' && (
                            <>
                              <th>Mapel / Kelas</th>
                              <th>Urutan &amp; Judul</th>
                              <th>Tag</th>
                              <th>Aksi</th>
                            </>
                          )}
                          {activeTable === 'tugas' && (
                            <>
                              <th>Mapel / Kelas</th>
                              <th>Jenis &amp; Judul</th>
                              <th>Status</th>
                              <th>Aksi</th>
                            </>
                          )}
                          {activeTable === 'nilai' && (
                            <>
                              <th>NISN / Nama</th>
                              <th>Mapel / Kelas</th>
                              <th>Komponen &amp; Skor</th>
                              <th>Aksi</th>
                            </>
                          )}
                          {activeTable === 'karya' && (
                            <>
                              <th>Mapel / Kelas</th>
                              <th>Kategori &amp; Judul</th>
                              <th>Pembuat</th>
                              <th>Aksi</th>
                            </>
                          )}
                          {activeTable === 'info' && (
                            <>
                              <th>Jenis</th>
                              <th>Judul &amp; Deskripsi</th>
                              <th>Info Tambahan</th>
                              <th>Aksi</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => {
                          const id = Number(row.id);
                          return (
                            <tr key={id}>
                              {activeTable === 'materi' && (
                                <>
                                  <td>
                                    <strong>{String(row.Mapel || '')}</strong>
                                    <div className="dash-cell-sub">{String(row.Kelas || '')}</div>
                                  </td>
                                  <td>
                                    <span className="dash-mono-tag">#{String(row.Urutan || 1)}</span>{' '}
                                    <strong>{String(row.Judul || '')}</strong>
                                    {row.Deskripsi ? (
                                      <div className="dash-cell-sub">{String(row.Deskripsi)}</div>
                                    ) : null}
                                  </td>
                                  <td>{String(row.Tag || '—')}</td>
                                </>
                              )}
                              {activeTable === 'tugas' && (
                                <>
                                  <td>
                                    <strong>{String(row.Mapel || '')}</strong>
                                    <div className="dash-cell-sub">{String(row.Kelas || '')}</div>
                                  </td>
                                  <td>
                                    <span className="dash-mono-tag">{String(row.Jenis || 'Tugas')}</span>{' '}
                                    <strong>{String(row.Judul || '')}</strong>
                                    {row['Info Waktu'] ? (
                                      <div className="dash-cell-sub">
                                        {String(row['Info Waktu'])}
                                      </div>
                                    ) : null}
                                  </td>
                                  <td>{String(row.Status || 'Belum dikerjakan')}</td>
                                </>
                              )}
                              {activeTable === 'nilai' && (
                                <>
                                  <td>
                                    <strong>{String(row.Nama || '')}</strong>
                                    <div className="dash-cell-sub">
                                      NISN {String(row.NISN || '')}
                                    </div>
                                  </td>
                                  <td>
                                    <strong>{String(row.Mapel || '')}</strong>
                                    <div className="dash-cell-sub">{String(row.Kelas || '')}</div>
                                  </td>
                                  <td>
                                    {String(row.Komponen || '')} —{' '}
                                    <strong className="dash-score-hi">{String(row.Skor || 0)}</strong>
                                  </td>
                                </>
                              )}
                              {activeTable === 'karya' && (
                                <>
                                  <td>
                                    <strong>{String(row.Mapel || '')}</strong>
                                    <div className="dash-cell-sub">{String(row.Kelas || '')}</div>
                                  </td>
                                  <td>
                                    <span className="dash-mono-tag">
                                      {String(row.Kategori || '')}
                                    </span>{' '}
                                    <strong>{String(row.Judul || '')}</strong>
                                  </td>
                                  <td>{String(row.Pembuat || '—')}</td>
                                </>
                              )}
                              {activeTable === 'info' && (
                                <>
                                  <td>
                                    <span className="dash-mono-tag">{String(row.Jenis || '')}</span>
                                  </td>
                                  <td>
                                    <strong>{String(row.Judul || '')}</strong>
                                    {row.Deskripsi ? (
                                      <div className="dash-cell-sub">{String(row.Deskripsi)}</div>
                                    ) : null}
                                  </td>
                                  <td>{String(row['Info Tambahan'] || '—')}</td>
                                </>
                              )}
                              <td className="dash-actions-cell">
                                {confirmDeleteId === id ? (
                                  <div className="dash-confirm-inline">
                                    <button
                                      type="button"
                                      className="dash-btn-danger-sm"
                                      onClick={() => handleDelete(id)}
                                    >
                                      Hapus
                                    </button>
                                    <button
                                      type="button"
                                      className="dash-btn-ghost-sm"
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <div className="dash-action-btns">
                                    <button
                                      type="button"
                                      className="dash-icon-btn"
                                      title="Edit baris"
                                      onClick={() => startEdit(row)}
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="dash-icon-btn danger"
                                      title="Hapus baris"
                                      onClick={() => setConfirmDeleteId(id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="dash-migration-stack">
            {/* STEP 1: ANALISIS DATABASE SPREADSHEET */}
            <section className="dash-card dash-step-card">
              <div className="dash-step-head">
                <div>
                  <span className="eyebrow">Langkah 1 · Audit Data Sumber</span>
                  <h2>Hasil Analisis Database Google Sheets</h2>
                  <p className="dash-step-desc">
                    Total terdeteksi <strong>{totalSheetRows} baris data</strong> di 5 tab
                    spreadsheet sumber yang siap dipetakan ke tabel relasional PostgreSQL di
                    Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  <RefreshCw size={15} className={analyzing ? 'spin' : ''} />
                  <span>{analyzing ? 'Menganalisis...' : 'Analisis Ulang'}</span>
                </button>
              </div>

              <div className="dash-summary-grid">
                {analyses.map((a) => (
                  <button
                    key={a.table}
                    type="button"
                    className={`dash-summary-item${selectedAnalysisTab === a.table ? ' active' : ''}`}
                    onClick={() => setSelectedAnalysisTab(a.table)}
                  >
                    <div className="dash-summary-top">
                      <FileSpreadsheet size={16} />
                      <span>{TABLE_LABELS[a.table]}</span>
                    </div>
                    <div className="dash-summary-num">{a.rowCount} baris</div>
                    <div className="dash-summary-cols">{a.headers.length} kolom</div>
                  </button>
                ))}
              </div>

              {selectedAnalysis ? (
                <div className="dash-analysis-detail">
                  <div className="dash-analysis-cols">
                    <div>
                      <h4>Struktur Kolom &amp; Data Kosong ({TABLE_LABELS[selectedAnalysis.table]})</h4>
                      <div className="dash-chip-list">
                        {selectedAnalysis.headers.map((h) => (
                          <span key={h} className="dash-col-chip">
                            <code>{h}</code>
                            <small>
                              {selectedAnalysis.emptyCounts[h] > 0
                                ? `${selectedAnalysis.emptyCounts[h]} kosong`
                                : 'lengkap'}
                            </small>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4>Nilai Unik Terdeteksi</h4>
                      {Object.entries(selectedAnalysis.distinctValues).map(([col, vals]) => (
                        <div key={col} className="dash-distinct-row">
                          <strong>{col}:</strong>{' '}
                          <span>{vals.map((v) => v || '(kosong)').join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAnalysis.anomalies.length > 0 ? (
                    <div className="dash-anomaly-box">
                      <strong>Temuan &amp; Penyesuaian Migrasi:</strong>
                      <ul>
                        {selectedAnalysis.anomalies.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="dash-preview-wrap">
                    <h4>Pratinjau 3 Baris Pertama dari Spreadsheet</h4>
                    <div className="dash-table-scroll">
                      <table className="dash-table compact">
                        <thead>
                          <tr>
                            {selectedAnalysis.headers.map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAnalysis.rows.slice(0, 3).map((r, i) => (
                            <tr key={i}>
                              {selectedAnalysis.headers.map((h) => (
                                <td key={h}>{r[h] || '—'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            {/* STEP 2: SETUP TABEL SUPABASE */}
            <section className="dash-card dash-step-card">
              <div className="dash-step-head">
                <div>
                  <span className="eyebrow">Langkah 2 · Skema Database Supabase</span>
                  <h2>Siapkan 5 Tabel &amp; Cek Koneksi Supabase</h2>
                  <p className="dash-step-desc">
                    Key yang dilampirkan adalah <em>publishable key</em> sehingga pembuatan tabel
                    (DDL) perlu dijalankan sekali di <strong>Supabase Dashboard → SQL Editor</strong>.
                  </p>
                </div>
                <div className="dash-btn-row">
                  <button type="button" className="btn-ghost" onClick={handleCopySql}>
                    <Copy size={15} />
                    <span>{sqlCopied ? 'SQL Tersalin!' : 'Salin Skrip SQL'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={refreshTableStatuses}
                    disabled={checkingTables}
                  >
                    <RefreshCw size={15} className={checkingTables ? 'spin' : ''} />
                    <span>{checkingTables ? 'Memeriksa...' : 'Cek Status Tabel'}</span>
                  </button>
                </div>
              </div>

              <div className="dash-status-grid">
                {tableStatuses.map((st) => (
                  <div
                    key={st.table}
                    className={`dash-status-chip ${st.exists ? 'ready' : 'pending'}`}
                  >
                    <strong>public.{st.table}</strong>
                    <span>{st.exists ? `Siap (${st.count} baris)` : 'Belum dibuat'}</span>
                  </div>
                ))}
              </div>

              <pre className="dash-sql-box">
                <code>{SUPABASE_SCHEMA_SQL}</code>
              </pre>
            </section>

            {/* STEP 3: EKSEKUSI MIGRASI */}
            <section className="dash-card dash-step-card">
              <div className="dash-step-head">
                <div>
                  <span className="eyebrow">Langkah 3 · Transfer Data</span>
                  <h2>Migrasi Data Spreadsheet → Supabase</h2>
                  <p className="dash-step-desc">
                    Pilih tabel yang ingin dimigrasikan. Setelah migrasi selesai, website portal
                    pembelajaran akan otomatis membaca dan menampilkan data langsung dari Supabase.
                  </p>
                </div>
              </div>

              <div className="dash-migrate-options">
                <div className="dash-check-group">
                  <span className="dash-group-label">Pilih Tab untuk Dimigrasi:</span>
                  <div className="dash-check-row">
                    {ALL_TABLES.map((tbl) => (
                      <label key={tbl} className="dash-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedMigrateTables[tbl]}
                          onChange={(e) =>
                            setSelectedMigrateTables((prev) => ({
                              ...prev,
                              [tbl]: e.target.checked,
                            }))
                          }
                        />
                        <span>{TABLE_LABELS[tbl]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="dash-check-group">
                  <span className="dash-group-label">Pengaturan Migrasi:</span>
                  <div className="dash-check-row">
                    <label className="dash-checkbox">
                      <input
                        type="checkbox"
                        checked={normalizeOnMigrate}
                        onChange={(e) => setNormalizeOnMigrate(e.target.checked)}
                      />
                      <span>Normalisasi format Kelas (mis. &quot;kelas 12&quot; → &quot;Kelas 12&quot;) &amp; tipe angka</span>
                    </label>
                    <label className="dash-checkbox">
                      <input
                        type="checkbox"
                        checked={replaceOnMigrate}
                        onChange={(e) => setReplaceOnMigrate(e.target.checked)}
                      />
                      <span>Kosongkan isi tabel Supabase sebelum isi ulang (mencegah duplikat)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="dash-migrate-actions">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={migrating || !allTablesExist}
                  onClick={handleRunMigration}
                >
                  <UploadCloud size={17} />
                  <span>
                    {migrating
                      ? 'Sedang Memigrasikan Data...'
                      : 'Jalankan Migrasi ke Supabase Sekarang'}
                  </span>
                </button>
                {!allTablesExist ? (
                  <span className="dash-helper-warn">
                    Jalankan skrip SQL pada Langkah 2 di Supabase SQL Editor lalu klik &quot;Cek Status
                    Tabel&quot; terlebih dahulu.
                  </span>
                ) : null}
              </div>

              {migrationResults.length > 0 ? (
                <div className="dash-migrate-results">
                  {migrationResults.map((res) => (
                    <div
                      key={res.table}
                      className={`dash-feedback ${res.error ? 'err' : 'ok'}`}
                    >
                      {res.error ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                      <span>
                        <strong>public.{res.table}</strong>:{' '}
                        {res.error
                          ? `Gagal (${res.error})`
                          : `${res.inserted} baris berhasil dimigrasikan ke Supabase.`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

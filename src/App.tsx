import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { CardMediaImage, MediaBox } from './components/MediaBox';
import { PointerFX } from './components/PointerFX';
import { SubjectSwitch } from './components/SubjectSwitch';
import { TeacherPortal } from './components/TeacherPortal';
import {
  DEFAULT_INFO,
  DEFAULT_KARYA,
  DEFAULT_MATERI,
  DEFAULT_NILAI,
  DEFAULT_TUGAS,
  getInfoVisual,
  type InfoItem,
  type KaryaItem,
  KAT_META,
  KELAS_LIST,
  type Mapel,
  type MateriItem,
  type NilaiItem,
  STATUS_LABEL,
  statusKey,
  type TugasItem,
} from './data/sheets';
import { loadPortalData } from './data/supabaseDb';

interface CardWrapperProps {
  link?: string;
  className: string;
  children: ReactNode;
}

function CardWrapper({ link, className, children }: CardWrapperProps) {
  if (link) {
    return (
      <a className={className} href={link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

function GoldSquiggle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className="nav-squiggle"
    >
      <path
        d="M2 6.5 C 40 2, 70 9.5, 100 6 C 130 2.5, 160 9, 198 4.5"
        fill="none"
        stroke="#FDD000"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarburstNode({ className }: { className: string }) {
  return (
    <span className={`starburst-node ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="starburst-rays" fill="none">
        <polygon points="23.50,12.00 18.49,11.61 18.49,12.39" fill="#F1B23A" />
        <polygon points="21.96,17.75 17.81,14.91 17.42,15.58" fill="#F1B23A" />
        <polygon points="17.75,21.96 15.58,17.42 14.91,17.81" fill="#F1B23A" />
        <polygon points="12.00,23.50 12.39,18.49 11.61,18.49" fill="#F1B23A" />
        <polygon points="6.25,21.96 9.09,17.81 8.42,17.42" fill="#F1B23A" />
        <polygon points="2.04,17.75 6.58,15.58 6.19,14.91" fill="#F1B23A" />
        <polygon points="0.50,12.00 5.51,12.39 5.51,11.61" fill="#F1B23A" />
        <polygon points="2.04,6.25 6.19,9.09 6.58,8.42" fill="#F1B23A" />
        <polygon points="6.25,2.04 8.42,6.58 9.09,6.19" fill="#F1B23A" />
        <polygon points="12.00,0.50 11.61,5.51 12.39,5.51" fill="#F1B23A" />
        <polygon points="17.75,2.04 14.91,6.19 15.58,6.58" fill="#F1B23A" />
        <polygon points="21.96,6.25 17.42,8.42 17.81,9.09" fill="#F1B23A" />
      </svg>
      <span className="starburst-core" />
    </span>
  );
}

function checkIsTeacherRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/guru' ||
    path.endsWith('/guru') ||
    hash === '#guru' ||
    hash.startsWith('#/guru') ||
    params.has('guru')
  );
}

const KARYA_HEIGHT_CLASSES = ['media-h-160', 'media-h-190', 'media-h-220'] as const;

export default function App() {
  const [isTeacherRoute, setIsTeacherRoute] = useState<boolean>(() => checkIsTeacherRoute());

  const [materiAll, setMateriAll] = useState<MateriItem[]>(DEFAULT_MATERI);
  const [tugasAll, setTugasAll] = useState<TugasItem[]>(DEFAULT_TUGAS);
  const [nilaiAll, setNilaiAll] = useState<NilaiItem[]>(DEFAULT_NILAI);
  const [karyaAll, setKaryaAll] = useState<KaryaItem[]>(DEFAULT_KARYA);
  const [infoAll, setInfoAll] = useState<InfoItem[]>(DEFAULT_INFO);

  const [currentMapelMateri, setCurrentMapelMateri] = useState<Mapel>('Informatika');
  const [currentMapelTugas, setCurrentMapelTugas] = useState<Mapel>('Informatika');
  const [currentMapelKarya, setCurrentMapelKarya] = useState<Mapel>('Informatika');
  const [currentKelasMateri, setCurrentKelasMateri] = useState<string>('Kelas 10');
  const [currentKelasTugas, setCurrentKelasTugas] = useState<string>('Kelas 10');
  const [currentKaryaFilter, setCurrentKaryaFilter] = useState<string>('Semua');

  const [nisnInput, setNisnInput] = useState('');
  const [mapelSelect, setMapelSelect] = useState<Mapel>('Informatika');
  const [nilaiQuery, setNilaiQuery] = useState<{ nisn: string; mapel: Mapel } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    const syncRoute = () => setIsTeacherRoute(checkIsTeacherRoute());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const refreshData = useCallback(async () => {
    const res = await loadPortalData();
    setMateriAll(res.materi);
    setTugasAll(res.tugas);
    setNilaiAll(res.nilai);
    setKaryaAll(res.karya);
    setInfoAll(res.info);
  }, []);

  useEffect(() => {
    if (!isTeacherRoute) {
      refreshData();
    }
  }, [isTeacherRoute, refreshData]);

  // Reveal on scroll
  useEffect(() => {
    if (isTeacherRoute) return;
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isTeacherRoute]);

  // Mobile sidebar Escape, resize, and body no-scroll sync
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 860) setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const materiItems = useMemo(() => {
    return materiAll
      .filter((m) => m.Mapel === currentMapelMateri && m.Kelas === currentKelasMateri)
      .sort((a, b) => (parseInt(a.Urutan || '', 10) || 0) - (parseInt(b.Urutan || '', 10) || 0));
  }, [materiAll, currentMapelMateri, currentKelasMateri]);

  const tugasItems = useMemo(() => {
    return tugasAll.filter((t) => t.Mapel === currentMapelTugas && t.Kelas === currentKelasTugas);
  }, [tugasAll, currentMapelTugas, currentKelasTugas]);

  const karyaCategories = useMemo(() => {
    const unique = Array.from(
      new Set(
        karyaAll
          .filter((k) => k.Mapel === currentMapelKarya)
          .map((k) => k.Kategori || '')
          .filter(Boolean)
      )
    );
    return ['Semua', ...unique];
  }, [karyaAll, currentMapelKarya]);

  const activeKaryaFilter = karyaCategories.includes(currentKaryaFilter)
    ? currentKaryaFilter
    : 'Semua';

  const karyaItems = useMemo(() => {
    return karyaAll.filter(
      (k) =>
        k.Mapel === currentMapelKarya &&
        (activeKaryaFilter === 'Semua' || k.Kategori === activeKaryaFilter)
    );
  }, [karyaAll, currentMapelKarya, activeKaryaFilter]);

  const nilaiRows = useMemo(() => {
    if (!nilaiQuery) return null;
    return nilaiAll.filter(
      (n) => n.NISN === nilaiQuery.nisn && n.Mapel === nilaiQuery.mapel
    );
  }, [nilaiAll, nilaiQuery]);

  const nilaiAverage = useMemo(() => {
    if (!nilaiRows || !nilaiRows.length) return 0;
    const sum = nilaiRows.reduce((acc, row) => acc + (parseInt(row.Skor || '', 10) || 0), 0);
    return Math.round(sum / nilaiRows.length);
  }, [nilaiRows]);

  function handleCekNilai(e?: FormEvent) {
    if (e) e.preventDefault();
    setNilaiQuery({
      nisn: nisnInput.trim(),
      mapel: mapelSelect,
    });
  }

  // Dedicated route for Teacher-only Database Portal (/guru, #/guru, ?guru)
  if (isTeacherRoute) {
    return (
      <>
        <PointerFX />
        <TeacherPortal />
      </>
    );
  }

  return (
    <>
      <PointerFX />
      <nav id="navbar" className={scrolled ? 'scrolled' : 'over-hero'}>
        <div className="nav-inner">
          <div className="brand">
            <img
              className="logo-mark"
              src="/assets/logo-attaufiq.png"
              alt="Logo Sekolah Islam Attaufiq"
            />
            <div>
              <span className="brand-name">INF &amp; KKA</span>
              <small>SMP–SMA Attaufiq · Jambi</small>
            </div>
          </div>
          <div className="nav-links">
            <a href="#info">
              Info
              <GoldSquiggle />
            </a>
            <a href="#materi">
              Materi
              <GoldSquiggle />
            </a>
            <a href="#tugas">
              Tugas &amp; Kuis
              <GoldSquiggle />
            </a>
            <a href="#nilai">
              Cek Nilai
              <GoldSquiggle />
            </a>
            <a href="#karya">
              Karya Siswa
              <GoldSquiggle />
            </a>
          </div>
          <div className="nav-right">
            <a href="#materi" className="nav-cta">
              Mulai Belajar →
            </a>
            <button
              type="button"
              className={`nav-toggle${sidebarOpen ? ' open' : ''}`}
              aria-label="Buka menu navigasi"
              aria-expanded={sidebarOpen}
              aria-controls="mobileSidebar"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`mobile-sidebar${sidebarOpen ? ' open' : ''}`}
        id="mobileSidebar"
        aria-hidden={!sidebarOpen}
      >
        <div className="mobile-sidebar-head">
          <div>
            <strong>INF &amp; KKA</strong>
            <small>SMP–SMA Attaufiq · Jambi</small>
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="mobile-nav-links">
          <a href="#info" onClick={() => setSidebarOpen(false)}>
            📢 Info
          </a>
          <a href="#materi" onClick={() => setSidebarOpen(false)}>
            📚 Materi
          </a>
          <a href="#tugas" onClick={() => setSidebarOpen(false)}>
            📝 Tugas &amp; Kuis
          </a>
          <a href="#nilai" onClick={() => setSidebarOpen(false)}>
            📊 Cek Nilai
          </a>
          <a href="#karya" onClick={() => setSidebarOpen(false)}>
            🎨 Karya Siswa
          </a>
        </nav>
        <a
          href="#materi"
          className="btn-primary mobile-sidebar-cta"
          onClick={() => setSidebarOpen(false)}
        >
          Mulai Belajar →
        </a>
        <div className="mobile-sidebar-foot">Wahyu Dwi Prasetyo, S.Kom.Gr</div>
      </aside>

      <section id="hero">
        <div className="hero-media">
          {!heroImgFailed ? (
            <img
              src="/hero-bg.png"
              alt="Kampus Sekolah Islam Attaufiq"
              onError={() => setHeroImgFailed(true)}
            />
          ) : null}
        </div>
        <div className="hero-navy-scrim" />
        <div className="hero-stars" aria-hidden="true">
          <span className="star-dot s1" />
          <span className="star-dot s2" />
          <span className="star-dot s3" />
          <span className="star-dot s4" />
          <span className="star-dot s5" />
          <span className="star-dot s6" />
        </div>
        <div className="hero-orbit-layer" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hero-orbit-svg">
            <defs>
              <linearGradient id="attaufiqOrbitFade" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F1B23A" stopOpacity="0" />
                <stop offset="35%" stopColor="#F1B23A" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FDD000" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M12,92 C28,84 52,78 68,64 C80,53 86,32 92,14"
              fill="none"
              stroke="url(#attaufiqOrbitFade)"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <StarburstNode className="node-main" />
          <StarburstNode className="node-top" />
          <StarburstNode className="node-left" />
        </div>

        <div className="hero-center">
          <div className="hero-eyebrow-gold">
            <span>Islami · Future Ready · Lab ICT 1 Attaufiq Jambi</span>
          </div>
          <h1 className="hero-title">
            Website Pembelajaran{' '}
            <span className="hero-gold-accent">
              Informatika &amp; KKA
              <svg aria-hidden="true" viewBox="0 0 280 14" preserveAspectRatio="none" className="hero-title-underline">
                <path
                  d="M3 8 C 70 2, 140 12, 210 5 C 240 2.5, 265 8, 277 6"
                  fill="none"
                  stroke="#FDD000"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="hero-lead">
            Portal belajar digital terpadu untuk SMP–SMA Attaufiq Jambi. Akses materi terstruktur,
            tugas &amp; kuis kelas 7–12, cek nilai langsung, serta pameran karya kreatif siswa.
          </p>

          <div className="hero-highlights">
            <div className="hero-hl-card">
              <span className="hero-hl-icon sky">💻</span>
              <div>
                <strong>Informatika</strong>
                <small>Kelas 7 – 12</small>
              </div>
            </div>
            <div className="hero-hl-card">
              <span className="hero-hl-icon gold">🤖</span>
              <div>
                <strong>Koding &amp; AI (KKA)</strong>
                <small>Kurikulum Merdeka</small>
              </div>
            </div>
            <div className="hero-hl-card">
              <span className="hero-hl-icon ivory">📊</span>
              <div>
                <strong>Nilai &amp; Karya</strong>
                <small>Real-Time Portal</small>
              </div>
            </div>
          </div>

          <div className="hero-cta-row">
            <a href="#materi" className="btn-primary">
              Buka Materi Kelas →
            </a>
            <a href="#tugas" className="btn-hero-outline">
              Tugas &amp; Kuis
            </a>
          </div>
        </div>

        <div className="scroll-cue">
          <span>SCROLL</span>
          <div className="line" />
        </div>
      </section>

      <section id="info">
        <div className="container reveal">
          <div className="eyebrow eyebrow-amber">Ruang Info</div>
          <h2 className="section-title">Kabar &amp; pembaruan kelas</h2>
          <p className="section-sub">
            Update singkat seputar kegiatan mapel Informatika — dari media sosial, video
            pembelajaran, sampai dokumentasi kelas.
          </p>
          <div className="swipe-hint">
            <span>Geser untuk lihat lainnya</span>
            <span className="arrow">→</span>
          </div>
          <div className="hscroll-wrap">
            <div className="info-grid">
              {infoAll.map((item, idx) => {
                const jenis = item.Jenis || '';
                const visual = getInfoVisual(jenis);
                return (
                  <CardWrapper
                    key={`${item.Judul || 'info'}-${idx}`}
                    link={item.Link}
                    className="info-card"
                  >
                    <MediaBox
                      image={item.Image}
                      gradClass={visual.gradClass}
                      emoji={visual.emoji}
                      badgeText={jenis.toUpperCase()}
                      heightClass="media-h-130"
                    />
                    <div className="info-body">
                      <h4>{item.Judul}</h4>
                      <p>{item.Deskripsi}</p>
                      <div className="meta">{item['Info Tambahan'] || ''}</div>
                      {item.Link ? (
                        <div className="card-access-btn access-amber">
                          <span>Baca Info</span>
                          <span className="card-access-arrow" aria-hidden="true">↗</span>
                        </div>
                      ) : null}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="materi">
        <div className="container reveal">
          <div className="eyebrow eyebrow-sky">Ruang Belajar</div>
          <h2 className="section-title">Materi pembelajaran per jenjang</h2>
          <p className="section-sub">
            Pilih mapel dan kelas untuk melihat topik yang sedang dan akan dipelajari, mengikuti
            alur Kurikulum Merdeka.
          </p>
          <SubjectSwitch value={currentMapelMateri} onChange={setCurrentMapelMateri} />
          <div className="tabs">
            {KELAS_LIST.map((kelas) => (
              <button
                key={kelas}
                type="button"
                className={`tab-btn${kelas === currentKelasMateri ? ' active' : ''}`}
                onClick={() => setCurrentKelasMateri(kelas)}
              >
                {kelas}
              </button>
            ))}
          </div>
          <div className="swipe-hint">
            <span>Geser untuk lihat lainnya</span>
            <span className="arrow">→</span>
          </div>
          <div className="hscroll-wrap">
            <div className="materi-grid">
              {materiItems.length === 0 ? (
                <p className="grid-empty-msg">
                  Belum ada materi untuk {currentMapelMateri} · {currentKelasMateri}.
                </p>
              ) : (
                materiItems.map((m, i) => (
                  <CardWrapper
                    key={`${m.Judul || 'materi'}-${i}`}
                    link={m.Link}
                    className={`materi-card card-accent-${(i % 4) + 1}`}
                  >
                    <CardMediaImage src={m.Image} />
                    <div className="materi-num">
                      {String(i + 1).padStart(2, '0')} · {m.Kelas}
                    </div>
                    <h4>{m.Judul}</h4>
                    <p>{m.Deskripsi}</p>
                    <div className="materi-tag">{m.Tag || ''}</div>
                    {m.Link ? (
                      <div className="card-access-btn access-sky">
                        <span>Buka Materi</span>
                        <span className="card-access-arrow" aria-hidden="true">→</span>
                      </div>
                    ) : null}
                  </CardWrapper>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="tugas">
        <div className="container reveal">
          <div className="eyebrow eyebrow-navy">Ruang Kerja</div>
          <h2 className="section-title">Tugas &amp; kuis per kelas</h2>
          <p className="section-sub">
            Pilih mapel dan kelas untuk melihat tugas &amp; kuis yang berlaku, lengkap dengan
            status pengerjaannya.
          </p>
          <SubjectSwitch value={currentMapelTugas} onChange={setCurrentMapelTugas} />
          <div className="tabs">
            {KELAS_LIST.map((kelas) => (
              <button
                key={kelas}
                type="button"
                className={`tab-btn${kelas === currentKelasTugas ? ' active' : ''}`}
                onClick={() => setCurrentKelasTugas(kelas)}
              >
                {kelas}
              </button>
            ))}
          </div>
          <div className="swipe-hint">
            <span>Geser untuk lihat lainnya</span>
            <span className="arrow">→</span>
          </div>
          <div className="hscroll-wrap">
            <div className="materi-grid">
              {tugasItems.length === 0 ? (
                <p className="grid-empty-msg">
                  Belum ada tugas/kuis untuk {currentMapelTugas} · {currentKelasTugas}.
                </p>
              ) : (
                tugasItems.map((t, i) => {
                  const sKey = statusKey(t.Status);
                  const jenisLabel = t.Jenis || 'Tugas';
                  return (
                    <CardWrapper
                      key={`${t.Judul || 'tugas'}-${i}`}
                      link={t.Link}
                      className={`materi-card card-accent-${((i + 1) % 4) + 1}${sKey === 'done' ? ' tugas-done' : ''}`}
                    >
                      <CardMediaImage src={t.Image} />
                      <div className="tugas-top-row">
                        <div className="materi-num">
                          {t.Kelas} · {t['Info Waktu'] || ''}
                        </div>
                        <div className="tugas-pills">
                          <span
                            className={`pill ${jenisLabel.toLowerCase() === 'kuis' ? 'kuis' : 'tugas'}`}
                          >
                            {jenisLabel}
                          </span>
                          <span className={`pill status-${sKey}`}>{STATUS_LABEL[sKey]}</span>
                        </div>
                      </div>
                      <h4>{t.Judul}</h4>
                      <p>{t.Deskripsi}</p>
                      {t.Link ? (
                        <div className="card-access-btn access-navy">
                          <span>{sKey === 'done' ? 'Lihat Detail' : 'Kerjakan Sekarang'}</span>
                          <span className="card-access-arrow" aria-hidden="true">→</span>
                        </div>
                      ) : null}
                    </CardWrapper>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="nilai">
        <div className="nilai-stars" aria-hidden="true">
          <StarburstNode className="nilai-star-1" />
          <StarburstNode className="nilai-star-2" />
          <StarburstNode className="nilai-star-3" />
        </div>
        <div className="container reveal">
          <div className="eyebrow eyebrow-gold">Ruang Hasil</div>
          <h2 className="section-title section-title-light">Cek nilai siswa</h2>
          <p className="section-sub section-sub-light">
            Masukkan NISN untuk melihat rekap nilai siswa secara langsung dari database portal
            Attaufiq.
          </p>
          <div className="nilai-wrap">
            <form className="nilai-form" onSubmit={handleCekNilai}>
              <label htmlFor="nisnInput">NISN / Nomor Induk</label>
              <input
                id="nisnInput"
                type="text"
                placeholder="contoh: 3312001"
                value={nisnInput}
                onChange={(e) => setNisnInput(e.target.value)}
              />
              <label htmlFor="mapelSelect">Mapel</label>
              <select
                id="mapelSelect"
                value={mapelSelect}
                onChange={(e) => setMapelSelect(e.target.value as Mapel)}
              >
                <option value="Informatika">Informatika</option>
                <option value="KKA">KKA (Koding &amp; Kecerdasan Artifisial)</option>
              </select>
              <button type="submit" className="btn-block">
                Tampilkan Nilai →
              </button>
              <div className="nilai-hint">Masukkan NISN sesuai data sekolah</div>
            </form>

            <div className="nilai-result" id="nilaiResult">
              {nilaiRows === null ? (
                <div className="nilai-empty">
                  <div className="icon">📊</div>
                  <div>Rekap nilai akan muncul di sini setelah kamu mencari NISN.</div>
                </div>
              ) : nilaiRows.length === 0 ? (
                <div className="nilai-empty">
                  <div className="icon">⚠️</div>
                  <div>
                    Data untuk NISN {nilaiQuery?.nisn || '(kosong)'} pada mapel{' '}
                    {nilaiQuery?.mapel} tidak ditemukan.
                  </div>
                </div>
              ) : (
                <>
                  <div className="nilai-header">
                    <div>
                      <div className="nilai-student-name">{nilaiRows[0].Nama}</div>
                      <div className="nilai-student-meta">
                        {nilaiRows[0].Kelas} · NISN {nilaiQuery?.nisn} · {nilaiQuery?.mapel}
                      </div>
                    </div>
                    <div className="nilai-avg-box">
                      <div className="nilai-avg-num">{nilaiAverage}</div>
                      <div className="nilai-avg-label">Rata-rata</div>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Komponen</th>
                        <th>Skor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nilaiRows.map((n, idx) => {
                        const skor = parseInt(n.Skor || '', 10) || 0;
                        return (
                          <tr key={`${n.Komponen || 'komponen'}-${idx}`}>
                            <td>{n.Komponen}</td>
                            <td className="nilai-score-col">
                              <div className="nilai-score-wrap">
                                <span className="nilai-score-num">{skor}</span>
                                <progress
                                  className="score-progress"
                                  max={100}
                                  value={Math.max(0, Math.min(100, skor))}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="karya">
        <div className="container reveal">
          <div className="eyebrow eyebrow-amber">Ruang Karya</div>
          <h2 className="section-title">Karya siswa</h2>
          <p className="section-sub">
            Dokumentasi proyek, website, infografis, video, hingga proyek koding &amp; AI hasil
            karya siswa Attaufiq.
          </p>
          <SubjectSwitch
            value={currentMapelKarya}
            onChange={(v) => {
              setCurrentMapelKarya(v);
              setCurrentKaryaFilter('Semua');
            }}
          />
          <div className="karya-filter">
            {karyaCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`tab-btn${cat === activeKaryaFilter ? ' active' : ''}`}
                onClick={() => setCurrentKaryaFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="swipe-hint">
            <span>Geser untuk lihat lainnya</span>
            <span className="arrow">→</span>
          </div>
          <div className="hscroll-wrap">
            <div className="karya-grid">
              {karyaItems.length === 0 ? (
                <p className="grid-empty-msg">Belum ada karya untuk kategori ini.</p>
              ) : (
                karyaItems.map((k, i) => {
                  const meta = KAT_META[k.Kategori || ''] || {
                    gradClass: 'grad-default',
                    emoji: '📁',
                  };
                  const heightClass = KARYA_HEIGHT_CLASSES[i % 3];
                  return (
                    <CardWrapper
                      key={`${k.Judul || 'karya'}-${i}`}
                      link={k.Link}
                      className="karya-item"
                    >
                      <span className="karya-tag">{k.Kategori}</span>
                      <MediaBox
                        image={k.Image}
                        gradClass={meta.gradClass}
                        emoji={meta.emoji}
                        heightClass={heightClass}
                      />
                      <div className="karya-info">
                        <h4>{k.Judul}</h4>
                        <p>
                          {k.Pembuat ? `${k.Pembuat} · ` : ''}
                          {k.Kelas}
                        </p>
                        {k.Link ? (
                          <div className="card-access-btn access-emerald">
                            <span>Lihat Karya</span>
                            <span className="card-access-arrow" aria-hidden="true">↗</span>
                          </div>
                        ) : null}
                      </div>
                    </CardWrapper>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="cta-arch" aria-hidden="true" />
        <div className="container reveal cta-inner">
          <div className="cta-sun-badge">
            <StarburstNode className="cta-sun" />
          </div>
          <h2>Punya pertanyaan seputar tugas atau materi?</h2>
          <p>
            Hubungi langsung guru ICT (Informatic and Communication Technology), Ayah Wahyu Dwi
            Prasetyo, S.Kom.Gr, di ruang guru atau Lab ICT 1.
          </p>
          <a
            href="https://wa.me/6285290699692"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Hubungi Teacher ICT →
          </a>
        </div>
      </section>

      <footer className="attaufiq-footer">
        <div className="footer-wave-wrap" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="footer-wave-svg">
            <path
              d="M0,40 C240,110 480,0 720,48 C960,96 1200,12 1440,54 L1440,120 L0,120 Z"
              fill="#102380"
            />
          </svg>
        </div>
        <div className="footer-navy-body">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="brand brand-footer">
                  <div className="brand-mark">&lt;/&gt;</div>
                  <div>
                    INF &amp; KKA<small>SMP–SMA Attaufiq · Jambi</small>
                  </div>
                </div>
                <p className="footer-desc">
                  Portal pembelajaran daring mapel Informatika &amp; KKA, diampu oleh Wahyu Dwi
                  Prasetyo, S.Kom.Gr — guru ICT kelas 7 hingga 12.
                </p>
              </div>
              <div>
                <h5>Navigasi</h5>
                <ul>
                  <li>
                    <a href="#materi">Materi Pembelajaran</a>
                  </li>
                  <li>
                    <a href="#tugas">Tugas &amp; Kuis</a>
                  </li>
                  <li>
                    <a href="#nilai">Cek Nilai</a>
                  </li>
                  <li>
                    <a href="#karya">Karya Siswa</a>
                  </li>
                </ul>
              </div>
              <div>
                <h5>Sekolah</h5>
                <ul>
                  <li>
                    <a href="#hero">Yayasan Attaufiq Jambi</a>
                  </li>
                  <li>
                    <a
                      href="https://report2025.vercel.app/porto/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Profil Guru
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/6285290699692"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kontak &amp; Alamat
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 Informatika &amp; KKA · Attaufiq Jambi</span>
              <span>Dibuat oleh Wahyu Dwi Prasetyo, S.Kom.Gr.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

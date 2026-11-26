import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { CardMediaImage, MediaBox } from './components/MediaBox';
import { PointerFX } from './components/PointerFX';
import {
  SILKY_EASE,
  SmoothCard,
  SmoothGrid,
  SmoothHeroItem,
  SmoothSection,
} from './components/SmoothMotion';
import { SubjectSwitch } from './components/SubjectSwitch';
import { TeacherPortal } from './components/TeacherPortal';
import {
  DEFAULT_INFO,
  DEFAULT_IT_SKILLS,
  DEFAULT_KARYA,
  DEFAULT_MATERI,
  DEFAULT_NILAI,
  DEFAULT_TUGAS,
  getInfoVisual,
  type InfoItem,
  type ItSkillItem,
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

type PortalPage = 'home' | 'materi' | 'it-skills' | 'tugas' | 'nilai';

interface RouteState {
  isTeacher: boolean;
  page: PortalPage;
  anchor: string | null;
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

function getRouteFromLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { isTeacher: false, page: 'home', anchor: null };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);

  const isTeacher =
    path === '/guru' ||
    path.endsWith('/guru') ||
    hash === '#guru' ||
    hash.startsWith('#/guru') ||
    params.has('guru');

  if (isTeacher) {
    return { isTeacher: true, page: 'home', anchor: null };
  }

  if (hash === '#/materi' || hash === '#materi' || path.endsWith('/materi')) {
    return { isTeacher: false, page: 'materi', anchor: null };
  }
  if (hash === '#/it-skills' || hash === '#it-skills' || path.endsWith('/it-skills')) {
    return { isTeacher: false, page: 'it-skills', anchor: null };
  }
  if (hash === '#/tugas' || hash === '#tugas' || path.endsWith('/tugas')) {
    return { isTeacher: false, page: 'tugas', anchor: null };
  }
  if (hash === '#/nilai' || hash === '#nilai' || path.endsWith('/nilai')) {
    return { isTeacher: false, page: 'nilai', anchor: null };
  }

  if (hash === '#info' || hash === '#karya') {
    return { isTeacher: false, page: 'home', anchor: hash.slice(1) };
  }

  return { isTeacher: false, page: 'home', anchor: null };
}

const KARYA_HEIGHT_CLASSES = ['media-h-160', 'media-h-190', 'media-h-220'] as const;

export default function App() {
  const initialRoute = useMemo(() => getRouteFromLocation(), []);
  const [isTeacherRoute, setIsTeacherRoute] = useState<boolean>(initialRoute.isTeacher);
  const [activePage, setActivePage] = useState<PortalPage>(initialRoute.page);

  const [materiAll, setMateriAll] = useState<MateriItem[]>(DEFAULT_MATERI);
  const [itSkillsAll, setItSkillsAll] = useState<ItSkillItem[]>(DEFAULT_IT_SKILLS);
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

  const scrollToSection = useCallback((sectionId: string) => {
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  }, []);

  const navigateTo = useCallback(
    (page: PortalPage, anchor?: string) => {
      setSidebarOpen(false);
      setActivePage(page);

      const nextHash =
        page === 'home'
          ? anchor
            ? `#${anchor}`
            : '#/'
          : `#/${page}`;

      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }

      if (page === 'home' && anchor) {
        scrollToSection(anchor);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [scrollToSection]
  );

  useEffect(() => {
    const syncRoute = () => {
      const next = getRouteFromLocation();
      setIsTeacherRoute(next.isTeacher);
      setActivePage(next.page);
      if (!next.isTeacher) {
        if (next.page === 'home' && next.anchor) {
          scrollToSection(next.anchor);
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, [scrollToSection]);

  useEffect(() => {
    if (!initialRoute.isTeacher && initialRoute.page === 'home' && initialRoute.anchor) {
      scrollToSection(initialRoute.anchor);
    }
  }, [initialRoute, scrollToSection]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const refreshData = useCallback(async () => {
    const res = await loadPortalData();
    setMateriAll(res.materi);
    setItSkillsAll(res.itSkills);
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

  const itSkillsItems = useMemo(() => {
    return [...itSkillsAll].sort(
      (a, b) => (parseInt(a.Urutan || '', 10) || 0) - (parseInt(b.Urutan || '', 10) || 0)
    );
  }, [itSkillsAll]);

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
      <MotionConfig reducedMotion="user">
        <PointerFX />
        <TeacherPortal />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <PointerFX />
      <nav id="navbar" className={scrolled ? 'scrolled' : 'over-hero'}>
        <div className="nav-inner">
          <a
            href="#/"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
          >
            <img
              className="logo-mark"
              src="/assets/logo-attaufiq.png"
              alt="Logo Sekolah Islam Attaufiq"
            />
            <div>
              <span className="brand-name">INF &amp; KKA</span>
              <small>SMP–SMA Attaufiq · Jambi</small>
            </div>
          </a>
          <div className="nav-links">
            <a
              href="#/"
              className={activePage === 'home' ? 'active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('home');
              }}
            >
              Home
              <GoldSquiggle />
            </a>
            <a
              href="#/materi"
              className={activePage === 'materi' ? 'active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('materi');
              }}
            >
              Materi
              <GoldSquiggle />
            </a>
            <a
              href="#/it-skills"
              className={activePage === 'it-skills' ? 'active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('it-skills');
              }}
            >
              IT Skills
              <GoldSquiggle />
            </a>
            <a
              href="#/tugas"
              className={activePage === 'tugas' ? 'active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('tugas');
              }}
            >
              Tugas &amp; Kuis
              <GoldSquiggle />
            </a>
            <a
              href="#/nilai"
              className={activePage === 'nilai' ? 'active' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('nilai');
              }}
            >
              Cek Nilai
              <GoldSquiggle />
            </a>
          </div>
          <div className="nav-right">
            <a
              href="#/materi"
              className="nav-cta"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('materi');
              }}
            >
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
          <a
            href="#/"
            className={activePage === 'home' ? 'active' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
          >
            🏠 Home
          </a>
          <a
            href="#/materi"
            className={activePage === 'materi' ? 'active' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('materi');
            }}
          >
            📚 Materi
          </a>
          <a
            href="#/it-skills"
            className={activePage === 'it-skills' ? 'active' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('it-skills');
            }}
          >
            🛠️ IT Skills
          </a>
          <a
            href="#/tugas"
            className={activePage === 'tugas' ? 'active' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('tugas');
            }}
          >
            📝 Tugas &amp; Kuis
          </a>
          <a
            href="#/nilai"
            className={activePage === 'nilai' ? 'active' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('nilai');
            }}
          >
            📊 Cek Nilai
          </a>
        </nav>
        <a
          href="#/materi"
          className="btn-primary mobile-sidebar-cta"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('materi');
          }}
        >
          Mulai Belajar →
        </a>
        <div className="mobile-sidebar-foot">Wahyu Dwi Prasetyo, S.Kom.Gr</div>
      </aside>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: SILKY_EASE }}
        >
          {activePage === 'home' ? (
            <>
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
                  <SmoothHeroItem delay={0.04}>
                    <div className="hero-eyebrow-gold">
                      <span>Islami · Future Ready · Lab ICT 1 Attaufiq Jambi</span>
                    </div>
                  </SmoothHeroItem>
                  <SmoothHeroItem delay={0.1}>
                    <h1 className="hero-title">
                      Website Pembelajaran{' '}
                      <span className="hero-gold-accent">
                        Informatika &amp; KKA
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 280 14"
                          preserveAspectRatio="none"
                          className="hero-title-underline"
                        >
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
                  </SmoothHeroItem>
                  <SmoothHeroItem delay={0.16}>
                    <p className="hero-lead">
                      Portal belajar digital terpadu untuk SMP–SMA Attaufiq Jambi. Jelajahi kabar
                      kegiatan dan pameran karya kreatif siswa di halaman utama, atau buka halaman
                      Materi, IT Skills, Tugas &amp; Kuis, dan Cek Nilai dari menu navigasi.
                    </p>
                  </SmoothHeroItem>

                  <div className="hero-highlights">
                    {[
                      {
                        page: 'materi' as PortalPage,
                        icon: '💻',
                        iconCls: 'sky',
                        title: 'Materi Kelas',
                        sub: 'Informatika & KKA 7–12 →',
                      },
                      {
                        page: 'it-skills' as PortalPage,
                        icon: '🛠️',
                        iconCls: 'indigo',
                        title: 'IT Skills',
                        sub: 'Praktik Skill Digital →',
                      },
                      {
                        page: 'tugas' as PortalPage,
                        icon: '📝',
                        iconCls: 'gold',
                        title: 'Tugas & Kuis',
                        sub: 'Kerjakan per Jenjang →',
                      },
                      {
                        page: 'nilai' as PortalPage,
                        icon: '📊',
                        iconCls: 'ivory',
                        title: 'Cek Nilai Siswa',
                        sub: 'Rekap Real-Time NISN →',
                      },
                    ].map((card, idx) => (
                      <motion.button
                        key={card.page}
                        type="button"
                        className="hero-hl-card"
                        onClick={() => navigateTo(card.page)}
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ y: -3, transition: { duration: 0.22, ease: SILKY_EASE } }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.48, delay: 0.22 + idx * 0.06, ease: SILKY_EASE }}
                      >
                        <span className={`hero-hl-icon ${card.iconCls}`}>{card.icon}</span>
                        <div>
                          <strong>{card.title}</strong>
                          <small>{card.sub}</small>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <SmoothHeroItem delay={0.44}>
                    <div className="hero-cta-row">
                      <a
                        href="#/materi"
                        className="btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('materi');
                        }}
                      >
                        Buka Materi Kelas →
                      </a>
                      <a
                        href="#/tugas"
                        className="btn-hero-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('tugas');
                        }}
                      >
                        Tugas &amp; Kuis
                      </a>
                    </div>
                  </SmoothHeroItem>
                </div>

                <div className="scroll-cue">
                  <span>SCROLL</span>
                  <div className="line" />
                </div>
              </section>

              <section id="info">
                <SmoothSection className="container">
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
                  <SmoothGrid filterKey={`info-${infoAll.length}`} className="info-grid">
                    {infoAll.map((item, idx) => {
                      const jenis = item.Jenis || '';
                      const visual = getInfoVisual(jenis);
                      return (
                        <SmoothCard
                          key={`${item.Judul || 'info'}-${idx}`}
                          index={idx}
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
                        </SmoothCard>
                      );
                    })}
                  </SmoothGrid>
                </SmoothSection>
              </section>

              <section id="karya">
                <SmoothSection className="container">
                  <div className="eyebrow eyebrow-emerald">Ruang Karya</div>
                  <h2 className="section-title">Karya siswa</h2>
                  <p className="section-sub">
                    Dokumentasi proyek, website, infografis, video, hingga proyek koding &amp; AI
                    hasil karya siswa Attaufiq.
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
                  <SmoothGrid
                    filterKey={`karya-${currentMapelKarya}-${activeKaryaFilter}-${karyaItems.length}`}
                    className="karya-grid"
                  >
                    {karyaItems.length === 0 ? (
                      <motion.p
                        className="grid-empty-msg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: SILKY_EASE }}
                      >
                        Belum ada karya untuk kategori ini.
                      </motion.p>
                    ) : (
                      karyaItems.map((k, i) => {
                        const meta = KAT_META[k.Kategori || ''] || {
                          gradClass: 'grad-default',
                          emoji: '📁',
                        };
                        const heightClass = KARYA_HEIGHT_CLASSES[i % 3];
                        return (
                          <SmoothCard
                            key={`${k.Judul || 'karya'}-${i}`}
                            index={i}
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
                          </SmoothCard>
                        );
                      })
                    )}
                  </SmoothGrid>
                </SmoothSection>
              </section>

              <section id="cta">
                <div className="cta-arch" aria-hidden="true" />
                <SmoothSection className="container cta-inner">
                  <div className="cta-sun-badge">
                    <StarburstNode className="cta-sun" />
                  </div>
                  <h2>Punya pertanyaan seputar tugas atau materi?</h2>
                  <p>
                    Hubungi langsung guru ICT (Informatic and Communication Technology), Ayah Wahyu
                    Dwi Prasetyo, S.Kom.Gr, di ruang guru atau Lab ICT 1.
                  </p>
                  <a
                    href="https://wa.me/6285290699692"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Hubungi Teacher ICT →
                  </a>
                </SmoothSection>
              </section>
            </>
      ) : activePage === 'materi' ? (
        <>
          <header className="subpage-hero">
            <div className="hero-stars" aria-hidden="true">
              <span className="star-dot s1" />
              <span className="star-dot s2" />
              <span className="star-dot s5" />
            </div>
            <StarburstNode className="subpage-starburst" />
            <div className="container subpage-hero-inner">
              <div className="subpage-breadcrumb">
                <button
                  type="button"
                  className="subpage-back-btn"
                  onClick={() => navigateTo('home')}
                >
                  ← Kembali ke Home
                </button>
                <span className="subpage-crumb-trail">Home / Materi Pembelajaran</span>
              </div>
              <div className="eyebrow eyebrow-gold">Ruang Belajar</div>
              <h1 className="subpage-title">Materi pembelajaran per jenjang</h1>
              <p className="subpage-sub">
                Pilih mapel dan kelas untuk melihat topik yang sedang dan akan dipelajari,
                mengikuti alur Kurikulum Merdeka.
              </p>
              <div className="subpage-switcher">
                <button
                  type="button"
                  className="subpage-pill active"
                  onClick={() => navigateTo('materi')}
                >
                  📚 Materi
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('it-skills')}
                >
                  🛠️ IT Skills
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('tugas')}
                >
                  📝 Tugas &amp; Kuis
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('nilai')}
                >
                  📊 Cek Nilai
                </button>
              </div>
            </div>
          </header>

          <section id="materi" className="subpage-body">
            <div className="container">
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
              <SmoothGrid
                filterKey={`materi-${currentMapelMateri}-${currentKelasMateri}-${materiItems.length}`}
                className="materi-grid"
              >
                {materiItems.length === 0 ? (
                  <motion.p
                    className="grid-empty-msg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: SILKY_EASE }}
                  >
                    Belum ada materi untuk {currentMapelMateri} · {currentKelasMateri}.
                  </motion.p>
                ) : (
                  materiItems.map((m, i) => (
                    <SmoothCard
                      key={`${m.Judul || 'materi'}-${i}`}
                      index={i}
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
                    </SmoothCard>
                  ))
                )}
              </SmoothGrid>
            </div>
          </section>
        </>
      ) : activePage === 'it-skills' ? (
        <>
          <header className="subpage-hero">
            <div className="hero-stars" aria-hidden="true">
              <span className="star-dot s1" />
              <span className="star-dot s2" />
              <span className="star-dot s5" />
            </div>
            <StarburstNode className="subpage-starburst" />
            <div className="container subpage-hero-inner">
              <div className="subpage-breadcrumb">
                <button
                  type="button"
                  className="subpage-back-btn"
                  onClick={() => navigateTo('home')}
                >
                  ← Kembali ke Home
                </button>
                <span className="subpage-crumb-trail">Home / IT Skills</span>
              </div>
              <div className="eyebrow eyebrow-gold">Ruang Keahlian</div>
              <h1 className="subpage-title">IT Skills &amp; praktik digital</h1>
              <p className="subpage-sub">
                Materi umum keterampilan teknologi praktis untuk seluruh siswa — mulai dari
                produktivitas digital, desain, jaringan, hingga kecakapan Lab ICT Attaufiq.
              </p>
              <div className="subpage-switcher">
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('materi')}
                >
                  📚 Materi
                </button>
                <button
                  type="button"
                  className="subpage-pill active"
                  onClick={() => navigateTo('it-skills')}
                >
                  🛠️ IT Skills
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('tugas')}
                >
                  📝 Tugas &amp; Kuis
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('nilai')}
                >
                  📊 Cek Nilai
                </button>
              </div>
            </div>
          </header>

          <section id="it-skills" className="subpage-body">
            <div className="container">
              <div className="swipe-hint">
                <span>Geser untuk lihat lainnya</span>
                <span className="arrow">→</span>
              </div>
              <SmoothGrid filterKey={`it-skills-${itSkillsItems.length}`} className="materi-grid">
                {itSkillsItems.length === 0 ? (
                  <motion.p
                    className="grid-empty-msg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: SILKY_EASE }}
                  >
                    Belum ada modul IT Skills yang tersedia.
                  </motion.p>
                ) : (
                  itSkillsItems.map((s, i) => (
                    <SmoothCard
                      key={`${s.Judul || 'it-skill'}-${i}`}
                      index={i}
                      link={s.Link}
                      className={`materi-card card-accent-${(i % 4) + 1}`}
                    >
                      <CardMediaImage src={s.Image} />
                      <div className="materi-num">
                        {String(i + 1).padStart(2, '0')} · IT Skills
                      </div>
                      <h4>{s.Judul}</h4>
                      <p>{s.Deskripsi}</p>
                      <div className="materi-tag">{s.Tag || ''}</div>
                      {s.Link ? (
                        <div className="card-access-btn access-indigo">
                          <span>Buka IT Skills</span>
                          <span className="card-access-arrow" aria-hidden="true">→</span>
                        </div>
                      ) : null}
                    </SmoothCard>
                  ))
                )}
              </SmoothGrid>
            </div>
          </section>
        </>
      ) : activePage === 'tugas' ? (
        <>
          <header className="subpage-hero">
            <div className="hero-stars" aria-hidden="true">
              <span className="star-dot s1" />
              <span className="star-dot s2" />
              <span className="star-dot s5" />
            </div>
            <StarburstNode className="subpage-starburst" />
            <div className="container subpage-hero-inner">
              <div className="subpage-breadcrumb">
                <button
                  type="button"
                  className="subpage-back-btn"
                  onClick={() => navigateTo('home')}
                >
                  ← Kembali ke Home
                </button>
                <span className="subpage-crumb-trail">Home / Tugas &amp; Kuis</span>
              </div>
              <div className="eyebrow eyebrow-gold">Ruang Kerja</div>
              <h1 className="subpage-title">Tugas &amp; kuis per kelas</h1>
              <p className="subpage-sub">
                Pilih mapel dan kelas untuk melihat tugas &amp; kuis yang berlaku, lengkap dengan
                status pengerjaannya.
              </p>
              <div className="subpage-switcher">
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('materi')}
                >
                  📚 Materi
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('it-skills')}
                >
                  🛠️ IT Skills
                </button>
                <button
                  type="button"
                  className="subpage-pill active"
                  onClick={() => navigateTo('tugas')}
                >
                  📝 Tugas &amp; Kuis
                </button>
                <button
                  type="button"
                  className="subpage-pill"
                  onClick={() => navigateTo('nilai')}
                >
                  📊 Cek Nilai
                </button>
              </div>
            </div>
          </header>

          <section id="tugas" className="subpage-body">
            <div className="container">
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
              <SmoothGrid
                filterKey={`tugas-${currentMapelTugas}-${currentKelasTugas}-${tugasItems.length}`}
                className="materi-grid"
              >
                {tugasItems.length === 0 ? (
                  <motion.p
                    className="grid-empty-msg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: SILKY_EASE }}
                  >
                    Belum ada tugas/kuis untuk {currentMapelTugas} · {currentKelasTugas}.
                  </motion.p>
                ) : (
                  tugasItems.map((t, i) => {
                    const sKey = statusKey(t.Status);
                    const jenisLabel = t.Jenis || 'Tugas';
                    return (
                      <SmoothCard
                        key={`${t.Judul || 'tugas'}-${i}`}
                        index={i}
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
                      </SmoothCard>
                    );
                  })
                )}
              </SmoothGrid>
            </div>
          </section>
        </>
      ) : (
        <section id="nilai" className="nilai-page-full">
          <div className="nilai-stars" aria-hidden="true">
            <StarburstNode className="nilai-star-1" />
            <StarburstNode className="nilai-star-2" />
            <StarburstNode className="nilai-star-3" />
          </div>
          <div className="container">
            <div className="subpage-breadcrumb">
              <button
                type="button"
                className="subpage-back-btn"
                onClick={() => navigateTo('home')}
              >
                ← Kembali ke Home
              </button>
              <span className="subpage-crumb-trail">Home / Cek Nilai Siswa</span>
            </div>
            <div className="eyebrow eyebrow-gold">Ruang Hasil</div>
            <h1 className="section-title section-title-light">Cek nilai siswa</h1>
            <p className="section-sub section-sub-light">
              Masukkan NISN untuk melihat rekap nilai siswa secara langsung dari database portal
              Attaufiq.
            </p>
            <div className="subpage-switcher">
              <button
                type="button"
                className="subpage-pill"
                onClick={() => navigateTo('materi')}
              >
                📚 Materi
              </button>
              <button
                type="button"
                className="subpage-pill"
                onClick={() => navigateTo('it-skills')}
              >
                🛠️ IT Skills
              </button>
              <button
                type="button"
                className="subpage-pill"
                onClick={() => navigateTo('tugas')}
              >
                📝 Tugas &amp; Kuis
              </button>
              <button
                type="button"
                className="subpage-pill active"
                onClick={() => navigateTo('nilai')}
              >
                📊 Cek Nilai
              </button>
            </div>
            <div className="nilai-wrap">
              <motion.form
                className="nilai-form"
                onSubmit={handleCekNilai}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: SILKY_EASE }}
              >
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
              </motion.form>

              <motion.div
                className="nilai-result"
                id="nilaiResult"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.14, ease: SILKY_EASE }}
              >
                <AnimatePresence mode="wait">
                  {nilaiRows === null ? (
                    <motion.div
                      key="nilai-idle"
                      className="nilai-empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: SILKY_EASE }}
                    >
                      <div className="icon">📊</div>
                      <div>Rekap nilai akan muncul di sini setelah kamu mencari NISN.</div>
                    </motion.div>
                  ) : nilaiRows.length === 0 ? (
                    <motion.div
                      key={`nilai-empty-${nilaiQuery?.nisn}-${nilaiQuery?.mapel}`}
                      className="nilai-empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: SILKY_EASE }}
                    >
                      <div className="icon">⚠️</div>
                      <div>
                        Data untuk NISN {nilaiQuery?.nisn || '(kosong)'} pada mapel{' '}
                        {nilaiQuery?.mapel} tidak ditemukan.
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`nilai-data-${nilaiQuery?.nisn}-${nilaiQuery?.mapel}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: SILKY_EASE }}
                    >
                      <div className="nilai-header">
                        <div>
                          <div className="nilai-student-name">{nilaiRows[0].Nama}</div>
                          <div className="nilai-student-meta">
                            {nilaiRows[0].Kelas} · NISN {nilaiQuery?.nisn} · {nilaiQuery?.mapel}
                          </div>
                        </div>
                        <motion.div
                          className="nilai-avg-box"
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.38, delay: 0.12, ease: SILKY_EASE }}
                        >
                          <div className="nilai-avg-num">{nilaiAverage}</div>
                          <div className="nilai-avg-label">Rata-rata</div>
                        </motion.div>
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
                            const clamped = Math.max(0, Math.min(100, skor));
                            return (
                              <motion.tr
                                key={`${n.Komponen || 'komponen'}-${idx}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.36,
                                  delay: Math.min(idx * 0.055, 0.35),
                                  ease: SILKY_EASE,
                                }}
                              >
                                <td>{n.Komponen}</td>
                                <td className="nilai-score-col">
                                  <div className="nilai-score-wrap">
                                    <span className="nilai-score-num">{skor}</span>
                                    <div
                                      className="score-progress-track"
                                      role="progressbar"
                                      aria-valuenow={clamped}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    >
                                      <motion.div
                                        className="score-progress-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${clamped}%` }}
                                        transition={{
                                          duration: 0.65,
                                          delay: 0.1 + Math.min(idx * 0.055, 0.35),
                                          ease: SILKY_EASE,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>
      )}
        </motion.div>
      </AnimatePresence>

      <footer className="attaufiq-footer">
        <div className={`footer-wave-wrap from-${activePage}`} aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="footer-wave-svg">
            <path
              d="M0,40 C240,110 480,0 720,48 C960,96 1200,12 1440,54 L1440,120 L0,120 Z"
              fill="#102380"
            />
            {activePage === 'nilai' ? (
              <path
                d="M0,40 C240,110 480,0 720,48 C960,96 1200,12 1440,54"
                fill="none"
                stroke="rgba(253, 208, 0, 0.36)"
                strokeWidth="3"
              />
            ) : null}
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
                    <a
                      href="#/"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('home');
                      }}
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/materi"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('materi');
                      }}
                    >
                      Materi Pembelajaran
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/it-skills"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('it-skills');
                      }}
                    >
                      IT Skills
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/tugas"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('tugas');
                      }}
                    >
                      Tugas &amp; Kuis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/nilai"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('nilai');
                      }}
                    >
                      Cek Nilai
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5>Sekolah</h5>
                <ul>
                  <li>
                    <a
                      href="#/"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('home');
                      }}
                    >
                      Yayasan Attaufiq Jambi
                    </a>
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
    </MotionConfig>
  );
}

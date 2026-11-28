import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Crown,
  Database,
  ExternalLink,
  Feather,
  Flame,
  Gamepad2,
  Globe,
  Handshake,
  Heart,
  HeartHandshake,
  HelpCircle,
  KeyRound,
  Keyboard,
  Laptop,
  Lightbulb,
  Link2,
  MessageSquare,
  Move3d,
  Network,
  Newspaper,
  PenSquare,
  Play,
  PlayCircle,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Target,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  ARCADE_ITEMS,
  type ArcadeItem,
  DSI_CAPAIAN_PEMBELAJARAN,
  DSI_TUJUAN_PEMBELAJARAN,
  DSI_VIDEO_PEMANTIK,
  ESSAY_AKT1,
  ESSAY_AKT3,
  FEATURE_DATA,
  type FeatureItem,
  MATCHING_PAIRS,
  PLATFORM_DATA,
  type PlatformItem,
  QUIZ_QUESTIONS,
} from '../data/dsiContent';
import { SILKY_EASE } from './SmoothMotion';

type DsiView = 'mindmap' | 'platform' | 'fitur' | 'profesi' | 'games';
type MindmapMode = 'board' | 'orbit';
type GameTab = 'quiz' | 'arcade' | 'match' | 'essay';
type FeatureFilter = 'all' | 'sosial' | 'konten' | 'ekonomi';

interface DsiMateriPageProps {
  onBackToMateri: () => void;
}

function renderPlatformIcon(iconName: PlatformItem['iconName']) {
  switch (iconName) {
    case 'users':
      return <Users size={20} />;
    case 'play':
      return <PlayCircle size={20} />;
    case 'feather':
      return <Feather size={20} />;
    case 'network':
      return <HeartHandshake size={20} />;
    case 'vr':
      return <Globe size={20} />;
  }
}

function renderFeatureIcon(iconName: FeatureItem['iconName']) {
  switch (iconName) {
    case 'handshake':
      return <Handshake size={19} />;
    case 'camera':
      return <Camera size={19} />;
    case 'star':
      return <Star size={19} />;
    case 'comments':
      return <MessageSquare size={19} />;
    case 'newspaper':
      return <Newspaper size={19} />;
    case 'bookmark':
      return <Bookmark size={19} />;
    case 'heart':
      return <Heart size={19} />;
    case 'bag':
      return <ShoppingBag size={19} />;
  }
}

export function DsiMateriPage({ onBackToMateri }: DsiMateriPageProps) {
  const [activeView, setActiveView] = useState<DsiView>('mindmap');
  const [mindmapMode, setMindmapMode] = useState<MindmapMode>('board');
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [visitedViews, setVisitedViews] = useState<Set<DsiView>>(() => new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Orientation deck (Video Pemantik + CP & TP), platform insight accordions & feature filter
  const [orientationOpen, setOrientationOpen] = useState(true);
  const [openInsights, setOpenInsights] = useState<Record<string, boolean>>({});
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all');

  // Orbit hover state
  const [orbitHoverLabel, setOrbitHoverLabel] = useState<string | null>(null);

  // Games & Quiz state
  const [gameTab, setGameTab] = useState<GameTab>('quiz');
  const [qIndex, setQIndex] = useState(0);
  const [qScore, setQScore] = useState(0);
  const [qCorrect, setQCorrect] = useState(0);
  const [qStreak, setQStreak] = useState(0);
  const [qSelected, setQSelected] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  // Arcade Sortir Cepat state
  const [arcadeStage, setArcadeStage] = useState<'intro' | 'play' | 'over'>('intro');
  const [arcadeTime, setArcadeTime] = useState(45);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [arcadeLives, setArcadeLives] = useState(3);
  const [arcadeCombo, setArcadeCombo] = useState(0);
  const [arcadeBest, setArcadeBest] = useState(0);
  const [arcadeOverReason, setArcadeOverReason] = useState('Waktu Habis!');
  const [arcadeItem, setArcadeItem] = useState<ArcadeItem>(ARCADE_ITEMS[0]);
  const [arcadeFeedback, setArcadeFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);
  const [arcadeCardBump, setArcadeCardBump] = useState(false);

  // Matching game state
  const [selectedLeftId, setSelectedLeftId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(() => new Set());
  const [matchFeedback, setMatchFeedback] = useState<{
    type: 'ok' | 'err' | 'info';
    msg: string;
  } | null>(null);

  // Essay hints & answers
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>({});

  // Refs for 3D Tilt & Three.js canvases + Audio
  const boardRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback(
    (type: 'correct' | 'wrong' | 'click' | 'win') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => undefined);
        }

        const triggerNote = (freq: number, delay: number, dur: number, gainVal = 0.08) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type === 'wrong' ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur + 0.02);
        };

        if (type === 'click') {
          triggerNote(440, 0, 0.06, 0.05);
        } else if (type === 'correct') {
          triggerNote(523.25, 0, 0.14, 0.08);
          triggerNote(659.25, 0.05, 0.16, 0.08);
          triggerNote(783.99, 0.1, 0.2, 0.08);
        } else if (type === 'wrong') {
          triggerNote(196, 0, 0.16, 0.09);
          triggerNote(164.81, 0.09, 0.22, 0.09);
        } else if (type === 'win') {
          triggerNote(523.25, 0, 0.14, 0.08);
          triggerNote(659.25, 0.1, 0.14, 0.08);
          triggerNote(783.99, 0.2, 0.14, 0.08);
          triggerNote(1046.5, 0.32, 0.3, 0.1);
        }
      } catch {
        // Ignore audio context restrictions
      }
    },
    [soundEnabled]
  );

  const navigateView = useCallback(
    (view: DsiView, highlightId?: string) => {
      playTone('click');
      setActiveView(view);
      if (view !== 'mindmap') {
        setVisitedViews((prev) => {
          const next = new Set(prev);
          next.add(view);
          return next;
        });
      }
      if (highlightId) {
        setHighlightedId(highlightId);
        window.setTimeout(() => {
          const el = document.getElementById(highlightId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
        window.setTimeout(() => setHighlightedId(null), 2600);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [playTone]
  );

  // Three.js Hero Centerpiece (Laptop + Wireframe Globe + Wi-Fi + Chat + Gold Star)
  useEffect(() => {
    if (activeView !== 'mindmap' || mindmapMode !== 'board') return;
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const w = canvas.clientWidth || 320;
    const h = canvas.clientHeight || 240;
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 1.35, 5.4);
    camera.lookAt(0, 0.2, 0);

    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(4, 7, 5);
    scene.add(dirLight);
    const skyRim = new THREE.PointLight(0x00a1e9, 1.3, 14);
    skyRim.position.set(-4, 2, 3);
    scene.add(skyRim);
    const goldRim = new THREE.PointLight(0xfdd000, 0.9, 12);
    goldRim.position.set(4, 2, 2);
    scene.add(goldRim);

    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.25,
    });
    const navyMat = new THREE.MeshStandardMaterial({
      color: 0x102380,
      roughness: 0.3,
      metalness: 0.18,
    });
    const skyMat = new THREE.MeshStandardMaterial({
      color: 0x00a1e9,
      roughness: 0.25,
      metalness: 0.12,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfdd000,
      emissive: 0xf1b23a,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    });

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 1.5), baseMat);
    laptopBase.position.set(0, -0.55, 0.25);
    heroGroup.add(laptopBase);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.04, 0.9), navyMat);
    keyboard.position.set(0, -0.47, 0.12);
    heroGroup.add(keyboard);

    const screenPivot = new THREE.Group();
    screenPivot.position.set(0, -0.48, -0.46);
    screenPivot.rotation.x = -0.18;

    const lid = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.55, 0.1), navyMat);
    lid.position.set(0, 0.78, 0);
    screenPivot.add(lid);

    const screenFace = new THREE.Mesh(
      new THREE.PlaneGeometry(2.08, 1.34),
      new THREE.MeshStandardMaterial({
        color: 0x00a1e9,
        emissive: 0x102380,
        emissiveIntensity: 0.55,
      })
    );
    screenFace.position.set(0, 0.78, 0.06);
    screenPivot.add(screenFace);

    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, 0.78, 0.35);
    const globeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x60c5f7,
        transparent: true,
        opacity: 0.6,
        roughness: 0.2,
      })
    );
    const globeWire = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xfdd000, wireframe: true })
    );
    globeGroup.add(globeCore, globeWire);
    screenPivot.add(globeGroup);
    heroGroup.add(screenPivot);

    // Wi-Fi floating above
    const wifiGroup = new THREE.Group();
    wifiGroup.position.set(0, 1.55, -0.2);
    [0.24, 0.42, 0.6].forEach((r) => {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.045, 10, 24, Math.PI * 0.65),
        goldMat
      );
      arc.rotation.z = Math.PI * 0.175;
      wifiGroup.add(arc);
    });
    const wifiDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), navyMat);
    wifiDot.position.y = -0.02;
    wifiGroup.add(wifiDot);
    heroGroup.add(wifiGroup);

    // Chat bubble left
    const chatGroup = new THREE.Group();
    chatGroup.position.set(-1.6, 0.95, 0.1);
    const chatBox = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.52, 0.18), skyMat);
    chatGroup.add(chatBox);
    [-0.18, 0, 0.18].forEach((dx) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      dot.position.set(dx, 0, 0.11);
      chatGroup.add(dot);
    });
    heroGroup.add(chatGroup);

    // Gold star badge right
    const likeGroup = new THREE.Group();
    likeGroup.position.set(1.6, 0.95, 0.1);
    const likeBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 24), navyMat);
    likeBadge.rotation.x = Math.PI / 2;
    const likeCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), goldMat);
    likeCore.position.z = 0.12;
    likeGroup.add(likeBadge, likeCore);
    heroGroup.add(likeGroup);

    // Cloud base puffs
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfbf6ea, roughness: 0.55 });
    [
      [-1.1, -0.88, 0.2, 0.45],
      [-0.45, -0.92, 0.35, 0.52],
      [0.4, -0.92, 0.3, 0.52],
      [1.1, -0.88, 0.2, 0.45],
    ].forEach(([cx, cy, cz, cr]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 16, 16), cloudMat);
      puff.position.set(cx, cy, cz);
      heroGroup.add(puff);
    });

    const floaters = [
      { mesh: wifiGroup, baseY: 1.55, speed: 2.1, phase: 0 },
      { mesh: chatGroup, baseY: 0.95, speed: 2.5, phase: 1.3 },
      { mesh: likeGroup, baseY: 0.95, speed: 2.3, phase: 2.6 },
    ];

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onStart = (x: number, y: number) => {
      isDragging = true;
      prevX = x;
      prevY = y;
    };
    const onMove = (x: number, y: number) => {
      if (!isDragging) return;
      heroGroup.rotation.y += (x - prevX) * 0.012;
      heroGroup.rotation.x = Math.max(
        -0.45,
        Math.min(0.45, heroGroup.rotation.x + (y - prevY) * 0.008)
      );
      prevX = x;
      prevY = y;
    };
    const onEnd = () => {
      isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => onStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    const onResize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
      }
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      globeGroup.rotation.y = t * 0.8;
      if (!isDragging) {
        heroGroup.rotation.y = Math.sin(t * 0.55) * 0.22;
      }
      floaters.forEach((f) => {
        f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.1;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [activeView, mindmapMode]);

  // Three.js 3D Orbit Explorer
  useEffect(() => {
    if (activeView !== 'mindmap' || mindmapMode !== 'orbit') return;
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 560;
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);

    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(8, 12, 8);
    scene.add(sun);

    const orbitWorld = new THREE.Group();
    scene.add(orbitWorld);

    const ringGeo = new THREE.RingGeometry(4.45, 4.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfdd000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    orbitWorld.add(ring);

    const centerMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.45, 1),
      new THREE.MeshStandardMaterial({
        color: 0x00a1e9,
        emissive: 0x102380,
        emissiveIntensity: 0.45,
        roughness: 0.22,
      })
    );
    const centerWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.62, 1),
      new THREE.MeshBasicMaterial({
        color: 0xfdd000,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      })
    );
    orbitWorld.add(centerMesh, centerWire);

    const clickable: THREE.Mesh[] = [];
    const nodes: {
      target: DsiView;
      label: string;
      pos: [number, number, number];
      color: number;
      geom: THREE.BufferGeometry;
    }[] = [
      {
        target: 'platform',
        label: '1. Jenis Platform Media Sosial (Klik untuk buka)',
        pos: [-4.5, 1.0, 0.5],
        color: 0x00a1e9,
        geom: new THREE.DodecahedronGeometry(1.05),
      },
      {
        target: 'fitur',
        label: '2. Jenis Fitur Media Sosial (Klik untuk buka)',
        pos: [4.5, 1.0, 0.5],
        color: 0x38bdf8,
        geom: new THREE.OctahedronGeometry(1.1),
      },
      {
        target: 'profesi',
        label: '3. Profesi Bidang Informatika (Klik untuk buka)',
        pos: [0, -0.8, 4.5],
        color: 0x10b981,
        geom: new THREE.BoxGeometry(1.6, 1.6, 1.6),
      },
      {
        target: 'games',
        label: '4. Arena Games & Quiz (Klik untuk main)',
        pos: [0, 1.4, -4.4],
        color: 0xfdd000,
        geom: new THREE.TorusKnotGeometry(0.72, 0.24, 64, 12),
      },
    ];

    nodes.forEach((n) => {
      const mesh = new THREE.Mesh(
        n.geom,
        new THREE.MeshStandardMaterial({ color: n.color, roughness: 0.25, metalness: 0.15 })
      );
      mesh.position.set(...n.pos);
      mesh.userData = { target: n.target, label: n.label };
      orbitWorld.add(mesh);
      clickable.push(mesh);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...n.pos),
      ]);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0xfdd000, transparent: true, opacity: 0.6 })
      );
      orbitWorld.add(line);
    });

    const starPos: number[] = [];
    for (let i = 0; i < 140; i++) {
      starPos.push(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 32
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(
      new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfbf6ea, size: 0.12 }))
    );

    let orbitTheta = 0.25;
    let orbitPhi = 1.15;
    const orbitRadius = 11.5;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let moved = false;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      moved = false;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
        orbitTheta -= dx * 0.008;
        orbitPhi = Math.max(0.35, Math.min(2.4, orbitPhi - dy * 0.008));
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        updatePointer(e.clientX, e.clientY);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickable);
        if (hits.length > 0) {
          canvas.style.cursor = 'pointer';
          setOrbitHoverLabel(hits[0].object.userData.label as string);
        } else {
          canvas.style.cursor = 'grab';
          setOrbitHoverLabel(null);
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging && !moved) {
        updatePointer(e.clientX, e.clientY);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickable);
        if (hits.length > 0) {
          navigateView(hits[0].object.userData.target as DsiView);
        }
      }
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        isDragging = true;
        moved = false;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        orbitTheta -= (e.touches[0].clientX - prevX) * 0.01;
        orbitPhi = Math.max(0.35, Math.min(2.4, orbitPhi - (e.touches[0].clientY - prevY) * 0.01));
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onResize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      if (!isDragging) orbitTheta += 0.0025;
      camera.position.set(
        orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta),
        orbitRadius * Math.cos(orbitPhi),
        orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta)
      );
      camera.lookAt(0, 0, 0);
      clickable.forEach((m, i) => {
        m.rotation.y = t * (0.6 + i * 0.15);
        m.rotation.x = t * 0.35;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      setOrbitHoverLabel(null);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [activeView, mindmapMode, navigateView]);

  // Arcade Timer loop
  useEffect(() => {
    if (arcadeStage !== 'play') return;
    const timer = window.setInterval(() => {
      setArcadeTime((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          playTone('win');
          setArcadeOverReason('Waktu Habis!');
          setArcadeStage('over');
          setArcadeScore((currScore) => {
            setArcadeBest((b) => Math.max(b, currScore));
            return currScore;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [arcadeStage, playTone]);

  // Quiz handlers
  const handleStartQuiz = () => {
    playTone('click');
    setQIndex(0);
    setQScore(0);
    setQCorrect(0);
    setQStreak(0);
    setQSelected(null);
    setQuizDone(false);
  };

  const handleSelectQuiz = (idx: number) => {
    if (qSelected !== null) return;
    setQSelected(idx);
    const q = QUIZ_QUESTIONS[qIndex];
    if (idx === q.answer) {
      playTone('correct');
      setQCorrect((c) => c + 1);
      setQStreak((s) => {
        const nextStreak = s + 1;
        setQScore((sc) => sc + 100 + (nextStreak > 1 ? (nextStreak - 1) * 20 : 0));
        return nextStreak;
      });
    } else {
      playTone('wrong');
      setQStreak(0);
    }
  };

  const handleNextQuiz = () => {
    playTone('click');
    if (qIndex + 1 < QUIZ_QUESTIONS.length) {
      setQIndex((i) => i + 1);
      setQSelected(null);
    } else {
      playTone('win');
      setQuizDone(true);
    }
  };

  // Arcade handlers
  const pickNextArcade = () => {
    const next = ARCADE_ITEMS[Math.floor(Math.random() * ARCADE_ITEMS.length)];
    setArcadeItem(next);
    setArcadeCardBump(true);
    window.setTimeout(() => setArcadeCardBump(false), 140);
  };

  const handleStartArcade = () => {
    playTone('click');
    setArcadeTime(45);
    setArcadeScore(0);
    setArcadeLives(3);
    setArcadeCombo(0);
    setArcadeFeedback(null);
    setArcadeStage('play');
    pickNextArcade();
  };

  const handleSubmitArcade = (cat: ArcadeItem['cat']) => {
    if (arcadeStage !== 'play') return;
    if (cat === arcadeItem.cat) {
      playTone('correct');
      const nextCombo = arcadeCombo + 1;
      const pts = 50 + nextCombo * 10;
      const nextScore = arcadeScore + pts;
      setArcadeCombo(nextCombo);
      setArcadeScore(nextScore);
      setArcadeBest((b) => Math.max(b, nextScore));
      setArcadeFeedback({ type: 'ok', msg: `Tepat! +${pts} poin` });
      pickNextArcade();
    } else {
      playTone('wrong');
      const nextLives = arcadeLives - 1;
      setArcadeCombo(0);
      setArcadeLives(nextLives);
      setArcadeFeedback({ type: 'err', msg: 'Salah! Nyawa berkurang' });
      if (nextLives <= 0) {
        playTone('win');
        setArcadeOverReason('Nyawa Habis!');
        setArcadeBest((b) => Math.max(b, arcadeScore));
        setArcadeStage('over');
      } else {
        pickNextArcade();
      }
    }
  };

  // Matching handlers
  const handleSelectLeftMatch = (id: number) => {
    playTone('click');
    setSelectedLeftId(id);
    const item = MATCHING_PAIRS.find((p) => p.id === id);
    if (item) {
      setMatchFeedback({
        type: 'info',
        msg: `Dipilih: ${item.left}. Sekarang klik pasangan di Kolom B.`,
      });
    }
  };

  const handleSelectRightMatch = (id: number, code: string) => {
    if (selectedLeftId === null) {
      setMatchFeedback({ type: 'err', msg: 'Pilih dulu satu item di Kolom A.' });
      return;
    }
    if (selectedLeftId === id) {
      playTone('correct');
      const nextSet = new Set(matchedIds);
      nextSet.add(id);
      setMatchedIds(nextSet);
      setSelectedLeftId(null);
      if (nextSet.size === MATCHING_PAIRS.length) {
        playTone('win');
        setMatchFeedback({
          type: 'ok',
          msg: 'Sempurna! Semua 7 pasangan berhasil dicocokkan!',
        });
      } else {
        setMatchFeedback({ type: 'ok', msg: `Tepat! Cocok dengan pilihan ${code}.` });
      }
    } else {
      playTone('wrong');
      setMatchFeedback({ type: 'err', msg: `Belum tepat untuk pilihan ${code}, coba lagi!` });
    }
  };

  const handleResetMatching = () => {
    playTone('click');
    setMatchedIds(new Set());
    setSelectedLeftId(null);
    setMatchFeedback(null);
  };

  // Board mouse 3D tilt
  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || window.innerWidth < 1024 || !boardRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    boardRef.current.style.transform = `rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 4.5).toFixed(2)}deg)`;
  };

  const handleBoardMouseLeave = () => {
    if (boardRef.current) {
      boardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const filteredFeatures =
    featureFilter === 'all'
      ? FEATURE_DATA
      : FEATURE_DATA.filter((f) => f.category === featureFilter);

  const currentQuestion = QUIZ_QUESTIONS[qIndex];
  const progressCount = visitedViews.size;
  const progressPct = Math.round((progressCount / 4) * 100);
  const colBOrder = (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const)
    .map((c) => MATCHING_PAIRS.find((p) => p.rightCode === c))
    .filter((x): x is (typeof MATCHING_PAIRS)[number] => Boolean(x));

  return (
    <>
      <header className="subpage-hero dsi-subpage-hero">
        <div className="hero-stars" aria-hidden="true">
          <span className="star-dot s1" />
          <span className="star-dot s2" />
          <span className="star-dot s5" />
        </div>
        <div className="container subpage-hero-inner">
          <div className="subpage-breadcrumb">
            <button type="button" className="subpage-back-btn" onClick={onBackToMateri}>
              <ArrowLeft size={14} className="inline mr-1.5" />
              Kembali ke Materi Kelas 12
            </button>
            <span className="subpage-crumb-trail">
              Home · Materi Informatika · Kelas 12 · Kode DSI
            </span>
          </div>

          <div className="dsi-hero-top">
            <div>
              <div className="eyebrow eyebrow-gold">Modul Interaktif 3D · Kode DSI</div>
              <h1 className="subpage-title">Dampak Sosial Informatika</h1>
              <p className="subpage-sub">
                Yuk pelajari tentang dunia informatika di lingkup yang lebih luas di dunia nyata —
                jelajahi peta konsep 3D, infografis platform &amp; profesi TI, serta arena games
                &amp; kuis interaktif.
              </p>
            </div>

            <div className="dsi-hero-telemetry">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                }}
                className="dsi-sound-btn"
                aria-label={soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara'}
                title={soundEnabled ? 'Efek Suara Aktif' : 'Efek Suara Nonaktif'}
              >
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                <span>{soundEnabled ? 'Audio Aktif' : 'Audio Mati'}</span>
              </button>

              <div className="dsi-progress-box">
                <div className="dsi-progress-labels">
                  <span>Progres Jelajah</span>
                  <strong className="tabular-nums">{progressCount}/4</strong>
                </div>
                <div className="dsi-progress-track">
                  <div className="dsi-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="subpage-switcher" role="tablist" aria-label="Navigasi Modul DSI">
            {(
              [
                { id: 'mindmap', label: 'Mindmap 3D', icon: <Move3d size={15} /> },
                { id: 'platform', label: 'Platform (5)', icon: <Users size={15} /> },
                { id: 'fitur', label: 'Fitur (8)', icon: <Settings size={15} /> },
                { id: 'profesi', label: 'Profesi TI (3)', icon: <Briefcase size={15} /> },
                { id: 'games', label: 'Games & Quiz', icon: <Gamepad2 size={15} /> },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeView === tab.id}
                className={`subpage-pill dsi-nav-pill${activeView === tab.id ? ' active' : ''}`}
                onClick={() => navigateView(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <section id="materi-dsi" className="subpage-body dsi-workspace">
        <div className="container">
          <AnimatePresence mode="wait">
            {activeView === 'mindmap' ? (
              <motion.div
                key="dsi-mindmap"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILKY_EASE }}
              >
                {/* Orientasi Belajar: Video Pemantik + CP & TP */}
                <div className="dsi-card-3d dsi-orientation-shell">
                  <div className="dsi-orientation-head">
                    <div className="dsi-orientation-title-wrap">
                      <span className="dsi-orientation-badge">
                        <Target size={15} />
                        <span>Orientasi Materi</span>
                      </span>
                      <div>
                        <h2>Video Pemantik, Capaian (CP) &amp; Tujuan Pembelajaran (TP)</h2>
                        <p>
                          Awali pembelajaran dengan menyimak video pemantik serta memahami target
                          kompetensi sebelum mengeksplorasi Mindmap 3D.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`dsi-orientation-toggle${orientationOpen ? ' is-open' : ''}`}
                      onClick={() => {
                        playTone('click');
                        setOrientationOpen((prev) => !prev);
                      }}
                      aria-expanded={orientationOpen}
                    >
                      <span>{orientationOpen ? 'Sembunyikan' : 'Tampilkan'}</span>
                      <ChevronDown size={15} />
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {orientationOpen ? (
                      <motion.div
                        key="dsi-orientation-body"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: SILKY_EASE }}
                        className="dsi-orientation-collapse"
                      >
                        <div className="dsi-orientation-grid">
                          {/* Kolom Kiri: Video Pemantik YouTube */}
                          <div className="dsi-video-panel">
                            <div className="dsi-panel-top">
                              <span className="dsi-panel-kicker">
                                <Play size={12} />
                                <span>Video Pemantik</span>
                              </span>
                              <a
                                href={DSI_VIDEO_PEMANTIK.watchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dsi-video-ext"
                              >
                                <span>Tonton di YouTube</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>

                            <div className="dsi-video-frame">
                              <iframe
                                src={DSI_VIDEO_PEMANTIK.embedUrl}
                                title={DSI_VIDEO_PEMANTIK.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                              />
                            </div>

                            <div className="dsi-video-copy">
                              <h3>{DSI_VIDEO_PEMANTIK.title}</h3>
                              <p>{DSI_VIDEO_PEMANTIK.subtitle}</p>
                            </div>

                            <div className="dsi-video-prompts">
                              <div className="dsi-prompts-head">
                                <Lightbulb size={14} />
                                <span>Pertanyaan Pemantik Diskusi</span>
                              </div>
                              <ul>
                                {DSI_VIDEO_PEMANTIK.prompts.map((prompt, idx) => (
                                  <li key={idx}>{prompt}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Kolom Kanan: CP & TP */}
                          <div className="dsi-cptp-panel">
                            <div className="dsi-cp-box">
                              <div className="dsi-cp-meta">
                                <span className="dsi-cp-pill">
                                  <BookOpen size={12} />
                                  <span>Capaian Pembelajaran (CP)</span>
                                </span>
                                <span className="dsi-cp-fase">{DSI_CAPAIAN_PEMBELAJARAN.fase}</span>
                              </div>
                              <div className="dsi-cp-elemen">
                                Elemen: {DSI_CAPAIAN_PEMBELAJARAN.elemen}
                              </div>
                              <p>{DSI_CAPAIAN_PEMBELAJARAN.description}</p>
                            </div>

                            <div className="dsi-tp-section">
                              <div className="dsi-tp-head">
                                <span className="dsi-tp-heading">
                                  <CheckCircle2 size={14} />
                                  <span>Tujuan Pembelajaran (TP)</span>
                                </span>
                                <span className="dsi-tp-count">4 Target Kompetensi</span>
                              </div>

                              <div className="dsi-tp-list">
                                {DSI_TUJUAN_PEMBELAJARAN.map((tp) => (
                                  <button
                                    key={tp.id}
                                    type="button"
                                    className="dsi-tp-card"
                                    onClick={() => navigateView(tp.targetView)}
                                  >
                                    <div className="dsi-tp-card-top">
                                      <span className="dsi-tp-code">{tp.code}</span>
                                      <strong>{tp.title}</strong>
                                      <span className="dsi-tp-branch">
                                        {tp.branchLabel}
                                        <ArrowRight size={11} />
                                      </span>
                                    </div>
                                    <p>{tp.description}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Toolbar Mode 3D */}
                <div className="dsi-toolbar">
                  <p className="dsi-toolbar-tip">
                    Klik poin mana saja pada Mindmap untuk membuka <strong>Infografis</strong> ·
                    Geser objek 3D di tengah untuk memutarnya.
                  </p>
                  <div className="dsi-toolbar-actions">
                    <div className="dsi-segmented">
                      <button
                        type="button"
                        className={mindmapMode === 'board' ? 'active' : ''}
                        onClick={() => {
                          playTone('click');
                          setMindmapMode('board');
                        }}
                      >
                        Peta 3D
                      </button>
                      <button
                        type="button"
                        className={mindmapMode === 'orbit' ? 'active' : ''}
                        onClick={() => {
                          playTone('click');
                          setMindmapMode('orbit');
                        }}
                      >
                        Dunia Orbit 3D
                      </button>
                    </div>
                    {mindmapMode === 'board' ? (
                      <button
                        type="button"
                        className="dsi-tilt-toggle"
                        onClick={() => {
                          playTone('click');
                          setTiltEnabled((prev) => !prev);
                        }}
                      >
                        Tilt 3D: {tiltEnabled ? 'ON' : 'OFF'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn-primary dsi-play-cta"
                      onClick={() => navigateView('games')}
                    >
                      <Gamepad2 size={16} />
                      <span>Main Games &amp; Quiz</span>
                    </button>
                  </div>
                </div>

                {mindmapMode === 'board' ? (
                  <div
                    className="dsi-stage-3d"
                    onMouseMove={handleBoardMouseMove}
                    onMouseLeave={handleBoardMouseLeave}
                  >
                    <div ref={boardRef} className="dsi-board-3d">
                      {/* Desktop SVG Connectors */}
                      <svg
                        className="dsi-board-lines"
                        viewBox="0 0 1200 760"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M 480 310 C 435 310, 435 120, 390 120"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 480 390 C 435 390, 435 455, 390 455"
                          fill="none"
                          stroke="#00A1E9"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        <path
                          d="M 720 310 C 765 310, 765 120, 810 120"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 720 390 C 765 390, 765 455, 810 455"
                          fill="none"
                          stroke="#00A1E9"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        <path
                          d="M 600 425 L 600 505"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 410 535 C 240 535, 200 555, 200 595"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 600 555 L 600 595"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 790 535 C 960 535, 1000 555, 1000 595"
                          fill="none"
                          stroke="#102380"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="dsi-mindmap-top-grid">
                        {/* Panel Kiri: Jenis Platform Media Sosial */}
                        <div className="dsi-card-3d dsi-branch-col">
                          <button
                            type="button"
                            className="dsi-branch-head"
                            onClick={() => navigateView('platform')}
                          >
                            <span className="dsi-branch-icon">
                              <Users size={22} />
                            </span>
                            <span className="dsi-pill-header">
                              <span>Jenis Platform Media Sosial</span>
                              <ArrowRight size={15} />
                            </span>
                          </button>

                          <div className="dsi-branch-list">
                            {PLATFORM_DATA.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="dsi-item-pill"
                                onClick={() => navigateView('platform', p.id)}
                              >
                                <span className="dsi-item-num">{p.no}</span>
                                <span className="dsi-item-text">
                                  <strong>{p.title}</strong>
                                  <small>{p.shortDesc}</small>
                                </span>
                                <span className="dsi-item-ex">{p.examples.join(', ')}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Panel Tengah: Laptop 3D + Awan Judul */}
                        <div className="dsi-center-stage">
                          <div
                            className="dsi-hero-canvas-wrap"
                            title="Geser untuk memutar model 3D"
                          >
                            <canvas ref={heroCanvasRef} />
                            <span className="dsi-drag-hint">Geser Putar 3D</span>
                          </div>
                          <div className="dsi-cloud-3d">
                            <span className="dsi-cloud-kicker">Pusat Materi · DSI</span>
                            <h2>Dampak Sosial Informatika</h2>
                            <div className="dsi-cloud-bar" />
                            <p>
                              Jelajahi 3 cabang utama infografis dan uji pemahamanmu di Arena Games.
                            </p>
                          </div>
                        </div>

                        {/* Panel Kanan: Jenis Fitur Media Sosial */}
                        <div className="dsi-card-3d dsi-branch-col">
                          <button
                            type="button"
                            className="dsi-branch-head"
                            onClick={() => navigateView('fitur')}
                          >
                            <span className="dsi-branch-icon">
                              <Settings size={22} />
                            </span>
                            <span className="dsi-pill-header">
                              <span>Jenis Fitur Media Sosial</span>
                              <ArrowRight size={15} />
                            </span>
                          </button>

                          <div className="dsi-branch-list compact">
                            {FEATURE_DATA.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                className="dsi-item-pill"
                                onClick={() => navigateView('fitur', f.id)}
                              >
                                <span className="dsi-item-num">{f.no}</span>
                                <span className="dsi-item-text">
                                  <strong>{f.title}</strong>
                                  <small>{f.shortDesc}</small>
                                </span>
                                <span className="dsi-item-ex">{f.examples.join(', ')}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bagian Bawah: Profesi di Bidang Informatika */}
                      <div className="dsi-profesi-section">
                        <div className="dsi-profesi-center-btn-wrap">
                          <button
                            type="button"
                            className="dsi-profesi-center-btn"
                            onClick={() => navigateView('profesi')}
                          >
                            <span className="dsi-branch-icon">
                              <Briefcase size={22} />
                            </span>
                            <span className="dsi-pill-header">
                              <span>Profesi di Bidang Informatika</span>
                              <ArrowRight size={15} />
                            </span>
                          </button>
                        </div>

                        <div className="dsi-profesi-trio">
                          <button
                            type="button"
                            className="dsi-card-3d dsi-prof-card"
                            onClick={() => navigateView('profesi', 'prof-software')}
                          >
                            <div className="dsi-prof-head">
                              <h3>A. Kelompok Pertama</h3>
                              <span>Perangkat Lunak (Software)</span>
                            </div>
                            <div className="dsi-prof-body">
                              <p>
                                Bergelut di dunia perangkat lunak — merancang sistem, mengembangkan
                                aplikasi, dan mengelola data.
                              </p>
                              <div className="dsi-prof-list-row">
                                <ul>
                                  <li>Sistem Analis</li>
                                  <li>Programmer</li>
                                  <li>Web Designer</li>
                                  <li>Web Programmer</li>
                                </ul>
                                <span className="dsi-prof-emblem">
                                  <Laptop size={26} />
                                </span>
                              </div>
                            </div>
                            <div className="dsi-prof-foot">
                              <span>Buka Infografis Software</span>
                              <ArrowRight size={15} />
                            </div>
                          </button>

                          <button
                            type="button"
                            className="dsi-card-3d dsi-prof-card"
                            onClick={() => navigateView('profesi', 'prof-hardware')}
                          >
                            <div className="dsi-prof-head">
                              <h3>B. Kelompok Kedua</h3>
                              <span>Perangkat Keras (Hardware)</span>
                            </div>
                            <div className="dsi-prof-body">
                              <p>
                                Berkaitan dengan pemeliharaan, perbaikan perangkat keras komputer,
                                serta teknis jaringan komputer.
                              </p>
                              <div className="dsi-prof-list-row">
                                <ul>
                                  <li>Technical Engineer</li>
                                  <li>Networking Engineer</li>
                                </ul>
                                <span className="dsi-prof-emblem">
                                  <Cpu size={26} />
                                </span>
                              </div>
                            </div>
                            <div className="dsi-prof-foot">
                              <span>Buka Infografis Hardware</span>
                              <ArrowRight size={15} />
                            </div>
                          </button>

                          <button
                            type="button"
                            className="dsi-card-3d dsi-prof-card"
                            onClick={() => navigateView('profesi', 'prof-operasional')}
                          >
                            <div className="dsi-prof-head">
                              <h3>C. Kelompok Ketiga</h3>
                              <span>Operasional Sistem Informasi</span>
                            </div>
                            <div className="dsi-prof-body">
                              <p>
                                Mengelola, mengadministrasikan, dan mengoperasikan sistem informasi
                                di dalam organisasi.
                              </p>
                              <div className="dsi-prof-list-row">
                                <ul>
                                  <li>EDP Operator</li>
                                  <li>System Administrator</li>
                                  <li>MIS Director</li>
                                </ul>
                                <span className="dsi-prof-emblem">
                                  <Database size={26} />
                                </span>
                              </div>
                            </div>
                            <div className="dsi-prof-foot">
                              <span>Buka Infografis Operasional SI</span>
                              <ArrowRight size={15} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dsi-orbit-stage">
                    <canvas ref={orbitCanvasRef} className="dsi-orbit-canvas" />
                    <div className="dsi-orbit-hud-top">
                      <div className="dsi-orbit-info-card">
                        <strong>Eksplorasi Mindmap 3D</strong>
                        <p>
                          Geser layar untuk memutar kamera 360°. Klik objek 3D atau tombol cabang di
                          bawah untuk membuka infografis.
                        </p>
                      </div>
                      {orbitHoverLabel ? (
                        <div className="dsi-orbit-tooltip">{orbitHoverLabel}</div>
                      ) : null}
                    </div>
                    <div className="dsi-orbit-hud-bottom">
                      <button type="button" onClick={() => navigateView('platform')}>
                        <Users size={14} /> Jenis Platform (5)
                      </button>
                      <button type="button" onClick={() => navigateView('fitur')}>
                        <Settings size={14} /> Jenis Fitur (8)
                      </button>
                      <button type="button" onClick={() => navigateView('profesi')}>
                        <Briefcase size={14} /> Profesi TI (3)
                      </button>
                      <button
                        type="button"
                        className="gold"
                        onClick={() => navigateView('games')}
                      >
                        <Gamepad2 size={14} /> Games &amp; Quiz
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeView === 'platform' ? (
              <motion.div
                key="dsi-platform"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILKY_EASE }}
              >
                <div className="dsi-section-nav">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigateView('mindmap')}
                  >
                    <ArrowLeft size={15} /> Kembali ke Mindmap 3D
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigateView('fitur')}
                  >
                    Lanjut: Jenis Fitur <ArrowRight size={15} />
                  </button>
                </div>

                <div className="dsi-banner-3d">
                  <div>
                    <div className="dsi-banner-kicker">Infografis Cabang 01</div>
                    <h2>5 Jenis Platform Media Sosial</h2>
                    <p>
                      Klasifikasi media sosial berdasarkan fungsi utama platform — mulai dari
                      kolaborasi penyuntingan konten hingga interaksi avatar di dunia virtual 3D.
                    </p>
                  </div>
                  <div className="dsi-banner-stat">
                    <strong className="tabular-nums">05</strong>
                    <span>Platform Utama</span>
                  </div>
                </div>

                <div className="dsi-platform-grid">
                  {PLATFORM_DATA.map((item) => {
                    const isOpen = !!openInsights[item.id];
                    return (
                      <article
                        key={item.id}
                        id={item.id}
                        className={`dsi-card-3d dsi-detail-card${
                          highlightedId === item.id ? ' dsi-highlight-ring' : ''
                        }`}
                      >
                        <div className="dsi-detail-head">
                          <span className="dsi-detail-icon">
                            {renderPlatformIcon(item.iconName)}
                          </span>
                          <div>
                            <div className="dsi-detail-kicker">
                              Platform {String(item.no).padStart(2, '0')}
                            </div>
                            <h3>{item.title}</h3>
                          </div>
                        </div>
                        <p className="dsi-detail-desc">{item.desc}</p>
                        <div className="dsi-detail-meta">
                          Contoh populer: <strong>{item.examples.join(' · ')}</strong>
                        </div>
                        <div className="dsi-insight-wrap">
                          <button
                            type="button"
                            className="dsi-insight-toggle"
                            onClick={() => {
                              playTone('click');
                              setOpenInsights((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                            }}
                          >
                            <span>
                              <Lightbulb size={15} className="inline mr-1.5 text-amber-500" />
                              Dampak Sosial &amp; Catatan
                            </span>
                            <ChevronDown
                              size={15}
                              style={{
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </button>
                          {isOpen ? <div className="dsi-insight-body">{item.insight}</div> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeView === 'fitur' ? (
              <motion.div
                key="dsi-fitur"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILKY_EASE }}
              >
                <div className="dsi-section-nav">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigateView('mindmap')}
                  >
                    <ArrowLeft size={15} /> Kembali ke Mindmap 3D
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigateView('profesi')}
                  >
                    Lanjut: Profesi TI <ArrowRight size={15} />
                  </button>
                </div>

                <div className="dsi-banner-3d">
                  <div>
                    <div className="dsi-banner-kicker">Infografis Cabang 02</div>
                    <h2>8 Jenis Fitur Media Sosial</h2>
                    <p>
                      Setiap fitur memiliki peran sosial, kurasi informasi, dan dampak ekonomi yang
                      berbeda dalam kehidupan digital masyarakat modern.
                    </p>
                  </div>
                  <div className="dsi-banner-stat">
                    <strong className="tabular-nums">08</strong>
                    <span>Fitur Interaktif</span>
                  </div>
                </div>

                <div className="tabs dsi-filter-bar">
                  {(
                    [
                      { key: 'all', label: 'Semua (8)' },
                      { key: 'sosial', label: 'Relasi & Komunitas' },
                      { key: 'konten', label: 'Konten & Kurasi' },
                      { key: 'ekonomi', label: 'Ulasan & Ekonomi' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={`tab-btn${featureFilter === f.key ? ' active' : ''}`}
                      onClick={() => {
                        playTone('click');
                        setFeatureFilter(f.key);
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="dsi-fitur-grid">
                  {filteredFeatures.map((item) => (
                    <article
                      key={item.id}
                      id={item.id}
                      className={`dsi-card-3d dsi-detail-card${
                        highlightedId === item.id ? ' dsi-highlight-ring' : ''
                      }`}
                    >
                      <div className="dsi-fitur-top">
                        <span className="dsi-detail-icon">{renderFeatureIcon(item.iconName)}</span>
                        <span className="dsi-item-num">{item.no}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p className="dsi-detail-desc">{item.desc}</p>
                      <div className="dsi-detail-meta">
                        Contoh: <strong>{item.examples.join(' · ')}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            ) : activeView === 'profesi' ? (
              <motion.div
                key="dsi-profesi"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILKY_EASE }}
              >
                <div className="dsi-section-nav">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigateView('mindmap')}
                  >
                    <ArrowLeft size={15} /> Kembali ke Mindmap 3D
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigateView('games')}
                  >
                    Lanjut: Games &amp; Quiz <Gamepad2 size={15} />
                  </button>
                </div>

                <div className="dsi-banner-3d">
                  <div>
                    <div className="dsi-banner-kicker">Infografis Cabang 03</div>
                    <h2>Profesi di Bidang Informatika</h2>
                    <p>
                      Terbagi dalam 3 kelompok besar: Perangkat Lunak (Software), Perangkat Keras
                      (Hardware), dan Operasional Sistem Informasi.
                    </p>
                  </div>
                  <div className="dsi-banner-stats-pair">
                    <div className="dsi-banner-stat">
                      <strong className="tabular-nums">03</strong>
                      <span>Kelompok</span>
                    </div>
                    <div className="dsi-banner-stat">
                      <strong className="tabular-nums">09</strong>
                      <span>Profesi</span>
                    </div>
                  </div>
                </div>

                <div
                  id="prof-software"
                  className={`dsi-card-3d dsi-prof-panel${
                    highlightedId === 'prof-software' ? ' dsi-highlight-ring' : ''
                  }`}
                >
                  <div className="dsi-detail-head">
                    <span className="dsi-detail-icon">
                      <Laptop size={22} />
                    </span>
                    <div>
                      <div className="dsi-detail-kicker">A. Kelompok Pertama</div>
                      <h3>Perangkat Lunak (Software)</h3>
                    </div>
                  </div>

                  <div className="dsi-flow-grid">
                    <div className="dsi-flow-col">
                      <div className="dsi-flow-title">Alur Sistem &amp; Aplikasi</div>
                      <div className="dsi-flow-box">
                        <h4>1. Sistem Analis</h4>
                        <p>
                          Menganalisa sistem yang akan diimplementasikan, kelebihan &amp;
                          kekurangannya, studi kelayakan, hingga desain sistem.
                        </p>
                      </div>
                      <div className="dsi-flow-arrow" aria-hidden="true">
                        <ArrowDown size={18} />
                      </div>
                      <div className="dsi-flow-box">
                        <h4>2. Programmer</h4>
                        <p>
                          Mengimplementasikan rancangan sistem analis menjadi program nyata
                          (aplikasi maupun sistem operasi).
                        </p>
                      </div>
                    </div>

                    <div className="dsi-flow-col">
                      <div className="dsi-flow-title">Alur Aplikasi Web</div>
                      <div className="dsi-flow-box">
                        <h4>3. Web Designer</h4>
                        <p>
                          Melakukan perencanaan, studi kelayakan, analisis, dan desain
                          tampilan/struktur proyek aplikasi berbasis web.
                        </p>
                      </div>
                      <div className="dsi-flow-arrow" aria-hidden="true">
                        <ArrowDown size={18} />
                      </div>
                      <div className="dsi-flow-box">
                        <h4>4. Web Programmer</h4>
                        <p>
                          Mengimplementasikan rancangan web designer menjadi program berbasis web
                          yang fungsional.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dsi-prof-bottom-grid">
                  <div
                    id="prof-hardware"
                    className={`dsi-card-3d dsi-prof-panel${
                      highlightedId === 'prof-hardware' ? ' dsi-highlight-ring' : ''
                    }`}
                  >
                    <div className="dsi-detail-head">
                      <span className="dsi-detail-icon">
                        <Cpu size={22} />
                      </span>
                      <div>
                        <div className="dsi-detail-kicker">B. Kelompok Kedua</div>
                        <h3>Perangkat Keras (Hardware)</h3>
                      </div>
                    </div>

                    <div className="dsi-stack-list">
                      <div className="dsi-flow-box">
                        <h4>
                          <Wrench size={15} className="inline mr-1.5 text-sky-600" />
                          Technical Engineer (Teknisi)
                        </h4>
                        <p>
                          Berkecimpung dalam bidang teknik pemeliharaan maupun perbaikan perangkat
                          keras komputer.
                        </p>
                      </div>
                      <div className="dsi-flow-box">
                        <h4>
                          <Network size={15} className="inline mr-1.5 text-sky-600" />
                          Networking Engineer
                        </h4>
                        <p>
                          Menangani bidang teknis jaringan komputer mulai dari maintenance hingga
                          troubleshooting.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    id="prof-operasional"
                    className={`dsi-card-3d dsi-prof-panel${
                      highlightedId === 'prof-operasional' ? ' dsi-highlight-ring' : ''
                    }`}
                  >
                    <div className="dsi-detail-head">
                      <span className="dsi-detail-icon">
                        <Database size={22} />
                      </span>
                      <div>
                        <div className="dsi-detail-kicker">C. Kelompok Ketiga</div>
                        <h3>Operasional Sistem Informasi</h3>
                      </div>
                    </div>

                    <div className="dsi-stack-list">
                      <div className="dsi-flow-box dsi-mis-highlight">
                        <div className="dsi-mis-row">
                          <h4>
                            <Crown size={15} className="inline mr-1.5 text-amber-400" />
                            MIS Director
                          </h4>
                          <span className="dsi-mis-role">Wewenang Tertinggi</span>
                        </div>
                        <p>
                          Memiliki wewenang tertinggi terhadap sistem informasi; memanajemen
                          hardware, software, dan SDM secara keseluruhan.
                        </p>
                      </div>
                      <div className="dsi-flow-box">
                        <h4>
                          <ShieldCheck size={15} className="inline mr-1.5 text-sky-600" />
                          System Administrator
                        </h4>
                        <p>
                          Melakukan administrasi &amp; pemeliharaan sistem, serta mengatur hak akses
                          operasional sistem.
                        </p>
                      </div>
                      <div className="dsi-flow-box">
                        <h4>
                          <Keyboard size={15} className="inline mr-1.5 text-sky-600" />
                          EDP Operator
                        </h4>
                        <p>
                          Mengoperasikan program-program yang berhubungan dengan Electronic Data
                          Processing (EDP) di organisasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dsi-games"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: SILKY_EASE }}
              >
                <div className="dsi-section-nav">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigateView('mindmap')}
                  >
                    <ArrowLeft size={15} /> Kembali ke Mindmap 3D
                  </button>
                </div>

                <div className="dsi-banner-3d">
                  <div>
                    <div className="dsi-banner-kicker">Arena Tantangan</div>
                    <h2>Games &amp; Quiz Informatika</h2>
                    <p>
                      Asah penguasaan materimu lewat Quiz Pilihan Ganda, Game Arcade Sortir Cepat,
                      Game Mencocokkan Modul, dan Latihan Essay.
                    </p>
                  </div>
                  <div className="dsi-banner-stat">
                    <strong className="tabular-nums">{arcadeBest}</strong>
                    <span>Rekor Sortir Cepat</span>
                  </div>
                </div>

                <div className="tabs dsi-filter-bar">
                  {(
                    [
                      { id: 'quiz', label: 'Quiz Pilihan Ganda (10)', icon: <HelpCircle size={15} /> },
                      { id: 'arcade', label: 'Sortir Cepat 3D', icon: <Zap size={15} /> },
                      { id: 'match', label: 'Cocokkan (Aktivitas 2)', icon: <Link2 size={15} /> },
                      { id: 'essay', label: 'Latihan Essay (1 & 3)', icon: <PenSquare size={15} /> },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`tab-btn dsi-game-tab${gameTab === g.id ? ' active' : ''}`}
                      onClick={() => {
                        playTone('click');
                        setGameTab(g.id);
                      }}
                    >
                      {g.icon}
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>

                {gameTab === 'quiz' ? (
                  <div className="dsi-card-3d dsi-game-panel">
                    <div className="dsi-quiz-head">
                      <div className="dsi-quiz-meta">
                        <span className="tabular-nums">
                          Soal {qIndex + 1} / {QUIZ_QUESTIONS.length}
                        </span>
                        {qStreak >= 2 ? (
                          <span className="dsi-streak-note">
                            <Flame size={14} /> Streak x{qStreak}
                          </span>
                        ) : null}
                      </div>
                      <div className="dsi-quiz-actions">
                        <span className="tabular-nums">
                          Skor: <strong>{qScore}</strong>
                        </span>
                        <button type="button" className="btn-ghost" onClick={handleStartQuiz}>
                          <RotateCcw size={14} /> Ulangi
                        </button>
                      </div>
                    </div>

                    <div className="dsi-quiz-progress-track">
                      <div
                        className="dsi-quiz-progress-fill"
                        style={{
                          width: `${((qIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                        }}
                      />
                    </div>

                    {!quizDone ? (
                      <div>
                        <div className="dsi-detail-kicker">{currentQuestion.category}</div>
                        <h3 className="dsi-quiz-question">{currentQuestion.q}</h3>

                        <div className="dsi-quiz-options">
                          {currentQuestion.options.map((opt, idx) => {
                            const letters = ['A', 'B', 'C', 'D'];
                            const isAnswered = qSelected !== null;
                            const isCorrectOpt = idx === currentQuestion.answer;
                            const isPickedWrong = isAnswered && qSelected === idx && !isCorrectOpt;
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => handleSelectQuiz(idx)}
                                className={`dsi-item-pill dsi-quiz-opt${
                                  isAnswered && isCorrectOpt
                                    ? ' is-correct'
                                    : isPickedWrong
                                      ? ' is-wrong'
                                      : ''
                                }`}
                              >
                                <span className="dsi-opt-letter">{letters[idx]}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {qSelected !== null ? (
                          <div
                            className={`dsi-quiz-exp ${
                              qSelected === currentQuestion.answer ? 'ok' : 'err'
                            }`}
                          >
                            <div className="dsi-exp-title">
                              {qSelected === currentQuestion.answer ? (
                                <>
                                  <CheckCircle2 size={17} /> Benar!
                                </>
                              ) : (
                                <>
                                  <XCircle size={17} /> Kurang tepat.
                                </>
                              )}
                            </div>
                            <p>{currentQuestion.explanation}</p>
                          </div>
                        ) : null}

                        {qSelected !== null ? (
                          <div className="dsi-quiz-next-row">
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={handleNextQuiz}
                            >
                              <span>
                                {qIndex === QUIZ_QUESTIONS.length - 1
                                  ? 'Lihat Hasil Akhir'
                                  : 'Soal Berikutnya'}
                              </span>
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="dsi-result-box">
                        <div className="dsi-result-medal">
                          <Award size={36} />
                        </div>
                        <h3>Quiz Selesai!</h3>
                        <p>
                          {qCorrect >= 8
                            ? 'Hebat sekali! Kamu sangat menguasai materi Dampak Sosial Informatika.'
                            : qCorrect >= 5
                              ? 'Bagus! Tingkatkan sedikit lagi dengan meninjau ulang infografis.'
                              : 'Tetap semangat! Yuk pelajari kembali Mindmap 3D lalu coba lagi.'}
                        </p>
                        <div className="dsi-result-stats">
                          <div>
                            <small>Benar</small>
                            <strong className="tabular-nums">
                              {qCorrect}/{QUIZ_QUESTIONS.length}
                            </strong>
                          </div>
                          <span className="dsi-stat-divider" />
                          <div>
                            <small>Total Skor</small>
                            <strong className="tabular-nums">{qScore}</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-primary" onClick={handleStartQuiz}>
                          <RotateCcw size={15} /> Main Quiz Lagi
                        </button>
                      </div>
                    )}
                  </div>
                ) : gameTab === 'arcade' ? (
                  <div className="dsi-card-3d dsi-game-panel">
                    {arcadeStage === 'intro' ? (
                      <div className="dsi-arcade-intro">
                        <div className="dsi-result-medal gold">
                          <Zap size={34} />
                        </div>
                        <h3>Game: Sortir Cepat Informatika!</h3>
                        <p>
                          Sebuah kartu contoh atau istilah akan muncul di tengah. Tugasmu adalah
                          memilih kategori yang tepat secepat mungkin dalam waktu{' '}
                          <strong>45 detik</strong> — kumpulkan kombo untuk skor tertinggi!
                        </p>
                        <button type="button" className="btn-primary" onClick={handleStartArcade}>
                          <Play size={16} /> Mulai Bermain
                        </button>
                      </div>
                    ) : arcadeStage === 'play' ? (
                      <div>
                        <div className="dsi-arcade-hud">
                          <div className="dsi-arcade-hud-left">
                            <span className="dsi-timer tabular-nums">
                              <Clock size={16} /> {arcadeTime}s
                            </span>
                            <span className="dsi-lives" aria-label={`Sisa nyawa ${arcadeLives}`}>
                              {[0, 1, 2].map((i) => (
                                <Heart
                                  key={i}
                                  size={16}
                                  fill={i < arcadeLives ? 'currentColor' : 'none'}
                                  style={{ opacity: i < arcadeLives ? 1 : 0.28 }}
                                />
                              ))}
                            </span>
                          </div>
                          <div className="dsi-arcade-hud-right">
                            {arcadeCombo >= 2 ? (
                              <span className="dsi-streak-note">Kombo x{arcadeCombo}</span>
                            ) : null}
                            <span className="tabular-nums">
                              Skor: <strong>{arcadeScore}</strong>
                            </span>
                          </div>
                        </div>

                        <div
                          className={`dsi-arcade-target${arcadeCardBump ? ' bumped' : ''}`}
                        >
                          <div className="dsi-arcade-prompt">Masukkan ke Kategori Mana?</div>
                          <div className="dsi-arcade-term">{arcadeItem.name}</div>
                          <div className="dsi-arcade-clue">{arcadeItem.clue}</div>
                        </div>

                        <div
                          className={`dsi-arcade-feedback ${
                            arcadeFeedback ? arcadeFeedback.type : ''
                          }`}
                        >
                          {arcadeFeedback ? arcadeFeedback.msg : ''}
                        </div>

                        <div className="dsi-arcade-btns">
                          <button
                            type="button"
                            onClick={() => handleSubmitArcade('platform')}
                          >
                            <Users size={18} />
                            <span>Platform Medsos</span>
                          </button>
                          <button type="button" onClick={() => handleSubmitArcade('fitur')}>
                            <Settings size={18} />
                            <span>Fitur Medsos</span>
                          </button>
                          <button
                            type="button"
                            className="emerald"
                            onClick={() => handleSubmitArcade('software')}
                          >
                            <Laptop size={18} />
                            <span>Profesi Software</span>
                          </button>
                          <button
                            type="button"
                            className="gold"
                            onClick={() => handleSubmitArcade('hardware')}
                          >
                            <Cpu size={18} />
                            <span>Profesi Hardware</span>
                          </button>
                          <button
                            type="button"
                            className="emerald"
                            onClick={() => handleSubmitArcade('operasional')}
                          >
                            <Database size={18} />
                            <span>Operasional SI</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="dsi-result-box">
                        <div className="dsi-result-medal">
                          <Trophy size={34} />
                        </div>
                        <h3>{arcadeOverReason}</h3>
                        <p>Skor akhirmu di Game Sortir Cepat:</p>
                        <div className="dsi-arcade-final-score tabular-nums">{arcadeScore}</div>
                        <button type="button" className="btn-primary" onClick={handleStartArcade}>
                          <RotateCcw size={15} /> Main Lagi
                        </button>
                      </div>
                    )}
                  </div>
                ) : gameTab === 'match' ? (
                  <div className="dsi-card-3d dsi-game-panel">
                    <div className="dsi-quiz-head">
                      <div>
                        <h3 className="dsi-match-title">Cocokkan Kolom A dan Kolom B</h3>
                        <p className="dsi-match-sub">
                          Pilih 1 item di Kolom A, lalu pilih pengertian atau contoh yang tepat di
                          Kolom B.
                        </p>
                      </div>
                      <div className="dsi-quiz-actions">
                        <span className="tabular-nums">
                          Skor: <strong>{matchedIds.size}</strong> / {MATCHING_PAIRS.length}
                        </span>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={handleResetMatching}
                        >
                          <RotateCcw size={14} /> Ulangi
                        </button>
                      </div>
                    </div>

                    {matchFeedback ? (
                      <div className={`dsi-match-feedback ${matchFeedback.type}`}>
                        {matchFeedback.msg}
                      </div>
                    ) : null}

                    <div className="dsi-match-grid">
                      <div>
                        <div className="dsi-match-col-label">
                          Kolom A · Jenis Platform / Fitur
                        </div>
                        <div className="dsi-match-list">
                          {MATCHING_PAIRS.map((item) => {
                            const done = matchedIds.has(item.id);
                            const selected = selectedLeftId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={done}
                                onClick={() => handleSelectLeftMatch(item.id)}
                                className={`dsi-match-btn${done ? ' done' : ''}${
                                  selected ? ' selected' : ''
                                }`}
                              >
                                <span>{item.left}</span>
                                {done ? (
                                  <small className="dsi-matched-tag">
                                    Cocok ({item.rightCode})
                                  </small>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="dsi-match-col-label">Kolom B · Pengertian / Contoh</div>
                        <div className="dsi-match-list">
                          {colBOrder.map((item) => {
                            const done = matchedIds.has(item.id);
                            return (
                              <button
                                key={item.rightCode}
                                type="button"
                                disabled={done}
                                onClick={() => handleSelectRightMatch(item.id, item.rightCode)}
                                className={`dsi-match-btn right${done ? ' done' : ''}`}
                              >
                                <span className="dsi-opt-letter">{item.rightCode}</span>
                                <span>{item.rightText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dsi-essay-sections">
                    <div className="dsi-essay-group">
                      <h3>
                        <PenSquare size={18} /> Aktivitas 1 · Essay Media Sosial
                      </h3>
                      <div className="dsi-essay-list">
                        {ESSAY_AKT1.map((it, idx) => {
                          const key = `a1-${idx}`;
                          const showHint = !!openHints[key];
                          return (
                            <div key={key} className="dsi-card-3d dsi-essay-card">
                              <h4>{it.q}</h4>
                              <textarea
                                rows={2}
                                placeholder="Tulis jawabanmu di sini..."
                                value={essayDrafts[key] || ''}
                                onChange={(e) =>
                                  setEssayDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                              />
                              <button
                                type="button"
                                className="dsi-hint-btn"
                                onClick={() => {
                                  playTone('click');
                                  setOpenHints((prev) => ({ ...prev, [key]: !prev[key] }));
                                }}
                              >
                                <KeyRound size={14} />{' '}
                                {showHint ? 'Tutup Poin Kunci' : 'Lihat Poin Kunci'}
                              </button>
                              {showHint ? (
                                <div className="dsi-hint-box">
                                  <strong>Kunci:</strong> {it.hint}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="dsi-essay-group">
                      <h3>
                        <Briefcase size={18} /> Aktivitas 3 · Essay Profesi Informatika
                      </h3>
                      <div className="dsi-essay-list">
                        {ESSAY_AKT3.map((it, idx) => {
                          const key = `a3-${idx}`;
                          const showHint = !!openHints[key];
                          return (
                            <div key={key} className="dsi-card-3d dsi-essay-card">
                              <h4>{it.q}</h4>
                              <textarea
                                rows={2}
                                placeholder="Tulis jawabanmu di sini..."
                                value={essayDrafts[key] || ''}
                                onChange={(e) =>
                                  setEssayDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                              />
                              <button
                                type="button"
                                className="dsi-hint-btn"
                                onClick={() => {
                                  playTone('click');
                                  setOpenHints((prev) => ({ ...prev, [key]: !prev[key] }));
                                }}
                              >
                                <KeyRound size={14} />{' '}
                                {showHint ? 'Tutup Poin Kunci' : 'Lihat Poin Kunci'}
                              </button>
                              {showHint ? (
                                <div className="dsi-hint-box">
                                  <strong>Kunci:</strong> {it.hint}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

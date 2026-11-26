import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], .info-card, .materi-card, .karya-item, .hero-hl-card';

interface TrailNode {
  x: number;
  y: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

const TRAIL_COUNT = 20;
const SPARK_COLORS = ['#FDD000', '#00A1E9', '#F1B23A', '#FFF4B8'];

export function PointerFX() {
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches);
    };
    sync();

    finePointer.addEventListener('change', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      finePointer.removeEventListener('change', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mouseX = -100;
    let mouseY = -100;
    let lastMouseX = -100;
    let lastMouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;
    let rafId = 0;
    let dpr = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const trail: TrailNode[] = Array.from({ length: TRAIL_COUNT }, () => ({
      x: -100,
      y: -100,
    }));
    const sparks: SparkParticle[] = [];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const ripple = rippleRef.current;

    const syncCanvasSize = () => {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncCanvasSize();

    const setVisibility = (visible: boolean) => {
      isVisible = visible;
      if (dot) dot.style.opacity = visible ? '1' : '0';
      if (ring) ring.style.opacity = visible ? '1' : '0';
      if (canvas) canvas.style.opacity = visible ? '1' : '0';
    };

    const spawnSpark = (x: number, y: number, vx: number, vy: number, size: number, decay: number) => {
      if (sparks.length > 48) sparks.shift();
      sparks.push({
        x,
        y,
        vx,
        vy,
        size,
        alpha: 0.9,
        decay,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        ringX = mouseX;
        ringY = mouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        for (let i = 0; i < trail.length; i++) {
          trail[i].x = mouseX;
          trail[i].y = mouseY;
        }
        setVisibility(true);
      }

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const count = dist > 26 ? 2 : 1;
        for (let s = 0; s < count; s++) {
          const jitterAngle = Math.random() * Math.PI * 2;
          const speed = 0.25 + Math.random() * 0.75;
          spawnSpark(
            mouseX - dx * (s * 0.35) + (Math.random() - 0.5) * 4,
            mouseY - dy * (s * 0.35) + (Math.random() - 0.5) * 4,
            Math.cos(jitterAngle) * speed - dx * 0.03,
            Math.sin(jitterAngle) * speed - dy * 0.03,
            isHovering ? 2.4 + Math.random() * 1.8 : 1.7 + Math.random() * 1.5,
            0.032 + Math.random() * 0.018
          );
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;

      const target = e.target as Element | null;
      isHovering = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      if (ring) {
        ring.classList.toggle('is-hovering', isHovering);
      }
      if (dot) {
        dot.classList.toggle('is-hovering', isHovering);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      ring?.classList.add('is-pressed');
      dot?.classList.add('is-pressed');

      if (ripple) {
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        ripple.classList.remove('active');
        void ripple.offsetWidth;
        ripple.classList.add('active');
      }

      // Burst of micro trail sparks on click
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.35;
        const speed = 1.4 + Math.random() * 1.8;
        spawnSpark(
          e.clientX,
          e.clientY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          2.2 + Math.random() * 1.6,
          0.038
        );
      }
    };

    const onUp = () => {
      ring?.classList.remove('is-pressed');
      dot?.classList.remove('is-pressed');
    };

    const onLeave = () => setVisibility(false);

    const drawTrail = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Update spring-chain nodes smoothly
      trail[0].x += (mouseX - trail[0].x) * 0.56;
      trail[0].y += (mouseY - trail[0].y) * 0.56;
      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];
        const ease = Math.max(0.28, 0.5 - i * 0.01);
        curr.x += (prev.x - curr.x) * ease;
        curr.y += (prev.y - curr.y) * ease;
      }

      if (isVisible) {
        // Compute total ribbon length so we skip drawing when completely resting
        let totalLen = 0;
        for (let i = 1; i < trail.length; i++) {
          totalLen += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
        }

        if (totalLen > 1.2) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Soft ambient glow ribbon + crisp tapered core
          for (let i = 0; i < trail.length - 1; i++) {
            const p0 = trail[i];
            const p1 = trail[i + 1];
            const next = trail[Math.min(i + 2, trail.length - 1)];
            const midX = (p1.x + next.x) * 0.5;
            const midY = (p1.y + next.y) * 0.5;
            const startX = i === 0 ? p0.x : (p0.x + p1.x) * 0.5;
            const startY = i === 0 ? p0.y : (p0.y + p1.y) * 0.5;

            const t = 1 - i / (trail.length - 1);
            const segmentWidth = (isHovering ? 7.5 : 5.5) * Math.pow(t, 1.35);
            const alpha = Math.pow(t, 1.55) * (isHovering ? 0.58 : 0.45);

            // Outer glow
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            ctx.strokeStyle =
              i < trail.length * 0.45
                ? `rgba(253, 208, 0, ${alpha * 0.35})`
                : `rgba(0, 161, 233, ${alpha * 0.35})`;
            ctx.lineWidth = segmentWidth * 2.2;
            ctx.stroke();

            // Core ribbon
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            ctx.strokeStyle =
              i < trail.length * 0.42
                ? `rgba(253, 208, 0, ${alpha})`
                : `rgba(0, 161, 233, ${alpha})`;
            ctx.lineWidth = Math.max(0.6, segmentWidth);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // Draw & decay floating trail sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * (0.45 + sp.alpha * 0.55), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      drawTrail();
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('resize', syncCanvasSize, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', syncCanvasSize);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-fx-root" aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-trail-canvas" />
      <div ref={ringRef} className="pointer-ring">
        <span className="pointer-ring-orbit" />
      </div>
      <div ref={dotRef} className="pointer-dot" />
      <div ref={rippleRef} className="pointer-click-ripple" />
    </div>
  );
}

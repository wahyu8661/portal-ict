import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"], .info-card, .materi-card, .karya-item, .hero-hl-card';

export function PointerFX() {
  const [enabled, setEnabled] = useState(false);
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
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let rafId = 0;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const ripple = rippleRef.current;

    const setVisibility = (visible: boolean) => {
      isVisible = visible;
      if (dot) dot.style.opacity = visible ? '1' : '0';
      if (ring) ring.style.opacity = visible ? '1' : '0';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        ringX = mouseX;
        ringY = mouseY;
        setVisibility(true);
      }

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      const target = e.target as Element | null;
      const interactive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      if (ring) {
        ring.classList.toggle('is-hovering', interactive);
      }
      if (dot) {
        dot.classList.toggle('is-hovering', interactive);
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
    };

    const onUp = () => {
      ring?.classList.remove('is-pressed');
      dot?.classList.remove('is-pressed');
    };

    const onLeave = () => setVisibility(false);

    const tick = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-fx-root" aria-hidden="true">
      <div ref={ringRef} className="pointer-ring">
        <span className="pointer-ring-orbit" />
      </div>
      <div ref={dotRef} className="pointer-dot" />
      <div ref={rippleRef} className="pointer-click-ripple" />
    </div>
  );
}

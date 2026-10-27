// Motion values, springs and projection follow the user's supplied component.
import { motion, useTransform, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { activityPhotos } from '../../data/activity-photos';
import BorderGlow, { clearBorderGlow, updateBorderGlow } from '../../BorderGlow';
import './perspective-tunnel-hero.css';

const TUNNEL_CARDS = activityPhotos.map((item, index) => {
  const goldenAngle = index * 137.5 * (Math.PI / 180);
  return {
    item, index,
    angleCos: Math.cos(goldenAngle), angleSin: Math.sin(goldenAngle),
    radiusFactorX: 0.28 + (index % 3) * 0.08,
    radiusFactorY: 0.26 + (index % 2) * 0.09,
    rotationZ: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
  };
});
const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

function useCameraParallax(enabled) {
  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG), y = useSpring(rawY, SPRING_CONFIG);
  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = event => {
      if (window.scrollY > window.innerHeight) return;
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}

function TunnelCard({ card, progress, pointer, total, stage, reduce }) {
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;
  const localProgress = useTransform(progress, [start, end], [0, 1]);
  const [loadImage, setLoadImage] = useState(false);
  useEffect(() => {
    if (loadImage) return undefined;
    const prepare = value => { if (value >= Math.max(0, start - .12)) setLoadImage(true); };
    prepare(progress.get());
    return progress.on('change', prepare);
  }, [progress, start, loadImage]);
  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);
  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);
  const visibility = useTransform(localProgress, value => value > .001 && value < .98 ? 'visible' : 'hidden');
  const cardWidth = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));
  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 20 : 45;
  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]) => {
    const offsetX = baseX - px * panStrength;
    const offsetY = baseY - py * panStrength;
    return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${reduce ? -400 : currZ}px) rotateZ(${reduce ? 0 : card.rotationZ}deg)`;
  });

  return <motion.div className="tunnel-hero__card"
    style={{ width: cardWidth, aspectRatio: `${card.item.width} / ${card.item.height}`, transform, opacity, visibility, zIndex: card.index + 1 }}>
    <div className="tunnel-hero__card-inner">
      {loadImage && <img src={card.item.src} alt="" width={card.item.width} height={card.item.height} decoding="async" fetchPriority="low" draggable={false} />}
    </div>
    <BorderGlow as="span" className="media-edge-glow tunnel-hero__photo-glow" backgroundColor="transparent" borderRadius={16} glowRadius={24} glowIntensity={2.1} />
  </motion.div>;
}

export default function PerspectiveTunnelHero({ children }) {
  const containerRef = useRef(null);
  const glowPointerRef = useRef(null);
  const requestGlowRef = useRef(null);
  const reduce = useReducedMotion();
  const [stage, setStage] = useState({ width: 1440, height: 900, isMobile: false });
  useEffect(() => {
    const update = () => setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });
  useEffect(() => {
    const stageElement = containerRef.current.parentElement;
    let touchY = null, previousScrollY = window.scrollY;
    const advance = (delta, event) => {
      if (window.scrollY > 1 || delta === 0) return;
      const current = rawProgress.get();
      // Release native page scrolling at either end of the reference corridor.
      if ((delta > 0 && current >= 1) || (delta < 0 && current <= 0)) return;
      if (event.cancelable) event.preventDefault();
      rawProgress.set(Math.min(1, Math.max(0, current + delta * 0.0008)));
    };
    const wheel = event => {
      if (event.ctrlKey) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      advance(event.deltaY * unit, event);
    };
    const touchStart = event => { touchY = event.touches.length === 1 ? event.touches[0].clientY : null; };
    const touchMove = event => {
      if (touchY === null || event.touches.length !== 1) return;
      const nextY = event.touches[0].clientY;
      advance(touchY - nextY, event); touchY = nextY;
    };
    const touchEnd = () => { touchY = null; };
    const scroll = () => {
      if (window.scrollY <= 1 && previousScrollY > 1) rawProgress.set(0);
      previousScrollY = window.scrollY;
    };
    stageElement.addEventListener('wheel', wheel, { passive: false });
    stageElement.addEventListener('touchstart', touchStart, { passive: true });
    stageElement.addEventListener('touchmove', touchMove, { passive: false });
    stageElement.addEventListener('touchend', touchEnd, { passive: true });
    stageElement.addEventListener('touchcancel', touchEnd, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      stageElement.removeEventListener('wheel', wheel);
      stageElement.removeEventListener('touchstart', touchStart);
      stageElement.removeEventListener('touchmove', touchMove);
      stageElement.removeEventListener('touchend', touchEnd);
      stageElement.removeEventListener('touchcancel', touchEnd);
      window.removeEventListener('scroll', scroll);
    };
  }, [rawProgress]);

  const pointer = useCameraParallax(!reduce);
  const progress = reduce ? rawProgress : smoothProgress;
  const titleScale = useTransform(progress, [0, 0.5, 1], [1, 1.15, 1.35]);
  const titleOpacity = useTransform(progress, [0, 0.85, 1], [1, 1, 0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const point = glowPointerRef.current;
      if (!point || !containerRef.current) return;
      // Measure every moving photo before writing its paint-only glow values.
      const photos = Array.from(containerRef.current.querySelectorAll('.tunnel-hero__photo-glow')).map(node => ({
        node, bounds: node.getBoundingClientRect(), visible: Number(node.parentElement.style.opacity) > .02,
      }));
      photos.forEach(({ node, bounds, visible }) => {
        if (visible) updateBorderGlow(node, point.x, point.y, bounds);
        else clearBorderGlow(node);
      });
    };
    const request = () => { if (!frame && glowPointerRef.current) frame = requestAnimationFrame(update); };
    requestGlowRef.current = request;
    const stopWatching = [progress, pointer.x, pointer.y].map(value => value.on('change', request));
    request();
    return () => {
      cancelAnimationFrame(frame);
      stopWatching.forEach(stop => stop());
      requestGlowRef.current = null;
    };
  }, [progress, pointer.x, pointer.y]);

  return <div ref={containerRef} className="tunnel-hero" style={{ perspective: stage.isMobile ? '900px' : '1200px', transformStyle: 'preserve-3d' }}
    onPointerMove={event => {
      if (event.pointerType === 'touch') return;
      glowPointerRef.current = { x: event.clientX, y: event.clientY };
      requestGlowRef.current?.();
    }}
    onPointerLeave={() => {
      glowPointerRef.current = null;
      containerRef.current?.querySelectorAll('.tunnel-hero__photo-glow').forEach(clearBorderGlow);
    }}>
    <motion.div className="tunnel-hero__anchor" style={{ scale: reduce ? 1 : titleScale, opacity: reduce ? 1 : titleOpacity }}>
      {children}
    </motion.div>
    <div className="tunnel-hero__photos" aria-hidden="true">
      {TUNNEL_CARDS.map(card => <TunnelCard key={card.item.id} card={card} progress={progress} pointer={pointer} total={TUNNEL_CARDS.length} stage={stage} reduce={reduce} />)}
    </div>
  </div>;
}

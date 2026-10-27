/** Geometric glyphs adapted from the user's Shutter Glyph Footer.
 * The closing emblem is the original club logo, with a gentle fragment interaction.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { imageSource } from './imageSource';
import './ShutterWordmark.css';

const CAP = 100;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const f = n => String(Math.round(n * 100) / 100);
const rect = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
const slant = (x1, y1, x2, y2, t) => `M${x1} ${y1}H${x1 + t}L${x2 + t} ${y2}H${x2}Z`;
const at = (cx, cy, rx, ry, degrees) => {
  const a = degrees * Math.PI / 180;
  return `${f(cx + rx * Math.cos(a))} ${f(cy + ry * Math.sin(a))}`;
};
const band = (cx, cy, rx, ry, tx, ty, a0, a1) => {
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const cw = a1 > a0 ? 1 : 0;
  return `M${at(cx, cy, rx, ry, a0)}A${rx} ${ry} 0 ${large} ${cw} ${at(cx, cy, rx, ry, a1)}L${at(cx, cy, rx - tx, ry - ty, a1)}A${rx - tx} ${ry - ty} 0 ${large} ${1 - cw} ${at(cx, cy, rx - tx, ry - ty, a0)}Z`;
};
const ring = () => 'M0 50A50 50 0 1 1 100 50A50 50 0 1 1 0 50ZM21 50A29 33 0 1 1 79 50A29 33 0 1 1 21 50Z';
const bowl = (x, y, w, h, t, tb) => {
  const ry = h / 2;
  const rx = Math.min(w - t, ry * .95);
  const sx = x + w - rx;
  return `M${x} ${y}H${sx}A${rx} ${ry} 0 0 1 ${sx} ${y + h}H${x}ZM${x + t} ${y + tb}H${sx}A${rx - t} ${ry - tb} 0 0 1 ${sx} ${y + h - tb}H${x + t}Z`;
};
const GLYPHS = {
  '0': { w: 100, d: [ring()] },
  '1': { w: 56, d: ['M5 18 28 0H43V83H56V100H0V83H22V28L5 39Z'] },
  A: { w: 96, d: [slant(37, 0, 0, 100, 23), slant(37, 0, 73, 100, 23), rect(18, 60, 60, 16)] },
  I: { w: 21, d: [rect(0, 0, 21, 100)] },
  C: { w: 90, d: [band(45, 50, 45, 50, 21, 17, -40, -320)] },
  L: { w: 68, d: [rect(0, 0, 19, 100), rect(0, 83, 68, 17)] },
  U: { w: 86, d: [rect(0, 0, 19, 60), rect(67, 0, 19, 60), band(43, 58, 43, 42, 19, 17, 0, 180)] },
  B: { w: 84, d: [rect(0, 0, 19, 100), bowl(0, 0, 78, 52, 19, 17), bowl(0, 35, 84, 65, 19, 17)] },
};
const approach = (from, to, dt) => to + (from - to) * Math.pow(.88, Math.min(dt, .1) * 60);

export default function ShutterWordmark() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const logoTiltRef = useRef(null);
  const logoBaseRef = useRef(null);
  const logoPartsRef = useRef(null);
  const fragmentRefs = useRef([]);
  const pointer = useRef({ x: 50, y: 50, inside: false });
  const logoPose = useRef({ x: 50, y: 50, spread: 0 });
  const wakeRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  const { items, logoX, logoY, width, height } = useMemo(() => {
    let x = 0;
    let y = 0;
    let firstRowWidth = 0;
    const items = Array.from('01 AI CLUB').map((ch, index) => {
      if (compact && index === 5) { firstRowWidth = x - 12; x = 0; y = 124; return { ch: ' ', x, y, w: 0, d: [] }; }
      const glyph = GLYPHS[ch] || { w: 42, d: [] };
      const item = { ch, x, y, ...glyph };
      x += glyph.w + 12;
      return item;
    });
    return { items, logoX: x + 16, logoY: y, width: Math.max(firstRowWidth, x + 116), height: y + CAP };
  }, [compact]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(media.matches); if (media.matches) setExpanded(false); };
    media.addEventListener('change', update);
    const smallScreen = window.matchMedia('(max-width: 600px)');
    const updateCompact = () => setCompact(smallScreen.matches);
    smallScreen.addEventListener('change', updateCompact);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    }, { threshold: .1 });
    observer.observe(rootRef.current);
    return () => { observer.disconnect(); media.removeEventListener('change', update); smallScreen.removeEventListener('change', updateCompact); };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const paint = () => {
      const { x, y, spread } = logoPose.current;
      const dx = (x - 50) / 42;
      const dy = (y - 50) / 42;
      logoTiltRef.current?.setAttribute('transform', `translate(${f(dx * 1.3)} ${f(dy * 1.3)}) rotate(${f(dx * 2.8 - dy * 1.2)} 50 50)`);
      const fragmented = spread >= .01;
      if (logoBaseRef.current) logoBaseRef.current.style.visibility = fragmented ? 'hidden' : 'visible';
      if (logoPartsRef.current) logoPartsRef.current.style.visibility = fragmented ? 'visible' : 'hidden';
      const transforms = [
        `translate(0 ${f(-4.2 * spread)}) rotate(${f(-dx * spread)} 50 50)`,
        `translate(${f(-4.2 * spread)} ${f(2 * spread)}) rotate(${f(-2.2 * spread)} 50 50)`,
        `translate(${f(4.2 * spread)} ${f(2 * spread)}) rotate(${f(2.2 * spread)} 50 50)`,
      ];
      transforms.forEach((transform, i) => fragmentRefs.current[i]?.setAttribute('transform', transform));
    };
    const tick = time => {
      frame = 0;
      if (document.hidden || reduced || !visible) return;
      const dt = last ? (time - last) / 1000 : 1 / 60;
      last = time;
      const p = pointer.current;
      const target = { x: p.inside ? clamp(p.x, 8, 92) : 50, y: p.inside ? clamp(p.y, 8, 92) : 50, spread: expanded ? 1 : 0 };
      const pose = logoPose.current;
      for (const key of ['x', 'y', 'spread']) pose[key] = approach(pose[key], target[key], dt);
      const settled = Math.abs(pose.x - target.x) < .02 && Math.abs(pose.y - target.y) < .02 && Math.abs(pose.spread - target.spread) < .001;
      if (settled) logoPose.current = target;
      paint();
      if (!settled) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && visible && !reduced && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); }
    };
    wakeRef.current = wake;
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    };
    if (reduced || !visible) logoPose.current = { x: 50, y: 50, spread: !reduced && expanded ? 1 : 0 };
    paint();
    wake();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancelAnimationFrame(frame); wakeRef.current = null; document.removeEventListener('visibilitychange', onVisibility); };
  }, [expanded, reduced, visible]);

  const onPointer = event => {
    if (event.pointerType === 'touch') return;
    const r = svgRef.current.getBoundingClientRect();
    const scale = r.width / (width + 16);
    pointer.current = { inside: event.type !== 'pointerleave', x: (event.clientX - r.left) / scale - 8 - logoX, y: (event.clientY - r.top) / scale - 8 - logoY };
    wakeRef.current?.();
  };
  const flip = event => {
    if (reduced) return;
    const node = event.currentTarget.querySelector('.shutter-wordmark__flip');
    node.classList.remove('is-flipping');
    void node.getBoundingClientRect();
    node.classList.add('is-flipping');
  };
  const keyboard = action => event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(event); }
  };
  const toggleLogo = () => { if (!reduced) setExpanded(value => !value); };

  return (
    <div ref={rootRef} className={`shutter-wordmark${seen ? ' is-seen' : ''}`} onPointerMove={onPointer} onPointerLeave={onPointer}>
      <svg ref={svgRef} viewBox={`-8 -8 ${width + 16} ${height + 16}`} role="group" aria-label="01 AI CLUB 互动字标">
        <title>01 AI CLUB</title>
        <defs>
          <clipPath id={`${uid}-up`}><rect x="-40" y="-200" width="400" height="252.6" /></clipPath>
          <clipPath id={`${uid}-down`}><rect x="-40" y="51.4" width="400" height="250" /></clipPath>
          <filter id={`${uid}-logo-ink`} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.07" intercept="-.055" /><feFuncG type="linear" slope="1.07" intercept="-.055" /><feFuncB type="linear" slope="1.07" intercept="-.055" /></feComponentTransfer></filter>
          <mask id={`${uid}-club-logo`} x="0" y="0" width="100" height="100" maskUnits="userSpaceOnUse" style={{ maskType: 'luminance' }}>
            <svg width="100" height="100" viewBox="350 371 561 585"><image href={visible ? imageSource('/lingyi-logo.jpg', 320, 320, Math.min(window.devicePixelRatio || 1, 1.5)) : undefined} width="1254" height="1254" filter={`url(#${uid}-logo-ink)`} /></svg>
          </mask>
          <clipPath id={`${uid}-logo-part-0`}><polygon points="0,0 100,0 50,50" /></clipPath>
          <clipPath id={`${uid}-logo-part-1`}><polygon points="0,0 50,50 50,100 0,100" /></clipPath>
          <clipPath id={`${uid}-logo-part-2`}><polygon points="100,0 100,100 50,100 50,50" /></clipPath>
        </defs>
        {items.filter(item => item.ch !== ' ').map((item, index) => (
          <g key={index} transform={`translate(${item.x} ${item.y})`}>
            <g className="shutter-wordmark__rise" style={{ '--glyph-delay': `${index * 55}ms` }}>
              <g className="shutter-wordmark__glyph" role="button" tabIndex={reduced ? -1 : 0} aria-disabled={reduced || undefined} aria-label={`翻转字形 ${item.ch}`} onClick={flip} onKeyDown={keyboard(flip)}>
                <rect className="shutter-wordmark__hit" width={item.w} height={CAP} />
                <g className="shutter-wordmark__flip" onAnimationEnd={event => event.currentTarget.classList.remove('is-flipping')} aria-hidden="true">
                  <g clipPath={`url(#${uid}-up)`}><g className="shutter-wordmark__half shutter-wordmark__up">{item.d.map((d, i) => <path key={i} d={d} fillRule="evenodd" />)}</g></g>
                  <g clipPath={`url(#${uid}-down)`}><g className="shutter-wordmark__half shutter-wordmark__down">{item.d.map((d, i) => <path key={i} d={d} fillRule="evenodd" />)}</g></g>
                </g>
              </g>
            </g>
          </g>
        ))}
        <g transform={`translate(${logoX} ${logoY})`}>
          <g className="shutter-wordmark__rise" style={{ '--glyph-delay': '440ms' }}>
            <g className="shutter-wordmark__club-logo" role="button" tabIndex={reduced ? -1 : 0} aria-disabled={reduced || undefined} aria-pressed={expanded} aria-label={expanded ? '聚合社团 Logo' : '展开社团 Logo'} onClick={toggleLogo} onKeyDown={keyboard(toggleLogo)}>
              <rect className="shutter-wordmark__hit" width="100" height="100" />
              <g ref={logoTiltRef} aria-hidden="true">
                <rect ref={logoBaseRef} width="100" height="100" mask={`url(#${uid}-club-logo)`} />
                <g ref={logoPartsRef} className="shutter-wordmark__logo-parts">{[0, 1, 2].map(i => <g key={i} ref={el => { fragmentRefs.current[i] = el; }}><g clipPath={`url(#${uid}-logo-part-${i})`}><rect width="100" height="100" mask={`url(#${uid}-club-logo)`} /></g></g>)}</g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

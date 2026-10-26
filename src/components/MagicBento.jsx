/**
 * MagicBento effects adapted from React Bits, Copyright (c) 2026 David Haz.
 * Source commit: e12c22192ac7b4b452c5e2feb9b586d74765d696
 * MIT + Commons Clause; full notice: /licenses/react-bits-magic-bento.txt
 * Local changes: custom article children, monochrome site theme, no card motion
 * or demo visuals, and event-only effects that leave nested controls untouched.
 */
import { Children, cloneElement, isValidElement, useLayoutEffect, useRef } from 'react';
import './MagicBento.css';

export default function MagicBento({
  children,
  items = [],
  renderItem,
  columns = 4,
  rowHeight = 200,
  gap = 12,
  radius = 20,
  theme,
  enableBorderGlow = true,
  enableSpotlight = true,
  spotlightRadius = 300,
  clickEffect = true,
  disableAnimations = false,
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const settingsRef = useRef(null);
  settingsRef.current = {
    enableBorderGlow, enableSpotlight, spotlightRadius: Math.max(40, spotlightRadius),
    clickEffect, disableAnimations,
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1e5, y: -1e5, inside: false };
    const light = { x: -1e5, y: -1e5, near: 0, ready: false };
    const wave = { x: 0, y: 0, t: -1, duration: 1.1, reach: 800 };
    const states = new Map();
    let cards = [];
    let rects = [];
    let bounds = null;
    let dirty = true;
    let raf = 0;
    let last = 0;
    let intersecting = true;
    let pageVisible = !document.hidden;
    const visible = () => intersecting && pageVisible;
    const motion = () => !media.matches && !settingsRef.current.disableAnimations;

    const write = (card, state, name, value) => {
      if (state.written[name] === value) return;
      state.written[name] = value;
      card.style.setProperty(name, value);
    };

    const measure = () => {
      dirty = false;
      bounds = root.getBoundingClientRect();
      rects = cards.map(card => card.getBoundingClientRect());
    };

    const frame = now => {
      raf = 0;
      const dt = Math.min(.05, (now - last) / 1000 || 0);
      last = now;
      if (dirty) measure();
      const settings = settingsRef.current;
      const animated = motion();
      const margin = settings.spotlightRadius * .5;
      const near = pointer.inside && bounds && pointer.x > bounds.left - margin &&
        pointer.x < bounds.right + margin && pointer.y > bounds.top - margin &&
        pointer.y < bounds.bottom + margin ? 1 : 0;
      let busy = false;
      if ((!light.ready || !animated) && near) {
        light.x = pointer.x;
        light.y = pointer.y;
        light.ready = true;
      }
      const follow = animated ? 1 - Math.exp(-dt / .05) : 1;
      light.x += (pointer.x - light.x) * follow;
      light.y += (pointer.y - light.y) * follow;
      const fade = animated ? 1 - Math.exp(-dt / (near > light.near ? .12 : .4)) : 1;
      light.near += (near - light.near) * fade;
      if (Math.abs(near - light.near) < .002) light.near = near;
      else busy = true;
      if (Math.abs(pointer.x - light.x) + Math.abs(pointer.y - light.y) > .3) busy = true;

      let waveRadius = 0;
      let waveAlpha = 0;
      if (wave.t >= 0 && animated && settings.clickEffect) {
        wave.t += dt;
        const progress = Math.min(1, wave.t / wave.duration);
        waveRadius = wave.reach * (1 - Math.pow(1 - progress, 2.2));
        waveAlpha = Math.pow(1 - progress, 1.3);
        if (progress >= 1) wave.t = -1;
        else busy = true;
      } else wave.t = -1;

      cards.forEach((card, index) => {
        const rect = rects[index];
        if (!rect) return;
        let state = states.get(card);
        if (!state) { state = { hot: 0, written: {} }; states.set(card, state); }
        const px = pointer.x - rect.left;
        const py = pointer.y - rect.top;
        const inside = pointer.inside && px >= 0 && py >= 0 && px <= rect.width && py <= rect.height;
        const hotTarget = inside && settings.enableSpotlight ? 1 : 0;
        state.hot += (hotTarget - state.hot) * (animated ? 1 - Math.exp(-dt / (hotTarget > state.hot ? .14 : .32)) : 1);
        if (Math.abs(hotTarget - state.hot) < .002) state.hot = hotTarget;
        else busy = true;
        write(card, state, '--mb-x', `${(light.x - rect.left).toFixed(1)}px`);
        write(card, state, '--mb-y', `${(light.y - rect.top).toFixed(1)}px`);
        write(card, state, '--mb-near', (settings.enableBorderGlow ? light.near : 0).toFixed(3));
        write(card, state, '--mb-hot', state.hot.toFixed(3));
        write(card, state, '--mb-wx', `${(wave.x - rect.left).toFixed(1)}px`);
        write(card, state, '--mb-wy', `${(wave.y - rect.top).toFixed(1)}px`);
        write(card, state, '--mb-wr', `${waveRadius.toFixed(1)}px`);
        write(card, state, '--mb-wa', waveAlpha.toFixed(3));
      });
      if (busy && visible()) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !visible()) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return;
      if (dirty) measure();
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const margin = settingsRef.current.spotlightRadius * .5;
      pointer.inside = Boolean(bounds && pointer.x > bounds.left - margin && pointer.x < bounds.right + margin &&
        pointer.y > bounds.top - margin && pointer.y < bounds.bottom + margin);
      if (pointer.inside || light.near > 0) wake();
    };

    const leave = () => { pointer.inside = false; wake(); };
    const onPointerOut = event => { if (!event.relatedTarget) leave(); };
    const invalidate = () => { dirty = true; wake(); };
    const onClick = event => {
      if (!settingsRef.current.clickEffect || !motion()) return;
      const card = event.target instanceof Element ? event.target.closest('.magic-bento__card') : null;
      if (!card || !cards.includes(card)) return;
      if (dirty) measure();
      const rect = card.getBoundingClientRect();
      wave.x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
      wave.y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
      wave.t = 0;
      wave.reach = Math.max(
        Math.hypot(wave.x - bounds.left, wave.y - bounds.top),
        Math.hypot(wave.x - bounds.right, wave.y - bounds.top),
        Math.hypot(wave.x - bounds.left, wave.y - bounds.bottom),
        Math.hypot(wave.x - bounds.right, wave.y - bounds.bottom),
      ) + 140;
      wake();
    };

    const resizeObserver = new ResizeObserver(invalidate);
    const sync = () => {
      cards = Array.from(root.children).filter(child => child.classList.contains('magic-bento__card'));
      for (const card of states.keys()) if (!cards.includes(card)) states.delete(card);
      resizeObserver.disconnect();
      resizeObserver.observe(root);
      cards.forEach(card => resizeObserver.observe(card));
      invalidate();
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (!visible()) {
        cancelAnimationFrame(raf);
        raf = 0;
        pointer.inside = false;
        wave.t = -1;
      } else invalidate();
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      intersecting = entries.some(entry => entry.isIntersecting);
      onVisibility();
    });
    observer?.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true, capture: true });
    window.addEventListener('resize', invalidate, { passive: true });
    window.addEventListener('blur', leave);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', invalidate);
    // Observe feedback without handling activation or cancelling nested controls.
    root.addEventListener('click', onClick, true);
    engineRef.current = { sync };
    sync();
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', invalidate, true);
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('blur', leave);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', invalidate);
      root.removeEventListener('click', onClick, true);
      engineRef.current = null;
    };
  }, []);

  useLayoutEffect(() => { engineRef.current?.sync(); }, [children, items, rowHeight, gap, radius,
    enableBorderGlow, enableSpotlight, spotlightRadius, clickEffect, disableAnimations]);

  const layers = <>
    {enableSpotlight && <span className="magic-bento__light" aria-hidden="true" />}
    <span className="magic-bento__rim" aria-hidden="true" />
    {(enableBorderGlow || clickEffect) && <span className="magic-bento__border" aria-hidden="true" />}
  </>;
  const content = Children.count(children) ? Children.toArray(children) : items.map((item, index) => (
    <article key={item.id ?? index} className={item.className || ''} style={{
      gridColumn: item.colSpan ? `span ${item.colSpan}` : undefined,
      gridRow: item.rowSpan ? `span ${item.rowSpan}` : undefined,
      ...item.style,
    }}>
      {renderItem ? renderItem(item, index) : item.content ?? <>
        {item.title && <h3>{item.title}</h3>}
        {item.description && <p>{item.description}</p>}
      </>}
    </article>
  ));

  return <div ref={rootRef} className={`magic-bento ${className}`.trim()} data-theme={theme}
    style={{
      '--mb-columns': Math.max(1, Math.round(columns)),
      '--mb-row-height': `${Math.max(1, rowHeight)}px`,
      '--mb-gap': `${Math.max(0, gap)}px`,
      '--mb-radius': `${Math.max(0, radius)}px`,
      '--mb-spot-size': `${Math.max(40, spotlightRadius)}px`,
      '--mb-border-size': `${Math.round(Math.max(40, spotlightRadius) * .75)}px`,
      ...style,
    }}>
    {content.map((child, index) => isValidElement(child) && typeof child.type === 'string'
      ? cloneElement(child, {
        className: [...new Set(`magic-bento__card ${child.props.className || ''}`.trim().split(/\s+/))].join(' '),
      }, child.props.children, layers)
      : <article key={isValidElement(child) ? child.key : index} className="magic-bento__card">{child}{layers}</article>)}
  </div>;
}

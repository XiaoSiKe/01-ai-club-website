/*! @license
 * React Bits DriftWall — David Haz.
 * Source: https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/content/Components/DriftWall/DriftWall.jsx
 * Local adaptations: real-photo input, lifecycle pause, native focus, static reduced motion.
 *
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**
 *
 * What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageLightbox from './ImageLightbox';
import ResponsiveImage from './ResponsiveImage';
import BorderGlow, { clearBorderGlow, updateBorderGlow } from '../BorderGlow';
import './DriftWall.css';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ITEMS = [];
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const columnFactor = (index, variance) => 1 + variance * (((index * 0.6180339887 + 0.35) % 1) * 2 - 1);

function WallImage({ item, active }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="drift-wall__fallback" role="img" aria-label={item.title}>{item.title || '图片暂不可用'}</span> :
    <ResponsiveImage src={item.image} active={active} alt={item.title || ''} draggable={false} onError={() => setFailed(true)} />;
}

export default function DriftWall({
  items = DEFAULT_ITEMS, columns = 5, fillContainer = false, tileWidth = 200, tileHeight = 132,
  gap = 18, radius = 14, tilt = 16, turn = -14, roll = 0, perspective = 1200, depth = 120,
  speed = 42, direction = 'up', variance = 0.45, lift = 0, fade = 0.6,
  dim = 0.55, grayscale = false, brightness = 1, overlayColor = '#060010', entrance = false,
  ariaLabel = '活动照片墙', className = '', lightboxButtonProps, style,
}) {
  const containerRef = useRef(null), planeRef = useRef(null), trackRefs = useRef([]);
  const offsetsRef = useRef([]), velocitiesRef = useRef([]), wakeRef = useRef(null);
  const wallHoveredRef = useRef(false), hoverTileRef = useRef(null), pressedRef = useRef(null);
  const keyboardFocusRef = useRef(false), focusedTileRef = useRef(null), lightboxOpenRef = useRef(false);
  const entrancePlayedRef = useRef(false), entranceFinishRef = useRef(null);
  const entranceRowsRef = useRef(new Set());
  const [size, setSize] = useState({ width: 0, height: 720 });
  const [activeId, setActiveId] = useState(null), [selectedItem, setSelectedItem] = useState(null);
  const openerRef = useRef(null);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const requestedColumns = Math.max(1, Math.floor(columns));
  const visibleColumns = fillContainer && size.width && size.width < 981 ? Math.min(3, requestedColumns) : requestedColumns;
  const displayedWidth = fillContainer && size.width ? size.width / visibleColumns - gap : tileWidth;
  const itemHeight = useCallback(item => item.aspectRatio ? displayedWidth / item.aspectRatio : tileHeight * displayedWidth / tileWidth, [displayedWidth, tileHeight, tileWidth]);
  const finishEntrance = useCallback(() => entranceFinishRef.current?.(), []);

  useLayoutEffect(() => {
    const node = containerRef.current;
    const resize = () => setSize({ width: node.clientWidth, height: node.clientHeight || 720 });
    const observer = new ResizeObserver(resize);
    observer.observe(node); resize();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  const columnItems = useMemo(() => {
    const groups = Array.from({ length: visibleColumns }, () => []);
    const center = Math.floor(visibleColumns / 2);
    const left = Array.from({ length: center }, (_, i) => i);
    const right = Array.from({ length: visibleColumns - center - 1 }, (_, i) => center + 1 + i);
    let portrait = 0, landscape = 0;
    items.forEach(item => {
      const index = item.column === 'center' ? center : item.orientation === 'portrait'
        ? left[portrait++ % left.length] ?? center : right[landscape++ % right.length] ?? center;
      groups[index].push(item);
    });
    return groups;
  }, [items, visibleColumns]);
  const columnMeta = useMemo(() => columnItems.map((group, index) => {
    const copyHeight = Math.max(1, group.reduce((sum, item) => sum + itemHeight(item) + gap, 0));
    return { copyHeight, copies: Math.max(3, Math.ceil(size.height * 1.8 / copyHeight) + 3),
      velocity: speed * columnFactor(index, variance) * (direction === 'up' ? 1 : -1) * (index % 2 ? -1 : 1) };
  }), [columnItems, itemHeight, gap, size.height, speed, variance, direction]);

  useLayoutEffect(() => {
    const plane = planeRef.current;
    if (plane) plane.style.transform = `translate(-50%, -50%) scale(1.06) rotateX(${tilt}deg) rotateY(${turn}deg) rotateZ(${roll}deg) translateZ(${-depth}px)`;
  }, [tilt, turn, roll, depth, reduced, size.width]);

  useLayoutEffect(() => {
    if (reduced || !items.length) return undefined;
    // Establish the loop's first positions before measuring the entrance rows.
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnMeta.map(meta => meta.velocity);
    columnMeta.forEach((meta, c) => {
      if (trackRefs.current[c]) trackRefs.current[c].style.transform = `translate3d(0, ${-(meta.copyHeight + offsetsRef.current[c])}px, 0)`;
    });
  }, [columnMeta, reduced, items.length]);

  useEffect(() => {
    const root = containerRef.current;
    if (reduced || !items.length) return undefined;
    let raf = null, last = null, alive = true;
    const inViewport = () => {
      const rect = root.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    };
    let inView = inViewport();
    const frame = time => {
      raf = null;
      if (!alive || !inView || document.hidden) return;
      const dt = last === null ? 0 : Math.min(0.05, (time - last) / 1000);
      last = time;
      let moving = false;
      columnMeta.forEach((meta, c) => {
        const awaitingEntrance = entrance && !entrancePlayedRef.current && entranceRowsRef.current.size === 0;
        const paused = awaitingEntrance || lightboxOpenRef.current || keyboardFocusRef.current || (wallHoveredRef.current && Number(hoverTileRef.current?.dataset.col) === c);
        const target = paused ? 0 : meta.velocity;
        let velocity = paused ? 0 : velocitiesRef.current[c] + (target - velocitiesRef.current[c]) * (1 - Math.exp(-dt / 0.2));
        if (Math.abs(velocity - target) < 0.01) velocity = target;
        velocitiesRef.current[c] = velocity;
        let phase = offsetsRef.current[c] + velocity * dt;
        if (!keyboardFocusRef.current) phase = (phase % meta.copyHeight + meta.copyHeight) % meta.copyHeight;
        offsetsRef.current[c] = phase;
        if (trackRefs.current[c]) trackRefs.current[c].style.transform = `translate3d(0, ${-(meta.copyHeight + phase)}px, 0)`;
        // A wake starts with dt=0: its target must keep the next frame alive.
        moving ||= velocity !== 0 || target !== 0;
      });
      if (moving) raf = requestAnimationFrame(frame); else last = null;
    };
    const wake = () => {
      if (!alive || document.hidden || raf !== null) return;
      inView = inViewport();
      if (inView) { last = null; raf = requestAnimationFrame(frame); }
    };
    const stop = () => { if (raf !== null) cancelAnimationFrame(raf); raf = null; last = null; };
    // Fragment restoration and dialog closing can outrun observer callbacks.
    // Read the current geometry instead of accepting a delayed visibility flag.
    const checkVisibility = () => { inView = inViewport(); if (inView) wake(); else stop(); };
    const observer = new IntersectionObserver(checkVisibility);
    observer.observe(root);
    const visibility = () => document.hidden ? stop() : checkVisibility();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility);
    wakeRef.current = wake; wake();
    return () => {
      alive = false; stop(); observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      wakeRef.current = null;
    };
  }, [columnMeta, reduced, items.length, entrance]);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!entrance || entrancePlayedRef.current) return undefined;
    if (reduced) {
      entrancePlayedRef.current = true;
      root.dataset.entrance = 'complete';
      return undefined;
    }
    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !items.length) return undefined;
    const rowHeight = bounds.height / 3;
    const rows = Array.from({ length: 3 }, () => []);
    // Read projected positions together, before any card receives its reveal
    // transform. The masonry columns keep their original photo proportions.
    root.querySelectorAll('[data-tile-id]').forEach(tile => {
      const rect = tile.getBoundingClientRect();
      if (rect.bottom <= bounds.top || rect.top >= bounds.bottom || rect.right <= bounds.left || rect.left >= bounds.right) return;
      const row = Math.min(2, Math.floor(Math.max(0, rect.top - bounds.top) / rowHeight));
      rows[row].push({ tile, left: rect.left });
    });
    const triggers = [];
    let completionTimer;
    const clearCards = (resetRows = false) => rows.flat().forEach(({ tile }) => {
      delete tile.dataset.reveal;
      if (resetRows) delete tile.dataset.revealRow;
      tile.style.removeProperty('--dw-reveal-delay');
    });
    const complete = () => {
      clearTimeout(completionTimer);
      entrancePlayedRef.current = true;
      root.dataset.entrance = 'complete';
      triggers.forEach(trigger => trigger.kill());
      clearCards();
      wakeRef.current?.();
    };
    entranceFinishRef.current = complete;
    root.dataset.entrance = 'pending';
    rows.forEach((row, index) => {
      row.sort((a, b) => a.left - b.left).forEach(({ tile }, order) => {
        tile.dataset.revealRow = index;
        tile.dataset.reveal = entranceRowsRef.current.has(index) ? 'visible' : 'pending';
        tile.style.setProperty('--dw-reveal-delay', `${order * 50}ms`);
      });
    });
    const allRowsEntered = () => rows.every((row, index) => !row.length || entranceRowsRef.current.has(index));
    rows.forEach((row, index) => {
      if (!row.length || entranceRowsRef.current.has(index)) return;
      triggers.push(ScrollTrigger.create({
        trigger: root, start: `top+=${index * rowHeight} 88%`, once: true,
        onEnter: () => {
          entranceRowsRef.current.add(index);
          root.dataset.entrance = 'running';
          row.forEach(({ tile }) => { tile.dataset.reveal = 'visible'; });
          wakeRef.current?.();
          if (allRowsEntered()) {
            const longestRow = Math.max(...rows.map(group => group.length));
            completionTimer = window.setTimeout(complete, 600 + (longestRow - 1) * 50);
          }
        },
      }));
    });
    // Resizing preserves rows already revealed instead of hiding them again.
    if (!triggers.length) complete();
    return () => {
      clearTimeout(completionTimer);
      triggers.forEach(trigger => trigger.kill());
      clearCards(true);
      entranceFinishRef.current = null;
    };
  }, [columnMeta, entrance, reduced, items.length]);

  const activate = useCallback(tile => {
    if (hoverTileRef.current !== tile) clearBorderGlow(hoverTileRef.current?.querySelector('.drift-wall__glow'));
    hoverTileRef.current = tile;
    setActiveId(tile?.dataset.tileId || null);
    if (tile) {
      velocitiesRef.current[Number(tile.dataset.col)] = 0;
    }
    wakeRef.current?.();
  }, []);
  const release = useCallback(() => activate(keyboardFocusRef.current ? focusedTileRef.current : null), [activate]);
  const hitTest = useCallback((x, y, target) => {
    const direct = target?.closest?.('[data-tile-id]');
    if (direct && containerRef.current.contains(direct)) return direct;
    let closest = null, distance = Infinity;
    for (const tile of containerRef.current.querySelectorAll('[data-tile-id]')) {
      if (tile.dataset.reveal === 'pending') continue;
      const r = tile.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      const d = Math.hypot(x - r.left - r.width / 2, y - r.top - r.height / 2);
      if (d < distance) { closest = tile; distance = d; }
    }
    return closest;
  }, []);
  const openTile = useCallback(tile => {
    const item = items.find(candidate => candidate.id === tile?.dataset.itemId);
    if (!item || lightboxOpenRef.current) return;
    openerRef.current = tile;
    lightboxOpenRef.current = true;
    pressedRef.current = null;
    setSelectedItem(item);
  }, [items]);

  const renderTile = (item, id, col, duplicate = false) => <button key={id} type="button"
    className={`drift-wall__tile drift-wall__tile--${item.kind || 'photo'}${activeId === id ? ' is-active' : ''}`}
    style={{ '--dw-item-h': `${itemHeight(item)}px`, '--dw-item-aspect': item.aspectRatio || tileWidth / tileHeight }}
    data-tile-id={id} data-item-id={item.id} data-col={col} data-orientation={item.orientation}
    tabIndex={duplicate ? -1 : 0} aria-hidden={duplicate && focusedTileRef.current?.dataset.tileId !== id ? true : undefined}
    aria-label={item.title || '活动照片'} aria-haspopup="dialog"
    onFocus={event => {
      finishEntrance();
      const tile = event.currentTarget;
      focusedTileRef.current = tile;
      tile.removeAttribute('aria-hidden');
      if (!lightboxOpenRef.current && tile.matches(':focus-visible')) {
        keyboardFocusRef.current = true;
        if (!reduced) {
          const meta = columnMeta[col];
          const phase = tile.offsetTop + tile.offsetHeight / 2 - planeRef.current.offsetHeight / 2 - meta.copyHeight;
          offsetsRef.current[col] = phase;
          trackRefs.current[col].style.transform = `translate3d(0, ${-(meta.copyHeight + phase)}px, 0)`;
        }
        activate(tile);
      }
    }}
    onClick={event => { if (event.detail === 0) openTile(event.currentTarget); }}>
      <span className="drift-wall__inner"><WallImage item={item} active={!selectedItem} /><span className="drift-wall__overlay" aria-hidden="true" /></span>
      <BorderGlow as="span" className="media-edge-glow drift-wall__glow" backgroundColor="transparent" borderRadius={radius} glowRadius={24} glowIntensity={2.1} />
  </button>;

  return <>
    <div ref={containerRef} className={`drift-wall${reduced ? ' drift-wall--reduced' : ''}${className ? ` ${className}` : ''}`}
      role="group" aria-label={ariaLabel} data-columns={visibleColumns}
      style={{ '--dw-tile-w': `${displayedWidth}px`, '--dw-gap': `${gap}px`, '--dw-radius': `${radius}px`,
        '--dw-perspective': `${perspective}px`, '--dw-lift': `${lift}px`, '--dw-dim': dim,
        '--dw-gray': Number(grayscale), '--dw-brightness': brightness, '--dw-overlay': overlayColor,
        '--dw-fade-size': `${fade * 20}%`, ...style }}
      onPointerMove={event => {
        if (event.pointerType === 'touch') return;
        wallHoveredRef.current = true;
        const previous = hoverTileRef.current;
        if (previous) {
          const r = previous.getBoundingClientRect();
          if (event.clientX >= r.left - 6 && event.clientX <= r.right + 6 && event.clientY >= r.top - 6 && event.clientY <= r.bottom + 6) {
            updateBorderGlow(previous.querySelector('.drift-wall__glow'), event.clientX, event.clientY);
            return;
          }
        }
        const tile = hitTest(event.clientX, event.clientY, event.target);
        activate(tile);
        updateBorderGlow(tile?.querySelector('.drift-wall__glow'), event.clientX, event.clientY);
      }}
      onPointerDownCapture={event => {
        if (event.button !== 0) return;
        keyboardFocusRef.current = false;
        const tile = hitTest(event.clientX, event.clientY, event.target);
        pressedRef.current = tile ? { tile, x: event.clientX, y: event.clientY } : null;
        if (tile) {
          activate(tile);
          // Keep pointer focus from moving a scrolling tile between down and click.
          if (event.pointerType === 'mouse') event.preventDefault();
        }
      }}
      onPointerCancel={() => { pressedRef.current = null; release(); }}
      onClickCapture={event => {
        if (event.detail === 0) return;
        const pressed = pressedRef.current;
        pressedRef.current = null;
        if (pressed && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 12) return;
        const tile = pressed?.tile || hitTest(event.clientX, event.clientY, event.target);
        if (tile) { finishEntrance(); event.preventDefault(); event.stopPropagation(); openTile(tile); }
      }}
      onPointerLeave={() => { clearBorderGlow(hoverTileRef.current?.querySelector('.drift-wall__glow')); wallHoveredRef.current = false; release(); }}
      onBlurCapture={event => {
        if (event.currentTarget.contains(event.relatedTarget) || lightboxOpenRef.current) return;
        keyboardFocusRef.current = false; focusedTileRef.current = null; release();
      }}>
      {reduced ? <div className="drift-wall__static">
        {columnItems.map((group, c) => <div className="drift-wall__static-col" key={c}>{group.map((item, i) => renderTile(item, `static-${c}-${i}`, c))}</div>)}
      </div> : <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((group, c) => <div className="drift-wall__col" key={c}>
          <div className="drift-wall__track" ref={el => { trackRefs.current[c] = el; }}>
            {Array.from({ length: columnMeta[c].copies }, (_, copy) => group.map((item, i) => renderTile(item, `${c}-${copy}-${i}`, c, copy !== 1)))}
          </div>
        </div>)}
      </div>}
    </div>
    {selectedItem && <ImageLightbox item={selectedItem} opener={openerRef.current} buttonProps={lightboxButtonProps} onClose={() => {
      keyboardFocusRef.current = false;
      wallHoveredRef.current = false;
      pressedRef.current = null;
      lightboxOpenRef.current = false; setSelectedItem(null); release(); wakeRef.current?.();
    }} />}
  </>;
}

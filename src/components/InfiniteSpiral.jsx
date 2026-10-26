/*! @license
 * Adapted from David Haz / React Bits InfiniteSpiral.
 * Source: https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/content/Components/InfiniteSpiral/InfiniteSpiral.jsx
 * Local changes: accessible pause/focus, lifecycle-driven rendering, touch page
 * scrolling, image fallback and a static reduced-motion gallery.
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

import { useEffect, useMemo, useRef, useState } from 'react';
import './InfiniteSpiral.css';

const EMPTY_ITEMS = [];
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min, max, value) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};
const usableHref = href => typeof href === 'string' && /^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(href.trim());

function SpiralImage({ item, index, width, height, imageFit, grayscale }) {
  const [failedSource, setFailedSource] = useState(null);
  return failedSource === item.src ? (
    <span className="infinite-spiral__image-fallback" role="img" aria-label={item.alt}>
      {item.label || item.title || '图片暂不可用'}
    </span>
  ) : (
    <img
      className="infinite-spiral__image"
      src={item.src}
      alt={item.alt}
      width={width}
      height={height}
      loading={index < 6 ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      onError={() => setFailedSource(item.src)}
      style={{ objectFit: imageFit, filter: `grayscale(${clamp(grayscale, 0, 1)})` }}
    />
  );
}

export default function InfiniteSpiral({
  items = EMPTY_ITEMS,
  speed = 0.55,
  direction = 'up',
  animationMode = 'auto',
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  showControls = true,
  imageFit = 'cover',
  grayscale = 1,
  ariaLabel = '活动照片',
  onItemClick,
  className = '',
  style
}) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const wakeRef = useRef(null);
  const focusCardRef = useRef(null);
  const flagsRef = useRef({ hovered: false, focused: false, paused: false });
  const dragRef = useRef({ down: false, active: false, id: -1, x: 0, y: 0, start: 0, touch: false, moved: false });
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const normalizedItems = useMemo(() => (Array.isArray(items) ? items : EMPTY_ITEMS).map((item, index) => {
    const entry = typeof item === 'string' ? { src: item } : item || {};
    return { ...entry, src: entry.src || entry.image, alt: entry.alt || entry.label || entry.title || `活动照片 ${index + 1}` };
  }).filter(item => typeof item.src === 'string' && item.src.trim()), [items]);

  const holdMotion = () => {
    targetProgressRef.current = progressRef.current;
    autoSpeedRef.current = 0;
    wakeRef.current?.();
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !normalizedItems.length) return undefined;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = motionQuery.matches;
    let frameId = 0;
    let alive = true;
    let previousTime = performance.now();
    let bounds = root.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    let lastScrollY = window.scrollY;
    const scrollEnabled = animationMode === 'scroll' || animationMode === 'all';
    const dragEnabled = animationMode === 'drag' || animationMode === 'all';
    const autoEnabled = animationMode === 'auto' || animationMode === 'all';
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    const pausedNow = () => flagsRef.current.paused || flagsRef.current.focused || (pauseOnHover && flagsRef.current.hovered);

    const paint = () => {
      const count = normalizedItems.length;
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / Math.max(cardWidth * 2.8, 1), height / Math.max(cardHeight * 2.35, 1));
      const responsiveRadius = Math.min(radius, Math.max(72, width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);

      // Original React Bits positioning, perspective, edge fade and blur.
      cardRefs.current.forEach((card, index) => {
        if (!card || index >= count) return;
        const offset = modulo(index - progressRef.current + half, count) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + rotation;
        const angleRadians = angle * Math.PI / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(0.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${scale * depthScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
      });
    };

    const render = time => {
      frameId = 0;
      if (!alive || !visible || document.hidden || reduce) return;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const holding = pausedNow() || dragRef.current.down;
      const desiredSpeed = autoEnabled && !holding ? Math.max(speed, 0) * (direction === 'down' ? -1 : 1) : 0;
      autoSpeedRef.current += (desiredSpeed - autoSpeedRef.current) * (1 - Math.exp(-delta * 7));
      if (holding) autoSpeedRef.current = 0;
      targetProgressRef.current += autoSpeedRef.current * delta;
      const blend = 1 - Math.exp(-delta * (dragRef.current.active ? 22 : 11));
      progressRef.current += (targetProgressRef.current - progressRef.current) * blend;
      if (Math.abs(targetProgressRef.current - progressRef.current) < 0.0001) progressRef.current = targetProgressRef.current;
      if (Math.abs(progressRef.current) > normalizedItems.length * 1000) {
        const shift = Math.floor(progressRef.current / normalizedItems.length) * normalizedItems.length;
        progressRef.current -= shift;
        targetProgressRef.current -= shift;
      }
      paint();
      if ((autoEnabled && !holding && speed > 0) || Math.abs(targetProgressRef.current - progressRef.current) > 0.0001 || Math.abs(autoSpeedRef.current) > 0.001) {
        frameId = requestAnimationFrame(render);
      }
    };

    const wake = () => {
      if (frameId || !alive || !visible || document.hidden || reduce) return;
      previousTime = performance.now();
      frameId = requestAnimationFrame(render);
    };
    wakeRef.current = wake;
    focusCardRef.current = index => {
      if (reduce) return;
      const count = normalizedItems.length;
      const offset = modulo(index - progressRef.current + count / 2, count) - count / 2;
      targetProgressRef.current = progressRef.current + offset;
      autoSpeedRef.current = 0;
      wake();
    };

    const stopDragging = () => {
      const pointer = dragRef.current;
      if (!pointer.down) return;
      pointer.down = false;
      pointer.active = false;
      if (root.hasPointerCapture(pointer.id)) root.releasePointerCapture(pointer.id);
      root.removeAttribute('data-dragging');
      wake();
    };
    const onPointerDown = event => {
      dragRef.current.moved = false;
      if (!dragEnabled || reduce || event.button !== 0 || event.target.closest('.infinite-spiral__controls')) return;
      const pointer = dragRef.current;
      Object.assign(pointer, { down: true, active: false, id: event.pointerId, x: event.clientX, y: event.clientY, start: progressRef.current, touch: event.pointerType === 'touch', moved: false });
      targetProgressRef.current = progressRef.current;
      autoSpeedRef.current = 0;
      wake();
    };
    const onPointerMove = event => {
      const pointer = dragRef.current;
      if (!pointer.down || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.active) {
        if (pointer.touch && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { stopDragging(); return; }
        if (Math.abs(pointer.touch ? dx : dy) < 8) return;
        pointer.active = true;
        pointer.moved = true;
        try { root.setPointerCapture(event.pointerId); } catch { stopDragging(); return; }
        root.setAttribute('data-dragging', 'true');
      }
      targetProgressRef.current = pointer.start - (pointer.touch ? dx : dy) / Math.max(verticalSpacing, 1);
      progressRef.current = targetProgressRef.current;
      wake();
    };
    const onClickCapture = event => {
      if (event.detail === 0 || event.target.closest('.infinite-spiral__controls')) {
        dragRef.current.moved = false;
        return;
      }
      if (!dragRef.current.moved) return;
      dragRef.current.moved = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerLeave = () => {
      flagsRef.current.hovered = false;
      if (dragRef.current.down && !dragRef.current.active) stopDragging();
      wake();
    };
    const onBlur = () => { flagsRef.current.hovered = false; stopDragging(); };
    const onScroll = () => {
      const next = window.scrollY;
      const amount = next - lastScrollY;
      lastScrollY = next;
      if (!scrollEnabled || !visible || document.hidden || reduce || pausedNow() || dragRef.current.down || !amount) return;
      targetProgressRef.current += clamp(amount * scrollSpeedMultiplier / Math.max(verticalSpacing * 2, 1), -1.5, 1.5);
      wake();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        stopDragging();
      } else {
        lastScrollY = window.scrollY;
        bounds = root.getBoundingClientRect();
        wake();
      }
    };
    const onMotion = event => {
      reduce = event.matches;
      setReducedMotion(reduce);
      stopDragging();
      if (reduce) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        cardRefs.current.forEach(card => card?.removeAttribute('style'));
      } else { bounds = root.getBoundingClientRect(); wake(); }
    };
    const resizeObserver = new ResizeObserver(() => { bounds = root.getBoundingClientRect(); wake(); });
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(frameId); frameId = 0; stopDragging(); }
      else { bounds = root.getBoundingClientRect(); wake(); }
    }, { threshold: 0.02 });
    intersectionObserver.observe(root);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('pointercancel', stopDragging);
    root.addEventListener('lostpointercapture', stopDragging);
    root.addEventListener('click', onClickCapture, true);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('blur', onBlur);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotion);
    wake();
    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      stopDragging();
      wakeRef.current = null;
      focusCardRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointercancel', stopDragging);
      root.removeEventListener('lostpointercapture', stopDragging);
      root.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotion);
    };
  }, [normalizedItems, speed, direction, animationMode, radius, perspective, cardWidth, cardHeight, verticalSpacing, cardsPerTurn, rotation, cardTilt, centerScale, edgeFade, edgeBlur, pauseOnHover]);

  const focusCard = index => { flagsRef.current.focused = true; holdMotion(); focusCardRef.current?.(index); };
  const dragEnabled = animationMode === 'drag' || animationMode === 'all';
  return (
    <div
      ref={rootRef}
      className={`infinite-spiral${reducedMotion ? ' infinite-spiral--static' : ''}${className ? ` ${className}` : ''}`}
      role="region"
      aria-label={ariaLabel}
      style={{ '--infinite-spiral-card-width': `${cardWidth}px`, '--infinite-spiral-card-height': `${cardHeight}px`, '--infinite-spiral-card-radius': `${cardRadius}px`, perspective: reducedMotion ? undefined : `${perspective}px`, ...style }}
      data-draggable={dragEnabled && !reducedMotion || undefined}
      onPointerEnter={event => {
        if (event.pointerType === 'touch') return;
        flagsRef.current.hovered = true;
        if (pauseOnHover) holdMotion();
      }}
      onPointerMove={event => {
        if (event.pointerType === 'touch' || event.target.closest('.infinite-spiral__controls') || flagsRef.current.hovered) return;
        flagsRef.current.hovered = true;
        if (pauseOnHover) holdMotion();
      }}
      onFocusCapture={() => { flagsRef.current.focused = true; holdMotion(); }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) { flagsRef.current.focused = false; wakeRef.current?.(); }
      }}
    >
      {showControls && !reducedMotion && normalizedItems.length > 0 && (
        <div className="infinite-spiral__controls">
          <button type="button" aria-pressed={paused} aria-label={paused ? '继续播放活动照片' : '暂停播放活动照片'} onClick={() => {
            const next = !paused;
            flagsRef.current.paused = next;
            setPaused(next);
            if (next) holdMotion();
            else {
              // Explicit play resumes even while its control retains focus.
              // Returning to a photo restores hover/focus pause immediately.
              flagsRef.current.focused = false;
              flagsRef.current.hovered = false;
              wakeRef.current?.();
            }
          }}>{paused ? '继续播放' : '暂停播放'}</button>
        </div>
      )}
      <ul className="infinite-spiral__stage" aria-label="活动照片列表">
        {normalizedItems.map((item, index) => {
          const hasHref = usableHref(item.href);
          const Tag = hasHref ? 'a' : !reducedMotion || onItemClick ? 'button' : 'div';
          const external = hasHref && /^https?:\/\//i.test(item.href);
          return (
            <li key={item.id ?? `${item.src}-${index}`} ref={node => { cardRefs.current[index] = node; }} className="infinite-spiral__item">
              <Tag
                className="infinite-spiral__card"
                {...(hasHref ? { href: item.href, target: item.target || (external ? '_blank' : undefined), rel: external ? 'noopener noreferrer' : undefined } : Tag === 'button' ? { type: 'button' } : {})}
                aria-label={hasHref ? item.label || item.alt : Tag === 'button' ? `聚焦：${item.label || item.alt}` : undefined}
                onFocus={() => focusCard(index)}
                onClick={() => { focusCardRef.current?.(index); onItemClick?.(item, index); }}
              >
                <SpiralImage item={item} index={index} width={cardWidth} height={cardHeight} imageFit={imageFit} grayscale={grayscale} />
              </Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

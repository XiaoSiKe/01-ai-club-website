import { useLayoutEffect, useRef, useState } from 'react';
import { atlasFlightTarget, atlasMarkerLabels, atlasMarkerLayout, atlasSpringResponse, fitAtlasCamera, stepAtlasSpring } from './atlasCamera';
import { createAtlasPainter } from './atlasPainter';

const ZERO = { x: 0, y: 0, z: 0 };
const cameraPadding = width => width < 500 ? 42 : 64;

export default function useAtlasCamera({ viewportRef, layerRef, painterRef, markerRefs, entranceRef, points, bounds, reduced, overview, atlas, palette, selectedId, hoveredId, view }) {
  const [size, setSize] = useState({ width: 800, height: 580 });
  const sizeRef = useRef(size);
  const pointsRef = useRef(points);
  const engineRef = useRef(null);
  const renderOptions = useRef(null);
  renderOptions.current = { palette, selectedId, hoveredId, view, entrance: entranceRef.current, reduced, markerBounds: atlas?.bounds.campuses };
  pointsRef.current = points;
  sizeRef.current = size;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    let frame = 0;
    let last = 0;
    let visibilityFrame = 0;
    let visible = false;
    let pose = null;
    let target = null;
    let velocity = { ...ZERO };
    const markerLayouts = new WeakMap();
    const markerSizes = new WeakMap();

    const paint = () => {
      if (!pose) return;
      const k = Math.exp(pose.z);
      const { width, height } = sizeRef.current;
      const dx = width / 2 - pose.x * k;
      const dy = height / 2 - pose.y * k;
      // A wider campus distribution can fit below the original fixed cutoff
      // on small screens. Keep all schools visible in the fitted city view.
      const markerBounds = renderOptions.current.markerBounds;
      const cityScale = markerBounds ? Math.exp(fitAtlasCamera(markerBounds, width, height, cameraPadding(width)).z) : 450;
      const markerMinScale = Math.min(450, cityScale * .95);
      const local = renderOptions.current.view === 'fuzhou' || renderOptions.current.view.startsWith('school:');
      const compact = local && cityScale < 450 && k < 450;
      if (viewport.dataset.compactLabels !== String(compact)) viewport.dataset.compactLabels = String(compact);
      const cacheKey = `${width}:${compact}`;
      const entries = [];
      for (const [id, item] of Object.entries(pointsRef.current || {})) {
        const node = markerRefs.current[id];
        if (!node) continue;
        const x = item.point[0] * k + dx;
        const y = item.point[1] * k + dy;
        const layout = atlasMarkerLayout({ x, y, width, height, scale: k, minScale: Math.min(item.minScale, markerMinScale), preferredSide: item.side, previous: markerLayouts.get(node) });
        markerLayouts.set(node, layout);
        const label = node.querySelector('.branch-atlas__pin-label');
        let dimensions = markerSizes.get(node);
        if (!dimensions || dimensions.key !== cacheKey || dimensions.text !== label.textContent) {
          dimensions = { key: cacheKey, text: label.textContent, width: label.offsetWidth, height: label.offsetHeight };
          markerSizes.set(node, dimensions);
        }
        entries.push({ id, node, label, x, y, layout, width: dimensions.width, height: dimensions.height,
          left: layout.side === 'left' ? x - 18 - dimensions.width : x + 18,
          top: layout.up ? y + 20 - dimensions.height : y - 20 });
      }
      const labels = new Map(atlasMarkerLabels(entries.filter(item => item.layout.visible), height).map(item => [item.id, item]));
      const markerConnectors = entries.flatMap(item => {
        const positioned = labels.get(item.id);
        if (!positioned || Math.abs(positioned.top - item.top) < 6) return [];
        return [{ x: item.x, y: item.y,
          endX: item.layout.side === 'left' ? positioned.left + item.width : positioned.left,
          endY: positioned.top + item.height / 2 }];
      });
      painterRef.current?.paint(pose, sizeRef.current, { ...renderOptions.current, markerConnectors });
      for (const item of entries) {
        const { node, label, x, y, layout } = item;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        node.style.visibility = layout.visible ? 'visible' : 'hidden';
        node.dataset.labelSide = layout.side;
        node.dataset.labelUp = String(layout.up);
        label.style.transform = `translate3d(0,${(labels.get(item.id)?.top ?? item.top) - item.top}px,0)`;
      }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const measureVisibility = () => {
      const rect = viewport.getBoundingClientRect();
      visible = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      viewport.dataset.visible = String(visible);
      return visible;
    };
    const resume = () => {
      if (!pose || !target || frame) return;
      if (pose.x === target.x && pose.y === target.y && pose.z === target.z) return;
      viewport.dataset.moving = 'true';
      frame = requestAnimationFrame(tick);
    };
    const updateVisibility = () => {
      visibilityFrame = 0;
      if (measureVisibility()) resume();
      else { stop(); viewport.dataset.moving = 'false'; }
    };
    const scheduleVisibility = () => { if (!visibilityFrame) visibilityFrame = requestAnimationFrame(updateVisibility); };
    const beforeNavigation = () => {
      // A stale false signal needs a live check. A visible scene keeps its
      // geometry cache, so rapid inputs never flush the pending page layout.
      if (!visible && !document.hidden) measureVisibility();
    };
    const tick = time => {
      frame = 0;
      if (!pose || !target) return;
      const span = Math.min(sizeRef.current.width, sizeRef.current.height);
      const flightTarget = atlasFlightTarget(pose, target, span);
      const response = atlasSpringResponse(pose, flightTarget, span);
      const result = stepAtlasSpring(pose, velocity, flightTarget, last ? (time - last) / 1000 : 1 / 60, response);
      last = time;
      pose = result.position;
      velocity = result.velocity;
      const k = Math.exp(pose.z);
      const settled = Math.abs(pose.x - target.x) * k < .06 && Math.abs(pose.y - target.y) * k < .06 && Math.abs(pose.z - target.z) < .00006;
      if (settled) { pose = { ...target }; velocity = { ...ZERO }; }
      paint();
      if (!settled) frame = requestAnimationFrame(tick);
      else { last = 0; viewport.dataset.moving = 'false'; }
    };
    const snap = () => { if (target) { stop(); pose = { ...target }; velocity = { ...ZERO }; paint(); viewport.dataset.moving = 'false'; } };
    engineRef.current = {
      redraw: paint,
      setTarget(next, instant) {
        target = next;
        if (!pose || instant) { snap(); return; }
        // Visibility is refreshed in the capture phase, before React changes
        // view classes. Reading geometry here would force synchronous layout.
        if (!visible || document.hidden) { stop(); viewport.dataset.moving = 'false'; return; }
        viewport.dataset.moving = 'true';
        paint();
        if (!frame) frame = requestAnimationFrame(tick);
      },
    };
    entranceRef.current.redraw = paint;
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize(current => Math.abs(current.width - width) + Math.abs(current.height - height) < .5 ? current : { width, height });
    });
    resize.observe(viewport);
    const observer = new IntersectionObserver(updateVisibility);
    observer.observe(viewport);
    const root = viewport.closest('.branch-atlas');
    root.addEventListener('pointerdown', beforeNavigation, true);
    root.addEventListener('click', beforeNavigation, true);
    root.addEventListener('keydown', beforeNavigation, true);
    window.addEventListener('scroll', scheduleVisibility, { passive: true });
    window.addEventListener('resize', scheduleVisibility);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => {
      stop(); cancelAnimationFrame(visibilityFrame); resize.disconnect(); observer.disconnect();
      window.removeEventListener('scroll', scheduleVisibility);
      window.removeEventListener('resize', scheduleVisibility);
      document.removeEventListener('visibilitychange', updateVisibility);
      root.removeEventListener('pointerdown', beforeNavigation, true);
      root.removeEventListener('click', beforeNavigation, true);
      root.removeEventListener('keydown', beforeNavigation, true);
      engineRef.current = null;
      entranceRef.current.redraw = null;
    };
  }, [viewportRef, layerRef, painterRef, markerRefs, entranceRef]);

  useLayoutEffect(() => {
    if (!atlas || !layerRef.current) return undefined;
    painterRef.current = createAtlasPainter(layerRef.current, atlas);
    engineRef.current?.redraw();
    return () => { painterRef.current = null; };
  }, [atlas, layerRef, painterRef]);

  useLayoutEffect(() => { engineRef.current?.redraw(); }, [palette, hoveredId]);

  useLayoutEffect(() => {
    if (!bounds) return;
    // Switching sidebar content can resize the map mid-flight. Refit from the
    // live pose and velocity; only initial placement/reduced motion may snap.
    engineRef.current?.setTarget(fitAtlasCamera(bounds, size.width, size.height, cameraPadding(size.width), overview ? 1.21 : 1), reduced);
  }, [bounds, size, reduced, points, overview]);

  return size;
}

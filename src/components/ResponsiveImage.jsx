import { useEffect, useRef, useState } from 'react';
import { imageDimensions, imageSource } from './imageSource';

// All photos share two observers. Infinite walls can contain hundreds of copies;
// a per-copy observer or permanent Image cache would defeat the memory budget.
const images = new Map();
let visibilityObserver, sizeObserver;
const refreshVisibility = () => images.forEach(item => item.update(item));

function observe(node, update) {
  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = images.get(entry.target);
        if (item) { item.near = entry.isIntersecting; item.update(item); }
      });
    }, { rootMargin: '240px' });
    sizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const item = images.get(entry.target);
        if (item) { item.width = entry.contentRect.width; item.height = entry.contentRect.height; item.update(item); }
      });
    });
    document.addEventListener('visibilitychange', refreshVisibility);
  }
  images.set(node, { near: false, width: node.clientWidth, height: node.clientHeight, update });
  visibilityObserver.observe(node);
  sizeObserver.observe(node);
  return () => {
    visibilityObserver.unobserve(node);
    sizeObserver.unobserve(node);
    images.delete(node);
    if (!images.size) {
      visibilityObserver.disconnect();
      sizeObserver.disconnect();
      visibilityObserver = sizeObserver = null;
      document.removeEventListener('visibilitychange', refreshVisibility);
    }
  };
}

export default function ResponsiveImage({ src, active = true, eager = false, maxDpr = 1.5,
  fit = 'contain', decoding = 'async', ...props }) {
  const ref = useRef(null);
  const [candidate, setCandidate] = useState();
  useEffect(() => observe(ref.current, item => {
    const source = !document.hidden && (eager || item.near) && item.width > 0 && item.height > 0
      ? imageSource(src, item.width, item.height, Math.min(window.devicePixelRatio || 1, maxDpr), fit)
      : undefined;
    setCandidate(source);
  }), [src, eager, maxDpr, fit]);

  // Removing src releases the DOM's reference to decoded pixels on leaving the
  // viewport. The browser may keep an evictable cache; we never pin our own copy.
  return <img {...imageDimensions(src)} {...props} ref={ref} src={active ? candidate : undefined}
    decoding={decoding} loading="eager" data-image-managed="" />;
}

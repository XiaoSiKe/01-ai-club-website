import { useEffect, useRef, useState } from 'react';
import { imageDimensions, imageSource } from './imageSource';
import { observeImage } from './imageVisibility';

export default function ResponsiveImage({ src, active = true, eager = false, maxDpr = 1.5,
  fit = 'contain', decoding = 'async', ...props }) {
  const ref = useRef(null);
  const [candidate, setCandidate] = useState();
  useEffect(() => {
    if (!active) { setCandidate(undefined); return undefined; }
    let previous = Symbol('uninitialized');
    return observeImage(ref.current, { eager, update: item => {
      const source = item.ready && item.width > 0 && item.height > 0
        ? imageSource(src, item.width, item.height, Math.min(window.devicePixelRatio || 1, maxDpr), fit)
        : undefined;
      if (source === previous) return;
      previous = source;
      setCandidate(source ? { source, original: src } : undefined);
    } });
  }, [src, active, eager, maxDpr, fit]);

  // Keep a bounded warm margin for reverse scrolling. Hidden tabs, covered
  // walls and images beyond that margin still release their decoded pixels.
  return <img {...imageDimensions(src)} {...props} ref={ref}
    src={active && candidate?.original === src ? candidate.source : undefined}
    decoding={decoding} loading="eager" data-image-managed="" />;
}

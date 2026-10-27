import { useRef, useState } from 'react';
import useViewportReady from './useViewportReady';

// Keep the section's anchor and geometry available before allocating its renderer.
export default function ViewportMount({ children, className, minHeight }) {
  const ref = useRef(null);
  const [staticReady] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const near = useViewportReady(ref, { enabled: !staticReady });
  const ready = staticReady || near;
  return <div ref={ref} className={className} style={{ minHeight }} data-mounted={ready || undefined}>
    {ready ? children : null}
  </div>;
}

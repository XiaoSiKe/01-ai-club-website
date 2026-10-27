import { startTransition, useEffect, useState } from 'react';

// A fragment jump can happen before an observer callback is delivered.
// Make the one-time readiness decision from the element's current position.
export default function useViewportReady(ref, { margin = 500, enabled = true } = {}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready || !enabled || !ref.current) return undefined;
    let requested = false, stopped = false;
    const stop = () => {
      stopped = true;
      observer.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
    const check = () => {
      if (requested || stopped || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      if (r.width > 0 && r.bottom >= -margin && r.top <= innerHeight + margin
        && r.right >= -margin && r.left <= innerWidth + margin) {
        requested = true;
        stop();
        startTransition(() => setReady(true));
      }
    };
    const observer = new IntersectionObserver(check, { rootMargin: `${margin}px` });
    observer.observe(ref.current);
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    return stop;
  }, [ready, enabled, margin, ref]);
  return ready;
}

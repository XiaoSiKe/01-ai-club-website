import { startTransition, useEffect, useState } from 'react';
import { observeViewportReady } from './viewportReadiness';

// A fragment jump can happen before an observer callback is delivered.
// Make the one-time readiness decision from the element's current position.
export default function useViewportReady(ref, { margin = 500, enabled = true } = {}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready || !enabled || !ref.current) return undefined;
    return observeViewportReady(ref.current, margin, () => startTransition(() => setReady(true)));
  }, [ready, enabled, margin, ref]);
  return ready;
}

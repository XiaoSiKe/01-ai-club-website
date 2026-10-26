import { cubicBezier } from 'framer-motion';

const easeOut = cubicBezier(.23, 1, .32, 1);
export const ATLAS_REGION_DURATION = 640;
export const ATLAS_REGION_STAGGER = 24;
export const atlasRevealDuration = count => ATLAS_REGION_DURATION + Math.max(0, count - 1) * ATLAS_REGION_STAGGER;

export function atlasRegionReveal(progress, order, count) {
  const local = Math.max(0, Math.min(1,
    (progress * atlasRevealDuration(count) - order * ATLAS_REGION_STAGGER) / ATLAS_REGION_DURATION));
  const eased = easeOut(local);
  return { opacity: .14 + .86 * eased, offsetY: 18 * (1 - eased), complete: local === 1 };
}

import { branchById, cityById } from '../data/branches.js';

// Camera coordinates use the atlas's projected geographic space. Interpolating
// its centre and log-scale keeps the destination in view throughout a zoom.
export function fitAtlasCamera(bounds, width, height, padding = 56, magnification = 1) {
  const [[x0, y0], [x1, y1]] = bounds;
  const scale = Math.min(Math.max(width - padding * 2, 24) / Math.max(x1 - x0, 1e-6), Math.max(height - padding * 2, 24) / Math.max(y1 - y0, 1e-6));
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: Math.log(scale * magnification) };
}

export function stepAtlasSpring(position, velocity, target, delta, frequency = 10) {
  const dt = Math.min(Math.max(delta, 0), .05);
  const next = {};
  const speed = {};
  for (const key of ['x', 'y', 'z']) {
    const omega = typeof frequency === 'number' ? frequency : frequency[key];
    const decay = Math.exp(-omega * dt);
    const offset = position[key] - target[key];
    const momentum = (velocity[key] + omega * offset) * dt;
    next[key] = target[key] + (offset + momentum) * decay;
    speed[key] = (velocity[key] - omega * momentum) * decay;
  }
  return { position: next, velocity: speed };
}

export function atlasSpringResponse(from, target, viewportSpan = 600) {
  if (Math.abs(target.z - from.z) < .12) return { x: 8.5, y: 8.5, z: 8.5 };
  const distance = Math.hypot(target.x - from.x, target.y - from.y);
  const response = scale => 12 / Math.sqrt(1 + distance * Math.exp(scale) / (viewportSpan * .28));
  // Couple pan/zoom in screen space and recalculate from the live pose. The
  // camera opens its field before departing, then eases into a nearby school.
  return target.z > from.z
    ? { x: 13, y: 13, z: Math.max(2.8, response(target.z)) }
    : { x: Math.max(.9, response(from.z)), y: Math.max(.9, response(from.z)), z: 11 };
}

// Open the field before crossing a large gap between campuses. The limit
// follows the remaining distance, so retargeting keeps the live velocity.
export function atlasFlightTarget(from, target, viewportSpan = 600) {
  const distance = Math.hypot(target.x - from.x, target.y - from.y);
  return { ...target, z: Math.min(target.z, Math.log(viewportSpan * .45 / Math.max(distance, 1e-9))) };
}

// Keep labels near their geographic anchors while separating dense clusters.
export function atlasMarkerLabels(markers, height, gap = 6) {
  const top = 56, bottom = height - 48;
  const overlapX = (a, b) => a.left < b.left + b.width + gap && a.left + a.width + gap > b.left;
  const ordered = [...markers].sort((a, b) => a.top - b.top);
  const placed = [];
  for (const marker of ordered) {
    const y = Math.max(top, marker.top, ...placed.filter(item => overlapX(marker, item)).map(item => item.top + item.height + gap));
    placed.push({ ...marker, top: y });
  }
  for (let i = placed.length - 1; i >= 0; i--) {
    const item = placed[i];
    item.top = Math.min(item.top, bottom - item.height, ...placed.slice(i + 1).filter(next => overlapX(item, next)).map(next => next.top - item.height - gap));
  }
  if (placed.some(item => item.top < top)) {
    const total = ordered.reduce((sum, item) => sum + item.height, 0) + gap * (ordered.length - 1);
    let cursor = Math.max(top, Math.min(bottom - total, ordered.reduce((sum, item) => sum + item.top, 0) / ordered.length - total / 2));
    return ordered.map(item => {
      const positioned = { ...item, top: cursor };
      cursor += item.height + gap;
      return positioned;
    });
  }
  return placed;
}

export const parentAtlasView = view => view.startsWith('school:') ? branchById[view.slice(7)]?.city || 'fujian' : cityById[view] ? 'fujian' : 'china';

const ramp = (value, start, end) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

// Visibility follows the presentation scale, not the navigation destination.
// Adjacent ranges overlap so reversing a zoom never exposes an empty map.
export function atlasLayerOpacity(layer, scale) {
  switch (layer) {
    case 'world': return 1 - ramp(scale, 4, 6);
    case 'china': return 1 - ramp(scale, 24, 32);
    case 'fujian': return ramp(scale, 3.5, 6) * (1 - ramp(scale, 180, 260));
    case 'fuzhou': return ramp(scale, 40, 70) * (1 - ramp(scale, 450, 650));
    case 'local': return ramp(scale, 200, 350);
    default: return 0;
  }
}

export function atlasMarkerLayout({ x, y, width, height, scale, minScale = 0, preferredSide = 'right', previous }) {
  const room = width < 500 ? 100 : 160;
  let side = previous?.side || (x < room ? 'right' : x > width - room ? 'left' : preferredSide);
  // Keep the label on its chosen side until it is genuinely close to an edge.
  // This dead band prevents pointer enter/leave loops during subpixel settling.
  if (side === 'left' && x < room - 16) side = 'right';
  else if (side === 'right' && x > width - room + 16) side = 'left';
  const visible = previous?.visible
    ? x >= 0 && x <= width && y >= 10 && y <= height - 10 && scale >= minScale * .92
    : x >= 12 && x <= width - 12 && y >= 28 && y <= height - 28 && scale >= minScale;
  return {
    visible, side,
    up: previous?.up ? y > height - 96 : y > height - 72,
  };
}

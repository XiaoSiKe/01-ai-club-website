// Observe a moving wall relative to its own clipping frame. A viewport-only
// rootMargin cannot preload images hidden by an intermediate overflow clip.
const groups = new Map();
const images = new Map();
let sizes, roots;

function publish(asset) {
  const allowed = !document.hidden && asset.group.visible;
  const members = [...asset.items];
  asset.ready = allowed && members.some(item => item.eager || item.near || (asset.ready && item.retained));
  // Loop copies share one image. Prepare their equivalent frames together so
  // wrapping or absorbing a focus offset never exposes an unloaded duplicate.
  members.forEach(item => item.update({ ready: asset.ready, width: item.width, height: item.height }));
}

function refresh() {
  groups.forEach(group => group.assets.forEach(publish));
}

function setup() {
  sizes = new ResizeObserver(entries => {
    // ResizeObserver supplies layout sizes without one synchronous layout read
    // per portrait. Only source changes reach React.
    const changed = new Set();
    entries.forEach(entry => {
      const item = images.get(entry.target);
      if (!item) return;
      item.width = entry.contentRect.width;
      item.height = entry.contentRect.height;
      changed.add(item.asset);
    });
    changed.forEach(publish);
  });
  roots = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const group = groups.get(entry.target);
      if (!group) return;
      group.visible = entry.isIntersecting;
      group.assets.forEach(publish);
    });
  }, { rootMargin: '600px' });
  document.addEventListener('visibilitychange', refresh);
}

export function observeImage(node, { source, eager = false, update }) {
  if (!sizes) setup();
  const root = node.closest('[data-image-viewport]');
  let group = groups.get(root);
  if (!group) {
    group = { items: new Set(), assets: new Map(), visible: !root };
    const observer = (field, margin) => new IntersectionObserver(entries => {
      const changed = new Set();
      entries.forEach(entry => {
        const item = images.get(entry.target);
        if (!item || item.group !== group) return;
        item[field] = entry.isIntersecting;
        // Callback ordering is unspecified. Being inside the smaller preload
        // margin also guarantees retention until the larger observer reports.
        if (field === 'near' && item.near) item.retained = true;
        changed.add(item.asset);
      });
      changed.forEach(publish);
    }, { root, rootMargin: `${margin}px` });
    group.load = observer('near', root ? 320 : 500);
    group.retain = observer('retained', root ? 640 : 1000);
    groups.set(root, group);
    if (root) roots.observe(root);
  }
  // Only copies inside the same moving frame share readiness. Ordinary images
  // and separate walls keep independent loading and release boundaries.
  const key = root && source ? source : node;
  let asset = group.assets.get(key);
  if (!asset) {
    asset = { group, items: new Set(), ready: false };
    group.assets.set(key, asset);
  }
  const item = { group, asset, update, eager, near: false, retained: false, width: 0, height: 0 };
  asset.items.add(item);
  images.set(node, item);
  group.items.add(item);
  group.load.observe(node);
  group.retain.observe(node);
  sizes.observe(node);
  let observing = true;
  return () => {
    if (!observing) return;
    observing = false;
    group.load.unobserve(node);
    group.retain.unobserve(node);
    sizes.unobserve(node);
    images.delete(node);
    group.items.delete(item);
    asset.items.delete(item);
    if (!asset.items.size) group.assets.delete(key);
    else publish(asset);
    if (!group.items.size) {
      group.load.disconnect();
      group.retain.disconnect();
      if (root) roots.unobserve(root);
      groups.delete(root);
    }
    if (!images.size) {
      sizes.disconnect();
      roots.disconnect();
      sizes = roots = null;
      document.removeEventListener('visibilitychange', refresh);
    }
  };
}

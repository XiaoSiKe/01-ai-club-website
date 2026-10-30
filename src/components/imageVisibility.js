// Observe a moving wall relative to its own clipping frame. A viewport-only
// rootMargin cannot preload images hidden by an intermediate overflow clip.
const groups = new Map();
const images = new Map();
let sizes, roots;

function publish(item) {
  const allowed = !document.hidden && item.group.visible;
  item.ready = allowed && (item.eager || item.near || (item.ready && item.retained));
  item.update({ ready: item.ready, width: item.width, height: item.height });
}

function refresh() {
  images.forEach(publish);
}

function setup() {
  sizes = new ResizeObserver(entries => {
    // ResizeObserver supplies layout sizes without one synchronous layout read
    // per portrait. Only source changes reach React.
    entries.forEach(entry => {
      const item = images.get(entry.target);
      if (!item) return;
      item.width = entry.contentRect.width;
      item.height = entry.contentRect.height;
      publish(item);
    });
  });
  roots = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const group = groups.get(entry.target);
      if (!group) return;
      group.visible = entry.isIntersecting;
      group.items.forEach(publish);
    });
  }, { rootMargin: '600px' });
  document.addEventListener('visibilitychange', refresh);
}

export function observeImage(node, { eager = false, update }) {
  if (!sizes) setup();
  const root = node.closest('[data-image-viewport]');
  let group = groups.get(root);
  if (!group) {
    group = { items: new Set(), visible: !root };
    const observer = (field, margin) => new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = images.get(entry.target);
        if (!item || item.group !== group) return;
        item[field] = entry.isIntersecting;
        // Callback ordering is unspecified. Being inside the smaller preload
        // margin also guarantees retention until the larger observer reports.
        if (field === 'near' && item.near) item.retained = true;
        publish(item);
      });
    }, { root, rootMargin: `${margin}px` });
    group.load = observer('near', root ? 320 : 500);
    group.retain = observer('retained', root ? 640 : 1000);
    groups.set(root, group);
    if (root) roots.observe(root);
  }
  const item = { group, update, eager, near: false, retained: false, ready: false, width: 0, height: 0 };
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

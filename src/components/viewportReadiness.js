// Deferred sections share observers by margin and one scheduled geometry pass.
// Scroll/hash jumps still get a live check before observer notifications arrive.
const pending = new Set();
const groups = new Map();
let frame = 0;

function schedule() {
  if (pending.size && !frame) frame = requestAnimationFrame(check);
}

function remove(item) {
  if (!pending.delete(item)) return;
  const { group, element, margin } = item;
  const subscribers = group.elements.get(element);
  subscribers.delete(item);
  if (!subscribers.size) {
    group.elements.delete(element);
    group.observer?.unobserve(element);
  }
  if (!group.elements.size) {
    group.observer?.disconnect();
    groups.delete(margin);
  }
  if (!pending.size) {
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  }
}

function check() {
  frame = 0;
  const ready = [];
  const bounds = new Map();
  // Finish every read before callbacks can mount content and change layout.
  for (const item of pending) {
    const { element, margin } = item;
    let rect = bounds.get(element);
    if (!rect) { rect = element.getBoundingClientRect(); bounds.set(element, rect); }
    if (rect.width > 0 && rect.bottom >= -margin && rect.top <= window.innerHeight + margin
      && rect.right >= -margin && rect.left <= window.innerWidth + margin) ready.push(item);
  }
  for (const item of ready) {
    if (!pending.has(item)) continue;
    remove(item);
    item.onReady();
  }
}

export function observeViewportReady(element, margin, onReady) {
  let group = groups.get(margin);
  if (!group) {
    group = {
      elements: new Map(),
      observer: typeof IntersectionObserver === 'undefined' ? null
        : new IntersectionObserver(schedule, { rootMargin: `${margin}px` }),
    };
    groups.set(margin, group);
  }
  const item = { element, margin, onReady, group };
  if (!pending.size) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  pending.add(item);
  if (!group.elements.has(element)) {
    group.elements.set(element, new Set());
    group.observer?.observe(element);
  }
  group.elements.get(element).add(item);
  schedule();
  return () => remove(item);
}

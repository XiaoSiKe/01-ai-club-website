import assert from 'node:assert/strict';
import test from 'node:test';
import { observeImage } from '../src/components/imageVisibility.js';

function browser(t) {
  const observers = [], listeners = new Set(), cleanups = [];
  const originals = new Map(['document', 'IntersectionObserver', 'ResizeObserver']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  globalThis.document = { hidden: false,
    addEventListener(type, fn) { assert.equal(type, 'visibilitychange'); listeners.add(fn); },
    removeEventListener(type, fn) { listeners.delete(fn); } };
  class Observer {
    constructor(callback, options = {}) { this.callback = callback; this.options = options; this.nodes = new Set(); observers.push(this); }
    observe(node) { this.nodes.add(node); }
    unobserve(node) { this.nodes.delete(node); }
    disconnect() { this.disconnected = true; this.nodes.clear(); }
    intersect(node, isIntersecting) { this.callback([{ target: node, isIntersecting }]); }
  }
  globalThis.IntersectionObserver = Observer;
  globalThis.ResizeObserver = Observer;
  t.after(() => { cleanups.forEach(stop => stop()); for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } });
  return { observers, listeners,
    observe(...args) { const stop = observeImage(...args); cleanups.push(stop); return stop; },
    observer(root, margin) { return observers.find(o => o.options.root === root && o.options.rootMargin === `${margin}px`); },
    visible(value) { document.hidden = !value; listeners.forEach(fn => fn()); },
    size(node, width = 100, height = 80) { observers[0].callback([{ target: node, contentRect: { width, height } }]); },
  };
}
const image = root => ({ closest: () => root });

// These cases drive the subscription used by ResponsiveImage, including the
// ordering differences delivered by separate browser observers.
test('a clipped wall preloads relative to its frame and releases when the whole wall leaves', t => {
  const env = browser(t), root = {}, node = image(root); let state;
  const stop = env.observe(node, { update: value => { state = value; } }); t.after(stop);
  env.size(node, 120, 90);
  env.observer(root, 320).intersect(node, true);
  assert.equal(state.ready, false);
  env.observer(undefined, 600).intersect(root, true);
  assert.deepEqual(state, { ready: true, width: 120, height: 90 });
  env.observer(undefined, 600).intersect(root, false);
  assert.equal(state.ready, false);
  env.observer(undefined, 600).intersect(root, true);
  assert.equal(state.ready, true);
});

test('the retention margin prevents boundary churn without loading distant images', t => {
  const env = browser(t), node = image(null); let state;
  const stop = env.observe(node, { update: value => { state = value; } }); t.after(stop);
  env.size(node);
  const load = env.observer(null, 500), retain = env.observer(null, 1000);
  retain.intersect(node, true);
  assert.equal(state.ready, false, 'retention alone must not start a download');
  load.intersect(node, true);
  load.intersect(node, false);
  assert.equal(state.ready, true, 'keep the source for a small reverse scroll');
  retain.intersect(node, false);
  assert.equal(state.ready, false, 'release outside the bounded margin');
  load.intersect(node, true);
  assert.equal(state.ready, true, 're-enter even before retention callback');
});

test('background releases sources including eager images and foreground restores nearby images', t => {
  const env = browser(t), near = image(null), eager = image(null), states = [];
  const stops = [near, eager].map((node, i) => env.observe(node, { eager: i === 1, update: value => { states[i] = value.ready; } }));
  t.after(() => stops.forEach(stop => stop()));
  env.size(near); env.size(eager); env.observer(null, 500).intersect(near, true);
  assert.deepEqual(states, [true, true]);
  env.visible(false); assert.deepEqual(states, [false, false]);
  env.visible(true); assert.deepEqual(states, [true, true]);
});

test('shared subscriptions and all observers are removed on final unmount', t => {
  const env = browser(t), root = {}, nodes = [image(root), image(root)]; let calls = 0;
  const stops = nodes.map(node => env.observe(node, { update: () => calls++ }));
  t.after(() => stops.forEach(stop => stop()));
  assert.equal(env.observers.length, 4);
  assert.equal(env.listeners.size, 1);
  stops[0]();
  assert.equal(env.listeners.size, 1);
  stops[1](); stops[1]();
  assert.equal(env.listeners.size, 0);
  assert.ok(env.observers.every(observer => observer.disconnected));
  env.size(nodes[0]); env.observer(root, 320).intersect(nodes[0], true);
  assert.equal(calls, 0, 'late deliveries must not update unmounted images');
});

test('old observer deliveries do not update a resubscribed image', t => {
  const env = browser(t), root = {}, node = image(root);
  const stop = env.observe(node, { update: () => {} });
  const stale = env.observer(root, 320);
  stop();
  let calls = 0;
  const next = env.observe(node, { update: () => calls++ }); t.after(next);
  stale.intersect(node, true);
  assert.equal(calls, 0);
});

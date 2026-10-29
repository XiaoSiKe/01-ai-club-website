import assert from 'node:assert/strict';
import test from 'node:test';
import { observeViewportReady } from '../src/components/viewportReadiness.js';

function browser(t, observerAvailable = true) {
  const frames = new Map(), listeners = new Map(), observers = [];
  const originals = new Map(['window', 'IntersectionObserver', 'requestAnimationFrame', 'cancelAnimationFrame']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let next = 0;
  globalThis.window = {
    innerWidth: 1000, innerHeight: 800,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
  };
  globalThis.requestAnimationFrame = fn => { frames.set(++next, fn); return next; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  globalThis.IntersectionObserver = observerAvailable ? class {
    constructor(callback, options) { this.callback = callback; this.margin = options.rootMargin; this.nodes = new Set(); observers.push(this); }
    observe(node) { this.nodes.add(node); }
    unobserve(node) { this.nodes.delete(node); }
    disconnect() { this.disconnected = true; this.nodes.clear(); }
  } : undefined;
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return {
    frames, listeners, observers,
    flush() { const tasks = [...frames.values()]; frames.clear(); tasks.forEach(fn => fn()); },
    event(type) { listeners.get(type)?.forEach(fn => fn()); },
  };
}

function element(top, read = () => {}) {
  return { top, reads: 0, getBoundingClientRect() { this.reads++; read(); return { top: this.top, bottom: this.top + 100, left: 0, right: 100, width: 100 }; } };
}

test('shared margins and coalesced scroll/resize checks release all resources', t => {
  const env = browser(t), first = element(2000), second = element(2200), ready = [];
  const stop = [observeViewportReady(first, 500, () => ready.push('first')),
    observeViewportReady(second, 500, () => ready.push('second'))];
  t.after(() => stop.forEach(fn => fn()));
  assert.equal(env.observers.length, 1);
  assert.equal(env.listeners.get('scroll').size, 1);
  for (let i = 0; i < 20; i++) { env.event('scroll'); env.event('resize'); }
  assert.equal(env.frames.size, 1);
  env.flush();
  assert.deepEqual([first.reads, second.reads], [1, 1]);
  assert.equal(ready.length, 0);
  first.top = second.top = 700;
  env.event('scroll'); env.flush();
  assert.deepEqual(ready, ['first', 'second']);
  assert.ok(env.observers[0].disconnected);
  assert.equal(env.listeners.get('scroll').size, 0);
  assert.equal(env.listeners.get('resize').size, 0);
  assert.equal(env.frames.size, 0);
});

test('a fragment jump is detected without an observer notification', t => {
  const env = browser(t), node = element(3000);
  let calls = 0;
  const stop = observeViewportReady(node, 500, () => calls++);
  t.after(stop);
  env.flush();
  node.top = 50;
  env.event('scroll'); env.flush();
  env.event('scroll'); env.flush();
  assert.equal(calls, 1);
});

test('reads precede callbacks, and shared elements are measured only once', t => {
  const env = browser(t), order = [], node = element(900, () => order.push('read'));
  const stop = [observeViewportReady(node, 500, () => { order.push('wide'); node.top = 4000; }),
    observeViewportReady(node, 200, () => order.push('narrow'))];
  t.after(() => stop.forEach(fn => fn()));
  env.flush();
  assert.deepEqual(order, ['read', 'wide', 'narrow']);
  assert.equal(env.observers.length, 2);
  assert.ok(env.observers.every(observer => observer.disconnected));
});

test('unmount cancellation prevents stale readiness and cancels the queued frame', t => {
  const env = browser(t), node = element(0);
  let calls = 0;
  const stop = observeViewportReady(node, 500, () => calls++);
  stop(); stop(); env.flush();
  assert.equal(calls, 0);
  assert.equal(node.reads, 0);
  assert.equal(env.frames.size, 0);
  assert.equal(env.listeners.get('scroll').size, 0);
});

test('scroll readiness also works without IntersectionObserver', t => {
  const env = browser(t, false), node = element(2000);
  let calls = 0;
  const stop = observeViewportReady(node, 100, () => calls++);
  t.after(stop);
  env.flush();
  node.top = 890;
  env.event('scroll'); env.flush();
  assert.equal(calls, 1);
  assert.equal(env.listeners.get('resize').size, 0);
});

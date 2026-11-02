import assert from 'node:assert/strict';
import test from 'node:test';
import { easeLoopPlaybackRate } from '../src/components/loopPlaybackRate.js';

function clock() {
  let time = 0, id = 0;
  const callbacks = new Map();
  return { now: () => time,
    requestFrame: fn => { callbacks.set(++id, fn); return id; },
    cancelFrame: key => callbacks.delete(key),
    advance(ms) { time += ms; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(fn => fn(time)); },
    get pending() { return callbacks.size; },
  };
}
const animation = () => ({ playbackRate: 1, currentTime: 3456, updatePlaybackRate(rate) { this.playbackRate = rate; } });

test('hover slows the actual animation gradually without changing its position', () => {
  const env = clock(), track = animation();
  easeLoopPlaybackRate(track, 0, env);
  assert.equal(track.playbackRate, 1, 'no immediate freeze on pointer entry');
  env.advance(90);
  assert.equal(track.playbackRate, .5);
  assert.equal(track.currentTime, 3456, 'do not seek or restart the loop');
  env.advance(90);
  assert.equal(track.playbackRate, 0);
  assert.equal(env.pending, 0, 'steady or paused loops require no JS frame work');
});

test('rapid pointer reversal resumes from the in-flight speed and cancels old work', () => {
  const env = clock(), track = animation();
  const stop = easeLoopPlaybackRate(track, 0, env);
  env.advance(60);
  const current = track.playbackRate;
  stop();
  easeLoopPlaybackRate(track, 1, env);
  assert.equal(track.playbackRate, current);
  env.advance(90);
  assert.ok(track.playbackRate > current && track.playbackRate < 1);
  env.advance(90);
  assert.equal(track.playbackRate, 1);
  assert.equal(env.pending, 0);
  assert.equal(track.currentTime, 3456);
});

test('unmount cancels the pending interaction frame', () => {
  const env = clock(), track = animation();
  const stop = easeLoopPlaybackRate(track, 0, env);
  stop(); env.advance(200);
  assert.equal(track.playbackRate, 1);
  assert.equal(env.pending, 0);
});

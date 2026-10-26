import assert from 'node:assert/strict';
import { atlasRegionReveal, atlasRevealDuration } from '../src/components/atlasReveal.js';

const count = 35;
assert.equal(atlasRevealDuration(count), 1456);
for (let order = 0; order < count; order++) {
  let previous = atlasRegionReveal(0, order, count);
  assert.equal(previous.complete, false);
  for (let frame = 1; frame <= 180; frame++) {
    const next = atlasRegionReveal(frame / 180, order, count);
    assert.ok(next.opacity >= previous.opacity && next.opacity <= 1, 'A region must never flash or fade backward.');
    assert.ok(next.offsetY <= previous.offsetY && next.offsetY >= 0, 'A region must rise continuously into its final location.');
    previous = next;
  }
  assert.equal(previous.complete, true);
  assert.equal(previous.opacity, 1);
  assert.equal(previous.offsetY, 0);
}
const middle = Array.from({ length: count }, (_, order) => atlasRegionReveal(.5, order, count));
assert.ok(middle.some(region => region.complete) && middle.some(region => !region.complete), 'Regions must appear in staggered order.');
console.log('Atlas reveal verified: 35 regions, monotonic opacity/lift, staggered assembly, exact final geometry.');

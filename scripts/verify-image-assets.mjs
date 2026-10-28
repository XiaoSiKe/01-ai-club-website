import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { imageSource } from '../src/components/imageSource.js';
import { pioneers } from '../src/data/pioneers.js';
import { businesses } from '../src/data/business.js';
import { activityPhotos } from '../src/data/activity-photos.js';
import assets from '../src/data/image-assets.json' with { type: 'json' };

const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const variants = new Map();
function webpSize(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  const kind = buffer.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  if (kind === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  assert.equal(kind, 'VP8 ');
  return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
}
for (const [src, image] of Object.entries(assets)) {
  assert.ok(!/qr|wechat/.test(src), 'QR images must keep their original pixels.');
  assert.ok(existsSync(join(publicRoot, src)));
  assert.equal(createHash('sha256').update(readFileSync(join(publicRoot, src))).digest('hex'), image.sourceHash,
    `${src} changed; run npm run images:build to regenerate its display variants.`);
  assert.ok(image.variants.length > 0);
  let previous = 0;
  for (const variant of image.variants) {
    const buffer = readFileSync(join(publicRoot, variant.src));
    assert.deepEqual(webpSize(buffer), [variant.width, variant.height], variant.src);
    assert.equal(buffer.length, variant.bytes);
    const edge = Math.max(variant.width, variant.height);
    assert.ok(edge > previous && edge <= Math.max(image.width, image.height), variant.src);
    previous = edge;
    variants.set(variant.src, variant);
  }
}
const bytes = src => {
  const image = variants.get(src);
  assert.ok(image, src);
  return image.width * image.height * 4;
};
for (const pioneer of pioneers) {
  assert.ok(bytes(imageSource(pioneer.photo, 44, 44, 1.5)) <= 96 * 96 * 4, pioneer.name);
  assert.ok(bytes(imageSource(pioneer.photo, 160, 200, 1.5)) <= 320 * 320 * 4, pioneer.name);
}
const textureBytes = businesses.reduce((sum, item) => {
  const edge = 280 * (item.imageScale || 1);
  return sum + bytes(imageSource(item.src, edge, edge, 1.5));
}, 0);
assert.ok(textureBytes <= 5 * 480 * 480 * 4, 'Carousel texture budget exceeded.');
// Desktop tunnel cards are at most 270px wide. Keep a 480px step so their
// existing 1.5x sampling target never jumps straight from 320px to 640px.
for (const photo of activityPhotos) {
  assert.ok(assets[photo.src].variants.some(variant => Math.max(variant.width, variant.height) === 480), photo.id);
  const selected = variants.get(imageSource(photo.src, 270, 270 * photo.height / photo.width, 1.5));
  assert.ok(Math.max(selected.width, selected.height) <= 480, photo.id);
  assert.ok(selected.width >= 270 * 1.5, `${photo.id}: tunnel sampling target`);
}
// Intermediate sizes must retain the same sampling density while fitting a
// smaller decoded-pixel budget on both high-DPR phones and desktop screens.
for (const [width, budget] of [[148.2, 2_100_000], [259.2, 6_400_000], [270, 6_600_000]]) {
  const selected = activityPhotos.map(photo => {
    const variant = variants.get(imageSource(photo.src, width, width * photo.height / photo.width, 1.5));
    assert.ok(variant.width >= width * 1.5 - 1, `${photo.id}: preserve tunnel density at ${width}px`);
    return variant;
  });
  assert.ok(selected.reduce((sum, image) => sum + image.width * image.height * 4, 0) <= budget,
    `Tunnel decoded-pixel budget exceeded at ${width}px.`);
}
for (const pioneer of pioneers) {
  assert.ok(bytes(imageSource(pioneer.photo, 80, 100, 1.5)) <= 128 * 128 * 4, `${pioneer.name}: small portrait budget`);
}
assert.equal(imageSource('/images/join-lingyiyang-wechat.jpg', 300, 300), '/images/join-lingyiyang-wechat.jpg');
assert.equal(imageSource('/images/partners/chinamobile.svg', 144, 34), '/images/partners/chinamobile.svg');
console.log(`Image assets verified: ${Object.keys(assets).length} sources, ${variants.size} variants, avatars ≤96px, carousel RGBA ${(textureBytes / 1e6).toFixed(2)} MB before mipmaps.`);

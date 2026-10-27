import assets from '../data/image-assets.json' with { type: 'json' };

// Select by decoded pixels, not compressed bytes. Never ask a high-DPR phone
// to decode a desktop image for a small avatar. QR sources are left untouched.
export function imageSource(src, width, height = Infinity, dpr = 1.5, fit = 'contain') {
  const asset = assets[src];
  if (!asset) return src;
  const scale = fit === 'cover'
    ? Math.max(width / asset.width, height / asset.height)
    : Math.min(width / asset.width, height / asset.height);
  const edge = Math.max(asset.width, asset.height) * scale * dpr;
  return (asset.variants.find(item => Math.max(item.width, item.height) >= edge)
    || asset.variants.at(-1)).src;
}

export function imageDimensions(src) {
  const asset = assets[src];
  return asset ? { width: asset.width, height: asset.height } : {};
}

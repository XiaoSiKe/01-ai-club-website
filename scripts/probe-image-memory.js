/* Evaluate with the generated manifest as the argument through browser CDP.
 * This is decoded RGBA payload, not browser RSS, JS heap or GPU allocation. */
async (manifest = {}) => {
  const dimensions = new Map();
  const fullSources = new Set();
  for (const [source, image] of Object.entries(manifest)) {
    dimensions.set(source, image);
    image.variants.forEach(variant => dimensions.set(variant.src, variant));
    if (/competition\/(certificate|competition)-\d+\.webp$/.test(source)) {
      fullSources.add(source);
      image.variants.forEach(variant => fullSources.add(variant.src));
    }
  }
  const images = new Map();
  const add = (src, fallback) => {
    if (!src) return;
    const path = new URL(src, location.href).pathname;
    const size = dimensions.get(path) || fallback;
    if (size?.width && size?.height) images.set(path, {
      src: path, width: size.width, height: size.height,
      rgbaBytes: size.width * size.height * 4,
    });
  };
  for (const image of document.images) {
    if (image.hasAttribute('src') && image.complete && image.naturalWidth) {
      add(image.currentSrc, { width: image.naturalWidth, height: image.naturalHeight });
    }
  }
  document.querySelectorAll('svg image[href]').forEach(image => add(image.getAttribute('href')));
  // CSS masks do not appear in document.images. Count their selected variants.
  document.querySelectorAll('.home-footer-brand-mark').forEach(node => {
    const mask = getComputedStyle(node).maskImage;
    const match = mask.match(/url\(["']?([^"')]+)/);
    if (match) add(match[1]);
  });
  const requested = performance.getEntriesByType('resource').filter(entry =>
    /\.(webp|avif|png|jpe?g|ico|svg)(\?|$)/i.test(entry.name));
  const fullImages = requested.filter(entry => fullSources.has(new URL(entry.name).pathname));
  const wall = document.querySelector('.drift-wall');
  const loadedWall = wall ? [...wall.querySelectorAll('img[src]')].length : 0;
  const loadedRoster = [...document.querySelectorAll('.dtr img[src]')].length;
  const inLightbox = [...document.querySelectorAll('dialog img[src]')].map(image => new URL(image.currentSrc).pathname);
  return {
    route: location.pathname + location.search + location.hash,
    viewport: [innerWidth, innerHeight], devicePixelRatio, imageCount: images.size,
    estimatedDecodedRGBABytes: [...images.values()].reduce((sum, image) => sum + image.rgbaBytes, 0),
    images: [...images.values()].sort((a, b) => b.rgbaBytes - a.rgbaBytes),
    imageRequests: requested.length, requestedEncodedBytes: requested.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
    originalFullImageRequests: fullImages.map(entry => new URL(entry.name).pathname),
    loadedWall, loadedRoster, inLightbox,
    loadedTunnel: document.querySelectorAll('.tunnel-hero__card img[src]').length,
    brokenImages: [...document.images].filter(image => image.hasAttribute('src') && image.complete && !image.naturalWidth)
      .map(image => image.getAttribute('src')),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
  };
}

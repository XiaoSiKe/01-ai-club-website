/* Run through CDP on a visible moving .drift-wall or .dtr-wall. Checks real
 * clipping, preloaded edge images, sustained blank time and bounded sources. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const root = document.querySelector('[data-image-viewport]');
  if (!root) throw Error('Open a moving photo or pioneer wall first.');
  const initial = performance.now();
  while (performance.now() - initial < 1200) await frame();
  const blankSince = new Map();
  let maxBlankMs = 0, preparedBeyondClip = false, maxSources = 0;
  const started = performance.now();
  while (performance.now() - started < 4000) {
    const now = await frame(), box = root.getBoundingClientRect();
    const sourced = root.querySelectorAll('img[src]');
    maxSources = Math.max(maxSources, sourced.length);
    for (const img of root.querySelectorAll('img')) {
      const r = img.getBoundingClientRect();
      const ready = img.hasAttribute('src') && img.complete && img.naturalWidth > 0;
      if (ready && (r.bottom < box.top || r.top > box.bottom || r.right < box.left || r.left > box.right)) preparedBeyondClip = true;
      const visible = r.bottom > Math.max(0, box.top + 20) && r.top < Math.min(innerHeight, box.bottom - 20)
        && r.right > box.left + 10 && r.left < box.right - 10;
      if (visible && !ready) {
        if (!blankSince.has(img)) blankSince.set(img, now);
        maxBlankMs = Math.max(maxBlankMs, now - blankSince.get(img));
      } else blankSince.delete(img);
    }
  }
  const totalImages = root.querySelectorAll('img').length;
  return { preparedBeyondClip, maxBlankMs, maxSources, totalImages,
    pass: preparedBeyondClip && maxBlankMs < 120 && maxSources < totalImages };
})()

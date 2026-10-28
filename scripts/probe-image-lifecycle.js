/* Run through CDP on a fresh homepage. Hover must not decode full-size photos;
 * one lightbox owns one selected image, and closing/offscreen removes sources. */
async () => {
  const frames = async count => { for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame); };
  const mount = document.querySelector('.research-section__wall');
  if (!mount) throw Error('Open a fresh homepage first.');
  mount.scrollIntoView({ block: 'center', behavior: 'instant' });
  const started = performance.now();
  let wall;
  while (!(wall = mount.querySelector('.drift-wall'))) {
    if (performance.now() - started > 8000) throw Error('Photo wall did not mount.');
    await frames(1);
  }
  await frames(6);
  const tile = wall.querySelector('button[tabindex="0"]');
  const before = new Set(performance.getEntriesByType('resource').map(entry => entry.name));
  tile.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
  await frames(20);
  const hoverRequests = performance.getEntriesByType('resource').filter(entry => !before.has(entry.name)
    && /(?:certificate|competition)-\d+(?:\.webp|-[a-f0-9]{12}-\d+\.webp)/.test(entry.name));
  tile.click();
  const openStarted = performance.now();
  while (!document.querySelector('.image-lightbox__full.is-ready')) {
    if (performance.now() - openStarted > 8000) throw Error('Full image did not load.');
    await frames(1);
  }
  const selected = document.querySelector('.image-lightbox__full');
  const lightboxReady = Boolean(selected.currentSrc && selected.naturalWidth);
  const previewReleased = !document.querySelector('.image-lightbox__preview');
  const coveredWallSources = wall.querySelectorAll('img[src]').length;
  document.querySelector('dialog [aria-label="退出"]').click();
  await frames(4);
  const lightboxReleased = !document.querySelector('dialog');
  const wallRestored = wall.querySelectorAll('img[src]').length > 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
  await frames(6);
  const offscreenSources = wall.querySelectorAll('img[src]').length;
  const noBrokenImages = [...document.images].every(image => !image.hasAttribute('src') || !image.complete || image.naturalWidth > 0);
  return { hoverRequests: hoverRequests.map(entry => entry.name), lightboxReady, previewReleased,
    coveredWallSources, lightboxReleased, wallRestored, offscreenSources, noBrokenImages,
    pass: hoverRequests.length === 0 && lightboxReady && previewReleased && coveredWallSources === 0
      && lightboxReleased && wallRestored && offscreenSources === 0 && noBrokenImages };
}

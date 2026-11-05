/* Run in the local page via CDP. Previews must preserve thumbnails and loop position. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const mount = document.querySelector('.research-section__wall');
  if (!mount) throw Error('Open the homepage first.');
  mount.scrollIntoView({ block: 'center', behavior: 'instant' });
  const loadingStarted = performance.now();
  let wall;
  while (!(wall = mount.querySelector('.drift-wall'))) {
    if (performance.now() - loadingStarted > 8000) throw Error('Photo wall did not mount near the viewport.');
    await frame();
  }
  if (wall.classList.contains('drift-wall--reduced')) throw Error('A moving photo wall is required.');
  wall.scrollIntoView({ block: 'center', behavior: 'instant' });
  const positions = () => [...wall.querySelectorAll('.drift-wall__track')].map(track => track.style.transform);
  const tracks = [...wall.querySelectorAll('.drift-wall__track')];
  const periods = tracks.map(track => {
    const first = track.firstElementChild;
    return [...track.children].find(tile => tile !== first && tile.dataset.itemId === first.dataset.itemId).offsetTop - first.offsetTop;
  });
  const offsets = () => tracks.map(track => new DOMMatrixReadOnly(getComputedStyle(track).transform).m42);
  let sourceRemovals = 0, watchingPreview = false;
  let previewThumbnails = new Set();
  const observer = new MutationObserver(entries => {
    if (watchingPreview) sourceRemovals += entries.filter(entry => previewThumbnails.has(entry.target)
      && entry.oldValue && !entry.target.hasAttribute('src')).length;
  });
  observer.observe(wall, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['src'] });
  try {
    await frames(18);
    const cases = [];
    for (const exit of ['button', 'Escape', 'backdrop']) {
      const clip = wall.getBoundingClientRect();
      previewThumbnails = new Set([...wall.querySelectorAll('img[src]')].filter(img => {
        const box = img.getBoundingClientRect();
        return box.bottom > clip.top && box.top < clip.bottom && box.right > clip.left && box.left < clip.right;
      }));
      watchingPreview = true;
      wall.querySelector('button[tabindex="0"]').click();
      await frames(18);
      const dialog = document.querySelector('dialog[open]');
      if (!dialog) throw Error('Lightbox did not open.');
      const stopped = positions();
      const thumbnailsRetained = wall.querySelectorAll('img[src]').length > 0;
      await frames(6);
      if (positions().some((value, index) => value !== stopped[index])) throw Error('Wall did not stop while viewing an image.');
      const box = wall.getBoundingClientRect(), scroll = scrollY;
      let previous = offsets(), maxStep = 0, blankFrames = 0;
      if (exit === 'button') dialog.querySelector('.image-lightbox__close').click();
      else if (exit === 'Escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      else dialog.click();
      const before = positions();
      for (let i = 0; i < 36; i++) {
        await frame();
        const current = offsets();
        current.forEach((value, index) => {
          const delta = value - previous[index], period = periods[index];
          maxStep = Math.max(maxStep, Math.abs(delta - Math.round(delta / period) * period));
        });
        previous = current;
        if (!wall.querySelector('img[src]')) blankFrames++;
        if (i === 2) watchingPreview = false;
      }
      const moved = positions().map((value, index) => value !== before[index]);
      const after = wall.getBoundingClientRect();
      const layoutStable = Math.abs(after.top - box.top) < 1 && Math.abs(after.width - box.width) < 1 && scrollY === scroll;
      cases.push({ exit, moved, thumbnailsRetained, blankFrames, maxStep, layoutStable, closed: !document.querySelector('dialog[open]') });
    }
    observer.disconnect();
    window.scrollTo({ top: 0, behavior: 'instant' });
    await frames(6);
    const offscreenBounds = wall.getBoundingClientRect();
    const offscreen = offscreenBounds.top >= innerHeight || offscreenBounds.bottom <= 0;
    const paused = positions();
    await frames(6);
    const pausedOffscreen = offscreen && positions().every((value, index) => value === paused[index]);
    wall.scrollIntoView({ block: 'center', behavior: 'instant' });
    await frames(2);
    const beforeReturn = positions();
    await frames(36);
    const resumed = positions().map((value, index) => value !== beforeReturn[index]);
    return { cases, sourceRemovals, visibility: { pausedOffscreen, resumed },
      pass: sourceRemovals === 0 && pausedOffscreen && resumed.every(Boolean) && cases.every(item => item.closed && item.moved.every(Boolean)
        && item.thumbnailsRetained && item.blankFrames === 0 && item.maxStep < 8 && item.layoutStable) };
  } finally { observer.disconnect(); }
})()

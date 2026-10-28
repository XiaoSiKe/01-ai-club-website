/* Run through CDP on a fresh homepage at scrollY=0, with normal motion.
 * Timings are observations, not hardware-independent pass/fail thresholds. */
(async () => {
  if (scrollY > 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    throw Error('Start at the top of a fresh homepage with normal motion.');
  }
  const tasks = [], frames = [];
  const supported = PerformanceObserver.supportedEntryTypes.includes('longtask');
  const observer = supported ? new PerformanceObserver(list => {
    tasks.push(...list.getEntries().map(entry => entry.duration));
  }) : null;
  observer?.observe({ type: 'longtask', buffered: true });
  const started = performance.now();
  let last;
  while (performance.now() - started < 5000) {
    const time = await new Promise(requestAnimationFrame);
    if (last !== undefined) frames.push(time - last);
    last = time;
  }
  observer?.disconnect();
  if (!document.querySelector('.homepage')) throw Error('Homepage did not mount.');
  const images = new Map([...document.images].filter(img => img.complete && img.naturalWidth)
    .map(img => [img.currentSrc, img.naturalWidth * img.naturalHeight * 4]));
  const resources = performance.getEntriesByType('resource');
  const modelRequests = resources.filter(entry => entry.name.includes('/weights/'));
  const background = document.querySelector('.homepage-background canvas');
  const backgroundPixels = background ? background.width * background.height : 0;
  const decodedBytes = [...images.values()].reduce((sum, bytes) => sum + bytes, 0);
  const logo = document.querySelector('.sm-logo-img');
  const criticalImageLoaded = Boolean(logo?.complete && logo.naturalWidth && logo.currentSrc);
  const ready = performance.getEntriesByName('site:first-screen-ready').at(-1);
  const preparedPhotos = resources.filter(entry => entry.name.includes('/assets/images/activity-'));
  const firstScreenPrepared = ready?.detail.images === 13 && preparedPhotos.length === 12
    && preparedPhotos.every(entry => entry.responseEnd <= ready.startTime);
  const deferred = !document.querySelector('.flex-carousel') && !document.querySelector('.drift-wall')
    && !document.querySelector('.folder-root');
  frames.sort((a, b) => a - b);
  return {
    timingSupported: supported,
    maxLongTaskMs: Math.max(0, ...tasks), totalLongTaskMs: tasks.reduce((sum, value) => sum + value, 0),
    frameP95Ms: frames[Math.floor(frames.length * .95)],
    estimatedDecodedImageMB: decodedBytes / 1e6,
    canvasCount: document.querySelectorAll('canvas').length, backgroundPixels,
    initialTunnelImages: document.querySelectorAll('.tunnel-hero__card img[src]').length,
    criticalImageLoaded, firstScreenPrepared,
    modelRequests: modelRequests.length, belowFoldDeferred: deferred,
    pass: modelRequests.length === 0 && backgroundPixels > 0 && backgroundPixels <= 1800000
      && decodedBytes < 1000000 && criticalImageLoaded && firstScreenPrepared && document.querySelectorAll('.tunnel-hero__card img[src]').length === 0 && deferred,
  };
})()

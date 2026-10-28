/* Run via CDP on ?page=pioneers at a phone viewport with normal motion. */
(async () => {
  const loading = performance.now();
  let root;
  while (!(root = document.querySelector('.dtr[data-mode="columns"][data-mobile-columns="4"]'))) {
    if (performance.now() - loading > 8000) throw Error('Mobile Pioneer page did not mount.');
    await new Promise(requestAnimationFrame);
  }
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    throw Error('Open the mobile Pioneer page with normal motion.');
  }
  const tracks = [...root.querySelectorAll('.dtr-track')];
  const columns = [...root.querySelectorAll('.dtr-col')];
  const lines = [...root.querySelectorAll('.dtr-line')].map(line => line.getBoundingClientRect());
  const read = () => tracks.map(track => new DOMMatrixReadOnly(getComputedStyle(track).transform).m42);
  const before = read();
  const started = performance.now();
  while (performance.now() - started < 500) await new Promise(requestAnimationFrame);
  const after = read();
  const singleLine = lines.every(line => Math.abs(line.top - lines[0].top) < 2);
  const fits = lines.every(line => line.left >= 0 && line.right <= innerWidth + 1);
  const deltas = after.map((position, i) => {
    const period = tracks[i].getBoundingClientRect().height / 2;
    const delta = position - before[i];
    return delta > period / 2 ? delta - period : delta < -period / 2 ? delta + period : delta;
  });
  const alternating = deltas.length === 4 && deltas.every((delta, i) => i % 2 ? delta > 1 : delta < -1);
  const bounds = columns.map(column => column.getBoundingClientRect());
  const wall = root.querySelector('.dtr-wall').getBoundingClientRect();
  const fourColumns = bounds.length === 4 && bounds.every((column, i) => column.left >= 0 && column.right <= innerWidth && (!i || column.left > bounds[i - 1].left));
  const titleAbove = root.querySelector('.dtr-title').getBoundingClientRect().bottom <= wall.top;
  const noHorizontalStrip = !root.querySelector('.dtr-strip');
  const wallFits = wall.bottom <= innerHeight + 1;
  return { singleLine, fits, fourColumns, alternating, noHorizontalStrip, titleAbove, wallFits, deltas,
    pass: singleLine && fits && fourColumns && alternating && noHorizontalStrip && titleAbove && wallFits && !root.hasAttribute('data-static') };
})()

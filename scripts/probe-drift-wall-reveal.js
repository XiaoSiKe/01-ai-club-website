/* Run through CDP in a fresh homepage, before the photo wall enters. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const mount = document.querySelector('.research-section__wall');
  if (!mount) throw Error('Open the homepage first.');
  window.scrollTo({ top: scrollY + mount.getBoundingClientRect().top - innerHeight - 200, behavior: 'instant' });
  const loadingStarted = performance.now();
  let wall;
  while (!(wall = mount.querySelector('.drift-wall'))) {
    if (performance.now() - loadingStarted > 8000) throw Error('Photo wall did not mount near the viewport.');
    await frame();
  }
  await frames(3);
  if (wall.classList.contains('drift-wall--reduced')) throw Error('A moving photo wall is required.');
  const tracks = () => [...wall.querySelectorAll('.drift-wall__track')].map(track => track.style.transform);
  const opacity = tile => Number(getComputedStyle(tile).opacity);
  const top = scrollY + wall.getBoundingClientRect().top;
  const rowHeight = wall.getBoundingClientRect().height / 3;
  const rows = [0, 1, 2].map(row => [...wall.querySelectorAll(`[data-reveal-row="${row}"]`)]);
  if (rows.some(row => !row.length)) throw Error('Expected three prepared photo rows.');
  window.scrollTo({ top: top - innerHeight - 90, behavior: 'instant' });
  await frames(3);
  const initialHidden = rows.flat().every(tile => opacity(tile) === 0);
  const samples = [];
  let opacityDrops = 0, intermediateFrames = 0, movingBeforeComplete = false;
  for (let row = 0; row < rows.length; row++) {
    const initialTracks = tracks();
    window.scrollTo({ top: top + row * rowHeight - innerHeight * .88 + 12, behavior: 'instant' });
    const started = performance.now();
    let previous = rows[row].map(opacity);
    while (true) {
      await frame();
      const values = rows[row].map(opacity);
      if (wall.dataset.entrance !== 'complete' && rows.flat().some(tile => opacity(tile) < .98)
        && tracks().some((value, index) => value !== initialTracks[index])) movingBeforeComplete = true;
      values.forEach((value, index) => {
        if (value < previous[index] - .02) opacityDrops++;
        if (value > .02 && value < .98) intermediateFrames++;
      });
      previous = values;
      if (values.every(value => value > .98)) break;
      if (performance.now() - started > 4000) throw Error(`Photo row ${row + 1} did not reveal.`);
    }
    const laterRowsHidden = rows.slice(row + 1).flat().every(tile => opacity(tile) === 0);
    const earlierRowsVisible = rows.slice(0, row + 1).flat().every(tile => opacity(tile) > .98);
    samples.push({ row: row + 1, photos: rows[row].length, laterRowsHidden, earlierRowsVisible,
      tracksMoving: tracks().some((value, index) => value !== initialTracks[index]) });
  }
  const completionStart = performance.now();
  while (wall.dataset.entrance !== 'complete') {
    await frame();
    if (performance.now() - completionStart > 2500) throw Error('Photo wall entrance did not finish.');
  }
  const before = tracks();
  await frames(12);
  const loopResumed = tracks().every((value, index) => value !== before[index]);
  window.scrollTo({ top: top - innerHeight - 90, behavior: 'instant' });
  await frames(3);
  window.scrollTo({ top: top - 100, behavior: 'instant' });
  await frames(3);
  const remainsVisible = rows.flat().every(tile => opacity(tile) === 1 && !tile.hasAttribute('data-reveal'));
  const noOverflow = document.documentElement.scrollWidth <= innerWidth;
  return { initialHidden, samples, movingBeforeComplete, opacityDrops, intermediateFrames, loopResumed, remainsVisible, noOverflow,
    pass: initialHidden && movingBeforeComplete && samples.every(sample => sample.laterRowsHidden && sample.earlierRowsVisible && sample.tracksMoving)
      && opacityDrops === 0 && intermediateFrames > 0 && loopResumed && remainsVisible && noOverflow };
})()

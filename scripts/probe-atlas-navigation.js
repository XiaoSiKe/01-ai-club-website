/* Run through local DevTools/CDP with awaitPromise. Covers list/detail height
 * changes as well as the country/province path used as the smooth reference. */
(async () => {
  const root = document.querySelector('.branch-atlas');
  if (!root) throw Error('Open the homepage with BranchAtlas first');
  const viewport = root.querySelector('.branch-atlas__viewport');
  const canvas = root.querySelector('.branch-atlas__map');
  const frame = () => new Promise(requestAnimationFrame);
  const until = async condition => {
    const started = performance.now();
    while (!condition()) {
      if (performance.now() - started > 8000) throw Error('Atlas navigation probe timed out');
      await frame();
    }
  };
  const click = selector => {
    const node = root.querySelector(selector);
    if (!node) throw Error(`Missing atlas control: ${selector}`);
    node.click();
  };
  const sample = () => ({
    transform: canvas.atlasFrame.transform,
    scale: canvas.atlasFrame.scale,
    height: viewport.clientHeight,
    moving: viewport.dataset.moving === 'true',
    renderMs: canvas.atlasFrame.renderMs,
    drawn: canvas.atlasFrame.drawn,
  });
  root.scrollIntoView({ block: 'center', behavior: 'instant' });
  await until(() => canvas.atlasFrame && root.dataset.entrance === 'complete');
  click('.branch-atlas__toolbar nav li:first-child button');
  await frame();
  await until(() => viewport.dataset.moving === 'false');
  const paths = [
    ['country-to-province', '[aria-label="进入福建分社地图"]'],
    ['province-to-country', '[aria-label="返回上一级地图"]'],
    ['country-list-to-school', '[aria-label="查看福州大学总社"]'],
    ['school-to-city', '[aria-label="返回上一级地图"]'],
    ['city-list-to-school', '[aria-label="查看福建师范大学分社"]'],
    ['school-to-province', '.branch-atlas__toolbar nav li:nth-child(2) button'],
    ['province-to-city', '[aria-label="进入福州高校地图"]'],
    ['city-map-to-another-school', '[aria-label="在地图中查看福建理工大学"]'],
    ['school-to-school', '[aria-label="查看下一所高校"]'],
    ['another-school-to-city', '[aria-label="返回上一级地图"]'],
    ['city-to-province', '[aria-label="返回上一级地图"]'],
    ['province-to-country-again', '[aria-label="返回上一级地图"]'],
    ['country-list-to-zhicheng', '[aria-label="查看福州大学至诚学院分社"]'],
    ['zhicheng-to-city', '[aria-label="返回上一级地图"]'],
    ['city-map-to-zhicheng', '[aria-label="在地图中查看福州大学至诚学院"]'],
    ['zhicheng-to-province', '.branch-atlas__toolbar nav li:nth-child(2) button'],
    ['province-to-country-final', '[aria-label="返回上一级地图"]'],
    ['country-list-to-fit', '[aria-label="查看福州理工学院分社"]'],
    ['fit-to-city', '[aria-label="返回上一级地图"]'],
    ['city-map-to-fit', '[aria-label="在地图中查看福州理工学院"]'],
    ['fit-to-distant-school', '[aria-label="查看下一所高校"]'],
    ['distant-school-to-fit', '[aria-label="查看上一所高校"]'],
    ['fit-to-province', '.branch-atlas__toolbar nav li:nth-child(2) button'],
    ['fit-province-to-country', '[aria-label="返回上一级地图"]'],
  ];
  const report = { paths: [], blankFrames: 0, renderP95: 0 };
  const renderTimes = [];
  for (const [name, selector] of paths) {
    const samples = [sample()];
    const started = performance.now();
    let settledMs;
    click(selector);
    for (let i = 0; i < 480; i++) {
      await frame();
      const next = sample();
      samples.push(next);
      renderTimes.push(next.renderMs);
      if (!next.drawn) report.blankFrames++;
      if (!next.moving && settledMs === undefined) settledMs = performance.now() - started;
      if (i >= 18 && !next.moving) break;
      if (performance.now() - started > 8000) throw Error(`${name} failed to settle`);
    }
    const first = samples[0], last = samples.at(-1);
    const zoom = Math.abs(Math.log(last.scale / first.scale));
    const maxZoomStep = Math.max(...samples.slice(1).map((item, i) => Math.abs(Math.log(item.scale / samples[i].scale))));
    const distinctPoses = new Set(samples.map(item => item.transform)).size;
    const maxZoomStepRatio = zoom > .12 ? maxZoomStep / zoom : 0;
    const listLabel = root.querySelector('.branch-atlas__school-list > .branch-atlas__list-label')?.firstChild.textContent;
    const expectedLabel = { china: '全国高校', fujian: '福建高校', fuzhou: '福州高校' }[root.dataset.view];
    const visibleSchools = root.dataset.view === 'fuzhou' ? [...root.querySelectorAll('.branch-atlas__pin')].filter(node => getComputedStyle(node).visibility === 'visible').length : undefined;
    const markersVisible = visibleSchools === undefined || visibleSchools === root.querySelectorAll('.branch-atlas__school-row').length;
    const labelBoxes = visibleSchools === undefined ? [] : [...root.querySelectorAll('.branch-atlas__pin')].filter(node => getComputedStyle(node).visibility === 'visible').map(node => node.querySelector('.branch-atlas__pin-label').getBoundingClientRect());
    const labelOverlaps = labelBoxes.some((a, index) => labelBoxes.slice(index + 1).some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
    report.paths.push({ name, fromHeight: first.height, toHeight: last.height,
      settledMs: Math.round(settledMs), distinctPoses,
      movingFrames: samples.filter(item => item.moving).length,
      maxZoomStepRatio: Math.round(maxZoomStepRatio * 1000) / 1000,
      listLabel, visibleSchools, labelOverlaps,
      pass: first.height === last.height && distinctPoses > 12 && settledMs >= 180 && maxZoomStepRatio < .25 && listLabel === expectedLabel && markersVisible && !labelOverlaps,
    });
  }
  renderTimes.sort((a, b) => a - b);
  report.renderP95 = renderTimes[Math.floor(renderTimes.length * .95)];
  report.pass = report.blankFrames === 0 && report.paths.every(path => path.pass);
  return report;
})()

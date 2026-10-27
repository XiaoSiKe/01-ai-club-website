/* Run this self-contained probe on the local homepage through browser DevTools
 * or CUA/CDP Runtime.evaluate with awaitPromise. It drives the actual UI and
 * inspects rendered geometry, not a mocked component or a source-code regex.
 */
(async () => {
  const CROSS_ONLY = false;
  let phase = 'school-switches';
  const frame = () => new Promise(requestAnimationFrame);
  const until = async (condition, timeout = 5000) => {
    const started = performance.now();
    while (!condition()) {
      if (performance.now() - started > timeout) throw new Error('Atlas browser probe timed out');
      await frame();
    }
  };
  const root = document.querySelector('.branch-atlas');
  if (!root) throw new Error('Open the homepage with BranchAtlas first');
  root.scrollIntoView({ block: 'center', behavior: 'instant' });
  await until(() => !root.querySelector('.branch-atlas__loading'));
  await frame();
  await until(() => root.dataset.entrance === 'complete');
  const click = node => {
    if (!node) throw new Error('Missing navigation control');
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, button: 0 }));
  };
  click(root.querySelector('.branch-atlas__toolbar nav button'));
  await frame();
  click(root.querySelector('[aria-label="查看福州理工学院分社"]'));
  await until(() => root.dataset.view === 'school');
  await until(() => root.querySelector('.branch-atlas__viewport').dataset.moving === 'false');
  const heading = root.querySelector('.branch-atlas__panel h3');
  const report = { samples: 0, movingFrames: 0, maxRenderedSpan: 0, titleHiddenFrames: 0, sectionTitleHiddenFrames: 0, titleNodeReplacements: 0, idleTitleChanges: 0, detailClippedFrames: 0, detailOverlaps: 0, emptyMapFrames: 0, emptyFrames: [], nonFiniteTransforms: 0, entranceRuns: root.dataset.entranceRuns || '0', schools: [], transitionTimes: {} };
  const sample = (stableTitle = true) => {
    report.samples++;
    if (root.querySelector('.branch-atlas__viewport').dataset.moving === 'true') report.movingFrames++;
    const title = root.querySelector('.branch-atlas__panel h3');
    const style = getComputedStyle(title);
    if (Number(style.opacity) < .99 || style.visibility !== 'visible' || !title.textContent.trim()) report.titleHiddenFrames++;
    const sectionStyle = getComputedStyle(document.querySelector('#cooperation-title'));
    if (Number(sectionStyle.opacity) < .99 || sectionStyle.visibility !== 'visible') report.sectionTitleHiddenFrames++;
    if (stableTitle && title !== heading) report.titleNodeReplacements++;
    const contact = root.querySelector('.branch-atlas__contact');
    if (contact) {
      const c = contact.getBoundingClientRect(), p = root.querySelector('.branch-atlas__panel').getBoundingClientRect();
      const card = root.getBoundingClientRect(), detail = root.querySelector('.branch-atlas__detail').getBoundingClientRect();
      if (c.top < p.top || c.bottom > p.bottom + 1 || c.bottom > card.bottom + 1 || c.left < p.left || c.right > p.right + 1) report.detailClippedFrames++;
      if (c.top < detail.bottom + 16) report.detailOverlaps++;
    }
    const layer = root.querySelector('.branch-atlas__map');
    const rect = layer.getBoundingClientRect();
    report.maxRenderedSpan = Math.max(report.maxRenderedSpan, rect.width, rect.height);
    if (/NaN|Infinity/.test((layer.atlasFrame?.transform || layer.getAttribute('transform')))) report.nonFiniteTransforms++;
    const viewport = root.querySelector('.branch-atlas__viewport').getBoundingClientRect();
    const groups = layer.querySelectorAll('[data-map-layer]');
    if (layer.tagName === 'CANVAS' && (!layer.atlasFrame || layer.atlasFrame.drawn < 1)) report.emptyMapFrames++;
    if (groups.length && !Array.from(groups).some(node => {
      const style = getComputedStyle(node), b = node.getBoundingClientRect();
      return style.display !== 'none' && Number(style.opacity) > .02 && b.width > 0 && b.height > 0 && b.left < viewport.right && b.right > viewport.left && b.top < viewport.bottom && b.bottom > viewport.top;
    })) {
      report.emptyMapFrames++;
      if (report.emptyFrames.length < 8) report.emptyFrames.push({ phase, transform: (layer.atlasFrame?.transform || layer.getAttribute('transform')), layers: Array.from(groups).filter(node => getComputedStyle(node).display !== 'none').map(node => ({ name: node.dataset.mapLayer, opacity: getComputedStyle(node).opacity, bounds: node.getBoundingClientRect().toJSON() })) });
    }
  };
  for (let i = 0; i < (CROSS_ONLY ? 0 : 24); i++) {
    click(root.querySelector(i % 4 === 3 ? '[aria-label="查看上一所高校"]' : '[aria-label="查看下一所高校"]'));
    for (let j = 0; j < 4; j++) { await frame(); sample(); }
    report.schools.push(root.querySelector('.branch-atlas__panel h3').textContent);
  }
  await until(() => root.querySelector('.branch-atlas__viewport').dataset.moving === 'false');
  const idleTitle = root.querySelector('.branch-atlas__panel h3').textContent;
  for (let i = 0; i < (CROSS_ONLY ? 0 : 150); i++) {
    await frame(); sample();
    if (root.querySelector('.branch-atlas__panel h3').textContent !== idleTitle) report.idleTitleChanges++;
  }
  const settleAndSample = async () => {
    const started = performance.now();
    for (let i = 0; i < 240; i++) {
      await frame(); sample(false);
      if (root.querySelector('.branch-atlas__viewport').dataset.moving === 'false') {
        report.transitionTimes[phase] = Math.round(performance.now() - started);
        return;
      }
    }
    throw new Error('Camera failed to settle');
  };
  phase = 'school-to-country';
  click(root.querySelector('.branch-atlas__toolbar nav button'));
  await settleAndSample();
  phase = 'country-to-province';
  click(root.querySelector('[aria-label="进入福建分社地图"]'));
  await settleAndSample();
  phase = 'province-to-city';
  click(root.querySelector('[aria-label="进入福州高校地图"]'));
  await settleAndSample();
  phase = 'city-to-school';
  click(root.querySelector('[aria-label="查看福州理工学院分社"]'));
  await settleAndSample();
  phase = 'interrupted-return';
  click(root.querySelector('.branch-atlas__toolbar nav button'));
  for (let i = 0; i < 8; i++) { await frame(); sample(false); }
  phase = 'redirect-to-school';
  click(root.querySelector('[aria-label="查看福州大学总社"]'));
  await settleAndSample();
  for (const level of ['city', 'province', 'country']) {
    phase = `back-to-${level}`;
    click(root.querySelector('[aria-label="返回上一级地图"]'));
    await settleAndSample();
  }
  report.sectionTitleAnimation = getComputedStyle(document.querySelector('#cooperation-title')).animationName;
  report.entranceRunsAfter = root.dataset.entranceRuns || '0';
  report.pass = report.maxRenderedSpan <= 8192 && report.titleHiddenFrames === 0 && report.sectionTitleHiddenFrames === 0 && report.titleNodeReplacements === 0 && report.emptyMapFrames === 0
    && report.idleTitleChanges === 0 && report.detailClippedFrames === 0 && report.detailOverlaps === 0 && report.nonFiniteTransforms === 0 && report.sectionTitleAnimation === 'none'
    && report.entranceRuns === '1' && report.entranceRunsAfter === '1';
  report.pass = report.pass && (matchMedia('(prefers-reduced-motion: reduce)').matches || report.movingFrames > 100);
  return report;
})()

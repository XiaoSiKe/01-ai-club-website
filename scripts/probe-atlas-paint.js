/* Developer-only browser probe. Run via CUA/CDP and compare before/after. */
(async () => {
  const root = document.querySelector('.branch-atlas');
  const raf = () => new Promise(requestAnimationFrame);
  const until = async fn => { const start = performance.now(); while (!fn()) { if (performance.now() - start > 6000) throw new Error('Atlas paint probe timed out'); await raf(); } };
  window.scrollBy({ top: root.getBoundingClientRect().top - 140, behavior: 'instant' });
  await until(() => !root.querySelector('.branch-atlas__loading'));
  await until(() => root.dataset.entrance === 'complete');
  const click = node => node.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  const viewport = root.querySelector('.branch-atlas__viewport');
  // Reset outside the measured trial; the trial itself exercises six returns.
  click(root.querySelector('.branch-atlas__toolbar nav button'));
  await raf();
  await until(() => viewport.dataset.moving === 'false');
  const frames = [], longFrames = [];
  let sampling = true, last, movingFrames = 0;
  const poses = new Set();
  const sample = time => {
    if (!sampling) return;
    if (last) frames.push(time - last);
    if (viewport.dataset.moving === 'true') movingFrames++;
    poses.add(root.querySelector('.branch-atlas__map').atlasFrame?.transform);
    last = time; requestAnimationFrame(sample);
  };
  let observer;
  let phase = 'setup';
  if (PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
    observer = new PerformanceObserver(list => longFrames.push(...list.getEntries().map(e => ({ phase, start: e.startTime, duration: e.duration, blocking: e.blockingDuration, render: e.renderStart, style: e.styleAndLayoutStart, scripts: e.scripts.map(s=>({ function:s.sourceFunctionName,url:s.sourceURL,invoker:s.invoker,duration:s.duration,forcedLayout:s.forcedStyleAndLayoutDuration })) }))));
    observer.observe({ type: 'long-animation-frame' });
  }
  const settle = async () => { await raf(); await until(() => viewport.dataset.moving === 'false'); };
  const start = performance.now();
  performance.mark('atlas-paint-probe-start');
  requestAnimationFrame(sample);
  phase = 'country-to-school';
  click(root.querySelector('[aria-label="查看闽江大学分社"]'));
  await settle();
  for (let i = 0; i < 12; i++) {
    phase = 'school-switch';
    click(root.querySelector('[aria-label="查看下一所高校"]'));
    for (let j = 0; j < 6; j++) await raf();
  }
  await settle();
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let level = 0; level < 3; level++) { phase = `back-${level}`; click(root.querySelector('[aria-label="返回上一级地图"]')); await settle(); }
    phase = 'country-to-school';
    click(root.querySelector('[aria-label="查看闽江大学分社"]'));
    await settle();
  }
  performance.mark('atlas-paint-probe-end');
  sampling = false; observer?.disconnect();
  const sorted = [...frames].sort((a,b) => a-b);
  const percentile = p => Math.round(sorted[Math.floor((sorted.length - 1) * p)] * 10) / 10;
  const returnLongFrames = longFrames.filter(f => f.phase.startsWith('back-') && f.duration > 50);
  const offscreenEchoRunning = [...document.querySelectorAll('.echo-text')].filter(n => { const r=n.getBoundingClientRect(); return (r.bottom<0||r.top>innerHeight)&&n.dataset.echoAnimating==='true'; }).length;
  return { start, end: performance.now(), hidden: document.hidden, cachedVisible: viewport.dataset.visible, movingFrames, distinctPoses: poses.size, offscreenEchoRunning, returnLongFrames, pass: !document.hidden && movingFrames > 200 && poses.size > 100 && returnLongFrames.length === 0 && offscreenEchoRunning === 0, renderer: root.querySelector('.branch-atlas__map').tagName, samples: frames.length, p50: percentile(.5), p95: percentile(.95), p99: percentile(.99), maximum: Math.max(...frames), over33ms: frames.filter(t=>t>34).length, over50ms: frames.filter(t=>t>51).length, longFrames };
})()

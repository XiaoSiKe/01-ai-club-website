/* Run through local CDP on a fresh homepage with normal motion. All temporary
 * document state is restored; the probe exercises the existing UI interfaces. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const until = async check => {
    const started = performance.now();
    while (!check()) {
      if (performance.now() - started > 8000) throw Error('Site runtime check timed out.');
      await frame();
    }
  };
  if (!document.querySelector('.homepage') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    throw Error('Open a homepage with normal motion.');
  }
  const previousY = scrollY, previousTheme = document.documentElement.dataset.theme;
  const previousFocus = document.activeElement;
  const background = document.querySelector('.homepage-background canvas');
  const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
  const setVisible = () => {
    if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
    else delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  };
  try {
    const themeCanvases = [];
    for (let i = 0; i < 4; i++) {
      document.querySelector('.theme-toggle').click();
      await frames(3);
      themeCanvases.push(document.querySelector('.homepage-background canvas') === background);
    }
    document.getElementById('partners').scrollIntoView({ block: 'center', behavior: 'instant' });
    await until(() => document.querySelector('#partners .logo-marquee[data-offscreen="false"]'));
    const marquee = document.querySelector('#partners .logo-marquee');
    const track = marquee.querySelector('.logo-loop-track');
    const position = () => getComputedStyle(track).transform;
    const before = position();
    await frames(18);
    const visibleMoving = position() !== before;

    window.scrollTo({ top: 0, behavior: 'instant' });
    await until(() => marquee.dataset.offscreen === 'true');
    await frames(3);
    const stopped = position();
    await frames(12);
    const offscreenPaused = position() === stopped && getComputedStyle(track).animationPlayState === 'paused';

    document.getElementById('partners').scrollIntoView({ block: 'center', behavior: 'instant' });
    await until(() => marquee.dataset.offscreen === 'false');
    const returned = position();
    await frames(18);
    const resumed = position() !== returned;

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await frames(4);
    const backgroundPaused = [...document.querySelectorAll('.logo-loop-track')]
      .every(node => getComputedStyle(node).animationPlayState === 'paused');
    setVisible();
    await frames(4);
    const sameBackground = document.querySelector('.homepage-background canvas') === background
      && !background.getContext('webgl2').isContextLost();

    return { themeCanvases, visibleMoving, offscreenPaused, resumed, backgroundPaused, sameBackground,
      pass: themeCanvases.every(Boolean) && visibleMoving && offscreenPaused && resumed && backgroundPaused && sameBackground };
  } finally {
    setVisible();
    if (document.documentElement.dataset.theme !== previousTheme) document.querySelector('.theme-toggle').click();
    window.scrollTo({ top: previousY, behavior: 'instant' });
    previousFocus?.focus({ preventScroll: true });
  }
})()

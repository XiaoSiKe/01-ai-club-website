/* Run via CDP on the homepage with normal motion. Checks the shared button
 * appearance, actual shader updates, settled idle and offscreen GPU disposal. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const waitFor = async check => {
    const started = performance.now();
    while (!check()) {
      if (performance.now() - started > 8000) throw Error('Button renderer did not reach the expected state.');
      await frame();
    }
  };
  if (!document.querySelector('.homepage')) throw Error('Open the homepage first.');
  const previousY = scrollY;
  const previousFocus = document.activeElement;
  const originalDraw = WebGL2RenderingContext.prototype.drawArrays;
  const draws = new Map();
  WebGL2RenderingContext.prototype.drawArrays = function (...args) {
    if (this.canvas.closest('.specular-button')) draws.set(this.canvas, (draws.get(this.canvas) || 0) + 1);
    return originalDraw.apply(this, args);
  };
  try {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const about = [...document.querySelectorAll('.hero-button')].find(button => button.textContent.trim() === '关于我们');
    await waitFor(() => about.querySelector('canvas'));
    const canvas = about.querySelector('canvas');
    const rect = about.getBoundingClientRect();
    const beforePointer = draws.get(canvas) || 0;
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2, pointerType: 'mouse' }));
    await frames(12);
    const pointerUpdates = (draws.get(canvas) || 0) > beforePointer;
    window.dispatchEvent(new Event('blur'));
    about.blur();
    await frames(90);
    const settled = draws.get(canvas) || 0;
    await frames(12);
    const idleStops = (draws.get(canvas) || 0) === settled;
    about.focus({ preventScroll: true });
    await frames(12);
    const focusUpdates = document.activeElement === about && (draws.get(canvas) || 0) > settled;
    about.blur();
    const style = getComputedStyle(about);
    const expected = ['--sb-radius', '--sb-tint', '--sb-tint-opacity', '--sb-blur', '--sb-text-color', '--sb-line-color', '--sb-base-color', 'border-radius', 'background-color', 'font-weight', 'box-shadow']
      .map(name => [name, style.getPropertyValue(name)]);
    const samples = [];
    for (const id of ['business', 'partners', 'cooperation', 'join']) {
      document.getElementById(id).scrollIntoView({ block: 'center', behavior: 'instant' });
      if (id === 'business') await waitFor(() => document.querySelector('.flex-carousel__website canvas'));
      await frames(24);
      const buttons = [...document.querySelectorAll('.specular-button')];
      const sameStyle = buttons.every(button => expected.every(([name, value]) =>
        (name === 'box-shadow' && !button.querySelector('canvas')) || getComputedStyle(button).getPropertyValue(name) === value));
      const resource = id === 'cooperation' ? document.querySelector('.branch-atlas__resource-link') : null;
      resource?.focus({ preventScroll: true });
      const focusStyleMatches = !resource || ['border-radius', 'box-shadow'].every(name =>
        getComputedStyle(resource).getPropertyValue(name) === expected.find(([property]) => property === name)[1]);
      resource?.blur();
      const offscreenReleased = buttons.every(button => {
        const r = button.getBoundingClientRect();
        return !(r.bottom < -220 || r.top > innerHeight + 220) || !button.querySelector('canvas');
      });
      samples.push({ section: id, sameStyle, focusStyleMatches, offscreenReleased, canvases: buttons.filter(button => button.querySelector('canvas')).length });
    }
    const oldContextReleased = !about.querySelector('canvas') && canvas.getContext('webgl2').isContextLost();
    window.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(() => about.querySelector('canvas'));
    const returned = about.querySelector('canvas');
    const returnsWithRenderer = returned !== canvas && !returned.getContext('webgl2').isContextLost();
    return { pointerUpdates, idleStops, focusUpdates, oldContextReleased, returnsWithRenderer, samples,
      pass: pointerUpdates && idleStops && focusUpdates && oldContextReleased && returnsWithRenderer
        && samples.every(sample => sample.sameStyle && sample.focusStyleMatches && sample.offscreenReleased) };
  } finally {
    WebGL2RenderingContext.prototype.drawArrays = originalDraw;
    window.scrollTo({ top: previousY, behavior: 'instant' });
    previousFocus?.focus({ preventScroll: true });
  }
})()

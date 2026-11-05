/* Run through CDP on ?page=pioneers, with normal motion. Exercise the real
 * hover/close handlers on both loop directions, including an interrupted nudge. */
(async () => {
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const root = document.querySelector('.dtr:not([data-static])');
  const wall = root?.querySelector('.dtr-wall');
  if (!wall) throw Error('Open the moving pioneer wall first.');
  await frames(72);
  const results = [];
  for (const column of [...wall.querySelectorAll('.dtr-col')].slice(0, 2)) {
    for (const settleFrames of [3, 24]) {
      for (const exit of ['leave', 'close']) {
        const track = column.querySelector('.dtr-track');
        const animation = track.getAnimations().find(item => /dtr-(up|down)/.test(item.animationName));
        const duration = Number(animation.effect.getTiming().duration);
        const period = track.getBoundingClientRect().height / 2;
        const direction = column.dataset.dir === 'down' ? 1 : -1;
        const card = track.querySelector('.dtr-card');
        const bounds = wall.getBoundingClientRect();
        const delta = bounds.top - 50 - card.getBoundingClientRect().top;
        const next = Number(animation.currentTime) + delta / period * duration * direction;
        root.setAttribute('data-manual', '');
        animation.currentTime = (next % duration + duration) % duration;
        await frames(12);
        root.removeAttribute('data-manual');
        card.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
        await frames(settleFrames);
        const read = () => new DOMMatrixReadOnly(getComputedStyle(track).transform).m42
          + (parseFloat(getComputedStyle(track).translate.split(' ')[1]) || 0);
        const nudge = parseFloat(getComputedStyle(track).translate.split(' ')[1]) || 0;
        let previous = read(), maxStep = 0, travel = 0, blankFrames = 0;
        if (exit === 'close') card.querySelector('.dtr-close').click();
        else card.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: document.body }));
        // Synthetic clicks do not set native pointer modality. Move focus away
        // as a user leaving the wall would, before checking automatic motion.
        if (root.contains(document.activeElement)) document.activeElement.blur();
        const resumedTime = Number(animation.currentTime);
        for (let i = 0; i < 24; i++) {
          await frame();
          const position = read();
          const delta = position - previous;
          const step = delta - Math.round(delta / period) * period;
          maxStep = Math.max(maxStep, Math.abs(step));
          travel += step;
          previous = position;
          const blank = [...track.querySelectorAll('img')].some(img => {
            const box = img.getBoundingClientRect();
            const visible = box.bottom > bounds.top + 20 && box.top < bounds.bottom - 20;
            return visible && (!img.hasAttribute('src') || !img.complete || !img.naturalWidth);
          });
          if (blank) blankFrames++;
        }
        // Compare displacement with the actual CSS clock, so a slow sampling
        // machine cannot be mistaken for a discontinuity in the track.
        const expectedTravel = (Number(animation.currentTime) - resumedTime) / duration * period * direction;
        const continuityError = Math.abs(travel - expectedTravel);
        results.push({ direction, settleFrames, exit, nudge, maxStep, travel, continuityError, blankFrames, resumed: !root.hasAttribute('data-active'),
          pass: Math.abs(nudge) > 1 && continuityError < 1 && travel * direction > 1 && blankFrames === 0 && !root.hasAttribute('data-active') });
      }
    }
  }
  return { results, pass: results.every(result => result.pass) };
})()

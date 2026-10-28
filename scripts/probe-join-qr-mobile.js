/* Run via CDP on a mobile homepage after scrolling #join into view. */
(async () => {
  const cards = [...document.querySelectorAll('.home-join-channel')];
  if (innerWidth > 760 || cards.length !== 3) throw Error('Open the mobile homepage join section.');
  await Promise.all(cards.flatMap(card => card.getAnimations().map(animation => animation.finished)));
  const rects = cards.map(card => card.getBoundingClientRect());
  const sameRow = rects.every(rect => Math.abs(rect.top - rects[0].top) < 1);
  const wallHeight = document.querySelector('.research-section__wall').getBoundingClientRect().height;
  const cases = [];
  for (const card of cards) {
    const opener = card.querySelector('.home-join-qr-button');
    opener.click();
    const started = performance.now();
    let dialog, image;
    while (!(dialog = document.querySelector('.image-lightbox[open]'))
      || !(image = dialog.querySelector('.image-lightbox__full'))?.complete || !image.naturalWidth) {
      if (performance.now() - started > 5000) throw Error('Displayed QR did not load.');
      await new Promise(requestAnimationFrame);
    }
    const save = dialog.querySelector('.image-lightbox__save');
    const close = dialog.querySelector('.image-lightbox__close');
    const controlsFit = [save, close].every(control => {
      const rect = control.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
    });
    const displayedDownload = save.download.endsWith('.png') && save.href.startsWith('blob:') && save.href === image.src;
    const squareCrop = image.naturalWidth === image.naturalHeight;
    close.click();
    await new Promise(requestAnimationFrame);
    cases.push({ displayedDownload, squareCrop, controlsFit,
      closed: !document.querySelector('.image-lightbox[open]'), focusRestored: document.activeElement === opener });
  }
  return { sameRow, wallHeight, cases,
    pass: sameRow && Math.abs(wallHeight - 361.92) < .05 && cases.every(result => Object.values(result).every(Boolean)) };
})()

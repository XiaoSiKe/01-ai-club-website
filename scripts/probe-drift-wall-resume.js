/* Run in the local page via CDP. A fully stopped loop must wake after every exit. */
(async () => {
  const wall = document.querySelector('.drift-wall');
  if (!wall || wall.classList.contains('drift-wall--reduced')) throw Error('A moving photo wall is required.');
  wall.scrollIntoView({ block: 'center', behavior: 'instant' });
  const frame = () => new Promise(requestAnimationFrame);
  const frames = async count => { for (let i = 0; i < count; i++) await frame(); };
  const positions = () => [...wall.querySelectorAll('.drift-wall__track')].map(track => track.style.transform);
  await frames(3);
  const cases = [];
  for (const exit of ['button', 'Escape', 'backdrop']) {
    wall.querySelector('button[tabindex="0"]').click();
    await frames(18);
    const dialog = document.querySelector('dialog[open]');
    if (!dialog) throw Error('Lightbox did not open.');
    const stopped = positions();
    await frames(6);
    if (positions().some((value, index) => value !== stopped[index])) throw Error('Wall did not stop while viewing an image.');
    if (exit === 'button') dialog.querySelector('[aria-label="退出"]').click();
    else if (exit === 'Escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    else dialog.click();
    await frames(2);
    const before = positions();
    await frames(36);
    const moved = positions().map((value, index) => value !== before[index]);
    cases.push({ exit, moved, closed: !document.querySelector('dialog[open]') });
  }
  return { cases, pass: cases.every(item => item.closed && item.moved.every(Boolean)) };
})()

/* Local CDP regression: temporarily simulate document.hidden, then restore its
 * original descriptor even on failure. Never run this on a visitor's page. */
(async () => {
  const frames = async count => { for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame); };
  await frames(6);
  const sources = () => document.querySelectorAll('img[data-image-managed][src]').length;
  const original = Object.getOwnPropertyDescriptor(document, 'hidden');
  const before = sources();
  let hidden;
  try {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await frames(4);
    hidden = sources();
  } finally {
    if (original) Object.defineProperty(document, 'hidden', original);
    else delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  }
  await frames(8);
  const restored = sources();
  return { before, hidden, restored, pass: before > 0 && hidden === 0 && restored > 0 };
})()

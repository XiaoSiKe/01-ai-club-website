/* Run via CDP with #directions visible at a mobile viewport. */
(async () => {
  const frames = async count => { for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame); };
  const folders = [...document.querySelectorAll('.home-explore-folder-frame')];
  if (innerWidth > 760 || folders.length !== 2) throw Error('Open the mobile exploration section.');
  const results = [];
  for (const folder of folders) {
    const root = folder.querySelector('.folder-root');
    if (!root) throw Error('Wait for both folders to mount.');
    const button = folder.querySelector('button[aria-expanded]');
    if (button.getAttribute('aria-expanded') === 'true') { button.click(); await frames(2); }
    const viewport = folder.querySelector('.home-explore-folder-viewport');
    const originalScroll = viewport.scrollLeft;
    viewport.scrollLeft += 20;
    const sample = () => {
      const rect = root.getBoundingClientRect();
      return [rect.x, rect.y, rect.width, rect.height, viewport.scrollLeft, scrollY];
    };
    const before = sample();
    let maxDelta = 0, links = 0, papersVisible = false, papersClickable = false;
    for (const phase of ['open', 'close']) {
      button.click();
      for (let frame = 0; frame < 36; frame++) {
        await frames(1);
        sample().forEach((value, i) => { maxDelta = Math.max(maxDelta, Math.abs(value - before[i])); });
      }
      if (phase === 'open') {
        const papers = [...folder.querySelectorAll('[data-interactive]')];
        links = papers.length;
        papersVisible = papers.every(paper => {
          const rect = paper.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth;
        });
        papersClickable = papers.every(paper => {
          const rect = paper.getBoundingClientRect();
          return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('[data-folder-item]') === paper;
        });
      }
    }
    viewport.scrollLeft = originalScroll;
    results.push({ maxDelta, links, papersVisible, papersClickable, pass: maxDelta < .5 && links > 0 && papersVisible && papersClickable });
  }
  return { results, pass: results.every(result => result.pass) };
})()

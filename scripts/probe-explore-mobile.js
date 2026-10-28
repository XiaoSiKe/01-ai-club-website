/* Run via CDP on the homepage after scrolling #directions into view. */
(async () => {
  const bento = document.querySelector('.home-explore-bento');
  if (!bento || innerWidth > 760) throw Error('Open the mobile homepage exploration section.');
  const started = performance.now();
  while (bento.querySelectorAll('.folder-root').length !== 2) {
    if (performance.now() - started > 5000) throw Error('Both folders must mount near the viewport.');
    await new Promise(requestAnimationFrame);
  }
  const titles = [...bento.querySelectorAll('h3')];
  const fonts = titles.map(title => {
    const style = getComputedStyle(title);
    return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight].join('|');
  });
  const uniformTitles = titles.length === 9 && new Set(fonts).size === 1;
  const descriptionsHidden = [...bento.querySelectorAll('p')].every(p => getComputedStyle(p).display === 'none');
  const folders = [...bento.querySelectorAll('.home-explore-folder-frame')].map(folder => folder.getBoundingClientRect());
  const foldersSeparate = folders[1].top >= folders[0].bottom && Math.abs(folders[0].left - folders[1].left) < 1;
  const height = bento.getBoundingClientRect().height;
  const noOverflow = document.documentElement.scrollWidth <= innerWidth;
  return { uniformTitles, descriptionsHidden, foldersSeparate, height, noOverflow,
    pass: uniformTitles && descriptionsHidden && foldersSeparate && height < 700 && noOverflow };
})()

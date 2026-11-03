/* Run in a loaded page through browser CDP. Checks real text bounds rather than
 * document scrollWidth alone, since the site intentionally clips its backdrop. */
(async () => {
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
  const issues = [];
  const visible = node => {
    const bounds = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return bounds.width > 0 && bounds.height > 0 && style.display !== 'none'
      && style.visibility !== 'hidden' && !node.closest('[aria-hidden="true"]');
  };
  const describe = node => ({
    element: node.className || node.tagName.toLowerCase(),
    text: node.innerText?.trim().replace(/\s+/g, ' ').slice(0, 120),
  });
  const controls = [...document.querySelectorAll('.sm-logo, .language-switcher, .theme-toggle, .sm-toggle, .project-page-brand, .project-back')].filter(visible);
  for (const control of controls) {
    const bounds = control.getBoundingClientRect();
    if (bounds.left < -1 || bounds.right > innerWidth + 1) issues.push({ type: 'header-clipping', ...describe(control) });
  }
  const text = [...document.querySelectorAll('h1, h2, h3, .home-explore-link-copy, .specular-button__label, .research-page__directions section > span, .architecture-workflow li')].filter(visible);
  for (const node of text) {
    if (node.scrollWidth > node.clientWidth + 2) issues.push({ type: 'text-clipping', ...describe(node), width: node.clientWidth, contentWidth: node.scrollWidth });
  }
  for (const menu of [...document.querySelectorAll('.language-menu')].filter(visible)) {
    const bounds = menu.getBoundingClientRect();
    if (bounds.left < 0 || bounds.right > innerWidth || bounds.top < 0 || bounds.bottom > innerHeight) issues.push({ type: 'language-menu-clipping' });
  }
  if (document.documentElement.lang === 'en') {
    for (const paragraph of [...document.querySelectorAll('main p')].filter(visible)) {
      if (/[，。！：]/u.test(paragraph.innerText)) issues.push({ type: 'untranslated-punctuation', ...describe(paragraph) });
    }
  }
  const result = { locale: document.documentElement.lang, width: innerWidth, headings: text.length, controls: controls.length, issues };
  if (issues.length) throw new Error(`Language layout check failed: ${JSON.stringify(result)}`);
  return result;
})();

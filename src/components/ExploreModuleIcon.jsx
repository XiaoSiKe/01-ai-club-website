export function ExploreBookIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <path d="M12 6C9.5 4 6.1 3.7 3 4.5V19c3-1 6.5-.4 9 1.5 2.5-1.9 6-2.5 9-1.5V4.5c-3.1-.8-6.5-.5-9 1.5Z" />
    <path d="M12 6v14.5M6 9c1.1-.1 2.2.1 3 .5M6 12c1.1-.1 2.2.1 3 .5" />
    <g className="home-explore-book-page">
      <path d="M12 6c2.5-2 5.9-2.3 9-1.5V19c-3-1-6.5-.4-9 1.5Z" fill="var(--site-background, #090909)" />
      <path d="M15 9.5c.8-.4 1.9-.6 3-.5M15 12.5c.8-.4 1.9-.6 3-.5" />
    </g>
  </svg>;
}

export default function ExploreModuleIcon({ kind, icon: Icon }) {
  return <span className={`home-explore-module-icon home-explore-module-icon--${kind}`} aria-hidden="true">
    <Icon focusable="false" />
  </span>;
}

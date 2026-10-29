import { useId, useRef, useState } from 'react';
import { searchPioneers } from '../data/pioneers';

export default function PioneerSearch({ onSelect }) {
  const id = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const results = searchPioneers(query);
  const searching = query.trim().length > 0;
  const select = member => {
    setQuery('');
    onSelect(member.id);
  };
  const clear = () => { setQuery(''); inputRef.current?.focus(); };

  return <form className="pioneers-search" role="search" aria-label="领航先锋姓名搜索"
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); clear(); }
    }}
    onSubmit={event => { event.preventDefault(); if (results[0]) select(results[0]); }}>
    <div className="pioneers-search__field">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      <input ref={inputRef} type="search" value={query} placeholder="搜索先锋姓名" aria-label="搜索领航先锋姓名"
        aria-controls={searching ? id : undefined} autoComplete="off" spellCheck={false}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault();
            event.currentTarget.form.querySelector('.pioneers-search__result')?.focus();
          }
        }} />
      <button type="button" className="pioneers-search__clear" hidden={!query} aria-label="清空姓名搜索" onClick={clear}>×</button>
    </div>
    {searching && <div className="pioneers-search__results" id={id}>
      {results.length ? <ul aria-label="匹配的领航先锋">{results.map(member => <li key={member.id}>
        <button type="button" className="pioneers-search__result" onClick={() => select(member)} onKeyDown={event => {
          if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
          event.preventDefault();
          const buttons = [...event.currentTarget.form.querySelectorAll('.pioneers-search__result')];
          const index = buttons.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1);
          (buttons[index] || inputRef.current)?.focus();
        }}>
          <span>{member.name}</span><span>{member.university}</span>
        </button>
      </li>)}</ul> : <p role="status">没有找到相关先锋</p>}
    </div>}
  </form>;
}

import { useLanguage } from '../Language';
import { useId, useRef, useState } from 'react';
import { searchRosterMembers } from '../data/pioneers';

const PIONEER_LABELS = {
  search: '领航先锋姓名搜索',
  input: '搜索领航先锋姓名',
  placeholder: '搜索先锋姓名',
  results: '匹配的领航先锋',
  empty: '没有找到相关先锋',
};

export default function PioneerSearch({ members, onSelect, labels = PIONEER_LABELS }) {
  const { t } = useLanguage();
  const id = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const results = searchRosterMembers(members, query, t);
  const searching = query.trim().length > 0;
  const select = member => {
    setQuery('');
    onSelect(member.id);
  };
  const clear = () => { setQuery(''); inputRef.current?.focus(); };

  return <form className="pioneers-search" role="search" aria-label={t(labels.search)}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); clear(); }
    }}
    onSubmit={event => { event.preventDefault(); if (results[0]) select(results[0]); }}>
    <div className="pioneers-search__field">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      <input ref={inputRef} type="search" value={query} placeholder={t(labels.placeholder)} aria-label={t(labels.input)}
        aria-controls={searching ? id : undefined} autoComplete="off" spellCheck={false}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault();
            event.currentTarget.form.querySelector('.pioneers-search__result')?.focus();
          }
        }} />
      <button type="button" className="pioneers-search__clear" hidden={!query} aria-label={t("清空姓名搜索")} onClick={clear}>×</button>
    </div>
    {searching && <div className="pioneers-search__results" id={id}>
      {results.length ? <ul aria-label={t(labels.results)}>{results.map(member => <li key={member.id}>
        <button type="button" className="pioneers-search__result" onClick={() => select(member)} onKeyDown={event => {
          if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
          event.preventDefault();
          const buttons = [...event.currentTarget.form.querySelectorAll('.pioneers-search__result')];
          const index = buttons.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1);
          (buttons[index] || inputRef.current)?.focus();
        }}>
          <span>{t(member.name)}</span><span>{t(member.role || member.university)}</span>
        </button>
      </li>)}</ul> : <p role="status">{t(labels.empty)}</p>}
    </div>}
  </form>;
}

import { useLanguage } from '../Language';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { branches, branchById, branchCities, cityById, searchBranches } from '../data/branches';
import { pioneers } from '../data/pioneers';
import { parentAtlasView } from './atlasCamera';
import useAtlasCamera from './useAtlasCamera';
import useAtlasEntrance from './useAtlasEntrance';
import BorderGlow from '../BorderGlow';
import SpecularButton from '../SpecularButton';
import SchoolCrest, { prepareSchoolCrest } from './SchoolCrest';
import BranchFlag from './BranchFlag';
import UniqueLoading from './UniqueLoading';
import ResponsiveImage from './ResponsiveImage';
import useViewportReady from './useViewportReady';
import { useTheme } from '../Theme';
import { atlasPalettes, atlasStyles } from './atlasPalette';
import './BranchAtlas.css';

const Arrow = ({ back = false }) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={back ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} /></svg>;
const Chevron = () => <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" /></svg>;

export default function BranchAtlas({ borderGlowProps }) {
  const { t, locale, formatDate } = useLanguage();
  const id = useId();
  const rootRef = useRef(null);
  const imageReady = useViewportReady(rootRef);
  const dataReady = useViewportReady(rootRef, { margin: 600 });
  const viewportRef = useRef(null);
  const layerRef = useRef(null);
  const painterRef = useRef(null);
  const entranceRef = useRef({ phase: 'pending', progress: 0, redraw: null });
  const { theme } = useTheme();
  const palette = atlasPalettes[theme];
  const markerRefs = useRef({});
  const titleRef = useRef(null);
  const panelRef = useRef(null);
  const focusAfterNavigation = useRef(false);
  const [atlas, setAtlas] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState(() => {
    const branchId = new URLSearchParams(window.location.search).get('branch');
    return Object.hasOwn(branchById, branchId) ? `school:${branchId}` : 'china';
  });
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(null);
  const [query, setQuery] = useState('');
  const matches = useMemo(() => searchBranches(query, t), [query, t]);
  const searching = query.trim().length > 0;
  const controlProps = { size: 'sm' };
  const selected = view.startsWith('school:') ? branchById[view.slice(7)] : null;
  const leaderMember = selected?.leader ? pioneers.find(member => member.name === selected.leader.name) : null;
  const LeaderProfile = leaderMember ? 'a' : 'div';
  const currentCity = selected?.city || (cityById[view] ? view : null);
  const local = Boolean(currentCity);
  const visibleBranches = currentCity ? branches.filter(branch => branch.city === currentCity) : branches;
  const selectedIndex = selected ? branches.findIndex(branch => branch.id === selected.id) : -1;
  useAtlasEntrance(rootRef, Boolean(atlas), reduced, entranceRef, atlas?.china.length || 0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!imageReady) return;
    branches.forEach(branch => { prepareSchoolCrest(branch.crest).catch(() => {}); });
  }, [imageReady]);

  useEffect(() => {
    if (!dataReady) return undefined;
    let cancelled = false;
    setError(false);
    import('../data/maps/branch-atlas.json').then(module => {
      if (!cancelled) setAtlas(module.default);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [dataReady, attempt]);

  const bounds = atlas ? selected ? atlas.campusViews[selected.id] : cityById[view] ? atlas.cityViews[view] : atlas.bounds[view] : null;
  const points = useMemo(() => atlas ? Object.fromEntries(Object.entries(atlas.points).map(([key, point]) => [key, { point, side: branchById[key]?.labelSide || 'right', minScale: key === 'fujian' || cityById[key] ? 0 : 450 }])) : {}, [atlas]);
  useAtlasCamera({ viewportRef, layerRef, painterRef, markerRefs, entranceRef, points, bounds, reduced, overview: view === 'china', atlas, palette, selectedId: selected?.id, hoveredId: hovered, view });

  const go = useCallback((next, keyboard = false) => {
    setQuery('');
    focusAfterNavigation.current = keyboard;
    setHovered(null);
    setView(current => current === next ? current : next);
  }, []);
  const follow = next => event => go(next, event.detail === 0);
  useLayoutEffect(() => {
    if (focusAfterNavigation.current) { titleRef.current?.focus({ preventScroll: true }); focusAfterNavigation.current = false; }
  }, [view]);

  const crumbs = [{ view: 'china', label: '全国' }];
  if (view !== 'china') crumbs.push({ view: 'fujian', label: '福建' });
  if (local) crumbs.push({ view: currentCity, label: cityById[currentCity].name });
  if (selected) crumbs.push({ view, label: selected.shortName });
  const title = selected?.school || (view === 'china' ? '福建：梦开始的地方' : view === 'fujian' ? '福建' : cityById[view]?.name);
  const foundedLabel = date => locale === 'en' ? formatDate(date) : date.split('-').map(Number).join('.');
  const schoolButton = branch => (
    <button type="button" key={branch.id} className={`branch-atlas__school-row${selected?.id === branch.id ? ' is-selected' : ''}`} onClick={follow(`school:${branch.id}`)} onPointerEnter={() => setHovered(branch.id)} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(branch.id)} onBlur={() => setHovered(null)} aria-label={t("查看{0}{1}", [branch.school, branch.role])} aria-describedby={`${id}-founded-${branch.id}${branch.leader ? ` ${id}-leader-${branch.id}` : ''}`}>
      <ResponsiveImage src={branch.crest} alt="" className="branch-atlas__crest" style={{ backgroundColor: branch.crestBackground }} />
      <span>
        <span className="branch-atlas__school-name">
          <strong>{t(branch.school)}</strong>
          {branch.leader && <span className="branch-atlas__leader-summary" id={`${id}-leader-${branch.id}`}>
            <span className="branch-atlas__sr-only">{t(branch.leader.title)} · </span>
            <ResponsiveImage src={branch.leader.avatar} alt="" width="20" height="20" fit="cover" />
            <span>{t(branch.leader.name)}</span>
          </span>}
        </span>
        <span className="branch-atlas__founded" id={`${id}-founded-${branch.id}`}><span>{t('{0} 成立于', [branch.role])}</span><time dateTime={branch.founded}>{foundedLabel(branch.founded)}</time></span>
      </span>
      <span className="branch-atlas__row-end"><Chevron /></span>
    </button>
  );

  return (
    <div ref={rootRef} className="branch-atlas" style={atlasStyles[theme]} data-view={selected ? 'school' : view} onKeyDown={event => {
      if (event.key === 'Escape' && query) { event.preventDefault(); event.stopPropagation(); setQuery(''); return; }
      if (event.key === 'Escape' && view !== 'china') { event.preventDefault(); event.stopPropagation(); go(parentAtlasView(view), true); }
    }}>
      <BorderGlow {...borderGlowProps} glowIntensity={2.9} className="branch-atlas__frame">
      <div className="branch-atlas__body">
        <div ref={viewportRef} className="branch-atlas__viewport" role="group" aria-label={t("{0}分社地图", [selected ? selected.school : view === 'china' ? '全国' : title])} aria-describedby={`${id}-map-help`}>
          <canvas ref={layerRef} className="branch-atlas__map" aria-hidden="true"
            onClick={event => { const next = painterRef.current?.hitTest(event.nativeEvent.offsetX, event.nativeEvent.offsetY, view); if (next) go(next); }}
            onPointerMove={event => { const next = painterRef.current?.hitTest(event.nativeEvent.offsetX, event.nativeEvent.offsetY, view); event.currentTarget.style.cursor = next ? 'pointer' : 'default'; setHovered(next?.startsWith('school:') ? next.slice(7) : next || null); }}
            onPointerLeave={() => setHovered(null)}
          />
          <div className="branch-atlas__vignette" aria-hidden="true" />
          {atlas && !local && (view === 'china' ? [{ id: 'fujian', name: '福建', count: branches.length }] : branchCities.map(city => ({ ...city, count: branches.filter(branch => branch.city === city.id).length }))).map(place => <div key={place.id} ref={el => { markerRefs.current[place.id] = el; }} className="branch-atlas__pin branch-atlas__pin--city">
            <button type="button" onClick={follow(place.id)} aria-label={view === 'china' ? t('进入福建分社地图') : t("进入{0}高校地图", [place.name])} onPointerEnter={() => setHovered(place.id)} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(place.id)} onBlur={() => setHovered(null)}>
              <span className="branch-atlas__pulse" /><span className="branch-atlas__dot" />
              <span className="branch-atlas__pin-label"><strong>{t(place.name)}</strong><small>{place.count === 1 ? t('1 所高校') : t('{0} 所高校', [place.count])}{' '}<span aria-hidden="true">↗</span></small></span>
            </button>
          </div>)}
          {atlas && local && visibleBranches.map(branch => <div key={branch.id} ref={el => { markerRefs.current[branch.id] = el; }} className={`branch-atlas__pin branch-atlas__pin--${branch.labelSide}${selected?.id === branch.id || hovered === branch.id ? ' is-active' : ''}${branch.role === '总社' ? ' is-head' : ''}`}>
            <button type="button" onClick={follow(`school:${branch.id}`)} onPointerEnter={() => setHovered(branch.id)} onPointerLeave={() => setHovered(null)} aria-label={t("在地图中查看{0}", [branch.school])} aria-pressed={selected?.id === branch.id}>
              <span className="branch-atlas__pulse" /><span className="branch-atlas__dot" />
              <span className="branch-atlas__pin-label"><strong>{branch.role === '总社' ? t("{0}总社", [branch.school]) : t(branch.name)}</strong></span>
            </button>
          </div>)}
          <div className="branch-atlas__map-top"><span>{t(local ? cityById[currentCity].name : view === 'fujian' ? '福建' : '中国')}</span><span className="branch-atlas__north" aria-label={t("北方")}>N <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M6 0 12 16 6 12 0 16Z" /></svg></span></div>
          <div className="branch-atlas__map-bottom">
            <span id={`${id}-map-help`}>{t(local ? '点击校名，探索分社' : '点击地点，逐级探索')}</span>
            <button type="button" className="branch-atlas__map-back" aria-label={t("地图内返回上一级")} disabled={!atlas || view === 'china'} onClick={follow(parentAtlasView(view))}><Arrow back />{t("返回上一级")}</button>
          </div>
          {!atlas && <div className="branch-atlas__loading" aria-busy={!error}>{error ? <><span>{t("地图暂时无法载入")}</span><SpecularButton {...controlProps} onClick={() => setAttempt(value => value + 1)}>{t("重新加载")}</SpecularButton></> : <UniqueLoading text={t("加载中")} />}</div>}
        </div>

        <aside className="branch-atlas__panel" aria-label={t("分社信息")}>
          <form className="branch-atlas__search" role="search" onSubmit={event => { event.preventDefault(); if (searching && matches[0]) go(`school:${matches[0].id}`, true); }}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            <label className="branch-atlas__sr-only" htmlFor={`${id}-search`}>{t("搜索分社或高校")}</label>
            <input id={`${id}-search`} type="search" placeholder={t("搜索分社或高校")} autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} aria-controls={`${id}-results`} onKeyDown={event => { if (event.key === 'ArrowDown' && searching) { event.preventDefault(); panelRef.current?.querySelector('.branch-atlas__school-row')?.focus(); } }} />
            {query && <button type="button" aria-label={t("清空搜索")} className="branch-atlas__search-clear" onClick={() => setQuery('')}>×</button>}
          </form>
          <div ref={panelRef} className="branch-atlas__panel-content" id={`${id}-results`}>
            {!searching && !selected && <div className="branch-atlas__intro">
              <h3 ref={titleRef} tabIndex={-1}>{t(title)}</h3>
            </div>}
            {!searching && selected && <header className="branch-atlas__school-heading">
              <SchoolCrest branch={selected} />
              <div>
                <div className="branch-atlas__overline">{t(selected.role)} · {t("福建")} · {t(cityById[selected.city].name)}</div>
                <h3 ref={titleRef} tabIndex={-1}>{t(selected.school)}</h3>
                <p className="branch-atlas__branch-name">
                  <span>{t(selected.role === '总社' ? '零一 AI 日新社' : selected.name)}</span>
                  <span className="branch-atlas__founded"><span>{t('{0} 成立于', [selected.role])}</span><time dateTime={selected.founded}>{foundedLabel(selected.founded)}</time></span>
                </p>
              </div>
            </header>}
            <div className="branch-atlas__toolbar">
              <button type="button" className="branch-atlas__back" aria-label={t("返回上一级地图")} disabled={view === 'china'} onClick={follow(parentAtlasView(view))}><Arrow back /></button>
              <nav aria-label={t("分社地图层级")}><ol>{crumbs.map((crumb, i) => <li key={crumb.view}>{i > 0 && <Chevron />}<button type="button" onClick={follow(crumb.view)} aria-current={view === crumb.view ? 'location' : undefined}>{t(crumb.label)}</button></li>)}</ol></nav>
            </div>
            {searching ? <div className="branch-atlas__search-results">
              <div className="branch-atlas__list-label" role="status">{t('找到 {0} 所高校', [matches.length])}</div>
              {matches.length ? matches.map(schoolButton) : <div className="branch-atlas__empty"><strong>{t("暂时没有找到")}</strong><p>{t("试试学校名称、简称，或“福州”“总社”。")}</p></div>}
            </div> : selected ? <div className="branch-atlas__detail">
              {selected.leader && <LeaderProfile className="branch-atlas__leader-profile"
                href={leaderMember ? `./?page=pioneers&member=${encodeURIComponent(leaderMember.id)}` : undefined}
                role={leaderMember ? undefined : 'group'}
                aria-label={leaderMember ? t("查看{0}{1}的领航先锋介绍", [selected.leader.title, selected.leader.name]) : t("{0}{1}", [selected.school, selected.leader.title])}>
                <ResponsiveImage src={selected.leader.avatar} alt="" width="56" height="56" fit="cover" />
                <div><span>{t(selected.leader.title)}</span><strong>{t(selected.leader.name)}</strong></div>
                {leaderMember && <span className="branch-atlas__leader-link-arrow" aria-hidden="true">→</span>}
              </LeaderProfile>}
              <BranchFlag branch={selected} />
            </div> : <>
              <div className="branch-atlas__school-list"><div className="branch-atlas__list-label">{view === 'china' ? t('全国高校') : view === 'fujian' ? t('福建高校') : t("{0}高校", [cityById[view]?.name])}<span>{visibleBranches.length}</span></div>{visibleBranches.map(schoolButton)}</div>
            </>}
          </div>
          <footer className="branch-atlas__panel-actions">
            <div className="branch-atlas__resource-actions">
              <SpecularButton {...controlProps} className="branch-atlas__resource-link" href="https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzYzNzg5MjMyOQ==&action=getalbum&album_id=4749437938097487873#wechat_redirect" target="_blank" rel="noopener noreferrer">{t("分社大全")}</SpecularButton>
              <SpecularButton {...controlProps} className="branch-atlas__resource-link" href="https://scn96l2kzmbn.feishu.cn/wiki/PIqKwgPI7iIrtXkHps9cqavKn4c" target="_blank" rel="noopener noreferrer">{t("参与计划")}</SpecularButton>
            </div>
            {selected && !searching && <>
              <div className="branch-atlas__switcher">
                <button type="button" onClick={follow(`school:${branches[(selectedIndex + branches.length - 1) % branches.length].id}`)} aria-label={t("查看上一所高校")}><Arrow back /><span>{t("上一所")}</span></button>
                <span>{selectedIndex + 1} / {t(branches.length)}</span>
                <button type="button" onClick={follow(`school:${branches[(selectedIndex + 1) % branches.length].id}`)} aria-label={t("查看下一所高校")}><span>{t("下一所")}</span><Arrow /></button>
              </div>
            </>}
          </footer>
        </aside>
      </div>
      <span className="branch-atlas__sr-only" aria-live="polite" aria-atomic="true">{t("当前查看：")}{t(title)}{selected ? t("，{0}，{1}", [selected.role, selected.name]) : t('')}</span>
      </BorderGlow>
    </div>
  );
}

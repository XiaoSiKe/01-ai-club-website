import { useEffect } from 'react';
import { useTheme } from './Theme';
import DuotoneTeamRoster from './components/DuotoneTeamRoster';
import SiteNavigation from './components/SiteNavigation';
import BrandTitle from './components/BrandTitle';
import { pioneers } from './data/pioneers';
import './PioneersPage.css';

const DARK_PALETTE = {
  ground: '#090909', deep: '#171717', hot: '#3e3e3e', glow: '#646464',
  ink: '#f5f5f5', shadow: '#111111', mid: '#929292', highlight: '#f4f4f4',
};
const LIGHT_PALETTE = {
  ground: '#f4f4f4', deep: '#e5e5e5', hot: '#c2c2c2', glow: '#ffffff',
  ink: '#202020', shadow: '#141414', mid: '#8c8c8c', highlight: '#f5f5f5',
};
const LABELS = {
  team: '领航先锋成员肖像墙',
  memberLink: 'GitHub 主页',
};

export default function PioneersPage() {
  const { theme } = useTheme();
  const requestedMember = new URLSearchParams(window.location.search).get('member');
  const targetMemberId = pioneers.some(member => member.id === requestedMember) ? requestedMember : null;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '领航先锋 · 零一 AI 日新社';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="pioneers-page">
      <a className="pioneers-page__skip" href="#pioneers-roster">跳到领航先锋</a>
      <SiteNavigation standalone />
      <div id="pioneers-roster" className="pioneers-page__roster" tabIndex={-1}>
        <DuotoneTeamRoster
          members={pioneers}
          titleAs="h1"
          title={'领航\n先锋'}
          eyebrow="零一 AI 日新社｜01 AI CLUB"
          renderTitleLine={line => <BrandTitle text={line} />}
          preset="mono"
          palette={theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE}
          columns={4}
          driftSeconds={7.2}
          targetMemberId={targetMemberId}
          height="calc(100svh - var(--pioneers-header-clearance))"
          fontFamily="var(--site-font-family)"
          stretch={1}
          uppercase={false}
          grain={false}
          labels={LABELS}
          clickFollowsLink={false}
        />
      </div>
    </main>
  );
}

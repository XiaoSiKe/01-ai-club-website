import { useEffect, useState } from 'react';
import { useTheme } from './Theme';
import DuotoneTeamRoster from './components/DuotoneTeamRoster';
import SiteNavigation from './components/SiteNavigation';
import BrandTitle from './components/BrandTitle';
import SiteBackground from './components/SiteBackground';
import useMediaQuery from './components/useMediaQuery';
import PioneerSearch from './components/PioneerSearch';
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
  const mobile = useMediaQuery('(max-width: 699px)');
  const [searchTarget, setSearchTarget] = useState(null);
  const requestedMember = new URLSearchParams(window.location.search).get('member');
  const targetMemberId = searchTarget?.id || (pioneers.some(member => member.id === requestedMember) ? requestedMember : null);
  const initialMemberId = pioneers.find(member => member.name === '零一扬')?.id;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '领航先锋 · 零一 AI 日新社';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="pioneers-page">
      <SiteBackground />
      <a className="pioneers-page__skip" href="#pioneers-roster">跳到领航先锋</a>
      <SiteNavigation standalone />
      <div id="pioneers-roster" className="pioneers-page__roster" tabIndex={-1}>
        <DuotoneTeamRoster
          members={pioneers}
          titleAs="h1"
          title={'领航\n先锋'}
          eyebrow={<BrandTitle text="零一 AI 日新社｜01 AI CLUB" />}
          renderTitleLine={line => <BrandTitle text={line} />}
          titleControls={<PioneerSearch onSelect={id => setSearchTarget(previous => ({ id, request: (previous?.request || 0) + 1 }))} />}
          preset="mono"
          palette={theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE}
          columns={4}
          mobileColumns={mobile ? 4 : 0}
          mobileWallScale={0.7}
          driftSeconds={7.2}
          cardScale={mobile ? 0.9 : 0.99}
          speedMultiplier={mobile ? 1.75329 : 1.928619}
          targetMemberId={targetMemberId}
          targetRequestId={searchTarget?.request || 0}
          initialMemberId={initialMemberId}
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

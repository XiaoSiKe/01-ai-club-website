import { useLanguage } from './Language';
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
export function PeopleRosterPage({ members, heading, pageTitle, skipLabel, rosterLabel, searchLabels, className = '', columns = 4, tabletColumns, portraitScale, repeatWithinColumn }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const mobile = useMediaQuery('(max-width: 699px)');
  const [searchTarget, setSearchTarget] = useState(null);
  const requestedMember = new URLSearchParams(window.location.search).get('member');
  const targetMemberId = searchTarget?.id || (members.some(member => member.id === requestedMember) ? requestedMember : null);
  const initialMemberId = members.find(member => member.name === '零一扬')?.id;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t(pageTitle);
    return () => { document.title = previousTitle; };
  }, [t, pageTitle]);

  return (
    <main className={className ? `pioneers-page ${className}` : 'pioneers-page'}>
      <SiteBackground />
      <a className="pioneers-page__skip" href="#pioneers-roster">{t(skipLabel)}</a>
      <SiteNavigation standalone />
      <div id="pioneers-roster" className="pioneers-page__roster" tabIndex={-1}>
        <DuotoneTeamRoster
          members={members}
          titleAs="h1"
          title={t(heading)}
          eyebrow={<BrandTitle text={t("零一 AI 日新社｜01 AI CLUB")} />}
          renderTitleLine={line => <BrandTitle text={t(line)} />}
          titleControls={<PioneerSearch members={members} labels={searchLabels} onSelect={id => setSearchTarget(previous => ({ id, request: (previous?.request || 0) + 1 }))} />}
          preset="mono"
          palette={theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE}
          columns={columns}
          tabletColumns={tabletColumns}
          mobileColumns={mobile ? columns : 0}
          mobileWallScale={0.7}
          repeatWithinColumn={repeatWithinColumn}
          driftSeconds={7.2}
          cardScale={portraitScale ?? (mobile ? 0.9 : 0.99)}
          speedMultiplier={mobile ? 1.75329 : 1.928619}
          targetMemberId={targetMemberId}
          targetRequestId={searchTarget?.request || 0}
          initialMemberId={initialMemberId}
          height="calc(100svh - var(--pioneers-header-clearance))"
          fontFamily="var(--site-font-family)"
          stretch={1}
          uppercase={false}
          grain={false}
          labels={{ team: rosterLabel, memberLink: 'GitHub 主页' }}
          clickFollowsLink={false}
        />
      </div>
    </main>
  );
}

export default function PioneersPage() {
  return <PeopleRosterPage members={pioneers} heading={'领航\n先锋'} pageTitle="领航先锋 · 零一 AI 日新社"
    skipLabel="跳到领航先锋" rosterLabel="领航先锋成员肖像墙" />;
}

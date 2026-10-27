import DriftWall from './DriftWall';
import ViewportMount from './ViewportMount';
import { competitionItems } from '../data/competition';
import { useTheme } from '../Theme';
import './ResearchSection.css';

export default function ResearchSection({ buttonProps }) {
  const { theme } = useTheme();
  return <section className="home-section research-section" id="research" aria-labelledby="research-title" tabIndex={-1}>
    <div className="research-section__heading">
      <h2 className="home-flow-title research-section__title" id="research-title">零一科研与竞赛</h2>
      <p className="research-section__intro">99%的人在这里被打败，但100%的人会收获成长！</p>
    </div>
    <ViewportMount className="research-section__wall">
      <DriftWall items={competitionItems} columns={5} tileWidth={220} tileHeight={275} gap={18} fillContainer entrance
        tilt={12} turn={-8} perspective={1500} depth={100} speed={60.72} direction="up"
        variance={0.3} lift={0} fade={0.25} dim={0.9} brightness={0.8} grayscale={0}
        lightboxButtonProps={buttonProps} ariaLabel="科研与竞赛证书及赛场照片墙"
        overlayColor={theme === 'light' ? '#f4f4f2' : '#090909'} />
    </ViewportMount>
  </section>;
}

import { useLanguage } from '../Language';
/** Partner marks use the footer's LogoLoop for matching motion and interaction. */
import { useMemo, useState } from 'react';
import LogoLoop from '../LogoLoop';
import ResponsiveImage from './ResponsiveImage';
import { imageSource } from './imageSource';
import { partnerCategories, partners } from '../data/partners';
import { useTheme } from '../Theme';
import './LogoMarquee.css';
import LogoArtwork from './LogoArtwork';

function PartnerMark({ logo }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [failedSource, setFailedSource] = useState(null);
  const name = logo.name || logo.alt || '';
  const source = theme === 'dark' && logo.darkSrc ? logo.darkSrc : logo.src;
  const hasImage = Boolean(source && failedSource !== source);
  const imageStyle = {
    width: `calc(${logo.width || 120}px * var(--partner-logo-scale, 1))`,
    height: `calc(${logo.height || 36}px * var(--partner-logo-scale, 1))`,
    ...(logo.offsetY ? { transform: `translateY(calc(${logo.offsetY}px * var(--partner-logo-scale, 1)))` } : {}),
    ...(theme === 'dark' && logo.darkBrightness ? { filter: `brightness(${logo.darkBrightness})` } : {}),
  };
  return (
    <span className={`logo-marquee__mark${logo.invertOnLight ? ' logo-marquee__mark--white-artwork' : ''}${logo.invertOnDark ? ' logo-marquee__mark--black-artwork' : ''}`}>
      {hasImage && (logo.artwork ? (
        <LogoArtwork source={imageSource(source, logo.width, logo.height)} {...logo.artwork}
          darkInk={theme === 'dark' ? logo.artwork.darkInk : undefined}
          lightInk={theme === 'light' && logo.artwork.adaptNeutral}
          style={imageStyle} onError={() => setFailedSource(source)} />
      ) : logo.crop ? (
        <svg className="logo-marquee__image" viewBox={logo.crop.viewBox} style={imageStyle} aria-hidden="true" focusable="false">
          <image href={imageSource(source, 320, 320, 1)} width={logo.crop.width} height={logo.crop.height} onError={() => setFailedSource(source)} />
        </svg>
      ) : (
        <ResponsiveImage eager className="logo-marquee__image" src={source} alt="" width={logo.width || 120} height={logo.height || 36} draggable={false}
          style={imageStyle} onError={() => setFailedSource(source)} />
      ))}
      {(!hasImage || logo.showName) && <span className="logo-marquee__name">{t(name)}</span>}
    </span>
  );
}

export default function LogoMarquee() {
  const { t } = useLanguage();
  const groups = useMemo(() => partnerCategories.map(category => {
    const marks = partners.filter(logo => logo.category === category.id).map(logo => ({
      title: logo.href ? t('{0} 官网（新窗口）', [logo.name]) : t(logo.name),
      href: logo.href,
      node: <PartnerMark logo={logo} />,
    }));
    const splitAt = Math.ceil(marks.length / 2);
    const rows = category.id === 'university' || marks.length < 2
      ? [marks]
      : [marks.slice(0, splitAt), marks.slice(splitAt)];
    return { ...category, marks, rows };
  }).filter(group => group.marks.length), [t]);

  return (
    <div className="logo-marquee">
      {groups.map(({ id, title, marks, rows }) => (
        <section key={id} aria-labelledby={`partner-category-${id}`}>
          <h3 id={`partner-category-${id}`} className="logo-marquee__heading">{t(title)}</h3>
          {marks.length === 1 ? (
            <div className="logo-marquee__single logo-loop-scale">
              {marks[0].href ? (
                <a className="logo-loop-item" href={marks[0].href} target="_blank" rel="noopener noreferrer" aria-label={marks[0].title}>
                  {marks[0].node}
                </a>
              ) : (
                <span className="logo-loop-item" role="img" aria-label={marks[0].title}>{marks[0].node}</span>
              )}
            </div>
          ) : (
            <div className="logo-marquee__rows">
              {rows.map((row, index) => (
                <LogoLoop
                  key={index}
                  logos={row}
                  speed={90}
                  direction={index % 2 === 0 ? 'left' : 'right'}
                  logoHeight={64}
                  gap={48}
                  hoverSpeed={0}
                  scaleOnHover
                  fadeOut
                  ariaLabel={rows.length > 1 ? t('{0}，第{1}行', [t(title), index + 1]) : title}
                  tabIndex={0}
                  className="logo-marquee__row"
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

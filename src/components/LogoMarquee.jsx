/** Partner marks use the footer's LogoLoop for matching motion and interaction. */
import { useMemo, useState } from 'react';
import LogoLoop from '../LogoLoop';
import ResponsiveImage from './ResponsiveImage';
import { imageSource } from './imageSource';
import { partners } from '../data/partners';
import { useTheme } from '../Theme';
import './LogoMarquee.css';
import LogoArtwork from './LogoArtwork';

function PartnerMark({ logo }) {
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
      {(!hasImage || logo.showName) && <span className="logo-marquee__name">{name}</span>}
    </span>
  );
}

export default function LogoMarquee({
  logos = partners,
  className = '',
  ariaLabel = '合作生态伙伴',
}) {
  const list = Array.isArray(logos) ? logos : partners;
  const marks = useMemo(() => list.map(logo => ({
    title: logo.href ? `${logo.name || logo.alt} 官网（新窗口）` : logo.name || logo.alt || '',
    href: logo.href,
    node: <PartnerMark logo={logo} />,
  })), [list]);
  const rows = Array.from({ length: 3 }, (_, index) => marks.slice(
    Math.ceil(index * marks.length / 3),
    Math.ceil((index + 1) * marks.length / 3),
  )).filter(row => row.length);

  if (!marks.length) return null;
  return (
    <div className={`logo-marquee${className ? ` ${className}` : ''}`} role="group" aria-label={ariaLabel}>
    {rows.map((row, index) => <LogoLoop
      key={index}
      logos={row}
      speed={90}
      direction={index % 2 === 0 ? 'left' : 'right'}
      logoHeight={64}
      gap={48}
      hoverSpeed={0}
      scaleOnHover
      fadeOut
      ariaLabel={`${ariaLabel}，第${index + 1}行`}
      tabIndex={0}
      className="logo-marquee__row"
    />)}
    </div>
  );
}

/** Partner marks use the footer's LogoLoop for matching motion and interaction. */
import { useId, useMemo, useState } from 'react';
import LogoLoop from '../LogoLoop';
import ResponsiveImage from './ResponsiveImage';
import { imageSource } from './imageSource';
import { partners } from '../data/partners';
import './LogoMarquee.css';

function PartnerMark({ logo }) {
  const id = useId();
  const [failedSource, setFailedSource] = useState(null);
  const name = logo.name || logo.alt || '';
  const hasImage = Boolean(logo.src && failedSource !== logo.src);
  const imageStyle = {
    width: `calc(${logo.width || 120}px * var(--partner-logo-scale, 1))`,
    height: `calc(${logo.height || 36}px * var(--partner-logo-scale, 1))`,
    ...(logo.offsetY ? { transform: `translateY(calc(${logo.offsetY}px * var(--partner-logo-scale, 1)))` } : {}),
  };
  return (
    <span className={`logo-marquee__mark${logo.monochrome ? ' logo-marquee__mark--mono' : ''}${logo.lightInk ? ' logo-marquee__mark--light-ink' : ''}${logo.invertOnDark ? ' logo-marquee__mark--invert-dark' : ''}`}>
      {hasImage && (logo.mask ? (
        <svg className="logo-marquee__image logo-marquee__image--mask" viewBox={logo.mask.viewBox} style={imageStyle} aria-hidden="true" focusable="false">
          <defs>
            {/* Remove the original near-black backdrop, preserving its antialiased artwork. */}
            <filter id={`${id}-ink`} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.08" intercept="-0.06" />
                <feFuncG type="linear" slope="1.08" intercept="-0.06" />
                <feFuncB type="linear" slope="1.08" intercept="-0.06" />
              </feComponentTransfer>
            </filter>
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={logo.mask.width} height={logo.mask.height} style={{ maskType: 'luminance' }}>
              <image href={imageSource(logo.src, 192, 192, 1)} width={logo.mask.width} height={logo.mask.height} filter={`url(#${id}-ink)`} onError={() => setFailedSource(logo.src)} />
            </mask>
          </defs>
          <rect width={logo.mask.width} height={logo.mask.height} fill="currentColor" mask={`url(#${id}-mask)`} />
        </svg>
      ) : (
        <ResponsiveImage className="logo-marquee__image" src={logo.src} alt="" width={logo.width || 120} height={logo.height || 36} draggable={false}
          style={imageStyle} onError={() => setFailedSource(logo.src)} />
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
  const midpoint = Math.ceil(marks.length / 2);
  const rows = [marks.slice(0, midpoint), marks.slice(midpoint)].filter(row => row.length);

  if (!marks.length) return null;
  return (
    <div className={`logo-marquee${className ? ` ${className}` : ''}`} role="group" aria-label={ariaLabel}>
    {rows.map((row, index) => <LogoLoop
      key={index}
      logos={row}
      speed={90}
      direction={index === 0 ? 'left' : 'right'}
      logoHeight={64}
      gap={48}
      hoverSpeed={0}
      scaleOnHover
      fadeOut
      fadeOutColor="var(--site-background, #090909)"
      ariaLabel={`${ariaLabel}，第${index + 1}行`}
      tabIndex={0}
      className="logo-marquee__row"
    />)}
    </div>
  );
}

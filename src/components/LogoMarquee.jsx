/** Partner marks use the footer's LogoLoop for matching motion and interaction. */
import { useId, useMemo, useState } from 'react';
import LogoLoop from '../LogoLoop';
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
  };
  return (
    <span className={`logo-marquee__mark${logo.monochrome ? ' logo-marquee__mark--mono' : ''}${logo.lightInk ? ' logo-marquee__mark--light-ink' : ''}`}>
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
              <image href={logo.src} width={logo.mask.width} height={logo.mask.height} filter={`url(#${id}-ink)`} onError={() => setFailedSource(logo.src)} />
            </mask>
          </defs>
          <rect width={logo.mask.width} height={logo.mask.height} fill="currentColor" mask={`url(#${id}-mask)`} />
        </svg>
      ) : (
        <img className="logo-marquee__image" src={logo.src} alt="" width={logo.width || 120} height={logo.height || 36} loading="eager" decoding="async" draggable={false}
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
    title: logo.name || logo.alt || '',
    node: <PartnerMark logo={logo} />,
  })), [list]);

  if (!marks.length) return null;
  return (
    <LogoLoop
      logos={marks}
      speed={90}
      direction="left"
      logoHeight={80}
      gap={48}
      hoverSpeed={0}
      scaleOnHover
      fadeOut
      fadeOutColor="var(--site-background, #090909)"
      ariaLabel={ariaLabel}
      tabIndex={0}
      className={`logo-marquee${className ? ` ${className}` : ''}`}
    />
  );
}

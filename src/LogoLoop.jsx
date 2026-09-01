import { useLayoutEffect, useRef } from 'react';
import './LogoLoop.css';

const EMPTY_LOGOS = [];

export default function LogoLoop({
  logos = EMPTY_LOGOS,
  speed = 120,
  direction = 'left',
  logoHeight = 48,
  gap = 40,
  hoverSpeed = 0,
  scaleOnHover = false,
  fadeOut = false,
  fadeOutColor = '#ffffff',
  ariaLabel = 'Logo loop',
  className = ''
}) {
  const rootRef = useRef(null);
  const groupRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const group = groupRef.current;
    if (!root || !group) return undefined;

    const updateDurations = () => {
      const distance = group.getBoundingClientRect().width;
      root.style.setProperty('--logo-loop-distance', `${distance}px`);
      root.style.setProperty('--logo-loop-duration', `${distance / Math.max(speed, 1)}s`);
      root.style.setProperty('--logo-loop-hover-duration', `${distance / Math.max(hoverSpeed, 1)}s`);
    };

    updateDurations();
    const observer = new ResizeObserver(updateDurations);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap, hoverSpeed, logoHeight, logos, speed]);

  const renderLogo = (logo, index, duplicate = false) => {
    const content = logo.node ? (
      <span className="logo-loop-node" aria-hidden="true">{logo.node}</span>
    ) : (
      <img className="logo-loop-image" src={logo.src} alt={duplicate ? '' : logo.alt} loading="lazy" />
    );

    if (logo.href && !duplicate) {
      return (
        <a
          className="logo-loop-item"
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={logo.title || logo.alt}
          title={logo.title || logo.alt}
          key={`${logo.title || logo.alt || index}-${index}`}
        >
          {content}
        </a>
      );
    }

    return (
      <span
        className="logo-loop-item"
        title={duplicate ? undefined : logo.title || logo.alt}
        key={`${duplicate ? 'duplicate' : 'logo'}-${logo.title || logo.alt || index}-${index}`}
      >
        {content}
      </span>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`logo-loop${fadeOut ? ' logo-loop-fade' : ''}${scaleOnHover ? ' logo-loop-scale' : ''}${className ? ` ${className}` : ''}`}
      data-direction={direction}
      data-pause-on-hover={hoverSpeed === 0 || undefined}
      role="group"
      aria-label={ariaLabel}
      style={{
        '--logo-loop-height': `${logoHeight}px`,
        '--logo-loop-gap': `${gap}px`,
        '--logo-loop-fade-color': fadeOutColor
      }}
    >
      <div className="logo-loop-track">
        <div ref={groupRef} className="logo-loop-group">
          {logos.map((logo, index) => renderLogo(logo, index))}
        </div>
        <div className="logo-loop-group" aria-hidden="true">
          {logos.map((logo, index) => renderLogo(logo, index, true))}
        </div>
      </div>
    </div>
  );
}

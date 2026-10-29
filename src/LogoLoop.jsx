import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  tabIndex,
  className = ''
}) {
  const rootRef = useRef(null);
  const groupRef = useRef(null);
  const [groupCount, setGroupCount] = useState(2);

  useEffect(() => {
    const root = rootRef.current;
    let visible = false;
    const update = () => { root.dataset.offscreen = String(!visible || document.hidden); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const group = groupRef.current;
    if (!root || !group) return undefined;

    const updateDurations = () => {
      const distance = group.getBoundingClientRect().width;
      if (!distance) return;
      root.style.setProperty('--logo-loop-distance', `${distance}px`);
      root.style.setProperty('--logo-loop-duration', `${distance / Math.max(speed, 1)}s`);
      root.style.setProperty('--logo-loop-hover-duration', `${distance / Math.max(hoverSpeed, 1)}s`);
      setGroupCount(Math.max(2, Math.ceil(root.clientWidth / distance) + 1));
    };

    updateDurations();
    const observer = new ResizeObserver(updateDurations);
    observer.observe(group);
    observer.observe(root);
    return () => observer.disconnect();
  }, [gap, hoverSpeed, logoHeight, logos, speed]);

  const renderLogo = (logo, index, duplicate = false) => {
    const content = logo.node ? (
      <span className="logo-loop-node" aria-hidden="true">{logo.node}</span>
    ) : (
      <img className="logo-loop-image" src={logo.src} alt={duplicate ? '' : logo.alt} loading="lazy" />
    );

    if (logo.href) {
      const external = !logo.href.startsWith('#');
      return (
        <a
          className="logo-loop-item"
          href={logo.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          tabIndex={duplicate ? -1 : undefined}
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
        role={duplicate ? undefined : 'img'}
        aria-label={duplicate ? undefined : logo.title || logo.alt}
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
      tabIndex={tabIndex}
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
        {Array.from({ length: groupCount - 1 }, (_, groupIndex) => (
          <div className="logo-loop-group" aria-hidden="true" key={groupIndex}>
            {logos.map((logo, index) => renderLogo(logo, index, true))}
          </div>
        ))}
      </div>
    </div>
  );
}

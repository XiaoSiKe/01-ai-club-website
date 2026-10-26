import { useCallback, useRef } from 'react';
import './BorderGlow.css';

export function clearBorderGlow(element) {
  if (!element) return;
  if (element.style.getPropertyValue('--edge-proximity') !== '0') element.style.setProperty('--edge-proximity', '0');
  if (element.hasAttribute('data-pointer-active')) element.removeAttribute('data-pointer-active');
}

export function updateBorderGlow(element, clientX, clientY, bounds) {
  if (!element) return;
  const rect = bounds || element.getBoundingClientRect();
  const x = clientX - rect.left, y = clientY - rect.top;
  if (!rect.width || !rect.height || x < 0 || y < 0 || x > rect.width || y > rect.height) {
    clearBorderGlow(element);
    return;
  }
  const dx = x - rect.width / 2, dy = y - rect.height / 2;
  const edge = Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)));
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
  const proximity = (edge * 100).toFixed(3), direction = `${angle.toFixed(3)}deg`;
  if (element.style.getPropertyValue('--edge-proximity') !== proximity) element.style.setProperty('--edge-proximity', proximity);
  if (element.style.getPropertyValue('--cursor-angle') !== direction) element.style.setProperty('--cursor-angle', direction);
  if (!element.hasAttribute('data-pointer-active')) element.setAttribute('data-pointer-active', '');
}

export default function BorderGlow({
  children,
  as: Tag = 'div',
  edgeSensitivity = 30,
  backgroundColor = '#000000',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  className = ''
}) {
  const rootRef = useRef(null);

  const handlePointerMove = useCallback(event => {
    updateBorderGlow(rootRef.current, event.clientX, event.clientY);
  }, []);

  const handlePointerLeave = useCallback(() => {
    clearBorderGlow(rootRef.current);
  }, []);
  const Content = Tag === 'span' ? 'span' : 'div';

  return (
    <Tag
      ref={rootRef}
      className={`border-glow${className ? ` ${className}` : ''}`}
      data-animated={animated || undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        '--border-glow-background': backgroundColor,
        '--border-glow-radius': `${borderRadius}px`,
        '--border-glow-padding': `${glowRadius}px`,
        '--border-glow-sensitivity': edgeSensitivity,
        '--border-glow-intensity': glowIntensity,
        '--border-glow-cone': coneSpread
      }}
    >
      <span className="border-glow-edge" aria-hidden="true">
        <span className="border-glow-halo" />
      </span>
      <Content className="border-glow-content">{children}</Content>
    </Tag>
  );
}

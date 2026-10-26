/** Adapted from the Spectrum UI AvatarStack supplied with this project. */
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './AvatarStack.css';

const EMPTY_ITEMS = [];
const SIZES = { sm: 28, md: 36, lg: 44 };

function getInitials(name = '') {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) return words.slice(0, 2).map(word => Array.from(word)[0]).join('').toUpperCase();
  const letters = Array.from(words[0]);
  return /[\u3400-\u9fff]/u.test(name) ? letters.slice(-2).join('') : letters.slice(0, 2).join('').toUpperCase();
}

function AvatarImage({ item }) {
  const [failedSrc, setFailedSrc] = useState(null);
  return item.src && failedSrc !== item.src ? (
    <img src={item.src} alt="" draggable={false} loading="lazy" onError={() => setFailedSrc(item.src)} />
  ) : <span aria-hidden="true">{getInitials(item.name)}</span>;
}

export function AvatarStack({
  items = EMPTY_ITEMS,
  max = 4,
  size = 'md',
  expandable = true,
  onAvatarClick,
  ariaLabel,
  className = '',
}) {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [rovingIndex, setRovingIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const groupRef = useRef(null);
  const avatarRefs = useRef([]);
  const pillRef = useRef(null);
  const tooltipRef = useRef(null);
  const focusPillAfterRender = useRef(false);
  const previousItems = useRef(items);

  const visibleMax = Math.max(1, Number.isFinite(max) ? Math.floor(max) : 4);
  const overflowCount = Math.max(0, items.length - visibleMax);
  const shownItems = expanded ? items : items.slice(0, visibleMax);
  const pillIsInteractive = overflowCount > 0 && expandable;
  const pillIndex = shownItems.length;
  const focusableCount = shownItems.length + Number(pillIsInteractive);
  const roving = Math.min(rovingIndex, Math.max(0, focusableCount - 1));
  const activeItem = activeIndex === null ? null : shownItems[activeIndex];
  const fanned = hovered || focusWithin || expanded;

  useLayoutEffect(() => {
    if (previousItems.current !== items) {
      previousItems.current = items;
      setExpanded(false);
      setActiveIndex(null);
      setRovingIndex(0);
      focusPillAfterRender.current = false;
    }
  }, [items]);

  useLayoutEffect(() => {
    if (focusPillAfterRender.current) {
      focusPillAfterRender.current = false;
      pillRef.current?.focus();
      setRovingIndex(pillIndex);
    }
  }, [expanded, pillIndex]);

  useLayoutEffect(() => {
    if (!activeItem) {
      setTooltipPosition(null);
      return undefined;
    }
    const updatePosition = () => {
      const avatar = avatarRefs.current[activeIndex];
      if (!avatar) return;
      const rect = avatar.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 120;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 32;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      if (rect.bottom <= 0 || rect.top >= viewportHeight || rect.right <= 0 || rect.left >= viewportWidth) {
        setTooltipPosition(null);
        return;
      }
      const above = rect.top - 8 - tooltipHeight;
      const below = above < 12;
      const desiredTop = below ? rect.bottom + 8 : above;
      setTooltipPosition({
        left: Math.max(12 + tooltipWidth / 2, Math.min(viewportWidth - 12 - tooltipWidth / 2, rect.left + rect.width / 2)),
        top: Math.max(12, Math.min(viewportHeight - tooltipHeight - 12, desiredTop)),
        placement: below ? 'below' : 'above',
      });
    };
    updatePosition();
    // Track the stack as it fans out, wraps, or its section moves in the viewport.
    const observer = new ResizeObserver(updatePosition);
    if (groupRef.current) observer.observe(groupRef.current);
    if (tooltipRef.current) observer.observe(tooltipRef.current);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const group = groupRef.current;
    group?.addEventListener('transitionend', updatePosition);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      group?.removeEventListener('transitionend', updatePosition);
    };
  }, [activeIndex, activeItem, fanned, expanded]);

  function focusAt(index) {
    setRovingIndex(index);
    const node = pillIsInteractive && index === pillIndex ? pillRef.current : avatarRefs.current[index];
    node?.focus();
  }

  function collapse() {
    focusPillAfterRender.current = true;
    setActiveIndex(null);
    setExpanded(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      if (expanded) {
        event.preventDefault();
        event.stopPropagation();
        collapse();
      } else if (activeIndex !== null) {
        event.preventDefault();
        event.stopPropagation();
        setActiveIndex(null);
      }
      return;
    }
    if (!focusableCount) return;
    let next;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': next = (roving + 1) % focusableCount; break;
      case 'ArrowLeft':
      case 'ArrowUp': next = (roving - 1 + focusableCount) % focusableCount; break;
      case 'Home': next = 0; break;
      case 'End': next = focusableCount - 1; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    focusAt(next);
  }

  if (!items.length) return null;

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={ariaLabel || `${items.length} 位项目成员`}
      className={`avatar-stack${fanned ? ' avatar-stack--fanned' : ''}${expanded ? ' avatar-stack--expanded' : ''} ${className}`.trim()}
      style={{ '--avatar-size': `${SIZES[size] || SIZES.md}px` }}
      onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true); }}
      onPointerLeave={() => {
        setHovered(false);
        if (!groupRef.current?.contains(document.activeElement)) setActiveIndex(null);
      }}
      onFocus={() => setFocusWithin(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
          setActiveIndex(null);
        }
      }}
      onKeyDown={handleKeyDown}
    >
      {shownItems.map((item, index) => (
        <div
          key={`${index}-${item.name}`}
          className={`avatar-stack__item${activeIndex === index ? ' avatar-stack__item--active' : ''}${index >= visibleMax ? ' avatar-stack__item--extra' : ''}`}
          style={{ '--avatar-delay': `${Math.max(0, index - visibleMax) * 30}ms` }}
        >
          <button
            ref={node => { avatarRefs.current[index] = node; }}
            type="button"
            className="avatar-stack__avatar"
            aria-label={item.name}
            tabIndex={roving === index ? 0 : -1}
            onPointerEnter={event => { if (event.pointerType !== 'touch') setActiveIndex(index); }}
            onPointerLeave={event => {
              if (document.activeElement !== event.currentTarget) {
                setActiveIndex(current => {
                  if (current !== index) return current;
                  const focusedIndex = avatarRefs.current.findIndex(node => node === document.activeElement);
                  return focusedIndex < 0 ? null : focusedIndex;
                });
              }
            }}
            onFocus={() => {
              setActiveIndex(index);
              setRovingIndex(index);
            }}
            onClick={event => {
              setActiveIndex(index);
              setRovingIndex(index);
              event.currentTarget.focus({ preventScroll: true });
              onAvatarClick?.(item, index);
            }}
          >
            <AvatarImage item={item} />
          </button>
        </div>
      ))}
      {overflowCount > 0 && (pillIsInteractive ? (
        <button
          ref={pillRef}
          type="button"
          className="avatar-stack__more"
          aria-expanded={expanded}
          aria-label={expanded ? '收起成员列表' : `展开另外 ${overflowCount} 位成员`}
          tabIndex={roving === pillIndex ? 0 : -1}
          onFocus={() => {
            setActiveIndex(null);
            setRovingIndex(pillIndex);
          }}
          onClick={() => {
            focusPillAfterRender.current = true;
            setActiveIndex(null);
            setExpanded(current => !current);
          }}
        >
          <span key={expanded ? 'collapse' : 'count'} aria-hidden="true">{expanded ? '−' : `+${overflowCount}`}</span>
        </button>
      ) : <span className="avatar-stack__more avatar-stack__more--static" aria-label={`另有 ${overflowCount} 位成员`}>+{overflowCount}</span>)}
      {activeItem && typeof document !== 'undefined' && createPortal(
        <span
          ref={tooltipRef}
          className="avatar-stack__tooltip"
          aria-hidden="true"
          data-placement={tooltipPosition?.placement || 'above'}
          style={tooltipPosition ? { left: tooltipPosition.left, top: tooltipPosition.top } : { visibility: 'hidden' }}
        >{activeItem.name}</span>,
        document.body,
      )}
    </div>
  );
}

export default AvatarStack;

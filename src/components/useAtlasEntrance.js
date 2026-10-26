import { useLayoutEffect, useRef } from 'react';
import { atlasRevealDuration } from './atlasReveal';

export default function useAtlasEntrance(rootRef, ready, reduced, entranceRef, regionCount) {
  const played = useRef(false);
  const animations = useRef([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const scene = entranceRef.current;
    let frame = 0, observer;
    const stopWatching = () => {
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
    const finish = () => {
      cancelAnimationFrame(frame); frame = 0;
      animations.current.forEach(animation => {
        if (animation.playState === 'running' || animation.playState === 'paused') animation.finish();
      });
      if (played.current) {
        scene.phase = 'complete'; scene.progress = 1;
        scene.redraw?.();
        root.dataset.entrance = 'complete';
      }
    };
    const onInteraction = () => {
      if (!played.current) {
        played.current = true;
        root.dataset.entranceRuns = '0';
        root.dataset.entranceSkipped = 'interaction';
        stopWatching();
      }
      if (scene.phase !== 'complete') finish();
    };
    const reveal = () => {
      if (!ready || played.current) return;
      played.current = true;
      root.dataset.entranceRuns = '1';
      stopWatching();
      if (reduced || typeof root.animate !== 'function') { finish(); return; }
      scene.phase = 'running'; scene.progress = 0;
      root.dataset.entrance = 'running';
      scene.redraw?.();
      const effects = [root.animate([
        { transform: 'translateY(16px)' }, { transform: 'translateY(0)' },
      ], { duration: 850, easing: 'cubic-bezier(.23,1,.32,1)' })];
      const parts = ['.branch-atlas__search', '.branch-atlas__panel-content', '.branch-atlas__panel-actions'];
      parts.forEach((selector, index) => {
        const node = root.querySelector(selector);
        if (node) effects.push(node.animate([
          { transform: 'translateY(12px)' }, { transform: 'translateY(0)' },
        ], { duration: 700, delay: 40 + index * 50, easing: 'cubic-bezier(.23,1,.32,1)' }));
      });
      const title = root.closest('section')?.querySelector('.home-flow-title');
      if (title) effects.push(title.animate([
        { transform: 'translateY(10px)' }, { transform: 'translateY(0)' },
      ], { duration: 650, easing: 'cubic-bezier(.23,1,.32,1)' }));
      animations.current = effects;
      effects.forEach(animation => animation.finished.catch(() => {}));
      const duration = atlasRevealDuration(regionCount);
      let began;
      const tick = time => {
        if (began === undefined) began = time;
        scene.progress = Math.min(1, (time - began) / duration);
        scene.redraw?.();
        if (scene.progress < 1) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    };
    function check() {
      const viewport = root.querySelector('.branch-atlas__viewport');
      const rect = (viewport || root).getBoundingClientRect();
      if (rect.top < window.innerHeight * .68 && rect.bottom > 88) reveal();
    }
    const onVisibility = () => { if (document.hidden && scene.phase === 'running') finish(); };
    root.addEventListener('pointerdown', onInteraction, true);
    root.addEventListener('click', onInteraction, true);
    root.addEventListener('keydown', onInteraction, true);
    document.addEventListener('visibilitychange', onVisibility);
    if (played.current) { if (reduced) finish(); }
    else {
      observer = new IntersectionObserver(check, { threshold: [0, .2, .4] });
      observer.observe(root);
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      check();
    }
    return () => {
      stopWatching();
      root.removeEventListener('pointerdown', onInteraction, true);
      root.removeEventListener('click', onInteraction, true);
      root.removeEventListener('keydown', onInteraction, true);
      document.removeEventListener('visibilitychange', onVisibility);
      finish();
    };
  }, [rootRef, ready, reduced, entranceRef, regionCount]);
}

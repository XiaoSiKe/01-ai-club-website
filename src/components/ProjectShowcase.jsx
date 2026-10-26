import { useEffect, useRef, useState } from 'react';
import { projects, projectHref } from '../data/projects';
import ProjectArtwork from './ProjectArtwork';
import './ProjectShowcase.css';

function Arrow({ direction = 'right' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={direction === 'left' ? { transform: 'rotate(180deg)' } : undefined}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function ProjectShowcase() {
  const railRef = useRef(null);
  const motionRef = useRef(null);
  const [position, setPosition] = useState({ index: 0, start: true, end: false });

  useEffect(() => {
    const rail = railRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let updateFrame = 0;
    let velocity = 0;
    let destination = 0;
    let pointer = null;
    let suppressClick = false;
    let clickTimer = 0;
    const maximum = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
    const clamp = value => Math.min(maximum(), Math.max(0, value));
    const stops = () => Array.from(rail.children).map(child => clamp(child.offsetLeft - rail.firstElementChild.offsetLeft));
    const closest = value => stops().reduce((best, item) => Math.abs(item - value) < Math.abs(best - value) ? item : best, 0);
    const update = () => {
      const points = stops();
      const index = maximum() > 2 && rail.scrollLeft >= maximum() - 2 ? projects.length - 1 : points.indexOf(closest(rail.scrollLeft));
      const next = { index, start: rail.scrollLeft < 2, end: rail.scrollLeft >= maximum() - 2 };
      setPosition(previous => previous.index === next.index && previous.start === next.start && previous.end === next.end ? previous : next);
    };
    const onScroll = () => {
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(update);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      velocity = 0;
      rail.removeAttribute('data-moving');
    };
    const animateTo = (target, initialVelocity = velocity) => {
      cancelAnimationFrame(frame);
      destination = clamp(target);
      velocity = initialVelocity;
      if (preference.matches) {
        rail.scrollLeft = destination;
        stop();
        update();
        return;
      }
      rail.dataset.moving = 'true';
      let last = performance.now();
      let value = rail.scrollLeft;
      const tick = now => {
        const dt = Math.min((now - last) / 1000, 0.04);
        last = now;
        // Exact critically damped spring: preserve live position and release velocity.
        const omega = 18;
        const displacement = value - destination;
        const blend = velocity + omega * displacement;
        const decay = Math.exp(-omega * dt);
        value = destination + (displacement + blend * dt) * decay;
        velocity = (velocity - omega * blend * dt) * decay;
        rail.scrollLeft = clamp(value);
        if (Math.abs(value - destination) < 0.4 && Math.abs(velocity) < 4) {
          rail.scrollLeft = destination;
          stop();
          update();
        } else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const step = direction => {
      const current = frame ? destination : rail.scrollLeft;
      const points = [...new Set(stops())];
      const target = direction > 0 ? points.find(point => point > current + 2) : points.findLast(point => point < current - 2);
      animateTo(target ?? (direction > 0 ? maximum() : 0));
    };
    motionRef.current = { step };
    const onPointerDown = event => {
      stop();
      clearTimeout(clickTimer);
      suppressClick = false;
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: rail.scrollLeft, dragging: false, samples: [{ x: event.clientX, time: performance.now() }] };
    };
    const onPointerMove = event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (!(event.buttons & 1)) { pointer = null; rail.removeAttribute('data-dragging'); stop(); return; }
      const dx = event.clientX - pointer.x;
      if (!pointer.dragging) {
        if (Math.abs(dx) < 7) return;
        if (Math.abs(event.clientY - pointer.y) > Math.abs(dx)) { pointer = null; return; }
        pointer.dragging = true;
        rail.setPointerCapture(event.pointerId);
        rail.dataset.moving = 'true';
        rail.dataset.dragging = 'true';
      }
      event.preventDefault();
      rail.scrollLeft = clamp(pointer.start - dx);
      const now = performance.now();
      pointer.samples.push({ x: event.clientX, time: now });
      pointer.samples = pointer.samples.filter(sample => now - sample.time < 90);
    };
    const onPointerUp = event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (pointer.dragging) {
        suppressClick = true;
        clickTimer = window.setTimeout(() => { suppressClick = false; }, 0);
        const samples = pointer.samples;
        const first = samples[0];
        const last = samples[samples.length - 1];
        const release = event.type === 'pointercancel' || performance.now() - last.time > 90 || last.time === first.time
          ? 0 : Math.max(-2600, Math.min(2600, (first.x - last.x) / (last.time - first.time) * 1000));
        const projected = rail.scrollLeft + (release / 1000) * 0.99 / (1 - 0.99);
        animateTo(closest(clamp(projected)), release);
        rail.removeAttribute('data-dragging');
        if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
      }
      pointer = null;
    };
    const onClick = event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } };
    const onKeyDown = event => {
      if (event.target !== rail) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        step(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        animateTo(event.key === 'Home' ? 0 : maximum());
      }
    };
    const onPreference = () => { stop(); rail.scrollLeft = closest(rail.scrollLeft); };
    const cancelPointer = () => { pointer = null; rail.removeAttribute('data-dragging'); stop(); };
    const onResize = () => { stop(); update(); };
    const preventDrag = event => event.preventDefault();
    rail.addEventListener('scroll', onScroll, { passive: true });
    rail.addEventListener('wheel', stop, { passive: true });
    rail.addEventListener('pointerdown', onPointerDown);
    rail.addEventListener('pointermove', onPointerMove);
    rail.addEventListener('pointerup', onPointerUp);
    rail.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', cancelPointer);
    rail.addEventListener('click', onClick, true);
    rail.addEventListener('keydown', onKeyDown);
    rail.addEventListener('dragstart', preventDrag);
    preference.addEventListener('change', onPreference);
    const observer = new ResizeObserver(onResize);
    observer.observe(rail);
    update();
    return () => {
      stop();
      cancelAnimationFrame(updateFrame);
      clearTimeout(clickTimer);
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      rail.removeEventListener('scroll', onScroll);
      rail.removeEventListener('wheel', stop);
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerup', onPointerUp);
      rail.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', cancelPointer);
      rail.removeEventListener('click', onClick, true);
      rail.removeEventListener('keydown', onKeyDown);
      rail.removeEventListener('dragstart', preventDrag);
      motionRef.current = null;
    };
  }, []);

  return <section className="home-section project-section" id="projects" aria-labelledby="projects-title">
    <div className="showcase-heading" data-reveal>
      <div><p className="section-eyebrow">IDEAS INTO ACTION / 项目展廊</p><h2 className="home-flow-title" id="projects-title">好奇心，有了作品的形状。</h2><p className="section-description">从一个小想法开始，做出可以被使用的东西。</p></div>
      <span className="section-edition">01 — {String(projects.length).padStart(2, '0')}<br /><span>精选项目</span></span>
    </div>
    <div className="project-rail" id="project-rail" ref={railRef} role="region" aria-label="项目展廊，可横向滚动或使用左右方向键" tabIndex="0" data-reveal>
      {projects.map(project => <a className="project-card" key={project.id} href={projectHref(project)} aria-label={`${project.name}，${project.demo ? '查看示例项目' : '打开项目网页'}`}>
        <div className="project-card-visual">{project.image ? <img className="project-cover-image" src={project.image} alt="" width="720" height="504" loading="lazy" /> : <ProjectArtwork kind={project.artwork || project.id} />}<span className="project-card-demo">{project.demo ? '示例项目' : project.category}</span><span className="project-open-icon"><Arrow /></span></div>
        <div className="project-card-body"><div className="project-card-meta"><span>{project.category}</span><span>{project.number}</span></div><h3>{project.name}</h3><p>{project.description}</p><div className="project-card-bottom"><span>{project.tags.join(' / ')}</span><span className="project-card-action">走进项目 <span aria-hidden="true">↗</span></span></div></div>
      </a>)}
    </div>
    <div className="project-rail-footer">
      <div className="rail-caption"><span className="rail-line" /><span>横向滑动，发现更多可能</span><span className="rail-counter" aria-live="polite">{String(position.index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span></div>
      <div className="rail-controls"><button type="button" className="round-control" aria-label="上一个项目" aria-controls="project-rail" disabled={position.start} onClick={() => motionRef.current?.step(-1)}><Arrow direction="left" /></button><button type="button" className="round-control" aria-label="下一个项目" aria-controls="project-rail" disabled={position.end} onClick={() => motionRef.current?.step(1)}><Arrow /></button></div>
    </div>
    <p className="showcase-note">{projects.some(project => project.demo) ? '先看看想法的样子。标注“示例项目”的卡片为体验原型，真实作品会陆续在这里见面。' : '每一个作品，都是一次从零到一的探索。'}</p>
  </section>;
}

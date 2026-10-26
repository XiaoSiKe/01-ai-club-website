import { useEffect, useRef, useState } from 'react';

const readyPhotos = new Map();
export function prepareCampusPhoto(src) {
  if (!readyPhotos.has(src)) {
    const image = new Image();
    image.decoding = 'async';
    const ready = new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = src;
    }).then(() => image.decode?.()).catch(error => { readyPhotos.delete(src); throw error; });
    readyPhotos.set(src, ready);
  }
  return readyPhotos.get(src);
}

// Keep both photo nodes mounted. The incoming source is decoded while hidden;
// only then do the two buffers cross-fade, so quick school changes never blank.
export default function CampusCover({ branch, reduced }) {
  const [frames, setFrames] = useState([branch, branch]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const shown = useRef(branch.id);
  const layers = useRef([]);

  useEffect(() => {
    if (shown.current === branch.id) return undefined;
    let cancelled = false;
    let frame = 0;
    prepareCampusPhoto(branch.image).then(() => {
      if (cancelled) return;
      const install = () => {
        if (cancelled) return;
        const slot = 1 - activeRef.current;
        // A fast third click may arrive while this buffer is still fading out.
        // Never replace a source that contributes visible pixels to the cover.
        if (!reduced && layers.current[slot] && Number(getComputedStyle(layers.current[slot]).opacity) > .001) {
          frame = requestAnimationFrame(install);
          return;
        }
        setFrames(current => current.map((item, index) => index === slot ? branch : item));
        const activate = () => {
          if (cancelled) return;
          activeRef.current = slot;
          shown.current = branch.id;
          setActive(slot);
        };
        if (reduced) activate();
        else frame = requestAnimationFrame(activate);
      };
      install();
    }).catch(() => {
      if (cancelled) return;
      const fallback = { ...branch, image: null };
      setFrames([fallback, fallback]);
      activeRef.current = 0;
      shown.current = branch.id;
      setActive(0);
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [branch, reduced]);

  return <div className="branch-atlas__cover" data-photo={frames[active].id}>
    {frames.map((item, index) => <div key={index} ref={el => { layers.current[index] = el; }} className="branch-atlas__cover-frame" style={{ opacity: index === active ? 1 : 0 }} aria-hidden={index !== active}>
      {item.image ? <img src={item.image} alt={index === active ? item.imageAlt : ''} decoding="async" /> : <span className="branch-atlas__cover-fallback">{item.school}</span>}
    </div>)}
    <span>{frames[active].campus} · 校园影像</span>
  </div>;
}

import { memo, useLayoutEffect, useRef, useState } from 'react';
import { imageSource } from './imageSource';

const images = new Map();
export function prepareSchoolCrest(source) {
  if (images.has(source)) return images.get(source).promise;
  const item = {};
  item.promise = (async () => {
    const image = new Image();
    image.src = imageSource(source, 144, 144, 1);
    await image.decode();
    await new Promise(resolve => window.requestIdleCallback ? window.requestIdleCallback(resolve, { timeout: 500 }) : setTimeout(resolve, 0));
    const surface = document.createElement('canvas');
    surface.width = surface.height = 144;
    const context = surface.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, 144, 144);
    // Materialize the entire small crest, not just an SVG display list. Later
    // navigation copies pixels and cannot trigger another SVG decode/paint.
    item.pixels = context.getImageData(0, 0, 144, 144);
    image.removeAttribute('src');
    surface.width = surface.height = 0;
    return item.pixels;
  })();
  images.set(source, item);
  item.promise.catch(() => images.delete(source));
  return item.promise;
}

export default memo(function SchoolCrest({ branch }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    let active = true;
    const paint = pixels => {
      if (!active || !ref.current) return;
      ref.current.getContext('2d').putImageData(pixels, 0, 0);
      ref.current.dataset.school = branch.id;
      setReady(true);
    };
    const cached = images.get(branch.crest)?.pixels;
    if (cached) paint(cached);
    else prepareSchoolCrest(branch.crest).then(paint).catch(() => {});
    return () => { active = false; };
  }, [branch]);
  return <span className="school-crest branch-atlas__crest" role="img" aria-label={`${branch.school}校徽`} style={{ backgroundColor: branch.crestBackground }}>
    {!ready && <img src={imageSource(branch.crest, 144, 144, 1)} alt="" />}
    <canvas ref={ref} width="144" height="144" aria-hidden="true" />
  </span>;
});

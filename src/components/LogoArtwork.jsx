import { useId } from 'react';

// Keep supplied color pixels. Only neutral lettering changes ink for contrast;
// the alpha filter removes near-black backdrops from the original small icons.
export default function LogoArtwork({ source, width, height, viewBox, cutout, backdropThreshold = .24, lightInk, darkInk, className = 'logo-marquee__image', style, onError }) {
  const id = useId();
  return <svg className={className} viewBox={viewBox || `0 0 ${width} ${height}`} style={style} aria-hidden="true" focusable="false">
    <defs>
      {cutout && <filter id={`${id}-cutout`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 2 2 0 -${backdropThreshold}`} result="cutout" />
        {lightInk && <>
          <feColorMatrix in="cutout" type="saturate" values="0" result="gray" />
          <feBlend in="cutout" in2="gray" mode="difference" result="difference" />
          <feColorMatrix in="difference" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  20 20 20 0 0" result="chroma" />
          <feComponentTransfer in="cutout" result="inverted">
            <feFuncR type="table" tableValues="1 0" /><feFuncG type="table" tableValues="1 0" /><feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="inverted" in2="chroma" operator="out" result="neutral" />
          <feComposite in="cutout" in2="chroma" operator="in" result="colored" />
          <feMerge><feMergeNode in="neutral" /><feMergeNode in="colored" /></feMerge>
        </>}
      </filter>}
      {darkInk && <mask id={`${id}-ink`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height} style={{ maskType: 'alpha' }}>
        <image href={source} width={width} height={height} />
      </mask>}
    </defs>
    <image href={source} width={width} height={height} filter={cutout ? `url(#${id}-cutout)` : undefined} onError={onError} />
    {darkInk && <rect x={darkInk.x} y="0" width={width - darkInk.x} height={height} fill="#fff" mask={`url(#${id}-ink)`} />}
  </svg>;
}

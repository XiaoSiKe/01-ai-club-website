import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SpecularButton from '../SpecularButton';
import ResponsiveImage from './ResponsiveImage';
import './ImageLightbox.css';

export default function ImageLightbox({ item, opener, buttonProps, onClose }) {
  const dialogRef = useRef(null);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const close = () => {
    dialogRef.current.close();
    opener?.focus({ preventScroll: true });
    onClose();
  };
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className="image-lightbox" aria-labelledby="lightbox-caption"
      style={{ '--lightbox-aspect': item.fullAspectRatio || item.aspectRatio || 1.5 }}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <figure className="image-lightbox__figure">
        <div className="image-lightbox__media" aria-busy={!ready && !failed}>
          {!ready && <ResponsiveImage className="image-lightbox__preview" src={item.image || item.src} alt="" aria-hidden="true" eager />}
          <ResponsiveImage className={`image-lightbox__full${ready ? ' is-ready' : ''}`} src={item.fullImage || item.image || item.src} eager
            alt={item.title || item.alt || ''} decoding="async" onLoad={() => setReady(true)} onError={() => setFailed(true)} />
        </div>
        <figcaption id="lightbox-caption">{item.title || item.alt}{item.credit && <span className="image-lightbox__credit">{item.credit}</span>}{failed && <span>高清图暂时无法加载，当前显示预览图。</span>}</figcaption>
      </figure>
      <SpecularButton {...buttonProps} renderMode="css" className="image-lightbox__close" ariaLabel="退出" autoFocus onClick={close}>
        退出
      </SpecularButton>
    </dialog>, document.body
  );
}

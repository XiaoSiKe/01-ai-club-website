import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { communityMoments, communityPublications, wechatChannel } from '../data/community';
import './CommunitySections.css';

function Arrow({ direction = 'right', ...props }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d={direction === 'left' ? 'M19 12H5m6 6-6-6 6-6' : 'M5 12h14m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WechatMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M26 16.5C26 10.7 20.8 6 14.5 6S3 10.7 3 16.5c0 3.2 1.6 6.1 4.2 8l-1 4.3 4.9-2.3c1.1.3 2.2.5 3.4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M37 25c0-4.9-4.5-9-10-9s-10 4.1-10 9 4.5 9 10 9c1.1 0 2.1-.2 3.1-.4l4.1 1.9-.8-3.6A8.7 8.7 0 0 0 37 25Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10.5" cy="15" r="1.4" fill="currentColor" /><circle cx="18.5" cy="15" r="1.4" fill="currentColor" /><circle cx="23.5" cy="24" r="1.2" fill="currentColor" /><circle cx="30.5" cy="24" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function CommunitySections() {
  const [selection, setSelection] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);
  const animationRef = useRef(null);
  const closingRef = useRef(false);
  const requestedPhotoRef = useRef(0);
  const photoRequestRef = useRef(0);
  const backdropPressRef = useRef(false);
  const isOpen = selection !== null;
  const activeMoment = selection?.type === 'photo' ? communityMoments[selection.index] : null;
  const activeArticle = selection?.type === 'article' ? communityPublications[selection.index] : null;

  const openDialog = useCallback((type, index, event) => {
    openerRef.current = event.currentTarget;
    requestedPhotoRef.current = index;
    photoRequestRef.current += 1;
    setPhotoMessage('');
    setSelection({ type, index });
  }, []);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    closingRef.current = true;
    photoRequestRef.current += 1;
    animationRef.current?.kill();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.close();
      return;
    }
    animationRef.current = gsap.to(panelRef.current, {
      opacity: 0,
      y: 12,
      scale: 0.985,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => dialog.close(),
    });
  }, []);

  const navigatePhoto = useCallback(async (direction) => {
    if (closingRef.current) return;
    const index = (requestedPhotoRef.current + direction + communityMoments.length) % communityMoments.length;
    requestedPhotoRef.current = index;
    const request = ++photoRequestRef.current;
    setPhotoMessage('');
    const image = new Image();
    image.src = communityMoments[index].image;
    try {
      // Keep the current image visible until the next one is decoded.
      await image.decode();
      if (request !== photoRequestRef.current || !dialogRef.current?.open) return;
      setSelection((current) => current?.type === 'photo' ? { ...current, index } : current);
    } catch {
      if (request === photoRequestRef.current && dialogRef.current?.open) {
        setPhotoMessage('这张照片暂时无法加载，可以试试其他照片。');
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    closingRef.current = false;
    const handleMotionChange = (event) => {
      if (!event.matches) return;
      animationRef.current?.kill();
      gsap.set(panel, { clearProps: 'transform,opacity' });
      if (closingRef.current && dialog.open) dialog.close();
    };
    motionPreference.addEventListener('change', handleMotionChange);
    body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbarWidth}px`;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
    if (!motionPreference.matches) {
      animationRef.current = gsap.fromTo(panel,
        { opacity: 0, y: 16, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'power3.out', clearProps: 'transform,opacity' });
    }
    return () => {
      animationRef.current?.kill();
      motionPreference.removeEventListener('change', handleMotionChange);
      photoRequestRef.current += 1;
      gsap.set(panel, { clearProps: 'transform,opacity' });
      if (dialog.open) dialog.close();
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.paddingRight = previousPadding;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(wechatChannel.account);
      setCopyMessage('公众号 ID 已复制，可在微信中搜索。');
    } catch {
      setCopyMessage(`请在微信中搜索：${wechatChannel.account}`);
    }
  };

  return (
    <>
      <section className="home-section community-section" id="activities" aria-labelledby="activities-title">
        <div className="community-heading" data-reveal>
          <div>
            <p className="community-eyebrow">MEET. MAKE. CONNECT.</p>
            <h2 className="home-flow-title" id="activities-title">相聚，让想法有回响。</h2>
          </div>
          <p className="community-section-intro">交流、动手，也一起度过平常的一天。<br />在这里，留下屏幕之外的日新社。</p>
        </div>
        <div className="community-gallery" data-reveal>
          {communityMoments.map((moment, index) => (
            <button
              className={`community-moment${index === 0 ? ' community-moment-featured' : ''}`}
              type="button"
              key={moment.id}
              onClick={(event) => openDialog('photo', index, event)}
              aria-label={`查看${moment.category}：${moment.title}${moment.isExample ? '（示例影像）' : ''}`}
              aria-haspopup="dialog"
            >
              <img src={moment.image} alt={moment.imageAlt} loading="lazy" decoding="async" width="1440" height="960" />
              <span className="community-moment-shade" />
              <span className="community-moment-top"><span>{moment.category}</span>{moment.isExample && <span className="community-example-badge">示例影像</span>}</span>
              <span className="community-moment-caption">
                <span><strong>{moment.title}</strong>{index === 0 && <span className="community-moment-description">{moment.description}</span>}</span>
                <span className="community-open-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
            </button>
          ))}
        </div>
        <p className="community-gallery-note">{communityMoments.some((moment) => moment.isExample) ? 'AI 生成示意图与示例文案，不代表实际活动记录。真实记录将陆续更新。' : '点击照片，展开活动记录。'}</p>
      </section>

      <section className="home-section community-section" id="updates" aria-labelledby="updates-title">
        <div className="community-heading" data-reveal>
          <div>
            <p className="community-eyebrow">THE NEXT CHAPTER</p>
            <h2 className="home-flow-title" id="updates-title">让交流，继续发生。</h2>
          </div>
          <p className="community-section-intro">把探索写成文字，把新的相遇带到这里。<br />项目手记、学习分享与社团动态。</p>
        </div>
        <div className="community-updates-grid" data-reveal>
          <aside className="community-wechat" aria-labelledby="wechat-title">
            <div className="community-wechat-top"><span className="community-wechat-icon"><WechatMark /></span><span className="community-small-label">微信公众号</span></div>
            <h3 id="wechat-title">{wechatChannel.name}</h3>
            <p className="community-wechat-description">下一次分享，<br />也想让你在场。</p>
            <p className="community-wechat-copy">在这里继续关注我们的学习、创造与日常。</p>
            {wechatChannel.qr ? (
              <div className="community-wechat-qr"><img src={wechatChannel.qr} alt={`${wechatChannel.name}微信公众号二维码`} width="140" height="140" loading="lazy" /><span>微信扫码，和我们保持联系</span></div>
            ) : !wechatChannel.url && !wechatChannel.account ? (
              <div className="community-wechat-pending"><span className="community-pending-dot" /><span>公众号入口即将补充</span></div>
            ) : null}
            {wechatChannel.account && <button className="community-account-copy" type="button" onClick={copyAccount}>ID：{wechatChannel.account}<span>复制</span></button>}
            {copyMessage && <p className="community-copy-status" role="status">{copyMessage}</p>}
            <a className="community-channel-link" href={wechatChannel.url || '#join'} {...(wechatChannel.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span>{wechatChannel.url ? '前往公众号' : '先加入社群，保持联系'}</span><Arrow />
            </a>
          </aside>
          <div className="community-publications">
            <div className="community-publications-heading"><h3>来自日新社的手记</h3><span>JOURNAL</span></div>
            {communityPublications.map((article, index) => {
              const content = <><span className="community-publication-number">{String(index + 1).padStart(2, '0')}</span><span className="community-publication-content"><span className="community-publication-meta">{article.category}{article.isExample && <span>示例手记</span>}</span><strong>{article.title}</strong><span className="community-publication-excerpt">{article.excerpt}</span></span><Arrow className="community-publication-arrow" /></>;
              return article.url ? <a className="community-publication" key={article.id} href={article.url} target="_blank" rel="noopener noreferrer">{content}</a> : <button className="community-publication" key={article.id} type="button" aria-haspopup="dialog" onClick={(event) => openDialog('article', index, event)}>{content}</button>;
            })}
          </div>
        </div>
      </section>

      <dialog
        className="community-dialog"
        ref={dialogRef}
        aria-labelledby="community-dialog-title"
        onClose={() => setSelection(null)}
        onCancel={(event) => { event.preventDefault(); closeDialog(); }}
        onPointerDown={(event) => { backdropPressRef.current = event.target === event.currentTarget; }}
        onClick={(event) => { if (event.target === event.currentTarget && backdropPressRef.current) closeDialog(); }}
        onKeyDown={(event) => {
          if (selection?.type !== 'photo') return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            navigatePhoto(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        <div className={`community-dialog-panel${activeArticle ? ' community-dialog-article' : ''}`} ref={panelRef}>
          <button className="community-icon-button community-dialog-close" type="button" onClick={closeDialog} aria-label="关闭" ref={closeButtonRef}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          {activeMoment && <>
            <div className="community-dialog-photo-stage">
              {communityMoments.map((moment, index) => <img className={`community-dialog-photo${selection.index === index ? ' is-current' : ''}`} key={moment.id} src={moment.image} alt={selection.index === index ? moment.imageAlt : ''} aria-hidden={selection.index !== index} width="1200" height="800" />)}
            </div>
            <div className="community-dialog-details">
              <div className="community-dialog-meta"><span>{activeMoment.category}</span><span>{activeMoment.isExample ? '示例影像 · 非实际活动记录' : '社团活动记录'}</span></div>
              <h2 id="community-dialog-title">{activeMoment.title}</h2>
              <p>{activeMoment.description}</p>
              {photoMessage && <p role="status">{photoMessage}</p>}
              <div className="community-dialog-pagination"><span aria-live="polite" aria-atomic="true">{String(selection.index + 1).padStart(2, '0')} / {String(communityMoments.length).padStart(2, '0')}<span className="community-pagination-hint">也可用键盘左右键浏览</span></span><div><button className="community-icon-button" type="button" aria-label="上一张照片" onClick={() => navigatePhoto(-1)}><Arrow direction="left" /></button><button className="community-icon-button" type="button" aria-label="下一张照片" onClick={() => navigatePhoto(1)}><Arrow /></button></div></div>
            </div>
          </>}
          {activeArticle && <article className="community-article-body"><p className="community-eyebrow">01AIClub · JOURNAL</p><p className="community-dialog-meta">{activeArticle.category}{activeArticle.isExample && <span>示例手记 · 非已发布文章</span>}</p><h2 id="community-dialog-title">{activeArticle.title}</h2><p className="community-article-lead">{activeArticle.excerpt}</p>{activeArticle.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="community-article-end">从零到一，一起探索。</div></article>}
        </div>
      </dialog>
    </>
  );
}

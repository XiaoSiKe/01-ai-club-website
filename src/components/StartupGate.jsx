import { useEffect, useState } from 'react';
import UniqueLoading from './UniqueLoading';
import { startupImageSources } from './heroImages';

// Keep only settled readiness promises, never decoded Image objects. StrictMode
// and retry can reuse successful requests without downloading them again.
const images = new Map();
function prepareImage(src) {
  if (images.has(src)) return images.get(src);
  const request = new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => finish(new Error('Image timed out')), 20000);
    const finish = error => {
      clearTimeout(timer);
      image.onload = image.onerror = null;
      image.removeAttribute('src');
      if (error) reject(error); else resolve();
    };
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.onerror = () => finish(new Error('Image unavailable'));
    image.onload = () => image.decode().then(() => finish(), finish);
    image.src = src;
  }).catch(error => { images.delete(src); throw error; });
  images.set(src, request);
  return request;
}

async function prepareImages(sources, onProgress) {
  // Discover every critical download together. Fetching must not wait for the
  // previous batch to decode; only the explicit decode work stays bounded.
  const preloads = sources.map(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    link.dataset.startupPreload = '';
    document.head.appendChild(link);
    return link;
  });
  let next = 0, completed = 0;
  try {
    const results = await Promise.allSettled(Array.from({ length: Math.min(3, sources.length) }, async () => {
      while (next < sources.length) {
        await prepareImage(sources[next++]);
        onProgress(++completed);
      }
    }));
    if (results.some(result => result.status === 'rejected')) throw new Error('Startup images unavailable');
  } finally {
    preloads.forEach(link => link.remove());
  }
}

export default function StartupGate({ loadPage, homepage, projectId }) {
  const [Page, setPage] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const sources = startupImageSources(homepage, window.innerWidth, window.devicePixelRatio);
    setFailed(false);
    setProgress({ completed: 0, total: sources.length });
    Promise.all([
      loadPage(),
      prepareImages(sources, completed => { if (active) setProgress({ completed, total: sources.length }); }),
    ]).then(([module]) => {
      if (!active) return;
      performance.mark('site:first-screen-ready', { detail: { images: sources.length } });
      setPage(() => module.default);
    })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [loadPage, homepage]);

  if (Page) return <Page projectId={projectId} />;
  return <main className="project-loading startup-loading" aria-busy={!failed} data-startup-state={failed ? 'error' : 'loading'}>
    <div className="startup-loading__content">
      <UniqueLoading text={failed ? '加载遇到问题' : '正在准备首屏'} />
      <p className="startup-loading__title">{failed ? '加载遇到问题' : '正在准备首屏'}</p>
      {failed ? <>
        <p className="startup-loading__hint" role="alert">请检查网络连接，再试一次。</p>
        <button className="startup-loading__retry" onClick={() => window.location.reload()}>重新加载</button>
      </> : <>
        <progress className="startup-loading__progress" max={progress.total || 1} value={progress.completed} aria-label="首屏图片加载进度" />
        <p className="startup-loading__hint">图片就绪后，自动进入</p>
      </>}
    </div>
  </main>;
}

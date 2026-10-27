/* Regression: a stale visibility signal must neither skip nor finish a fly. */
(async () => {
  const root = document.querySelector('.branch-atlas');
  const viewport = root.querySelector('.branch-atlas__viewport');
  const layer = root.querySelector('.branch-atlas__map');
  const frame = () => new Promise(requestAnimationFrame);
  const click = node => node.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  const settle = async () => { await frame(); const start=performance.now(); while(viewport.dataset.moving==='true'){if(performance.now()-start>6000)throw Error('Camera did not settle');await frame();} };
  const show = () => window.scrollBy({top:root.getBoundingClientRect().top-140,behavior:'instant'});
  show(); await frame();
  click(root.querySelector('.branch-atlas__toolbar nav button')); await settle();
  click(root.querySelector('[aria-label="查看福州理工学院分社"]'));
  const initial = new Set();
  for(let i=0;i<12;i++){await frame();initial.add((layer.atlasFrame?.transform || layer.getAttribute('transform')));}
  window.scrollTo({top:0,behavior:'instant'});
  for(let i=0;i<3;i++)await frame();
  const paused=(layer.atlasFrame?.transform || layer.getAttribute('transform'));
  let unchanged=0;
  for(let i=0;i<20;i++){await frame();if((layer.atlasFrame?.transform || layer.getAttribute('transform'))===paused)unchanged++;}
  show(); const resumed=new Set();
  for(let i=0;i<20;i++){await frame();resumed.add((layer.atlasFrame?.transform || layer.getAttribute('transform')));}
  await settle();
  return {initialDistinctPoses:initial.size,pausedFrames:unchanged,resumedDistinctPoses:resumed.size,visible:viewport.dataset.visible,hidden:document.hidden,pass:initial.size>8&&unchanged===20&&resumed.size>12&&!document.hidden};
})()

/* Actual-pixel regression for the three school navigation paths. Run in CUA/CDP. */
(async () => {
  const root=document.querySelector('.branch-atlas'), canvas=root.querySelector('canvas.branch-atlas__map');
  const frame=()=>new Promise(requestAnimationFrame);
  const until=async fn=>{const start=performance.now();while(!fn()){if(performance.now()-start>8000)throw Error('Local map probe timed out');await frame();}};
  const click=node=>{if(!node)throw Error('Missing map action');node.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));};
  root.scrollIntoView({block:'center',behavior:'instant'});
  await until(()=>canvas.atlasFrame&&root.dataset.entrance==='complete');
  const settle=async()=>{await frame();await until(()=>root.querySelector('.branch-atlas__viewport').dataset.moving==='false');};
  click(root.querySelector('.branch-atlas__toolbar nav button'));await settle();
  click(root.querySelector('[aria-label="进入福建分社地图"]'));await settle();
  click(root.querySelector('[aria-label="进入福州高校地图"]'));await settle();
  const scratch=document.createElement('canvas');scratch.width=scratch.height=64;
  const ctx=scratch.getContext('2d',{willReadFrequently:true});
  const report={renderer:canvas.tagName,paths:[],pixelSamples:0,blankPixels:[],renderDurations:[],frameGaps:[],movingFrames:0};
  const samplePixels=async label=>{
    const bitmap=await createImageBitmap(canvas);ctx.drawImage(bitmap,0,0,64,64);bitmap.close();
    const pixels=ctx.getImageData(0,0,64,64).data;
    const bg=parseInt(canvas.atlasFrame.background.slice(1,3),16);let geographic=0;
    for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-bg)>2||Math.abs(pixels[i+1]-bg)>2||Math.abs(pixels[i+2]-bg)>2)geographic++;
    report.pixelSamples++;
    if(geographic<8)report.blankPixels.push({label,frame:{...canvas.atlasFrame},geographic});
  };
  const actions=[
    ['fuzhou-to-fzu','[aria-label="查看福州大学总社"]'],
    ['fzu-to-fjut','[aria-label="查看下一所高校"]'],
    ['fjut-to-mju','[aria-label="查看下一所高校"]'],
    ['mju-to-fuzhou','[aria-label="返回上一级地图"]'],
    ['fuzhou-to-mju','[aria-label="查看闽江大学分社"]'],
    ['mju-to-fjut','[aria-label="查看上一所高校"]'],
    ['fjut-to-fuzhou','[aria-label="返回上一级地图"]'],
  ];
  for(let round=0;round<2;round++)for(const [label,selector]of actions){
    // Each round ends in the city overview.
    click(root.querySelector(selector));let previous;
    for(let i=0;i<180;i++){
      const time=await frame();
      if(previous)report.frameGaps.push(time-previous);previous=time;
      report.renderDurations.push(canvas.atlasFrame.renderMs);
      if(root.querySelector('.branch-atlas__viewport').dataset.moving==='true')report.movingFrames++;
      if([0,4,12,28,52].includes(i))await samplePixels(label);
      if(i>55&&root.querySelector('.branch-atlas__viewport').dataset.moving==='false')break;
    }
    await samplePixels(label+'-settled');report.paths.push(label);
  }
  const times=report.renderDurations.sort((a,b)=>a-b);
  report.renderP95=times[Math.floor(times.length*.95)];report.renderMax=Math.max(...times);
  report.pass=report.blankPixels.length===0&&report.movingFrames>200&&report.renderP95<16;
  delete report.renderDurations;delete report.frameGaps;
  return report;
})()

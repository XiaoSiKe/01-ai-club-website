/* Pixel checks while the camera is interrupted every six frames. */
(async()=>{
  const root=document.querySelector('.branch-atlas'),canvas=root.querySelector('canvas.branch-atlas__map');
  const frame=()=>new Promise(requestAnimationFrame);
  const click=n=>n.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));
  const settle=async()=>{await frame();while(root.querySelector('.branch-atlas__viewport').dataset.moving==='true')await frame();};
  // The local probe leaves the atlas in the Fuzhou overview.
  click(root.querySelector('[aria-label="查看福州大学总社"]'));await settle();
  const scratch=document.createElement('canvas');scratch.width=scratch.height=64;const ctx=scratch.getContext('2d',{willReadFrequently:true});
  let samples=0,blank=0,replaced=0;const hashes=new Set();
  const sample=async()=>{const image=await createImageBitmap(canvas);ctx.drawImage(image,0,0,64,64);image.close();const p=ctx.getImageData(0,0,64,64).data,bg=parseInt(canvas.atlasFrame.background.slice(1,3),16);let count=0,hash=2166136261;for(let i=0;i<p.length;i+=4){if(Math.abs(p[i]-bg)>2||Math.abs(p[i+1]-bg)>2||Math.abs(p[i+2]-bg)>2)count++;hash=Math.imul(hash^p[i],16777619);}hashes.add(hash>>>0);if(count<8)blank++;if(canvas!==root.querySelector('canvas.branch-atlas__map'))replaced++;samples++;};
  for(let i=0;i<12;i++){click(root.querySelector('[aria-label="查看下一所高校"]'));for(let j=0;j<6;j++){await frame();if(j===0||j===5)await sample();}}
  await settle();await sample();
  return {clicks:12,pixelSamples:samples,distinctImages:hashes.size,blankFrames:blank,replacedSurfaces:replaced,pass:blank===0&&replaced===0&&hashes.size>12};
})()

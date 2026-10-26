import { atlasLayerOpacity } from './atlasCamera';
import { atlasRegionReveal } from './atlasReveal';

const compiledMaps = new WeakMap();
const intersects = (a, b) => !a || a[0][0] <= b[1][0] && a[1][0] >= b[0][0] && a[0][1] <= b[1][1] && a[1][1] >= b[0][1];

function compile(atlas) {
  if (compiledMaps.has(atlas)) return compiledMaps.get(atlas);
  const result = {};
  for (const key of ['context', 'china', 'fujian', 'fuzhou', 'localDetails', 'campuses']) {
    result[key] = atlas[key].map(item => ({ ...item, path: new Path2D(item.d) }));
  }
  // A geographic wave from the northwest to the southeast, compiled once.
  const regionPosition = item => (item.bounds[0][0] + item.bounds[1][0]) / 2 + (item.bounds[0][1] + item.bounds[1][1]) * .55;
  [...result.china].sort((a, b) => regionPosition(a) - regionPosition(b))
    .forEach((item, order) => { item.revealOrder = order; });
  result.graticule = new Path2D(atlas.graticule);
  result.localLabels = [...(atlas.localLabels || [])].sort((a, b) => {
    const priority = { campus: 0, water: 1, station: 2, road: 3 };
    return priority[a.kind] - priority[b.kind] || b.span - a.span;
  });
  result.connections = Object.keys(atlas.campusViews).filter(id => id !== 'fzu').map(id => {
    const a = atlas.points.fzu, b = atlas.points[id];
    return { id, path: new Path2D(`M${a[0]} ${a[1]}Q${(a[0]+b[0])/2-.024} ${(a[1]+b[1])/2-.02} ${b[0]} ${b[1]}`) };
  });
  compiledMaps.set(atlas, result);
  return result;
}

// One bounded back buffer holds the whole next frame. Only a completed image
// is copied to the visible canvas; no live SVG layers are hidden/reinserted.
export function createAtlasPainter(canvas, atlas) {
  const geometry = compile(atlas);
  const back = document.createElement('canvas');
  const context = back.getContext('2d', { alpha: false });
  const display = canvas.getContext('2d', { alpha: false });
  let last;
  let version = 0;

  const paint = (pose, size, options) => {
    const started = performance.now();
    const { width, height } = size, { palette: p, selectedId, hoveredId, view, entrance, reduced } = options;
    const revealProgress = view === 'china' && !reduced && entrance?.phase !== 'complete' ? entrance?.progress ?? 1 : 1;
    let revealedRegions = revealProgress === 1 ? geometry.china.length : 0;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(width * ratio)), pixelHeight = Math.max(1, Math.round(height * ratio));
    if (back.width !== pixelWidth || back.height !== pixelHeight) {
      back.width = pixelWidth;
      back.height = pixelHeight;
    }
    const scale = Math.exp(pose.z), dx = width / 2 - pose.x * scale, dy = height / 2 - pose.y * scale;
    const windowBounds = [[pose.x-width/2/scale, pose.y-height/2/scale], [pose.x+width/2/scale, pose.y+height/2/scale]];
    context.setTransform(1,0,0,1,0,0);
    context.globalAlpha = 1;
    context.fillStyle = p.bg;
    context.fillRect(0,0,pixelWidth,pixelHeight);
    context.setTransform(scale*ratio,0,0,scale*ratio,dx*ratio,dy*ratio);
    context.lineJoin = context.lineCap = 'round';
    context.setLineDash([]);
    context.shadowBlur = 0;
    let drawn = 0;
    const shape = (item, fill, stroke, lineWidth, alpha = 1, fillAlpha = 1, strokeAlpha = 1) => {
      if (alpha < .001 || !intersects(item.bounds, windowBounds)) return;
      if (fill) { context.globalAlpha = alpha * fillAlpha; context.fillStyle = fill; context.fill(item.path); }
      if (stroke) { context.globalAlpha = alpha * strokeAlpha; context.strokeStyle = stroke; context.lineWidth = lineWidth / scale; context.stroke(item.path); }
      drawn++;
    };
    const opacity = Object.fromEntries(['world','china','fujian','fuzhou','local'].map(layer => [layer,atlasLayerOpacity(layer,scale)]));
    if (opacity.world > .001) {
      for (const item of geometry.context) shape(item,p.world,p.worldLine,.65,opacity.world*.65);
      shape({path:geometry.graticule},null,p.worldLine,.4,opacity.world*.16);
    }
    if (opacity.china > .001) for (const item of geometry.china) {
      const home = item.id === '350000';
      const glowing = home && hoveredId === 'fujian';
      if (glowing) { context.shadowColor = p.ink; context.shadowBlur = 14 * ratio; }
      if (revealProgress < 1) {
        const reveal = atlasRegionReveal(revealProgress, item.revealOrder, geometry.china.length);
        if (reveal.complete) revealedRegions++;
        context.save();
        context.translate(0, reveal.offsetY / scale);
        shape(item,glowing?p.line:home?p.highlight:p.land,home?p.ink:p.line,glowing?2:home?1.2:.7,opacity.china * reveal.opacity);
        context.restore();
      } else shape(item,glowing?p.line:home?p.highlight:p.land,home?p.ink:p.line,glowing?2:home?1.2:.7,opacity.china);
      context.shadowBlur = 0;
    }
    if (opacity.fujian > .001) for (const item of geometry.fujian) {
      const home = item.id === '350100';
      const glowing = home && hoveredId === 'fuzhou';
      if (glowing) { context.shadowColor = p.ink; context.shadowBlur = 14 * ratio; }
      shape(item,glowing?p.line:home?p.highlight:p.land,home?p.ink:p.line,glowing?2:home?1:.65,opacity.fujian);
      context.shadowBlur = 0;
    }
    if (opacity.fuzhou > .001) for (const item of geometry.fuzhou) shape(item,p.bg,p.line,.65,opacity.fuzhou,1,.55);
    const contextLabels = [];
    if (opacity.local > .001) {
      for (const item of geometry.localDetails) {
        if (!item.area || item.kind === 'building') continue;
        const fill = item.kind === 'water' ? p.water : item.kind === 'green' ? p.green : item.kind === 'campus' ? p.campus : p.neighborhood;
        shape(item,fill,null,0,opacity.local);
      }
      for (const item of geometry.campuses) {
        const active = item.id === selectedId || item.id === hoveredId;
        shape(item,p.highlight,null,0,opacity.local,active ? .42 : .25);
      }
      const buildingOpacity = Math.max(0, Math.min(1, (scale - 900) / 700));
      for (const item of geometry.localDetails) {
        if (item.kind === 'road') {
          const major = /^(motorway|trunk|primary|secondary)/.test(item.class);
          const width = major ? 2.6 : /^tertiary/.test(item.class) ? 1.6 : /^(service|footway|cycleway)/.test(item.class) ? .65 : 1;
          if (major) shape(item,null,p.bg,width+2,opacity.local);
          shape(item,null,major || /^tertiary/.test(item.class) ? p.street : p.minorStreet,width,opacity.local);
        } else if (item.kind === 'building') {
          if ((item.bounds[1][0]-item.bounds[0][0])*scale < 2 || (item.bounds[1][1]-item.bounds[0][1])*scale < 2) continue;
          shape(item,p.building,p.buildingLine,.5,opacity.local*buildingOpacity);
        } else if (item.kind === 'water' && !item.area) {
          shape(item,null,p.water,item.class === 'river' ? 5 : 2,opacity.local);
        } else if (item.kind === 'railway') {
          context.setLineDash([4/scale,4/scale]);
          shape(item,null,p.line,.8,opacity.local*.5);
          context.setLineDash([]);
        }
      }
      for (const item of geometry.campuses) {
        const active = item.id === selectedId || item.id === hoveredId;
        const glowing = item.id === hoveredId;
        if (glowing) { context.shadowColor = p.ink; context.shadowBlur = 14 * ratio; }
        shape(item,glowing?p.line:null,active?p.ink:p.line,glowing?2:active?1.1:.8,opacity.local);
        context.shadowBlur = 0;
      }
      context.setLineDash([3/scale,6/scale]);
      for (const item of geometry.connections) {
        const active = selectedId && (selectedId === item.id || selectedId === 'fzu');
        shape(item,null,p.ink,1,opacity.local*(active ? .35 : view === 'fuzhou' ? .28 : .12));
      }
      context.setLineDash([]);

      // Keep contextual labels in screen space and reserve room for the
      // interactive school labels, toolbar and map hints.
      const occupied = Object.entries(atlas.points).filter(([id]) => id !== 'fuzhou').map(([, point]) => ({
        x: point[0]*scale+dx-150, y: point[1]*scale+dy-26, width: 300, height: 72,
      }));
      const overlaps = (a, b) => a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
      const named = new Set();
      context.save();
      context.setTransform(ratio,0,0,ratio,0,0);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const item of geometry.localLabels) {
        if (named.has(item.name) || contextLabels.length >= (width < 500 ? 7 : 16)) continue;
        if (item.kind === 'road' && /^(service|footway|path|steps|cycleway|construction|proposed)/.test(item.class)) continue;
        const fontSize = item.kind === 'campus' ? 12 : 11;
        context.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        const textWidth = context.measureText(item.name).width;
        if (item.kind === 'road' && item.span*scale < textWidth+24) continue;
        const angle = item.kind === 'road' || item.kind === 'water' && item.span ? item.angle : 0;
        const x = item.point[0]*scale+dx, y = item.point[1]*scale+dy;
        const box = { x: x-(Math.abs(Math.cos(angle))*textWidth+Math.abs(Math.sin(angle))*fontSize)/2-8,
          y: y-(Math.abs(Math.sin(angle))*textWidth+Math.abs(Math.cos(angle))*fontSize)/2-8,
          width: Math.abs(Math.cos(angle))*textWidth+Math.abs(Math.sin(angle))*fontSize+16,
          height: Math.abs(Math.sin(angle))*textWidth+Math.abs(Math.cos(angle))*fontSize+16 };
        if (box.x < 24 || box.x+box.width > width-24 || box.y < 72 || box.y+box.height > height-52 || occupied.some(other => overlaps(box,other))) continue;
        context.save();
        context.translate(x,y);
        context.rotate(angle);
        context.globalAlpha = opacity.local;
        context.strokeStyle = p.bg;
        context.lineWidth = 4;
        context.strokeText(item.name,0,0);
        context.fillStyle = p.quiet;
        context.fillText(item.name,0,0);
        context.restore();
        occupied.push(box);
        named.add(item.name);
        contextLabels.push(item.name);
      }
      context.restore();
    }
    if (options.markerConnectors?.length) {
      context.save();
      context.setTransform(ratio,0,0,ratio,0,0);
      context.globalAlpha = .65;
      context.strokeStyle = p.quiet;
      context.lineWidth = .8;
      context.beginPath();
      for (const line of options.markerConnectors) { context.moveTo(line.x,line.y); context.lineTo(line.endX,line.endY); }
      context.stroke();
      context.restore();
    }
    // Full-frame copy is atomic from the user's point of view. Never clear the
    // visible surface between two geographic layers or two selected schools.
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    display.setTransform(1,0,0,1,0,0);
    display.globalCompositeOperation = 'copy';
    display.drawImage(back,0,0);
    last = { pose: { ...pose }, width, height, scale, dx, dy, drawn };
    canvas.dataset.frame = String(++version);
    canvas.atlasFrame = { version, transform: `translate(${dx} ${dy}) scale(${scale})`, scale, drawn,
      renderMs: performance.now()-started, view, selectedId, background: p.bg, contextLabels,
      entranceProgress: revealProgress, entrancePhase: entrance?.phase || 'complete', revealedRegions, regionCount: geometry.china.length };
  };

  const hitTest = (x,y,view) => {
    if (!last) return null;
    const local = view === 'fuzhou' || view.startsWith('school:');
    if (!local && !['china','fujian'].includes(view)) return null;
    const items = local ? geometry.campuses : (view === 'china' ? geometry.china : geometry.fujian).filter(item => item.id === (view === 'china' ? '350000' : '350100'));
    context.save(); context.setTransform(1,0,0,1,0,0);
    const hit = items.find(item => context.isPointInPath(item.path,(x-last.dx)/last.scale,(y-last.dy)/last.scale));
    context.restore();
    return hit ? local ? `school:${hit.id}` : view === 'china' ? 'fujian' : 'fuzhou' : null;
  };
  return { paint, hitTest };
}

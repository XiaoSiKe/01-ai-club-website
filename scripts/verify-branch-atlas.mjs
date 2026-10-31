import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { atlasFlightTarget, atlasLayerOpacity, atlasMarkerLabels, atlasMarkerLayout, atlasSpringResponse, fitAtlasCamera, stepAtlasSpring, parentAtlasView } from '../src/components/atlasCamera.js';
import { branches, branchCities, searchBranches } from '../src/data/branches.js';

const atlas = JSON.parse(readFileSync(new URL('../src/data/maps/branch-atlas.json', import.meta.url)));
for (const name of ['china', 'fujian', 'fuzhou', 'quanzhou', 'campuses', 'localDetails', 'context']) {
  const ids = atlas[name].map(item => item.id);
  assert(ids.every(id => id && id !== 'undefined'), `${name} render IDs must be defined`);
  assert.equal(new Set(ids).size, ids.length, `${name} render IDs must be unique`);
}
for (const kind of ['road', 'water', 'green', 'building']) {
  assert(atlas.localDetails.some(item => item.kind === kind), `Missing neighborhood context: ${kind}`);
}
assert(atlas.localDetails.filter(item => item.kind === 'building').length > 100, 'Campus surroundings must include real building footprints');
for (const item of atlas.localDetails) {
  assert(/^way:|^relation:/.test(item.id), 'Neighborhood shapes must retain their OSM source IDs');
  assert(item.bounds.flat().every(Number.isFinite), `Invalid local geometry: ${item.id}`);
  assert(item.bounds[0][0] >= atlas.localClipBounds[0][0] - .0001 && item.bounds[0][1] >= atlas.localClipBounds[0][1] - .0001
    && item.bounds[1][0] <= atlas.localClipBounds[1][0] + .0001 && item.bounds[1][1] <= atlas.localClipBounds[1][1] + .0001,
  'Local paths must stay inside the campus-derived clipping region');
}
for (const label of atlas.localLabels) {
  assert(label.name && label.point.every(Number.isFinite), 'Context labels must have valid geographic anchors');
}
const layers = ['world', 'china', 'fujian', 'fuzhou', 'local'];
for (let scale = 1; scale < 5000; scale *= 1.05) {
  const opacity = layers.map(layer => atlasLayerOpacity(layer, scale));
  assert(opacity.every(value => value >= 0 && value <= 1), 'Layer fade must stay finite');
  assert(Math.max(...opacity) >= .99, 'Every zoom must retain a geographic layer, including during a reverse');
}
assert.equal(atlasLayerOpacity('world', 10), 0, 'Do not rasterize the world at regional zoom');
assert.equal(atlasLayerOpacity('china', 40), 0, 'Do not rasterize the country at campus zoom');
assert.equal(atlasLayerOpacity('fuzhou', 1000), 0, 'Do not retain distant district geometry at campus zoom');
for (const [w, h, pad] of [[644, 660, 64], [804, 660, 64], [356, 400, 42], [286, 400, 42]]) {
const overviewPoses = [atlas.bounds.china, atlas.bounds.fujian, atlas.bounds.campuses, ...Object.values(atlas.campusViews)].map((bounds, i) => fitAtlasCamera(bounds, w, h, pad, i === 0 ? 1.21 : 1));
for (const start of overviewPoses) for (const target of overviewPoses) {
  let pose = { ...start }, velocity = { x: 0, y: 0, z: 0 };
  for (let frame = 0; frame < 180; frame++) {
    const flightTarget = atlasFlightTarget(pose, target, Math.min(w, h));
    const response = atlasSpringResponse(pose, flightTarget, Math.min(w, h));
    const step = stepAtlasSpring(pose, velocity, flightTarget, 1 / 60, response);
    pose = step.position; velocity = step.velocity;
    const scale = Math.exp(pose.z);
    const viewport = [[pose.x - w / 2 / scale, pose.y - h / 2 / scale], [pose.x + w / 2 / scale, pose.y + h / 2 / scale]];
    assert(layers.some(layer => {
      const b = atlas.bounds[layer];
      return atlasLayerOpacity(layer, scale) > .05 && b[0][0] <= viewport[1][0] && b[1][0] >= viewport[0][0] && b[0][1] <= viewport[1][1] && b[1][1] >= viewport[0][1];
    }), 'A whole-level zoom must not fly into an empty culled region');
  }
}
}
for (const [width, height] of [[800, 600], [358, 360], [280, 360]]) {
  for (const bounds of [atlas.bounds.china, atlas.bounds.fujian, atlas.bounds.campuses]) {
    const pose = fitAtlasCamera(bounds, width, height, 42);
    const scale = Math.exp(pose.z);
    for (const [x, y] of bounds) {
      const sx = width / 2 + (x - pose.x) * scale;
      const sy = height / 2 + (y - pose.y) * scale;
      assert(sx >= 41.99 && sx <= width - 41.99 && sy >= 41.99 && sy <= height - 41.99, 'Overview must fit without clipping');
    }
  }
}
for (const [width, height, padding] of [[804, 660, 64], [644, 660, 64], [356, 400, 42], [286, 400, 42]]) {
  const camera = fitAtlasCamera(atlas.bounds.china, width, height, padding, 1.21);
  for (const [x, y] of atlas.bounds.china) {
    const sx = width / 2 + (x - camera.x) * Math.exp(camera.z);
    const sy = height / 2 + (y - camera.y) * Math.exp(camera.z);
    assert(sx >= 0 && sx <= width && sy >= 0 && sy <= height, 'Enlarged overview must retain complete geographic bounds');
  }
}

let position = fitAtlasCamera(atlas.bounds.china, 800, 600);
let velocity = { x: 0, y: 0, z: 0 };
const destination = fitAtlasCamera(atlas.campusViews.fzu, 800, 600);
for (let i = 0; i < 24; i++) ({ position, velocity } = stepAtlasSpring(position, velocity, destination, 1 / 60));
const reverse = fitAtlasCamera(atlas.bounds.china, 800, 600);
const redirected = stepAtlasSpring(position, velocity, reverse, 0);
for (const key of ['x', 'y', 'z']) {
  assert(Math.abs(redirected.position[key] - position[key]) < 1e-8, 'Changing direction must not jump');
  assert(Math.abs(redirected.velocity[key] - velocity[key]) < 1e-8, 'Changing direction must retain velocity');
}
for (let i = 0; i < 240; i++) ({ position, velocity } = stepAtlasSpring(position, velocity, reverse, 1 / 60));
for (const key of ['x', 'y', 'z']) assert(Math.abs(position[key] - reverse[key]) < 1e-7, 'Return must settle at the overview');
assert.equal(parentAtlasView('school:fzu'), 'fuzhou');
assert.equal(parentAtlasView('fuzhou'), 'fujian');
assert.equal(parentAtlasView('fujian'), 'china');
assert.equal(atlas.china.length, 35);
for (const code of ['710000','460000','810000','820000','100000_JD']) assert(atlas.china.some(item => item.id === code), `Missing complete-map feature: ${code}`);
for (const branch of branches) {
  assert(atlas.points[branch.id]?.every(Number.isFinite), `Missing campus point: ${branch.id}`);
  assert(atlas.campuses.some(item => item.id === branch.id && item.d.length > 10), `Missing campus outline: ${branch.id}`);
}
assert.equal(new Set(branches.map(item => item.id)).size, branches.length);
assert.deepEqual(searchBranches(' 福理工 ').map(item => item.id), ['fjut']);
assert.deepEqual(searchBranches('闽江学院'), []);
assert.deepEqual(searchBranches('闽江大学'), []);
assert.deepEqual(searchBranches('FZU').map(item => item.id), ['fzu']);
assert.equal(searchBranches('福州').length, 5);
assert.deepEqual(searchBranches('泉州').map(item => item.id), ['qzoi']);
assert.deepEqual(searchBranches('郑鑫尧').map(item => item.id), ['qzoi']);
assert.equal(parentAtlasView('school:qzoi'), 'quanzhou');
assert.equal(parentAtlasView('quanzhou'), 'fujian');
for (const city of branchCities) {
  const bounds = atlas.cityViews[city.id];
  assert(bounds.flat().every(Number.isFinite));
  for (const branch of branches.filter(item => item.city === city.id)) {
    const [x, y] = atlas.points[branch.id];
    assert(x >= bounds[0][0] && x <= bounds[1][0] && y >= bounds[0][1] && y <= bounds[1][1]);
    assert.equal(parentAtlasView(`school:${branch.id}`), city.id);
  }
}
assert.deepEqual(searchBranches('福师大').map(item => item.id), ['fjnu']);
assert.deepEqual(searchBranches('至诚').map(item => item.id), ['fuzc']);
assert.deepEqual(searchBranches('FUZC').map(item => item.id), ['fuzc']);
assert.deepEqual(searchBranches('郑航').map(item => item.id), ['fuzc']);
assert.deepEqual(searchBranches('福州理工').map(item => item.id), ['fit']);
assert.deepEqual(searchBranches('Eug').map(item => item.id), ['fit']);
assert.deepEqual(searchBranches('FIT').map(item => item.id), ['fit']);
assert.deepEqual(branches.map(item => item.id), ['fzu', 'fjnu', 'fjut', 'fuzc', 'fit', 'qzoi']);
assert.deepEqual(atlas.campuses.map(item => item.id).sort(), branches.map(item => item.id).sort());
assert.equal(atlas.points.mju, undefined);
assert.equal(atlas.campusViews.mju, undefined);
assert.equal(branches.find(item => item.id === 'fuzc').founded, '2026-10-26');
assert.equal(branches.find(item => item.id === 'fit').founded, '2026-10-26');
assert.deepEqual(searchBranches('福州 总社').map(item => item.id), ['fzu']);
assert.equal(searchBranches('不存在的分社').length, 0);
for (const branch of branches) {
  assert(/^2026-\d{2}-\d{2}$/.test(branch.founded) && Number.isFinite(Date.parse(branch.founded)), 'Every branch must include its supplied founding date');
  assert(branch.crest && !branch.image, 'Branch presentation uses an official crest instead of a photo');
  assert(readFileSync(new URL(`../public${branch.crest}`, import.meta.url)).length > 1000, 'Crest must be bundled locally');
}
for (const [width, height, padding] of [[804, 776, 64], [286, 400, 42]]) {
  for (const [from, to] of [['fzu', 'fit'], ['fit', 'fzu'], ['fzu', 'qzoi'], ['qzoi', 'fit']]) {
    const start = fitAtlasCamera(atlas.campusViews[from], width, height, padding);
    const target = fitAtlasCamera(atlas.campusViews[to], width, height, padding);
    let pose = { ...start }, speed = { x: 0, y: 0, z: 0 }, minScale = Math.exp(start.z);
    for (let frame = 0; frame < 360; frame++) {
      const goal = atlasFlightTarget(pose, target, Math.min(width, height));
      const next = stepAtlasSpring(pose, speed, goal, 1 / 60, atlasSpringResponse(pose, goal, Math.min(width, height)));
      pose = next.position; speed = next.velocity;
      const scale = Math.exp(pose.z);
      minScale = Math.min(minScale, scale);
      if (scale > 650) assert(branches.some(branch => {
        const [x, y] = atlas.points[branch.id];
        return Math.abs(x - pose.x) * scale <= width / 2 && Math.abs(y - pose.y) * scale <= height / 2;
      }), 'A distant campus flight must retain a campus while regional context is hidden');
    }
    assert(minScale < Math.exp(start.z) * .6, 'Distant school switches must open the field before panning');
    assert(Math.abs(pose.x - target.x) * Math.exp(target.z) < .06 && Math.abs(pose.y - target.y) * Math.exp(target.z) < .06, 'Distant campus flight must settle exactly');
  }
}
const denseLabels = atlasMarkerLabels(Array.from({ length: 6 }, (_, index) => ({ id: index, left: 70 + index * 3, top: 260 + index * 4, width: 90, height: 32 })), 400);
for (let i = 0; i < denseLabels.length; i++) {
  const a = denseLabels[i];
  assert(a.top >= 56 && a.top + a.height <= 352, 'Dense school labels must stay inside a phone map');
  for (const b of denseLabels.slice(i + 1)) assert(a.left >= b.left + b.width || a.left + a.width <= b.left || a.top >= b.top + b.height || a.top + a.height <= b.top, 'School labels must not overlap');
}
let previous;
let sideChanges = 0;
for (const x of [159.8, 160.2, 159.9, 160.1, 159.99, 160.01]) {
  const layout = atlasMarkerLayout({ x, y: 200, width: 800, height: 520, scale: 2000, minScale: 450, preferredSide: 'left', previous });
  if (previous && previous.side !== layout.side) sideChanges++;
  previous = layout;
}
assert(sideChanges <= 1, 'Subpixel camera settling must not repeatedly flip a marker label');
let edge = atlasMarkerLayout({ x: 200, y: 200, width: 800, height: 520, scale: 451, minScale: 450 });
for (const scale of [449.9, 450.1, 449.8, 450.2]) {
  edge = atlasMarkerLayout({ x: 200, y: 200, width: 800, height: 520, scale, minScale: 450, previous: edge });
  assert(edge.visible, 'A visible marker must not blink at its zoom threshold');
}
console.log('Atlas verified: complete geography, campus outlines, viewport fitting, interruptible zoom, return navigation and stable marker labels.');

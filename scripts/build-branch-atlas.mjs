import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { geoArea, geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import { createRequire } from 'node:module';
import { branches, branchCities } from '../src/data/branches.js';

const require = createRequire(import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(`../src/data/maps/${name}-full.geojson`, import.meta.url), 'utf8'));
const china = read('china');
const fujian = read('fujian');
const fuzhou = read('fuzhou');
const quanzhou = read('quanzhou');
const world = require('world-atlas/countries-110m.json');
// Rebase around the campus region to avoid million-pixel translations and
// floating-point shimmer when a highly magnified SVG reaches its destination.
const projection = geoMercator().center([119.18, 26.05]).scale(200).translate([0, 0]);
const path = geoPath(projection).digits(5);
const branchCampusIds = new Set(branches.map(branch => branch.osmId));
const campuses = JSON.parse(readFileSync(new URL('../src/data/maps/campus-outlines.json', import.meta.url), 'utf8'))
  .filter(item => branchCampusIds.has(item.osm_id));
const campusCoordinates = campuses.flatMap(item => item.geojson.coordinates.flat(item.geojson.type === 'Polygon' ? 1 : 2));
const localClipBounds = [
  projection([Math.min(119.10, ...campusCoordinates.map(p => p[0] - .015)), Math.max(26.13, ...campusCoordinates.map(p => p[1] + .015))]),
  projection([Math.max(119.30, ...campusCoordinates.map(p => p[0] + .015)), Math.min(25.98, ...campusCoordinates.map(p => p[1] - .015))]),
];
const localProjection = geoMercator().center([119.18, 26.05]).scale(200).translate([0, 0])
  .clipExtent(localClipBounds);
const localPath = geoPath(localProjection).digits(5);
const orient = polygon => geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI
  ? polygon.map(ring => [...ring].reverse()) : polygon;
const normalizeGeometry = geometry => geometry.type === 'Polygon'
  ? { ...geometry, coordinates: orient(geometry.coordinates) }
  : geometry.type === 'MultiPolygon'
    ? { ...geometry, coordinates: geometry.coordinates.map(orient) } : geometry;
const normalize = data => ({ ...data, features: data.features.map(f => ({ ...f, geometry: { ...f.geometry,
  coordinates: f.geometry.type === 'Polygon' ? orient(f.geometry.coordinates) : f.geometry.coordinates.map(orient),
} })) });
const serialize = data => data.features.map(f => ({
  id: String(f.properties.adcode || f.id), name: f.properties.name || '',
  d: path(f), bounds: path.bounds(f),
  center: f.properties.centroid || f.properties.center ? projection(f.properties.centroid || f.properties.center) : null,
}));
const cn = normalize(china);
const fj = normalize(fujian);
const fz = normalize(fuzhou);
const qz = normalize(quanzhou);
const campusIds = Object.fromEntries(branches.map(branch => [branch.osmId, branch.id]));
const campusFeatures = normalize({ type: 'FeatureCollection', features: campuses.map(item => ({ type: 'Feature', geometry: item.geojson, properties: { adcode: campusIds[item.osm_id], name: item.name } })) });
const neighborhood = JSON.parse(readFileSync(new URL('../src/data/maps/fuzhou-neighborhood.geojson', import.meta.url), 'utf8'));
const featuredCampusIds = new Set(campuses.map(item => `${item.osm_type}:${item.osm_id}`));
const neighborhoodFeatures = neighborhood.features.filter(item => !featuredCampusIds.has(item.properties.id));
const countryFeatures = feature(world, world.objects.countries).features.filter(f => !['156', '158'].includes(String(f.id)));
const schoolPoints = branches.map(branch => ({ id: branch.id, point: projection(branch.coordinates) }));
const xs = schoolPoints.map(s => s.point[0]);
const ys = schoolPoints.map(s => s.point[1]);
const campusBounds = [[Math.min(...xs) - .045, Math.min(...ys) - .045], [Math.max(...xs) + .045, Math.max(...ys) + .045]];
const cityViews = Object.fromEntries(branchCities.map(city => {
  const points = schoolPoints.filter(s => branches.find(b => b.id === s.id).city === city.id).map(s => s.point);
  return [city.id, [[Math.min(...points.map(p => p[0])) - .045, Math.min(...points.map(p => p[1])) - .045], [Math.max(...points.map(p => p[0])) + .045, Math.max(...points.map(p => p[1])) + .045]]];
}));
const campusShapes = serialize(campusFeatures);
const localDetails = neighborhoodFeatures.filter(item => item.geometry.type !== 'Point').map(item => {
  const geometry = normalizeGeometry(item.geometry);
  return { ...item.properties, area: /Polygon$/.test(geometry.type), d: localPath(geometry), bounds: localPath.bounds(geometry) };
}).filter(item => item.d);
const localLabels = neighborhoodFeatures.filter(item => item.properties.name && ['road', 'water', 'campus', 'station'].includes(item.properties.kind)).map(item => {
  const geometry = normalizeGeometry(item.geometry);
  let point = localPath.centroid(geometry), angle = 0, span = 0;
  if (geometry.type === 'LineString') {
    const points = geometry.coordinates.map(projection);
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    span = lengths.reduce((a, b) => a + b, 0);
    let remaining = span / 2;
    for (let i = 0; i < lengths.length; i++) {
      if (remaining <= lengths[i]) {
        const a = points[i], b = points[i + 1], t = lengths[i] ? remaining / lengths[i] : 0;
        point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        if (angle > Math.PI / 2) angle -= Math.PI;
        if (angle < -Math.PI / 2) angle += Math.PI;
        break;
      }
      remaining -= lengths[i];
    }
  }
  return { ...item.properties, point, angle, span };
}).filter(item => item.point.every(Number.isFinite));
const localBoxes = [...campusShapes, ...localDetails].map(item => item.bounds);
const localBounds = [[Math.min(...localBoxes.map(b => b[0][0])), Math.min(...localBoxes.map(b => b[0][1]))], [Math.max(...localBoxes.map(b => b[1][0])), Math.max(...localBoxes.map(b => b[1][1]))]];
const data = {
  localClipBounds,
  china: serialize(cn), fujian: serialize(fj), fuzhou: serialize(fz), quanzhou: serialize(qz),
  cityViews,
  campuses: campusShapes,
  localDetails,
  localLabels,
  // Some Natural Earth geometries have no ISO numeric ID. Give them stable,
  // unique keys as well; String(undefined) creates reconciliation collisions.
  context: countryFeatures.map((f, index) => ({ id: f.id === undefined ? `world:${f.properties?.name || index}` : String(f.id), d: path(f), bounds: path.bounds(f) })),
  graticule: path(geoGraticule10()),
  bounds: { world: path.bounds({ type: 'Sphere' }), china: path.bounds(cn), fujian: path.bounds(fj), fuzhou: path.bounds(fz), quanzhou: path.bounds(qz), local: localBounds, campuses: cityViews.fuzhou, allCampuses: campusBounds },
  points: { fujian: projection(china.features.find(f => String(f.properties.adcode) === '350000').properties.center), ...Object.fromEntries(branchCities.map(city => [city.id, projection(city.coordinates)])), ...Object.fromEntries(schoolPoints.map(s => [s.id, s.point])) },
  campusViews: Object.fromEntries(schoolPoints.map(s => [s.id, [[s.point[0] - .085, s.point[1] - .065], [s.point[0] + .085, s.point[1] + .065]]])),
};
for (const name of ['台湾省','海南省','香港特别行政区','澳门特别行政区']) {
  if (!data.china.some(f => f.name === name)) throw new Error(`Missing ${name}`);
}
if (!data.china.some(f => f.id === '100000_JD')) throw new Error('Missing maritime geometry');
const json = JSON.stringify(data);
if (/NaN|Infinity/.test(json)) throw new Error('Non-finite map geometry');
const output = new URL('../src/data/maps/branch-atlas.json', import.meta.url);
if (!existsSync(output) || readFileSync(output, 'utf8') !== json) writeFileSync(output, json);
console.log(`Atlas: ${data.china.length} China, ${data.fujian.length} Fujian, ${data.fuzhou.length} Fuzhou features; ${schoolPoints.length} campuses; ${json.length} bytes`);

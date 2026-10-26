// Generate the complete local SVG without discarding islands or boundary features.
import { readFileSync, writeFileSync } from 'node:fs';
import { geoArea, geoMercator, geoPath } from 'd3-geo';

const data = JSON.parse(readFileSync(new URL('../src/data/maps/china-full.geojson', import.meta.url), 'utf8'));
const expected = ['台湾省', '海南省', '香港特别行政区', '澳门特别行政区'];
for (const name of expected) {
  if (!data.features.some(f => f.properties.name === name)) throw new Error(`Missing region: ${name}`);
}
if (!data.features.some(f => f.properties.adcode === '100000_JD')) throw new Error('Missing maritime boundary features');

// d3's spherical stream expects clockwise exterior rings; keep all coordinates.
const orient = polygon => geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI
  ? polygon.map(ring => [...ring].reverse()) : polygon;
const features = data.features.map(f => ({ ...f, geometry: { ...f.geometry, coordinates:
  f.geometry.type === 'Polygon' ? orient(f.geometry.coordinates) : f.geometry.coordinates.map(orient),
} }));
const collection = { type: 'FeatureCollection', features };
const projection = geoMercator().fitExtent([[24, 24], [876, 736]], collection);
const path = geoPath(projection).digits(2);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const paths = features.map(f => `<path vector-effect="non-scaling-stroke" data-region="${escape(f.properties.adcode)}" d="${path(f)}"><title>${escape(f.properties.name || '南海区域边界')}</title></path>`).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="760" viewBox="0 0 900 760" role="img" aria-labelledby="title desc">
<title id="title">中国地图</title>
<desc id="desc">包含全部源数据的34个省级区域及南海边界要素，含台湾、海南、香港、澳门与南海诸岛。</desc>
<!-- Source: Alibaba DataV.GeoAtlas areas_v3, 100000_full.json. Retrieved 2026-10-23. -->
<g fill="none" stroke="#202024" stroke-width=".85" stroke-linejoin="round" stroke-linecap="round">${paths}</g>
</svg>\n`;
if (/NaN|Infinity/.test(svg)) throw new Error('Invalid projected geometry');
writeFileSync(new URL('../public/images/china-map.svg', import.meta.url), svg);
console.log(`Generated complete China map: ${features.length} features, ${Buffer.byteLength(svg)} bytes`);

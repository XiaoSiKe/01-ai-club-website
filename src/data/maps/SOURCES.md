# China map source

- Provider: Alibaba DataV.GeoAtlas; the provider identifies AMap as its upstream source.
- Source page: https://datav.aliyun.com/portal/school/atlas/area_selector
- Raw data: https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
- Retrieved: 2026-10-23. Provider data version: areas_v3 (2021-05).
- Provider's stated use: learning and exchange (仅供学习交流使用).

`china-full.geojson` retains the complete downloaded file: 34 provincial regions,
including Taiwan, Hainan, Hong Kong and Macao, plus `100000_JD` maritime boundary
geometry. No source features or island coordinates are dropped. The map depicts
the provider's boundary conventions; it is not presented as a surveyed or
government-approved standard map.

`scripts/build-china-map.mjs` adjusts ring order for d3, projects the entire data
extent (including the southern islands), and generates `public/images/china-map.svg`.
Only the visual styling is adapted for the site's monochrome themes. No boundary
segments are drawn by hand. Run with `docker compose exec -T web node scripts/build-china-map.mjs`.

## Interactive branch atlas (2026-10-24)

- `fujian-full.geojson` and `fuzhou-full.geojson`: DataV endpoints
  `https://geo.datav.aliyun.com/areas_v3/bound/350000_full.json` and
  `https://geo.datav.aliyun.com/areas_v3/bound/350100_full.json` (9 cities and 13 districts).
- Neighboring countries: `world-atlas@2` / Natural Earth 1:110m. Their outlines are
  background context only. China and Taiwan features from that world layer are
  excluded because the complete China layer is supplied separately above.
- Public campus coordinates and outlines: OpenStreetMap, retrieved through the
  Nominatim search and lookup APIs. FZU: relation 12658065; FJUT: relation 12658060;
  MJU: way 938005192. The older OSM name 闽江学院 is displayed using the user's
  supplied/current university name 闽江大学. Coordinates are WGS84 and are approximate
  public-campus references, not precise branch/event venues.
- `fuzhou-local-features.json`: OSM/Nominatim line geometries for 学园路、学府南路、
  溪源宫路、乌龙江, retrieved using the name and 福州市. These are selected contextual
  features, not a complete navigation map.
- OSM-derived data (`campus-outlines.json`, `fuzhou-local-features.json`,
  `fuzhou-neighborhood.geojson` and their
  projected layers in the collective atlas): © OpenStreetMap contributors,
  [ODbL](https://opendatacommons.org/licenses/odbl/1-0/).
  https://www.openstreetmap.org/copyright
  Other layers retain their separate source terms. OSM credit appears in the
  homepage footer, outside the map module.
- Branch names and total/branch roles: supplied by the user in this conversation.
  No additional cities, member totals, branch events or founding dates are invented.
- Public campus addresses: https://zsb.fzu.edu.cn/xxgk/xyfg/qsxy.htm,
  https://join.fjut.edu.cn/lxwm/list.htm, https://www.mju.edu.cn/.

Generate `branch-atlas.json` with `scripts/build-branch-atlas.mjs`. No geography is
fetched by the deployed page: all projected layers are served as one local lazy
chunk. The previous visible DataV credit and sea label were removed as requested;
source/provenance remains here.

The contextual street/river SVG paths are clipped to a finite campus-derived
extent at generation time, retaining the original university-city minimum and
expanding for the Gulou and Lianjiang references. The projected clipping bounds
are recorded in the atlas and verified to keep high-zoom drawing bounded. Complete China/provincial/district source features are
preserved. Missing ISO IDs in the world background receive stable name-based
render keys; this does not change geographic feature content.

## University-city surroundings (2026-10-25)

`fuzhou-neighborhood.geojson` replaces the sparse contextual lines as the input
for the local atlas layer. It contains selected real streets, building footprints,
waterways/water surfaces, green areas, neighboring campuses and metro features.
Each feature retains its `way:`, `relation:` or `node:` OpenStreetMap ID; coordinates
are WGS84, rounded to six decimal places. Surrounding campuses are geographic
context, not additional club branches.

- Context export: OpenStreetMap / Overpass API at
  `https://maps.mail.ru/osm/tools/overpass/api/interpreter`, selection envelope
  119.115–119.250° E, 26.005–26.105° N. OSM base timestamp:
  `2026-10-24T16:57:47Z`. This is a selected contextual extract, not a complete
  street or navigation dataset.
- Building/campus/street detail: OSM's read-only map API,
  `https://api.openstreetmap.org/api/0.6/map`, using these bounding boxes:
  `119.18,26.048,119.206,26.075`, `119.151,26.057,119.18,26.08`, and
  `119.18,26.025,119.207,26.048`.
- The three featured campuses and their component ways are excluded from the
  contextual campus layer, retaining the existing interactive campus outlines.
  Multipolygon ways are assembled using their OSM outer/inner roles. Context is
  clipped at atlas generation time; labels use projected geographic anchors and
  avoid the featured school labels. Building detail fades in at local zoom levels.

All context is bundled locally. The deployed site does not query OSM/Overpass or
load third-party map tiles. OSM-derived data is available under the ODbL linked
above. Attribution is displayed
in the homepage footer instead of the local map corner.

## Branch flags (updated 2026-10-26)

User-supplied source PDFs: 零一AI日新社总社旗帜.pdf; 零一AI日新社-福师大分社-旗帜-印刷矢量版-RGB.pdf; 零一AI日新社-福理工分社-旗帜-印刷矢量版-RGB.pdf; 零一AI日新社-福大至诚分社-旗帜-印刷矢量版-RGB.pdf; 零一AI日新社-闽江分社-旗帜-印刷矢量版-RGB.pdf. scripts/extract-branch-flags.py extracts 56 / 62 / 62 / 70 / 60 / 62 SVG paths into src/data/branch-flags.json (fzu / fjnu / fjut / fuzc / mju / fit). The FIT flag is generated locally from the supplied common brand artwork rather than a user-provided FIT PDF. It can update individual supplied PDFs while preserving other flag entries. BranchFlag.jsx renders those paths inline, without raster/image elements, preserving the original outlined lettering and artwork.

## Fujian Normal University branch (2026-10-25)

The user added 福师大分社 before 福理工分社 and supplied all four founding dates (2026-09-01, 2026-10-25, 2026-10-21, 2026-10-22 in display order). FJNU public campus: OpenStreetMap relation 12658062, 福建师范大学旗山校区, Nominatim center 119.2045602,26.0327333. The full campus outline was retrieved from the Nominatim search API using the school name on 2026-10-25. The builder excludes featured campuses from the neighborhood context to avoid drawing the FJNU outline twice. Campus address: https://office.fjnu.edu.cn/810/list.htm. No flag was supplied in the initial update; the user supplied the FJNU vector flag PDF on 2026-10-26. The user subsequently confirmed Miracle as the FJNU branch leader; the avatar reuses the existing user-supplied Miracle portrait.

## Fuzhou University Zhicheng College branch (2026-10-26)

The user supplied 福大至诚分社, leader 郑航 and founding date 2026-10-26, and placed it immediately after 福理工分社. The existing 郑航 portrait and pioneer ID `rezhoukang` are reused.

- Official university: https://www.fdzcxy.edu.cn/ . Its charter, https://www.fdzcxy.edu.cn/xyzc/list.htm , gives the address 福建省福州市鼓楼区杨桥西路50号.
- Campus boundary and centre: OpenStreetMap way 717445438, named 福州大学至诚学院. The full polygon was retrieved from Nominatim with `q=福州大学至诚学院&format=jsonv2&polygon_geojson=1&addressdetails=1`. Its WGS84 centre is 119.2680121° E, 26.0786045° N. The original polygon is retained in `campus-outlines.json`.
- Surrounding context: https://api.openstreetmap.org/api/0.6/map?bbox=119.258,26.069,119.279,26.088 , retrieved 2026-10-26. The curated addition contains 349 nonduplicate ways: 231 roads, 25 water features, 19 green areas, 15 land-use areas, 55 buildings and 4 railways. Each retains its OSM way ID; the featured campus itself is supplied by the separate polygon. The existing context is preserved, and the common projection clips paths to the atlas's local extent.
- Official crest: https://zsb.fdzcxy.edu.cn/article/678.html . The unchanged 737×737 PNG is https://zsb.fdzcxy.edu.cn/uploads/ueditor/image/20240416/1713232751580474.png , saved as `public/images/branches/fuzc-crest.png`.

This campus is in Gulou rather than the university-city cluster. The city camera fits all registered schools; the local header therefore says 福州. Marker visibility thresholds follow the fitted city scale on narrow screens so the expanded geographic span cannot hide the campus controls. Data remains bundled locally; no map service is called by the deployed site.

## Fuzhou Institute of Technology branch (2026-10-26)

The user supplied 福州理工分社, founding date 2026-10-26 and leader Eug. The official school name is 福州理工学院 (FIT), not 福建理工大学. Eug's existing pioneer ID `Eug-Y` and supplied portrait are reused; his displayed university name is aligned with the official name.

- Official name, English abbreviation and address: https://www.fit.edu.cn/html/1675325920.html . The public Lianjiang campus address is 福建省福州市连江西江滨大道8号. The college also has a Mawei campus; https://admissions.fit.edu.cn/html/907813151.html documents both. The website uses Lianjiang as its public-campus reference, not a private branch/event venue.
- Official crest: https://www.fit.edu.cn/About/Badgemotto/ , original PNG https://www.fit.edu.cn/images/image/20210524092676507650.png (587×587, unchanged).
- Geographic reference: OpenStreetMap way 582302622, `amenity=university`, with Nominatim lookup centre 119.4655281° E, 26.2428289° N. The OSM area is unnamed. It was matched to the public FIT campus reference near its official address, using https://www.bigemap.net/city-26898.html only as a location clue; that page's map-coordinate datum is unspecified, so its coordinates were not copied directly. The polygon is an approximate campus-area reference, not an official surveyed institutional boundary. Initial fuzzy Nominatim search results naming 福建理工大学 were discarded.
- Local geographic context: https://api.openstreetmap.org/api/0.6/map?bbox=119.455,26.225,119.490,26.255 . The curated addition contains 207 nonduplicate OSM ways: 130 roads, 15 water features, 44 buildings, 1 neighboring university area and 17 land-use areas. Original OSM IDs are retained; the featured area is rendered through its separate campus polygon. The finite clipping rectangle now derives from all supplied campus extents plus padding.
- Branch flag: generated with `scripts/create-fit-flag.py`, preserving 36 logo/main-wordmark paths from the user's 福大至诚 template. New Heiti SC Medium and Arial Bold lettering is converted to paths. The PDF and SVG contain no raster images and no live text; the final PDF is extracted into 62 inline paths for `branch-flags.json`.

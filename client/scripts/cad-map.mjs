/*
 * CAD → 3D map data
 * ---------------------------------------------------------------------------
 *  Reads the market drawing (client/asset/cad/market.dwg – a SketchUp model
 *  exported to DWG) and writes src/data/marketPlan.js: each building's ground
 *  outline (in metres), its height and where its name goes. MarketMap.jsx draws
 *  the 3D map from that file.
 *
 *  Run after the drawing changes:   npm run cad-map   (inside client/)
 *
 *  Which drawing group is which building is set in BUILDINGS below (SketchUp
 *  group names as they appear in the DWG). The script prints every group with
 *  its size, so a new export that renames groups can be matched again.
 *  (In the drawing each building also carries its name in 3D letters – Thai
 *  letters come out as "_" in the DWG, e.g. "______M" = "อาคาร M".)
 *
 *  Debug pictures:  node scripts/cad-render.mjs asset/cad/market.dwg out.png
 * ---------------------------------------------------------------------------
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closedLoops, groundLoops, labelPoint, readGroups, signedArea, simplify, wallHeight } from './lib/dwg.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DWG = path.join(ROOT, 'asset/cad/market.dwg')
const OUT = path.join(ROOT, 'src/data/marketPlan.js')

/*
 * drawing group → building on the map
 *   code  : zone code (same as shop_zones.code / shops.zone); null = not a shop zone
 *   kind  : 'shop'    coloured, tap to filter the shop list
 *           'other'   small light-grey structure (pavilion, guard house …), not clickable
 *   name  : label on the map (Thai – translated on the site)
 *   level : take the outline from the roof at this height instead of the ground
 *           (GROUP_8 = car-park building with the taller อาคาร D along its north side)
 */
const BUILDINGS = [
  { group: 'GROUP_7', code: 'MK', kind: 'shop', name: 'ตลาด' },
  { group: 'GROUP_4', code: 'A', kind: 'shop', name: 'อาคาร A' },
  { group: 'GROUP_6', code: 'BC', kind: 'shop', name: 'อาคาร B&C' },
  { group: 'GROUP_8', level: 10.4, code: 'D', kind: 'shop', name: 'อาคาร D' },
  { group: 'GROUP_1', code: 'E', kind: 'shop', name: 'อาคาร E' },
  { group: 'GROUP_5', code: 'F', kind: 'shop', name: 'อาคาร F' },
  { group: 'MODEL', code: 'G', kind: 'shop', name: 'อาคาร G' }, // walls of G are loose lines in model space
  { group: 'GROUP_3', code: 'H', kind: 'shop', name: 'อาคาร H' },
  { group: 'GROUP_9', code: 'M', kind: 'shop', name: 'อาคาร M' },
  { group: 'GROUP_10', code: 'N', kind: 'shop', name: 'อาคาร N' },
  { group: 'GROUP_8', level: 6.9, code: 'P', kind: 'shop', name: 'อาคารจอดรถ' },
  { group: 'GROUP_11', code: null, kind: 'other', name: 'ศาลากลางน้ำ' },
  { group: 'GROUP_12', code: null, kind: 'other', name: 'ร้านริมน้ำ' },
  { group: 'GROUP_13', code: null, kind: 'other', name: 'อาคารริมถนน' },
  { group: 'GROUP_14', code: null, kind: 'other', name: 'ป้อมยาม' },
  { group: 'GROUP_15', code: null, kind: 'other', name: 'ป้อมยาม' },
  { group: 'GROUP_16', code: null, kind: 'other', name: 'อาคารหลังคาแดง' },
  { group: 'GROUP_17', code: null, kind: 'other', name: 'อาคารด้านเหนือ' },
]

/*
 * map origin (drawing units = metres). Fixed – not taken from the drawing – so
 * the plan keeps lining up with the outside area traced from the aerial photo
 * (src/data/marketSite.js, scripts/site-map.mjs) when buildings are added.
 */
const ORIGIN = { x: 367.7, y: 334.1 }

/* ---------------- read the DWG ---------------- */
const { segs } = await readGroups(DWG)

console.log('groups in the drawing:')
for (const [group, list] of segs) {
  if (group.includes('/')) continue // 3D name letters inside a building group
  const loops = groundLoops(list)
  const area = loops[0] ? Math.abs(signedArea(loops[0])) : 0
  const used = BUILDINGS.filter((b) => b.group === group).map((b) => b.name)
  console.log(`  ${group.padEnd(14)} ${String(list.length).padStart(5)} lines   ground ${area.toFixed(0).padStart(5)} m²   ${used.length ? '→ ' + used.join(' + ') : ''}`)
}

// outline of one building: the ground loop, or the biggest loop lying flat at `level`
function outlineOf(b) {
  const list = segs.get(b.group) || []
  if (b.level == null) return groundLoops(list)[0]
  const flat = list.filter((s) => Math.abs(s[2] - b.level) < 0.05 && Math.abs(s[5] - b.level) < 0.05)
  return closedLoops(flat).sort((p, q) => Math.abs(signedArea(q)) - Math.abs(signedArea(p)))[0]
}

const r1 = (v) => Math.round(v * 10) / 10
const toMap = ([x, y]) => [r1(x - ORIGIN.x), r1(ORIGIN.y - y)]
const buildings = []
for (const b of BUILDINGS) {
  const loop = outlineOf(b)
  if (!loop) {
    console.warn(`  ! ${b.group} (${b.name}): no outline found – skipped`)
    continue
  }
  const outline = simplify(loop).map(toMap)
  if (signedArea(outline) < 0) outline.reverse() // clockwise on screen
  const height = b.level ?? wallHeight(segs.get(b.group))
  buildings.push({ code: b.code, kind: b.kind, name: b.name, height, label: labelPoint(outline).map(r1), outline })
}

const xs = buildings.flatMap((b) => b.outline.map((p) => p[0]))
const ys = buildings.flatMap((b) => b.outline.map((p) => p[1]))
const bounds = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
const center = [r1((bounds.x0 + bounds.x1) / 2), r1((bounds.y0 + bounds.y1) / 2)]

const js = `/*
 * Market plan for the 3D map – GENERATED from asset/cad/market.dwg
 * by scripts/cad-map.mjs (npm run cad-map). Do not edit by hand: change the
 * drawing or the BUILDINGS list in the script, then run it again.
 *
 * Units: metres. x → east, y → south (screen direction). outline = ground outline,
 * height = wall height, label = where the name pin stands, center = middle of all buildings.
 */
export const PLAN = ${JSON.stringify({ center, bounds, buildings }, null, 1).replace(/\[\s+([-\d.]+),\s+([-\d.]+)\s+\]/g, '[$1, $2]')}
`
fs.writeFileSync(OUT, js)
console.log(`\n✓ ${buildings.length} buildings → ${path.relative(ROOT, OUT)}`)
buildings.forEach((b) => console.log(`  ${b.name.padEnd(16)} ${String(b.outline.length).padStart(3)} corners  ${b.height} m  ${b.kind}`))

/*
 * Aerial photo → outside-area data for the 3D map
 * ---------------------------------------------------------------------------
 *  The CAD drawing (asset/cad/market.dwg) only has the buildings. Everything
 *  around them – roads, entrances, car parks, the pond, green areas, neighbouring
 *  blocks – is traced from the aerial photo asset/cad/aerial.jpg.
 *
 *  Tracing is done in PHOTO PIXELS below (easy to check against the photo).
 *  The photo is lined up with the CAD plan by matching building corners
 *  (MATCH below); the script fits that alignment and writes everything in plan
 *  metres to src/data/marketSite.js, which MarketMap.jsx draws.
 *
 *  Run after editing:   npm run site-map   (inside client/)
 *  Check the tracing:   npm run site-map -- --preview   → asset/cad/aerial-check.png
 * ---------------------------------------------------------------------------
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/data/marketSite.js')

/* ---------------- photo ↔ plan: [plan x, plan y (m)] ↔ [photo x, photo y (px)] ---------------- */
const MATCH = [
  [[0, 80.8], [133, 380]], //   B&C – west end
  [[105, 81.9], [432, 378]], // B&C – east end
  [[5.5, 15.9], [147, 205]], // car-park building – north-west corner
  [[2, 187.6], [137, 697]], //  building A – south-west corner
  [[164.9, 147.7], [598, 585]], // building E – east corner
]

/* ================================ TRACING (photo px) ================================ */

/* roads: centre line + width (px). kind: main (the big road in front) / street / lane (inside the site) */
const ROADS = [
  { id: 'main', kind: 'main', name: 'ถ.เทศบาลสงเคราะห์', width: 50, line: [[-400, 918], [1300, 918]] },
  { id: 'west', kind: 'lane', width: 17, line: [[112, -400], [112, 0], [112, 893]] },
  {
    id: 'east',
    kind: 'street',
    width: 22,
    // the public soi: along building F, then south-east to the far-east road
    line: [[380, -400], [398, -60], [420, 40], [455, 120], [490, 180], [525, 230], [560, 270], [600, 315], [640, 360], [680, 405], [720, 440], [760, 480], [795, 520]],
  },
  // road along building E (cars park on it) down to the main road
  { id: 'e-road', kind: 'street', width: 18, line: [[430, 312], [470, 370], [520, 440], [570, 510], [610, 575], [645, 640], [676, 700], [688, 760], [700, 893]] },
  { id: 'northeast', kind: 'street', width: 18, line: [[600, -400], [620, -40], [650, 40], [700, 110], [760, 160], [1300, 560]] },
  { id: 'far-east', kind: 'street', width: 16, line: [[795, -400], [795, 560]] },
  { id: 'back-drive', kind: 'lane', width: 15, line: [[200, 100], [245, 102], [300, 150], [350, 215], [400, 280], [430, 312]] },
  { id: 'side-drive', kind: 'lane', width: 14, line: [[604, 893], [603, 800], [598, 700], [592, 650], [615, 612]] },
]

/* open-air car parks (outline) + rows of parking bays (bays stand across the row) */
const PARKING = [
  {
    id: 'north-yard',
    outline: [[128, 95], [232, 95], [270, 115], [300, 150], [330, 195], [150, 200], [128, 200]],
    rows: [[[148, 160], [245, 160]], [[148, 186], [245, 186]]],
    label: [190, 145],
  },
  {
    id: 'front',
    outline: [[150, 845], [315, 838], [455, 812], [570, 815], [600, 800], [640, 820], [705, 855], [760, 862], [760, 886], [150, 886]],
    rows: [[[165, 872], [395, 872]], [[470, 872], [745, 872]], [[470, 836], [585, 826]], [[330, 852], [440, 834]]],
    label: [250, 866],
  },
  {
    id: 'east-yard',
    outline: [[650, 560], [800, 540], [800, 700], [705, 705], [690, 660], [675, 580]],
    rows: [[[680, 575], [790, 562]], [[684, 612], [790, 602]], [[692, 650], [790, 642]], [[702, 688], [790, 684]]],
    label: [770, 612],
  },
  {
    id: 'back-yard',
    outline: [[438, 258], [478, 252], [508, 298], [474, 330], [446, 322]],
    rows: [[[452, 268], [488, 318]]],
    label: [470, 290],
  },
]

/* the pond, its islands and the buildings standing in / beside it */
const POND = [[258, 465], [300, 470], [350, 478], [395, 470], [402, 520], [430, 530], [450, 548], [452, 580], [445, 605], [432, 625], [400, 636], [350, 642], [300, 643], [266, 640], [256, 610], [255, 540]]
const ISLANDS = [
  { at: [333, 493], r: 12 },
  { at: [400, 537], r: 7 },
]

/* low structures that are not in the CAD drawing (height in metres)
   (pavilion, pond restaurant, guard houses, อาคาร M / N … come from the drawing – scripts/cad-map.mjs) */
const STRUCTURES = [
  {
    id: 'walkway-roof',
    name: 'หลังคาทางเดิน',
    height: 4.6,
    color: '#cdd5d5',
    outline: [[105, 425], [430, 425], [442, 445], [425, 462], [402, 462], [398, 478], [380, 488], [330, 495], [285, 490], [262, 476], [255, 462], [105, 462]],
  },
  { id: 'e-walkway', name: 'หลังคาทางเดินริมถนน', height: 3.6, color: '#e6ebeb', outline: [[492, 392], [504, 384], [655, 582], [643, 590]] },
  // older buildings inside the property line that the CAD drawing does not have
  { id: 'north-house', kind: 'other', height: 6, color: '#a9b1b1', outline: [[172, 18], [215, 18], [248, 78], [232, 88], [150, 88], [150, 66], [172, 66]] },
  { id: 'north-row-1', kind: 'other', height: 6, color: '#a9b1b1', outline: [[232, 26], [292, 20], [322, 62], [330, 92], [292, 98], [258, 84]] },
  { id: 'north-row-3', kind: 'other', height: 5, color: '#a9b1b1', outline: [[286, 150], [326, 146], [336, 180], [300, 186]] },
  { id: 'drop-off', name: 'หลังคาจุดรับส่ง', height: 4.5, color: '#f6d6e6', outline: [[565, 615], [600, 600], [640, 620], [650, 660], [610, 665], [580, 650]] },
]

/* green areas (lawn / woods) – flat on the map */
const GREEN = [
  { kind: 'woods', outline: [[290, 15], [395, 5], [420, 60], [450, 130], [475, 175], [430, 215], [380, 210], [335, 180], [300, 140], [280, 90]] },
  { kind: 'woods', outline: [[395, 232], [440, 242], [470, 298], [430, 330], [402, 290]] },
  { kind: 'lawn', outline: [[150, 884], [760, 884], [760, 893], [150, 893]] },
]

/* neighbouring blocks (flat, light) – drawn under the roads */
const NEIGHBOURS = [
  [[-400, -400], [100, -400], [100, 435], [-400, 435]],
  [[-400, 530], [100, 530], [100, 885], [-400, 885]],
  [[125, -400], [392, -400], [290, 15], [280, 90], [232, 92], [125, 92]],
  [[432, -400], [608, -400], [640, 40], [690, 110], [750, 160], [790, 195], [790, 505], [760, 480], [720, 440], [680, 405], [640, 360], [600, 315], [560, 270], [525, 230], [490, 180], [455, 120], [420, 40]],
  [[500, 300], [540, 255], [600, 315], [680, 405], [760, 480], [800, 520], [800, 545], [660, 550], [620, 520], [570, 455], [520, 385]],
  [[640, -400], [1300, -400], [1300, 540], [805, 545], [805, 190]],
  [[712, 700], [1300, 690], [1300, 886], [712, 886]],
  [[-400, 945], [1300, 945], [1300, 1400], [-400, 1400]],
]

/* the market's own ground = the property line drawn in blue on asset/cad/aerial-marked.jpg */
const SITE = [
  [103, 2], [384, 2],
  // along the public soi
  [391, 20], [405, 40], [418, 60], [429, 80], [436, 100], [443, 120], [448, 140], [460, 160], [477, 180], [494, 200], [510, 220], [524, 240], [534, 260], [547, 280], [548, 290],
  // back round the houses, then down the east side of the road along building E
  [526, 300], [502, 320], [480, 340], [474, 350], [483, 360], [492, 370], [508, 390], [520, 410], [532, 430], [542, 450], [557, 470], [577, 490], [594, 510], [610, 530], [626, 550], [645, 560], [651, 568],
  // north edge of the east car park
  [660, 557], [700, 542], [720, 525], [740, 513], [770, 506], [790, 519], [800, 537], [805, 560], [808, 600], [810, 615], [810, 658],
  // south of the car park, then down to the main road
  [783, 670], [757, 680], [726, 690], [720, 694], [740, 710], [762, 740], [780, 770], [794, 800], [801, 830], [805, 850], [808, 893],
  // main road edge, then the west side
  [86, 893], [84, 870], [81, 840], [78, 790], [75, 700], [77, 650], [81, 610], [85, 560], [92, 510], [92, 420], [95, 340], [97, 300], [99, 250], [100, 200], [101, 150], [103, 100],
]

/* entrances (arrow up on the marked photo) and exits (arrow down) on the main road */
const GATES = [
  { id: 'in-1', dir: 'in', at: [388, 893] },
  { id: 'in-2', dir: 'in', at: [480, 893] },
  { id: 'out-1', dir: 'out', at: [605, 893] },
  { id: 'out-2', dir: 'out', at: [712, 893] },
]

/* other labels on the map */
const LANDMARKS = [{ id: 'pond', name: 'สระน้ำ', at: [345, 560] }]

/* ================================ convert ================================ */

// least-squares affine  photo = A · plan + t
function fitAffine(pairs) {
  const solve = (rhs) => {
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    const r = [0, 0, 0]
    pairs.forEach(([[x, y]], k) => {
      const row = [x, y, 1]
      for (let i = 0; i < 3; i++) {
        r[i] += row[i] * rhs[k]
        for (let j = 0; j < 3; j++) M[i][j] += row[i] * row[j]
      }
    })
    for (let i = 0; i < 3; i++)
      for (let k = i + 1; k < 3; k++) {
        const f = M[k][i] / M[i][i]
        for (let j = i; j < 3; j++) M[k][j] -= f * M[i][j]
        r[k] -= f * r[i]
      }
    const x = [0, 0, 0]
    for (let i = 2; i >= 0; i--) x[i] = (r[i] - M[i].slice(i + 1).reduce((s, v, j) => s + v * x[i + 1 + j], 0)) / M[i][i]
    return x
  }
  return { U: solve(pairs.map((p) => p[1][0])), V: solve(pairs.map((p) => p[1][1])) }
}
const { U, V } = fitAffine(MATCH)
const det = U[0] * V[1] - U[1] * V[0]
const r1 = (v) => Math.round(v * 10) / 10
// photo px → plan metres
const toPlan = ([u, v]) => {
  const du = u - U[2]
  const dv = v - V[2]
  return [r1((V[1] * du - U[1] * dv) / det), r1((-V[0] * du + U[0] * dv) / det)]
}
const pxPerM = Math.sqrt(Math.abs(det))
const m = (px) => r1(px / pxPerM)

const site = {
  roads: ROADS.map((r) => ({ ...r, width: m(r.width), line: r.line.map(toPlan) })),
  parking: PARKING.map((p) => ({ ...p, outline: p.outline.map(toPlan), rows: p.rows.map((row) => row.map(toPlan)), label: toPlan(p.label) })),
  pond: POND.map(toPlan),
  islands: ISLANDS.map((i) => ({ at: toPlan(i.at), r: m(i.r) })),
  structures: STRUCTURES.map((s) => ({ ...s, outline: s.outline.map(toPlan) })),
  green: GREEN.map((g) => ({ ...g, outline: g.outline.map(toPlan) })),
  neighbours: NEIGHBOURS.map((n) => n.map(toPlan)),
  ground: SITE.map(toPlan),
  gates: GATES.map((g) => ({ ...g, at: toPlan(g.at) })),
  landmarks: LANDMARKS.map((l) => ({ ...l, at: toPlan(l.at) })),
}

const js = `/*
 * Outside area for the 3D map (roads, car parks, pond, neighbours, entrances)
 * GENERATED from asset/cad/aerial.jpg by scripts/site-map.mjs (npm run site-map).
 * Edit the tracing in that script, not this file.
 * Units: plan metres – same as marketPlan.js (x → east, y → south).
 */
export const SITE = ${JSON.stringify(site).replace(/\],\[/g, '], [')}
`
fs.writeFileSync(OUT, js)
console.log(`✓ outside area → ${path.relative(ROOT, OUT)}  (photo scale ${pxPerM.toFixed(2)} px/m)`)

/* ---------------- optional: draw the tracing + CAD outlines on the photo ---------------- */
if (process.argv.includes('--preview')) {
  const { default: sharp } = await import('sharp')
  const { PLAN } = await import(new URL('../src/data/marketPlan.js', import.meta.url))
  const toPx = ([x, y]) => [U[0] * x + U[1] * y + U[2], V[0] * x + V[1] * y + V[2]]
  const poly = (p, style) => `<polygon points="${p.map((q) => q.join(',')).join(' ')}" ${style}/>`
  const line = (p, style) => `<polyline points="${p.map((q) => q.join(',')).join(' ')}" fill="none" ${style}/>`
  const svg = [
    ...NEIGHBOURS.map((p) => poly(p, 'fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-width="1"')),
    poly(SITE, 'fill="none" stroke="#ffee00" stroke-width="2" stroke-dasharray="6 4"'),
    ...GREEN.map((g) => poly(g.outline, 'fill="#00ff66" fill-opacity="0.25" stroke="#00ff66" stroke-width="1.5"')),
    ...PARKING.map((p) => poly(p.outline, 'fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="1.5"')),
    ...PARKING.flatMap((p) => p.rows.map((r) => line(r, 'stroke="#ff8800" stroke-width="2"'))),
    ...ROADS.map((r) => line(r.line, `stroke="#ff2222" stroke-opacity="0.5" stroke-width="${r.width}" stroke-linejoin="round"`)),
    poly(POND, 'fill="#00ccff" fill-opacity="0.35" stroke="#00ccff" stroke-width="2"'),
    ...STRUCTURES.map((s) => poly(s.outline, 'fill="#ffaa00" fill-opacity="0.35" stroke="#ffaa00" stroke-width="1.5"')),
    ...PLAN.buildings.map((b) => poly(b.outline.map(toPx), 'fill="none" stroke="#ff00ff" stroke-width="2"')),
    ...GATES.map((g) => `<circle cx="${g.at[0]}" cy="${g.at[1]}" r="7" fill="${g.dir === 'in' ? '#00cc66' : '#ff3333'}" stroke="#fff" stroke-width="2"/>`),
  ].join('')
  const out = path.join(ROOT, 'asset/cad/aerial-check.png')
  await sharp(path.join(ROOT, fs.existsSync(path.join(ROOT, 'asset/cad/aerial-marked.jpg')) ? 'asset/cad/aerial-marked.jpg' : 'asset/cad/aerial.jpg'))
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="810" height="934">${svg}</svg>`) }])
    .png()
    .toFile(out)
  console.log(`✓ preview → ${path.relative(ROOT, out)}`)
}

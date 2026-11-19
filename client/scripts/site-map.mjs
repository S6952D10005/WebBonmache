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

/* roads: centre line + width (px). kind: main (the big road in front) / street / lane (inside the site)
   Roads keep clear of the CAD buildings (a road never runs under a building on the map). */
const ROADS = [
  { id: 'main', kind: 'main', name: 'ถ.เทศบาลสงเคราะห์', width: 50, line: [[-400, 918], [1300, 918]] },
  // lane along the west side – stops short of the buildings at both ends
  { id: 'west', kind: 'lane', width: 15, line: [[112, 66], [112, 800]] },
  {
    id: 'east',
    kind: 'street',
    width: 22,
    // the public soi: along building F (kept a few metres off its wall), then south-east to the far-east road
    line: [[380, -400], [398, -60], [428, 36], [474, 109], [510, 168], [545, 218], [576, 260], [606, 310], [640, 360], [680, 405], [720, 440], [760, 480], [795, 520]],
  },
  // road along building E down to the main road – between G and M, west of the guard booth
  { id: 'e-road', kind: 'street', width: 18, line: [[430, 312], [474, 367], [524, 437], [573, 507], [620, 570], [660, 628], [684, 690], [682, 760], [673, 893]] },
  { id: 'northeast', kind: 'street', width: 18, line: [[600, -400], [620, -40], [650, 40], [700, 110], [760, 160], [1300, 560]] },
  { id: 'far-east', kind: 'street', width: 16, line: [[795, -400], [795, 560]] },
  // from the north yard, between อาคาร N and อาคาร D, round the car-park building to the E road
  { id: 'back-drive', kind: 'lane', width: 13, line: [[268, 184], [318, 184], [350, 190], [372, 226], [400, 258], [418, 288], [430, 312]] },
  // narrow drive between the market and อาคาร G, out to the main road
  { id: 'side-drive', kind: 'lane', width: 10, line: [[605, 893], [597, 822], [586, 790], [588, 760], [592, 724], [582, 700], [573, 662], [600, 605]] },
]

/* open-air car parks (outline) + rows of parking bays (bays stand across the row, ±5 m)
   Car parks keep clear of the CAD buildings and the guard booths. */
const PARKING = [
  {
    id: 'north-yard',
    outline: [[132, 122], [238, 122], [264, 150], [266, 178], [132, 180]],
    rows: [[[140, 137], [236, 137]], [[140, 165], [258, 165]]],
    label: [190, 151],
  },
  {
    id: 'front-west',
    outline: [[150, 848], [276, 848], [276, 886], [150, 886]],
    rows: [[[160, 872], [268, 872]]],
    label: [213, 868],
  },
  {
    id: 'front',
    // notch round the guard booth at the second entrance; ends before the booth at the exit
    outline: [[310, 886], [310, 850], [455, 824], [472, 822], [507, 820], [540, 812], [572, 815], [600, 802], [640, 822], [672, 842], [683, 850], [683, 886], [493, 886], [493, 852], [467, 852], [467, 886]],
    rows: [[[330, 856], [440, 838]], [[470, 836], [585, 826]], [[318, 874], [466, 874]], [[495, 874], [676, 874]]],
    label: [390, 872],
  },
  {
    id: 'east-yard',
    outline: [[650, 560], [800, 540], [800, 684], [703, 684], [690, 660], [675, 580]],
    rows: [[[680, 575], [790, 562]], [[684, 606], [790, 598]], [[690, 638], [790, 632]], [[702, 668], [790, 666]]],
    label: [770, 612],
  },
  {
    id: 'back-yard',
    outline: [[414, 240], [444, 240], [490, 302], [470, 318], [446, 300], [430, 290]],
    rows: [[[431, 248], [468, 300]]],
    label: [448, 276],
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
    // covered walkway between B&C and the pond (stays between the buildings, off the west lane)
    id: 'walkway-roof',
    name: 'หลังคาทางเดิน',
    height: 4.6,
    color: '#cdd5d5',
    outline: [[124, 430], [392, 430], [392, 446], [385, 470], [370, 484], [330, 490], [290, 486], [268, 474], [258, 452], [222, 448], [124, 448]],
  },
  // older buildings inside the property line that the CAD drawing does not have
  { id: 'north-house', kind: 'other', height: 6, color: '#a9b1b1', outline: [[172, 18], [215, 18], [240, 64], [222, 78], [150, 78], [150, 66], [172, 66]] },
  { id: 'north-row-1', kind: 'other', height: 6, color: '#a9b1b1', outline: [[232, 26], [292, 20], [322, 62], [330, 92], [292, 98], [258, 84]] },
]

/* green areas (lawn / woods) – flat on the map */
const GREEN = [
  { kind: 'woods', outline: [[290, 15], [395, 5], [424, 60], [446, 118], [436, 148], [386, 198], [352, 192], [332, 160], [300, 100]] },
  { kind: 'woods', outline: [[395, 232], [440, 242], [470, 298], [430, 330], [402, 290]] },
  { kind: 'lawn', outline: [[150, 884], [760, 884], [760, 893], [150, 893]] },
]

/* neighbouring blocks (flat, light) – drawn under the roads */
const NEIGHBOURS = [
  [[-400, -400], [100, -400], [100, 435], [-400, 435]],
  [[-400, 530], [100, 530], [100, 885], [-400, 885]],
  [[125, -400], [392, -400], [290, 15], [280, 90], [232, 92], [125, 92]],
  [[432, -400], [608, -400], [640, 40], [690, 110], [750, 160], [790, 195], [790, 505], [760, 480], [720, 440], [680, 405], [640, 360], [606, 310], [576, 260], [545, 218], [510, 168], [474, 109], [428, 36]],
  [[500, 300], [540, 255], [600, 315], [680, 405], [760, 480], [800, 520], [800, 545], [660, 550], [620, 520], [570, 455], [520, 385]],
  [[640, -400], [1300, -400], [1300, 540], [805, 545], [805, 190]],
  [[712, 700], [1300, 690], [1300, 886], [712, 886]],
  [[-400, 945], [1300, 945], [1300, 1400], [-400, 1400]],
]

/* the market's own ground = the property line drawn in blue on asset/cad/aerial-marked.jpg */
const SITE = [
  [103, 2], [384, 2],
  // along the public soi
  [391, 20], [405, 40], [418, 60], [431, 78], [443, 95], [458, 111], [466, 130], [478, 150], [495, 170], [512, 190], [528, 210], [542, 230], [550, 252], [558, 274], [548, 290],
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
  { id: 'out-2', dir: 'out', at: [675, 893] }, // on the E road, just west of the guard booth
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

/** 3D model of the CAD site plan (public/images/bon-floor-plan.webp, scale 1:250).
 * Same plan units as marketFloorPlan.js (image pixels ÷ 2, north points down).
 * Footprints, roads, parking rows, trees and stall rows follow the drawing;
 * the lines drawn on roofs only echo the unit partitions, they are not shop numbers.
 * Heights are chosen for a readable model, the plan has none.
 */
import { FLOOR_ZONES } from './marketFloorPlan'

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
const ring = (cx, cy, r, n = 18) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)])
/** Rounded rectangle as a polygon. */
function rounded(x, y, w, h, r, n = 5) {
  const pts = []
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) } }
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI)
  return pts
}
/** Box in a local frame: origin o, axis angle (deg), local rect s0..s1 along, t0..t1 across. */
function frameBox(o, deg, s0, s1, t0, t1) {
  const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]]
  return [[s0, t0], [s1, t0], [s1, t1], [s0, t1]].map(([s, t]) => [o[0] + u[0] * s + v[0] * t, o[1] + u[1] * s + v[1] * t])
}
/** Polygon band around a polyline (for canopies and planters). */
function band(line, w) {
  const left = [], right = []
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, n = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]
    left.push([p[0] + n[0] * w / 2, p[1] + n[1] * w / 2]); right.unshift([p[0] - n[0] * w / 2, p[1] - n[1] * w / 2])
  })
  return [...left, ...right]
}

/** Segments of the lines at `deg`, `gap` apart, that fall inside the polygon. */
export function hatch(poly, deg, gap, inset = 0) {
  const a = deg * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]]
  const proj = poly.map(p => p[0] * n[0] + p[1] * n[1])
  const lo = Math.min(...proj), hi = Math.max(...proj), out = []
  for (let c = lo + gap / 2 + ((hi - lo) % gap) / 2; c < hi; c += gap) {
    const ts = []
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length]
      const fp = p[0] * n[0] + p[1] * n[1] - c, fq = q[0] * n[0] + q[1] * n[1] - c
      if ((fp < 0) === (fq < 0)) continue
      const k = fp / (fp - fq), x = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]
      ts.push(x[0] * d[0] + x[1] * d[1])
    }
    ts.sort((x, y) => x - y)
    for (let i = 0; i + 1 < ts.length; i += 2) {
      const t0 = ts[i] + inset, t1 = ts[i + 1] - inset
      if (t1 - t0 > 2) out.push([[n[0] * c + d[0] * t0, n[1] * c + d[1] * t0], [n[0] * c + d[0] * t1, n[1] * c + d[1] * t1]])
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/*  Solids: buildings, stalls, kiosks                                  */
/* ------------------------------------------------------------------ */
const solids = []
const add = (points, height, opts = {}) => solids.push({ points, height, ...opts })
const zonePoly = code => FLOOR_ZONES.find(z => z.code === code).points

// Tops Daily (hatched on the plan) and อาคาร B,C
add([[98,518],[282,518],[282,658],[300,658],[300,778],[255,778],[255,943],[98,943]], 20, { kind: 'tops', lines: hatch([[98,540],[282,540],[282,658],[255,658],[255,943],[98,943]], 45, 14, 1) })
add(rect(98, 518, 184, 22), 22, { kind: 'plain', lines: hatch(rect(98, 518, 184, 22), 90, 30) })
add([[300,515],[468,515],[468,622],[345,622],[345,568],[300,568]], 16, { zone: 'BC', lines: [...hatch(rect(350, 572, 112, 48), 135, 9, 1), [[345,568],[468,568]], [[398,515],[398,568]]] })
add([[318,628],[566,628],[580,642],[580,695],[318,695]], 14, { zone: 'BC', lines: [...hatch(rect(318, 628, 262, 67), 90, 29.5), [[318,662],[580,662]]] })
add([[318,715],[598,715],[612,729],[612,764],[598,778],[318,778]], 14, { zone: 'BC', lines: [...hatch(rect(318, 715, 294, 63), 90, 33), [[318,746],[612,746]]] })
add(ring(628, 765, 21, 20), 20, { zone: 'BC', kind: 'dome' })
for (const y of [830, 853, 898, 921]) for (const [x0, x1] of [[298, 412], [500, 634]]) {
  const n = Math.round((x1 - x0) / 22.5)
  for (let i = 0; i < n; i++) { const x = x0 + (i * (x1 - x0)) / n; add(rect(x + 1.5, y + 1.5, (x1 - x0) / n - 3, 19), 6, { zone: 'BC', kind: 'stall' }) }
}
add([[428,900],[470,895],[485,915],[482,965],[460,980],[430,975],[425,940]], 9, { kind: 'plain' })
add([[645,820],[675,820],[675,875],[645,875]], 7, { kind: 'plain', lines: hatch(rect(645, 820, 30, 55), 60, 6) })
add(frameBox([662,850], -45, -20, 42, -18, 18), 8, { kind: 'plain' })

// อาคาร A: two rows of units either side of the walkway
add([[88,1020],[222,1020],[222,1270],[272,1270],[272,1500],[88,1500]], 11, { zone: 'A', lines: [...hatch([[98,1028],[212,1028],[212,1300],[262,1300],[262,1492],[98,1492]], 0, 22.5, 2), [[122,1028],[122,1410]], [[145,1028],[145,1492]], [[165,1028],[165,1492]], [[210,1300],[210,1492]]] })

// อาคาร N, อาคาร D, carport and อาคารหอพัก at the top of the plan
add(rect(75, 256, 150, 61), 13, { zone: 'N', lines: [[[107,256],[107,317]], [[195,256],[195,317]], [[107,286],[195,286]]] })
add(zonePoly('D'), 15, { zone: 'D', lines: hatch(zonePoly('D'), 135, 26, 3) })
add([[148,148],[164,128],[262,214],[225,248]], 6, { kind: 'carport', lines: hatch([[148,148],[164,128],[262,214],[225,248]], 135, 9, 1) })
add([[10,100],[56,100],[56,118],[75,118],[75,138],[133,138],[133,212],[10,212]], 18, { kind: 'plain', lines: [[[75,138],[75,212]], [[10,160],[75,160]]] })
add([[42,25],[66,10],[108,62],[88,78],[70,70],[55,60]], 10, { kind: 'plain' })

// อาคาร F: hall with stall rows, service strip on the boundary side
{
  const f = zonePoly('F')
  add(f, 13, { zone: 'F', lines: [...hatch([[618,545],[728,462],[892,690],[792,770]], 54.5, 40, 4), ...hatch([[618,545],[728,462],[892,690],[792,770]], -35.5, 28, 4)] })
}

// อาคาร E with the narrow annex on the pond side
add([[708,990],[760,945],[785,928],[820,975],[870,1045],[910,1095],[940,1150],[975,1215],[1002,1282],[985,1300],[950,1315],[905,1320],[872,1310],[850,1290],[838,1258],[795,1190],[755,1130],[725,1080],[712,1040]], 16,
  { zone: 'E', lines: hatch([[715,995],[785,935],[995,1280],[905,1312],[845,1260]], -30.5, 27, 4) })
add([[728,1205],[778,1190],[805,1272],[765,1292]], 10, { zone: 'E', lines: hatch([[728,1205],[778,1190],[805,1272],[765,1292]], -16, 22, 2) })

// อาคาร G, KFC, อาคาร M, อาคาร H, อาคาร K
add([[1000,1445],[1078,1418],[1095,1465],[1015,1495]], 13, { zone: 'G', lines: [...hatch([[1000,1445],[1078,1418],[1095,1465],[1015,1495]], -19, 26), ...hatch([[1000,1445],[1078,1418],[1095,1465],[1015,1495]], 71, 25)] })
add([[1100,1425],[1125,1418],[1162,1490],[1180,1560],[1150,1582],[1118,1560],[1105,1500]], 12, { zone: 'G' })
add([[1040,1515],[1105,1505],[1118,1560],[1105,1585],[1050,1588],[1038,1560]], 10, { zone: 'G' })
add([[965,1432],[992,1422],[1008,1500],[990,1505]], 5, { zone: 'G', kind: 'stall' })
add(rounded(1045, 1598, 115, 122, 26), 11, { kind: 'kfc' })
add(zonePoly('M'), 13, { zone: 'M', lines: hatch(zonePoly('M'), 30, 28, 2) })
add(zonePoly('H'), 14, { zone: 'H', lines: hatch(zonePoly('H'), 55, 30, 2) })
add(zonePoly('K'), 12, { zone: 'K', lines: hatch(zonePoly('K'), 60, 26, 2) })

// อาคาร J (Starbucks) and the kiosks beside it
add([[342,1270],[400,1268],[430,1298],[440,1322],[425,1338],[420,1382],[400,1394],[345,1392]], 12, { zone: 'J', kind: 'cafe' })
add(rect(292, 1292, 38, 48), 7, { zone: 'J', lines: hatch(rect(292, 1292, 38, 48), 0, 12) })
add(rect(292, 1362, 38, 34), 7, { zone: 'J', lines: hatch(rect(292, 1362, 38, 34), 0, 12) })

// ตลาด: straight stall rows, then the rows that turn with the road
const marketXs = [115, 145, 175, 205, 235, 265, 295, 325, 355, 385]
for (const y of [1520, 1575, 1622, 1678]) marketXs.slice(1).forEach((x, i) => add(rect(marketXs[i] + 1.5, y, x - marketXs[i] - 3, 28), 6, { zone: 'MK', kind: 'stall', lines: [[[marketXs[i] + 2, y + 14], [x - 2, y + 14]]] }))
for (let x = 135; x < 380; x += 31) add(rect(x + 1, 1722, 29, 14), 5, { zone: 'MK', kind: 'stall' })
for (let x = 185; x < 380; x += 40) add(rect(x + 1, 1742, 38, 23), 5, { zone: 'MK', kind: 'stall' })
const slope = -0.135
const sloped = (x0, x1, y0, w, d, h, kind = 'stall') => {
  for (let x = x0; x + w <= x1 + 1; x += w) {
    const ya = y0 + (x - x0) * slope, yb = y0 + (x + w - 3 - x0) * slope
    add([[x + 1.5, ya], [x + w - 1.5, yb], [x + w - 1.5, yb + d], [x + 1.5, ya + d]], h, { zone: 'MK', kind, lines: d > 30 ? [] : [[[x + 2, ya + d / 2], [x + w - 2, yb + d / 2]]] })
  }
}
sloped(412, 700, 1512, 32, 26, 6)
sloped(412, 700, 1560, 32, 26, 6)
sloped(412, 700, 1606, 32, 26, 6)
sloped(418, 715, 1660, 50, 42, 8, 'shop')
sloped(418, 715, 1708, 50, 36, 8, 'shop')
sloped(405, 690, 1440, 48, 40, 8, 'shop')

// FOOD COURT: table clusters under umbrellas and the curved row of food shops
const tables = [[712,1506,72,40,-12],[812,1482,62,36,-15],[892,1466,54,40,-15],[724,1552,108,38,-14],[842,1527,108,38,-14]]
for (const [x, y, w, h, deg] of tables) {
  add(frameBox([x, y], deg, 0, w, 0, h), 2, { zone: 'FC', kind: 'deck' })
  for (let i = 0; i < Math.max(1, Math.round(w / 34)); i++) {
    const s = (w / Math.max(1, Math.round(w / 34))) * (i + 0.5), a = deg * Math.PI / 180
    solids.push({ kind: 'umbrella', zone: 'FC', at: [x + Math.cos(a) * s - Math.sin(a) * h / 2, y + Math.sin(a) * s + Math.cos(a) * h / 2], r: 13, height: 10 })
  }
}
add([[746,1642],[860,1612],[985,1578],[995,1612],[982,1650],[935,1680],[862,1696],[776,1700],[754,1674]], 10, { zone: 'FC', lines: hatch([[746,1642],[985,1578],[995,1612],[982,1650],[935,1680],[862,1696],[776,1700]], 70, 27, 2) })
add([[822,1557],[978,1520],[988,1560],[832,1597]], 8, { zone: 'FC', lines: hatch([[822,1557],[978,1520],[988,1560],[832,1597]], 76, 26) })
add(rect(700, 1456, 14, 22), 7, { zone: 'FC', kind: 'stall' })

// Canopy walkway along the pond, the café on the pond and the sala on the island
add(band([[400,1402],[480,1386],[560,1373],[640,1364],[692,1362]], 22), 8, { kind: 'canopy' })
add([[600,1012],[700,998],[712,1080],[708,1135],[650,1145],[622,1090]], 10, { kind: 'plain', lines: hatch([[600,1012],[700,998],[712,1080],[708,1135],[650,1145],[622,1090]], 20, 24, 3) })
add([[345,1180],[360,1160],[390,1145],[410,1160],[412,1200],[400,1225],[370,1220],[350,1205]], 7, { kind: 'sala' })

// Security, shops along the road, the sign island
add([[15,1720],[48,1720],[48,1758],[62,1758],[62,1838],[15,1838]], 10, { kind: 'plain' })
for (let x = 176; x < 368; x += 25) add(rect(x, 1826, 21, 34), 7, { kind: 'shop' })
for (let x = 822; x < 1000; x += 22) add(rect(x, 1820, 20, 30), 7, { kind: 'shop' })
add(rect(1040, 1820, 70, 32), 8, { kind: 'plain' })
add(rect(1190, 1825, 32, 35), 7, { kind: 'plain' })
add(rect(450, 1826, 150, 30), 6, { kind: 'shop', lines: hatch(rect(450, 1826, 150, 30), 90, 15) })

export const SOLIDS = solids

/* ------------------------------------------------------------------ */
/*  Ground                                                             */
/* ------------------------------------------------------------------ */
export const SITE_OUTLINE = [[3,75],[68,8],[500,457],[598,532],[730,403],[932,693],[790,800],[860,890],[1000,1075],[1145,1243],[1335,1110],[1460,1258],[1475,1440],[1505,1540],[1370,1595],[1300,1700],[1430,1866],[3,1866]]

/** Asphalt roads: centre line + width. `lanes` draws the dashed centre line. */
export const ROADS = [
  { line: [[66,226],[66,1800]], w: 44, lanes: true },
  { line: [[44,492],[560,492]], w: 40, lanes: true },
  { line: [[530,492],[555,567],[744,827],[775,880],[868,985],[950,1100],[1045,1222],[1150,1300]], w: 46, lanes: true },
  { line: [[22,1796],[1262,1792]], w: 38, lanes: true },
  { line: [[1215,1440],[1232,1520],[1232,1866]], w: 58, lanes: true },
  { line: [[66,330],[52,282],[74,246],[120,236],[232,236]], w: 24 },
  { line: [[130,1792],[130,1866]], w: 34 },
  { line: [[760,1792],[760,1866]], w: 46, lanes: true },
  { line: [[1048,1745],[1188,1745],[1188,1600]], w: 24 },
]
/** ถนนเทศบาลสงเคราะห์ (outside the site, along the bottom of the plan). */
export const MAIN_ROAD = { y0: 1868, y1: 1912, x0: -140, x1: 1650 }
export const SIDEWALKS = [
  band([[-140,1864],[1650,1864]], 8),
  band([[-140,1916],[1650,1916]], 8),
]
export const CROSSINGS = [
  { at: [1232, 1566], deg: 0, len: 56, w: 18 },
  { at: [760, 1880], deg: 90, len: 44, w: 20 },
  { at: [1232, 1890], deg: 90, len: 44, w: 20 },
  { at: [66, 1505], deg: 0, len: 40, w: 14 },
]
/** Painted arrows: position and heading in plan degrees (0 = +x). */
export const ARROWS = [
  [240, 1796, 180], [610, 1794, 180], [930, 1793, 180], [1150, 1792, 180],
  [66, 1150, -90], [66, 1560, -90], [300, 492, 0], [1232, 1700, 90], [1232, 1620, -90],
  [745, 1846, -90], [775, 1846, 90], [712, 780, 54], [989, 1150, 52],
]

/** Parking: surface polygons and stall rows ([a, b] edge, depth, slant). */
export const PARKING = [
  { area: rect(48, 382, 222, 88), rows: [{ a: [52,426], b: [266,426], depth: 40, gap: 18 }, { a: [266,426], b: [52,426], depth: 40, gap: 18 }] },
  { area: rect(4, 500, 38, 1280), rows: [{ a: [42,500], b: [42,1780], depth: 36, gap: 20, slant: 16 }] },
  { area: [[1165,1285],[1360,1210],[1420,1226],[1466,1300],[1478,1440],[1445,1492],[1290,1502],[1242,1440],[1200,1370]],
    rows: [
      { a: [1214,1282], b: [1382,1216], depth: 44, gap: 17, slant: 12 },
      { a: [1206,1384], b: [1414,1308], depth: 44, gap: 17, slant: 12 },
      { a: [1414,1308], b: [1206,1384], depth: 44, gap: 17, slant: -12 },
      { a: [1300,1478], b: [1468,1414], depth: -42, gap: 17, slant: 12 },
    ] },
  { area: [[766,1726],[962,1726],[962,1766],[766,1766]], rows: [{ a: [766,1766], b: [962,1766], depth: -38, gap: 22 }] },
  { area: band([[600,561],[760,783]], 36), rows: [{ a: [615,550], b: [775,772], depth: 34, gap: 19, slant: 10 }] },
  { area: band([[902,959],[1079,1196]], 36), rows: [{ a: [888,970], b: [1065,1207], depth: -34, gap: 19, slant: 10 }] },
]
/** Planted islands in the K car park and the strip around อาคาร K. */
export const PLANTERS = [
  rounded(1118, 1268, 50, 72, 22), rounded(1188, 1370, 48, 72, 22),
  [[1150,1248],[1335,1112],[1400,1210],[1372,1214],[1342,1140],[1187,1233],[1212,1274],[1170,1290]],
]
export const POND = [[330,1025],[400,1012],[470,1006],[540,1001],[598,1010],[625,1090],[655,1150],[695,1230],[738,1318],[660,1352],[560,1362],[470,1378],[410,1392],[345,1392],[338,1300]]
export const GARDENS = [
  [[252,990],[300,985],[330,1025],[338,1300],[290,1288],[288,1400],[252,1400]],
  [[655,1150],[708,1140],[728,1205],[738,1318],[695,1230]],
  [[690,1362],[760,1340],[800,1340],[760,1400],[700,1420]],
  [[640,1812],[735,1812],[735,1866],[640,1866]],
]
export const PLAZAS = [
  rect(88, 958, 212, 62),
  [[282,955],[680,955],[700,1000],[600,1012],[330,1025],[300,985]],
  [[905,1332],[1000,1290],[1068,1392],[965,1432],[950,1470]],
]
export const TREES = [
  [245,1050],[312,1022],[275,1100],[305,1095],[282,1125],[246,1186],[312,1238],[318,1270],[236,1270],[368,1410],[382,1436],[366,1462],
  [690,1390],[724,1346],[792,1336],[712,1150],[728,1158],[600,1030],
  [105,1840],[160,1840],[408,1852],[1172,1840],[690,1852],[1260,1500],
  [1140,1306],[1212,1408],[1385,1180],[1240,1262],
]
/** A few parked cars: [x, y, heading deg, colour]. */
export const CARS = [
  [80,404,90,'#d8dde3'],[134,448,90,'#3d5a80'],[188,404,90,'#ef8354'],[242,448,90,'#f4f4f4'],[116,404,90,'#9aa5b1'],
  [23,700,0,'#c0392b'],[23,980,0,'#f4f4f4'],[23,1320,0,'#2d3e50'],[23,1620,0,'#d8dde3'],
  [1262,1260,-21,'#f4f4f4'],[1330,1236,-21,'#5d6d7e'],[1250,1357,-21,'#e9c46a'],[1372,1316,-21,'#2a9d8f'],[1320,1404,-21,'#f4f4f4'],[1405,1352,-21,'#264653'],[1395,1440,-21,'#d8dde3'],
  [650,1762,0,'#f4f4f4'],[668,1792,0,'#9aa5b1'],[915,1792,0,'#e76f51'],[800,1745,90,'#d8dde3'],[708,700,144,'#5d6d7e'],[969,1049,-37,'#f4f4f4'],
]
export const MONUMENT = { at: [688, 1838], w: 64, h: 26 }

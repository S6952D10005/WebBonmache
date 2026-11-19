/*
 * Plan-space shapes for the market map that are generated, not drawn:
 *   - shop units on each shop roof (rows of stalls with aisles – a floor-plan look)
 *   - small house blocks in the neighbourhood around the market
 *   - parking bays of the open-air car parks
 * Everything here is in plan metres (same as marketPlan.js / marketSite.js) and is
 * computed once; MarketMap.jsx only projects it for the current camera.
 * The layout is decorative – the units do not match real stall numbers.
 */

/* ---------- small polygon helpers ---------- */
export function inside([x, y], poly) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
function distToPolyline([x, y], line) {
  let best = Infinity
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1]
    const [bx, by] = line[i]
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)))
    best = Math.min(best, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)))
  }
  return best
}
// deterministic "random" number 0..1 from integers (same picture on every load)
const hash = (...n) => {
  let h = 2166136261
  for (const v of n) h = Math.imul(h ^ (v | 0), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

/* ======================================================================== */
/*  Shop units on a roof                                                    */
/*  Rows run along the building's longest wall; each row is split into     */
/*  stalls of different widths, with aisles between rows and a cross aisle */
/*  every ~26 m. Cells are clipped to the roof when drawn.                  */
/* ======================================================================== */
export function roofUnits(outline, seed = 0) {
  // main direction = longest wall
  let best = 0
  let ang = 0
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len > best) [best, ang] = [len, Math.atan2(b[1] - a[1], b[0] - a[0])]
  })
  const u = [Math.cos(ang), Math.sin(ang)]
  const v = [-u[1], u[0]]
  const U = outline.map((p) => p[0] * u[0] + p[1] * u[1])
  const V = outline.map((p) => p[0] * v[0] + p[1] * v[1])
  const [u0, u1, v0, v1] = [Math.min(...U), Math.max(...U), Math.min(...V), Math.max(...V)]
  const at = (a, b) => [u[0] * a + v[0] * b, u[1] * a + v[1] * b]

  const EDGE = 0.7 // walkway along the outer walls
  const AISLE = 3
  const depth = v1 - v0 - EDGE * 2
  if (depth < 4) return []
  const bands = Math.max(1, Math.round((depth + AISLE) / 11))
  const bandDepth = (depth - (bands - 1) * AISLE) / bands
  const widths = [4.2, 5.6, 3.8, 6.4, 4.8, 5.2, 7, 4.4, 3.6, 6]
  const GAP = 0.35

  const cells = []
  for (let r = 0; r < bands; r++) {
    const b0 = v0 + EDGE + r * (bandDepth + AISLE)
    // deep rows = two stalls back to back
    const halves = bandDepth > 7 ? [[b0, b0 + bandDepth / 2], [b0 + bandDepth / 2, b0 + bandDepth]] : [[b0, b0 + bandDepth]]
    let a = u0 + EDGE
    let sinceAisle = 0
    let k = Math.floor(hash(seed, r) * widths.length)
    while (a < u1 - EDGE - 2) {
      if (sinceAisle > 26 && u1 - EDGE - a > 12) {
        a += AISLE // cross aisle
        sinceAisle = 0
        continue
      }
      const w = Math.min(widths[k++ % widths.length], u1 - EDGE - a)
      for (const [h0, h1] of halves) {
        const q = [at(a + GAP / 2, h0 + GAP / 2), at(a + w - GAP / 2, h0 + GAP / 2), at(a + w - GAP / 2, h1 - GAP / 2), at(a + GAP / 2, h1 - GAP / 2)]
        const mid = at(a + w / 2, (h0 + h1) / 2)
        // keep cells that are (mostly) on the roof
        const onRoof = [mid, ...q].filter((p) => inside(p, outline)).length
        if (onRoof >= 3) cells.push({ q, tone: hash(seed, r, Math.round(a * 10), Math.round(h0)) })
      }
      a += w
      sinceAisle += w
    }
  }
  return cells
}

/* ======================================================================== */
/*  Neighbourhood blocks – small house footprints in the neighbour areas    */
/*  (kept away from the roads), so the map around the market reads like a   */
/*  city map instead of empty plates                                        */
/* ======================================================================== */
export function neighbourhoodBlocks(site, region = { x0: -70, x1: 300, y0: -110, y1: 330 }) {
  const blocks = []
  const STEP = 15
  for (let y = region.y0, row = 0; y < region.y1; y += STEP, row++)
    for (let x = region.x0 + (row % 2) * 6, col = 0; x < region.x1; x += STEP, col++) {
      const r = hash(row, col)
      if (r < 0.18) continue // some empty plots
      const w = 7 + hash(col, row, 1) * 5
      const h = 6 + hash(col, row, 2) * 5
      const cx = x + (hash(row, col, 3) - 0.5) * 3
      const cy = y + (hash(row, col, 4) - 0.5) * 3
      const q = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]]
      const area = site.neighbours.find((n) => inside([cx, cy], n))
      if (!area || !q.every((p) => inside(p, area))) continue
      if (inside([cx, cy], site.ground)) continue
      const nearRoad = site.roads.some((road) => q.some((p) => distToPolyline(p, road.line) < road.width / 2 + 3))
      if (nearRoad) continue
      blocks.push(q)
    }
  return blocks
}

/* ======================================================================== */
/*  Parking bays along each row of an open-air car park                    */
/* ======================================================================== */
export function lotBays(lot) {
  const lines = []
  lot.rows.forEach(([a, b]) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    const n = [-u[1], u[0]]
    const at = (t, k) => [a[0] + u[0] * t + n[0] * k, a[1] + u[1] * t + n[1] * k]
    for (let t = 0; t <= len + 0.01; t += 2.6) lines.push([at(t, -5), at(t, 5)])
    lines.push([a, b])
  })
  // direction of the first row (for the "ลานจอดรถ" text)
  const [a, b] = lot.rows[0] || [[0, 0], [1, 0]]
  return { lines, dir: [a, b] }
}

/* ======================================================================== */
/*  Stall lines on the car-park building roof: pairs of 5 m stall rows      */
/*  around a 6 m driving lane, repeated across the roof (clipped when drawn) */
/* ======================================================================== */
export function parkingStripes(outline) {
  const xs = outline.map((p) => p[0])
  const ys = outline.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const lines = []
  for (let y = y0 + 1; y + 5 <= y1 - 0.5; y += 16)
    for (const [s0, s1] of [[y, y + 5], [y + 11, y + 16]]) {
      if (s1 > y1 - 0.5) continue
      lines.push([[x0 + 1, s0], [x1 - 1, s0]], [[x0 + 1, s1], [x1 - 1, s1]])
      for (let x = x0 + 1; x <= x1 - 1; x += 2.6) lines.push([[x, s0], [x, s1]])
    }
  return lines
}

/*
 * Overlap check for the 3D map: nothing should run under a building.
 *   node scripts/map-check.mjs
 * Lists every road / car park / low roof that comes closer than `MIN` metres to a CAD
 * building (or overlaps it), and buildings that overlap each other. Run it after
 * changing scripts/site-map.mjs or the drawing.
 */
const { PLAN } = await import('../src/data/marketPlan.js')
const { SITE } = await import('../src/data/marketSite.js')
const MIN = 0.5 // metres of clear ground wanted between a road edge / car park and a wall

const segDist = ([x, y], [ax, ay], [bx, by]) => {
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)))
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay))
}
const inside = ([x, y], poly) => {
  let h = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) h = !h
  }
  return h
}
const ring = (o) => [...o, o[0]]
// points every 0.5 m along a polyline
const along = (line) =>
  line.slice(1).flatMap((b, i) => {
    const a = line[i]
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5))
    return Array.from({ length: n + 1 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n])
  })
const distToOutline = (p, o) => Math.min(...ring(o).slice(1).map((b, i) => segDist(p, ring(o)[i], b)))

const buildings = PLAN.buildings.map((b) => ({ name: b.name, outline: b.outline }))
const problems = []
// roads: centre line within half width (+MIN) of a wall, or inside a building
for (const r of SITE.roads)
  for (const b of buildings) {
    const pts = along(r.line)
    const worst = Math.min(...pts.map((p) => (inside(p, b.outline) ? -1 : distToOutline(p, b.outline))))
    if (worst < r.width / 2 + MIN) problems.push(`road ${r.id} × ${b.name}: ${(worst - r.width / 2).toFixed(1)} m clear`)
  }
// flat / low shapes: their outline must stay outside every building (and keep MIN away)
const shapes = [
  ...SITE.parking.map((l) => ({ name: `car park ${l.id}`, outline: l.outline })),
  ...SITE.structures.map((s) => ({ name: `roof ${s.id}`, outline: s.outline })),
]
for (const s of shapes)
  for (const b of buildings) {
    const pts = along(ring(s.outline))
    const hit = pts.some((p) => inside(p, b.outline)) || along(ring(b.outline)).some((p) => inside(p, s.outline))
    const gap = Math.min(...pts.map((p) => distToOutline(p, b.outline)))
    if (hit || gap < MIN) problems.push(`${s.name} × ${b.name}: ${hit ? 'overlaps' : gap.toFixed(1) + ' m'}`)
  }
// buildings against each other
for (let i = 0; i < buildings.length; i++)
  for (let j = i + 1; j < buildings.length; j++) {
    const [a, b] = [buildings[i], buildings[j]]
    const hit = along(ring(a.outline)).some((p) => inside(p, b.outline)) || along(ring(b.outline)).some((p) => inside(p, a.outline))
    if (hit) problems.push(`building ${a.name} × ${b.name}: overlaps`)
  }
console.log(problems.length ? problems.join('\n') : '✓ nothing overlaps')

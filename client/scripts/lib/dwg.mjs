/*
 * Shared DWG helpers for the map scripts (cad-map, cad-render).
 *   readGroups(file) → Map(group name → [[x1,y1,z1,x2,y2,z2], …])  every line / arc in world
 *                      space, tagged with its top-level group (block insert) – loose lines are 'MODEL'
 *   closedLoops(segs), signedArea, simplify, inside, labelPoint – 2D polygon helpers
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Dwg_File_Type, LibreDwg } from '@mlightcad/libredwg-web'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/* ---------------- 3D transforms (block inserts, OCS) ---------------- */
const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]
const mul = (a, b) => {
  const r = new Array(12)
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++) r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + (j === 3 ? a[i * 4 + 3] : 0)
  return r
}
const apply = (m, p) => ({
  x: m[0] * p.x + m[1] * p.y + m[2] * (p.z || 0) + m[3],
  y: m[4] * p.x + m[5] * p.y + m[6] * (p.z || 0) + m[7],
  z: m[8] * p.x + m[9] * p.y + m[10] * (p.z || 0) + m[11],
})
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const unit = (v) => {
  const l = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}
// AutoCAD "arbitrary axis algorithm": object coordinate system → world
function ocs(n) {
  if (!n) return I()
  n = unit(n)
  if (Math.abs(n.z - 1) < 1e-9) return I()
  const ax = unit(Math.abs(n.x) < 1 / 64 && Math.abs(n.y) < 1 / 64 ? cross({ x: 0, y: 1, z: 0 }, n) : cross({ x: 0, y: 0, z: 1 }, n))
  const ay = unit(cross(n, ax))
  return [ax.x, ay.x, n.x, 0, ax.y, ay.y, n.y, 0, ax.z, ay.z, n.z, 0]
}
function insertMatrix(e, blk) {
  const base = blk?.basePoint || { x: 0, y: 0, z: 0 }
  const c = Math.cos(e.rotation || 0)
  const s = Math.sin(e.rotation || 0)
  const p = e.insertionPoint
  const T = [1, 0, 0, p.x, 0, 1, 0, p.y, 0, 0, 1, p.z || 0]
  const R = [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0]
  const S = [e.xScale ?? 1, 0, 0, 0, 0, e.yScale ?? 1, 0, 0, 0, 0, e.zScale ?? 1, 0]
  const B = [1, 0, 0, -base.x, 0, 1, 0, -base.y, 0, 0, 1, -(base.z || 0)]
  return mul(ocs(e.extrusionDirection), mul(T, mul(R, mul(S, B))))
}

/**
 * every line / arc of the drawing in world space, grouped by top-level block insert.
 * Nested inserts stay in their parent's group; `nested` lists them (e.g. a label block).
 */
export async function readGroups(file) {
  const libredwg = await LibreDwg.create(path.join(ROOT, 'node_modules/@mlightcad/libredwg-web/wasm/') + '/')
  const raw = libredwg.dwg_read_data(new Uint8Array(fs.readFileSync(file)).buffer, Dwg_File_Type.DWG)
  const db = libredwg.convert(raw)
  libredwg.dwg_free(raw)
  const blocks = new Map((db.tables.BLOCK_RECORD.entries || []).map((b) => [b.name, b]))

  const segs = new Map()
  const nested = new Map()
  const push = (g, a, b) => (segs.get(g) || segs.set(g, []).get(g)).push([a.x, a.y, a.z, b.x, b.y, b.z])
  function walk(ents, m, group) {
    for (const e of ents) {
      if (e.type === 'LINE') push(group, apply(m, e.startPoint), apply(m, e.endPoint))
      else if (e.type === 'ARC' || e.type === 'CIRCLE') {
        const o = mul(m, ocs(e.extrusionDirection))
        const a0 = e.type === 'CIRCLE' ? 0 : e.startAngle
        let a1 = e.type === 'CIRCLE' ? Math.PI * 2 : e.endAngle
        if (a1 < a0) a1 += Math.PI * 2
        const n = Math.max(6, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 32))
        let prev = null
        for (let i = 0; i <= n; i++) {
          const t = a0 + ((a1 - a0) * i) / n
          const p = apply(o, { x: e.center.x + e.radius * Math.cos(t), y: e.center.y + e.radius * Math.sin(t), z: e.center.z || 0 })
          if (prev) push(group, prev, p)
          prev = p
        }
      } else if (e.type === 'INSERT') {
        const blk = blocks.get(e.name)
        if (!blk) continue
        if (group === 'MODEL') walk(blk.entities || [], mul(m, insertMatrix(e, blk)), e.name)
        else {
          ;(nested.get(group) || nested.set(group, []).get(group)).push(e.name)
          // nested blocks get their own group too (label blocks inside a building group)
          walk(blk.entities || [], mul(m, insertMatrix(e, blk)), `${group}/${e.name}`)
        }
      }
    }
  }
  walk(db.entities, I(), 'MODEL')
  return { segs, nested }
}

/* ---------------- 2D polygon helpers ---------------- */
const key = (x, y) => `${Math.round(x * 200)},${Math.round(y * 200)}`
export function closedLoops(list) {
  const adj = new Map()
  const pts = new Map()
  const link = (a, b) => (adj.get(a) || adj.set(a, []).get(a)).push(b)
  for (const s of list) {
    const a = key(s[0], s[1])
    const b = key(s[3], s[4])
    if (a === b) continue
    pts.set(a, [s[0], s[1]])
    pts.set(b, [s[3], s[4]])
    link(a, b)
    link(b, a)
  }
  const used = new Set()
  const edge = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)
  const loops = []
  for (const [start, next] of adj)
    for (const first of next) {
      if (used.has(edge(start, first))) continue
      used.add(edge(start, first))
      const loop = [start]
      let prev = start
      let cur = first
      for (let guard = 0; cur !== start && guard < 10000; guard++) {
        loop.push(cur)
        const nxt = (adj.get(cur) || []).find((n) => n !== prev && !used.has(edge(cur, n)))
        if (!nxt) break
        used.add(edge(cur, nxt))
        prev = cur
        cur = nxt
      }
      if (cur === start && loop.length > 2) loops.push(loop.map((k) => pts.get(k)))
    }
  return loops
}
export const signedArea = (p) =>
  p.reduce((a, [x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    return a + x1 * y2 - x2 * y1
  }, 0) / 2

// remove points that sit (almost) on a straight line between their neighbours
export function simplify(p, tol = 0.12) {
  const pts = p.slice()
  for (let changed = true; changed && pts.length > 3; ) {
    changed = false
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i - 1 + pts.length) % pts.length]
      const b = pts[i]
      const c = pts[(i + 1) % pts.length]
      const d = Math.abs((c[0] - a[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (c[1] - a[1])) / (Math.hypot(c[0] - a[0], c[1] - a[1]) || 1)
      if (d < tol) {
        pts.splice(i, 1)
        changed = true
        break
      }
    }
  }
  return pts
}
export const inside = ([x, y], poly) => {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
const distToEdges = ([x, y], poly) => {
  let best = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j]
    const [bx, by] = poly[i]
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)))
    best = Math.min(best, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)))
  }
  return best
}
// the point deepest inside the outline (label spot – also works for L-shapes)
export function labelPoint(poly) {
  const xs = poly.map((p) => p[0])
  const ys = poly.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  let best = [(x0 + x1) / 2, (y0 + y1) / 2]
  let bestD = -1
  for (let i = 1; i < 60; i++)
    for (let j = 1; j < 60; j++) {
      const p = [x0 + ((x1 - x0) * i) / 60, y0 + ((y1 - y0) * j) / 60]
      if (!inside(p, poly)) continue
      const d = distToEdges(p, poly)
      if (d > bestD) [best, bestD] = [p, d]
    }
  return best
}

/* ground outline loops of one group (lines lying on the ground), biggest first */
export const groundLoops = (list, zMax = 0.05) =>
  closedLoops(list.filter((s) => s[2] < zMax && s[5] < zMax)).sort((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)))

/* wall height = most common top of the vertical edges standing on the ground */
export function wallHeight(list, fallback = 6) {
  const tops = new Map()
  for (const s of list) {
    const vertical = Math.hypot(s[0] - s[3], s[1] - s[4]) < 0.01 && Math.min(s[2], s[5]) < 0.05 && Math.abs(s[2] - s[5]) > 1
    if (vertical) {
      const z = Math.max(s[2], s[5]).toFixed(1)
      tops.set(z, (tops.get(z) || 0) + 1)
    }
  }
  return +([...tops.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback)
}

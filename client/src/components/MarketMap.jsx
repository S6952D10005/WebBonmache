import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, LogIn, Pointer, LogOut, Minus, Plus, RotateCcw, RotateCw, Square, Store, Undo2, Waves } from 'lucide-react'
import { useI18n } from '../i18n'
import { PLAN } from '../data/marketPlan'
import { SITE } from '../data/marketSite'

/*
 * ===========================================================================
 *  Market map – 3D plan drawn from the CAD drawing
 * ===========================================================================
 *  Building outlines + heights come from src/data/marketPlan.js, which is
 *  generated from asset/cad/market.dwg (npm run cad-map). Each building is a
 *  zone: tap it and the shop list below shows only its shops.
 *
 *  The 3D look is drawn by hand in SVG (no 3D library): every outline corner is
 *  turned / tilted with the camera, walls are drawn back-to-front, then the
 *  roofs and the name pins on top.
 *   - "กดเพื่อเริ่มใช้งาน / TAP TO NAVIGATE" overlay → tap to start
 *   - 2D (straight down) / 3D (tilted, buildings rise up), rotate left / right,
 *     zoom, drag to move, reset – camera moves are animated
 * ===========================================================================
 */

/* zone colours (also used for the zone chip above the shop list) */
export const ZONE_COLORS = {
  MK: '#1f9285',
  A: '#f7931e',
  BC: '#00a3e0',
  E: '#ec1c8c',
  F: '#7f63c9',
  G: '#8cc63f',
  H: '#f0483e',
}
const PARKING = '#b9c3c4'

const HEIGHT_SCALE = 1.9 // buildings drawn a little taller than real so the 3D reads well
const PITCH_3D = (52 * Math.PI) / 180
const START_BEARING = (-18 * Math.PI) / 180
const QUARTER = Math.PI / 4

/* ---------- small colour helpers ---------- */
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
// mix two "#rrggbb" colours (t = 0 → c, 1 → to); returns "#rrggbb" so results can be mixed again
const mix = (c, to, t) => {
  const a = hex(c)
  const b = hex(to)
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}

/* ---------- camera ---------- */
const CX = PLAN.width / 2
const CY = PLAN.depth / 2
function makeProjector({ pitch, bearing }) {
  const c = Math.cos(bearing)
  const s = Math.sin(bearing)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  // x/y = position on screen (map units), d = depth (bigger = nearer the viewer)
  return ([x, y], z = 0) => {
    const rx = (x - CX) * c - (y - CY) * s
    const ry = (x - CX) * s + (y - CY) * c
    return { x: rx, y: ry * cp - z * sp, d: ry * sp + z * cp }
  }
}
const pts = (list) => list.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

/* parking bays + parked cars along each row (plan metres), from the traced site */
const LOTS = SITE.parking.map((lot, li) => {
  const bays = []
  const cars = []
  lot.rows.forEach(([a, b], ri) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    const n = [-u[1], u[0]]
    const at = (t, k) => [a[0] + u[0] * t + n[0] * k, a[1] + u[1] * t + n[1] * k]
    for (let t = 0, i = 0; t <= len; t += 2.6, i++) {
      bays.push([at(t, -5), at(t, 5)])
      if (t + 2.6 > len) break
      ;[-1, 1].forEach((side) => {
        if ((i * 7 + ri * 3 + li + (side > 0 ? 2 : 0)) % 5 < 2) return
        const c = (dx, dy) => at(t + 1.3 + dx, side * 2.6 + dy)
        cars.push({ q: [c(-0.85, -2.1), c(0.85, -2.1), c(0.85, 2.1), c(-0.85, 2.1)], tone: (i + ri + li) % 4 })
      })
    }
    bays.push([a, b])
  })
  return { ...lot, bays, cars }
})
const CAR_TONES = ['#ffffff', '#c9d2d6', '#8fa3ad', '#e7b9c8']

/** animate the camera towards `target` (instant when "reduce motion" is on) */
function useCamera(target) {
  const [cam, setCam] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    const from = { ...current.current }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduce ? 0 : 800
    const t0 = performance.now()
    let frame = 0
    const step = (now) => {
      const k = ms ? Math.min(1, (now - t0) / ms) : 1
      const e = 1 - (1 - k) ** 3
      const next = Object.fromEntries(Object.keys(target).map((key) => [key, from[key] + (target[key] - from[key]) * e]))
      current.current = next
      setCam(next)
      if (k < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target.pitch, target.bearing, target.lift]) // eslint-disable-line react-hooks/exhaustive-deps
  return cam
}

export default function MarketMap({ zones = [], counts = {}, selected = '', onSelect }) {
  const { t } = useI18n()
  const [started, setStarted] = useState(false)
  const [mode3d, setMode3d] = useState(true)
  const [bearing, setBearing] = useState(START_BEARING)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState('')
  const drag = useRef(null)

  // size of the map box (to place the HTML name pins over the SVG)
  const stage = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const target = useMemo(() => ({ pitch: mode3d ? PITCH_3D : 0, bearing, lift: mode3d ? 1 : 0 }), [mode3d, bearing])
  const cam = useCamera(target)

  const reset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setBearing(START_BEARING)
    setMode3d(true)
  }

  const onPointerDown = (e) => {
    if (!started || e.target.closest('[data-zone]')) return
    drag.current = { x: e.clientX, y: e.clientY, pan }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    setPan({ x: drag.current.pan.x + e.clientX - drag.current.x, y: drag.current.pan.y + e.clientY - drag.current.y })
  }
  const onPointerUp = () => (drag.current = null)

  const zoneName = (code) => zones.find((z) => z.code === code)?.name

  /* ---------- project everything for the current camera ---------- */
  const scene = useMemo(() => {
    const P = makeProjector(cam)
    const c = Math.cos(cam.bearing)
    const s = Math.sin(cam.bearing)

    const buildings = PLAN.buildings.map((b) => {
      const isShop = b.kind === 'shop'
      const lit = isShop && (selected === b.code || hover === b.code)
      const dim = Boolean(selected) && selected !== b.code
      const h = b.height * HEIGHT_SCALE * cam.lift + (lit ? 3 * cam.lift + 0.001 : 0)
      const base = isShop ? ZONE_COLORS[b.code] || '#138377' : PARKING
      const color = dim ? mix(base, '#e9ecec', isShop ? 0.72 : 0.4) : base

      const n = b.outline.length
      const walls = []
      if (h > 0.05) {
        for (let i = 0; i < n; i++) {
          const a = b.outline[i]
          const z = b.outline[(i + 1) % n]
          const ex = z[0] - a[0]
          const ey = z[1] - a[1]
          const len = Math.hypot(ex, ey) || 1
          // outward normal (outline is clockwise on screen), turned with the camera
          const nx = ey / len
          const ny = -ex / len
          const ry = nx * s + ny * c
          if (ry <= 0.001) continue // faces away from the viewer
          const rx = nx * c - ny * s
          const light = 0.5 + 0.5 * (rx * -0.55 + ry * 0.83) // light from the front-left
          const q = [P(a), P(z), P(z, h), P(a, h)]
          walls.push({ q, d: (q[0].d + q[1].d) / 2, fill: mix(color, '#0d2b28', 0.42 - 0.3 * light) })
        }
        walls.sort((w1, w2) => w1.d - w2.d)
      }
      const roof = b.outline.map((p) => P(p, h))
      const pin = P(b.label, h)
      const depth = roof.reduce((sum, p) => sum + p.d, 0) / roof.length
      return { ...b, isShop, lit, dim, color, walls, roof, pin, depth, h }
    })
    buildings.sort((a, b) => a.depth - b.depth)

    // view box = the whole property (ground + buildings), plus room for the pins
    const all = [...buildings.flatMap((b) => b.roof), ...SITE.ground.map((p) => P(p))]
    const xs = all.map((p) => p.x)
    const ys = all.map((p) => p.y)
    const pad = 8
    const box = {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad - 10,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2 + 10,
    }

    // parking stripes across the car-park roof (in plan coordinates, then projected)
    const stripes = []
    const park = PLAN.buildings.find((b) => b.kind === 'parking')
    if (park) {
      const xs2 = park.outline.map((p) => p[0])
      const ys2 = park.outline.map((p) => p[1])
      const hh = park.height * HEIGHT_SCALE * cam.lift
      for (let x = Math.min(...xs2) + 3; x < Math.max(...xs2); x += 3.2)
        stripes.push([P([x, Math.min(...ys2)], hh), P([x, Math.max(...ys2)], hh)])
    }

    return {
      buildings,
      box,
      stripes,
      ...(() => {
        const flat = (o) => o.map((p) => P(p))
        const lift = cam.lift
        // low roofs (walkways, pavilion, drop-off) – extruded like the buildings
        const structures = SITE.structures.map((st) => {
          const h = st.height * HEIGHT_SCALE * 0.75 * lift
          const n = st.outline.length
          const walls = []
          for (let i = 0; i < n && h > 0.05; i++) {
            const a = st.outline[i]
            const z = st.outline[(i + 1) % n]
            const q = [P(a), P(z), P(z, h), P(a, h)]
            // keep the wall only if it faces the viewer (screen winding)
            const cross = (q[1].x - q[0].x) * (q[3].y - q[0].y) - (q[1].y - q[0].y) * (q[3].x - q[0].x)
            walls.push({ q, d: (q[0].d + q[1].d) / 2, front: cross })
          }
          const roof = st.outline.map((p) => P(p, h))
          return { ...st, walls: walls.sort((w1, w2) => w1.d - w2.d), roof, depth: roof.reduce((t, p) => t + p.d, 0) / n }
        })
        structures.sort((x, y) => x.depth - y.depth)
        const trees = SITE.trees
          .map((p) => ({ g: P(p), top: P(p, 4.6 * HEIGHT_SCALE * lift) }))
          .sort((x, y) => x.top.d - y.top.d)
        return {
          neighbours: SITE.neighbours.map(flat),
          ground: flat(SITE.ground),
          green: SITE.green.map((g) => ({ kind: g.kind, poly: flat(g.outline) })),
          lots: LOTS.map((l) => ({
            id: l.id,
            poly: flat(l.outline),
            bays: l.bays.map(([a, z]) => [P(a), P(z)]),
            cars: l.cars.map((c) => ({ q: flat(c.q), tone: c.tone })),
            label: P(l.label),
          })),
          roads: SITE.roads.map((r) => ({ ...r, pts: flat(r.line) })),
          pond: flat(SITE.pond),
          islands: SITE.islands.map((i) => ({ at: P(i.at), r: i.r })),
          structures,
          trees,
          gates: SITE.gates.map((g) => {
            // arrow painted on the drive: points into the site (north) for an entrance, out (south) for an exit
            const f = g.dir === 'in' ? 1 : -1
            const [gx, gy] = g.at
            const shape = [[0, -6], [3.4, -1.2], [1.3, -1.2], [1.3, 5], [-1.3, 5], [-1.3, -1.2], [-3.4, -1.2]]
            return {
              ...g,
              arrow: shape.map(([x, y]) => P([gx + x, gy - 4.5 + y * f])),
              p: P([gx, gy + 7]),
            }
          }),
          landmarks: SITE.landmarks.map((l) => ({ ...l, p: P(l.at) })),
          roadName: (() => {
            const main = SITE.roads.find((r) => r.kind === 'main')
            if (!main) return null
            const [a, z] = [P(main.line[0]), P(main.line[main.line.length - 1])]
            let ang = (Math.atan2(z.y - a.y, z.x - a.x) * 180) / Math.PI
            if (ang > 90) ang -= 180
            if (ang < -90) ang += 180
            return { name: main.name, p: P([CX, main.line[0][1] + 0.6]), ang }
          })(),
        }
      })(),
      P,
    }
  }, [cam, selected, hover])

  const { box } = scene
  const compact = size.w > 0 && size.w < 520
  const north = (-cam.bearing * 180) / Math.PI

  return (
    <div className="relative">
      {/* corner brackets (top-right + bottom-left), static */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 z-10 size-14 rounded-tr-[22px] border-r-[6px] border-t-[6px] border-[#ffd23f] sm:size-20"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -left-4 z-10 size-14 rounded-bl-[22px] border-b-[6px] border-l-[6px] border-[#ffd23f] sm:size-20"
      />

      <div className="relative overflow-hidden rounded-[24px] border border-[#e6eaea] bg-[#f1f3f3]">
        {/* map canvas */}
        <div
          className={`relative aspect-[1000/540] min-h-[420px] w-full touch-none select-none ${started ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={stage}
            className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <svg
              viewBox={`${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`}
              preserveAspectRatio="xMidYMid meet"
              overflow="visible"
              className="h-full w-full overflow-visible"
              role="img"
              aria-label={t('แผนผังตลาดบอนมาร์เช่')}
            >
              {/* ground (far past the edges so zoom / drag never shows a border) */}
              <rect x={box.x - 2000} y={box.y - 2000} width={box.w + 4000} height={box.h + 4000} fill="#eceeea" />

              {/* neighbours (muted) + the market's own ground inside the property line */}
              {scene.neighbours.map((q, i) => (
                <polygon key={`n${i}`} points={pts(q)} fill="#e2e6e2" stroke="#d6dbd7" strokeWidth="0.5" strokeLinejoin="round" />
              ))}
              <polygon points={pts(scene.ground)} fill="#fbfbf8" strokeLinejoin="round" />
              {scene.green.map((g, i) => (
                <polygon
                  key={`g${i}`}
                  points={pts(g.poly)}
                  fill={g.kind === 'woods' ? '#bfe0b8' : '#d9eecf'}
                  stroke={g.kind === 'woods' ? '#a6d29d' : '#c5e3b9'}
                  strokeWidth="0.6"
                  strokeLinejoin="round"
                />
              ))}

              {/* car parks: bays + parked cars */}
              {scene.lots.map((l) => (
                <g key={l.id}>
                  <polygon points={pts(l.poly)} fill="#e1e6e6" stroke="#d3dada" strokeWidth="0.6" strokeLinejoin="round" />
                  <g stroke="#ffffff" strokeWidth="0.35">
                    {l.bays.map(([a, z], i) => (
                      <line key={i} x1={a.x} y1={a.y} x2={z.x} y2={z.y} />
                    ))}
                  </g>
                  {l.cars.map((c, i) => (
                    <polygon key={i} points={pts(c.q)} fill={CAR_TONES[c.tone]} stroke="#9aa9ad" strokeWidth="0.2" strokeLinejoin="round" />
                  ))}
                </g>
              ))}

              {/* roads: kerb, asphalt, centre line */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {scene.roads.map((r) => (
                  <polyline key={`k${r.id}`} points={pts(r.pts)} stroke="#d6dcdc" strokeWidth={r.width + 1.4} />
                ))}
                {scene.roads.map((r) => (
                  <polyline key={`r${r.id}`} points={pts(r.pts)} stroke="#ffffff" strokeWidth={r.width} />
                ))}
                {scene.roads
                  .filter((r) => r.kind !== 'lane')
                  .map((r) => (
                    <polyline key={`c${r.id}`} points={pts(r.pts)} stroke={r.kind === 'main' ? '#f2c94c' : '#e3e8e8'} strokeWidth={r.kind === 'main' ? 0.5 : 0.35} strokeDasharray="3 2.5" />
                  ))}
              </g>
              {scene.roadName && (
                <text
                  x={scene.roadName.p.x}
                  y={scene.roadName.p.y}
                  transform={`rotate(${scene.roadName.ang.toFixed(1)} ${scene.roadName.p.x.toFixed(1)} ${scene.roadName.p.y.toFixed(1)})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="4.2"
                  fontWeight="600"
                  fill="#8b9a98"
                  letterSpacing="0.3"
                >
                  {t(scene.roadName.name)}
                </text>
              )}

              {/* pond */}
              <defs>
                <linearGradient id="mm-water" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#bfe9f2" />
                  <stop offset="1" stopColor="#7fcbe0" />
                </linearGradient>
              </defs>
              <polygon points={pts(scene.pond)} fill="url(#mm-water)" stroke="#9fd3cf" strokeWidth="1.4" strokeLinejoin="round" />
              {scene.islands.map((i, k) => (
                <circle key={k} cx={i.at.x} cy={i.at.y} r={i.r} fill="#bfe0b8" stroke="#a6d29d" strokeWidth="0.5" />
              ))}

              {/* property line */}
              <polygon points={pts(scene.ground)} fill="none" stroke="#1f9285" strokeOpacity="0.55" strokeWidth="0.9" strokeDasharray="4 2.5" strokeLinejoin="round" />

              {/* entrance / exit arrows on the drives */}
              {scene.gates.map((g) => (
                <polygon
                  key={`a${g.id}`}
                  points={pts(g.arrow)}
                  fill={g.dir === 'in' ? '#12a37a' : '#f0483e'}
                  stroke="#ffffff"
                  strokeWidth="0.6"
                  strokeLinejoin="round"
                />
              ))}

              {/* low roofs (walkways, pavilion, drop-off) and the older buildings */}
              {scene.structures.map((st) => (
                <g key={st.id} aria-hidden="true">
                  {st.walls
                    .filter((w) => w.front < 0)
                    .map((w, i) => (
                      <polygon key={i} points={pts(w.q)} fill={mix(st.color, '#0d2b28', 0.28)} stroke={mix(st.color, '#0d2b28', 0.28)} strokeWidth="0.2" />
                    ))}
                  <polygon points={pts(st.roof)} fill={st.color} stroke={mix(st.color, '#ffffff', 0.5)} strokeWidth="0.5" strokeLinejoin="round" />
                </g>
              ))}

              {/* trees: shadow, trunk, canopy */}
              {scene.trees.map((tr, i) => (
                <g key={`t${i}`}>
                  <ellipse cx={tr.g.x + 1} cy={tr.g.y + 0.6} rx="2.6" ry="1.5" fill="rgb(16 40 38 / 0.12)" />
                  <line x1={tr.g.x} y1={tr.g.y} x2={tr.top.x} y2={tr.top.y} stroke="#8a6f55" strokeWidth="0.6" />
                  <circle cx={tr.top.x} cy={tr.top.y} r="2.7" fill="#7cc383" stroke="#5fae69" strokeWidth="0.4" />
                  <circle cx={tr.top.x - 0.8} cy={tr.top.y - 0.8} r="1.1" fill="#a3d9a6" />
                </g>
              ))}

              {/* ground shadows */}
              {cam.lift > 0.02 &&
                scene.buildings.map((b) => (
                  <polygon
                    key={`s${b.name}`}
                    points={pts(b.outline.map((p) => scene.P([p[0] + 1.6 * cam.lift, p[1] + 1.6 * cam.lift])))}
                    fill="rgb(16 40 38 / 0.10)"
                  />
                ))}

              {/* buildings, back to front */}
              {scene.buildings.map((b) => (
                <g
                  key={b.name}
                  data-zone={b.isShop ? b.code : undefined}
                  role={b.isShop ? 'button' : undefined}
                  tabIndex={b.isShop && started ? 0 : -1}
                  aria-label={b.isShop ? zoneName(b.code) || t(b.name) : undefined}
                  aria-pressed={b.isShop ? selected === b.code : undefined}
                  onClick={() => started && b.isShop && onSelect?.(selected === b.code ? '' : b.code)}
                  onKeyDown={(e) => started && b.isShop && (e.key === 'Enter' || e.key === ' ') && onSelect?.(selected === b.code ? '' : b.code)}
                  onMouseEnter={() => b.isShop && setHover(b.code)}
                  onMouseLeave={() => setHover('')}
                  className={`outline-none ${started && b.isShop ? 'cursor-pointer' : ''}`}
                >
                  {b.walls.map((w, i) => (
                    <polygon key={i} points={pts(w.q)} fill={w.fill} stroke={w.fill} strokeWidth="0.25" strokeLinejoin="round" />
                  ))}
                  <polygon
                    points={pts(b.roof)}
                    fill={b.isShop ? mix(b.color, '#ffffff', b.lit ? 0.02 : 0.12) : b.color}
                    stroke={b.lit ? '#ffffff' : mix(b.color, '#ffffff', 0.45)}
                    strokeWidth={b.lit ? 1.1 : 0.6}
                    strokeLinejoin="round"
                  />
                  {b.kind === 'parking' && (
                    <g stroke="#ffffff" strokeWidth="0.45" opacity="0.85">
                      <clipPath id="mm-park-roof">
                        <polygon points={pts(b.roof)} />
                      </clipPath>
                      <g clipPath="url(#mm-park-roof)">
                        {scene.stripes.map(([a, z], i) => (
                          <line key={i} x1={a.x} y1={a.y} x2={z.x} y2={z.y} />
                        ))}
                      </g>
                    </g>
                  )}
                </g>
              ))}

            </svg>

            {/* name pins – HTML on top of the map (real text layout, same size at every zoom) */}
            {size.w > 0 &&
              scene.buildings.map((b) => {
                const k = Math.min(size.w / box.w, size.h / box.h)
                const left = (size.w - box.w * k) / 2 + (b.pin.x - box.x) * k
                const top = (size.h - box.h * k) / 2 + (b.pin.y - box.y) * k
                const n = b.isShop ? counts[b.code] || 0 : 0
                const color = b.isShop ? ZONE_COLORS[b.code] || '#138377' : '#2f6fd6'
                // small map (phones): badge only, the name shows on the selected / hovered building
                const showName = !compact || b.lit
                return (
                  <button
                    key={`pin${b.name}`}
                    type="button"
                    data-zone={b.isShop ? b.code : 'parking'}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => started && b.isShop && onSelect?.(selected === b.code ? '' : b.code)}
                    onMouseEnter={() => b.isShop && setHover(b.code)}
                    onMouseLeave={() => setHover('')}
                    className={`absolute flex flex-col items-center transition-opacity duration-300 ${
                      started && b.isShop ? 'cursor-pointer' : 'cursor-default'
                    } ${b.dim ? 'opacity-50' : ''}`}
                    style={{
                      left,
                      top,
                      transform: `translate(-50%, -100%) translateY(${b.lit ? -4 : 0}px) scale(${1 / zoom})`,
                      transformOrigin: '50% 100%',
                      zIndex: Math.round(b.depth + 1000),
                    }}
                  >
                    <span
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white py-[3px] pl-[3px] text-[11px] font-bold text-[#24413d] shadow-[0_4px_12px_-4px_rgb(16_40_38/0.45)] ring-1 ring-black/5 transition ${
                        n > 0 || !showName ? 'pr-[3px]' : 'pr-2.5'
                      } ${b.lit ? 'ring-2' : ''}`}
                      style={b.lit ? { '--tw-ring-color': color } : undefined}
                    >
                      <span className="grid size-[18px] place-items-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: color }}>
                        {b.isShop ? (b.code === 'MK' ? <Store className="size-[11px]" strokeWidth={2.6} /> : b.code) : 'P'}
                      </span>
                      {showName && t(b.name)}
                      {n > 0 && showName && (
                        <span
                          className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-black text-white"
                          style={{ backgroundColor: color }}
                          title={t('{n} ร้าน', { n })}
                        >
                          {n}
                        </span>
                      )}
                    </span>
                    <span className="-mt-[5px] size-2.5 rotate-45 bg-white shadow-[2px_2px_3px_-1px_rgb(16_40_38/0.25)]" />
                  </button>
                )
              })}
            {/* entrances, car parks, pond */}
            {size.w > 0 &&
              (() => {
                const k = Math.min(size.w / box.w, size.h / box.h)
                const at = (p) => ({
                  left: (size.w - box.w * k) / 2 + (p.x - box.x) * k,
                  top: (size.h - box.h * k) / 2 + (p.y - box.y) * k,
                })
                const chip = 'pointer-events-none absolute flex items-center gap-1 whitespace-nowrap rounded-full bg-white/95 py-[2px] pl-[2px] text-[10px] font-bold shadow-[0_3px_10px_-4px_rgb(16_40_38/0.45)] ring-1 ring-black/5'
                const style = (p, z = 900) => ({ ...at(p), transform: `translate(-50%, -50%) scale(${1 / zoom})`, zIndex: z })
                return (
                  <>
                    {scene.gates.map((g) => {
                      const isIn = g.dir === 'in'
                      const Icon = isIn ? LogIn : LogOut
                      return (
                        <span
                          key={g.id}
                          aria-hidden="true"
                          className={`${chip} ${isIn ? 'text-[#0f7a5c]' : 'text-[#c8322a]'} ${compact ? 'pr-[2px]' : 'pr-2'}`}
                          style={style(g.p, 950)}
                        >
                          <span className={`grid size-[16px] place-items-center rounded-full text-white ${isIn ? 'bg-[#12a37a]' : 'bg-[#f0483e]'}`}>
                            <Icon className="size-[10px]" strokeWidth={2.6} />
                          </span>
                          {!compact && t(isIn ? 'ทางเข้า' : 'ทางออก')}
                        </span>
                      )
                    })}
                    {scene.lots.map((l) => {
                      // the big open-air lots get a name, the small yards just the P
                      const named = !compact && (l.id === 'front' || l.id === 'east-yard')
                      return (
                        <span key={l.id} aria-hidden="true" className={`${chip} text-[#2f6fd6] ${named ? 'pr-2' : 'pr-[2px]'}`} style={style(l.label, 800)}>
                          <span className="grid size-[16px] place-items-center rounded-full bg-[#2f6fd6] text-[9px] font-black text-white">P</span>
                          {named && t('ลานจอดรถ')}
                        </span>
                      )
                    })}
                    {scene.landmarks.map((l) => (
                      <span key={l.id} aria-hidden="true" className={`${chip} pr-2 text-[#1a8aa6]`} style={style(l.p)}>
                        <span className="grid size-[16px] place-items-center rounded-full bg-[#29a8c8] text-white">
                          <Waves className="size-[10px]" strokeWidth={2.6} />
                        </span>
                        {t(l.name)}
                      </span>
                    ))}
                  </>
                )
              })()}
          </div>

          {/* "start" overlay – minimal: a round icon + one line of text, tap anywhere to use the map */}
          {!started && (
            <button
              type="button"
              onClick={() => setStarted(true)}
              aria-label={t('คลิกเพื่อสำรวจแผนผัง')}
              className="group absolute inset-0 grid place-items-center bg-white/35 backdrop-blur-[1.5px]"
            >
              <span className="flex flex-col items-center gap-2.5">
                <span className="relative grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-[0_10px_24px_-10px_rgb(10_71_67/0.6)] transition duration-300 group-hover:scale-105 group-hover:bg-brand-700 sm:size-14">
                  <span aria-hidden="true" className="absolute inset-0 rounded-full bg-brand-500/40 motion-safe:animate-pin-ring" />
                  <Pointer className="relative size-[22px] sm:size-6" strokeWidth={1.9} />
                </span>
                <span className="text-[13px] font-semibold tracking-wide text-brand-800 [text-shadow:0_1px_8px_rgb(255_255_255/0.95)] sm:text-[14px]">
                  {t('คลิกเพื่อสำรวจแผนผัง')}
                </span>
              </span>
            </button>
          )}
        </div>

        {/* controls */}
        {started && (
          <>
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              {[
                [Plus, t('ซูมเข้า'), () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))],
                [Minus, t('ซูมออก'), () => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))],
                [RotateCcw, t('หมุนซ้าย'), () => setBearing((b) => b + QUARTER)],
                [RotateCw, t('หมุนขวา'), () => setBearing((b) => b - QUARTER)],
                [Undo2, t('รีเซ็ตแผนที่'), reset],
              ].map(([Icon, label, fn]) => (
                <button
                  key={label}
                  type="button"
                  onClick={fn}
                  aria-label={label}
                  title={label}
                  className="grid size-9 place-items-center rounded-xl border border-[#e3e8e7] bg-white text-[#3d5552] shadow-sm transition hover:text-brand-700"
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                </button>
              ))}
            </div>

            <div className="absolute left-3 top-3 flex rounded-full border border-[#e3e8e7] bg-white p-1 text-[12px] font-semibold shadow-sm">
              {[
                [false, Square, '2D'],
                [true, Box, '3D'],
              ].map(([v, Icon, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMode3d(v)}
                  aria-pressed={mode3d === v}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    mode3d === v ? 'bg-[#ec1c8c] text-white' : 'text-[#4d5f5c] hover:text-[#ec1c8c]'
                  }`}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* compass – turns with the map; tap = north up again */}
        <button
          type="button"
          onClick={() => setBearing(0)}
          aria-label="N"
          title="N"
          className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full border border-[#e3e8e7] bg-white shadow-sm"
        >
          <svg viewBox="-12 -12 24 24" className="size-8" style={{ transform: `rotate(${north}deg)` }} aria-hidden="true">
            <path d="M0 -9 L4 2 L0 0 L-4 2 Z" fill="#f0483e" />
            <path d="M0 9 L4 -2 L0 0 L-4 -2 Z" fill="#c5cdcc" />
          </svg>
        </button>

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-medium text-[#7a8785] shadow-sm">
          {t('แผนผังตลาดบอนมาร์เช่')} · {t('กดที่อาคารเพื่อดูร้าน')}
        </span>
      </div>
    </div>
  )
}

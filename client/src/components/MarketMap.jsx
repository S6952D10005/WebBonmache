import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Box, LogIn, LogOut, Minus, Plus, Pointer, RotateCcw, RotateCw, Square, Store, Undo2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { PLAN } from '../data/marketPlan'
import { SITE } from '../data/marketSite'
import { lotBays, neighbourhoodBlocks, parkingStripes, roofUnits } from './marketMapGeometry'

/*
 * ===========================================================================
 *  Market map – 3D plan drawn from the CAD drawing (Fashion-Island-style look)
 * ===========================================================================
 *  Buildings (outline + height) come from src/data/marketPlan.js, generated from
 *  asset/cad/market.dwg (npm run cad-map). The outside area – roads, car parks,
 *  pond, neighbours, entrances – comes from src/data/marketSite.js, traced from
 *  the aerial photo (npm run site-map). Each shop building is a zone: tap it and
 *  the shop list below shows only its shops.
 *
 *  The 3D look is drawn by hand in SVG (no 3D library): every corner is turned /
 *  tilted with the camera, walls are drawn back-to-front, then the roofs with
 *  their shop units, and the name pins (HTML) on top.
 *   - light grey city map around the market, white roads, dark grey car parks
 *   - shop roofs show rows of units (decorative floor plan, marketMapGeometry.js)
 *   - 2D (straight down) / 3D (tilted), rotate, zoom, drag, reset – animated
 * ===========================================================================
 */

/* zone colours (also used for the zone chip above the shop list) */
export const ZONE_COLORS = {
  MK: '#1f9285',
  A: '#f7931e',
  BC: '#00a3e0',
  D: '#e2a300',
  E: '#ec1c8c',
  F: '#7f63c9',
  G: '#8cc63f',
  H: '#f0483e',
  M: '#3d6bd9',
  N: '#a47551',
}

/* map palette – quiet greys so the coloured buildings stand out */
const C = {
  ground: '#edf0ef',
  neighbour: '#e5e9e8',
  block: '#dadfde',
  blockEdge: '#d0d6d5',
  site: '#fafbfa',
  woods: '#d6e6d3',
  lawn: '#e3eedf',
  lot: '#a4adaf',
  kerb: '#d5dbdb',
  water: '#cfe6ee',
  waterEdge: '#b4d6e1',
  parking: '#97a1a3',
  other: '#dde2e2',
  wallShade: '#0d2b28',
}

const HEIGHT_SCALE = 1.25 // buildings a little taller than real so the 3D reads well
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
const [CX, CY] = PLAN.center
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
const area = (o) => o.reduce((a, [x1, y1], i) => a + x1 * o[(i + 1) % o.length][1] - o[(i + 1) % o.length][0] * y1, 0) / 2
const clockwise = (o) => (area(o) < 0 ? [...o].reverse() : o)

/* ---------- everything that does not depend on the camera (plan metres) ---------- */
// CAD buildings + the low roofs traced from the photo, as one list of solids
const SOLIDS = [
  ...PLAN.buildings.map((b, i) => ({
    ...b,
    id: `b${i}`,
    units: b.kind === 'shop' ? roofUnits(b.outline, i + 1) : [],
    stripes: b.kind === 'parking' ? parkingStripes(b.outline) : [],
  })),
  ...SITE.structures.map((s) => ({ ...s, id: s.id, kind: 'roof', outline: clockwise(s.outline), units: [], stripes: [] })),
]
const BLOCKS = neighbourhoodBlocks(SITE)
const LOTS = SITE.parking.map((l) => ({ ...l, ...lotBays(l), big: l.id === 'front' || l.id === 'east-yard' }))

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

// screen angle of a plan direction (for text lying along a road / car-park row), kept readable
function textAngle(P, a, b) {
  const p = P(a)
  const q = P(b)
  let ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
  if (ang > 90) ang -= 180
  if (ang < -90) ang += 180
  return ang
}

export default function MarketMap({ zones = [], counts = {}, selected = '', onSelect }) {
  const { t } = useI18n()
  const uid = useId().replace(/:/g, '')
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
  const pick = (code) => started && onSelect?.(selected === code ? '' : code)

  /* ---------- project everything for the current camera ---------- */
  const scene = useMemo(() => {
    const P = makeProjector(cam)
    const c = Math.cos(cam.bearing)
    const s = Math.sin(cam.bearing)
    const flat = (o) => o.map((p) => P(p))

    const solids = SOLIDS.map((b) => {
      const isShop = b.kind === 'shop'
      const lit = isShop && (selected === b.code || hover === b.code)
      const dim = Boolean(selected) && selected !== b.code
      const tall = b.kind === 'roof' ? 0.75 : 1 // traced low roofs (walkways, drop-off) stay low
      const h = b.height * HEIGHT_SCALE * tall * cam.lift + (lit ? 3 * cam.lift + 0.001 : 0)
      const base = isShop ? ZONE_COLORS[b.code] || '#138377' : b.kind === 'parking' ? C.parking : b.color || C.other
      const color = dim ? mix(base, '#e9ecec', isShop ? 0.72 : 0.35) : base

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
          walls.push({ q, d: (q[0].d + q[1].d) / 2, fill: mix(color, C.wallShade, 0.4 - 0.28 * light) })
        }
        walls.sort((w1, w2) => w1.d - w2.d)
      }
      const roof = b.outline.map((p) => P(p, h))
      return {
        ...b,
        isShop,
        lit,
        dim,
        color,
        walls,
        roof,
        // shop roofs: light floor with coloured units on it (the floor-plan look)
        roofFill: isShop ? mix(color, '#ffffff', 0.72) : b.kind === 'parking' ? color : mix(color, '#ffffff', 0.25),
        units: b.units.map((u) => ({ q: u.q.map((p) => P(p, h)), fill: mix(color, '#ffffff', 0.04 + u.tone * 0.3) })),
        stripes: b.stripes.map(([a, z]) => [P(a, h), P(z, h)]),
        shadow: h > 0.05 ? b.outline.map((p) => P([p[0] + 0.25 * h, p[1] + 0.25 * h])) : null,
        pin: P(b.label || b.outline[0], h),
        depth: roof.reduce((sum, p) => sum + p.d, 0) / roof.length,
      }
    })
    solids.sort((a, b) => a.depth - b.depth)

    // view box = the whole property (ground + buildings), plus room for the pins
    const all = [...solids.flatMap((b) => b.roof), ...SITE.ground.map((p) => P(p))]
    const xs = all.map((p) => p.x)
    const ys = all.map((p) => p.y)
    const pad = 8
    const box = {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad - 12,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2 + 12,
    }

    const main = SITE.roads.find((r) => r.kind === 'main')
    return {
      P,
      box,
      solids,
      neighbours: SITE.neighbours.map(flat),
      blocks: BLOCKS.map(flat),
      ground: flat(SITE.ground),
      green: SITE.green.map((g) => ({ kind: g.kind, poly: flat(g.outline) })),
      lots: LOTS.map((l) => ({
        id: l.id,
        big: l.big,
        poly: flat(l.outline),
        bays: l.lines.map(([a, z]) => [P(a), P(z)]),
        label: P(l.label),
        angle: textAngle(P, l.dir[0], l.dir[1]),
      })),
      roads: SITE.roads.map((r) => ({ ...r, pts: flat(r.line) })),
      roadName: main && {
        name: main.name,
        p: P([CX - 30, main.line[0][1] + 0.4]),
        angle: textAngle(P, main.line[0], main.line[main.line.length - 1]),
      },
      pond: flat(SITE.pond),
      islands: SITE.islands.map((i) => ({ at: P(i.at), r: i.r })),
      landmarks: SITE.landmarks.map((l) => ({ ...l, p: P(l.at) })),
      gates: SITE.gates.map((g) => {
        // arrow painted on the drive: points into the site (north) for an entrance, out (south) for an exit
        const f = g.dir === 'in' ? 1 : -1
        const [gx, gy] = g.at
        const shape = [[0, -6], [3.4, -1.2], [1.3, -1.2], [1.3, 5], [-1.3, 5], [-1.3, -1.2], [-3.4, -1.2]]
        return { ...g, arrow: shape.map(([x, y]) => P([gx + x, gy - 4.5 + y * f])), p: P([gx, gy + 7]) }
      }),
    }
  }, [cam, selected, hover])

  const { box } = scene
  const compact = size.w > 0 && size.w < 520
  const north = (-cam.bearing * 180) / Math.PI
  // map units → pixels inside the stage (for the HTML pins)
  const k = size.w ? Math.min(size.w / box.w, size.h / box.h) : 0
  const toPx = (p) => ({ left: (size.w - box.w * k) / 2 + (p.x - box.x) * k, top: (size.h - box.h * k) / 2 + (p.y - box.y) * k })

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

      {/* overflow-clip (not hidden): the zoomed map can never scroll the box sideways when something inside gets focus */}
      <div className="relative overflow-clip rounded-[24px] border border-[#e6eaea]" style={{ backgroundColor: C.ground }}>
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
              <rect x={box.x - 2000} y={box.y - 2000} width={box.w + 4000} height={box.h + 4000} fill={C.ground} />

              {/* neighbourhood: plots + small house blocks */}
              {scene.neighbours.map((q, i) => (
                <polygon key={`n${i}`} points={pts(q)} fill={C.neighbour} />
              ))}
              <g fill={C.block} stroke={C.blockEdge} strokeWidth="0.3" strokeLinejoin="round">
                {scene.blocks.map((q, i) => (
                  <polygon key={i} points={pts(q)} />
                ))}
              </g>

              {/* the market's own ground + green areas */}
              <polygon points={pts(scene.ground)} fill={C.site} strokeLinejoin="round" />
              {scene.green.map((g, i) => (
                <polygon key={`g${i}`} points={pts(g.poly)} fill={g.kind === 'woods' ? C.woods : C.lawn} strokeLinejoin="round" />
              ))}

              {/* open-air car parks: dark grey with white bays */}
              {scene.lots.map((l) => (
                <g key={l.id}>
                  <polygon points={pts(l.poly)} fill={C.lot} stroke={C.lot} strokeWidth="1.6" strokeLinejoin="round" />
                  <g stroke="#ffffff" strokeWidth="0.32" opacity="0.9">
                    {l.bays.map(([a, z], i) => (
                      <line key={i} x1={a.x} y1={a.y} x2={z.x} y2={z.y} />
                    ))}
                  </g>
                </g>
              ))}

              {/* roads: kerb + white surface (+ dashed middle on the main road) */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {scene.roads.map((r) => (
                  <polyline key={`k${r.id}`} points={pts(r.pts)} stroke={C.kerb} strokeWidth={r.width + 1.2} />
                ))}
                {scene.roads.map((r) => (
                  <polyline key={`r${r.id}`} points={pts(r.pts)} stroke="#ffffff" strokeWidth={r.width} />
                ))}
                {scene.roads
                  .filter((r) => r.kind === 'main')
                  .map((r) => (
                    <polyline key={`c${r.id}`} points={pts(r.pts)} stroke="#e7d9a8" strokeWidth="0.45" strokeDasharray="4 3" />
                  ))}
              </g>

              {/* pond */}
              <polygon points={pts(scene.pond)} fill={C.water} stroke={C.waterEdge} strokeWidth="1.2" strokeLinejoin="round" />
              {scene.islands.map((i, n) => (
                <circle key={n} cx={i.at.x} cy={i.at.y} r={i.r} fill={C.woods} />
              ))}

              {/* property line */}
              <polygon points={pts(scene.ground)} fill="none" stroke="#1f9285" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="4 2.5" strokeLinejoin="round" />

              {/* entrance / exit arrows on the drives */}
              {scene.gates.map((g) => (
                <polygon key={`a${g.id}`} points={pts(g.arrow)} fill={g.dir === 'in' ? '#12a37a' : '#f0483e'} stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
              ))}

              {/* map text: road name, car parks, pond */}
              <g fontFamily="inherit" textAnchor="middle" dominantBaseline="middle">
                {scene.roadName && (
                  <text
                    x={scene.roadName.p.x}
                    y={scene.roadName.p.y}
                    transform={`rotate(${scene.roadName.angle.toFixed(1)} ${scene.roadName.p.x.toFixed(1)} ${scene.roadName.p.y.toFixed(1)})`}
                    fontSize="4"
                    fontStyle="italic"
                    fontWeight="600"
                    fill="#9aa6a4"
                    letterSpacing="0.3"
                  >
                    {t(scene.roadName.name)}
                  </text>
                )}
                {scene.lots.map((l) => (
                  <text
                    key={`t${l.id}`}
                    x={l.label.x}
                    y={l.label.y}
                    transform={`rotate(${l.angle.toFixed(1)} ${l.label.x.toFixed(1)} ${l.label.y.toFixed(1)})`}
                    fontSize={l.big ? 3.8 : 3.4}
                    fontWeight="800"
                    fill="#ffffff"
                    letterSpacing="0.2"
                  >
                    {l.big ? `P  ${t('ลานจอดรถ')}` : 'P'}
                  </text>
                ))}
                {scene.landmarks.map((l) => (
                  <text key={l.id} x={l.p.x} y={l.p.y} fontSize="4" fontStyle="italic" fontWeight="700" fill="#5d9db2" letterSpacing="0.4">
                    {t(l.name)}
                  </text>
                ))}
              </g>

              {/* soft ground shadows */}
              {cam.lift > 0.02 && (
                <g fill="rgb(16 40 38 / 0.09)">
                  {scene.solids.map((b) => b.shadow && <polygon key={`s${b.id}`} points={pts(b.shadow)} />)}
                </g>
              )}

              {/* buildings + low roofs, back to front */}
              {scene.solids.map((b) => (
                <g
                  key={b.id}
                  data-zone={b.isShop ? b.code : undefined}
                  role={b.isShop ? 'button' : undefined}
                  tabIndex={b.isShop && started ? 0 : -1}
                  aria-label={b.isShop ? zoneName(b.code) || t(b.name) : undefined}
                  aria-hidden={b.isShop ? undefined : true}
                  aria-pressed={b.isShop ? selected === b.code : undefined}
                  onClick={() => b.isShop && pick(b.code)}
                  onKeyDown={(e) => b.isShop && (e.key === 'Enter' || e.key === ' ') && pick(b.code)}
                  onMouseEnter={() => b.isShop && setHover(b.code)}
                  onMouseLeave={() => setHover('')}
                  className={`outline-none ${started && b.isShop ? 'cursor-pointer' : ''}`}
                >
                  {b.walls.map((w, i) => (
                    <polygon key={i} points={pts(w.q)} fill={w.fill} stroke={w.fill} strokeWidth="0.25" strokeLinejoin="round" />
                  ))}
                  <polygon
                    points={pts(b.roof)}
                    fill={b.roofFill}
                    stroke={b.lit ? '#ffffff' : mix(b.color, '#ffffff', 0.35)}
                    strokeWidth={b.lit ? 1.1 : 0.5}
                    strokeLinejoin="round"
                  />
                  {(b.units.length > 0 || b.stripes.length > 0) && (
                    <>
                      <clipPath id={`${uid}-${b.id}`}>
                        <polygon points={pts(b.roof)} />
                      </clipPath>
                      <g clipPath={`url(#${uid}-${b.id})`}>
                        {b.units.map((u, i) => (
                          <polygon key={i} points={pts(u.q)} fill={u.fill} />
                        ))}
                        {b.stripes.length > 0 && (
                          <g stroke="#ffffff" strokeWidth="0.32" opacity="0.85">
                            {b.stripes.map(([a, z], i) => (
                              <line key={i} x1={a.x} y1={a.y} x2={z.x} y2={z.y} />
                            ))}
                          </g>
                        )}
                      </g>
                    </>
                  )}
                </g>
              ))}
            </svg>

            {/* building pins – HTML on top of the map (real text, same size at every zoom) */}
            {k > 0 &&
              scene.solids
                .filter((b) => b.isShop || b.kind === 'parking')
                .map((b) => {
                  const n = b.isShop ? counts[b.code] || 0 : 0
                  const color = b.isShop ? ZONE_COLORS[b.code] || '#138377' : '#5b6669'
                  // small map (phones): tile only, the name shows on the selected / hovered building
                  const showName = !compact || b.lit
                  return (
                    <span
                      key={`pin${b.id}`}
                      className="absolute size-0"
                      style={{ ...toPx(b.pin), transform: `scale(${1 / zoom})`, transformOrigin: '0 0', zIndex: Math.round(b.depth + 1000) }}
                    >
                      <button
                        type="button"
                        data-zone={b.isShop ? b.code : 'parking'}
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => b.isShop && pick(b.code)}
                        onMouseEnter={() => b.isShop && setHover(b.code)}
                        onMouseLeave={() => setHover('')}
                        className={`absolute bottom-[5px] flex items-center gap-1.5 transition duration-300 ${compact ? 'left-[-12px]' : 'left-[-15px]'} ${
                          started && b.isShop ? 'cursor-pointer' : 'cursor-default'
                        } ${b.dim ? 'opacity-45' : ''} ${b.lit ? '-translate-y-1' : ''}`}
                      >
                        <span
                          className={`relative shrink-0 bg-white shadow-[0_6px_14px_-6px_rgb(16_40_38/0.55)] ring-1 ring-black/5 transition ${
                            compact ? 'size-[24px] rounded-[7px] p-[2px]' : 'size-[30px] rounded-[9px] p-[3px]'
                          } ${b.lit ? 'ring-2' : ''}`}
                          style={b.lit ? { '--tw-ring-color': color } : undefined}
                        >
                          {/* pointer under the tile */}
                          <span className="absolute left-1/2 top-full -mt-[6px] size-2.5 -translate-x-1/2 rotate-45 bg-white" />
                          <span
                            className={`relative grid size-full place-items-center font-black text-white ${compact ? 'rounded-[5px] text-[8.5px]' : 'rounded-[6px] text-[10.5px]'}`}
                            style={{ backgroundColor: color }}
                          >
                            {b.code === 'MK' ? <Store className={compact ? 'size-[11px]' : 'size-[13px]'} strokeWidth={2.6} /> : b.isShop ? b.code : 'P'}
                          </span>
                          {n > 0 && (
                            <span
                              className="absolute -right-2 -top-2 grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[9.5px] font-black text-white ring-2 ring-white"
                              style={{ backgroundColor: color }}
                              title={t('{n} ร้าน', { n })}
                            >
                              {n}
                            </span>
                          )}
                        </span>
                        {showName && (
                          <span
                            className="whitespace-nowrap text-[11.5px] font-extrabold leading-none text-[#24413d] [text-shadow:0_0_2px_#fff,0_0_3px_#fff,0_0_4px_#fff,0_0_6px_#fff]"
                            style={b.lit ? { color } : undefined}
                          >
                            {t(b.name)}
                          </span>
                        )}
                      </button>
                    </span>
                  )
                })}

            {/* entrances / exits */}
            {k > 0 &&
              scene.gates.map((g) => {
                const isIn = g.dir === 'in'
                const Icon = isIn ? LogIn : LogOut
                return (
                  <span
                    key={g.id}
                    aria-hidden="true"
                    className={`pointer-events-none absolute flex items-center gap-1 whitespace-nowrap rounded-full bg-white/95 py-[2px] pl-[2px] text-[10px] font-bold shadow-[0_3px_10px_-4px_rgb(16_40_38/0.45)] ring-1 ring-black/5 ${
                      isIn ? 'text-[#0f7a5c]' : 'text-[#c8322a]'
                    } ${compact ? 'pr-[2px]' : 'pr-2'}`}
                    style={{ ...toPx(g.p), transform: `translate(-50%, -50%) scale(${1 / zoom})`, zIndex: 950 }}
                  >
                    <span className={`grid size-[16px] place-items-center rounded-full text-white ${isIn ? 'bg-[#12a37a]' : 'bg-[#f0483e]'}`}>
                      <Icon className="size-[10px]" strokeWidth={2.6} />
                    </span>
                    {!compact && t(isIn ? 'ทางเข้า' : 'ทางออก')}
                  </span>
                )
              })}
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

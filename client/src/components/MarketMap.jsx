import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Hand, Minus, Plus, RotateCcw, RotateCw, Square, Store, Undo2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { PLAN } from '../data/marketPlan'

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

/* the ground around the buildings (site pad + ring road), from the plan's bounds */
const B = (() => {
  const all = PLAN.buildings.flatMap((b) => b.outline)
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
})()
const rect = (m) => [
  [B.x0 - m, B.y0 - m],
  [B.x1 + m, B.y0 - m],
  [B.x1 + m, B.y1 + m],
  [B.x0 - m, B.y1 + m],
]
// trees along the edge of the site
const TREES = (() => {
  const list = []
  const m = 9
  for (let x = B.x0 - m; x <= B.x1 + m; x += 13) list.push([x, B.y0 - m], [x, B.y1 + m])
  for (let y = B.y0 - m + 13; y < B.y1 + m; y += 13) list.push([B.x0 - m, y], [B.x1 + m, y])
  return list
})()

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

    // view box = everything that is drawn, plus room for the pins
    const all = buildings.flatMap((b) => [...b.roof, ...b.outline.map((p) => P(p))])
    const xs = all.map((p) => p.x)
    const ys = all.map((p) => p.y)
    const pad = 16
    const box = {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad - 14,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2 + 14,
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
      pad: rect(10).map((p) => P(p)),
      road: rect(20).map((p) => P(p)),
      outerRoads: [
        [[B.x0 - 20, B.y0 - 400], [B.x0 - 20, B.y1 + 400]],
        [[B.x1 + 20, B.y0 - 400], [B.x1 + 20, B.y1 + 400]],
        [[B.x0 - 400, B.y1 + 20], [B.x1 + 400, B.y1 + 20]],
        [[B.x0 - 400, B.y0 - 20], [B.x1 + 400, B.y0 - 20]],
        [[B.x0 - 400, B.y0 - 150], [B.x1 + 400, B.y0 - 110]],
        [[B.x1 + 140, B.y0 - 400], [B.x1 + 120, B.y1 + 400]],
      ].map(([a, b]) => [P(a), P(b)]),
      trees: TREES.map((p) => P(p)),
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
          className={`relative aspect-[1000/420] min-h-[340px] w-full touch-none select-none ${started ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
              <rect x={box.x - 2000} y={box.y - 2000} width={box.w + 4000} height={box.h + 4000} fill="#f1f3f3" />

              {/* streets around the site */}
              <g strokeLinecap="round" fill="none">
                {scene.outerRoads.map(([a, b], i) => (
                  <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e3e7e7" strokeWidth="9" />
                ))}
                {scene.outerRoads.map(([a, b], i) => (
                  <line key={`w${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth="7" />
                ))}
                <polygon points={pts(scene.road)} stroke="#e3e7e7" strokeWidth="11" strokeLinejoin="round" />
                <polygon points={pts(scene.road)} stroke="#ffffff" strokeWidth="9" strokeLinejoin="round" />
                <polygon points={pts(scene.road)} stroke="#dfe3e3" strokeWidth="0.5" strokeDasharray="3 3" />
              </g>

              {/* site pad + trees */}
              <polygon points={pts(scene.pad)} fill="#e7ebeb" stroke="#dde2e2" strokeWidth="0.6" strokeLinejoin="round" />
              <g fill="#cfe7d4" stroke="#b7dcbf" strokeWidth="0.4">
                {scene.trees.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="2.6" />
                ))}
              </g>

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
          </div>

          {/* "tap to navigate" overlay */}
          {!started && (
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="group absolute inset-0 grid place-items-center bg-white/25 backdrop-blur-[1px]"
            >
              <span className="flex items-center gap-3 rounded-full border border-[#f7c6de] bg-white/95 py-3 pl-5 pr-7 text-left shadow-[0_12px_32px_-12px_rgb(236_28_140/0.45)] transition duration-300 group-hover:scale-105">
                <Hand className="size-7 text-[#ec1c8c]" strokeWidth={1.8} />
                <span className="leading-tight">
                  <span className="block text-[14px] font-medium text-ink">{t('กดเพื่อเริ่มใช้งาน')}</span>
                  <span className="block text-[15px] tracking-wide text-[#4d5f5c]">TAP TO NAVIGATE</span>
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

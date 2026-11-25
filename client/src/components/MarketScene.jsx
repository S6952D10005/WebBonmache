import { memo } from 'react'
import { FLOOR_ZONES, LANDMARKS } from '../data/marketFloorPlan'
import { SOLIDS, SITE_OUTLINE, ROADS, MAIN_ROAD, SIDEWALKS, CROSSINGS, ARROWS, PARKING, PLANTERS, POND, GARDENS, PLAZAS, TREES, CARS, MONUMENT } from '../data/marketScene'

/** Orthographic "architectural model" of the CAD plan.
 * bearing 0 keeps the plan's own orientation (north down, ถนนเทศบาลสงเคราะห์ at the bottom).
 * Ground layers are drawn in plan units through one affine matrix; walls and roofs are
 * projected per solid and painted back to front.
 */
export const DEFAULT_BEARING = 0
const CX = 755, CY = 960, TILT = 0.66, LIFT = 1.3

export function camera(bearing = DEFAULT_BEARING, flat = false) {
  const a = bearing * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), k = flat ? 1 : TILT, h = flat ? 0 : LIFT
  const P = ([x, y], z = 0) => { const dx = x - CX, dy = y - CY; return [dx * c - dy * s, (dx * s + dy * c) * k - z * h] }
  const depth = ([x, y]) => (x - CX) * s + (y - CY) * c
  const matrix = (z = 0) => `matrix(${c} ${k * s} ${-s} ${k * c} ${-CX * c + CY * s} ${k * (-CX * s - CY * c) - z * h})`
  return { P, depth, matrix, c, s, k, h, flat }
}

export function sceneBounds(bearing = DEFAULT_BEARING, flat = false) {
  const { P } = camera(bearing, flat)
  const pts = [...SITE_OUTLINE, [-20, 1925], [1530, 1925]].map(p => P(p))
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const x = Math.min(...xs) - 40, y = Math.min(...ys) - 110
  return { x, y, w: Math.max(...xs) - x + 40, h: Math.max(...ys) - y + 40 }
}

/* ---------- colour helpers ---------- */
const hex = h => h.slice(1).match(/../g).map(v => parseInt(v, 16))
const toHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)) }
const shade = (a, f) => toHex(hex(a).map(v => v * f))
const pts = list => list.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const area = poly => poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1] }, 0) / 2

const ZONES = Object.fromEntries(FLOOR_ZONES.map(z => [z.code, z]))
/** Height of the tallest solid in each zone, so labels stand on the roof. */
const ZONE_TOP = SOLIDS.reduce((m, b) => (b.zone ? { ...m, [b.zone]: Math.max(m[b.zone] || 0, b.height) } : m), {})
const ROOF = { plain: '#fdfcf8', tops: '#e9e5dc', shop: '#f6efe2', carport: '#dfe3e6', canopy: '#faf7f0', sala: '#c98b5c', kfc: '#fbfaf7', deck: '#d9c39e' }

/* ---------- text measuring for label pills ---------- */
let ctx, family
const widths = new Map()
function textWidth(str, size, weight = 600) {
  if (typeof document === 'undefined') return str.length * size * 0.6
  const key = `${weight}|${size}|${str}`
  if (!widths.has(key)) {
    ctx ||= document.createElement('canvas').getContext('2d')
    family ||= getComputedStyle(document.body).fontFamily
    ctx.font = `${weight} ${size}px ${family}`
    widths.set(key, ctx.measureText(str).width)
  }
  return widths.get(key)
}

/* ---------- one extruded solid ---------- */
function Solid({ b, cam, selected, onPick }) {
  const zone = b.zone && ZONES[b.zone], on = zone && selected === b.zone, off = zone && selected && !on
  const lift = cam.flat ? 0 : on ? 5 : 0
  const h = cam.flat ? 0 : b.height + lift
  const pick = zone ? e => { e.stopPropagation(); onPick(b.zone) } : undefined

  if (b.kind === 'umbrella') {
    const [x, y] = cam.P(b.at, h), r = b.r
    const color = off ? '#e4ded3' : zone.color
    return <g onClick={pick} className="bm-scene-solid">
      <ellipse cx={x} cy={y} rx={r} ry={r * cam.k} fill={mix(color, '#ffffff', on ? 0.05 : 0.35)} stroke={shade(color, 0.85)} strokeWidth=".8" />
      <ellipse cx={x} cy={y} rx={r * 0.45} ry={r * 0.45 * cam.k} fill="#fffaf2" opacity=".9" />
    </g>
  }

  let roof = zone ? (on ? mix(zone.color, '#ffffff', 0.06) : off ? '#efebe3' : mix(zone.color, '#ffffff', b.kind === 'stall' ? 0.42 : 0.6)) : ROOF[b.kind] || ROOF.plain
  if (b.kind === 'car') roof = b.color
  const wallBase = zone ? (on ? mix(zone.color, '#f3eee4', 0.35) : off ? '#ebe6dc' : mix(zone.color, '#f3eee4', 0.8)) : b.kind === 'car' ? shade(b.color, 0.9) : b.kind === 'sala' ? '#efe4d4' : '#ece6da'
  const sign = area(b.points) > 0 ? 1 : -1
  const walls = []
  if (h > 0) b.points.forEach((p, i) => {
    const q = b.points[(i + 1) % b.points.length], ex = q[0] - p[0], ey = q[1] - p[1], len = Math.hypot(ex, ey) || 1
    const nx = sign * ey / len, ny = -sign * ex / len
    const vy = nx * cam.s + ny * cam.c, vx = nx * cam.c - ny * cam.s
    if (vy <= 0.02) return
    const f = 0.9 - 0.12 * vx - 0.1 * (1 - vy)
    walls.push(<polygon key={i} points={pts([cam.P(p), cam.P(q), cam.P(q, h), cam.P(p, h)])} fill={shade(wallBase, f)} stroke={shade(wallBase, f * 0.96)} strokeWidth=".5" />)
  })
  const line = shade(roof, b.kind === 'tops' ? 0.84 : b.kind === 'stall' ? 0.86 : 0.8)
  return <g onClick={pick} className={zone ? 'bm-scene-solid' : undefined}>
    {walls}
    <g transform={cam.matrix(h)}>
      <polygon points={pts(b.points)} fill={roof} stroke={b.kind === 'kfc' ? '#d6403a' : shade(roof, zone ? 0.8 : 0.76)} strokeWidth={b.kind === 'kfc' ? 4 : 1.2} strokeLinejoin="round" />
      {b.kind === 'kfc' && <polygon points={pts(b.points)} fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="6 6" />}
      {b.kind === 'car' && <polygon points={pts(b.glass)} fill="#2c3642" opacity=".55" />}
      {b.lines?.length > 0 && <path d={b.lines.map(([a, c]) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join('')} stroke={line} strokeWidth={b.kind === 'stall' ? 0.8 : 1.2} fill="none" />}
    </g>
  </g>
}

function Tree({ at, cam, i }) {
  const z = cam.flat ? 0 : 14, [gx, gy] = cam.P(at), [x, y] = cam.P(at, z), r = 11 + (i % 3) * 2.5
  return <g pointerEvents="none">
    {!cam.flat && <ellipse cx={gx + 6} cy={gy + 2} rx={r} ry={r * cam.k * 0.8} fill="#4d5a3c" opacity=".16" />}
    {!cam.flat && <line x1={gx} y1={gy} x2={x} y2={y} stroke="#8a6f52" strokeWidth="2.4" />}
    <circle cx={x} cy={y} r={r} fill={i % 2 ? '#79a86f' : '#6c9f66'} stroke="#5a8a55" strokeWidth=".8" />
    <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.55} fill="#98c487" opacity=".75" />
  </g>
}

/** Ground, buildings and trees. Memoised: panning and zooming only change the viewBox. */
export const MarketModel = memo(function MarketModel({ bearing, flat, selected, onPick, plan, uid }) {
  const cam = camera(bearing, flat)
  const ground = cam.matrix(0)
  const stalls = row => {
    const len = Math.hypot(row.b[0] - row.a[0], row.b[1] - row.a[1]), u = [(row.b[0] - row.a[0]) / len, (row.b[1] - row.a[1]) / len], n = [-u[1], u[0]]
    const slant = row.slant || 0
    let d = `M${row.a[0]} ${row.a[1]}L${row.b[0]} ${row.b[1]}`
    for (let t = 0; t <= len + 0.1; t += row.gap) {
      const p = [row.a[0] + u[0] * t, row.a[1] + u[1] * t], q = [p[0] + n[0] * row.depth + u[0] * slant, p[1] + n[1] * row.depth + u[1] * slant]
      d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`
    }
    return d
  }
  const arrow = ([x, y, deg], i) => <path key={i} d="M-11 -1.6H3V-5L11 0L3 5V1.6H-11Z" transform={`translate(${x} ${y}) rotate(${deg})`} fill="#fbf8ef" opacity=".85" />

  // Painter's order: things nearer the viewer (larger depth) are drawn last.
  const items = [
    ...SOLIDS.map(b => ({ b, d: b.kind === 'umbrella' ? cam.depth(b.at) : Math.max(...b.points.map(cam.depth)) })),
    ...CARS.map(([x, y, deg, color]) => {
      const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]]
      const box = (l, w, o = 0) => [[-l, -w], [l, -w], [l, w], [-l, w]].map(([s, t]) => [x + u[0] * (s + o) + v[0] * t, y + u[1] * (s + o) + v[1] * t])
      const b = { kind: 'car', color, height: 4, points: box(9, 4.4), glass: box(3, 3.4, 1.5) }
      return { b, d: Math.max(...b.points.map(cam.depth)) }
    }),
    ...TREES.map((at, i) => ({ tree: at, i, d: cam.depth(at) + 4 })),
  ].sort((a, b) => a.d - b.d)

  const sel = selected && ZONES[selected]
  const roadName = `${uid}-road`
  return <g>
    <defs>
      <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a9dbe6" /><stop offset=".55" stopColor="#7fc2d6" /><stop offset="1" stopColor="#5eaac4" />
      </linearGradient>
      <path id={roadName} d={`M${MAIN_ROAD.x0} ${(MAIN_ROAD.y0 + MAIN_ROAD.y1) / 2 + 6} H${MAIN_ROAD.x1}`} />
    </defs>
    <g transform={ground}>
      <rect x="-3000" y="-3000" width="7500" height="8000" fill="#e8ebe3" />
      {/* ถนนเทศบาลสงเคราะห์ */}
      {SIDEWALKS.map((s, i) => <polygon key={i} points={pts(s)} fill="#ddd7ca" />)}
      <rect x={MAIN_ROAD.x0} y={MAIN_ROAD.y0} width={MAIN_ROAD.x1 - MAIN_ROAD.x0} height={MAIN_ROAD.y1 - MAIN_ROAD.y0} fill="#5f646c" />
      <path d={`M${MAIN_ROAD.x0} ${MAIN_ROAD.y0 + 3}H${MAIN_ROAD.x1}M${MAIN_ROAD.x0} ${MAIN_ROAD.y1 - 3}H${MAIN_ROAD.x1}`} stroke="#f3efe3" strokeWidth="1.4" opacity=".8" />
      <path d={`M${MAIN_ROAD.x0} ${(MAIN_ROAD.y0 + MAIN_ROAD.y1) / 2}H${MAIN_ROAD.x1}`} stroke="#f1c75b" strokeWidth="1.8" strokeDasharray="14 10" />

      <polygon points={pts(SITE_OUTLINE)} fill="#efebe1" stroke="#d6cfbf" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points={pts(SITE_OUTLINE)} fill="none" stroke="#b9b0a0" strokeWidth="1" strokeDasharray="10 5 2 5" />
      {PLAZAS.map((p, i) => <polygon key={i} points={pts(p)} fill="#e8e0cf" />)}
      {GARDENS.map((p, i) => <polygon key={i} points={pts(p)} fill="#cfe2bd" stroke="#b6d2a2" strokeWidth="1.5" strokeLinejoin="round" />)}
      {PLANTERS.map((p, i) => <polygon key={i} points={pts(p)} fill="#c3dcae" stroke="#a9c896" strokeWidth="1.5" strokeLinejoin="round" />)}

      {PARKING.map((lot, i) => <g key={i}>
        <polygon points={pts(lot.area)} fill="#d5d5d1" stroke="#c6c5bf" strokeWidth="1" strokeLinejoin="round" />
        <path d={lot.rows.map(stalls).join('')} stroke="#fbfaf6" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>)}

      {ROADS.map((r, i) => <polyline key={`c${i}`} points={pts(r.line)} fill="none" stroke="#c9c3b6" strokeWidth={r.w + 7} strokeLinejoin="round" strokeLinecap="round" />)}
      {ROADS.map((r, i) => <polyline key={`a${i}`} points={pts(r.line)} fill="none" stroke="#6b7078" strokeWidth={r.w} strokeLinejoin="round" strokeLinecap="round" />)}
      {ROADS.filter(r => r.lanes).map((r, i) => <polyline key={`l${i}`} points={pts(r.line)} fill="none" stroke="#f3efe3" strokeWidth="1.5" strokeDasharray="11 9" strokeLinejoin="round" opacity=".9" />)}
      {CROSSINGS.map(({ at, deg, len, w }, i) => <g key={i} transform={`translate(${at[0]} ${at[1]}) rotate(${deg})`}>
        {Array.from({ length: Math.floor(len / 7) }, (_, j) => <rect key={j} x={-len / 2 + j * 7 + 1} y={-w / 2} width="3.6" height={w} fill="#f6f3ea" opacity=".92" />)}
      </g>)}
      {ARROWS.map(arrow)}

      <polygon points={pts(POND)} fill="#e6dfcf" stroke="#e6dfcf" strokeWidth="12" strokeLinejoin="round" />
      <polygon points={pts(POND)} fill={`url(#${uid}-water)`} stroke="#6aaec4" strokeWidth="1.6" strokeLinejoin="round" />
      <g fill="none" stroke="#e8f6f9" strokeWidth="1.2" opacity=".7" strokeLinecap="round">
        <path d="M430 1080q22 -8 44 0t44 0" /><path d="M520 1150q22 -8 44 0t44 0" /><path d="M440 1250q22 -8 44 0t44 0" /><path d="M560 1300q18 -7 36 0t36 0" /><path d="M600 1080q16 -6 32 0" />
      </g>

      <text fontSize="13" fill="#f7f4ea" opacity=".55" letterSpacing="5" fontWeight="600"><textPath href={`#${roadName}`} startOffset="62%">ถนนเทศบาลสงเคราะห์</textPath></text>

      {sel && <polygon points={pts(sel.points)} fill={sel.color} fillOpacity=".14" stroke={sel.color} strokeWidth="3" strokeDasharray="9 6" strokeLinejoin="round" pointerEvents="none" />}
      {FLOOR_ZONES.map(z => <polygon key={z.code} points={pts(z.points)} fill="transparent" className="bm-scene-hit" onClick={() => onPick(z.code)} />)}
    </g>

    {!flat && <g opacity=".13" fill="#4b4535" pointerEvents="none">
      {SOLIDS.filter(b => b.points && b.height > 3).map((b, i) => <polygon key={i} points={pts(b.points.map(p => { const [x, y] = cam.P(p); return [x + b.height * 0.55, y + b.height * 0.2] }))} />)}
    </g>}

    {items.map((it, i) => it.tree ? <Tree key={`t${i}`} at={it.tree} i={it.i} cam={cam} /> : <Solid key={i} b={it.b} cam={cam} selected={selected} onPick={onPick} />)}

    {/* The CAD drawing laid over the model, to compare (in 3D it lies on the ground). */}
    {plan && <image href="/images/bon-floor-plan.webp" x="0" y="0" width="1510" height="1910" transform={ground} opacity=".6" style={{ mixBlendMode: 'multiply' }} pointerEvents="none" />}

    {(() => { // the Bon Marché sign on the island by the entrance
      const [x, y] = cam.P(MONUMENT.at), H = flat ? 0 : 30 * cam.h
      return <g pointerEvents="none">
        {!flat && <><rect x={x - 26} y={y - H} width="3" height={H} fill="#7b6f60" /><rect x={x + 23} y={y - H} width="3" height={H} fill="#7b6f60" /></>}
        <rect x={x - MONUMENT.w / 2} y={y - H - MONUMENT.h} width={MONUMENT.w} height={MONUMENT.h} rx="4" fill="#127a6d" stroke="#0d5c52" />
        <text x={x} y={y - H - MONUMENT.h / 2 + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">Bon Marché</text>
      </g>
    })()}
  </g>
})

/** Signs drawn in screen pixels (`ups` = SVG units per pixel), so they stay readable at any size. */
export function MarketLabels({ bearing, flat, selected, onPick, name, landmark, ups, zoom, show, counts = {} }) {
  const cam = camera(bearing, flat)
  const compact = ups > 3.1
  const s = ups
  const zoneLabels = FLOOR_ZONES.map(z => {
    const on = selected === z.code
    const [x, y] = cam.P(z.pin, (ZONE_TOP[z.code] || 10) + (on && !flat ? 5 : 0))
    return { z, on, x, y, d: cam.depth(z.pin) }
  }).sort((a, b) => a.d - b.d)
  return <g>
    {(show || zoom >= 1.3) && LANDMARKS.filter(l => !l.minZoom || zoom >= l.minZoom).filter(l => !compact || ['brand', 'water', 'road'].includes(l.kind)).map(l => {
      const [x, y] = cam.P(l.at, flat ? 0 : l.z), text = landmark(l)
      if (l.kind === 'road' || l.kind === 'gate') {
        const size = l.kind === 'road' ? 11.5 : 10.5, w = textWidth(text, size, 700) + (l.kind === 'road' ? 18 : 14), hgt = l.kind === 'road' ? 20 : 17
        return <g key={l.id} transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none" className="bm-scene-sign">
          <rect x={-w / 2} y={-hgt / 2} width={w} height={hgt} rx={l.kind === 'road' ? 4 : 8.5} fill={l.kind === 'road' ? '#1d6a4b' : '#2d3a33'} stroke="#fff" strokeWidth="1.5" filter="url(#bm-label-shadow)" />
          <text y={size * 0.36} textAnchor="middle" fontSize={size} fontWeight="700" fill="#fff">{text}</text>
        </g>
      }
      const color = l.id === 'kfc' ? '#c8102e' : l.id === 'starbucks' ? '#00704a' : l.id === 'tops' ? '#b3262b' : l.kind === 'water' ? '#2f7590' : l.kind === 'parking' ? '#2f5d8a' : '#6b6558'
      const size = l.kind === 'brand' ? 12.5 : l.kind === 'water' ? 13 : 11
      return <g key={l.id} transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none" className="bm-scene-sign">
        {l.kind === 'parking' && <><rect x={-textWidth(text, size) / 2 - 20} y="-9" width="16" height="16" rx="3.5" fill="#2f6db5" /><text x={-textWidth(text, size) / 2 - 12} y="3.5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">P</text></>}
        <text y="4" textAnchor="middle" fontSize={size} fontWeight={l.kind === 'brand' ? 800 : 600} fontStyle={l.kind === 'water' ? 'italic' : undefined} fill={color} stroke="#fffdf8" strokeWidth="3.2" paintOrder="stroke" strokeLinejoin="round" letterSpacing={l.kind === 'brand' ? 0.3 : 0}>{text}</text>
      </g>
    })}
    {zoneLabels.map(({ z, on, x, y }) => {
      const visible = show || on
      const label = name(z), count = counts[z.code]
      const short = compact && !on
      const badge = z.short.length > 2 ? textWidth(z.short, 11, 800) + 12 : 20
      const tw = short ? 0 : textWidth(label, 12.5, 700)
      const w = short ? badge : badge + tw + 16
      const stem = short ? 9 : 14
      const select = () => onPick(z.code)
      return <g key={z.code} transform={`translate(${x} ${y}) scale(${s})`} className={`bm-scene-label ${on ? 'is-selected' : ''}`} opacity={visible ? 1 : 0} pointerEvents={visible ? undefined : 'none'}
        role="button" tabIndex={visible ? 0 : -1} aria-label={`${label}${count ? ` (${count})` : ''}`} aria-pressed={on}
        onClick={e => { e.stopPropagation(); select() }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select() } }}>
        <line x1="0" y1="0" x2="0" y2={-stem} stroke={on ? z.color : '#8b8476'} strokeWidth="1.3" />
        <circle r="2.6" fill={on ? z.color : '#8b8476'} stroke="#fff" strokeWidth="1" />
        <g transform={`translate(${-w / 2} ${-stem - 24})`}>
          <rect className="bm-scene-outline" x="-3" y="-3" width={w + 6} height="30" rx="15" fill="none" stroke={z.color} strokeWidth="2" opacity="0" />
          <rect width={w} height="24" rx="12" fill={on ? z.color : '#fffdf9'} stroke={on ? '#fff' : '#ddd5c6'} strokeWidth={on ? 2 : 1} filter={`url(#bm-label-shadow)`} />
          <rect x="2" y="2" width={badge} height="20" rx="10" fill={on ? '#ffffff' : z.color} />
          <text x={2 + badge / 2} y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill={on ? z.color : '#fff'}>{z.short}</text>
          {!short && <text x={badge + 8} y="16.5" fontSize="12.5" fontWeight="700" fill={on ? '#fff' : '#3c3a35'}>{label}</text>}
        </g>
      </g>
    })}
  </g>
}

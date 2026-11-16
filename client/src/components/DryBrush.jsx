import { useMemo } from 'react'

/** small deterministic PRNG so the brush looks the same on every render */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Large painted stroke with a dry-brush (bristle) right edge.
 * Drawn from many thin horizontal "hairs" so the edge breaks up into streaks.
 *
 *  width/height : viewBox size (stretched to the element with preserveAspectRatio="none")
 *  edgeTop/edgeBottom : x position of the brush edge at the top / bottom (slant)
 */
export default function DryBrush({
  className = '',
  width = 640,
  height = 360,
  edgeTop = 520,
  edgeBottom = 400,
  color = '#128275',
  light = '#2ba596',
  dark = '#0b6a60',
  halo = 'rgba(255,255,255,0.55)',
  seed = 11,
}) {
  const shapes = useMemo(() => {
    const rnd = mulberry32(seed)
    const r = (a, b) => a + rnd() * (b - a)
    const haloRows = []
    const rows = []
    const hairs = []
    const texture = []
    const step = 2.4

    for (let y = -2; y < height + 2; y += step) {
      const t = y / height
      const base =
        edgeTop + (edgeBottom - edgeTop) * t + Math.sin(y / 26) * 16 + Math.sin(y / 9 + 1.3) * 7
      const end = base + r(-22, 14)
      const h = step + r(0.2, 1.2)

      haloRows.push([y, end + r(6, 34), h])
      rows.push([y, end, h])

      // bristle streaks running past the edge
      if (rnd() < 0.42) {
        const len = r(12, 110)
        hairs.push([y + r(0, step), end - 4, len, r(0.6, 1.8), r(0.35, 0.95)])
      }
      // inner texture (lighter / darker strokes)
      if (rnd() < 0.3) {
        const x = r(-20, end - 60)
        texture.push([x, y, r(40, 220), r(1, 3.2), rnd() < 0.6 ? light : dark, r(0.18, 0.45)])
      }
    }
    // solid body behind the hairs so no seams show between rows
    const pts = []
    for (let y = 0; y <= height; y += 12) {
      const t = y / height
      const x = edgeTop + (edgeBottom - edgeTop) * t + Math.sin(y / 26) * 16 - 34
      pts.push(`${x.toFixed(1)},${y}`)
    }
    const body = `M-10,-2 L${pts.join(' L')} L-10,${height + 2} Z`
    return { haloRows, rows, hairs, texture, body }
  }, [width, height, edgeTop, edgeBottom, light, dark, seed])

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
    >
      <g fill={halo}>
        {shapes.haloRows.map(([y, w, h], i) => (
          <rect key={i} x={-10} y={y} width={w + 10} height={h} rx={h / 2} />
        ))}
      </g>
      <g fill={color}>
        <path d={shapes.body} />
        {shapes.rows.map(([y, w, h], i) => (
          <rect key={i} x={-10} y={y} width={w + 10} height={h} rx={h / 2} />
        ))}
        {shapes.hairs.map(([y, x, len, h, o], i) => (
          <rect key={`h${i}`} x={x} y={y} width={len} height={h} rx={h / 2} opacity={o} />
        ))}
      </g>
      {shapes.texture.map(([x, y, len, h, c, o], i) => (
        <rect key={`t${i}`} x={x} y={y} width={len} height={h} rx={h / 2} fill={c} opacity={o} />
      ))}
    </svg>
  )
}

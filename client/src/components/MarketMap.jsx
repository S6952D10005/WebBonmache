import { useEffect, useRef, useState } from 'react'
import { Box, Hand, Minus, Plus, RotateCcw, Square } from 'lucide-react'
import { useI18n } from '../i18n'

/*
 * ===========================================================================
 *  Market map – SIMULATED (placeholder for the real 3D map)
 * ===========================================================================
 *  A drawn plan of the market with the 5 zones. It reserves the space and the
 *  behaviour of the final map:
 *   - "กดเพื่อเริ่มใช้งาน / TAP TO NAVIGATE" overlay → tap to start
 *   - 2D / 3D view (3D = tilted plan with raised zone blocks)
 *   - zoom + drag to move, reset
 *   - tap a zone → the shop list below shows only that zone
 *  Sits inside the content width (rounded box).
 *  When the real 3D map is ready (3D model / indoor-map service), replace the
 *  <svg> below and keep the props (zones, counts, selected, onSelect).
 * ===========================================================================
 */

export const ZONE_COLORS = { A: '#8cc63f', B: '#f7931e', C: '#00a3e0', D: '#ec1c8c', E: '#7f63c9' }

/* zone blocks on the plan (SVG units; the plan is drawn in 0–1000 × 0–440, the view adds a margin above and below) */
const BLOCKS = {
  A: { x: 60, y: 238, w: 190, h: 104 },
  B: { x: 72, y: 120, w: 160, h: 100 },
  C: { x: 282, y: 150, w: 128, h: 84 },
  D: { x: 420, y: 150, w: 140, h: 84 },
  E: { x: 282, y: 248, w: 278, h: 84 },
}

/** "โซน A · ตลาดสด" / "Zone A · Fresh market" / "A 区 · 生鲜市场" → the part after the dot */
const shortName = (name = '') => (name.includes('·') ? name.slice(name.indexOf('·') + 1).trim() : name)

/** true on tablet / desktop widths (the map is centred there; phones show the zones side first) */
function useWide() {
  const query = '(min-width: 768px)'
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

export default function MarketMap({ zones = [], counts = {}, selected = '', onSelect }) {
  const { t } = useI18n()
  const [started, setStarted] = useState(false)
  const [mode3d, setMode3d] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState('')
  const drag = useRef(null)
  const wide = useWide()

  const reset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
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

  const tilt = mode3d ? 'rotateX(48deg) rotateZ(-10deg)' : 'rotateX(0deg) rotateZ(0deg)'
  const depth = mode3d ? 16 : 6 // height of the raised zone blocks

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

    <div className="relative overflow-hidden rounded-[24px] border border-[#e6eaea] bg-[#f3f4f4]">
      {/* map canvas */}
      <div
        className={`relative aspect-[1000/420] min-h-[320px] w-full touch-none select-none [perspective:1400px] ${
          started ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * (mode3d ? 0.96 : 1)}) ${tilt}` }}
        >
          <svg
            viewBox={mode3d ? '0 83 1000 420' : '0 63 1000 420'}
            preserveAspectRatio={wide ? 'xMidYMid slice' : 'xMinYMid slice'}
            overflow="visible"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={t('แผนที่จำลองบอนมาร์เช่')}
          >
            <defs>
              <pattern id="mm-park" width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="#e3e6e6" />
                <path d="M0 0V14" stroke="#ffffff" strokeWidth="2" />
              </pattern>
            </defs>

            {/* ground – drawn far past the edges so the tilted 3D view never shows an empty border */}
            <rect x="-800" y="-800" width="2600" height="2040" fill="#f3f4f4" />

            {/* roads */}
            <g fill="none" strokeLinecap="round">
              <g stroke="#e2e5e5" strokeWidth="30">
                <path d="M-800 400 H1800" />
                <path d="M600 -800 V1240" />
                <path d="M-800 260 L1000 -190" />
                <path d="M70 -800 L-20 1240" />
              </g>
              <g stroke="#ffffff" strokeWidth="24">
                <path d="M-800 400 H1800" />
                <path d="M600 -800 V1240" />
                <path d="M-800 260 L1000 -190" />
                <path d="M70 -800 L-20 1240" />
              </g>
              <g stroke="#d9dddd" strokeWidth="1.5" strokeDasharray="10 10">
                <path d="M-800 400 H1800" />
                <path d="M600 -800 V1240" />
              </g>
            </g>
            <text x="760" y="425" fontSize="11" fill="#a3abaa">
              {t('ถ.เทศบาลสงเคราะห์')}
            </text>

            {/* parking */}
            <g>
              {[
                [650, 70, 300, 64],
                [650, 160, 170, 90],
                [835, 160, 115, 90],
                [650, 280, 300, 70],
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="url(#mm-park)" stroke="#d8dcdc" />
              ))}
              <text x="800" y="58" textAnchor="middle" fontSize="12" fontWeight="600" fill="#9aa3a2">
                {t('ที่จอดรถ P')}
              </text>
            </g>

            {/* scenery in the top / bottom margins */}
            <g>
              <rect x="80" y="-62" width="470" height="44" rx="14" fill="#dff0e2" />
              <text x="315" y="-34" textAnchor="middle" fontSize="12" fontWeight="600" fill="#7fb38a">
                {t('สวนหย่อม · ลานกิจกรรม')}
              </text>
              {[
                [650, 440, 140, 52],
                [810, 440, 140, 52],
                [120, 440, 200, 52],
                [340, 440, 200, 52],
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#e8eaea" stroke="#dcdfdf" />
              ))}
              <text x="330" y="505" textAnchor="middle" fontSize="11" fill="#a3abaa">
                {t('อาคารพาณิชย์')}
              </text>
            </g>

            {/* trees */}
            <g fill="#bfe3c4">
              {[
                [270, 110],
                [575, 140],
                [575, 300],
                [255, 360],
                [48, 220],
                [600, 60],
                [140, 370],
                [430, 365],
                [100, -40],
                [560, -40],
                [640, -40],
                [960, -40],
                [600, 470],
                [980, 470],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="9" />
              ))}
            </g>

            {/* buildings + zones */}
            <g transform="rotate(-4 320 240)">
              {/* plaza building base */}
              <rect x="268" y="136" width="306" height="210" rx="12" fill="#e7eaea" stroke="#d6dbdb" />
              <rect x="56" y="112" width="186" height="236" rx="12" fill="#eceeee" stroke="#d6dbdb" />

              {Object.entries(BLOCKS).map(([code, b]) => {
                const color = ZONE_COLORS[code]
                const zone = zones.find((z) => z.code === code)
                const isSel = selected === code
                const dim = selected && !isSel
                const lit = isSel || hover === code
                return (
                  <g
                    key={code}
                    data-zone={code}
                    role="button"
                    tabIndex={started ? 0 : -1}
                    aria-label={zone?.name || t('โซน {code}', { code })}
                    aria-pressed={isSel}
                    onClick={() => started && onSelect?.(isSel ? '' : code)}
                    onKeyDown={(e) => started && (e.key === 'Enter' || e.key === ' ') && onSelect?.(isSel ? '' : code)}
                    onMouseEnter={() => setHover(code)}
                    onMouseLeave={() => setHover('')}
                    className={`outline-none transition-opacity duration-300 ${started ? 'cursor-pointer' : ''}`}
                    style={{ opacity: dim ? 0.35 : 1 }}
                  >
                    {/* raised side (gives the 3D block look) */}
                    <rect x={b.x} y={b.y + depth} width={b.w} height={b.h} rx="8" fill={color} opacity="0.55" />
                    {/* top */}
                    <rect
                      x={b.x}
                      y={b.y - (lit ? 4 : 0)}
                      width={b.w}
                      height={b.h}
                      rx="8"
                      fill={color}
                      fillOpacity={lit ? 0.55 : 0.32}
                      stroke={color}
                      strokeWidth={isSel ? 4 : 2}
                      style={{ transition: 'all .3s' }}
                    />
                    <text
                      x={b.x + b.w / 2}
                      y={b.y + b.h / 2 - 6 - (lit ? 4 : 0)}
                      textAnchor="middle"
                      fontSize="26"
                      fontWeight="900"
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth="5"
                      paintOrder="stroke"
                    >
                      {code}
                    </text>
                    <text
                      x={b.x + b.w / 2}
                      y={b.y + b.h / 2 + 18 - (lit ? 4 : 0)}
                      textAnchor="middle"
                      fontSize="12.5"
                      fontWeight="700"
                      fill="#2b3a38"
                    >
                      {shortName(zone?.name)}
                    </text>
                    {/* number of shops */}
                    {counts[code] > 0 && (
                      <g transform={`translate(${b.x + b.w - 6} ${b.y + 6 - (lit ? 4 : 0)})`}>
                        <circle r="13" fill="#ffffff" stroke={color} strokeWidth="2.5" />
                        <text textAnchor="middle" dy="4.5" fontSize="12" fontWeight="800" fill={color}>
                          {counts[code]}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* entrances */}
              {[
                [415, 346],
                [150, 348],
              ].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <rect x="-22" y="-2" width="44" height="16" rx="8" fill="#138377" />
                  <text textAnchor="middle" y="10" fontSize="9.5" fontWeight="700" fill="#fff">
                    {t('ทางเข้า')}
                  </text>
                </g>
              ))}
            </g>

            {/* compass */}
            <g transform="translate(960 395)">
              <circle r="16" fill="#fff" stroke="#d6dbdb" />
              <path d="M0 -11 L5 3 L0 0 L-5 3 Z" fill="#f0483e" />
              <text textAnchor="middle" y="13" fontSize="8" fontWeight="700" fill="#7a8785">
                N
              </text>
            </g>
          </svg>
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
              [Plus, t('ซูมเข้า'), () => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))],
              [Minus, t('ซูมออก'), () => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))],
              [RotateCcw, t('รีเซ็ตแผนที่'), reset],
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

      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-medium text-[#7a8785] shadow-sm">
        {t('แผนที่จำลอง · กดที่โซนเพื่อดูร้าน')}
      </span>
    </div>
    </div>
  )
}

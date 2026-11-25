import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw, RotateCw, Map, Move, Layers, FileImage } from 'lucide-react'
import { useI18n } from '../i18n'
import { ZONE_COLORS } from '../data/marketFloorPlan'
import './MarketMap.css'
import { MarketModel, MarketLabels, DEFAULT_BEARING, sceneBounds, camera } from './MarketScene'

export { ZONE_COLORS }
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export default function MarketMap({ counts = {}, selected = '', onSelect }) {
  const { lang } = useI18n()
  const uid = useId().replace(/:/g, '')
  const text = (th, en, zh) => (lang === 'en' ? en : lang === 'zh' ? zh : th)
  const name = z => (lang === 'en' ? z.en : lang === 'zh' ? z.zh : z.label)
  const landmark = l => (lang === 'en' ? l.en : lang === 'zh' ? l.zh : l.th)
  const [bearing, setBearing] = useState(DEFAULT_BEARING)
  const [flat, setFlat] = useState(false)
  const [box, setBox] = useState(() => sceneBounds(DEFAULT_BEARING, false))
  const [labels, setLabels] = useState(true)
  const [plan, setPlan] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [panEnabled, setPanEnabled] = useState(false)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const svg = useRef(null)
  const drag = useRef(null)
  const initial = sceneBounds(bearing, flat)
  const zoom = initial.w / box.w
  // SVG units per screen pixel ("meet" scaling), used to keep signs at a fixed pixel size.
  const ups = Math.max(box.w / size.w, box.h / size.h)

  useEffect(() => {
    const el = svg.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width || 1, h: e.contentRect.height || 1 }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const view = (angle, top) => { setBearing(angle); setFlat(top); setBox(sceneBounds(angle, top)) }
  const changeZoom = (factor, at) => setBox(b => {
    const w = clamp(b.w / factor, initial.w / 6, initial.w)
    if (w >= initial.w - 0.5) return initial // fully zoomed out: back to the whole site
    const h = (w * b.h) / b.w
    const fx = at ? (at.x - b.x) / b.w : 0.5, fy = at ? (at.y - b.y) / b.h : 0.5
    return { x: b.x + (b.w - w) * fx, y: b.y + (b.h - h) * fy, w, h }
  })
  const pick = useCallback(code => onSelect?.(selected === code ? '' : code), [onSelect, selected])
  const reset = () => { view(DEFAULT_BEARING, false); setPanEnabled(false) }

  // Screen point → SVG point; the CTM covers CSS sizing and letterboxing.
  const point = e => {
    const m = svg.current?.getScreenCTM()
    return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null
  }
  const start = e => {
    if (e.button !== 0 || (e.pointerType === 'touch' && !panEnabled)) return
    const p = point(e)
    if (p) drag.current = { clientX: e.clientX, clientY: e.clientY, p, moved: false, active: true }
  }
  const move = e => {
    const d = drag.current
    if (!d?.active) return
    if (!d.moved && Math.hypot(e.clientX - d.clientX, e.clientY - d.clientY) < 5) return
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId)
    d.moved = true
    setDragging(true)
    const p = point(e)
    // keep at least a third of the view over the site
    if (p) setBox(b => ({ ...b, x: clamp(b.x + d.p.x - p.x, initial.x - b.w * 0.66, initial.x + initial.w - b.w * 0.34), y: clamp(b.y + d.p.y - p.y, initial.y - b.h * 0.66, initial.y + initial.h - b.h * 0.34) }))
  }
  const end = () => { if (drag.current) drag.current.active = false; setDragging(false) }
  // The mouse wheel zooms around the pointer. Once fully zoomed out, scrolling down
  // goes back to scrolling the page, so the map never traps the page.
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const wheel = e => {
      if (!e.deltaY || (e.deltaY > 0 && zoom <= 1.001)) return
      e.preventDefault()
      const m = el.getScreenCTM()
      const at = m && new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1)
      changeZoom(Math.exp(clamp(-delta, -120, 120) * 0.0022), at)
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  })

  // Which way north points on screen (the plan's north arrow points down).
  const cam = camera(bearing, flat)
  const north = (Math.atan2(-cam.s, -cam.c * cam.k) * 180) / Math.PI

  return (
    <div className="bm-floor">
      <div className="bm-floor-layout">
        <div className="bm-floor-canvas">
          <svg ref={svg} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} className={`bm-floor-svg ${panEnabled ? 'is-pannable' : ''} ${dragging ? 'is-dragging' : ''}`}
            role="group" aria-label={text('แผนผัง 3 มิติของบองมาร์เช่ แตะอาคารเพื่อกรองร้านค้า', 'Bon Marché 3D site map. Tap a building to filter shops', 'Bon Marché 3D 地图，点击楼栋筛选店铺')}
            onPointerLeave={() => { if (!drag.current?.moved) drag.current = null }} onPointerDown={start} onPointerMove={move} onPointerUp={end}
            onPointerCancel={() => { drag.current = null; end() }} onLostPointerCapture={end}
            onClickCapture={e => { if (drag.current?.moved) { e.stopPropagation(); drag.current = null } }}>
            <defs>
              <filter id="bm-label-shadow" x="-20%" y="-40%" width="140%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#3b3326" floodOpacity=".22" /></filter>
            </defs>
            <MarketModel bearing={bearing} flat={flat} selected={selected} onPick={pick} plan={plan} uid={uid} />
            <MarketLabels bearing={bearing} flat={flat} selected={selected} onPick={pick} name={name} landmark={landmark} ups={ups} zoom={zoom} show={labels} counts={counts} />
          </svg>

          <div className="bm-scene-mode">
            <button type="button" aria-pressed={!flat} onClick={() => view(bearing, false)}>3D</button>
            <button type="button" aria-pressed={flat} onClick={() => view(bearing, true)}>2D</button>
            <button type="button" onClick={() => view(bearing - 45, flat)} aria-label={text('หมุนซ้าย', 'Rotate left', '向左旋转')} title={text('หมุนซ้าย', 'Rotate left', '向左旋转')}><RotateCcw size={15} /></button>
            <button type="button" onClick={() => view(bearing + 45, flat)} aria-label={text('หมุนขวา', 'Rotate right', '向右旋转')} title={text('หมุนขวา', 'Rotate right', '向右旋转')}><RotateCw size={15} /></button>
          </div>
          <div className="bm-floor-tools">
            {[[Plus, text('ซูมเข้า', 'Zoom in', '放大'), () => changeZoom(1.35), zoom >= 5.99], [Minus, text('ซูมออก', 'Zoom out', '缩小'), () => changeZoom(1 / 1.35), zoom <= 1.01], [Map, text('ดูผังทั้งหมด', 'Reset view', '重置'), reset, false]].map(([Icon, label, fn, disabled]) =>
              <button key={label} type="button" title={label} aria-label={label} onClick={fn} disabled={disabled}><Icon size={18} /></button>)}
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="bm-floor-compass" aria-hidden="true">
            <svg viewBox="-20 -20 40 40" style={{ transform: `rotate(${north}deg)` }}><circle r="17" fill="#fff" stroke="#d9d2c4" /><path d="M0 -13 L6 4 L0 1 L-6 4Z" fill="#2c2a26" /><path d="M0 13 L6 4 L0 1 L-6 4Z" fill="#c9c1b2" /></svg>
            <span>{text('เหนือ', 'N', '北')}</span>
          </div>
          <div className="bm-floor-options">
            <button type="button" title={text('ป้ายชื่อ', 'Labels', '标签')} aria-pressed={labels} onClick={() => setLabels(v => !v)}><Layers size={15} /><span>{text('ป้ายชื่อ', 'Labels', '标签')}</span></button>
            <button type="button" title={text('แบบแปลน', 'CAD plan', '平面图')} aria-pressed={plan} onClick={() => setPlan(v => !v)}><FileImage size={15} /><span>{text('แบบแปลน', 'CAD plan', '平面图')}</span></button>
            <button type="button" title={text('ลากแผนที่', 'Pan map', '拖动地图')} aria-pressed={panEnabled} onClick={() => setPanEnabled(v => !v)} className="bm-floor-pan"><Move size={15} /><span>{text('ลากแผนที่', 'Pan map', '拖动地图')}</span></button>
          </div>
        </div>
      </div>
      <div className="bm-floor-footnote"><span>{text('จำลองจากแบบแปลนบองมาร์เช่ มาตราส่วน 1:250', 'Modelled on the Bon Marché site plan, scale 1:250', '依据 Bon Marché 1:250 总平面图绘制')}</span><span>{text('ตำแหน่งร้านภายในอาคาร กรุณาตรวจสอบเลขล็อกในรายละเอียดร้าน', 'For shop locations within a building, check the unit number in shop details', '楼栋内店铺位置请查看店铺详情中的铺位号')}</span></div>
    </div>
  )
}

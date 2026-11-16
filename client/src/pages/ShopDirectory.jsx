import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, Clock, MapPin, Phone, RotateCcw, Search, SearchX, Store, X } from 'lucide-react'
import { CATEGORY_ICONS } from '../components/Categories'
import { LeafBranch } from '../components/Decor'
import SmartLink from '../components/SmartLink'
import PageHero from '../components/PageHero'
import ColorfulText from '../components/ColorfulText'
import MarketMap, { ZONE_COLORS } from '../components/MarketMap'
import { buildings as rawBuildings, directoryShops, zones as defaultZones } from '../data/directoryData'
import { useI18n } from '../i18n'

/*
 * Shop Directory
 *   hero image + title / search card
 *   → market map (simulated 2D/3D – tap a zone to filter)
 *   → building tabs (All / Fresh Market / Bon Marché Plaza)
 *   → category icons (each category has its own colour)
 *   → shop cards → detail dialog
 */

/* ------------------------------------------------------------------------ */
/*  helpers                                                                 */
/* ------------------------------------------------------------------------ */

/** category colour key (categories.color) → tile / icon colours */
const TINT = {
  orange: 'bg-[#fff1e6] text-accent-500',
  teal: 'bg-brand-50 text-brand-600',
  pink: 'bg-[#fdeef4] text-[#ef4f8b]',
  yellow: 'bg-[#fff6e0] text-[#e0961a]',
}

const cleanName = (name = '') => name.replace(/\s*\n\s*/g, ' ')

/** current time in Thailand as minutes since midnight */
function nowMinutes() {
  const [h, m] = new Date()
    .toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false })
    .split(':')
    .map(Number)
  return (h % 24) * 60 + m
}

/** "08:00-20:00" → true / false (null when the format is unknown) */
function isOpenNow(hours, now = nowMinutes()) {
  const m = /(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/.exec(hours || '')
  if (!m) return null
  const open = +m[1] * 60 + +m[2]
  const close = +m[3] * 60 + +m[4]
  return close > open ? now >= open && now < close : now >= open || now < close
}

const formatHours = (hours = '', t) => t('{h} น.', { h: hours.replace(/\s*-\s*/, ' – ') })

/* ------------------------------------------------------------------------ */
/*  small pieces                                                            */
/* ------------------------------------------------------------------------ */

function OpenBadge({ open, className = '' }) {
  const { t } = useI18n()
  if (open === null) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] font-semibold leading-none ${
        open ? 'bg-white text-[#13804f]' : 'bg-white/90 text-[#7a8785]'
      } shadow-sm ${className}`}
    >
      <span className={`size-1.5 rounded-full ${open ? 'animate-pulse bg-[#1fb36b]' : 'bg-[#b5bfbd]'}`} />
      {open ? t('เปิดอยู่') : t('ปิดแล้ว')}
    </span>
  )
}

/** shop photo, or a tinted tile with the category icon when there's no photo yet */
function ShopImage({ shop, category, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (shop.image_url && !failed)
    return (
      <img
        src={shop.image_url}
        alt={shop.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    )
  const Icon = CATEGORY_ICONS[category?.icon] || Store
  return (
    <div className={`relative grid place-items-center overflow-hidden ${TINT[category?.color] || TINT.teal} ${className}`}>
      <LeafBranch className="absolute -right-3 -top-2 h-24 w-20 rotate-12 opacity-20" />
      <Icon className="size-12 opacity-80" strokeWidth={1.5} />
    </div>
  )
}


/* each category has its own colour (same family as the multi-colour title) */
const CATEGORY_COLORS = ['#f0483e', '#f7931e', '#5fa52a', '#00a3e0', '#ec1c8c', '#7f63c9', '#e09a00', '#1f9285']
const ALL_COLOR = '#ec1c8c'

/** round category icon + one-line label; the selected one sits on a tinted rounded tile */
function CategoryIcon({ active, onClick, icon: Icon = Store, color, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ '--cat': color, backgroundColor: active ? `${color}1f` : undefined }}
      className="group flex min-w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2.5 pb-2 pt-2.5 transition hover:bg-[#f4f6f6]"
    >
      <span
        style={{ backgroundColor: active ? color : `${color}26`, color: active ? '#fff' : color }}
        className="grid size-11 place-items-center rounded-full transition duration-300 group-hover:scale-110"
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <span className="whitespace-nowrap text-center text-[10.5px] leading-[1.25] text-[#4d5f5c] group-hover:text-[var(--cat)]">{children}</span>
    </button>
  )
}

/** building name, small and coloured (bottom-right of each card, like a mall logo) */
const BuildingMark = ({ building }) =>
  building ? <ColorfulText text={building.name} className="text-[10.5px] font-black leading-none tracking-[-0.01em]" /> : null

/* ------------------------------------------------------------------------ */
/*  shop card + detail dialog                                               */
/* ------------------------------------------------------------------------ */

function ShopCard({ shop, category, building, open, onOpen }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-2xl border border-[#eceff0] bg-white p-3 text-left shadow-[0_2px_10px_-6px_rgb(16_40_38/0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-16px_rgb(16_40_38/0.4)] focus-visible:outline-2 focus-visible:outline-[#ec1c8c]"
    >
      <div className="relative aspect-[1/0.92] overflow-hidden rounded-lg bg-[#f6f7f7]">
        <ShopImage shop={shop} category={category} className="h-full w-full transition duration-500 group-hover:scale-105" />
        {open !== null && (
          <span
            className={`absolute left-2 top-2 size-2.5 rounded-full ring-2 ring-white ${open ? 'bg-[#1fb36b]' : 'bg-[#b5bfbd]'}`}
            title={open ? t('เปิดอยู่') : t('ปิดแล้ว')}
          />
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[2.5em] text-[13px] font-medium leading-[1.25] text-ink">{shop.name}</h3>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        {shop.unit_no && (
          <span className="rounded-md bg-[#fde5f1] px-1.5 py-[3px] text-[10.5px] font-semibold leading-none text-[#ec1c8c]">
            {shop.unit_no}
          </span>
        )}
        <BuildingMark building={building} />
      </div>
    </button>
  )
}

function ShopDialog({ shop, category, zoneName, open, mapUrl, onClose }) {
  const { t } = useI18n()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // "02-953-8980 ต่อ 101" / "… ext. 101" / "… 转 101" → dial the main number
  const tel = shop.phone?.replace(/(ต่อ|ext\.|转).*/, '').replace(/[^\d+]/g, '')

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#062b28]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={shop.name}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-[540px] sm:rounded-3xl"
      >
        <div className="relative aspect-[16/9]">
          <ShopImage shop={shop} category={category} className="h-full w-full" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('ปิด')}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-md transition hover:bg-white hover:text-brand-700"
          >
            <X className="size-5" />
          </button>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {shop.badge && <span className="pill-tag">{shop.badge}</span>}
            <OpenBadge open={open} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="text-[12.5px] font-medium text-brand-600">{cleanName(category?.name) || shop.category_label}</p>
          <h2 className="mt-0.5 font-head text-[24px] font-extrabold leading-tight text-ink">{shop.name}</h2>
          {shop.description && <p className="mt-2 text-[14px] leading-relaxed text-[#4d5f5c]">{shop.description}</p>}

          <dl className="mt-5 divide-y divide-[#edf2f1] rounded-2xl border border-[#e6eeec] text-[13.5px]">
            {[
              [MapPin, t('ที่ตั้ง'), [zoneName, shop.unit_no && t('ล็อก {u}', { u: shop.unit_no })].filter(Boolean).join(' · ')],
              [Clock, t('เวลาเปิด-ปิด'), shop.open_hours && formatHours(shop.open_hours, t)],
              [Phone, t('โทร'), shop.phone],
            ]
              .filter(([, , v]) => v)
              .map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  <dt className="w-24 shrink-0 text-muted">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {tel && (
              <a
                href={`tel:${tel}`}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 text-[14px] font-semibold text-white transition hover:bg-brand-700"
              >
                <Phone className="size-4" /> {t('โทรหาร้าน')}
              </a>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-brand-200 text-[14px] font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                <MapPin className="size-4" /> {t('เส้นทางมาตลาด')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** cards shown at first, and added each time "ดูร้านเพิ่มเติม" is pressed */
const STEP = 10

/** small round preview of a shop (photo, or its category icon on the category colour) */
function ShopBubble({ shop, category, color }) {
  const [failed, setFailed] = useState(false)
  const Icon = CATEGORY_ICONS[category?.icon] || Store
  return (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-white">
      {shop.image_url && !failed ? (
        <img src={shop.image_url} alt="" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center" style={{ backgroundColor: `${color}26`, color }}>
          <Icon className="size-4" strokeWidth={2.2} />
        </span>
      )}
    </span>
  )
}

/**
 * "ดูร้านเพิ่มเติม" – gradient pill (pink → red → orange, like the colourful title)
 *   [ ◯◯◯  ดูร้านเพิ่มเติม / อีก N ร้าน   (⌄) ]
 * The bubbles preview the next shops; on hover a shine sweeps across and the arrow hops down.
 */
function LoadMoreButton({ next, remaining, catById, colorOf, onClick }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#ec1c8c] via-[#f0483e] to-[#f7931e] py-2 pl-2 pr-2.5 text-left text-white shadow-[0_14px_30px_-14px_rgb(236_28_140/0.9)] ring-1 ring-white/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgb(236_28_140/0.95)] active:translate-y-0 active:scale-[0.98]"
    >
      {/* shine sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 -translate-x-24 skew-x-[-20deg] bg-white/35 blur-[3px] transition-transform duration-700 ease-out group-hover:translate-x-[420px]"
      />

      {/* next shops */}
      <span aria-hidden="true" className="relative flex -space-x-3 pl-0.5">
        {next.map((s) => (
          <ShopBubble key={s.id} shop={s} category={catById[s.category_id]} color={colorOf(s.category_id)} />
        ))}
      </span>

      <span className="relative pr-2 leading-tight">
        <span className="block text-[14.5px] font-bold">{t('ดูร้านเพิ่มเติม')}</span>
        <span className="block text-[11.5px] text-white/85">{t('อีก {n} ร้าน', { n: remaining })}</span>
      </span>

      <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#ec1c8c] shadow-sm">
        <ChevronDown className="size-5 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:motion-safe:animate-bounce" strokeWidth={2.6} />
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------------ */
/*  page                                                                    */
/* ------------------------------------------------------------------------ */

export default function ShopDirectory({ settings, categories: homeCategories }) {
  const { t, tr } = useI18n()
  const [data, setData] = useState({ shops: directoryShops, zones: defaultZones, categories: homeCategories })
  const [params, setParams] = useSearchParams()
  const [now, setNow] = useState(nowMinutes)

  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const zone = params.get('zone') || ''
  const building = params.get('building') || ''
  const shopId = params.get('shop')

  // database data (falls back to the built-in list while the DB isn't updated)
  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/directory', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!json?.shops?.length) return
        setData((d) => ({
          shops: json.shops,
          zones: json.zones?.length ? json.zones : d.zones,
          categories: json.categories?.length ? json.categories : d.categories,
        }))
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])
  useEffect(() => setData((d) => ({ ...d, categories: homeCategories })), [homeCategories])

  // refresh "open now" every minute
  useEffect(() => {
    const id = setInterval(() => setNow(nowMinutes()), 60_000)
    return () => clearInterval(id)
  }, [])

  /** set one URL parameter (plus optional others); empty value removes it */
  const setParam = (key, value, extra = {}) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        for (const [k, v] of Object.entries({ [key]: value, ...extra })) {
          if (v) next.set(k, v)
          else next.delete(k)
        }
        return next
      },
      { replace: key === 'q', preventScrollReset: true },
    )

  // everything shown in the current language (src/i18n/translations.js)
  const { shops, zones, categories } = useMemo(() => tr(data), [data, tr])
  const buildings = useMemo(() => tr(rawBuildings), [tr])
  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c])), [categories])
  const zoneName = (code) => zones.find((z) => z.code === code)?.name || (code ? t('โซน {code}', { code }) : '')
  const buildingOf = (zoneCode) => buildings.find((b) => b.zones.includes(zoneCode))

  // categories that actually have shops (each with its own colour)
  const shopCategories = useMemo(() => {
    const used = new Set(shops.map((s) => String(s.category_id)))
    return categories.filter((c) => used.has(String(c.id)))
  }, [shops, categories])
  const colorOf = (id) =>
    CATEGORY_COLORS[Math.max(0, shopCategories.findIndex((c) => String(c.id) === String(id))) % CATEGORY_COLORS.length]

  // shops per zone (numbers on the map)
  const zoneCounts = useMemo(() => {
    const n = {}
    shops.forEach((s) => (n[s.zone] = (n[s.zone] || 0) + 1))
    return n
  }, [shops])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const inBuilding = buildings.find((b) => b.code === building)
    return shops.filter((s) => {
      if (inBuilding && !inBuilding.zones.includes(s.zone)) return false
      if (zone && s.zone !== zone) return false
      if (cat && String(s.category_id) !== cat) return false
      if (!needle) return true
      const hay = [s.name, s.category_label, s.description, s.unit_no, zoneName(s.zone), cleanName(catById[s.category_id]?.name)]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, q, cat, zone, building, catById, zones, buildings])

  const openCount = shops.filter((s) => isOpenNow(s.open_hours, now)).length
  const filtered = Boolean(q || cat || zone || building)
  const resetAll = () => setParams({}, { preventScrollReset: true })

  // a zone picked on the map also selects its building tab;
  // a building tab clears a zone that belongs to another building
  const selectZone = (code) => setParam('zone', code, { building: code ? buildingOf(code)?.code : building })
  const selectBuilding = (code) => {
    const keepZone = zone && buildings.find((b) => b.code === code)?.zones.includes(zone)
    setParam('building', code, { zone: keepZone ? zone : '' })
  }

  // "ดูร้านเพิ่มเติม": show STEP cards, then STEP more per press; a new filter / search starts again
  const [visible, setVisible] = useState(STEP)
  useEffect(() => setVisible(STEP), [q, cat, zone, building])
  const shown = results.slice(0, visible)
  const remaining = results.length - shown.length

  const selected = shops.find((s) => String(s.id) === shopId)

  return (
    <>
      {/* ================= hero (home banner image) + title / search card ================= */}
      <PageHero settings={settings}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
          <div>
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <SmartLink href="/" className="hover:text-brand-700">
                {t('หน้าแรก')}
              </SmartLink>
              <span>/</span>
              <span className="font-medium text-brand-700">{t('Shop Directory')}</span>
            </nav>
            <ColorfulText as="h1" animated text={t('Shop Directory')} className="mt-0.5 font-head text-[26px] font-black leading-tight tracking-[-0.01em] sm:text-[30px]" />
            <p className="mt-0.5 text-[12.5px] text-[#4d5f5c]">
              {t('ค้นหาร้านค้า ร้านอาหาร และบริการทั้งหมดใน {place} ได้ในที่เดียว', { place: tr(settings.address_title) || settings.site_name })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 rounded-full border border-brand-100 bg-white p-1 pl-4 shadow-[0_6px_18px_-12px_rgb(12_80_72/0.5)] transition focus-within:border-brand-400 focus-within:shadow-[0_0_0_4px_rgb(58_171_156/0.15)]">
              <Search className="size-[18px] shrink-0 text-brand-600" strokeWidth={2.2} />
              <input
                type="search"
                value={q}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder={t('ค้นหาชื่อร้าน สินค้า หรือเลขล็อก เช่น กาแฟ, A-08')}
                aria-label={t('ค้นหาร้านค้า')}
                className="h-9 min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-[#98a3a1] [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setParam('q', '')}
                  aria-label={t('ล้างคำค้นหา')}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[#7a8785] hover:bg-[#f2f5f4] hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )}
              <span className="hidden h-9 shrink-0 items-center rounded-full bg-gradient-to-r from-[#ff9d48] to-[#ee5f14] px-5 text-[13px] font-semibold text-white sm:flex">
                {t('ค้นหา')}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[12px] text-[#4d5f5c]">
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{shops.length}</b> {t('ร้านค้า')}
              </span>
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{shopCategories.length}</b> {t('หมวดหมู่')}
              </span>
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{zones.length}</b> {t('โซน')}
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 animate-pulse rounded-full bg-[#1fb36b]" />
                <b className="text-[15px] font-extrabold text-[#13804f]">{openCount}</b> {t('ร้านเปิดอยู่ตอนนี้')}
              </span>
            </div>
          </div>
        </div>
      </PageHero>


      <section className="container-bm pb-16 pt-6">
        {/* ================= market map (simulated 2D / 3D) ================= */}
        <MarketMap zones={zones} counts={zoneCounts} selected={zone} onSelect={selectZone} />

        {/* ================= building tabs ================= */}
        <div className="mt-6 flex justify-center">
          <div className="flex rounded-full bg-[#eef0f0] p-1">
            {[{ code: '', name: t('All') }, ...buildings].map((b) => {
              const active = building === b.code
              return (
                <button
                  key={b.code || 'all'}
                  type="button"
                  onClick={() => selectBuilding(b.code)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-2 text-[12.5px] transition sm:min-w-[150px] sm:px-5 sm:text-[13px] ${
                    active ? 'bg-white font-semibold text-[#ec1c8c] shadow-[0_2px_8px_-3px_rgb(0_0_0/0.2)]' : 'text-[#5d6c69] hover:text-ink'
                  }`}
                >
                  {b.code ? (
                    <span className="flex flex-col items-center leading-tight">
                      <ColorfulText text={b.name} className={`flex-nowrap text-[12px] font-black sm:text-[12.5px] ${active ? '' : 'opacity-70'}`} />
                      <span className="hidden text-[9.5px] font-normal text-[#8a9795] sm:block">{b.label}</span>
                    </span>
                  ) : (
                    b.name
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ================= category icons ================= */}
        <div className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-1">
            <CategoryIcon active={!cat} onClick={() => setParam('cat', '')} icon={Store} color={ALL_COLOR}>
              {t('All')}
            </CategoryIcon>
            {shopCategories.map((c) => (
              <CategoryIcon
                key={c.id}
                active={cat === String(c.id)}
                onClick={() => setParam('cat', cat === String(c.id) ? '' : String(c.id))}
                icon={CATEGORY_ICONS[c.icon]}
                color={colorOf(c.id)}
              >
                {cleanName(c.name)}
              </CategoryIcon>
            ))}
          </div>
        </div>

        {/* active filters (only when something is filtered) */}
        {filtered && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-[#4d5f5c]">
            <span>
              {t('แสดง {n} ร้าน', { n: results.length })}
            </span>
            {zone && (
              <button
                type="button"
                onClick={() => selectZone('')}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white"
                style={{ backgroundColor: ZONE_COLORS[zone] || '#138377' }}
              >
                {zoneName(zone)} <X className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1 text-[#7a8785] underline-offset-2 hover:text-ink hover:underline"
            >
              <RotateCcw className="size-3" /> {t('ล้างทั้งหมด')}
            </button>
          </div>
        )}

        {/* ================= shop cards ================= */}
        {results.length ? (
          <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {shown.map((s, i) => (
              <div
                key={s.id}
                // cards added by "ดูร้านเพิ่มเติม" fade up one after another
                className={`flex ${i >= visible - STEP && visible > STEP ? 'motion-safe:animate-card-in' : ''}`}
                style={i >= visible - STEP && visible > STEP ? { animationDelay: `${(i % STEP) * 40}ms` } : undefined}
              >
                <ShopCard
                  shop={s}
                  category={catById[s.category_id]}
                  building={buildingOf(s.zone)}
                  open={isOpenNow(s.open_hours, now)}
                  onOpen={() => setParam('shop', String(s.id))}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2">
            {remaining > 0 && (
              <LoadMoreButton
                next={results.slice(visible, visible + 3)}
                remaining={remaining}
                catById={catById}
                colorOf={colorOf}
                onClick={() => setVisible((v) => v + STEP)}
              />
            )}
            <p className="text-[12px] text-[#98a3a1]">
              {t('แสดง {a} จาก {b} ร้าน', { a: shown.length, b: results.length })}
            </p>
          </div>
          </>
        ) : (
          <div className="mt-5 grid place-items-center rounded-3xl border border-dashed border-[#e3d3dc] bg-[#fdf6fa] px-6 py-16 text-center">
            <SearchX className="size-12 text-[#ec1c8c]/70" strokeWidth={1.6} />
            <p className="mt-4 text-[17px] font-semibold text-ink">{t('ไม่พบร้านที่ตรงกับการค้นหา')}</p>
            <p className="mt-1 text-[13.5px] text-muted">{t('ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ / โซนอื่น')}</p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-5 flex items-center gap-2 rounded-full bg-[#ec1c8c] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#d0157a]"
            >
              <RotateCcw className="size-4" /> {t('ล้างตัวกรองทั้งหมด')}
            </button>
          </div>
        )}
      </section>

      {selected && (
        <ShopDialog
          shop={selected}
          category={catById[selected.category_id]}
          zoneName={zoneName(selected.zone)}
          open={isOpenNow(selected.open_hours, now)}
          mapUrl={settings.visit_map_url || settings.map_url}
          onClose={() => setParam('shop', '')}
        />
      )}
    </>
  )
}

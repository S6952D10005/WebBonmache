import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, MapPin, Phone, RotateCcw, Search, SearchX, Store, X } from 'lucide-react'
import { CATEGORY_ICONS } from '../components/Categories'
import { LeafBranch } from '../components/Decor'
import SmartLink from '../components/SmartLink'
import PageHero from '../components/PageHero'
import MarketMap, { ZONE_COLORS } from '../components/MarketMap'
import { directoryShops, zones as defaultZones } from '../data/directoryData'
import { defaultData } from '../data/defaultData'
import { useI18n } from '../i18n'

/*
 * Shop Directory
 *   hero image + title / search card
 *   → market map (3D plan from the CAD drawing – tap a building to filter)
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


/* ------------------------------------------------------------------------ */
/*  shop card + detail dialog                                               */
/* ------------------------------------------------------------------------ */

function ShopCard({ shop, category, onOpen }) {
  const Icon = CATEGORY_ICONS[category?.icon] || Store
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-2xl border border-[#eceff0] bg-white p-3 text-left shadow-[0_2px_10px_-6px_rgb(16_40_38/0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-16px_rgb(16_40_38/0.4)] focus-visible:outline-2 focus-visible:outline-[#ec1c8c]"
    >
      <div className="relative aspect-[1/0.86] overflow-hidden rounded-lg bg-[#f6f7f7]">
        <ShopImage shop={shop} category={category} className="h-full w-full transition duration-500 group-hover:scale-105" />
      </div>

      {/* logo (or the category icon) beside the shop name */}
      <div className="mt-3 flex items-center gap-2.5">
        {shop.logo_url ? (
          <img src={shop.logo_url} alt="" loading="lazy" className="size-8 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-[#e6eeec]" />
        ) : (
          <span className={`grid size-8 shrink-0 place-items-center rounded-full ${TINT[category?.color] || TINT.teal}`}>
            <Icon className="size-4" strokeWidth={1.8} />
          </span>
        )}
        <h3 className="line-clamp-2 min-w-0 text-[13.5px] font-semibold leading-[1.25] text-ink">{shop.name}</h3>
      </div>

      {shop.description && <p className="mt-2 line-clamp-2 text-[11.5px] leading-[1.45] text-[#6b7a77]">{shop.description}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3">
        {shop.unit_no && (
          <span className="rounded-md bg-[#fde5f1] px-1.5 py-[3px] text-[10.5px] font-semibold leading-none text-[#ec1c8c]">{shop.unit_no}</span>
        )}
        {shop.open_hours && (
          <span className="flex items-center gap-1 text-[11px] leading-none text-[#5d6c69]">
            <Clock className="size-3.5 text-brand-600" strokeWidth={2} />
            {shop.open_hours.replace(/\s*-\s*/, '–')}
          </span>
        )}
      </div>
    </button>
  )
}

/* a shop's social pages: brand colour (tile + hover glow) and its mark */
const SOCIALS = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877f2',
    bg: '#1877f2',
    icon: 'M14 8h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3h-3V9c0-.6.4-1 1-1Z',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#d62976',
    bg: 'linear-gradient(45deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)',
    icon: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z',
  },
]
// account name from the link ("instagram.com/topsthailand" → "@topsthailand");
// share links ("facebook.com/share/…") have none, so the shop's name is shown
function socialHandle(key, url, shopName) {
  try {
    const first = new URL(url).pathname.split('/').filter(Boolean)[0]
    if (!first || ['share', 'profile.php', 'p', 'reel', 'people'].includes(first)) return shopName
    return key === 'instagram' ? `@${first}` : decodeURIComponent(first)
  } catch {
    return shopName
  }
}

function ShopDialog({ shop, category, zoneName, open, mapUrl, onClose }) {
  const { t } = useI18n()
  const photos = shop.gallery?.length ? shop.gallery : []
  const [photo, setPhoto] = useState(Math.max(0, photos.indexOf(shop.image_url)))
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
        // phone: photo on top, details below · tablet/desktop: photo left, details right
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-[760px] sm:rounded-3xl md:grid md:max-w-[1180px] md:grid-cols-[1.2fr_1fr] md:overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('ปิด')}
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-md transition hover:bg-white hover:text-brand-700"
        >
          <X className="size-5" />
        </button>

        {/* photo + thumbnails */}
        <div className="md:flex md:min-h-0 md:flex-col md:bg-[#f6f7f7]">
        <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[min(640px,82dvh)] md:flex-1">
          <ShopImage shop={photos.length ? { ...shop, image_url: photos[photo] } : shop} category={category} className="h-full w-full md:absolute md:inset-0" />
          <div className="absolute bottom-3 left-3 flex gap-2">
            {shop.badge && <span className="pill-tag">{shop.badge}</span>}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-6 pt-3 md:px-4 md:pb-4">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(i)}
                aria-label={t('รูปที่ {n}', { n: i + 1 })}
                aria-pressed={photo === i}
                className={`size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition ${photo === i ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        </div>

        {/* details */}
        <div className="px-6 pb-6 pt-5 md:flex md:flex-col md:overflow-y-auto md:px-10 md:pb-10 md:pt-12">
          <div className="flex items-center gap-3">
            {shop.logo_url && <img src={shop.logo_url} alt="" className="size-14 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-[#e6eeec] md:size-[72px]" />}
            <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-brand-600 md:text-[14px]">{cleanName(category?.name) || shop.category_label}</p>
          <h2 className="mt-0.5 font-head text-[26px] font-extrabold leading-tight text-ink sm:text-[28px] md:text-[34px]">{shop.name}</h2>
            </div>
          </div>
          {shop.description && <p className="mt-3 text-[14px] leading-relaxed text-[#4d5f5c] md:mb-8 md:mt-5 md:text-[16px]">{shop.description}</p>}

          <dl className="mt-5 divide-y divide-[#edf2f1] rounded-2xl border border-[#e6eeec] text-[13.5px] md:mt-auto md:text-[15px]">
            {[
              [MapPin, t('ที่ตั้ง'), [zoneName, shop.unit_no && t('ล็อก {u}', { u: shop.unit_no })].filter(Boolean).join(' · ')],
              [Clock, t('เวลาเปิด-ปิด'), shop.open_hours && formatHours(shop.open_hours, t)],
              [Phone, t('โทร'), shop.phone],
            ]
              .filter(([, , v]) => v)
              .map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 md:gap-4 md:px-5 md:py-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 md:size-10 md:rounded-xl">
                    <Icon className="size-4 md:size-5" strokeWidth={2} />
                  </span>
                  <dt className="w-24 shrink-0 text-muted md:w-28">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
          </dl>

          {SOCIALS.some((x) => shop[x.key]) && (
            <div className="mt-5 md:mt-6">
              <p className="mb-2.5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                {t('ติดตามร้าน')}
                <span aria-hidden="true" className="h-px flex-1 bg-[#e8efed]" />
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2 md:gap-3">
                {SOCIALS.filter((x) => shop[x.key]).map((x) => (
                  <a
                    key={x.key}
                    href={shop[x.key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${x.label} · ${shop.name}`}
                    className="group flex items-center gap-2.5 rounded-2xl border border-[#e6eeec] bg-white p-2.5 pr-3 transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_14px_28px_-16px_var(--c)] md:p-3 md:pr-4"
                    style={{ '--c': x.color }}
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition duration-300 group-hover:scale-105 md:size-11"
                      style={{ background: x.bg }}
                    >
                      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" fillRule="evenodd" aria-hidden="true">
                        <path d={x.icon} />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[13.5px] font-bold text-ink md:text-[14.5px]">{x.label}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted md:text-[12.5px]">{socialHandle(x.key, shop[x.key], shop.name)}</span>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f3f6f5] text-[#7a8785] transition duration-300 group-hover:bg-(--c) group-hover:text-white">
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={2.4} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 md:mt-auto md:gap-3 md:pt-8">
            {tel && (
              <a
                href={`tel:${tel}`}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 text-[14px] font-semibold text-white transition hover:bg-brand-700 md:h-12 md:text-[15px]"
              >
                <Phone className="size-4" /> {t('โทรหาร้าน')}
              </a>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-brand-200 text-[14px] font-semibold text-brand-700 transition hover:bg-brand-50 md:h-12 md:text-[15px]"
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
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-white">
      {shop.image_url && !failed ? (
        <img src={shop.image_url} alt="" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center" style={{ backgroundColor: `${color}26`, color }}>
          <Icon className="size-3.5" strokeWidth={2.2} />
        </span>
      )}
    </span>
  )
}

/**
 * "ดูร้านเพิ่มเติม" – small, soft pink pill
 *   [ ◯◯◯  ดูร้านเพิ่มเติม / อีก N ร้าน  (⌄) ]
 * The bubbles preview the next shops; on hover the pill deepens a little and the arrow hops down.
 */
function LoadMoreButton({ next, remaining, catById, colorOf, onClick }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-full border border-[#f2dbe6] bg-[#fdf5f9] py-1 pl-1 pr-1.5 text-left transition duration-200 hover:-translate-y-px hover:border-[#ebc7d8] hover:bg-[#fbecf3] active:translate-y-0 active:scale-[0.98]"
    >
      {/* next shops */}
      <span aria-hidden="true" className="flex -space-x-2.5">
        {next.map((s) => (
          <ShopBubble key={s.id} shop={s} category={catById[s.category_id]} color={colorOf(s.category_id)} />
        ))}
      </span>

      <span className="pr-1 leading-tight">
        <span className="block text-[13px] font-semibold text-[#a8336f]">{t('ดูร้านเพิ่มเติม')}</span>
        <span className="block text-[11px] text-[#9a8f95]">{t('อีก {n} ร้าน', { n: remaining })}</span>
      </span>

      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#c2407f] ring-1 ring-[#f2dbe6]">
        <ChevronDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2.4} />
      </span>
    </button>
  )
}

/** how many shops are on screen: a thin bar that fills a little more with each "ดูร้านเพิ่มเติม" */
function ShownProgress({ shown, total }) {
  const { t } = useI18n()
  const pct = total ? Math.round((shown / total) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={shown}
      aria-label={t('แสดง {a} จาก {b} ร้าน', { a: shown, b: total })}
      className="flex w-48 items-center gap-2"
    >
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-[#f1e7ec]">
        <span className="block h-full rounded-full bg-[#e7a1c2] transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-[11px] tabular-nums text-[#98a3a1]">
        {shown}/{total}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*  search box + suggestions                                                */
/* ------------------------------------------------------------------------ */

/** `text` with the part that matches the search in bold orange (first match) */
function Highlight({ text = '', needle }) {
  const i = needle ? text.toLowerCase().indexOf(needle) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-[#e2580f]">{text.slice(i, i + needle.length)}</mark>
      {text.slice(i + needle.length)}
    </>
  )
}

/** one row in the suggestions list (category · zone · shop · "search everywhere" · "see all") */
function SuggestRow({ option: o, needle, active, onPick, onPoint }) {
  const { t } = useI18n()
  const Icon = o.icon || Store
  const base = `flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-[#f3f7f6]' : ''}`
  const events = { id: `sg-${o.key}`, role: 'option', 'aria-selected': active, onClick: onPick, onMouseMove: onPoint }

  if (o.kind === 'all')
    return (
      <div {...events} className={`${base} justify-between border-t border-[#edf2f1] py-3 text-[13px] font-semibold text-[#d2560f] ${active ? 'bg-[#fff4ec]' : 'bg-[#fcfaf8]'}`}>
        <span>
          {t('ดูผลค้นหาทั้งหมด')} <span className="font-normal text-muted">· {t('{n} ร้าน', { n: o.count })}</span>
        </span>
        <ArrowRight className={`size-4 transition-transform ${active ? 'translate-x-0.5' : ''}`} strokeWidth={2.4} />
      </div>
    )

  return (
    <div {...events} className={base}>
      {o.logo ? (
        <img src={o.logo} alt="" className="size-9 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-[#e6eeec]" />
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${o.color}1f`, color: o.color }}>
          <Icon className="size-[17px]" strokeWidth={2} />
        </span>
      )}
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[14px] font-medium text-ink">
          <Highlight text={o.label} needle={needle} />
        </span>
        {o.sub && (
          <span className="mt-0.5 block truncate text-[12px] text-muted">
            <Highlight text={o.sub} needle={needle} />
          </span>
        )}
      </span>
      {o.open != null && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${o.open ? 'bg-[#e6f6ee] text-[#13804f]' : 'bg-[#f1f3f3] text-[#7a8785]'}`}>
          {o.open ? t('เปิดอยู่') : t('ปิดแล้ว')}
        </span>
      )}
      {o.kind !== 'shop' && <ArrowRight className="size-4 shrink-0 text-[#9aa9a6]" strokeWidth={2.2} />}
    </div>
  )
}

/**
 * words that type themselves in the empty search box – "ลองค้นหา “ข้าวมันไก่|”" – then erase and
 * the next one comes. Words that find no shop are left out (SearchBox gets them already checked).
 */
const TYPING_WORDS = ['ข้าวมันไก่', 'Wolf Croissant', 'A137', 'กาแฟ', 'ขนม']
const TYPE_MS = 110 // per letter while typing
const ERASE_MS = 45 // per letter while erasing
const HOLD_MS = 1500 // the whole word stays this long

// split into what the eye sees as letters, so a Thai vowel / tone mark appears together with its letter
const letters = (s) =>
  typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(s)].map((x) => x.segment) : [...s]

function TypingHint({ words, caret }) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  useEffect(() => {
    let word = 0
    let len = 0
    let erasing = false
    let timer
    const tick = () => {
      const w = letters(words[word])
      if (!erasing) {
        len++
        if (len >= w.length) erasing = true
        setText(w.slice(0, len).join(''))
        timer = setTimeout(tick, erasing ? HOLD_MS : TYPE_MS)
      } else {
        len--
        if (len <= 0) {
          erasing = false
          word = (word + 1) % words.length
        }
        setText(w.slice(0, len).join(''))
        timer = setTimeout(tick, len <= 0 ? 400 : ERASE_MS)
      }
    }
    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [words])

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-[#98a3a1]">
      {t('ลองค้นหา')} “<span className="text-[#4d5f5c]">{text}</span>
      <span className={`-mx-px font-light text-[#ee5f14] ${caret ? 'animate-caret' : 'opacity-0'}`}>|</span>”
    </span>
  )
}

/**
 * The search bar. Typing filters the list straight away; the box below the bar suggests matching
 * categories, zones and shops (↑ ↓ to move, Enter to pick, Esc to close). The orange button / Enter
 * glides down to the results. While empty, example words type themselves in it (TypingHint – a plain
 * placeholder instead for people who turn animations off). Computers: press / anywhere to start typing.
 *   groups – [{ title, options: [{ key, kind, label, sub, icon, color, logo, open, count, run }] }]
 *   hints  – example words for TypingHint
 */
function SearchBox({ value, onChange, onSubmit, groups, needle, emptyText, hints = [] }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(-1)
  const input = useRef(null)
  const closeTimer = useRef(0)
  const options = groups.flatMap((g) => g.options)
  useEffect(() => setActive(-1), [value])
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const typing = !value && hints.length > 0 && !still

  // "/" anywhere on the page (not while typing in another box) → start typing in the search box
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const el = e.target
      if (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const show = open && value.trim() !== ''
  const done = () => {
    setOpen(false)
    input.current?.blur() // phones: puts the keyboard away so the results can be seen
  }
  const pick = (o) => {
    done()
    o.run()
  }
  const onKeyDown = (e) => {
    if (e.key === 'Escape') return setOpen(false)
    if (!options.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter' && show && active >= 0) {
      e.preventDefault()
      pick(options[active])
    }
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        done()
        onSubmit()
      }}
      className="relative"
    >
      {/* slim pill: 44px tall */}
      <div className="flex items-center gap-2 rounded-full border border-brand-100 bg-white p-1 pl-4 text-left shadow-[0_8px_22px_-14px_rgb(12_80_72/0.55)] transition focus-within:border-brand-400 focus-within:shadow-[0_0_0_4px_rgb(58_171_156/0.15)]">
        <Search className="size-[18px] shrink-0 text-brand-600" strokeWidth={2.2} />
        <span className="relative min-w-0 flex-1 text-[13px] sm:text-[14px]">
          {typing && <TypingHint words={hints} caret={!focused} />}
          <input
            ref={input}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              clearTimeout(closeTimer.current)
              setFocused(true)
              setOpen(true)
            }}
            // a short wait so a tap on a suggestion still lands before the box closes
            onBlur={() => {
              setFocused(false)
              closeTimer.current = setTimeout(() => setOpen(false), 150)
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={show}
            aria-controls="shop-suggest"
            aria-autocomplete="list"
            aria-activedescendant={show && options[active] ? `sg-${options[active].key}` : undefined}
            placeholder={typing ? '' : t('ค้นหาชื่อร้าน สินค้า หรือเลขล็อก เช่น กาแฟ, A137')}
            aria-label={t('ค้นหาร้านค้า')}
            className="relative h-9 w-full bg-transparent text-ink outline-none placeholder:text-[#98a3a1] [&::-webkit-search-cancel-button]:hidden"
          />
        </span>
        {/* computers: "/" starts typing (hidden while typing and on touch screens) */}
        {!value && !focused && (
          <kbd className="hidden h-6 shrink-0 items-center rounded-md border border-[#e3ecea] bg-[#f8faf9] px-2 font-sans text-[11px] text-[#7a8785] [@media(hover:hover)_and_(pointer:fine)]:flex" title={t('กด / เพื่อค้นหา')}>
            /
          </kbd>
        )}
        {value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // keep the cursor in the box
            onClick={() => {
              onChange('')
              input.current?.focus()
            }}
            aria-label={t('ล้างคำค้นหา')}
            className="grid size-8 shrink-0 place-items-center rounded-full text-[#7a8785] hover:bg-[#f2f5f4] hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
        {/*
          search button – solid brand orange, the magnifier sits in a soft round bubble
          (phones: just the bubble · larger screens: bubble + "ค้นหา").
          hover: the orange deepens, a band of light sweeps across once and the bubble turns white,
          tilts and pops a little; pressing it squeezes the button.
        */}
        <button
          type="submit"
          aria-label={t('ค้นหา')}
          className="group/btn relative flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full bg-accent-500 p-1 text-[13px] font-semibold text-white shadow-[0_6px_14px_-8px_rgb(220_95_18/0.9)] transition-[background-color,box-shadow,scale] duration-300 hover:bg-accent-600 hover:shadow-[0_10px_20px_-8px_rgb(220_95_18/0.85)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 active:scale-[0.95] sm:pr-4"
        >
          {/* light sweep – only moves on the way in, jumps back unseen */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 transition-none group-hover/btn:left-[130%] group-hover/btn:transition-[left] group-hover/btn:duration-700 group-hover/btn:ease-out"
          />
          <span className="relative grid size-7 place-items-center rounded-full bg-white/20 transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/btn:-rotate-12 group-hover/btn:scale-110 group-hover/btn:bg-white group-hover/btn:text-accent-600">
            <Search className="size-[15px]" strokeWidth={2.6} />
          </span>
          <span className="relative hidden sm:inline">{t('ค้นหา')}</span>
        </button>
      </div>

      {show && (
        <div
          id="shop-suggest"
          role="listbox"
          aria-label={t('ผลที่แนะนำ')}
          onMouseDown={(e) => e.preventDefault()} // clicking inside keeps the cursor in the box
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(440px,60dvh)] overflow-y-auto overscroll-contain rounded-2xl border border-[#e3ecea] bg-white text-left shadow-[0_24px_48px_-24px_rgb(12_80_72/0.45)] motion-safe:animate-card-in"
        >
          {options.length ? (
            groups
              .filter((g) => g.options.length)
              .map((g) => (
                <div key={g.title || 'footer'} role="group" aria-label={g.title || undefined} className={g.title ? 'py-1.5' : ''}>
                  {g.title && <p className="px-4 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#98a3a1]">{g.title}</p>}
                  {g.options.map((o) => (
                    <SuggestRow
                      key={o.key}
                      option={o}
                      needle={needle}
                      active={options[active]?.key === o.key}
                      onPick={() => pick(o)}
                      onPoint={() => setActive(options.indexOf(o))}
                    />
                  ))}
                </div>
              ))
          ) : (
            <div className="flex items-center gap-3 px-4 py-4">
              <SearchX className="size-8 shrink-0 text-[#ec1c8c]/60" strokeWidth={1.6} />
              <p className="text-[13px] leading-snug text-muted">{emptyText}</p>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

/**
 * one-tap searches under the bar ("ยอดนิยม"). Each starts a fresh search; tapping the lit one again
 * turns it off. A chip that would find no shop is hidden.
 *   q – words to search (translated with t()) · set – other URL filters
 */
const POPULAR = [
  { label: 'เปิดอยู่ตอนนี้', set: { open: '1' }, live: true },
  { label: 'ฟู้ดคอร์ท', set: { zone: 'FC' } },
  { label: 'ตลาดสด', set: { zone: 'MK' } },
  { label: 'ขนม', q: 'ขนม' },
  { label: 'เบเกอรี่', q: 'เบเกอรี่' },
  { label: 'กาแฟ', q: 'กาแฟ' },
]

/* ------------------------------------------------------------------------ */
/*  page                                                                    */
/* ------------------------------------------------------------------------ */

// categories the database doesn't have yet (e.g. id 9 บริการ & การศึกษา before its SQL runs) come from the defaults
const withDefaultCategories = (list = []) => [...list, ...defaultData.categories.filter((c) => !list.some((x) => String(x.id) === String(c.id)))]

export default function ShopDirectory({ settings, categories: homeCategories }) {
  const { t, tr } = useI18n()
  const [data, setData] = useState({ shops: directoryShops, zones: defaultZones, categories: withDefaultCategories(homeCategories) })
  const [params, setParams] = useSearchParams()
  const [now, setNow] = useState(nowMinutes)

  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const zone = params.get('zone') || ''
  const openOnly = params.get('open') === '1' // "เปิดอยู่ตอนนี้"
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
          categories: json.categories?.length ? withDefaultCategories(json.categories) : d.categories,
        }))
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])
  useEffect(() => setData((d) => ({ ...d, categories: withDefaultCategories(homeCategories) })), [homeCategories])

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
  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c])), [categories])
  const zoneName = (code) => zones.find((z) => z.code === code)?.name || (code ? t('โซน {code}', { code }) : '')

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

  // everything a search looks through, per shop (name, type, description, unit, zone, category)
  const haystack = useMemo(() => {
    const m = new Map()
    shops.forEach((s) =>
      m.set(s, [s.name, s.category_label, s.description, s.unit_no, zoneName(s.zone), cleanName(catById[s.category_id]?.name)].join(' ').toLowerCase()),
    )
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, catById, zones])
  const matches = (s, needle) => !needle || haystack.get(s)?.includes(needle)

  const needle = q.trim().toLowerCase()
  const results = useMemo(
    () =>
      shops.filter((s) => {
        if (zone && s.zone !== zone) return false
        if (cat && String(s.category_id) !== cat) return false
        if (openOnly && !isOpenNow(s.open_hours, now)) return false
        return matches(s, needle)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shops, needle, cat, zone, openOnly, now, haystack],
  )

  const openCount = shops.filter((s) => isOpenNow(s.open_hours, now)).length
  const filtered = Boolean(q || cat || zone || openOnly)
  const resetAll = () => setParams({}, { preventScrollReset: true })

  /* ---------- glide down to the category bar + shop list ---------- */
  const list = useRef(null)
  const glideToList = () => {
    const el = list.current
    if (!el) return
    const header = document.querySelector('header')?.offsetHeight || 64
    // where the bar sits in the page layout (offsetTop ignores the sections' slide-in animation,
    // which would otherwise make the glide stop a little too far down)
    let y = 0
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, y - header - 28), behavior: reduce ? 'auto' : 'smooth' })
  }
  /** start a new search with these URL filters (others cleared), then glide to the shops */
  const searchWith = (next) => {
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)), { preventScrollReset: true })
    glideToList()
  }

  /* ---------- suggestions under the search bar ---------- */
  const shopsIn = (key, value) => shops.filter((s) => String(s[key]) === String(value)).length
  const suggestGroups = useMemo(() => {
    if (!needle) return []
    const places = [
      ...shopCategories
        .filter((c) => cleanName(c.name).toLowerCase().includes(needle))
        .map((c) => ({
          key: `c${c.id}`,
          kind: 'cat',
          label: cleanName(c.name),
          sub: t('หมวดหมู่ · {n} ร้าน', { n: shopsIn('category_id', c.id) }),
          icon: CATEGORY_ICONS[c.icon],
          color: colorOf(c.id),
          run: () => searchWith({ cat: String(c.id) }),
        })),
      ...zones
        .filter((z) => zoneCounts[z.code] && `${z.name} ${z.code}`.toLowerCase().includes(needle))
        .map((z) => ({
          key: `z${z.code}`,
          kind: 'zone',
          label: zoneName(z.code),
          sub: t('โซน · {n} ร้าน', { n: zoneCounts[z.code] }),
          icon: MapPin,
          color: ZONE_COLORS[z.code] || '#138377',
          run: () => searchWith({ zone: z.code }),
        })),
    ].slice(0, 3)

    // shops: the ones the list shows, best matches first (name starts with → name has → unit → anything else)
    const rank = (s) => {
      const name = s.name.toLowerCase()
      return name.startsWith(needle) ? 0 : name.includes(needle) ? 1 : (s.unit_no || '').toLowerCase().includes(needle) ? 2 : 3
    }
    const top = [...results].sort((a, b) => rank(a) - rank(b)).slice(0, 5)
    const shopOptions = top.map((s) => {
      const category = catById[s.category_id]
      return {
        key: `s${s.id}`,
        kind: 'shop',
        label: s.name,
        sub: [cleanName(category?.name) || s.category_label, s.unit_no && t('ล็อก {u}', { u: s.unit_no })].filter(Boolean).join(' · '),
        logo: s.logo_url,
        icon: CATEGORY_ICONS[category?.icon],
        color: colorOf(s.category_id),
        open: isOpenNow(s.open_hours, now),
        run: () => setParam('shop', String(s.id)),
      }
    })

    // nothing here, but the same words find shops once the category / zone / "open now" filter is dropped
    const everywhere = shops.filter((s) => matches(s, needle)).length
    const wider =
      !results.length && everywhere
        ? [{ key: 'wide', kind: 'wide', label: t('ค้นหา “{q}” ในทุกหมวด', { q: q.trim() }), sub: t('{n} ร้าน', { n: everywhere }), icon: Search, color: '#ee5f14', run: () => searchWith({ q }) }]
        : []

    return [
      { title: t('หมวดหมู่และโซน'), options: places },
      { title: t('ร้านค้า'), options: [...shopOptions, ...wider] },
      { title: '', options: results.length ? [{ key: 'all', kind: 'all', count: results.length, run: glideToList }] : [] },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needle, results, shops, shopCategories, zones, zoneCounts, catById, now, t])

  // example words that type themselves in the empty search box – only ones that find a shop
  const typingWords = useMemo(
    () => TYPING_WORDS.map((w) => t(w)).filter((w) => shops.some((s) => matches(s, w.toLowerCase()))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shops, haystack, t],
  )

  /* ---------- "ยอดนิยม" chips ---------- */
  const popular = POPULAR.map((p) => {
    const words = p.q && t(p.q)
    const on = p.set?.open ? openOnly : p.set?.zone ? zone === p.set.zone : q.trim() === words
    const count = shops.filter(
      (s) => (!p.set?.zone || s.zone === p.set.zone) && (!p.set?.open || isOpenNow(s.open_hours, now)) && matches(s, words?.toLowerCase()),
    ).length
    return { ...p, on, count, run: () => (on ? setParam(p.set ? Object.keys(p.set)[0] : 'q', '') : searchWith(words ? { q: words } : p.set)) }
  }).filter((p) => p.count)

  // a zone picked on the map filters the list (the old ?building= param is dropped)
  const selectZone = (code) => setParam('zone', code, { building: '' })

  // "ดูร้านเพิ่มเติม": show STEP cards, then STEP more per press; a new filter / search starts again
  const [visible, setVisible] = useState(STEP)
  useEffect(() => setVisible(STEP), [q, cat, zone, openOnly])
  const shown = results.slice(0, visible)
  const remaining = results.length - shown.length

  const selected = shops.find((s) => String(s.id) === shopId)

  // Opened already filtered or with a shop picked (the home page topic panels, a shared link):
  // after a moment glide down past the banner and the map to the category bar, so the shops are in view.
  // Only when the page opens – changing filters here keeps the page where it is.
  useEffect(() => {
    if (!(cat || zone || q || openOnly || shopId)) return
    let cancelled = false // the visitor scrolls / taps first → leave the page where they put it
    const stop = () => (cancelled = true)
    const events = ['wheel', 'touchstart', 'keydown']
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))
    const timer = setTimeout(() => !cancelled && glideToList(), 250) // after the page-change animation
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* ================= hero (home banner image) + title / search card, hanging from the banner like the home page =================
          everything centred: title on top, a wide search bar (the main thing people come here for), the numbers below */}
      <PageHero settings={settings} overlap={false}>
        <div className="flex flex-col items-center py-3 text-center sm:py-4">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <SmartLink href="/" className="hover:text-brand-700">
              {t('หน้าแรก')}
            </SmartLink>
            <span>/</span>
            <span className="font-medium text-brand-700">{t('Shop Directory')}</span>
          </nav>
          <h1 className="mt-0.5 font-head text-[26px] font-black leading-tight tracking-[-0.01em] text-brand-700 sm:text-[32px]">{t('Shop Directory')}</h1>
          <p className="mt-0.5 text-[12.5px] text-[#4d5f5c]">
            {t('ค้นหาร้านค้า ร้านอาหาร และบริการทั้งหมดใน {place} ได้ในที่เดียว', { place: tr(settings.address_title) || settings.site_name })}
          </p>

          <div className="mt-3.5 w-full max-w-[640px]">
            <SearchBox
              value={q}
              onChange={(v) => setParam('q', v)}
              onSubmit={glideToList}
              groups={suggestGroups}
              needle={needle}
              hints={typingWords}
              emptyText={t('ไม่พบร้านที่ตรงกับ “{q}” ลองพิมพ์ชื่อร้าน หมวดหมู่ หรือเลขล็อก', { q: q.trim() })}
            />

            {/* "ยอดนิยม" one-tap searches – one scrolling row on phones */}
            {popular.length > 0 && (
              <div className="-mx-4 mt-3 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                <div className="mx-auto flex w-max items-center gap-1.5 sm:flex-wrap sm:justify-center">
                  <span className="mr-1 text-[12px] font-medium text-[#98a3a1]">{t('ยอดนิยม')}</span>
                  {popular.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={p.run}
                      aria-pressed={p.on}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] transition duration-200 ${
                        p.on
                          ? 'border-[#ffc9a3] bg-[#fff1e6] font-semibold text-[#d2560f]'
                          : 'border-[#e3ecea] bg-white text-[#4d5f5c] hover:-translate-y-px hover:border-[#ffc9a3] hover:text-[#d2560f]'
                      }`}
                    >
                      {p.live && <span className="size-1.5 rounded-full bg-[#1fb36b]" />}
                      {t(p.label)}
                      {p.on && <X className="size-3" strokeWidth={2.6} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-1 text-[12px] text-[#4d5f5c]">
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{shops.length}</b> {t('ร้านค้า')}
              </span>
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{shopCategories.length}</b> {t('หมวดหมู่')}
              </span>
              <span>
                <b className="text-[15px] font-extrabold text-brand-700">{zones.length}</b> {t('โซน')}
              </span>
              {/* only when shops have opening hours */}
              {shops.some((s) => s.open_hours) && (
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#1fb36b]" />
                  <span>
                    <b className="text-[15px] font-extrabold text-[#13804f]">{openCount}</b> {t('ร้านเปิดอยู่ตอนนี้')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </PageHero>


      <section className="container-bm pb-16 pt-6">
        {/* ================= market map (3D plan from CAD) ================= */}
        <MarketMap zones={zones} counts={zoneCounts} selected={zone} onSelect={selectZone} />

        {/* ================= category icons (the page glides here when opened with a filter) ================= */}
        <div ref={list} className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            {openOnly && (
              <button
                type="button"
                onClick={() => setParam('open', '')}
                className="flex items-center gap-1.5 rounded-full bg-[#13804f] px-2.5 py-1 text-white"
              >
                <span className="size-1.5 rounded-full bg-[#7ff0b4]" /> {t('เปิดอยู่ตอนนี้')} <X className="size-3" />
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
                  onOpen={() => setParam('shop', String(s.id))}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2.5">
            {remaining > 0 && (
              <LoadMoreButton
                next={results.slice(visible, visible + 3)}
                remaining={remaining}
                catById={catById}
                colorOf={colorOf}
                onClick={() => setVisible((v) => v + STEP)}
              />
            )}
            <ShownProgress shown={shown.length} total={results.length} />
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

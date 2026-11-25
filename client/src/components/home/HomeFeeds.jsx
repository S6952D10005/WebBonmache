import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, Phone, Store, X } from 'lucide-react'
import SmartLink from '../SmartLink'
import { SmartImage } from '../Decor'
import { useI18n } from '../../i18n'

/* ======================================================================== */
/*  Section title used on the home page:                                   */
/*  small orange eyebrow · big title · thin line · "ดูทั้งหมด →"           */
/*  (the link: plain text with an underline – turns orange, arrow slides)   */
/* ======================================================================== */
export function HomeTitle({ eyebrow, title, href, linkLabel, children }) {
  const { t } = useI18n()
  return (
    <div className="mb-6 flex items-end gap-4 lg:mb-7">
      <div className="min-w-0">
        {eyebrow && <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#f37021]">{eyebrow}</p>}
        <h2 className="mt-1 text-[24px] font-extrabold leading-tight text-brand-800 sm:text-[28px]">{title}</h2>
      </div>
      <span aria-hidden="true" className="mb-3 hidden h-px flex-1 bg-gradient-to-r from-[#dfe7e5] to-transparent sm:block" />
      {children}
      {href && (
        <SmartLink
          href={href}
          className="group mb-1.5 ml-auto inline-flex shrink-0 items-center gap-1 border-b border-brand-700 pb-0.5 text-[12px] font-bold text-brand-700 transition hover:border-[#f37021] hover:text-[#f37021] sm:ml-0"
        >
          {linkLabel || t('ดูทั้งหมด')}
          <ArrowRight className="size-3.5 transition duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
        </SmartLink>
      )}
    </div>
  )
}

const DateLine = ({ children }) => (
  <span className="flex items-center gap-1.5 text-[12px] text-muted">
    <CalendarDays className="size-3.5 shrink-0 text-brand-500" strokeWidth={2.2} />
    {children}
  </span>
)

/* home card sections show 4 cards at most (no "ดูทั้งหมด", no paging) */
export const CARDS_MAX = 4

/* ======================================================================== */
/*  Popup used by the home cards (events · food stories):                   */
/*  centred on desktop, a sheet from the bottom on phones;                  */
/*  ✕ / Esc / a click on the dark backdrop closes it.                       */
/*  side = photo on the left, text on the right (from tablet up) – wider    */
/*  and shorter, so the whole story is read without scrolling.              */
/* ======================================================================== */
function HomePopup({ label, image, imageClass = '', accent, side = false, onClose, children }) {
  const { t } = useI18n()
  useEffect(() => {
    const onKey = (ev) => ev.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#062b28]/60 backdrop-blur-[2px] motion-safe:animate-[reveal-fade_.2s_ease-out] sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(ev) => ev.stopPropagation()}
        className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl [scrollbar-width:thin] sm:rounded-3xl ${
          side
            ? 'sm:max-w-[620px] md:grid md:max-h-none md:max-w-[940px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:overflow-hidden lg:max-w-[1180px] lg:grid-cols-2'
            : 'sm:max-w-[620px]'
        }`}
        style={accent ? { '--c': accent } : undefined}
      >
        <div className={`relative bg-[#eef3f2] ${side ? 'overflow-hidden md:min-h-[480px] lg:min-h-[min(620px,86dvh)]' : ''}`}>
          {/* side layout: a soft blurred copy fills behind the picture, so a poster shown whole (object-contain) has no grey bands */}
          {side && image && (
            <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-90 blur-2xl saturate-150" />
          )}
          <SmartImage
            src={image}
            alt={label}
            className={`aspect-[3/2] w-full ${side ? 'relative md:absolute md:inset-0 md:aspect-auto md:h-full' : ''} ${imageClass}`}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('ปิด')}
          autoFocus
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-black/5 transition hover:bg-white hover:text-brand-700"
        >
          <X className="size-5" />
        </button>
        <div className={`px-6 pb-7 pt-5 sm:px-8 ${side ? 'md:max-h-[88dvh] md:overflow-y-auto md:py-8 md:pl-8 md:pr-9 md:[scrollbar-width:thin] lg:px-11 lg:py-11 lg:[&_h2]:text-[28px] lg:[&_.popup-text]:text-[15.5px]' : ''}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ======================================================================== */
/*  Happening – 4 tall poster cards (2 per row on tablet / phone)           */
/* ======================================================================== */
export function Happening({ items = [] }) {
  const { t } = useI18n()
  return (
    <section id="happening" className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Happening" title={t('ไฮไลต์ที่ไม่ควรพลาด')} />

      {/* desktop: 4 cards up to 250px wide, close together (20px apart) and centred */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-[repeat(4,minmax(0,250px))] lg:justify-center">
        {items.slice(0, CARDS_MAX).map((h) => (
          // hover colour = the tag's colour (--c, from homeData): lift, glow, ring, title
          <SmartLink key={h.id} href={h.url} className="group" style={{ '--c': h.color || '#ec1c8c' }}>
            {/* poster-style card: dark glass tag, light sweep + glow in the tag colour on hover */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#1b1416] ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_40px_-20px_color-mix(in_srgb,var(--c)_80%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--c)_55%,transparent)]">
              <SmartImage src={h.image} alt={h.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/35 py-1 pl-2 pr-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-[var(--c)] shadow-[0_0_8px_var(--c)]" />
                {h.tag}
              </span>
            </div>
            <h3 className="mt-3.5 line-clamp-2 text-[15.5px] font-extrabold leading-snug tracking-[-0.01em] text-ink transition group-hover:text-[var(--c)]">{h.title}</h3>
            {/* date: gradient line + gradient text (no calendar icon) */}
            <p className="mt-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.06em]">
              <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] transition-all duration-500 group-hover:w-9" />
              <span className="bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] bg-clip-text text-transparent">{h.date}</span>
            </p>
            {/* place: pink pin + venue, right under the date */}
            {h.place && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-semibold leading-snug text-muted transition group-hover:text-[#3d5552]">
                <MapPin className="mt-px size-3.5 shrink-0 text-[#ec1c8c]" strokeWidth={2.2} />
                <span className="line-clamp-1">{h.place}</span>
              </p>
            )}
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  Food stories – magazine layout:                                         */
/*  the first story big (photo full-bleed, text on a dark fade) and the     */
/*  next 4 as a list beside it (thumb · tag · title · shop logo + booth).   */
/*  Phone: big story, then the list · tablet: list in 2 columns.            */
/*  Click a story = popup promoting the shop (zone · hours · phone · menu). */
/* ======================================================================== */
const STORY_LIST_MAX = 4

/** shop logo (round) + shop name + booth */
function StoryShop({ a, light = false }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 text-[12px] font-semibold ${light ? 'text-white/85' : 'text-muted'}`}>
      {a.logo && (
        <img
          src={a.logo}
          alt=""
          loading="lazy"
          className={`shrink-0 rounded-full bg-white object-cover ${light ? 'size-9 ring-2 ring-white/70' : 'size-6 ring-1 ring-black/10'}`}
        />
      )}
      <span className={`truncate ${light ? 'text-[13.5px] font-bold text-white' : 'text-[#3d5552]'}`}>{a.shop}</span>
      {a.place && (
        <span className="flex shrink-0 items-center gap-1">
          <MapPin className={`size-3.5 ${light ? 'text-[#ffb27a]' : 'text-[#f37021]'}`} strokeWidth={2.2} />
          {a.place}
        </span>
      )}
    </span>
  )
}

const StoryTag = ({ children, glass = false }) =>
  glass ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 py-1 pl-2 pr-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur-md">
      <span className="size-1.5 rounded-full bg-[#f37021] shadow-[0_0_8px_#f37021]" />
      {children}
    </span>
  ) : (
    <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#f37021]">{children}</span>
  )

/** story popup: photo · tag · headline · shop · info box (where / hours / phone) · recommended menu · about the shop */
function StoryDialog({ a, onClose }) {
  const { t } = useI18n()
  const tel = a.phone?.split(',')[0].replace(/[^\d+]/g, '')
  const rows = [
    [MapPin, t('ที่ตั้ง'), [a.zone, a.place].filter(Boolean).join(' · ')],
    [Clock3, t('เวลาเปิด-ปิด'), a.hours],
    [Phone, t('โทร'), a.phone],
  ].filter(([, , value]) => value)
  return (
    <HomePopup label={a.title} image={a.image} imageClass="object-cover" accent="#f37021" side onClose={onClose}>
      {a.tag && <StoryTag>{a.tag}</StoryTag>}
      <h2 className="mt-1.5 pr-8 text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-[24px]">{a.title}</h2>

      {/* the shop */}
      <div className="mt-4 flex items-center gap-3">
        {a.logo ? (
          <img src={a.logo} alt="" className="size-12 shrink-0 rounded-full bg-white object-cover ring-1 ring-black/10" />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#fff1e6] text-[#f37021]">
            <Store className="size-5" strokeWidth={2.2} />
          </span>
        )}
        <p className="min-w-0 text-[16px] font-bold leading-snug text-ink">{a.shop}</p>
      </div>

      {rows.length > 0 && (
        <dl className="mt-4 divide-y divide-[#edf2f1] rounded-2xl border border-[#e6eeec] bg-[#f8fbfa] text-[13.5px]">
          {rows.map(([Icon, label, value]) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-[#f37021]" strokeWidth={2.2} />
              <dt className="w-[92px] shrink-0 text-muted">{label}</dt>
              <dd className="min-w-0 font-semibold text-[#3d5552]">
                {label === t('โทร') && tel ? (
                  <a href={`tel:${tel}`} className="transition hover:text-brand-700">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {a.menu?.length > 0 && (
        <div className="mt-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f37021]">{t('เมนูแนะนำ')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {a.menu.map((m) => (
              <span key={m} className="rounded-full bg-[#fff1e6] px-3 py-1 text-[13px] font-semibold text-[#b5530f]">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {a.detail && <p className="popup-text mt-5 whitespace-pre-line text-[14.5px] leading-[1.75] text-[#4d5f5c]">{a.detail}</p>}
    </HomePopup>
  )
}

export function FoodArticles({ items = [] }) {
  const { t } = useI18n()
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  const [lead, ...rest] = items
  if (!lead) return null
  const opened = items.find((a) => a.id === openId)
  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Food stories" title={t('เรื่องอร่อยในบองมาร์เช่')} />
      {/* at least 440px tall on desktop, but grows with the list (long titles wrap) instead of spilling into the next section */}
      <div className="grid gap-4 lg:min-h-[440px] lg:grid-cols-12 lg:gap-5">
        {/* big story */}
        <button
          type="button"
          onClick={() => setOpenId(lead.id)}
          aria-haspopup="dialog"
          className="group relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[20px] bg-[#13201e] text-left ring-1 ring-black/5 transition duration-500 hover:shadow-[0_28px_50px_-28px_rgb(0_0_0/0.7)] sm:min-h-[380px] lg:col-span-7 lg:min-h-0"
        >
          <SmartImage src={lead.image} alt={lead.title} className="absolute inset-0 -z-10 h-full w-full transition duration-700 group-hover:scale-105" />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/0" />
          {lead.tag && (
            <span className="absolute left-4 top-4 sm:left-5 sm:top-5">
              <StoryTag glass>{lead.tag}</StoryTag>
            </span>
          )}
          <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-[#f37021] group-hover:ring-[#f37021] sm:right-5 sm:top-5">
            <ArrowUpRight className="size-5" strokeWidth={2.4} />
          </span>
          <span className="block p-5 sm:p-6">
            <StoryShop a={lead} light />
            <span className="mt-3 line-clamp-2 block text-[20px] font-extrabold leading-tight tracking-[-0.01em] text-white sm:text-[24px]">{lead.title}</span>
            {lead.excerpt && <span className="mt-2 line-clamp-2 block max-w-[56ch] text-[13.5px] leading-relaxed text-white/80">{lead.excerpt}</span>}
            {lead.date && (
              <span className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
                <CalendarDays className="size-3.5" strokeWidth={2.2} />
                {lead.date}
              </span>
            )}
          </span>
        </button>

        {/* the rest – one compact row each: thumb, then tag · title · shop · booth · date */}
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:grid-rows-4">
          {rest.slice(0, STORY_LIST_MAX).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              aria-haspopup="dialog"
              className="group flex min-h-0 items-center gap-3 rounded-[16px] border border-[#e6eeec] bg-white p-2 pr-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-card"
            >
              <span className="relative block size-[84px] shrink-0 overflow-hidden rounded-[12px]">
                <SmartImage src={a.image} alt={a.title} className="h-full w-full transition duration-700 group-hover:scale-110" />
              </span>
              <span className="block min-w-0 flex-1">
                {a.tag && <StoryTag>{a.tag}</StoryTag>}
                <span className="mt-0.5 line-clamp-2 block text-[14px] font-bold leading-snug text-ink transition group-hover:text-brand-700">{a.title}</span>
                <span className="mt-1.5 flex min-w-0 items-center gap-3">
                  <StoryShop a={a} />
                  {a.date && (
                    <span className="hidden shrink-0 items-center gap-1 text-[12px] text-muted sm:flex">
                      <CalendarDays className="size-3.5 text-brand-500" strokeWidth={2.2} />
                      {a.date}
                    </span>
                  )}
                </span>
                {/* phone: date on its own line (no room beside the shop) */}
                {a.date && (
                  <span className="mt-1 flex items-center gap-1 text-[12px] text-muted sm:hidden">
                    <CalendarDays className="size-3.5 text-brand-500" strokeWidth={2.2} />
                    {a.date}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      {opened && <StoryDialog a={opened} onClose={close} />}
    </section>
  )
}

/* ======================================================================== */
/*  Food brand ร้านดัง – logos sliding by on their own (stops on hover)    */
/* ======================================================================== */
export function FoodBrands({ items = [] }) {
  const { t } = useI18n()
  // one half = the brands repeated until it is wider than any screen (~2600px at ~128px a tile + gap),
  // then two identical halves → the strip runs on forever with no empty gap
  const reps = Math.max(1, Math.ceil(2600 / (Math.max(items.length, 1) * 128)))
  const half = Array.from({ length: reps }, () => items).flat()
  const loop = [...half, ...half]
  const seconds = Math.max(20, half.length * 4.2) // same speed however many copies
  return (
    <section className="pt-16 lg:pt-20">
      <div className="container-bm">
        <HomeTitle eyebrow="Famous brands" title={t('ร้านดังในบองมาร์เช่')} />
      </div>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        {/* the logos as same-size square tiles, close together – a wide logo (Shaho Roti, Sriya…) sits centred
            on white inside its tile, so the row stays even. The space is padding on each tile (not a flex gap)
            so both halves are exactly the same width and the loop never jumps. */}
        <div className="flex w-max items-center py-5 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]" style={{ animationDuration: `${seconds}s` }}>
          {loop.map((b, i) => (
            <SmartLink
              key={`${b.id}-${i}`}
              href={b.url}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : undefined}
              title={b.name}
              className="group/logo block shrink-0 pr-3 sm:pr-4"
            >
              <span className="block size-[96px] overflow-hidden rounded-[20px] bg-white shadow-[0_6px_18px_-10px_rgb(6_43_40/0.35)] ring-1 ring-black/[0.06] transition duration-300 group-hover/logo:-translate-y-1.5 group-hover/logo:shadow-[0_16px_30px_-14px_rgb(6_43_40/0.45)] group-hover/logo:ring-[#f37021]/40 sm:size-[112px]">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <span className="grid h-full place-items-center px-2 text-center text-[14px] font-extrabold leading-tight text-white" style={{ backgroundColor: b.color }}>
                    {b.name}
                  </span>
                )}
              </span>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  All events – 4 poster cards. Nothing is printed on the poster (it has   */
/*  its own date); under it: status · title · date with weekday · place.    */
/* ======================================================================== */
const DAY_MS = 86400000
const LOCALE = { th: 'th-TH', en: 'en-GB', zh: 'zh-CN' }
const toDate = (iso) => new Date(`${iso}T00:00:00`)

/** "อา. 22 – จ. 23 พ.ย. 2569" / "Sun 22 – Mon 23 Nov 2026" (weekday on every day shown) */
function formatRange(start, end, lang) {
  if (!start) return ''
  const fmt = (d, o) => new Intl.DateTimeFormat(LOCALE[lang] || 'th-TH', o).format(d)
  const a = toDate(start)
  const b = toDate(end || start)
  const full = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
  if (+a === +b) return fmt(a, full)
  const sameYear = a.getFullYear() === b.getFullYear()
  const sameMonth = sameYear && a.getMonth() === b.getMonth()
  const left = fmt(a, sameMonth ? { weekday: 'short', day: 'numeric' } : sameYear ? { weekday: 'short', day: 'numeric', month: 'short' } : full)
  return `${left} – ${fmt(b, full)}`
}

/*
 * Event status – words + colours
 *   กำลังจะมาถึง (teal)  · before the first day, with "อีก N วัน" / "พรุ่งนี้"
 *   กำลังจัดงาน (green, pulsing dot) · between the first and last day
 *   จบแล้ว      (grey)  · after the last day – poster stays in full colour
 *   เลื่อนจัด   (amber) · status: 'postponed' – old date struck through, new date shown
 *   ยกเลิก      (red)   · status: 'cancelled' – poster grey, date struck through
 */
const EVENT_STATUS = {
  upcoming: { label: 'กำลังจะมาถึง', color: '#138377' },
  ongoing: { label: 'กำลังจัดงาน', color: '#16a34a', pulse: true },
  ended: { label: 'จบแล้ว', color: '#7a8785' },
  postponed: { label: 'เลื่อนจัด', color: '#d97706' },
  cancelled: { label: 'ยกเลิก', color: '#e5484d' },
}

function eventState(e, today) {
  if (e.status === 'cancelled') return { key: 'cancelled' }
  if (!e.start) return { key: e.status === 'postponed' ? 'postponed' : 'upcoming' }
  const start = toDate(e.start)
  const end = toDate(e.end || e.start)
  const days = Math.round((start - today) / DAY_MS)
  if (today > end) return { key: 'ended' }
  if (today >= start) return { key: e.status === 'postponed' ? 'postponed' : 'ongoing', lastDay: +today === +end }
  return { key: e.status === 'postponed' ? 'postponed' : 'upcoming', days }
}

/** everything a card / the popup needs about one event: status, colours, date text, countdown */
function eventView(e, today, t, lang) {
  const st = eventState(e, today)
  const look = EVENT_STATUS[st.key]
  const date = formatRange(e.start, e.end, lang) || e.date
  // small line next to the status: countdown / last day
  const extra =
    st.key === 'upcoming' && st.days === 1
      ? t('พรุ่งนี้')
      : (st.key === 'upcoming' || st.key === 'postponed') && st.days > 0
        ? t('อีก {n} วัน', { n: st.days })
        : st.key === 'ongoing' && st.lastDay
          ? t('วันนี้วันสุดท้าย')
          : ''
  return { st, look, date, extra, off: st.key === 'cancelled' } // only a cancelled banner turns grey (ended ones stay normal)
}

function EventStatus({ v }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold"
        style={{ color: v.look.color, backgroundColor: `color-mix(in srgb, ${v.look.color} 12%, white)` }}
      >
        <span className="relative grid size-1.5 place-items-center">
          {v.look.pulse && <span className="absolute size-full animate-ping rounded-full" style={{ backgroundColor: v.look.color }} />}
          <span className="relative size-1.5 rounded-full" style={{ backgroundColor: v.look.color }} />
        </span>
        {t(v.look.label)}
      </span>
      {v.extra && <span className="text-[11.5px] font-semibold text-muted">{v.extra}</span>}
    </div>
  )
}

/** date (postponed: old date struck through above the new one) · time · place */
function EventLines({ e, v, big = false }) {
  const { t, lang } = useI18n()
  const gone = v.st.key === 'cancelled'
  const row = `flex items-start gap-1.5 ${big ? 'gap-2.5 text-[14px]' : ''}`
  const icon = `${big ? 'mt-[3px] size-4' : 'mt-px size-3.5'} shrink-0`
  const tint = { color: gone ? undefined : v.look.color }
  return (
    <div className={big ? 'space-y-2.5 font-semibold' : 'space-y-0.5 text-[12px] font-semibold'}>
      {v.st.key === 'postponed' && e.was && (
        <p className={`${row} text-[#9aa5a3]`}>
          <CalendarDays className={icon} strokeWidth={2.2} />
          <span className="line-through">{formatRange(e.was.start, e.was.end, lang)}</span>
        </p>
      )}
      <p className={`${row} ${gone ? 'text-[#9aa5a3]' : 'text-[#3d5552]'}`}>
        <CalendarDays className={icon} strokeWidth={2.2} style={tint} />
        <span className={gone ? 'line-through' : ''}>{v.st.key === 'postponed' && e.was ? `${t('เลื่อนเป็น')} ${v.date}` : v.date}</span>
      </p>
      {e.time && (
        <p className={`${row} ${gone ? 'text-[#9aa5a3]' : 'text-[#3d5552]'}`}>
          <Clock3 className={icon} strokeWidth={2.2} style={tint} />
          {e.time}
        </p>
      )}
      {e.place && (
        <p className={`${row} text-muted`}>
          <MapPin className={`${icon} text-[#ec1c8c]`} strokeWidth={2.2} />
          <span className={big ? '' : 'line-clamp-1'}>{e.place}</span>
        </p>
      )}
    </div>
  )
}

/** event popup: the whole banner + status, title, date · time · place and the details */
function EventDialog({ e, v, onClose }) {
  return (
    <HomePopup label={e.title} image={e.image} imageClass={`!object-contain ${v.off ? 'opacity-75 grayscale' : ''}`} accent={v.look.color} side onClose={onClose}>
      <EventStatus v={v} />
      <h2 className={`mt-2.5 pr-8 text-[22px] font-extrabold leading-tight tracking-[-0.01em] sm:text-[26px] ${v.off ? 'text-[#7a8785]' : 'text-ink'}`}>{e.title}</h2>
      <div className="mt-4 rounded-2xl border border-[#e6eeec] bg-[#f8fbfa] px-4 py-3.5">
        <EventLines e={e} v={v} big />
      </div>
      {e.detail && <p className="popup-text mt-5 whitespace-pre-line text-[14.5px] leading-[1.75] text-[#4d5f5c]">{e.detail}</p>}
    </HomePopup>
  )
}

export function Events({ items = [] }) {
  const { t, lang } = useI18n()
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const shown = items.slice(0, CARDS_MAX)
  const opened = shown.find((e) => e.id === openId)
  return (
    <section id="events" className="container-bm scroll-mt-24 pt-16 lg:pt-20">
      <HomeTitle eyebrow="All events" title={t('กิจกรรมทั้งหมด')} />
      {/* landscape banners: 4 across the full width on desktop, 2 on tablet, 1 on phone · click = popup with the details */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((e) => {
          const v = eventView(e, today, t, lang)
          return (
            // hover colour = the card's status colour (--c): glow under the banner, ring, title
            <button
              key={e.id}
              type="button"
              onClick={() => setOpenId(e.id)}
              aria-haspopup="dialog"
              className="group block w-full text-left"
              style={{ '--c': v.look.color }}
            >
              {/* banner only – no date / labels on top of it (the banner has its own); shown whole, never cropped */}
              <span className="relative block aspect-[3/2] overflow-hidden rounded-[18px] bg-[#eef3f2] ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_40px_-20px_color-mix(in_srgb,var(--c)_80%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--c)_55%,transparent)]">
                <SmartImage
                  src={e.image}
                  alt={e.title}
                  className={`h-full w-full !object-contain transition duration-700 group-hover:scale-105 ${v.off ? 'opacity-75 grayscale group-hover:opacity-90' : ''}`}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                />
              </span>

              <span className="mt-3.5 block">
                <EventStatus v={v} />
              </span>

              <span
                className={`mt-2 line-clamp-2 block text-[15.5px] font-extrabold leading-snug tracking-[-0.01em] transition group-hover:text-[var(--c)] ${
                  v.off ? 'text-[#7a8785]' : 'text-ink'
                }`}
              >
                {e.title}
              </span>

              <span className="mt-2 block">
                <EventLines e={e} v={v} />
              </span>
            </button>
          )
        })}
      </div>
      {opened && <EventDialog e={opened} v={eventView(opened, today, t, lang)} onClose={close} />}
    </section>
  )
}

/* ======================================================================== */
/*  News – one big story + the next ones as a list                          */
/* ======================================================================== */
const NEWS_HOME_MAX = 3

/** news popup (same shell as events · food stories): the whole picture + tag, headline, date and the full story */
export function NewsDialog({ n, onClose }) {
  return (
    <HomePopup label={n.title} image={n.image} imageClass="!object-contain" accent="#0d7a6f" side onClose={onClose}>
      {n.tag && <StoryTag>{n.tag}</StoryTag>}
      <h2 className="mt-1.5 pr-8 text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-[24px]">{n.title}</h2>
      {n.date && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <CalendarDays className="size-4 text-brand-500" strokeWidth={2.2} />
          {n.date}
        </p>
      )}
      {n.detail && <p className="popup-text mt-4 whitespace-pre-line border-t border-[#edf2f1] pt-4 text-[14.5px] leading-[1.75] text-[#4d5f5c]">{n.detail}</p>}
    </HomePopup>
  )
}

export function News({ items = [] }) {
  const { t } = useI18n()
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  // home page: the 3 newest only – the rest are on the all-news page (/news)
  const [first, ...rest] = items.slice(0, NEWS_HOME_MAX)
  if (!first) return null
  const opened = items.find((n) => n.id === openId)
  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="News" title={t('ข่าวสารบองมาร์เช่')} href="/news" linkLabel={t('ดูข่าวทั้งหมด')} />
      <div className="grid gap-5 lg:grid-cols-[7fr_5fr]">
        <button
          type="button"
          onClick={() => setOpenId(first.id)}
          aria-haspopup="dialog"
          className="group relative block overflow-hidden rounded-[20px] bg-brand-900 text-left"
        >
          <span className="block aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px]">
            <SmartImage src={first.image} alt={first.title} className="h-full w-full opacity-90 transition duration-700 group-hover:scale-105" />
          </span>
          {/* dark fade over the lower half – news pictures often carry their own caption, so it has to sit under ours */}
          <span className="absolute inset-0 bg-gradient-to-t from-[#06302c] from-15% via-[#06302c]/80 via-45% to-transparent to-80%" />
          <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-[#f37021] group-hover:ring-[#f37021]">
            <ArrowUpRight className="size-5" strokeWidth={2.4} />
          </span>
          <span className="absolute inset-x-0 bottom-0 block p-5 sm:p-6">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f37021] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-white">{t('ข่าวล่าสุด')}</span>
              {first.tag && <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">{first.tag}</span>}
            </span>
            <span className="mt-2.5 block text-[18px] font-extrabold leading-snug text-white sm:text-[22px]">{first.title}</span>
            {first.excerpt && <span className="mt-1.5 line-clamp-2 block max-w-[60ch] text-[13.5px] leading-relaxed text-white/80">{first.excerpt}</span>}
            <span className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
              <CalendarDays className="size-3.5" strokeWidth={2.2} />
              {first.date}
            </span>
          </span>
        </button>
        {/* the small stories share the big story's height (no empty gap below them) */}
        <div className="flex flex-col gap-4">
          {rest.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setOpenId(n.id)}
              aria-haspopup="dialog"
              className="group flex flex-1 items-center gap-4 rounded-[18px] border border-[#e6eeec] bg-white p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-card"
            >
              <span className="block aspect-[4/3] w-[38%] shrink-0 self-stretch overflow-hidden rounded-[12px] lg:aspect-auto">
                <SmartImage src={n.image} alt={n.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              </span>
              <span className="flex min-w-0 flex-col justify-center py-1 pr-1">
                {n.tag && <StoryTag>{n.tag}</StoryTag>}
                <span className="mt-1 line-clamp-2 block text-[14.5px] font-bold leading-snug text-ink transition group-hover:text-brand-700">{n.title}</span>
                {/* short details – the full story is in the popup */}
                {n.excerpt && <span className="mt-1.5 line-clamp-2 block text-[12.5px] leading-relaxed text-[#5d6f6c]">{n.excerpt}</span>}
                <span className="mt-2.5 flex items-center justify-between gap-3">
                  <DateLine>{n.date}</DateLine>
                  <span className="flex shrink-0 items-center gap-1 text-[12px] font-bold text-brand-700">
                    {t('อ่านต่อ')}
                    <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={2.6} />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {opened && <NewsDialog n={opened} onClose={close} />}
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'
import SmartLink from '../SmartLink'
import { SmartImage } from '../Decor'
import { useI18n } from '../../i18n'

/* ======================================================================== */
/*  Section title used on the home page:                                   */
/*  small orange eyebrow · big title · thin line · "ดูทั้งหมด ↗"           */
/* ======================================================================== */
export function HomeTitle({ eyebrow, title, href, children }) {
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
          className="group mb-1 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d9e4e1] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-brand-700 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:ml-0"
        >
          {t('ดูทั้งหมด')}
          <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={2.6} />
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

/* ======================================================================== */
/*  Happening – row of tall cards, slides sideways with the arrow buttons   */
/* ======================================================================== */
export function Happening({ items = [] }) {
  const { t } = useI18n()
  const row = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  useEffect(() => {
    const el = row.current
    if (!el) return
    const check = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [items.length])

  const slide = (dir) => {
    const el = row.current
    const card = el?.firstElementChild
    if (!card) return
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' })
  }

  return (
    <section id="happening" className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Happening" title={t('ไฮไลต์ที่ไม่ควรพลาด')} href="#events">
        <div className="mb-1 hidden gap-1.5 sm:flex">
          {[
            [ChevronLeft, t('ก่อนหน้า'), -1, edge.start],
            [ChevronRight, t('ถัดไป'), 1, edge.end],
          ].map(([Icon, label, dir, off]) => (
            <button
              key={label}
              type="button"
              onClick={() => slide(dir)}
              aria-label={label}
              className={`grid size-9 place-items-center rounded-full border border-[#d9e4e1] text-brand-800 transition ${
                off ? 'opacity-35' : 'hover:border-brand-600 hover:bg-brand-600 hover:text-white'
              }`}
            >
              <Icon className="size-4" strokeWidth={2.4} />
            </button>
          ))}
        </div>
      </HomeTitle>

      {/* exactly 4 cards side by side on desktop (2 on tablet) – no half card at the edge; the arrows page through the rest */}
      <div ref={row} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none]">
        {items.map((h) => (
          <SmartLink key={h.id} href={h.url} className="group w-[72%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-60px)/4)]">
            {/* poster-style card: dark glass tag, light sweep + pink→orange glow on hover */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#1b1416] ring-1 ring-black/5 transition duration-500 group-hover:shadow-[0_22px_40px_-22px_rgb(236_28_140/0.75)]">
              <SmartImage src={h.image} alt={h.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/35 py-1 pl-2 pr-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] shadow-[0_0_8px_#ec1c8c]" />
                {h.tag}
              </span>
            </div>
            <h3 className="mt-3.5 line-clamp-2 text-[15.5px] font-extrabold leading-snug tracking-[-0.01em] text-ink transition group-hover:text-[#ec1c8c]">{h.title}</h3>
            {/* date: gradient line + gradient text (no calendar icon) */}
            <p className="mt-2 flex items-center gap-2 text-[12px] font-bold tracking-[0.06em]">
              <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] transition-all duration-500 group-hover:w-9" />
              <span className="bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] bg-clip-text text-transparent">{h.date}</span>
            </p>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  Food article – three story cards                                        */
/* ======================================================================== */
export function FoodArticles({ items = [] }) {
  const { t } = useI18n()
  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Food stories" title={t('เรื่องอร่อยในบองมาร์เช่')} href="#" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((a) => (
          <SmartLink key={a.id} href={a.url} className="group overflow-hidden rounded-[18px] border border-[#e6eeec] bg-white transition hover:-translate-y-1 hover:shadow-card">
            <div className="aspect-[16/10] overflow-hidden">
              <SmartImage src={a.image} alt={a.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
            </div>
            <div className="px-5 pb-5 pt-4">
              <h3 className="line-clamp-2 min-h-[2.6em] text-[15.5px] font-bold leading-snug text-ink transition group-hover:text-brand-700">{a.title}</h3>
              <div className="mt-3 flex items-center gap-4">
                <DateLine>{a.date}</DateLine>
                <span className="flex items-center gap-1.5 text-[12px] text-muted">
                  <Clock3 className="size-3.5 text-brand-500" strokeWidth={2.2} />
                  {t('อ่าน {n}', { n: a.read })}
                </span>
              </div>
            </div>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  Food brand ร้านดัง – logos sliding by on their own (stops on hover)    */
/* ======================================================================== */
export function FoodBrands({ items = [] }) {
  const { t } = useI18n()
  const loop = [...items, ...items] // two copies → the strip loops without a gap
  return (
    <section className="pt-16 lg:pt-20">
      <div className="container-bm">
        <HomeTitle eyebrow="Famous food brands" title={t('ร้านดังในบองมาร์เช่')} href="/shops?cat=1" />
      </div>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="flex w-max gap-4 py-1 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loop.map((b, i) => (
            <SmartLink
              key={`${b.id}-${i}`}
              href={b.url}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : undefined}
              className="grid h-[104px] w-[150px] shrink-0 place-items-center overflow-hidden rounded-[16px] px-3 text-center shadow-[0_8px_20px_-14px_rgb(0_0_0/0.5)] transition hover:-translate-y-1 sm:h-[120px] sm:w-[176px]"
              style={{ backgroundColor: b.logo ? '#ffffff' : b.color }}
            >
              {b.logo ? (
                <img src={b.logo} alt={b.name} className="max-h-[70%] max-w-[80%] object-contain" />
              ) : (
                <span className="text-[17px] font-extrabold leading-tight text-white sm:text-[19px]">{b.name}</span>
              )}
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  All events – three event cards with the date range                      */
/* ======================================================================== */
export function Events({ items = [] }) {
  const { t } = useI18n()
  return (
    <section id="events" className="container-bm scroll-mt-24 pt-16 lg:pt-20">
      <HomeTitle eyebrow="All events" title={t('กิจกรรมทั้งหมด')} href="#" />
      {/* same card size as Happening: a quarter of the content width on desktop */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((e) => (
          <SmartLink key={e.id} href={e.url} className="group">
            {/* 4:5 poster card – same look + hover as Happening: dark glass label, light sweep, pink glow */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#1b1416] ring-1 ring-black/5 transition duration-500 group-hover:shadow-[0_22px_40px_-22px_rgb(236_28_140/0.75)]">
              <SmartImage src={e.image} alt={e.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/35 py-1 pl-2 pr-3 text-[11px] font-semibold tracking-[0.06em] text-white ring-1 ring-white/30 backdrop-blur-md">
                <CalendarDays className="size-3.5 text-[#ff9fd0]" strokeWidth={2.4} />
                {e.date}
              </span>
            </div>
            <h3 className="mt-3.5 line-clamp-2 text-[15.5px] font-extrabold leading-snug tracking-[-0.01em] text-ink transition group-hover:text-[#ec1c8c]">{e.title}</h3>
            {/* place: gradient pin + text, the dash grows on hover like the Happening date */}
            <p className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-muted transition group-hover:text-[#3d5552]">
              <span aria-hidden="true" className="h-[2px] w-5 shrink-0 rounded-full bg-gradient-to-r from-[#ec1c8c] to-[#f7931e] transition-all duration-500 group-hover:w-9" />
              <MapPin className="size-3.5 shrink-0 text-[#ec1c8c]" strokeWidth={2.2} />
              {e.place}
            </p>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  News – one big story + the next ones as a list                          */
/* ======================================================================== */
export function News({ items = [] }) {
  const { t } = useI18n()
  const [first, ...rest] = items
  if (!first) return null
  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="News" title={t('ข่าวสารบองมาร์เช่')} href="#" />
      <div className="grid gap-5 lg:grid-cols-[7fr_5fr]">
        <SmartLink href={first.url} className="group relative block overflow-hidden rounded-[20px] bg-brand-900">
          <div className="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px]">
            <SmartImage src={first.image} alt={first.title} className="h-full w-full opacity-90 transition duration-700 group-hover:scale-105" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#06302c]/90 via-[#06302c]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <span className="rounded-full bg-[#f37021] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-white">{t('ข่าวล่าสุด')}</span>
            <h3 className="mt-2.5 text-[18px] font-extrabold leading-snug text-white sm:text-[21px]">{first.title}</h3>
            <p className="mt-1.5 text-[12px] text-white/75">{first.date}</p>
          </div>
        </SmartLink>
        {/* the small stories share the big story's height (no empty gap below them) */}
        <div className="flex flex-col gap-4">
          {rest.map((n) => (
            <SmartLink key={n.id} href={n.url} className="group flex flex-1 items-center gap-4 rounded-[18px] border border-[#e6eeec] bg-white p-3 transition hover:shadow-card">
              <div className="aspect-[4/3] w-[38%] shrink-0 self-stretch overflow-hidden rounded-[12px] lg:aspect-auto">
                <SmartImage src={n.image} alt={n.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex min-w-0 flex-col justify-center py-1 pr-1">
                <h3 className="line-clamp-3 text-[14.5px] font-bold leading-snug text-ink transition group-hover:text-brand-700">{n.title}</h3>
                <div className="mt-2">
                  <DateLine>{n.date}</DateLine>
                </div>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}

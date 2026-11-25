import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Building, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MapPin, ShoppingBag, Sparkles, Store, Utensils } from 'lucide-react'
import SmartLink from '../SmartLink'
import { SmartImage } from '../Decor'
import { useI18n } from '../../i18n'

const ICONS = { Store, CalendarDays, MapPin, Building }
const TAB_ICONS = { Utensils, ShoppingBag, Store }

/* ======================================================================== */
/*  Headline tab – one segmented bar in the white card on the banner edge.  */
/*   - mouse: point at a topic → its panel drops down (floats over the     */
/*     page, nothing below moves); leave the bar + panel → it closes        */
/*   - touch / keyboard: tap / Enter opens, tap the same topic again closes */
/*  The bar is centred on the image edge (data-hero-anchor).                */
/* ======================================================================== */
const CLOSE_DELAY = 180 // ms – time to move the mouse from the bar into the panel

export function HeadlineTab({ tabs = [] }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(tabs[0]?.id)
  const closeTimer = useRef(0)
  const root = useRef(null)
  const index = Math.max(0, tabs.findIndex((x) => x.id === current))
  const tab = tabs[index]

  const cancelClose = () => clearTimeout(closeTimer.current)
  const closeSoon = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
  }
  const show = (id) => {
    cancelClose()
    setCurrent(id)
    setOpen(true)
  }
  const toggle = (id) => (open && id === current ? setOpen(false) : show(id))

  // close on Escape / a tap outside
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])
  useEffect(() => cancelClose, [])

  if (!tab) return null
  const mouse = (e) => e.pointerType === 'mouse'

  return (
    <div ref={root} className="relative" onPointerLeave={(e) => mouse(e) && closeSoon()} onPointerEnter={(e) => mouse(e) && open && cancelClose()}>
      {/* ---------- segmented bar ---------- */}
      <div data-hero-anchor role="tablist" className="grid grid-cols-3 divide-x divide-[#e8efed]">
        {tabs.map((x) => {
          const on = open && x.id === current
          const Icon = TAB_ICONS[x.icon] || Sparkles
          // every topic has its own colour (homeData: color) – icon, tint, title, underline
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-expanded={on}
              aria-controls="headline-panel"
              onPointerEnter={(e) => mouse(e) && show(x.id)}
              onClick={(e) => (e.nativeEvent.pointerType === 'mouse' ? show(x.id) : toggle(x.id))}
              style={{ '--c': x.color || '#138377' }}
              className="group relative flex flex-col items-center justify-center gap-1 px-1 py-1 text-center outline-none sm:flex-row sm:gap-2.5 sm:px-3 sm:py-1.5 sm:text-left"
            >
              {/* hover / open background – a soft wash of the topic colour */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-1 inset-y-0 rounded-[14px] transition duration-300 sm:inset-x-2 ${
                  on
                    ? 'bg-[color-mix(in_srgb,var(--c)_10%,white)]'
                    : 'bg-transparent group-hover:bg-[color-mix(in_srgb,var(--c)_8%,white)] group-focus-visible:bg-[color-mix(in_srgb,var(--c)_8%,white)]'
                }`}
              />
              <span
                className={`relative grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-9 ${
                  on
                    ? 'rotate-[-6deg] scale-110 bg-[var(--c)] text-white shadow-[0_8px_18px_-8px_var(--c)]'
                    : 'bg-[color-mix(in_srgb,var(--c)_14%,white)] text-[var(--c)] group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:bg-[var(--c)] group-hover:text-white group-hover:shadow-[0_8px_18px_-8px_var(--c)]'
                }`}
              >
                <Icon className="size-4 sm:size-[18px]" strokeWidth={2} />
              </span>
              <span className="relative min-w-0">
                <span className="flex items-center justify-center gap-1 sm:justify-start">
                  <span
                    className={`text-[11.5px] font-bold leading-tight transition-colors duration-300 sm:text-[14px] ${
                      on ? 'text-[var(--c)]' : 'text-ink group-hover:text-[var(--c)]'
                    }`}
                  >
                    {x.label}
                  </span>
                  <ChevronDown
                    className={`hidden size-4 shrink-0 transition duration-300 sm:block ${on ? 'rotate-180 text-[var(--c)]' : 'text-[#9fb0ad] group-hover:text-[var(--c)]'}`}
                    strokeWidth={2.4}
                  />
                </span>
                {x.hint && <span className="mt-0.5 hidden truncate text-[12px] text-muted sm:block">{x.hint}</span>}
              </span>
              {/* bar in the topic colour under the open / pointed topic */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-[5px] left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[var(--c)] transition-all duration-300 sm:-bottom-[7px] ${
                  on ? 'w-12 opacity-100' : 'w-0 opacity-0 group-hover:w-8 group-hover:opacity-60'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* ---------- drop-down panel (floats over the page below) ---------- */}
      <div
        id="headline-panel"
        role="tabpanel"
        inert={!open}
        // pt = the card's bottom padding + a 10px gap; the padding still counts as "inside", so the mouse can cross it
        // --edge = how far the panel reaches past the bar on each side (to the card's edges)
        className={`absolute inset-x-0 top-full z-40 pt-4 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [--edge:0px] sm:-inset-x-6 sm:pt-[18px] sm:[--edge:24px] ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div
          style={{ '--c': tab.color || '#138377' }}
          className="relative rounded-[20px] border border-[#e6eeec] bg-white p-4 shadow-[0_28px_60px_-28px_rgb(12_80_72/0.55)] transition-[border-color] duration-300 sm:p-6"
        >
          {/* pointer towards the open topic */}
          <span
            aria-hidden="true"
            className="absolute -top-[7px] size-3.5 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-[#e6eeec] bg-white transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `calc(var(--edge) + ${(index + 0.5) / tabs.length} * (100% - 2 * var(--edge)))` }}
          />
          <div key={tab.id} className="grid gap-5 motion-safe:animate-[card-in_0.35s_ease-out] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
            <div className="flex flex-col justify-center">
              <p className="text-[18px] font-extrabold text-[var(--c)]">{tab.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{tab.intro}</p>
              <ul className="mt-3 space-y-1">
                {tab.links.map((l) => (
                  <li key={l.label}>
                    <SmartLink
                      href={l.url}
                      onClick={() => setOpen(false)}
                      className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-[#2b3a38] transition hover:bg-[color-mix(in_srgb,var(--c)_9%,white)] hover:text-[var(--c)]"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-[var(--c)]" />
                      {l.label}
                      <ArrowRight className="ml-auto size-3.5 text-[var(--c)] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2.4} />
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {tab.cards.map((c) => (
                <SmartLink
                  key={c.title}
                  href={c.url}
                  onClick={() => setOpen(false)}
                  className="group overflow-hidden rounded-[14px] border border-[#e6eeec] bg-white transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <SmartImage src={c.image} alt={c.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="truncate text-[13px] font-semibold text-ink">{c.title}</span>
                    <span className="hidden shrink-0 items-center gap-1 text-[11.5px] font-semibold text-[var(--c)] sm:flex">
                      {t('ดูเพิ่มเติม')}
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
                    </span>
                  </div>
                </SmartLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================== */
/*  Hero slider                                                             */
/*   - 'split'  : text panel on the left, picture on the right              */
/*   - 'banner' : one full-width picture (ad banner / "Option")             */
/*  Plays by itself every 6 s; stops while the pointer / focus is on it    */
/* ======================================================================== */
const SLIDE_MS = 6000

export function HeroSlider({ slides = [] }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => go(index + 1), SLIDE_MS)
    return () => clearTimeout(id)
  }, [index, paused, count, go])

  // swipe on phones
  const touch = useRef(null)
  const onTouchStart = (e) => (touch.current = e.touches[0].clientX)
  const onTouchEnd = (e) => {
    if (touch.current == null) return
    const dx = e.changedTouches[0].clientX - touch.current
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
    touch.current = null
  }

  if (!count) return null
  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      <div className="grid overflow-hidden rounded-[22px] bg-[#f4f6f3] ring-1 ring-[#e6eeec]">
        {slides.map((s, i) => {
          const on = i === index
          return (
            <div
              key={s.id}
              aria-hidden={!on}
              inert={!on}
              className={`[grid-area:1/1] transition-opacity ${on ? 'z-[1] opacity-100 duration-700' : 'opacity-0 duration-500'}`}
            >
              {s.layout === 'banner' ? <BannerSlide slide={s} active={on} /> : <SplitSlide slide={s} active={on} />}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        // prev · dots · next – under the text on desktop, centred on phones
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-6 lg:bottom-8 lg:left-12 lg:translate-x-0">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t('ก่อนหน้า')}
            className="hidden size-8 place-items-center rounded-full border border-brand-800/15 bg-white/90 text-brand-800 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:grid"
          >
            <ChevronLeft className="size-4" strokeWidth={2.4} />
          </button>
          {/* dots sit on a small white pill so they show on light and dark slides */}
          <div className="flex gap-1.5 rounded-full bg-white/85 px-2 py-1.5 shadow-sm backdrop-blur">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={t('สไลด์ {n}', { n: i + 1 })}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-brand-600' : 'w-1.5 bg-brand-800/30 hover:bg-brand-800/55'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t('ถัดไป')}
            className="hidden size-8 place-items-center rounded-full border border-brand-800/15 bg-white/90 text-brand-800 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:grid"
          >
            <ChevronRight className="size-4" strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Text of a slide: the old slide's text leaves fast, the new slide's text comes in
 * only after it (delay) – so two texts never show on top of each other mid-change.
 */
const textFx = (active) => (active ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-2 opacity-0 !duration-200')

function SplitSlide({ slide: s, active }) {
  return (
    <div className="grid h-full bg-[#f4f6f3] lg:min-h-[420px] lg:grid-cols-[5fr_7fr]">
      {/* bottom padding leaves room for the slide controls */}
      <div className={`order-2 flex flex-col justify-center px-6 pb-12 pt-6 transition duration-500 sm:px-10 sm:pb-20 lg:order-1 lg:pb-24 lg:pl-12 lg:pt-12 ${textFx(active)}`}>
        {s.eyebrow && <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#f37021]">{s.eyebrow}</p>}
        <h2
          className={`mt-2 text-[24px] font-extrabold leading-[1.2] text-brand-800 transition-all delay-150 duration-700 sm:text-[30px] ${
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          {s.title}
        </h2>
        <p className="mt-3 max-w-[440px] text-[13.5px] leading-relaxed text-[#4d5f5c]">{s.text}</p>
        {s.cta && (
          <SmartLink
            href={s.url}
            className="group mt-5 inline-flex w-fit items-center gap-2 border-b-2 border-brand-600 pb-0.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:border-[#f37021] hover:text-[#f37021]"
          >
            {s.cta}
            <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={2.4} />
          </SmartLink>
        )}
      </div>
      <div className="relative order-1 aspect-[16/9] overflow-hidden lg:order-2 lg:aspect-auto">
        <SmartImage
          src={s.image}
          alt={s.title}
          className={`absolute inset-0 h-full w-full transition-transform duration-[6000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
        />
      </div>
    </div>
  )
}

function BannerSlide({ slide: s, active }) {
  return (
    <div className="relative h-full min-h-[300px] overflow-hidden lg:min-h-[420px]">
      <SmartImage
        src={s.image}
        alt={s.title || ''}
        className={`absolute inset-0 h-full w-full transition-transform duration-[6000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
      />
      {s.title && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#06302c]/80 via-[#06302c]/35 to-transparent" />
          <div className={`relative flex h-full min-h-[300px] max-w-[520px] flex-col justify-center px-6 pb-12 pt-8 transition duration-500 sm:px-10 sm:pb-20 lg:min-h-[420px] lg:pb-24 lg:pl-12 ${textFx(active)}`}>
            <h2
              className={`text-[28px] font-extrabold leading-[1.15] text-white transition-all delay-150 duration-700 sm:text-[38px] ${
                active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              {s.title}
            </h2>
            {s.text && <p className="mt-3 text-[14px] leading-relaxed text-white/85">{s.text}</p>}
            {s.cta && (
              <SmartLink
                href={s.url}
                className="group mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-brand-800 transition hover:bg-[#f37021] hover:text-white"
              >
                {s.cta}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
              </SmartLink>
            )}
          </div>
        </>
      )}
      {!s.title && s.url && <SmartLink href={s.url} aria-label={s.cta || 'banner'} className="absolute inset-0" />}
    </div>
  )
}

/* ======================================================================== */
/*  Quick links – a row of 4 cards under the slider (not overlapping it).   */
/*  Each card has its own colour (homeData: color): on hover the card lifts, */
/*  gets a wash + border of that colour, the icon fills and tilts and the    */
/*  arrow turns into a filled circle that slides forward.                    */
/* ======================================================================== */
export function QuickLinks({ items = [] }) {
  return (
    <nav className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
      {items.map((q) => {
        const Icon = ICONS[q.icon] || Store
        return (
          <SmartLink
            key={q.label}
            href={q.url}
            style={{ '--c': q.color || '#138377' }}
            className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-[18px] text-center sm:flex-row sm:gap-3 sm:text-left border border-[#e6eeec] bg-white px-3.5 py-3.5 shadow-[0_6px_18px_-14px_rgb(12_80_72/0.45)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--c)_35%,white)] hover:bg-[color-mix(in_srgb,var(--c)_6%,white)] hover:shadow-[0_18px_32px_-18px_var(--c)] sm:px-4 sm:py-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_13%,white)] text-[var(--c)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-[var(--c)] group-hover:text-white sm:size-11">
              <Icon className="size-[19px] sm:size-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 max-w-full sm:flex-1">
              <span className="block truncate text-[13.5px] font-bold text-ink transition-colors group-hover:text-[var(--c)] sm:text-[15px]">{q.label}</span>
              {q.hint && <span className="mt-0.5 hidden truncate text-[12px] text-muted sm:block">{q.hint}</span>}
            </span>
            <span className="hidden size-7 shrink-0 place-items-center rounded-full text-[#9aa9a6] sm:grid transition duration-300 group-hover:translate-x-0.5 group-hover:bg-[var(--c)] group-hover:text-white">
              <ChevronRight className="size-4" strokeWidth={2.6} />
            </span>
            {/* colour line that grows along the bottom edge */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[var(--c)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </SmartLink>
        )
      })}
    </nav>
  )
}

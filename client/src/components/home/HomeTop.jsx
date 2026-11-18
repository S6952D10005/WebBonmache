import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Building, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MapPin, ShoppingBag, Sparkles, Store, Utensils } from 'lucide-react'
import SmartLink from '../SmartLink'
import { SmartImage } from '../Decor'
import { useI18n } from '../../i18n'

const ICONS = { Store, CalendarDays, MapPin, Building }
const TAB_ICONS = { Utensils, ShoppingBag, Store }

/* ======================================================================== */
/*  Headline tab – sits in the white card on the edge of the banner image.  */
/*  Three topic buttons; the panel stays hidden until one is clicked        */
/*  (click it again to hide it). Only the button row is centred on the      */
/*  image edge (data-hero-anchor) – the panel opens downwards.              */
/* ======================================================================== */
export function HeadlineTab({ tabs = [] }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(tabs[0]?.id)
  const tab = tabs.find((x) => x.id === current) || tabs[0]
  if (!tab) return null

  const pick = (id) => {
    if (open && id === current) setOpen(false)
    else {
      setCurrent(id)
      setOpen(true)
    }
  }

  return (
    <div>
      <div data-hero-anchor role="tablist" className="grid grid-cols-3 gap-2 sm:gap-3">
        {tabs.map((x) => {
          const on = open && x.id === current
          const Icon = TAB_ICONS[x.icon] || Sparkles
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-expanded={on}
              onClick={() => pick(x.id)}
              className={`group flex flex-col items-center gap-1 rounded-[14px] border px-1.5 py-2 text-center transition duration-300 sm:flex-row sm:gap-3 sm:rounded-full sm:px-4 sm:py-3 sm:text-left ${
                on
                  ? 'border-brand-600 bg-brand-600 text-white shadow-[0_10px_22px_-12px_rgb(15_111_102/0.8)]'
                  : 'border-[#e3ebe9] bg-white text-ink hover:border-brand-300 hover:shadow-[0_8px_18px_-12px_rgb(12_80_72/0.5)]'
              }`}
            >
              <Icon className={`size-[19px] shrink-0 ${on ? 'text-white' : 'text-brand-600'}`} strokeWidth={2} />
              <span className="min-w-0 flex-1 text-[11.5px] font-semibold leading-tight sm:truncate sm:text-[14px]">{x.label}</span>
              <ChevronDown
                className={`hidden size-4 shrink-0 transition-transform duration-300 sm:block ${on ? 'rotate-180 text-white' : 'text-brand-600 group-hover:translate-y-0.5'}`}
                strokeWidth={2.4}
              />
            </button>
          )
        })}
      </div>

      {/* panel – slides open (grid rows 0fr → 1fr) */}
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden" inert={!open}>
          <div key={tab.id} className="mt-4 grid gap-5 border-t border-[#e7eeec] pb-1 pt-4 motion-safe:animate-[card-in_0.45s_ease-out] sm:grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-center">
              <p className="text-[18px] font-extrabold text-brand-800">{tab.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{tab.intro}</p>
              <ul className="mt-3 space-y-1.5">
                {tab.links.map((l) => (
                  <li key={l.label}>
                    <SmartLink href={l.url} className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2b3a38] hover:text-brand-700">
                      <span className="size-1 rounded-full bg-[#f37021]" />
                      {l.label}
                      <ArrowRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2.4} />
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {tab.cards.map((c) => (
                <SmartLink key={c.title} href={c.url} className="group overflow-hidden rounded-[14px] border border-[#e6eeec] bg-white">
                  <div className="aspect-[16/9] overflow-hidden">
                    <SmartImage src={c.image} alt={c.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="truncate text-[13px] font-semibold text-ink">{c.title}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand-700">
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
              className={`[grid-area:1/1] transition-opacity duration-700 ${on ? 'z-[1] opacity-100' : 'opacity-0'}`}
            >
              {s.layout === 'banner' ? <BannerSlide slide={s} active={on} /> : <SplitSlide slide={s} active={on} />}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        // prev · dots · next – under the text on desktop (above the quick-link bar that overlaps the slide's bottom), centred on phones
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-14 lg:bottom-16 lg:left-12 lg:translate-x-0">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t('ก่อนหน้า')}
            className="hidden size-8 place-items-center rounded-full border border-brand-800/15 bg-white/90 text-brand-800 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:grid"
          >
            <ChevronLeft className="size-4" strokeWidth={2.4} />
          </button>
          <div className="flex gap-1.5 rounded-full bg-white/70 px-2 py-1.5 backdrop-blur sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={t('สไลด์ {n}', { n: i + 1 })}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-brand-600' : 'w-1.5 bg-brand-800/25 hover:bg-brand-800/45'}`}
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

function SplitSlide({ slide: s, active }) {
  return (
    <div className="grid h-full lg:min-h-[420px] lg:grid-cols-[5fr_7fr]">
      {/* bottom padding leaves room for the slide controls + the quick-link bar */}
      <div className="order-2 flex flex-col justify-center px-6 pb-12 pt-6 sm:px-10 sm:pb-24 lg:order-1 lg:pb-28 lg:pl-12 lg:pt-12">
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
          <div className="relative flex h-full min-h-[300px] max-w-[520px] flex-col justify-center px-6 pb-12 pt-8 sm:px-10 sm:pb-24 lg:min-h-[420px] lg:pb-28 lg:pl-12">
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
/*  Quick links – white bar overlapping the bottom of the slider            */
/* ======================================================================== */
export function QuickLinks({ items = [] }) {
  return (
    <nav className="relative z-10 mx-auto grid max-w-[920px] grid-cols-2 overflow-hidden mt-4 rounded-[18px] border border-[#e6eeec] bg-white shadow-[0_16px_36px_-20px_rgb(12_80_72/0.45)] sm:-mt-8 sm:grid-cols-4">
      {items.map((q, i) => {
        const Icon = ICONS[q.icon] || Store
        return (
          <SmartLink
            key={q.label}
            href={q.url}
            className={`group flex items-center gap-2.5 px-4 py-3.5 transition hover:bg-brand-50 sm:justify-center ${
              i % 2 ? 'border-l border-[#eef2f1]' : ''
            } ${i > 1 ? 'border-t border-[#eef2f1] sm:border-t-0' : ''} ${i === 2 ? 'sm:border-l' : ''}`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <Icon className="size-[18px]" strokeWidth={2} />
            </span>
            <span className="truncate text-[13.5px] font-semibold text-ink">{q.label}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-[#9aa9a6] transition group-hover:translate-x-0.5 group-hover:text-brand-600 sm:ml-0" strokeWidth={2.4} />
          </SmartLink>
        )
      })}
    </nav>
  )
}

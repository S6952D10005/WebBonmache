import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Award, Expand, MapPin, Store } from 'lucide-react'
import SmartLink from '../components/SmartLink'
import PhotoViewer from '../components/PhotoViewer'
import { useParallax } from '../components/ScrollFx'
import { ABOUT } from '../data/aboutData'
import { useI18n } from '../i18n'

/*
 * About Us (/about) – laid out like the "About Us" template, in the site's white theme:
 *   photo header "About Us" → photo + who we are → why the market was started (tenant bars) + numbers
 *   → บันทึกเหตุการณ์สำคัญ (timeline with old photos) → what's inside (photo gallery – a click shows the
 *   picture large)
 *   → closing photo banner with buttons.
 * Content + photos: src/data/aboutData.js (from bonmarche.co.th/about)
 * Motion: the header and closing photos move slower than the page; every section and card rises in
 * as it comes on screen (ScrollFx.jsx); the bars fill and the numbers count up the first time they're seen.
 */

// gallery tile sizes (aboutData.js zones.gallery[].size)
const TILE = { big: 'col-span-2 row-span-2', tall: 'row-span-2', wide: 'col-span-2' }

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** true once the element has been on screen (stays true) */
function useSeen(threshold = 0.35) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setSeen(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

/** 0 → `to`, easing out, once `run` turns true */
function CountUp({ to, run }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (reducedMotion()) return setN(to)
    let frame = 0
    let start = 0
    const step = (time) => {
      start ||= time
      const p = Math.min(1, (time - start) / 1600)
      setN(Math.round(to * (1 - (1 - p) ** 3)))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [run, to])
  return n.toLocaleString('en-US')
}

function Eyebrow({ children, light = false }) {
  return <p className={`text-[12px] font-bold uppercase tracking-[0.2em] ${light ? 'text-[#ffb37a]' : 'text-accent-500'}`}>{children}</p>
}

export default function About() {
  const { t, tr } = useI18n()
  const data = useMemo(() => tr(ABOUT), [tr])
  const { intro, founding, stats, history, zones, closing } = data
  const heroPhoto = useParallax(0.3, 1.1)
  const closingPhoto = useParallax(0.18, 1.12)
  const [bars, barsSeen] = useSeen(0.4)
  const [numbers, numbersSeen] = useSeen(0.4)
  const years = new Date().getFullYear() + 543 - ABOUT.intro.opened // Buddhist year now − year opened
  const [open, setOpen] = useState(-1) // gallery picture shown large (-1 = none)
  const close = useCallback(() => setOpen(-1), [])
  const pictures = useMemo(() => zones.gallery.map((z) => ({ img: z.image, caption: z.label })), [zones])

  return (
    <>
      {/* ================= photo header ================= */}
      <section className="relative isolate grid h-[280px] place-items-center overflow-hidden bg-[#0f2f2b] text-center text-white sm:h-[360px] lg:h-[440px]">
        <img ref={heroPhoto} src={data.hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_60%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/55" />
        <div className="px-4 lg:pt-14">
          <h1 className="text-[44px] font-black leading-none [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[60px] lg:text-[72px]">About Us</h1>
          <nav aria-label="breadcrumb" className="mt-4 flex items-center justify-center gap-2 text-[13px] font-medium text-white/85">
            <SmartLink href="/" className="hover:text-white">
              {t('หน้าแรก')}
            </SmartLink>
            <span className="text-white/50">/</span>
            <span className="text-white">{t('เกี่ยวกับเรา')}</span>
          </nav>
        </div>
      </section>

      {/* ================= who we are: photo + text ================= */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-bm grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="group aspect-[4/3.3] overflow-hidden rounded-[24px] bg-mint">
              <img src={intro.image} alt={intro.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            </div>
            {/* "since" card over the photo's corner */}
            <div className="absolute -bottom-7 right-4 rounded-[18px] bg-white px-5 py-4 text-center shadow-[0_18px_40px_-20px_rgb(12_80_72/0.5)] sm:-right-5 sm:px-6">
              <p className="text-[12px] font-semibold text-muted">{t('เปิดให้บริการตั้งแต่')}</p>
              <p className="mt-0.5 text-[30px] font-black leading-none text-brand-600 sm:text-[34px]">{intro.opened}</p>
            </div>
          </div>

          <div>
            <Eyebrow>{intro.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-[30px] font-black leading-[1.2] text-ink sm:text-[40px]">{intro.title}</h2>
            <p className="mt-2 text-[17px] font-semibold text-brand-700 sm:text-[18px]">{intro.subtitle}</p>
            <p className="mt-5 text-[15.5px] leading-[1.9] text-muted">{intro.text}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {intro.badges.map((b) => (
                <li key={b} className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-800">
                  <Award className="size-4 text-brand-600" strokeWidth={2.2} />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <SmartLink
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(12_80_72/0.8)] transition hover:-translate-y-0.5 hover:bg-brand-700"
              >
                {t('ติดต่อเรา')}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
              </SmartLink>
              <SmartLink
                href="/shops"
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 text-[14px] font-semibold text-brand-800 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-mint-soft"
              >
                <Store className="size-4" strokeWidth={2.2} />
                {t('ค้นหาร้านค้า')}
              </SmartLink>
            </div>
          </div>
        </div>
      </section>

      {/* ================= why the market was started (bars) + numbers ================= */}
      <section className="bg-mint-soft py-16 sm:py-20 lg:py-24">
        <div className="container-bm grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[28px] font-black leading-[1.25] text-ink sm:text-[34px]">{founding.title}</h2>
            <p className="mt-4 text-[15px] leading-[1.9] text-muted">{founding.text}</p>
            <p className="mt-8 text-[12.5px] font-bold uppercase tracking-[0.14em] text-brand-700">{founding.barsTitle}</p>
            <div ref={bars} className="mt-4 space-y-5">
              {founding.bars.map((b, i) => (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between gap-4 text-[14px]">
                    <span className="font-semibold text-ink">{b.label}</span>
                    <span className="font-bold tabular-nums text-brand-700">{b.value}%</span>
                  </div>
                  <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#d9ebe6]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                      style={{ width: barsSeen ? `${b.value}%` : 0, transitionDelay: `${i * 120}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={numbers} className="grid grid-cols-2 gap-4 sm:gap-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[22px] bg-white px-4 py-8 text-center shadow-[0_16px_36px_-26px_rgb(12_80_72/0.55)] sm:py-10">
                <p className="text-[38px] font-black leading-none tabular-nums text-brand-600 sm:text-[46px]">
                  <CountUp to={s.value === 'years' ? years : s.value} run={numbersSeen} />
                  {s.suffix}
                </p>
                <p className="mt-3 text-[13.5px] font-medium text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= บันทึกเหตุการณ์สำคัญ (timeline) ================= */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-bm">
          <div className="text-center">
            <Eyebrow>{t('ตั้งแต่ 2540 ถึงวันนี้')}</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">{t('บันทึกเหตุการณ์สำคัญ')}</h2>
          </div>
          <ol className="relative mx-auto mt-12 max-w-[1040px] space-y-12 sm:mt-14 lg:space-y-16">
            {/* the line through the years: left on phones, middle on desktop */}
            <span aria-hidden="true" className="absolute bottom-2 left-[9px] top-2 w-[2px] rounded-full bg-brand-100 lg:left-1/2 lg:-translate-x-1/2" />
            {history.map((h, i) => {
              const flip = i % 2 === 1
              return (
                <li key={h.year} className="relative grid gap-5 pl-10 lg:grid-cols-2 lg:items-center lg:gap-20 lg:pl-0">
                  <span aria-hidden="true" className="absolute left-0 top-1 size-5 rounded-full border-[5px] border-white bg-brand-500 shadow-[0_0_0_2px_var(--color-brand-200)] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2" />
                  <div className={`group overflow-hidden rounded-[20px] bg-mint ${flip ? 'lg:order-2' : ''}`}>
                    <img src={h.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  </div>
                  <div className={flip ? 'lg:order-1' : ''}>
                    <p className="text-[30px] font-black leading-none text-brand-600 sm:text-[36px]">{h.year}</p>
                    <h3 className="mt-2 text-[19px] font-bold text-ink sm:text-[21px]">{h.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {h.items.map((x) => (
                        <li key={x} className="relative pl-4 text-[14.5px] leading-[1.8] text-muted before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-accent-500">
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ================= what's inside: photo gallery ================= */}
      <section className="bg-mint-soft py-16 sm:py-20 lg:py-24">
        <div className="container-bm">
          <div className="text-center">
            <Eyebrow>{zones.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black text-ink sm:text-[34px]">{zones.title}</h2>
            <p className="mt-3 text-[15px] text-muted">{zones.text}</p>
          </div>

          {/* gallery: tiles of different sizes packed edge to edge; a click opens the picture large */}
          <div className="mt-10 grid grid-flow-row-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {zones.gallery.map((z, i) => (
              <button
                key={z.image}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={z.label}
                className={`group relative isolate overflow-hidden rounded-[18px] bg-mint text-left outline-none ring-brand-600 ring-offset-2 focus-visible:ring-2 ${TILE[z.size] || ''}`}
              >
                <img src={z.image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-90 transition group-hover:opacity-100" />
                <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="size-4" strokeWidth={2} />
                </span>
                <span
                  className={`absolute inset-x-0 bottom-0 flex items-center gap-2 p-3.5 font-bold leading-snug text-white transition duration-300 group-hover:-translate-y-0.5 sm:p-4 ${
                    z.size === 'big' ? 'text-[16px] sm:p-5 sm:text-[19px]' : 'text-[13px] sm:text-[14.5px]'
                  }`}
                >
                  {z.size === 'big' && <MapPin className="size-5 shrink-0" strokeWidth={2.2} />}
                  {z.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= closing photo banner ================= */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-bm">
          <div className="relative isolate overflow-hidden rounded-[28px] px-6 py-16 text-center text-white sm:py-24">
            <img ref={closingPhoto} src={closing.image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/45 to-black/35" />
            <Eyebrow light>{closing.eyebrow}</Eyebrow>
            <h2 className="mx-auto mt-3 max-w-[760px] text-[27px] font-black leading-[1.3] sm:text-[40px]">{closing.title}</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[15px] leading-[1.8] text-white/85">{closing.text}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {closing.buttons.map((b, i) => (
                <SmartLink
                  key={b.url}
                  href={b.url}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition hover:-translate-y-0.5 ${
                    i === 0 ? 'bg-white text-brand-800 hover:bg-mint' : 'border border-white/70 text-white hover:bg-white/10'
                  }`}
                >
                  {b.label}
                  {i === 0 && <ArrowRight className="size-4" strokeWidth={2.4} />}
                </SmartLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {open >= 0 && <PhotoViewer imgs={pictures} index={open} onIndex={setOpen} onClose={close} />}
    </>
  )
}

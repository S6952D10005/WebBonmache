import { useEffect, useRef, useState } from 'react'
import { useParallax } from './ScrollFx'

/**
 * Top of every inner page (Shop Directory, …): always the same banner image as
 * the home page (settings.hero_image). The bottom ~20% of the artwork (street
 * / people) is cut off so the page content starts higher; the headline in the
 * artwork stays visible. The page's own content sits on a white card that
 * sits centred on the bottom edge of the image (half over it, half below).
 * If something inside the card has `data-hero-anchor`, that part is centred on
 * the edge instead, so whatever opens below it grows downwards only.
 */
export default function PageHero({ settings, children }) {
  const parallax = useParallax(0.3, 1.1)

  // pull the card up so the image edge runs through its middle (or through the anchor's middle)
  const card = useRef(null)
  const [half, setHalf] = useState(0)
  useEffect(() => {
    const el = card.current
    if (!el) return
    const measure = () => {
      const anchor = el.querySelector('[data-hero-anchor]')
      if (!anchor) return setHalf(Math.round(el.offsetHeight / 2))
      const top = anchor.getBoundingClientRect().top - el.getBoundingClientRect().top
      setHalf(Math.round(top + anchor.offsetHeight / 2))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <section className="relative bg-white">
      <div className="relative w-full overflow-hidden">
        <img
          ref={parallax}
          src={settings.hero_image}
          alt=""
          aria-hidden="true"
          className="block aspect-[2537/540] min-h-[180px] w-full object-cover object-[left_35%]"
        />
        {/* soft shade behind the transparent nav bar (desktop) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[120px] bg-gradient-to-b from-[#06302c]/45 via-[#06302c]/15 to-transparent lg:block" />
      </div>

      <div className="container-bm relative z-20" style={{ marginTop: -half }}>
        <div
          ref={card}
          className="mx-auto max-w-[1040px] rounded-[20px] border border-white/60 bg-white/90 px-4 py-3.5 shadow-[0_14px_32px_-18px_rgb(12_80_72/0.45)] backdrop-blur-md sm:px-6 sm:py-4"
        >
          {children}
        </div>
      </div>
    </section>
  )
}

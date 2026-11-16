import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useI18n } from '../i18n'

/*
 * Scroll effects for the whole site
 *   useScrollReveal(key)  – sections and cards animate in every time they come on
 *                           screen (up or down); cards follow one after another
 *                           (CSS: .reveal / .reveal-in / .reveal-from-top)
 *   useParallax()         – banner image moves slower than the page
 *   <ScrollProgress />    – thin colourful bar at the top = how far you've read
 *   <BackToTop />         – round button that appears after scrolling down
 * Visitors who turned on "reduce motion" (Windows: Settings › Accessibility ›
 * Visual effects › Animation effects = Off) get softer versions: fades instead of
 * slides, a gentler parallax – never "nothing at all".
 */

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Sections (except the banner at the top) and the cards inside their grids
 * animate in EVERY time they come on screen:
 *   - scrolling down  → they rise up from below
 *   - scrolling up    → they drop in from above
 *   - once completely off screen they reset, ready to play again
 * Cards added later (filters, search, "ดูร้านเพิ่มเติม") are picked up automatically.
 * Call again with a new `key` per page.
 */
export function useScrollReveal(key) {
  useEffect(() => {
    // with "reduce motion" on, the CSS turns the movement into a plain fade (still visible)
    if (!('IntersectionObserver' in window)) return
    const main = document.querySelector('main')
    if (!main) return

    const tracked = new Set()

    // plays when the element is a little inside the screen
    const enter = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target
          if (!e.isIntersecting || el.classList.contains('reveal-in')) return
          el.classList.toggle('reveal-from-top', e.boundingClientRect.top < 0) // coming in from above
          el.classList.add('reveal-in')
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )
    // resets only when the element is completely off screen (no flicker at the edges)
    const leave = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) e.target.classList.remove('reveal-in', 'reveal-from-top')
        }),
      { threshold: 0 },
    )

    const track = (el, delay = 0) => {
      // the delay follows the element's current place (cards move after filtering)
      el.style.setProperty('--reveal-delay', `${delay}ms`)
      if (tracked.has(el)) return
      tracked.add(el)
      el.classList.add('reveal')
      enter.observe(el)
      leave.observe(el)
    }

    const scan = () => {
      // page sections, except the first one (hero banner / page banner stays put)
      main.querySelectorAll(':scope > div > section:not(:first-child), :scope > section:not(:first-child)').forEach((el) => track(el))
      // cards: in each grid row they follow one another from left to right
      main.querySelectorAll(':scope > div > section:not(:first-child) .grid, :scope > section:not(:first-child) .grid').forEach((grid) => {
        // only real card grids: skip small "grid place-items-center" boxes that just centre an icon
        const cards = [...grid.children].filter((el) => el instanceof HTMLElement)
        if (cards.length < 2) return
        const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1
        cards.forEach((el, i) => track(el, (i % cols) * 80 + 100))
      })
    }

    let frame = 0
    const later = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), scan()))
    }
    const mutations = new MutationObserver(later) // new cards after filtering / load more
    const timer = setTimeout(() => {
      scan()
      mutations.observe(main, { childList: true, subtree: true })
    }, 60) // wait for the new page to render

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
      mutations.disconnect()
      enter.disconnect()
      leave.disconnect()
      tracked.forEach((el) => el.classList.remove('reveal', 'reveal-in', 'reveal-from-top'))
    }
  }, [key])
}

/**
 * Parallax for a banner <img> inside an overflow-hidden box: the picture is
 * zoomed a little and slides down at `speed` × the scroll, so it seems farther away.
 */
export function useParallax(speed = 0.3, zoom = 1.1) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // "reduce motion" on → a much gentler drift instead of none
    const rate = reducedMotion() ? speed * 0.35 : speed
    let frame = 0
    const update = () => {
      frame = 0
      const box = el.parentElement.getBoundingClientRect()
      if (box.bottom < 0) return // off screen – nothing to do
      const room = (box.height * (zoom - 1)) / 2 // extra picture above/below the box
      const shift = Math.max(0, Math.min(room, -box.top * rate))
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${zoom})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      el.style.transform = ''
    }
  }, [speed, zoom])
  return ref
}

/** how far down the page we are, 0 … 1 */
function useScrollAmount() {
  const [amount, setAmount] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setAmount(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return amount
}

/** thin multi-colour line along the top edge that grows as you scroll */
export function ScrollProgress() {
  const amount = useScrollAmount()
  return (
    <div
      aria-hidden="true"
      style={{ viewTransitionName: 'scroll-progress' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-[#1f9285] via-[#ec1c8c] to-[#f7931e]"
        style={{ transform: `scaleX(${amount})` }}
      />
    </div>
  )
}

/** round gradient button, bottom-right; shows after scrolling ~600px; the ring shows the progress */
export function BackToTop() {
  const { t } = useI18n()
  const amount = useScrollAmount()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r = 22
  const c = 2 * Math.PI * r
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}
      aria-label={t('กลับขึ้นด้านบน')}
      title={t('กลับขึ้นด้านบน')}
      style={{ viewTransitionName: 'back-to-top' }}
      className={`group fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#ec1c8c] to-[#f7931e] text-white shadow-[0_12px_28px_-10px_rgb(236_28_140/0.8)] transition duration-300 hover:-translate-y-1 sm:bottom-7 sm:right-7 ${
        show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'
      }`}
    >
      {/* progress ring */}
      <svg viewBox="0 0 50 50" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="25" cy="25" r={r} fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="2.5" />
        <circle
          cx="25"
          cy="25"
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - amount)}
        />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.6} />
    </button>
  )
}

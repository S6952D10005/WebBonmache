import { useEffect, useMemo, useRef } from 'react'
import PageHero from '../components/PageHero'
import LeasingBanner from '../components/LeasingBanner'
import { HeadlineTab, HeroSlider, QuickLinks } from '../components/home/HomeTop'
import { Events, FoodArticles, FoodBrands, Happening, News } from '../components/home/HomeFeeds'
import { Awards, GettingHere, SocialFeed, useLivePosts } from '../components/home/HomeBottom'
import { HOME } from '../data/homeData'
import { useI18n } from '../i18n'

/**
 * หน้าแรก (/) – the page the site opens on; the menu's "หน้าแรก" and the logo link here.
 * Menu links jump to sections on it: #events, #leasing (ร่วมธุรกิจกับเรา), #visit (Visit Us / map).
 *
 * Top to bottom: banner image with the Headline tab card (panel hidden until clicked) · Hero slider · Happening · Quick links ·
 * Food articles · Food brands · All events · News · Awards · Social · Leasing banner · Map (getting here).
 * Content: src/data/homeData.js
 *
 * Opening the site on this page: after a moment the page glides down so the topic bar and the whole
 * slider fill the screen (useLandingGlide). Only when the visit starts here – coming back to หน้าแรก
 * from another page starts at the top as usual.
 */

// the address the visitor opened the site with (read once, when the site loads)
const ENTRY = typeof window === 'undefined' ? '' : window.location.pathname + window.location.search + window.location.hash
let landed = false // the glide has played (once per visit)

const GLIDE_DELAY = 450 // ms after the page shows – long enough to see the banner first
const BOTTOM_GAP = 32 // px between the slider's bottom edge and the bottom of the screen

function useLandingGlide(slider) {
  useEffect(() => {
    if (landed || ENTRY !== '/') return
    // the visitor scrolls / taps / presses a key first → leave the page where they put it
    let cancelled = false
    const stop = () => (cancelled = true)
    const events = ['wheel', 'touchstart', 'keydown', 'mousedown']
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))

    const timer = setTimeout(async () => {
      await document.fonts?.ready
      landed = true
      const el = slider.current
      const bar = document.querySelector('[data-hero-anchor]')
      if (cancelled || !el || !bar || window.scrollY > 10) return
      const header = document.querySelector('header')?.offsetHeight || 64
      // the slider's bottom just above the bottom of the screen …
      const fit = el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + BOTTOM_GAP
      // … but never so far that the topic bar slides under the menu bar (short screens, phones)
      const most = bar.getBoundingClientRect().top + window.scrollY - header - 20
      const top = Math.round(Math.max(0, Math.min(fit, most)))
      if (top < 24) return // already fits on this screen
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    }, GLIDE_DELAY)

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [slider])
}

export default function Home({ settings }) {
  const { tr } = useI18n()
  const data = useMemo(() => tr(HOME), [tr])
  // real Facebook / Instagram posts once the server is set up; sample posts until then
  const livePosts = useLivePosts()
  const slider = useRef(null)
  useLandingGlide(slider)

  return (
    <>
      {/* banner image, then the white card with the headline tabs right below it (not over the image) */}
      <PageHero settings={settings} overlap={false}>
        <HeadlineTab tabs={data.headline.tabs} />
      </PageHero>

      <section ref={slider} className="container-bm pt-6">
        <HeroSlider slides={data.slides} />
      </section>

      <Happening items={data.happening} />

      {/* quick links (ค้นหาร้านค้า · กิจกรรม · การเดินทาง · เช่าพื้นที่) right under the highlights */}
      <section className="container-bm pt-3">
        <QuickLinks items={data.quickLinks} />
      </section>
      <FoodArticles items={data.foodArticles} />
      <FoodBrands items={data.foodBrands} />
      <Events items={data.events} />
      <News items={data.news} />
      <Awards items={data.awards} />
      <SocialFeed links={data.social.links} posts={livePosts || data.social.posts} page={settings.site_name} />
      <div className="pt-16 lg:pt-20">
        <LeasingBanner settings={settings} />
      </div>
      <GettingHere settings={settings} info={data.gettingHere} />
    </>
  )
}

import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import SmartLink from './components/SmartLink'
import ShopDirectory from './pages/ShopDirectory'
import Home from './pages/Home'
import News from './pages/News'
import { BackToTop, ScrollProgress, useScrollReveal } from './components/ScrollFx'
import { defaultData } from './data/defaultData'
import { useI18n } from './i18n'

/*
 * "/" = home page (หน้าแรก) – the site opens here; the menu's "หน้าแรก" and the logo link here.
 * "/home" (the home page's old address) redirects to "/".
 */
export const HOME_URL = '/'
// older menu rows point "หน้าแรก" at "#" or "/home" → the home page
const toHome = (list) => list.map((m) => (m.url === '#' || m.url === '/home' ? { ...m, url: HOME_URL } : m))

/** Merge API data over the defaults so the page always renders. */
function merge(api) {
  const pick = (arr, fallback) => (Array.isArray(arr) && arr.length ? arr : fallback)
  return {
    settings: { ...defaultData.settings, ...(api?.settings || {}) },
    menus: toHome(pick(api?.menus, defaultData.menus)),
    categories: pick(api?.categories, defaultData.categories),
    footerLinks: toHome(pick(api?.footerLinks, defaultData.footerLinks)),
  }
}

/**
 * page change → top of the new page; "/#leasing" → that section once it is on screen.
 * useLayoutEffect: the jump to the top happens before the page-transition snapshot
 * is taken, so the new page animates in from its top.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(id)
  }, [pathname, hash])
  return null
}

/** remember where the visitor clicked → the page transition circle grows from there */
function useTransitionOrigin() {
  useEffect(() => {
    const root = document.documentElement.style
    const onDown = (e) => {
      root.setProperty('--vt-x', `${e.clientX}px`)
      root.setProperty('--vt-y', `${e.clientY}px`)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [])
}

// browsers without View Transitions (e.g. Firefox) get a simple fade-in instead
const hasViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document

function NotFound() {
  const { t } = useI18n()
  return (
    <section className="container-bm grid min-h-[60vh] place-items-center pb-16 pt-32 text-center">
      <div>
        <p className="font-head text-[64px] font-extrabold leading-none text-brand-600">404</p>
        <p className="mt-3 text-[16px] text-muted">{t('ไม่พบหน้าที่คุณต้องการ')}</p>
        <SmartLink href="/" className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700">
          {t('กลับหน้าแรก')}
        </SmartLink>
      </div>
    </section>
  )
}

export default function App() {
  const [data, setData] = useState(() => merge(null))

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/home', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => setData(merge(json)))
      .catch(() => {
        /* API/DB offline → keep default content */
      })
    return () => ctrl.abort()
  }, [])

  // all content (built-in or from the database) in the chosen language
  const { tr } = useI18n()
  const view = useMemo(() => tr(data), [data, tr])
  const { settings, menus, categories, footerLinks } = view

  // page transition + scroll reveal restart on every page change
  const { pathname } = useLocation()
  useScrollReveal(pathname)
  useTransitionOrigin()

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <ScrollManager />
      <ScrollProgress />
      <Header settings={settings} menus={menus} />
      <main>
        {/* page transition: View Transitions (circle reveal, index.css); fallback = fade-in */}
        <div key={pathname} className={hasViewTransitions ? '' : 'animate-page-enter'}>
          <Routes>
            <Route path="/" element={<Home settings={settings} />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/shops" element={<ShopDirectory settings={settings} categories={categories} />} />
            <Route path="/news" element={<News settings={settings} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer settings={settings} links={footerLinks} />
      <BackToTop />
    </div>
  )
}

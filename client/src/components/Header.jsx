import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, Menu, Search, X } from 'lucide-react'
import { Logo } from './Decor'
import LangSwitcher, { LangRow } from './LangSwitcher'
import { DesktopNav, MobileNav, useActiveMenu } from './NavMenu'
import { useI18n } from '../i18n'

/** true when the viewport is at least `px` wide */
function useMinWidth(px) {
  const query = `(min-width: ${px}px)`
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/**
 * "Visit Us" call-to-action – orange gradient pill (same family as the banner
 * buttons) with a white pin badge that sends out a slow radar ring, a light
 * sweep on hover and an arrow that nudges forward.
 */
function VisitButton({ className = '', ...props }) {
  const { t } = useI18n()
  return (
    <a
      href="#visit"
      {...props}
      className={`group relative flex h-[34px] items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ff9d48] via-[#f7791f] to-[#ee5f14] pl-[3px] pr-3 text-[13px] font-bold tracking-wide text-white shadow-[0_6px_18px_-6px_rgb(238_95_20/0.85)] ring-1 ring-white/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgb(238_95_20/0.95)] active:translate-y-0 active:scale-[0.97] ${className}`}
    >
      {/* soft top shine */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/30 to-transparent" />
      {/* light sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 -translate-x-12 skew-x-[-20deg] bg-white/45 blur-[2px] transition-transform duration-700 ease-out group-hover:translate-x-[180px]"
      />

      {/* pin badge with radar ring */}
      <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_-2px_0_rgb(238_95_20/0.15)]">
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/80 motion-safe:animate-pin-ring" />
        <MapPin className="relative size-[15px] fill-[#ffd9bf] text-[#ee5f14] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.4} />
      </span>

      <span className="relative whitespace-nowrap">{t('Visit Us')}</span>
      <ArrowRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.6} />
    </a>
  )
}

export default function Header({ settings, menus }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isDesktop = useMinWidth(1024)
  const [activeUrl, selectMenu] = useActiveMenu(menus)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Desktop + top of page → transparent bar laid over the hero image
  const overlay = isDesktop && !scrolled && !open

  return (
    <header
      // own view-transition layer → the bar stays put while pages change (index.css)
      style={{ viewTransitionName: 'site-header' }}
      className={`top-0 z-50 w-full transition-[background-color,box-shadow] duration-300 lg:fixed lg:inset-x-0 ${
        overlay ? 'bg-transparent' : 'sticky bg-white shadow-[0_2px_12px_-6px_rgb(12_80_72/0.25)]'
      }`}
    >
      <div className="nav-scale mx-auto flex h-[64px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 xl:gap-6 xl:px-12">
        <div className="relative z-10">
          <Logo name={settings.site_name} tagline={settings.tagline} size="h-[54px]" light={overlay} />
        </div>

        <DesktopNav menus={menus} overlay={overlay} settings={settings} activeUrl={activeUrl} onSelect={selectMenu} />

        <div className="hidden items-center gap-4 lg:flex xl:gap-6">
          <button
            aria-label={t('ค้นหา')}
            className={overlay ? 'text-white drop-shadow hover:text-white/80' : 'text-brand-800 hover:text-brand-600'}
          >
            <Search className="size-[19px]" strokeWidth={2.2} />
          </button>
          <LangSwitcher overlay={overlay} />
          <VisitButton />
        </div>

        <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={t('เมนู')}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-brand-100 bg-white lg:hidden">
          <nav className="container-bm flex flex-col py-3">
            <MobileNav
              menus={menus}
              activeUrl={activeUrl}
              onNavigate={(url) => {
                selectMenu(url)
                setOpen(false)
              }}
            />
            <LangRow />
            <VisitButton className="mt-3 w-max" onClick={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  )
}

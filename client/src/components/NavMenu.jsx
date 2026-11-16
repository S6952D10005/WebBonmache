import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Building,
  ChevronDown,
  LayoutGrid,
  Megaphone,
  PartyPopper,
  Phone,
  Presentation,
  Store,
  Tent,
  Warehouse,
} from 'lucide-react'
import { useLocation } from 'react-router'
import SmartLink from './SmartLink'
import { useI18n } from '../i18n'

/* icon names stored in nav_menus.icon → components (unknown names use LayoutGrid) */
const ICONS = { Store, Building, Tent, PartyPopper, Presentation, Megaphone, Warehouse }
const iconOf = (name) => ICONS[name] || LayoutGrid

/* ======================================================================== */
/*  Which menu is "current"                                                 */
/* ======================================================================== */

/** a menu is active when its link – or one of its dropdown links – is the current one */
export const isActive = (m, url) => m.url === url || !!m.children?.some((c) => c.url === url)

/**
 * Tracks the current menu link (e.g. "#leasing" or "/shops"):
 *  - another page (/shops …) → that page's menu
 *  - clicking a menu selects it straight away
 *  - while scrolling, the section in the upper part of the screen selects its menu
 *    (top of page → "หน้าแรก", bottom of page → the footer / Contact)
 */
export function useActiveMenu(menus) {
  const { pathname, hash } = useLocation()
  const [active, setActive] = useState(() => (pathname === '/' ? hash || '#' : pathname))
  const lockUntil = useRef(0)

  useEffect(() => {
    // other pages (e.g. /shops): the page's own menu is the current one
    if (pathname !== '/') {
      setActive(pathname)
      return
    }
    const urls = [...new Set(menus.flatMap((m) => [m.url, ...(m.children || []).map((c) => c.url)]))]
    const sections = urls
      .filter((u) => /^#.+/.test(u))
      .map((u) => [u, document.getElementById(u.slice(1))])
      .filter(([, el]) => el)

    const onScroll = () => {
      if (Date.now() < lockUntil.current) return // a click is scrolling the page – keep the clicked menu
      const doc = document.documentElement
      let current = '#'
      let best = -Infinity
      // a section counts once its top has reached the upper 40% of the screen
      const line = window.innerHeight * 0.4
      for (const [url, el] of sections) {
        const top = el.getBoundingClientRect().top
        if (top <= line && top > best) [best, current] = [top, url]
      }
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        // reached the bottom: the last section on the page (footer) wins
        const last = sections.reduce((a, b) => (a && a[1].offsetTop > b[1].offsetTop ? a : b), null)
        if (last) current = last[0]
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menus, pathname])

  const select = (url) => {
    if (!url || /^(https?:|tel:|mailto:)/.test(url)) return
    lockUntil.current = Date.now() + 1000
    setActive(url)
  }
  return [active, select]
}

/* ======================================================================== */
/*  Desktop                                                                 */
/* ======================================================================== */

/*
 * Menu links
 *  - one orange underline (the site's teal + orange pair) slides under the menu
 *    the mouse is on, and slides back under the current menu when the mouse
 *    leaves the bar (the "sliding underline" in DesktopNav)
 *  - hover : text turns teal (white over the hero)
 *  - active: the menu of the section being viewed / last clicked is bold
 */
const linkClass = (overlay, active) =>
  `relative flex items-center gap-1 whitespace-nowrap py-5 text-[13px] transition-colors duration-200 xl:text-[14px] ${
    overlay
      ? `text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)] ${active ? 'font-semibold' : 'text-white/90 hover:text-white'}`
      : active
        ? 'font-semibold text-brand-700'
        : 'text-[#3d5552] hover:text-brand-600'
  }`

/* one row of the dropdown – icon · label · hint on the right (becomes a key-cap on hover) */
function DropdownRow({ href, icon: Icon, label, hint, onClick }) {
  return (
    <li>
      <SmartLink
        href={href}
        onClick={onClick}
        className="group/row flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] text-[#2b3a38] outline-none transition-colors duration-150 hover:bg-brand-100 hover:text-brand-800 focus-visible:bg-brand-100 focus-visible:text-brand-800"
      >
        <Icon
          className="size-4 shrink-0 text-[#4a5a57] transition-colors duration-150 group-hover/row:text-brand-600 group-focus-visible/row:text-brand-600"
          strokeWidth={1.7}
        />
        <span className="flex-1 truncate font-medium">{label}</span>
        {hint ? (
          <span className="shrink-0 rounded-[5px] border border-transparent px-1 py-[2px] text-[10.5px] leading-none text-[#98a3a1] transition-all duration-150 group-hover/row:border-brand-200 group-hover/row:bg-white group-hover/row:text-brand-700 group-hover/row:shadow-[0_1px_2px_rgb(15_111_102/0.12)]">
            {hint}
          </span>
        ) : (
          <span className="grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-brand-200 bg-white text-accent-500 opacity-0 shadow-[0_1px_2px_rgb(15_111_102/0.12)] transition-all duration-150 -translate-x-1 group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100">
            <ArrowRight className="size-2.5" strokeWidth={2.6} />
          </span>
        )}
      </SmartLink>
    </li>
  )
}

/** menu with a dropdown – opens on hover, click/tap or keyboard focus; Esc closes */
function DesktopDropdown({ item, overlay, active, settings, onSelect, itemRef, onHover }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const timer = useRef()
  const show = () => {
    clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = (delay = 160) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), delay)
  }
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])

  const phone = settings?.phone

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={() => {
        show()
        onHover()
      }}
      onFocus={onHover}
      onMouseLeave={() => hide()}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hide(0)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={linkClass(overlay, active)}
      >
        {item.label}
        <ChevronDown className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={2.2} />
      </button>

      {/* menu card */}
      <div
        className={`absolute left-1/2 top-full z-50 w-[232px] -translate-x-1/2 pt-1 transition duration-200 ease-out ${
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-[0.97] opacity-0'
        } origin-top`}
      >
        <div className="rounded-xl border border-[#e4e9e8] bg-white p-1 text-left shadow-[0_18px_40px_-14px_rgb(16_40_38/0.28),0_2px_6px_-2px_rgb(16_40_38/0.08)]">
          {item.description && (
            <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#98a3a1]">
              {item.description}
            </p>
          )}

          <ul>
            {item.children.map((c) => (
              <DropdownRow
                key={c.id}
                href={c.url}
                icon={iconOf(c.icon)}
                label={c.label}
                onClick={() => {
                  close()
                  onSelect(c.url)
                }}
              />
            ))}
          </ul>

          <div className="mx-2 my-1 h-px bg-[#e9eeed]" />

          <ul>
            <DropdownRow
              href={item.url}
              icon={LayoutGrid}
              label={t('ดูพื้นที่ทั้งหมด')}
              hint={t('{n} ประเภท', { n: item.children.length })}
              onClick={() => {
                close()
                onSelect(item.url)
              }}
            />
            {phone && (
              <DropdownRow
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                icon={Phone}
                label={t('โทรหาฝ่ายขาย')}
                hint={phone}
                onClick={close}
              />
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function DesktopNav({ menus, overlay, settings, activeUrl, onSelect }) {
  const navRef = useRef(null)
  const items = useRef({})
  const [hoverId, setHoverId] = useState(null)
  const [bar, setBar] = useState({ left: 0, width: 0, visible: false })
  const [animate, setAnimate] = useState(false)

  // the underline sits under the hovered menu, otherwise under the current one
  const targetId = hoverId ?? menus.find((m) => isActive(m, activeUrl))?.id

  useLayoutEffect(() => {
    const measure = () => {
      const el = items.current[targetId]
      setBar(el ? { left: el.offsetLeft, width: el.offsetWidth, visible: true } : (b) => ({ ...b, visible: false }))
    }
    measure()
    document.fonts?.ready.then(measure) // labels change width once the web font arrives
    const ro = new ResizeObserver(measure)
    if (navRef.current) ro.observe(navRef.current)
    return () => ro.disconnect()
  }, [targetId, menus])

  // no slide-in on first paint – only animate after the bar is in place
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const refFor = (id) => (el) => {
    items.current[id] = el
  }

  return (
    <nav
      ref={navRef}
      onMouseLeave={() => setHoverId(null)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHoverId(null)}
      className="relative hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-8 2xl:gap-8"
    >
      {menus.map((m) =>
        m.children?.length ? (
          <DesktopDropdown
            key={m.id}
            item={m}
            overlay={overlay}
            active={isActive(m, activeUrl)}
            settings={settings}
            onSelect={onSelect}
            itemRef={refFor(m.id)}
            onHover={() => setHoverId(m.id)}
          />
        ) : (
          <SmartLink
            key={m.id}
            ref={refFor(m.id)}
            href={m.url}
            onClick={() => onSelect(m.url)}
            onMouseEnter={() => setHoverId(m.id)}
            onFocus={() => setHoverId(m.id)}
            aria-current={isActive(m, activeUrl) ? 'location' : undefined}
            className={linkClass(overlay, isActive(m, activeUrl))}
          >
            {m.label}
          </SmartLink>
        ),
      )}

      {/* sliding underline */}
      <span
        aria-hidden="true"
        style={{ left: bar.left, width: bar.width }}
        className={`pointer-events-none absolute bottom-3.5 h-[3px] rounded-full bg-gradient-to-r from-[#ff9d48] to-[#ee5f14] shadow-[0_1px_4px_rgb(238_95_20/0.45)] ${
          animate ? 'transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
        } ${bar.visible ? 'opacity-100' : 'opacity-0'}`}
      />
    </nav>
  )
}

/* ======================================================================== */
/*  Mobile / tablet (accordion inside the slide-down menu)                  */
/* ======================================================================== */

function MobileItem({ item, onNavigate, activeUrl }) {
  const current = isActive(item, activeUrl)
  const [open, setOpen] = useState(false)
  if (!item.children?.length)
    return (
      <SmartLink
        href={item.url}
        onClick={() => onNavigate(item.url)}
        className={`flex items-center gap-2 py-2.5 ${current ? 'font-semibold text-brand-700' : 'text-ink'}`}
      >
        {item.label}
        {current && <span className="h-[3px] w-4 rounded-full bg-gradient-to-r from-[#ff9d48] to-[#ee5f14]" />}
      </SmartLink>
    )

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between py-2.5 text-left ${open || current ? 'font-semibold text-brand-700' : 'text-ink'}`}
      >
        {item.label}
        <ChevronDown className={`size-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mb-2 rounded-2xl border border-[#e4e9e8] bg-white p-1.5 shadow-[0_8px_24px_-12px_rgb(16_40_38/0.25)]">
          {item.description && (
            <p className="px-3 pb-1 pt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#98a3a1]">
              {item.description}
            </p>
          )}
          <ul className="sm:grid sm:grid-cols-2">
            {item.children.map((c) => {
              const Icon = iconOf(c.icon)
              return (
                <li key={c.id}>
                  <SmartLink
                    href={c.url}
                    onClick={() => onNavigate(c.url)}
                    className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#2b3a38] active:bg-[#f2f5f4]"
                  >
                    <Icon className="size-[18px] shrink-0 text-[#4a5a57]" strokeWidth={1.7} />
                    {c.label}
                  </SmartLink>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export function MobileNav({ menus, onNavigate, activeUrl }) {
  return menus.map((m) => <MobileItem key={m.id} item={m} onNavigate={onNavigate} activeUrl={activeUrl} />)
}

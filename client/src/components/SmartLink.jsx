import { forwardRef } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router'

/**
 * One link component for every URL the site stores (menus, footer, database):
 *  - "https://…", "tel:…", "mailto:…" → normal <a> (external links open in a new tab)
 *  - "/shops", "/shops?cat=2"          → in-app page change (no reload)
 *  - "#leasing" on the home page       → jumps to that section
 *  - "#leasing" on any other page      → goes to the home page, then to that section
 *
 * Going to a different page plays the page transition (circle reveal, index.css)
 * through the browser's View Transitions API. Browsers without it, ctrl/⌘-clicks
 * and same-page filter links (?cat=…) navigate normally.
 */
const SmartLink = forwardRef(function SmartLink({ href = '#', children, onClick, ...props }, ref) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (/^(https?:|tel:|mailto:)/.test(href)) {
    const external = /^https?:/.test(href)
    return (
      <a ref={ref} href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} {...props}>
        {children}
      </a>
    )
  }

  if (href.startsWith('#') && pathname === '/') {
    return (
      <a ref={ref} href={href} onClick={onClick} {...props}>
        {children}
      </a>
    )
  }

  const to = href.startsWith('#') ? (href === '#' ? '/' : `/${href}`) : href
  const otherPage = (to.split(/[?#]/)[0] || '/') !== pathname

  const handleClick = (e) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      !otherPage ||
      !document.startViewTransition ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return // let <Link> navigate normally
    e.preventDefault()
    // the browser snapshots the old page, React renders the new one synchronously, then they animate
    document.startViewTransition(() => flushSync(() => navigate(to)))
  }

  return (
    <Link ref={ref} to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
})

export default SmartLink

import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useLocation } from 'react-router'
import { Logo } from './Decor'
import SmartLink from './SmartLink'
import { useI18n } from '../i18n'
// (SmartLink: internal pages, home-page sections and external links in a new tab)

/* simple brand glyphs (lucide no longer ships brand logos) – also used on the Contact page */
export const Social = {
  facebook: (
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.1" />
    </>
  ),
  youtube: (
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  ),
  tiktok: (
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
  ),
  line: (
    <path d="M12 4C7 4 3 7.3 3 11.3c0 3.6 3.2 6.6 7.5 7.2.3.1.7.2.8.5.1.2.1.6 0 .8l-.1.8c0 .2-.2.9.8.5s5.4-3.2 7.4-5.4c1.3-1.5 2-3 2-4.6C21 7.3 17 4 12 4Zm-3.6 9.6H6.6c-.3 0-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3h1.3c.3 0 .5.2.5.5s-.2.5-.5.5Zm1.9-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3.5Zm4.2 0c0 .2-.1.4-.3.5h-.2c-.2 0-.3-.1-.4-.2l-1.8-2.5v2.2c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.6c0-.2.1-.4.3-.5h.2c.2 0 .3.1.4.2l1.8 2.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3.5Zm2.9-2.2c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3c.3 0 .5.2.5.5s-.2.5-.5.5h-1.8c-.3 0-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5h1.8c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3Z" />
  ),
}
// each network's own colour, shown when its round button is pointed at
const SOCIAL = {
  facebook: ['Facebook', '#1877f2'],
  instagram: ['Instagram', '#e1306c'],
  line: ['LINE', '#06c755'],
  tiktok: ['TikTok', '#111111'],
  youtube: ['YouTube', '#ff0000'],
}

/**
 * one link in a column: on hover a short orange bar slides in before it and the text steps right;
 * with `markCurrent` the page you're on is shown the same way · links to other sites get a small ↗ that lifts on hover
 */
function FooterLink({ href = '#', markCurrent = false, children }) {
  const { pathname } = useLocation()
  const current = markCurrent && href.startsWith('/') && href.split(/[?#]/)[0] === pathname && !href.includes('#')
  const external = /^https?:/.test(href)
  return (
    <SmartLink
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`group/link inline-flex items-center py-1 transition-colors duration-200 hover:text-white ${current ? 'text-white' : 'text-white/75'}`}
    >
      <span
        aria-hidden="true"
        className={`h-[2px] rounded-full bg-accent-400 transition-all duration-300 group-hover/link:mr-2 group-hover/link:w-3.5 ${current ? 'mr-2 w-3.5' : 'w-0'}`}
      />
      {children}
      {external && <ArrowUpRight className="ml-1 size-3.5 opacity-60 transition duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:opacity-100" strokeWidth={2.4} />}
    </SmartLink>
  )
}

/** column heading with a short orange bar under it */
function Heading({ children }) {
  return (
    <h3 className="text-[16px] font-bold text-white after:mt-2.5 after:block after:h-[3px] after:w-8 after:rounded-full after:bg-accent-400">{children}</h3>
  )
}

function LinkColumn({ title, links, markCurrent = false }) {
  if (!links.length) return null
  return (
    <div>
      <Heading>{title}</Heading>
      <ul className="mt-4 space-y-1 text-[14px]">
        {links.map((l) => (
          <li key={l.id}>
            <FooterLink href={l.url} markCurrent={markCurrent}>
              {l.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer({ settings, links = [] }) {
  const { t } = useI18n()
  const group = (key) => links.filter((l) => l.group_key === key)
  const socials = ['facebook', 'instagram', 'line', 'tiktok', 'youtube'].map((k) => [k, settings[`${k}_url`]]).filter(([, url]) => url) // empty = hidden

  const contact = [
    { icon: MapPin, href: settings.map_url, text: settings.address },
    { icon: Clock, text: settings.opening_hours },
    { icon: Mail, href: settings.email && `mailto:${settings.email}`, text: settings.email },
    { icon: Phone, href: settings.phone && `tel:${settings.phone.replace(/[^\d+]/g, '')}`, text: settings.phone },
  ].filter((c) => c.text)

  const legal = group('legal')
  const BottomBar = ({ className = '', linkClass = '' }) => (
    <div className={`flex flex-col items-center gap-2 text-center text-[12.5px] md:flex-row md:justify-center md:gap-x-10 ${className}`}>
      <p>
        © {new Date().getFullYear()} {settings.copyright || settings.site_name}
      </p>
      {legal.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5">
          {legal.map((l) => (
            <li key={l.id}>
              <SmartLink href={l.url} className={`transition hover:underline ${linkClass}`}>
                {l.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    /*
      Footer = ONE background image: footer-bg.webp at its real proportions (2415×651) at 100% width,
      anchored to the bottom. The bottom 20% of the image (plain light-green band) is cut off by pushing
      it down 20% of its height (0.2 × 26.96vw = 5.39vw). The content sits in the dark part; the footer
      grows with its content and the matching dark colour (#016565) fills above the image.
      Layout: brand + social · pages · services · contact (phones: brand, then pages | services, then contact).
    */
    <footer
      id="contact"
      style={{
        backgroundImage: `url(${settings.footer_image})`,
        backgroundPosition: 'left calc(100% + 5.39vw)',
      }}
      className="@container relative mt-5 min-h-[21.57vw] overflow-hidden bg-[#016565] bg-[length:100%_auto] bg-no-repeat text-white"
    >
      <div className="pb-[12cqw] md:pb-[10cqw]">
        <div className="nav-scale relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-12 lg:pt-14">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.35fr_0.85fr_1fr_1.35fr] lg:gap-x-12">
            {/* ---------- brand + social ---------- */}
            <div className="col-span-2 lg:col-span-1">
              {/* the logo is itself a link to the home page; it lifts a little on hover */}
              <div className="inline-block transition duration-300 hover:-translate-y-0.5 hover:opacity-90">
                <Logo name={settings.site_name} tagline={settings.tagline} light size="h-[50px]" />
              </div>
              {settings.footer_description && <p className="mt-5 max-w-[340px] text-[14px] leading-[1.75] text-white/75">{settings.footer_description}</p>}
              {socials.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  {socials.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={SOCIAL[key][0]}
                      title={SOCIAL[key][0]}
                      style={{ '--sc': SOCIAL[key][1] }}
                      className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition duration-300 hover:-translate-y-1 hover:bg-[var(--sc)] hover:ring-transparent hover:shadow-[0_10px_20px_-8px_var(--sc)]"
                    >
                      <svg viewBox="0 0 24 24" className="size-[19px]" fill="currentColor" aria-hidden="true">
                        {Social[key]}
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* ---------- pages · services ---------- */}
            <LinkColumn title={t('ลิงก์ด่วน')} links={group('quick')} markCurrent />
            <LinkColumn title={t('บริการของเรา')} links={group('service')} />

            {/* ---------- contact: icon in a round badge that turns orange on hover ---------- */}
            <div className="col-span-2 lg:col-span-1">
              <Heading>{t('ติดต่อเรา')}</Heading>
              <ul className="mt-4 space-y-3 text-[14px] leading-[1.6]">
                {contact.map(({ icon: Icon, href, text }, i) => {
                  const inner = (
                    <>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[#9ff0e3] transition duration-300 group-hover/c:bg-accent-500 group-hover/c:text-white">
                        <Icon className="size-[17px]" strokeWidth={2} />
                      </span>
                      <span className="pt-1.5">{text}</span>
                    </>
                  )
                  const cls = 'group/c flex gap-3 text-white/75 transition-colors duration-200'
                  return (
                    <li key={i}>
                      {href ? (
                        <SmartLink href={href} className={`${cls} hover:text-white`}>
                          {inner}
                        </SmartLink>
                      ) : (
                        <div className={cls}>{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* bottom bar – phones: in the dark area */}
          <BottomBar className="mt-10 border-t border-white/15 pt-4 text-white/60 md:hidden" />
        </div>
      </div>

      {/* bottom bar – tablet / desktop: on the light-green band at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 hidden pb-[0.9cqw] md:block">
        <BottomBar className="px-4 font-medium text-[#0a4a45]" linkClass="hover:text-[#06302c]" />
      </div>
    </footer>
  )
}

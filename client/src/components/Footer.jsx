import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from './Decor'
import SmartLink from './SmartLink'
import { useI18n } from '../i18n'

/* simple brand glyphs (lucide no longer ships brand logos) */
const Social = {
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
  line: (
    <path d="M12 4C7 4 3 7.3 3 11.3c0 3.6 3.2 6.6 7.5 7.2.3.1.7.2.8.5.1.2.1.6 0 .8l-.1.8c0 .2-.2.9.8.5s5.4-3.2 7.4-5.4c1.3-1.5 2-3 2-4.6C21 7.3 17 4 12 4Zm-3.6 9.6H6.6c-.3 0-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3h1.3c.3 0 .5.2.5.5s-.2.5-.5.5Zm1.9-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3.5Zm4.2 0c0 .2-.1.4-.3.5h-.2c-.2 0-.3-.1-.4-.2l-1.8-2.5v2.2c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.6c0-.2.1-.4.3-.5h.2c.2 0 .3.1.4.2l1.8 2.5V9.6c0-.3.2-.5.5-.5s.5.2.5.5v3.5Zm2.9-2.2c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3c.3 0 .5.2.5.5s-.2.5-.5.5h-1.8c-.3 0-.5-.2-.5-.5V9.6c0-.3.2-.5.5-.5h1.8c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3Z" />
  ),
}

/** internal pages, sections and external links (new tab) – see SmartLink */
function FooterLink({ href = '#', children, className = '' }) {
  return (
    <SmartLink href={href} className={`transition hover:text-white ${className}`}>
      {children}
    </SmartLink>
  )
}

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold text-white 3xl:text-[15px]">{title}</h3>
      {/* desktop (xl): 2 short sub-columns so the list stays above the light band */}
      <ul className="mt-5 space-y-3 text-[14px] text-white/75 3xl:mt-3.5 3xl:grid 3xl:grid-cols-2 3xl:gap-x-6 3xl:gap-y-2.5 3xl:space-y-0 3xl:text-[13.5px]">
        {links.map((l) => (
          <li key={l.id}>
            <FooterLink href={l.url}>{l.label}</FooterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer({ settings, links = [] }) {
  const { t } = useI18n()
  const group = (key) => links.filter((l) => l.group_key === key)
  const socials = [
    ['facebook', settings.facebook_url],
    ['instagram', settings.instagram_url],
    ['line', settings.line_url],
    ['youtube', settings.youtube_url],
  ].filter(([, url]) => url) // empty = hidden

  const contact = [
    { icon: MapPin, href: settings.map_url, text: (
        <>
          <span className="block font-semibold text-white">{settings.address_title}</span>
          {settings.address}
        </>
      ) },
    { icon: Clock, text: settings.opening_hours },
    { icon: Mail, href: settings.email && `mailto:${settings.email}`, text: settings.email },
    { icon: Phone, href: settings.phone && `tel:${settings.phone.replace(/[^\d+]/g, '')}`, text: settings.phone },
  ].filter((c) => c.text)

  const legal = group('legal')
  const BottomBar = ({ className = '', linkClass = '', centered = false }) => (
    <div
      className={`flex flex-col gap-2 text-[12px] md:flex-row md:items-center ${
        centered ? 'md:justify-center md:gap-x-10' : 'md:justify-between'
      } ${className}`}
    >
      <p>
        © {new Date().getFullYear()} {settings.copyright || settings.site_name}
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
        {legal.map((l) => (
          <li key={l.id}>
            <FooterLink href={l.url} className={linkClass}>
              {l.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    /*
      Footer = ONE background image: footer-bg.webp at its real proportions
      (2415×651) at 100% width. The footer ends just below the leaves: the
      bottom 20% of the image (plain light-green band) is cut off by pushing the
      image down by 20% of its height (0.2 × 26.96vw = 5.39vw).
      - Large screens (≥1800px): the footer is exactly the visible part of
        the image (aspect 2415/521). Content sits in the dark upper part; the link
        lists use 2 sub-columns so they end above the light-green band.
      - Smaller screens: the content needs more height, so the footer grows and
        the matching dark colour (#016565) fills above the image.
    */
    <footer
      id="contact"
      style={{
        backgroundImage: `url(${settings.footer_image})`,
        backgroundPosition: 'left calc(100% + 5.39vw)',
      }}
      className="@container relative mt-5 min-h-[21.57vw] overflow-hidden bg-[#016565] bg-[length:100%_auto] bg-no-repeat text-white 3xl:aspect-[2415/521]"
    >
      <div className="pb-[11cqw] 3xl:pb-0">
        <div className="nav-scale relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-12 3xl:pt-[2.6cqw]">
          {/* ---------- 4 columns ---------- */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-14 3xl:grid-cols-[1.25fr_1.55fr_1.7fr_1.35fr] 3xl:gap-10">
            {/* brand */}
            <div className="col-span-2 lg:col-span-1">
              <Logo name={settings.site_name} tagline={settings.tagline} light size="h-[50px] 3xl:h-[46px]" />
              {settings.footer_description && (
                <p className="mt-5 max-w-[330px] text-[14px] leading-[1.75] text-white/75 3xl:mt-3 3xl:text-[13px] 3xl:leading-[1.65]">
                  {settings.footer_description}
                </p>
              )}
              {socials.length > 0 && (
                <div className="mt-6 flex items-center gap-5 3xl:mt-4">
                  {socials.map(([name, url]) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="text-white/85 transition hover:text-accent-400"
                    >
                      <svg viewBox="0 0 24 24" className="size-[22px] 3xl:size-5" fill="currentColor">
                        {Social[name]}
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <LinkColumn title={t('ลิงก์ด่วน')} links={group('quick')} />
            <LinkColumn title={t('บริการของเรา')} links={group('service')} />

            {/* contact */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-[16px] font-semibold text-white 3xl:text-[15px]">{t('ติดต่อเรา')}</h3>
              <ul className="mt-5 space-y-4 text-[14px] leading-[1.65] text-white/75 3xl:mt-3.5 3xl:space-y-2.5 3xl:text-[13.5px] 3xl:leading-[1.55]">
                {contact.map(({ icon: Icon, href, text }, i) => (
                  <li key={i} className="flex gap-3">
                    <Icon className="mt-0.5 size-[18px] shrink-0 text-[#7fe0d2]" strokeWidth={1.8} />
                    {href ? <FooterLink href={href}>{text}</FooterLink> : <span>{text}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* bottom bar – phones: in the dark area */}
          <BottomBar className="mt-8 border-t border-white/15 pt-4 text-white/60 md:hidden" />
        </div>
      </div>

      {/* bottom bar – tablet / desktop: on the light-green band at the new bottom edge */}
      <div className="absolute inset-x-0 bottom-0 hidden pb-[0.9cqw] md:block">
        {/* centred as one group so it stays on the solid part of the band (the edges are ragged brush) */}
        <div className="mx-auto w-full px-4">
          <BottomBar centered className="font-medium text-[#0a4a45]" linkClass="hover:!text-[#06302c] hover:underline" />
        </div>
      </div>
    </footer>
  )
}

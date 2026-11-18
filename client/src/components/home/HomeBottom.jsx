import { useState } from 'react'
import { ArrowRight, Award, Clock3, MapPin, Medal, Navigation, Phone, Play, ShieldCheck, Trophy } from 'lucide-react'
import SmartLink from '../SmartLink'
import { SmartImage } from '../Decor'
import { HomeTitle } from './HomeFeeds'
import { useI18n } from '../../i18n'

const AWARD_ICONS = { Award, Medal, ShieldCheck, Trophy }

/* ======================================================================== */
/*  Awards & recognition                                                    */
/* ======================================================================== */
export function Awards({ items = [] }) {
  const { t } = useI18n()
  return (
    <section className="mt-16 bg-[#fbf7ee] py-14 lg:mt-20 lg:py-16">
      <div className="container-bm">
        <HomeTitle eyebrow="Awards & recognition" title={t('รางวัลและมาตรฐานที่ได้รับ')} href="#" />
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {items.map((a) => {
            const Icon = AWARD_ICONS[a.icon] || Award
            return (
              // phones: compact row (icon left) · tablet / desktop: centred card
              <div
                key={a.id}
                className="group flex items-center gap-4 rounded-[18px] border border-[#efe3c8] bg-white px-4 py-4 transition hover:-translate-y-1 hover:shadow-[0_16px_32px_-20px_rgb(150_110_30/0.45)] sm:block sm:px-5 sm:py-7 sm:text-center"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#ecd9ad] bg-[#fdf6e6] text-[#b8862b] transition group-hover:bg-[#b8862b] group-hover:text-white sm:mx-auto sm:size-16">
                  <Icon className="size-6 sm:size-7" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-snug text-ink sm:mt-4">{a.name}</p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {a.by} · {t('ปี {y}', { y: a.year })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  Follow us on social media – filter tabs + posts                        */
/* ======================================================================== */
const PLATFORM = {
  facebook: { name: 'Facebook', color: '#1877f2' },
  youtube: { name: 'YouTube', color: '#ff0000' },
  instagram: { name: 'Instagram', color: '#d62976' },
  tiktok: { name: 'TikTok', color: '#111111' },
}

/* simple brand marks (drawn here – the icon set has no brand logos) */
function BrandIcon({ platform, className = 'size-4' }) {
  const common = { viewBox: '0 0 24 24', className, 'aria-hidden': true }
  switch (platform) {
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
          <path d="M10 9l5 3-5 3z" fill="#fff" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg {...common} fill="currentColor">
          <path d="M16.6 3c.3 2 1.6 3.4 3.6 3.6v3c-1.3 0-2.6-.4-3.6-1.1v6.2a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v3.1a2.3 2.3 0 1 0 1.4 2.1V3h3z" />
        </svg>
      )
    default:
      return null
  }
}

export function SocialFeed({ links = [], posts = [] }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('all')
  const platforms = [...new Set(posts.map((p) => p.platform))]
  const shown = tab === 'all' ? posts : posts.filter((p) => p.platform === tab)

  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Follow us on social media" title={t('ติดตามเราบนโซเชียลมีเดีย')} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex flex-wrap gap-1.5">
          {['all', ...platforms].map((p) => {
            const on = tab === p
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(p)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                  on ? 'border-brand-600 bg-brand-600 text-white' : 'border-[#d9e4e1] text-[#3d5552] hover:border-brand-600 hover:text-brand-700'
                }`}
              >
                {p !== 'all' && <BrandIcon platform={p} className="size-3.5" />}
                {p === 'all' ? t('ทั้งหมด') : PLATFORM[p]?.name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          {links.map((l) => (
            <SmartLink
              key={l.platform}
              href={l.url}
              aria-label={PLATFORM[l.platform]?.name}
              title={PLATFORM[l.platform]?.name}
              className="grid size-9 place-items-center rounded-full text-white transition hover:-translate-y-0.5 hover:opacity-90"
              style={{ backgroundColor: PLATFORM[l.platform]?.color }}
            >
              <BrandIcon platform={l.platform} className="size-[18px]" />
            </SmartLink>
          ))}
        </div>
      </div>

      {/* one row of 6 on desktop (like an Instagram strip), 3 per row on tablet, 2 on phones */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {shown.map((p) => {
          const pf = PLATFORM[p.platform] || {}
          return (
            <SmartLink key={p.id} href={p.url} className="group relative block aspect-square overflow-hidden rounded-[16px] bg-brand-50 motion-safe:animate-[card-in_0.4s_ease-out]">
              <SmartImage src={p.image} alt="" className="h-full w-full transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full text-white shadow" style={{ backgroundColor: pf.color }}>
                <BrandIcon platform={p.platform} className="size-4" />
              </span>
              {p.platform === 'youtube' && (
                <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#ff0000] shadow-lg transition group-hover:scale-110">
                  <Play className="ml-0.5 size-5" fill="currentColor" />
                </span>
              )}
              <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-[12.5px] font-semibold leading-snug text-white sm:p-4 sm:text-[13.5px] lg:p-3 lg:text-[12px]">{p.text}</p>
            </SmartLink>
          )
        })}
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  Map – Google map on the left, "Getting here" panel on the right         */
/*  (address / phone / opening hours come from the site settings)           */
/* ======================================================================== */
export function GettingHere({ settings = {}, info = {} }) {
  const { t } = useI18n()
  // the map pin is found by name (mapQuery); "นำทาง" opens the market's own Google Maps link when there is one
  const place = info.mapQuery || settings.site_name
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`
  const directions = settings.map_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`

  return (
    <section id="getting-here" className="container-bm scroll-mt-24 pb-16 pt-16 lg:pb-20 lg:pt-20">
      <div className="grid overflow-hidden rounded-[22px] bg-[#0b2523] shadow-[0_20px_44px_-28px_rgb(6_48_44/0.7)] lg:grid-cols-[1fr_380px]">
        <div className="relative h-[280px] bg-[#e8ecea] sm:h-[340px] lg:h-auto lg:min-h-[420px]">
          <iframe
            title={t('แผนที่ {name}', { name: settings.site_name })}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-10 text-center text-white sm:px-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#f9a46b]">Getting here</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight">{info.title}</h2>
          {info.text && <p className="mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-white/75">{info.text}</p>}

          <ul className="mt-6 w-full max-w-[300px] space-y-3 text-[13px] text-white/85">
            {settings.address && (
              <li className="flex items-start justify-center gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#f9a46b]" strokeWidth={2.2} />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.phone && (
              <li className="flex items-center justify-center gap-2">
                <Phone className="size-4 shrink-0 text-[#f9a46b]" strokeWidth={2.2} />
                <span>
                  <b className="font-bold text-white">{t('โทร')}</b>{' '}
                  <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white hover:underline">
                    {settings.phone}
                  </a>
                </span>
              </li>
            )}
            {settings.opening_hours && (
              <li className="flex items-center justify-center gap-2">
                <Clock3 className="size-4 shrink-0 text-[#f9a46b]" strokeWidth={2.2} />
                <span>
                  <b className="font-bold text-white">{t('เวลาเปิด')}</b> {settings.opening_hours}
                </span>
              </li>
            )}
          </ul>

          <div className="mt-8 grid w-full max-w-[300px] gap-3">
            <SmartLink
              href={info.discoverUrl || '/shops'}
              className="group flex items-center justify-center gap-2 rounded-full bg-white py-3 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[#0b2523] transition hover:bg-[#f37021] hover:text-white"
            >
              {t('สำรวจตลาด')}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
            </SmartLink>
            <SmartLink
              href={directions}
              className="group flex items-center justify-center gap-2 rounded-full border border-white/70 py-3 text-[12.5px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10"
            >
              <Navigation className="size-4" strokeWidth={2.4} />
              {t('นำทาง')}
            </SmartLink>
          </div>
        </div>
      </div>
    </section>
  )
}

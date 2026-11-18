import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  MapPin,
  Medal,
  MessageCircle,
  Navigation,
  Phone,
  Play,
  ShieldCheck,
  ThumbsUp,
  Trophy,
} from 'lucide-react'
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
              // phones: compact row (icon left) · tablet / desktop: centred card – static, no hover effect
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-[18px] border border-[#efe3c8] bg-white px-4 py-4 sm:block sm:px-5 sm:py-7 sm:text-center"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#ecd9ad] bg-[#fdf6e6] text-[#b8862b] sm:mx-auto sm:size-16">
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
/*
 * Each app's own colours – used by the post cards' hover:
 *   color = solid brand colour · ring = border that lights up on hover · cta = link text
 */
const PLATFORM = {
  facebook: { name: 'Facebook', color: '#1877f2', ring: '#1877f2', cta: 'ดูโพสต์บน Facebook' },
  youtube: { name: 'YouTube', color: '#ff0000', ring: '#ff0000', cta: 'ดูวิดีโอบน YouTube' },
  instagram: {
    name: 'Instagram',
    color: '#d62976',
    ring: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)',
    cta: 'ดูโพสต์บน Instagram',
  },
  tiktok: { name: 'TikTok', color: '#111111', ring: 'linear-gradient(120deg,#25f4ee,#111111 45%,#111111 55%,#fe2c55)', cta: 'ดูคลิปบน TikTok' },
}

/** 18400 → "18.4K" */
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n))

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

/**
 * One post shown like on the app itself: page avatar + name + date, the app's
 * icon, the post title and text, the picture and the like / view counts.
 * Hover = that app's own style: its colour lights up the border (Instagram /
 * TikTok gradient), the icon fills, and
 *   Facebook  → a "like" thumb pops on the picture
 *   YouTube   → the play button turns red
 *   Instagram → a heart pops (double-tap)
 *   TikTok    → cyan / pink "glitch" edges + black play button
 */
function PostCard({ post: p, page }) {
  const { t } = useI18n()
  const pf = PLATFORM[p.platform] || PLATFORM.facebook
  const video = p.platform === 'youtube' || p.platform === 'tiktok'
  return (
    <SmartLink
      href={p.url}
      style={{ '--pc': pf.color, '--ring': pf.ring }}
      className="group relative flex w-[80%] shrink-0 snap-start flex-col rounded-[18px] p-[1.5px] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_36px_-22px_var(--pc)] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/4)]"
    >
      {/* border: grey → the app's colour / gradient */}
      <span aria-hidden="true" className="absolute inset-0 rounded-[18px] bg-[#e6eeec]" />
      <span aria-hidden="true" className="absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'var(--ring)' }} />

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[16.5px] bg-white">
        {/* header: page + date + app icon */}
        <div className="flex items-center gap-2.5 px-3.5 pb-2 pt-3.5">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-[#e3ebe9]">
            <img src="/images/logo-color.webp" alt="" className="size-7 object-contain" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-ink transition-colors group-hover:text-[var(--pc)]">{page}</span>
            <span className="block truncate text-[11px] text-muted">{p.date}</span>
          </span>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--pc)_12%,white)] text-[var(--pc)] transition duration-300 group-hover:bg-[var(--pc)] group-hover:text-white">
            <BrandIcon platform={p.platform} className="size-3.5" />
          </span>
        </div>

        {/* title + text */}
        <div className="px-3.5 pb-3">
          <p className="line-clamp-1 text-[13.5px] font-extrabold leading-snug text-ink">{p.title || p.text}</p>
          {p.title && <p className="mt-0.5 line-clamp-2 min-h-[2.8em] text-[12.5px] leading-[1.4] text-[#55625f]">{p.text}</p>}
        </div>

        {/* picture */}
        <div className="relative mx-3.5 aspect-[4/3] overflow-hidden rounded-[12px] bg-brand-50">
          <SmartImage src={p.image} alt="" className="h-full w-full transition duration-700 group-hover:scale-105" />
          {video && (
            <span
              className={`absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-[var(--pc)] group-hover:text-white ${
                p.platform === 'youtube' ? 'text-[#ff0000]' : 'text-[#111]'
              }`}
            >
              <Play className="ml-0.5 size-[18px]" fill="currentColor" />
            </span>
          )}
          {p.platform === 'instagram' && (
            <Heart
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 scale-0 fill-white text-white opacity-0 drop-shadow-[0_4px_12px_rgb(214_41_118/0.7)] transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          {p.platform === 'facebook' && (
            <span className="absolute bottom-2.5 left-2.5 grid size-9 translate-y-2 scale-50 place-items-center rounded-full bg-[#1877f2] text-white opacity-0 shadow-lg ring-2 ring-white transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
              <ThumbsUp className="size-4" fill="currentColor" />
            </span>
          )}
          {p.platform === 'tiktok' && (
            // TikTok "glitch": cyan + pink copies of the frame slide out on hover
            <>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[12px] ring-2 ring-[#25f4ee] opacity-0 transition duration-300 group-hover:-translate-x-[3px] group-hover:opacity-100" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[12px] ring-2 ring-[#fe2c55] opacity-0 transition duration-300 group-hover:translate-x-[3px] group-hover:opacity-100" />
            </>
          )}
        </div>

        {/* counts + link to the post */}
        <div className="mt-auto flex items-center gap-3 px-3.5 pb-3 pt-2.5 text-[11.5px] font-semibold text-muted">
          {p.views != null && (
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" strokeWidth={2.2} /> {compact(p.views)}
            </span>
          )}
          {p.likes != null && (
            <span className="flex items-center gap-1">
              {p.platform === 'facebook' ? <ThumbsUp className="size-3.5" strokeWidth={2.2} /> : <Heart className="size-3.5" strokeWidth={2.2} />}
              {compact(p.likes)}
            </span>
          )}
          {p.comments != null && (
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" strokeWidth={2.2} /> {compact(p.comments)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 whitespace-nowrap text-[var(--pc)] opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:-translate-x-1">
            {t(pf.cta)}
            <ArrowRight className="size-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </SmartLink>
  )
}

export function SocialFeed({ links = [], posts = [], page = 'Bon Marché' }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('all')
  const platforms = [...new Set(posts.map((p) => p.platform))]
  const shown = tab === 'all' ? posts : posts.filter((p) => p.platform === tab)

  // the row slides sideways (4 posts per view on desktop) – arrows next to the title
  const row = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  useEffect(() => {
    const el = row.current
    if (!el) return
    el.scrollTo({ left: 0 })
    const check = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [tab, posts.length])
  const slide = (dir) => {
    const el = row.current
    const card = el?.firstElementChild
    if (card) el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  return (
    <section className="container-bm pt-16 lg:pt-20">
      <HomeTitle eyebrow="Follow us on social media" title={t('ติดตามเราบนโซเชียลมีเดีย')}>
        <div className="mb-1 ml-auto hidden gap-1.5 sm:flex">
          {[
            [ChevronLeft, t('ก่อนหน้า'), -1, edge.start],
            [ChevronRight, t('ถัดไป'), 1, edge.end],
          ].map(([Icon, label, dir, off]) => (
            <button
              key={label}
              type="button"
              onClick={() => slide(dir)}
              aria-label={label}
              className={`grid size-9 place-items-center rounded-full border border-[#d9e4e1] text-brand-800 transition ${
                off ? 'opacity-35' : 'hover:border-brand-600 hover:bg-brand-600 hover:text-white'
              }`}
            >
              <Icon className="size-4" strokeWidth={2.4} />
            </button>
          ))}
        </div>
      </HomeTitle>

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

      {/* post cards: 4 per view on desktop, 2 on tablet, 1 + a peek on phones; arrows / swipe for more */}
      <div ref={row} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 [scrollbar-width:none]">
        {shown.map((p) => (
          <PostCard key={p.id} post={p} page={page} />
        ))}
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

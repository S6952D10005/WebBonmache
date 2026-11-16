import { ArrowRight, CalendarDays, MapPin, Search } from 'lucide-react'
import { useI18n } from '../i18n'
import { useParallax } from './ScrollFx'

const quickLinks = [
  { icon: Search, label: 'ค้นหาร้านค้า / อาหาร / สินค้า', href: '#shops' },
  { icon: CalendarDays, label: 'ดูอีเวนต์ / โปรโมชั่น', href: '#events' },
  { icon: MapPin, label: 'การเดินทาง / วิธีมาที่นี่', href: '#visit' },
]

/**
 * Hero = designed banner image (title, "Open now", subtitle are part of the artwork)
 * + quick-search band in HTML.
 * Banner file: client/public/images/hero-banner.webp (2537×684) – a WebP copy of
 * client/asset/blackground/blackgroundBonMarché.png. If the source image changes
 * size, update the aspect ratio below to match.
 */
export default function Hero({ settings }) {
  const { t } = useI18n()
  const parallax = useParallax(0.3, 1.1) // banner moves slower than the page
  return (
    <section className="relative bg-white">
      <div className="@container relative w-full overflow-hidden">
        <img
          ref={parallax}
          src={settings.hero_image}
          alt={`${settings.hero_title_1} ${settings.hero_title_2} – ${settings.hero_subtitle?.replace('\n', ' ')}`}
          className="block aspect-[2537/684] min-h-[240px] w-full object-cover object-left"
        />

        {/* soft shade behind the transparent nav bar (desktop) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[120px] bg-gradient-to-b from-[#06302c]/45 via-[#06302c]/15 to-transparent lg:block" />

        {/* text for screen readers / SEO – the visible text is in the artwork */}
        <h1 className="sr-only">
          {settings.hero_title_1} {settings.hero_title_2}
        </h1>
      </div>

      {/* ================= quick search band ================= */}
      <div className="container-bm relative z-20 -mt-[26px] sm:-mt-[30px]">
        <div className="mx-auto max-w-[880px] rounded-[24px] bg-white/85 px-3 py-2 shadow-[0_8px_24px_-12px_rgb(12_80_72/0.35)] backdrop-blur-md">
          <div className="grid gap-2 md:grid-cols-3 md:gap-3">
            {quickLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="group flex h-[42px] items-center gap-2.5 rounded-full border border-brand-100 bg-white px-4 shadow-[0_2px_6px_-3px_rgb(12_80_72/0.25)] transition hover:border-brand-300"
              >
                <Icon className="size-[18px] shrink-0 text-brand-700" strokeWidth={2.2} />
                <span className="flex-1 truncate text-[13px] text-[#3d5552]">{t(label)}</span>
                <ArrowRight className="size-4 text-brand-800 transition group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

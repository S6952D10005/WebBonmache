import { Heart, MessageCircleMore } from 'lucide-react'
import { ImageCrop, LeafBranch, Swoosh } from './Decor'
import PillButton from './PillButton'
import DryBrush from './DryBrush'
import { useI18n } from '../i18n'

/**
 * "Let's Grow Together"
 *  - Desktop (≥1024px): designed banner image leasing-banner.webp (2537×684) with a
 *    clickable area over the orange button in the artwork.
 *  - Mobile / tablet (<1024px): the same content rebuilt in HTML so the text stays
 *    readable; the storefront photo is cropped from the banner.
 */
export default function LeasingBanner({ settings }) {
  const { t } = useI18n()
  const [lead, ...rest] = (settings.leasing_title || '').split(' ')
  const href = settings.leasing_url || '#contact'

  return (
    <section id="leasing" className="container-bm scroll-mt-20 pt-5">
      {/* ================= desktop: artwork ================= */}
      <div className="@container relative hidden overflow-hidden rounded-[22px] bg-mint lg:block">
        <img
          src={settings.leasing_image}
          alt={`Let's Grow Together – ${t('พื้นที่ให้เช่า')}`}
          loading="lazy"
          className="block aspect-[2537/684] w-full object-cover"
        />
        {/* new HTML button laid exactly over the orange button drawn in the artwork
            (artwork button: centre 36.0% / 66.5%, size 19.4cqw × 3.3cqw) */}
        <div className="absolute left-[36%] top-[66.5%] h-[3.8cqw] w-[20.4cqw] -translate-x-1/2 -translate-y-1/2 text-[1.2cqw]">
          <PillButton variant="accent" icon={MessageCircleMore} href={href} className="h-full w-full">
            {settings.leasing_button}
          </PillButton>
        </div>
        <div className="sr-only">
          <h2>Let&apos;s Grow Together</h2>
          <p>{settings.leasing_title}</p>
          <p>{settings.leasing_text}</p>
        </div>
      </div>

      {/* ================= mobile / tablet: HTML ================= */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-b from-[#d9f3ee] to-mint lg:hidden">
        <div className="relative px-5 pb-6 pt-6 text-white md:grid md:grid-cols-2 md:items-center md:gap-4">
          {/* teal painted background */}
          <DryBrush
            width={400}
            height={300}
            edgeTop={440}
            edgeBottom={440}
            color="#1f9285"
            light="#3aab9c"
            dark="#137f73"
            halo="rgba(255,255,255,0.45)"
            seed={9}
            className="absolute inset-0 h-full w-full"
          />
          <LeafBranch className="absolute bottom-3 right-3 h-14 w-12 rotate-12 text-white/40" strokeWidth={1.6} />

          <div className="relative">
            <h2 className="-rotate-[5deg] font-script text-[38px] leading-[1] drop-shadow-sm">
              Let&apos;s Grow
              <br />
              <span className="pl-6">Together</span>
            </h2>
            <Swoosh className="ml-4 mt-1 h-3.5 w-44 text-white" />
            <p className="mt-2 flex items-center gap-1.5 font-thaiscript text-[19px] text-white/95">
              {t('เปิดร้านที่นี่ ไปด้วยกัน')} <Heart className="size-4" strokeWidth={2.2} />
            </p>
          </div>

          <div className="relative mt-4 md:mt-0">
            <h3 className="leading-snug">
              <span className="text-[18px] font-bold">{lead}</span>{' '}
              <span className="text-[15px] font-semibold">{rest.join(' ')}</span>
            </h3>
            <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-white/95">{settings.leasing_text}</p>
            <PillButton variant="accent" icon={MessageCircleMore} href={href} className="mt-4 flex h-12 w-full text-[15px] sm:w-[300px]">
              {settings.leasing_button}
            </PillButton>
          </div>
        </div>

        <ImageCrop
          src={settings.leasing_image}
          alt={t('พื้นที่ให้เช่า บอนมาร์เช่')}
          x={1378}
          y={82}
          w={818}
          h={534}
          imgW={2537}
          imgH={684}
          className="md:mx-auto md:max-w-[420px]"
        />
      </div>
    </section>
  )
}

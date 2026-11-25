import { Accessibility, Car, Clock, MapPin, Navigation, Users } from 'lucide-react'
import { Brush, ImageCrop } from './Decor'
import PillButton from './PillButton'
import { useI18n } from '../i18n'

const ICONS = { clock: Clock, car: Car, wheelchair: Accessibility }

/**
 * Visit Info
 *  - Desktop (≥1024px): designed banner image visit-banner.webp (2537×684) with a
 *    clickable area over the "ดูแผนที่" button in the artwork.
 *  - Mobile / tablet (<1024px): the same content rebuilt in HTML so the text stays
 *    readable; the building photo is cropped from the banner.
 */
export default function VisitInfo({ items, image, mapUrl }) {
  const { t } = useI18n()
  const mapProps = {
    href: mapUrl || '#',
    target: mapUrl ? '_blank' : undefined,
    rel: 'noreferrer',
  }

  return (
    <section id="visit" className="container-bm pt-5">
      {/* ================= desktop: artwork ================= */}
      <div className="@container relative hidden overflow-hidden rounded-[22px] bg-mint lg:block">
        <img src={image} alt={`Visit Info – ${t('ข้อมูลการเข้ามาใช้บริการ')}`} loading="lazy" className="block aspect-[2537/684] w-full object-cover" />
        {/* new HTML button laid exactly over the "ดูแผนที่" button drawn in the artwork
            (artwork button: centre 69.0% / 84.3%, size 16.4cqw × 2.8cqw) */}
        <div className="absolute left-[69%] top-[84.3%] h-[3.3cqw] w-[17.4cqw] -translate-x-1/2 -translate-y-1/2 text-[1.25cqw]">
          <PillButton variant="light" icon={MapPin} {...mapProps} className="h-full w-full">
            {t('ดูแผนที่')}
          </PillButton>
        </div>
        <div className="sr-only">
          <h2>Visit Info</h2>
          <ul>
            {items.map((v) => (
              <li key={v.id}>
                {v.title}: {v.detail}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= mobile / tablet: HTML ================= */}
      <div className="overflow-hidden rounded-[22px] bg-gradient-to-b from-[#d9f3ee] to-mint p-4 sm:p-5 lg:hidden">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">
            <Users className="size-7" strokeWidth={1.8} />
          </span>
          <div className="border-l-2 border-brand-400 pl-3">
            <h2 className="font-head text-[26px] font-extrabold leading-none text-brand-800">Visit Info</h2>
            <p className="mt-1 text-[13px] text-brand-800">{t('ข้อมูลการเข้ามาใช้บริการของเรา')}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* info cards */}
          <ul className="grid gap-2.5">
            {items.map((v) => {
              const Icon = ICONS[v.icon] || Clock
              return (
                <li
                  key={v.id}
                  className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_10px_-4px_rgb(12_80_72/0.2)]"
                >
                  <Icon className="size-9 shrink-0 text-brand-600" strokeWidth={1.7} />
                  <div>
                    <h3 className="text-[15px] font-bold leading-tight text-ink">{v.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-snug text-[#3d5552]">{v.detail}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* photo + travel card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgb(12_80_72/0.2)]">
            <ImageCrop src={image} alt={t('บองมาร์เช่')} x={1269} y={0} w={1170} h={378} imgW={2537} imgH={684} />
            <div className="relative -mt-6 px-3 pb-3">
              <div className="relative px-4 py-4 text-white">
                <Brush variant="banner" color="#13857a" rough={9} className="absolute inset-0 h-full w-full" />
                <div className="relative flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-700">
                    <Navigation className="size-5 -rotate-12 fill-current" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[18px] font-bold leading-tight">{t('เดินทางสะดวก')}</h3>
                    <p className="text-[12px] text-white/90">{t('ใกล้รถไฟฟ้า / ที่จอดรถกว้างขวาง')}</p>
                  </div>
                </div>
                <PillButton variant="light" icon={MapPin} {...mapProps} className="mt-3 flex h-11 w-full text-[15px]">
                  {t('ดูแผนที่')}
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

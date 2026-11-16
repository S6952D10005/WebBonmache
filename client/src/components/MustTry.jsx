import { ArrowRight, Star } from 'lucide-react'
import SectionHeader from './SectionHeader'
import SmartLink from './SmartLink'
import { SmartImage } from './Decor'
import { useI18n } from '../i18n'

export default function MustTry({ items }) {
  const { t } = useI18n()
  return (
    <section className="container-bm pt-5">
      <div className="panel-bm px-4 pb-5 pt-2 sm:px-5">
        <SectionHeader
          icon={Star}
          title={t('Must-try & New Shops')}
          subtitle={t('คัดสรรร้านเด็ด 10-15 ร้าน และอัปเดตร้านเปิดใหม่')}
          href="/shops"
          className="mb-2 pr-2"
        />
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
          {items.map((s) => (
            <SmartLink
              key={s.id}
              href={s.link || `/shops?shop=${s.id}`}
              className="group relative flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] bg-white shadow-card transition hover:-translate-y-1 sm:w-auto"
            >
              {/* every card: same width (5 equal columns) and same 3:2 photo */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <SmartImage
                  src={s.image_url}
                  alt={s.name}
                  className="h-full w-full transition duration-500 group-hover:scale-105"
                />
                <span className="pill-tag absolute left-[6px] top-[10px] !px-3 !py-[5px]">{s.badge}</span>
              </div>
              <div className="relative -mt-2 flex-1 rounded-t-[12px] bg-white px-4 pb-3 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[13px] font-semibold text-ink">{s.name}</h3>
                  {!!s.is_new && (
                    <span className="shrink-0 rounded-md bg-brand-700 px-1.5 py-[2px] text-[10.5px] font-medium leading-none text-white">
                      {t('ใหม่')}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-[11.5px] text-muted">{s.category_label}</p>
                  <span className="circle-arrow !size-[22px]">
                    <ArrowRight className="size-3" strokeWidth={2.6} />
                  </span>
                </div>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}

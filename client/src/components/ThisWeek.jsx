import { ArrowRight } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { SmartImage } from './Decor'
import { useI18n } from '../i18n'

export default function ThisWeek({ items, siteName }) {
  const { t } = useI18n()
  return (
    <section id="events" className="container-bm pt-4">
      <SectionHeader
        tag={t('This week')}
        title={t('This week at {site}', { site: siteName })}
        subtitle={t('อัปเดตอีเวนต์และโปรโมชั่นของสุดสัปดาห์นี้')}
        className="mb-3 pl-1 pr-2"
      />

      <div className="-mx-4 flex snap-x gap-[18px] overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link || '#'}
            className="group w-[220px] shrink-0 snap-start overflow-hidden rounded-[14px] border border-[#e6eeec] bg-white shadow-card transition hover:-translate-y-1 sm:w-auto"
          >
            <div className="relative h-[138px] overflow-hidden">
              <SmartImage
                src={item.image_url}
                alt={item.title}
                className="h-full w-full transition duration-500 group-hover:scale-105"
              />
              <span className="pill-tag absolute left-2.5 top-[14px]">{item.tag}</span>
              <span className="absolute bottom-[3px] left-2.5 rounded-full bg-white px-3 py-[5px] text-[11.5px] font-medium leading-none text-[#3d5552] shadow-sm">
                {item.date_label}
              </span>
            </div>
            <div className="px-[18px] pb-3 pt-3">
              <h3 className="truncate text-[14.5px] font-semibold text-ink">{item.title}</h3>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-[12px] text-muted">{item.subtitle}</p>
                <span className="circle-arrow">
                  <ArrowRight className="size-3.5" strokeWidth={2.6} />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

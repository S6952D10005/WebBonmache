import {
  Coffee,
  Gift,
  HeartPulse,
  LayoutGrid,
  MapPinned,
  Salad,
  ShoppingBag,
  Sparkle,
  Utensils,
} from 'lucide-react'
import SectionHeader from './SectionHeader'
import SmartLink from './SmartLink'
import { useI18n } from '../i18n'

export const CATEGORY_ICONS = {
  utensils: Utensils,
  salad: Salad,
  bag: ShoppingBag,
  coffee: Coffee,
  heart: HeartPulse,
  gift: Gift,
  sparkles: Sparkle,
  map: MapPinned,
}

const COLOR = {
  orange: 'text-accent-500',
  teal: 'text-brand-600',
  pink: 'text-[#ef4f8b]',
  yellow: 'text-[#f5a623]',
}

export default function Categories({ items }) {
  const { t } = useI18n()
  return (
    <section id="shops" className="container-bm pt-7">
      <div className="panel-bm px-4 pb-5 pt-3 sm:px-5">
        <SectionHeader icon={LayoutGrid} iconColor="teal" title={t('ค้นหาตามหมวดหมู่')} subtitle={t('เลือกช้อปได้ตามที่คุณต้องการ')} href="/shops" className="mb-2 pr-2" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-[1.18fr_1.18fr_1.15fr_1fr_1fr_1fr_1fr_1fr] lg:gap-[12px]">
          {items.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] || LayoutGrid
            return (
              <SmartLink
                key={c.id}
                href={c.link || `/shops?cat=${c.id}`}
                className="group flex h-[114px] flex-col items-center justify-center gap-2 rounded-[14px] bg-white px-2 text-center shadow-[0_2px_8px_-4px_rgb(12_80_72/0.18)] transition hover:-translate-y-1"
              >
                <Icon className={`size-[40px] ${COLOR[c.color] || COLOR.teal}`} strokeWidth={1.7} />
                <span className="whitespace-pre-line text-[12px] leading-[1.35] text-[#3d5552]">{c.name}</span>
              </SmartLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}

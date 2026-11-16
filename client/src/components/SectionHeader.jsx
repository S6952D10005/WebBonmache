import { Brush, SeeAll } from './Decor'

/**
 * Section title used across the home page.
 *  - `tag`  : painted orange label with script text (e.g. "This week")
 *  - `icon` : painted brush swipe holding a white icon (orange or teal)
 *  - `plainIcon` : outlined teal icon without a brush (Visit Info)
 */
export default function SectionHeader({ title, subtitle, tag, icon: Icon, plainIcon: PlainIcon, iconColor = 'orange', href = '#', className = 'mb-3' }) {
  const color = iconColor === 'teal' ? '#1f9285' : '#f37021'
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        {tag && (
          <span className="relative grid h-[44px] w-[120px] shrink-0 -rotate-[8deg] place-items-center">
            <Brush variant="swipe" color="#f37021" rough={9} className="absolute inset-0 h-full w-full" />
            <span className="relative font-hand text-[18px] font-bold text-white">{tag}</span>
          </span>
        )}
        {Icon && (
          <span className="relative -ml-3 grid h-[58px] w-[90px] shrink-0 place-items-center">
            <Brush variant="swipe" color={color} rough={10} className="absolute inset-0 h-full w-full -rotate-[4deg]" />
            <Icon className="relative size-[26px] text-white" strokeWidth={2.2} />
          </span>
        )}
        {PlainIcon && <PlainIcon className="size-[40px] shrink-0 text-brand-600" strokeWidth={1.6} />}
        <div>
          <h2 className="font-head text-[24px] font-extrabold leading-tight text-brand-700 sm:text-[26px]">{title}</h2>
          {subtitle && <p className="text-[13px] leading-snug text-brand-800">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <div className="hidden shrink-0 sm:block">
          <SeeAll href={href} />
        </div>
      )}
    </div>
  )
}

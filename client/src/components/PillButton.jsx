import { ArrowRight } from 'lucide-react'

/**
 * Rounded "pill" call-to-action button used across the site.
 *
 *   [ (icon)  Label            (→) ]
 *
 * Everything is sized in `em`, so the whole button scales with the font-size
 * set on it (or on a parent) – e.g. `text-[15px]` on mobile or `text-[1.2cqw]`
 * when it sits on top of a banner image.
 *
 * variant: 'light'  – white pill, teal text, teal arrow circle (on teal backgrounds)
 *          'accent' – orange gradient pill, white text, white arrow circle
 */
const VARIANTS = {
  light: {
    pill: 'bg-white text-brand-800 ring-1 ring-black/5 shadow-[0_0.4em_1.1em_-0.4em_rgb(0_55_50/0.6)] hover:shadow-[0_0.6em_1.4em_-0.4em_rgb(0_55_50/0.7)]',
    icon: 'text-brand-600',
    circle: 'bg-brand-600 text-white group-hover:bg-accent-500',
  },
  accent: {
    pill: 'bg-gradient-to-r from-[#ff9d48] via-[#f7791f] to-[#ee5f14] text-white shadow-[0_0.45em_1.2em_-0.35em_rgb(238_95_20/0.8)] hover:shadow-[0_0.65em_1.5em_-0.35em_rgb(238_95_20/0.9)]',
    icon: 'text-white',
    circle: 'bg-white text-[#ee5f14] group-hover:bg-brand-50',
  },
}

export default function PillButton({ variant = 'light', icon: Icon, children, className = '', ...props }) {
  const v = VARIANTS[variant] || VARIANTS.light
  return (
    <a
      {...props}
      className={`group relative inline-flex items-center gap-[0.55em] overflow-hidden rounded-full py-[0.32em] pl-[1.05em] pr-[0.32em] font-semibold leading-none transition duration-300 hover:-translate-y-[0.1em] active:translate-y-0 active:scale-[0.98] ${v.pill} ${className}`}
    >
      {/* soft top shine */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-[0.6em] top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/25 to-transparent" />

      {Icon && <Icon className={`relative size-[1.2em] shrink-0 ${v.icon}`} strokeWidth={2.2} />}
      <span className="relative flex-1 whitespace-nowrap text-center">{children}</span>
      <span
        aria-hidden="true"
        className={`relative grid size-[2em] shrink-0 place-items-center rounded-full transition duration-300 group-hover:translate-x-[0.15em] ${v.circle}`}
      >
        <ArrowRight className="size-[1.05em] transition-transform duration-300 group-hover:translate-x-[0.1em]" strokeWidth={2.6} />
      </span>
    </a>
  )
}

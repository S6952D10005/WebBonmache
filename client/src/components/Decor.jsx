import { useId, useState } from 'react'
import { ArrowRight, ImageIcon } from 'lucide-react'
import SmartLink from './SmartLink'
import { useI18n } from '../i18n'

/* -------------------------------------------------------------------------- */
/*  Painted brush shapes (rough edges + bristle streaks)                       */
/* -------------------------------------------------------------------------- */
const BRUSH_PATHS = {
  banner:
    'M10,24 C70,8 150,14 240,9 C310,5 360,8 394,16 C386,34 398,52 390,70 C396,80 392,88 388,92 C300,96 210,90 120,96 C70,99 30,95 6,88 C14,70 2,50 10,24 Z',
  tag:
    'M6,30 C40,14 110,10 170,12 C220,13 262,10 296,20 C286,36 300,50 290,62 C298,72 290,80 284,86 C220,90 150,88 90,92 C50,94 22,90 4,84 C14,66 0,48 6,30 Z',
  // swipe: tapered both ends, used behind section icons
  swipe:
    'M2,46 C20,22 60,14 120,12 C170,10 230,6 296,14 C284,30 298,44 286,56 C296,66 288,76 278,86 C220,92 150,94 90,92 C50,92 20,90 4,80 C14,70 0,60 2,46 Z',
  blob: 'M50,6 C74,4 94,22 96,46 C98,72 80,94 52,96 C24,98 4,78 4,52 C4,26 24,8 50,6 Z',
}

export function Brush({ variant = 'banner', className = '', color = 'currentColor', streaks = true, rough = 7 }) {
  const id = useId().replace(/:/g, '')
  const vb = variant === 'blob' ? '0 0 100 100' : variant === 'banner' ? '0 0 400 100' : '0 0 300 100'
  return (
    <svg aria-hidden="true" viewBox={vb} preserveAspectRatio="none" className={`pointer-events-none ${className}`}>
      <defs>
        <filter id={`rough-${id}`} x="-8%" y="-15%" width="116%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.55" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale={rough} />
        </filter>
      </defs>
      <g filter={`url(#rough-${id})`}>
        <path d={BRUSH_PATHS[variant]} fill={color} />
        {streaks && variant !== 'blob' && (
          <g stroke="#fff" strokeLinecap="round" fill="none">
            <path d="M30,32 C120,26 220,30 330,24" strokeOpacity="0.12" strokeWidth="2" />
            <path d="M20,58 C140,54 240,60 360,52" strokeOpacity="0.1" strokeWidth="3" />
            <path d="M40,78 C130,74 230,80 300,74" strokeOpacity="0.08" strokeWidth="2" />
          </g>
        )}
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hand-drawn leaf branch (outlined leaves with mid-ribs)                     */
/* -------------------------------------------------------------------------- */
export function LeafBranch({ className = '', strokeWidth = 1.6 }) {
  const leaf = (d, rib) => (
    <>
      <path d={d} />
      <path d={rib} />
    </>
  )
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 78 C20 60 28 44 44 22" />
      {leaf('M22 58 C10 56 4 46 6 34 C16 38 22 46 22 58 Z', 'M22 58 C16 50 11 43 7 35')}
      {leaf('M30 44 C30 30 38 22 50 20 C50 32 42 42 30 44 Z', 'M30 44 C37 36 43 29 49 21')}
      {leaf('M40 28 C36 16 40 6 50 2 C54 12 50 22 40 28 Z', 'M40 28 C44 20 47 12 50 3')}
    </svg>
  )
}

/* kept for backwards compatibility */
export const Leaf = LeafBranch
export const Sprig = LeafBranch

export function HeartDoodle({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 40" fill="none" className={className}>
      <path
        d="M2 30 C20 34 40 30 58 24 M70 18 C66 10 56 12 60 20 C62 26 70 30 72 32 C76 28 84 22 84 16 C84 8 74 8 72 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M86 24 C96 22 108 18 118 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* hand-drawn underline swoosh */
export function Swoosh({ className = '', strokeWidth = 2.2 }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 24" fill="none" className={className}>
      <path
        d="M4 18 C50 8 120 4 196 10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path d="M30 20 C80 14 130 12 170 14" stroke="currentColor" strokeWidth={strokeWidth * 0.6} strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Logo – "Bon" script mark with orange star (client/asset/blackground/Logo.png)
 *  logo-white.webp : for dark backgrounds (over the hero image, footer)
 *  logo-color.webp : teal + orange, for the white header after scrolling
 * -------------------------------------------------------------------------- */
export function LogoMark({ light = false, className = 'h-[46px]' }) {
  return (
    <img
      src={light ? '/images/logo-white.webp' : '/images/logo-color.webp'}
      alt=""
      aria-hidden="true"
      className={`w-auto shrink-0 select-none ${className}`}
      draggable="false"
    />
  )
}

export function Logo({ name = 'Bon Marché', tagline = 'Fresh • Healthy • Community', light = false, size = 'h-[46px]' }) {
  // the mark already reads "Bon", so the word next to it completes the name ("Marché")
  const word = /^bon\s+/i.test(name) ? name.replace(/^bon\s+/i, '') : name
  return (
    <SmartLink href="/home" aria-label={name} className="flex shrink-0 items-end gap-2">
      <LogoMark light={light} className={size} />
      <span className="mb-[3px] whitespace-nowrap leading-none">
        <span className={`block font-head text-[24px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-700'}`}>
          {word}
        </span>
        <span className={`mt-1 block text-[10.5px] font-medium ${light ? 'text-white/85' : 'text-brand-700/80'}`}>{tagline}</span>
      </span>
    </SmartLink>
  )
}

/* -------------------------------------------------------------------------- */
/*  Image with graceful fallback                                               */
/* -------------------------------------------------------------------------- */
export function SmartImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(!src)
  if (failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-500 ${className}`}>
        <ImageIcon className="size-8" />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

export function SeeAll({ href = '#' }) {
  const { t } = useI18n()
  return (
    <SmartLink href={href} className="group inline-flex items-center gap-2 text-[14px] font-semibold text-brand-800 hover:text-brand-600">
      {t('ดูทั้งหมด')}
      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
    </SmartLink>
  )
}

/* -------------------------------------------------------------------------- */
/*  Show only one rectangle of a large banner image (used for mobile layouts)  */
/*  x, y, w, h are in the image's own pixel space (imgW × imgH)                */
/* -------------------------------------------------------------------------- */
export function ImageCrop({ src, alt = '', x, y, w, h, imgW = 2172, imgH = 724, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute max-w-none"
        style={{
          width: `${(imgW / w) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
          aspectRatio: `${imgW} / ${imgH}`,
        }}
      />
    </div>
  )
}

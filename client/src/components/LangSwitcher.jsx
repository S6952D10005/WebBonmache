import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useI18n } from '../i18n'

/* ------------------------------------------------------------------------ */
/*  Flags (drawn as SVG – Windows doesn't show flag emoji)                  */
/* ------------------------------------------------------------------------ */

function FlagTH() {
  return (
    <svg viewBox="0 0 9 6" preserveAspectRatio="xMidYMid slice" className="size-full">
      <rect width="9" height="6" fill="#A51931" />
      <rect y="1" width="9" height="4" fill="#F4F5F8" />
      <rect y="2" width="9" height="2" fill="#2D2A4A" />
    </svg>
  )
}

function FlagGB() {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="size-full">
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

/** 5-point star centred at cx, cy (outer radius r), turned by `rot` degrees */
const star = (cx, cy, r, rot = 0) =>
  Array.from({ length: 10 }, (_, i) => {
    const rad = ((i * 36 - 90 + rot) * Math.PI) / 180
    const len = i % 2 ? r * 0.382 : r
    return `${(cx + len * Math.cos(rad)).toFixed(2)},${(cy + len * Math.sin(rad)).toFixed(2)}`
  }).join(' ')

function FlagCN() {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className="size-full">
      <rect width="30" height="20" fill="#EE1C25" />
      <g fill="#FFDE00">
        <polygon points={star(5, 5, 3)} />
        <polygon points={star(10, 2, 1, 23)} />
        <polygon points={star(12, 4, 1, 46)} />
        <polygon points={star(12, 7, 1, 70)} />
        <polygon points={star(10, 9, 1, 21)} />
      </g>
    </svg>
  )
}

export const LANGUAGES = [
  { code: 'th', label: 'ไทย', short: 'TH', Flag: FlagTH },
  { code: 'en', label: 'English', short: 'EN', Flag: FlagGB },
  { code: 'zh', label: '中文', short: '中文', Flag: FlagCN },
]

/** small rectangular flag (3:2) */
export function FlagIcon({ lang, className = 'h-[14px] w-[21px]' }) {
  const { Flag } = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]
  return (
    <span className={`inline-block shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 shadow-[0_1px_3px_rgb(0_0_0/0.25)] ${className}`}>
      <Flag />
    </span>
  )
}

/* current language = site-wide state (src/i18n) */
function useLanguage() {
  const { lang, setLang } = useI18n()
  return [lang, setLang]
}

/* ------------------------------------------------------------------------ */
/*  Desktop: flag button + dropdown                                         */
/* ------------------------------------------------------------------------ */

export default function LangSwitcher({ overlay = false }) {
  const [lang, setLang] = useLanguage()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !box.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('ภาษา')}: ${current.label}`}
        title={current.label}
        className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 transition ${
          overlay ? 'text-white hover:bg-white/15' : 'text-[#3d5552] hover:bg-brand-50'
        }`}
      >
        <FlagIcon lang={lang} />
        <ChevronDown className={`size-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${overlay ? 'drop-shadow' : ''}`} strokeWidth={2.4} />
      </button>

      <div
        className={`absolute right-0 top-full z-50 w-[170px] origin-top-right pt-2 transition duration-200 ${
          open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
        }`}
      >
        <ul role="listbox" aria-label={t('เลือกภาษา')} className="rounded-xl border border-[#e4e9e8] bg-white p-1 shadow-[0_18px_40px_-14px_rgb(16_40_38/0.3)]">
          {LANGUAGES.map((l) => {
            const active = l.code === lang
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l.code)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                    active ? 'bg-brand-50 font-semibold text-brand-800' : 'text-[#2b3a38] hover:bg-brand-100'
                  }`}
                >
                  <FlagIcon lang={l.code} />
                  <span className="flex-1">{l.label}</span>
                  {active && <Check className="size-4 text-brand-600" strokeWidth={2.6} />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*  Mobile menu: three flags in a row                                       */
/* ------------------------------------------------------------------------ */

export function LangRow() {
  const [lang, setLang] = useLanguage()
  const { t } = useI18n()
  return (
    <div role="radiogroup" aria-label={t('เลือกภาษา')} className="mt-3 flex gap-2">
      {LANGUAGES.map((l) => {
        const active = l.code === lang
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLang(l.code)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition ${
              active ? 'border-brand-600 bg-brand-50 font-semibold text-brand-800' : 'border-[#e3e8e7] text-[#3d5552]'
            }`}
          >
            <FlagIcon lang={l.code} />
            {l.label}
          </button>
        )
      })}
    </div>
  )
}

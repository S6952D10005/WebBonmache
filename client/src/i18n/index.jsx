import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DICT, RULES } from './translations'

/*
 * Site language (th / en / zh)
 *   const { lang, setLang, t, tr } = useI18n()
 *   t('ดูทั้งหมด')                → "See all" / "查看全部" / "ดูทั้งหมด"
 *   t('อีก {n} ร้าน', { n: 4 })   → "4 more shops"
 *   tr(data)                      → the same object with every known Thai text translated
 * The choice is remembered in this browser.
 */
const STORE = 'bm-lang'
const COL = { en: 0, zh: 1 }
export const LANG_CODES = ['th', 'en', 'zh']

const read = () => {
  try {
    const v = localStorage.getItem(STORE)
    return LANG_CODES.includes(v) ? v : 'th'
  } catch {
    return 'th'
  }
}

const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text)

function translate(text, lang) {
  if (lang === 'th' || typeof text !== 'string') return text
  const row = DICT[text]
  if (row) return row[COL[lang]] ?? text
  for (const [re, en, zh] of RULES) if (re.test(text)) return text.replace(re, lang === 'en' ? en : zh)
  return text
}

/** deep-translate every string in an object / array (ids, urls, images are untouched – they are not in the table) */
function deep(value, lang) {
  if (lang === 'th') return value
  if (typeof value === 'string') return translate(value, lang)
  if (Array.isArray(value)) return value.map((v) => deep(v, lang))
  if (value && typeof value === 'object') {
    const out = {}
    for (const k in value) out[k] = deep(value[k], lang)
    return out
  }
  return value
}

const I18nContext = createContext({ lang: 'th', setLang: () => {}, t: (s) => s, tr: (v) => v })

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(read)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang
    try {
      localStorage.setItem(STORE, lang)
    } catch {
      /* private mode – remember for this visit only */
    }
  }, [lang])

  const t = useCallback((text, vars) => fill(translate(text, lang), vars), [lang])
  const tr = useCallback((value) => deep(value, lang), [lang])
  const value = useMemo(() => ({ lang, setLang, t, tr }), [lang, t, tr])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

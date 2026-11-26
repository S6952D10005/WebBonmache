import { useMemo, useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowUpRight, CalendarDays, Newspaper } from 'lucide-react'
import SmartLink from '../components/SmartLink'
import PageHero from '../components/PageHero'
import ColorfulText from '../components/ColorfulText'
import { SmartImage } from '../components/Decor'
import { NewsDialog } from '../components/home/HomeFeeds'
import { HOME } from '../data/homeData'
import { useI18n } from '../i18n'

/*
 * ข่าวทั้งหมด (/news) – every news item in src/data/homeData.js (HOME.news)
 *   hero image + title card with the category filter (ทั้งหมด · รางวัล · การเดินทาง …)
 *   → news cards (newest first, as listed in the data)
 *   → click a card = the same popup as on the home page
 * The chosen category is kept in the address (/news?tag=รางวัล) so it can be shared.
 */
export default function News({ settings }) {
  const { t, tr } = useI18n()
  const news = useMemo(() => tr(HOME.news) || [], [tr])
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag') || ''
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])

  // categories in the order they first appear, with how many news each has
  const tags = useMemo(() => {
    const count = new Map()
    news.forEach((n) => n.tag && count.set(n.tag, (count.get(n.tag) || 0) + 1))
    return [...count]
  }, [news])
  const list = tag ? news.filter((n) => n.tag === tag) : news
  const opened = news.find((n) => n.id === openId)

  const pick = (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set('tag', value)
    else next.delete('tag')
    setParams(next, { replace: true })
  }

  const chip = (value, label, n) => {
    const active = tag === value
    return (
      <button
        key={value || 'all'}
        type="button"
        onClick={() => pick(value)}
        aria-pressed={active}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
          active ? 'bg-brand-600 text-white shadow-[0_6px_14px_-8px_rgb(12_80_72/0.7)]' : 'bg-[#f2f5f4] text-[#3d5552] hover:bg-brand-50 hover:text-brand-700'
        }`}
      >
        {label}
        <span className={`rounded-full px-1.5 text-[11px] leading-[18px] ${active ? 'bg-white/20' : 'bg-white text-muted'}`}>{n}</span>
      </button>
    )
  }

  return (
    <>
      {/* ================= hero (home banner image) + title / category card ================= */}
      <PageHero settings={settings}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8">
          <div>
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <SmartLink href="/" className="hover:text-brand-700">
                {t('หน้าแรก')}
              </SmartLink>
              <span>/</span>
              <span className="font-medium text-brand-700">{t('ข่าวสาร')}</span>
            </nav>
            <ColorfulText as="h1" animated text={t('ข่าวสารบองมาร์เช่')} className="mt-0.5 font-head text-[26px] font-black leading-tight tracking-[-0.01em] sm:text-[30px]" />
            <p className="mt-0.5 text-[12.5px] text-[#4d5f5c]">{t('ข่าว ประกาศ และความเคลื่อนไหวล่าสุดของ {place}', { place: settings.site_name })}</p>
          </div>
          {/* phone: one row that slides sideways · desktop: wraps, right-aligned */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible lg:justify-end">

            {chip('', t('ทั้งหมด'), news.length)}
            {tags.map(([value, n]) => chip(value, value, n))}
          </div>
        </div>
      </PageHero>

      {/* ================= news cards ================= */}
      <section className="container-bm pb-16 pt-8 lg:pt-10">
        {list.length === 0 ? (
          <div className="grid place-items-center py-16 text-center text-muted">
            <Newspaper className="size-10 text-brand-300" strokeWidth={1.6} />
            <p className="mt-3 text-[14px]">{t('ยังไม่มีข่าวในหมวดนี้')}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {list.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setOpenId(n.id)}
                aria-haspopup="dialog"
                className="group flex flex-col overflow-hidden rounded-[20px] border border-[#e6eeec] bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-card"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-[#eef3f2]">
                  <SmartImage src={n.image} alt={n.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
                  {n.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#f37021] shadow-sm">{n.tag}</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="line-clamp-2 block text-[16.5px] font-bold leading-snug text-ink transition group-hover:text-brand-700">{n.title}</span>
                  {n.excerpt && <span className="mt-2 line-clamp-2 block text-[13.5px] leading-relaxed text-[#5d6f6c]">{n.excerpt}</span>}
                  <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-[12px]">
                    <span className="flex items-center gap-1.5 text-muted">
                      <CalendarDays className="size-3.5 text-brand-500" strokeWidth={2.2} />
                      {n.date}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-brand-700">
                      {t('อ่านต่อ')}
                      <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={2.6} />
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {opened && <NewsDialog n={opened} onClose={close} />}
    </>
  )
}

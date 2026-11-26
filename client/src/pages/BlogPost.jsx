import { useCallback, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ArrowLeft, Clock, Expand } from 'lucide-react'
import SmartLink from '../components/SmartLink'
import PhotoViewer from '../components/PhotoViewer'
import { useParallax } from '../components/ScrollFx'
import { BLOG } from '../data/blogData'
import { BLOG_BG, BlogCard } from './Blog'
import { useI18n } from '../i18n'

/*
 * One blog post (/blog/<slug>) – src/data/blogData.js
 *   cover photo with the title written on it → the story → "เรื่องเล่าอื่น ๆ" (the next 3 posts)
 *
 * The story is cut into parts at its headings, so it reads in short pieces instead of one long column:
 *   - text with 1–3 pictures → text and pictures side by side (pictures left / right in turn;
 *     they stay in view while the text beside them is read)
 *   - 4+ pictures, or pictures with no text → the text, then a gallery of small square pictures
 *   - text only → one comfortable column
 *   - several short headed parts in a row → cards side by side (text cards, or picture-on-top cards)
 * Any picture opens large in a viewer (← → / swipe to the others, Esc closes), with its caption.
 * An unknown address goes back to /blog.
 */

const CHARS_PER_MINUTE = 800 // Thai reading speed, for "อ่านประมาณ n นาที"

/** blocks → parts: { h, text: [p | li], imgs: [{ img, caption, n }] } (n = place among all the post's pictures) */
function toParts(blocks) {
  const parts = []
  let cur = { h: '', text: [], imgs: [] }
  let n = 0
  const close = () => (cur.h || cur.text.length || cur.imgs.length) && parts.push(cur)
  for (const b of blocks) {
    if (b.h) {
      close()
      cur = { h: b.h, text: [], imgs: [] }
    } else if (b.img) cur.imgs.push({ ...b, n: n++ })
    else cur.text.push(b)
  }
  close()
  return parts
}

const SHORT_PART = 600 // characters
const textLength = (s) => s.text.reduce((sum, b) => sum + (b.p || b.li || '').length, 0)
/**
 * Short headed parts in a row are shown together as cards, side by side:
 *   - 2+ with no pictures (e.g. "โซน A … โซน F")       → { cards }       small text cards
 *   - 3+ with exactly one picture (e.g. "1. … 10. …")  → { photoCards }  picture on top, text below
 */
function groupShort(parts) {
  const kind = (s) => (!s.h || textLength(s) > SHORT_PART ? '' : !s.imgs.length ? 'cards' : s.imgs.length === 1 ? 'photoCards' : '')
  const MIN = { cards: 2, photoCards: 3 }
  const out = []
  for (const s of parts) {
    const k = kind(s)
    const last = out[out.length - 1]
    if (k && last?.[k]) last[k].push(s)
    else out.push(k ? { [k]: [s] } : s)
  }
  // too few for a group → back to normal parts
  return out.flatMap((x) => {
    const k = x.cards ? 'cards' : x.photoCards ? 'photoCards' : ''
    return k && x[k].length < MIN[k] ? x[k] : [x]
  })
}

/* ---------------------------------- text ---------------------------------- */

/** "คุณเจี๊ยบ: “…”" → the speaker's name in bold */
const SPEAKER = /^(คุณ[^:：\s]{1,20})\s*[:：]\s*/

function Paragraph({ text, lead }) {
  const who = text.match(SPEAKER)
  const body = who ? text.slice(who[0].length) : text
  // interview lines (in quotation marks) get a soft bar on the left, so they stand apart from the telling
  const quote = /^[“"]/.test(body)
  return (
    <p
      className={`whitespace-pre-line ${
        lead
          ? 'text-[17.5px] font-medium leading-[1.85] text-[#2f2a26] sm:text-[19px]'
          : quote
            ? 'border-l-2 border-brand-300 pl-4 text-[16px] leading-[1.9] text-[#2f2a26] sm:text-[16.5px]'
            : 'text-[16px] leading-[1.9] text-[#4a4540] sm:text-[16.5px]'
      }`}
    >
      {who && <b className="font-semibold text-brand-700">{who[1]} </b>}
      {body}
    </p>
  )
}

function Text({ items, lead = false }) {
  return (
    <div className="space-y-4">
      {items.map((b, i) =>
        b.li ? (
          <p key={i} className="relative pl-5 text-[16px] leading-[1.85] text-[#4a4540] before:absolute before:left-1 before:top-[0.75em] before:size-1.5 before:rounded-full before:bg-brand-500 sm:text-[16.5px]">
            {b.li}
          </p>
        ) : (
          <Paragraph key={i} text={b.p} lead={lead && i === 0} />
        ),
      )}
    </div>
  )
}

function Heading({ children }) {
  return (
    <h2 className="mb-5 text-[21px] font-semibold leading-[1.5] text-[#26211d] sm:text-[24px]">
      <span aria-hidden="true" className="mb-3 block h-[3px] w-9 rounded-full bg-brand-500" />
      {children}
    </h2>
  )
}

/* -------------------------------- pictures -------------------------------- */

/** a picture that opens the viewer; cropped to a square tile or to 4:3 */
function Tile({ img, onOpen, square = false, className = '', caption = true }) {
  const { t } = useI18n()
  return (
    <figure className={className}>
      <button
        type="button"
        onClick={() => onOpen(img.n)}
        aria-label={img.caption || t('ดูภาพขยาย')}
        className="group relative block w-full overflow-hidden rounded-[6px] bg-[#ebe5dd] outline-none ring-brand-600 ring-offset-2 focus-visible:ring-2"
      >
        <img
          src={img.img}
          alt=""
          loading="lazy"
          decoding="async"
          className={`w-full transition duration-500 group-hover:scale-[1.04] ${
            // 4:3 keeps the part short; the whole picture is in the viewer
            square ? 'aspect-square object-cover' : 'aspect-[4/3] object-cover object-[center_35%]'
          }`}
        />
        <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand className="size-4" strokeWidth={2} />
        </span>
      </button>
      {caption && img.caption && <figcaption className="mt-2 line-clamp-2 text-[12.5px] leading-[1.6] text-[#7a736c]">{img.caption}</figcaption>}
    </figure>
  )
}

/** 1–3 pictures beside the text */
function Media({ imgs, onOpen }) {
  if (imgs.length === 1) return <Tile img={imgs[0]} onOpen={onOpen} />
  return (
    <div className="grid grid-cols-2 gap-3">
      {imgs.map((img, i) => (
        <Tile key={img.n} img={img} onOpen={onOpen} square className={imgs.length === 3 && i === 0 ? 'col-span-2' : ''} />
      ))}
    </div>
  )
}

/** 4+ pictures: small squares, 2 / 3 / 4 per row */
function Gallery({ imgs, onOpen }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-4">
      {imgs.map((img) => (
        <Tile key={img.n} img={img} onOpen={onOpen} square />
      ))}
    </div>
  )
}

/* ---------------------------------- page ---------------------------------- */

export default function BlogPost() {
  const { slug } = useParams()
  const { t } = useI18n()
  const parallax = useParallax(0.3, 1.1) // cover photo moves slower than the page, as on the other pages
  const [open, setOpen] = useState(-1) // picture shown in the viewer (-1 = closed)
  const close = useCallback(() => setOpen(-1), [])
  const posts = BLOG.posts
  const index = posts.findIndex((p) => p.slug === slug)
  const post = posts[index]
  const parts = useMemo(() => (post ? toParts(post.blocks) : []), [post])
  const rows = useMemo(() => groupShort(parts), [parts])
  if (!post) return <Navigate to="/blog" replace />

  const pictures = parts.flatMap((s) => s.imgs)
  const more = [...posts.slice(index + 1), ...posts.slice(0, index)].slice(0, 3)
  const chars = post.blocks.reduce((sum, b) => sum + (b.p || b.li || b.h || '').length, 0)
  const minutes = Math.max(1, Math.round(chars / CHARS_PER_MINUTE))
  let side = 0 // text-and-picture parts swap sides in turn

  return (
    <>
      {/* ================= cover photo with the title on it ================= */}
      <section className="relative isolate flex min-h-[360px] items-end overflow-hidden bg-[#1c1a19] text-white sm:min-h-[440px] lg:min-h-[520px]">
        <img
          ref={parallax}
          src={post.cover}
          alt=""
          style={{ objectPosition: post.focus || 'center' }}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/35" />
        <div className="container-bm pb-10 pt-24 sm:pb-14">
          <div className="mx-auto max-w-[860px] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-[12px]">
              <SmartLink href="/blog" className="hover:text-white">
                The Blog
              </SmartLink>
              <span className="mx-2 text-white/50">/</span>
              <SmartLink href={`/blog?tag=${encodeURIComponent(post.tag)}`} className="hover:text-white">
                {t(post.tag)}
              </SmartLink>
            </p>
            <h1 className="mt-4 text-[26px] font-semibold leading-[1.45] [text-shadow:0_2px_18px_rgb(0_0_0/0.35)] sm:text-[36px] lg:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12.5px] tracking-[0.04em] text-white/80">
              <span>{t('เผยแพร่เมื่อ {date}', { date: post.date })}</span>
              <span className="text-white/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" strokeWidth={2.2} />
                {t('อ่านประมาณ {n} นาที', { n: minutes })}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ================= the story, part by part =================
          (sections side by side under the page: the site's scroll animation brings in each part / picture) */}
      <section className={BLOG_BG}>
        <div className="container-bm">
          <div className="mx-auto max-w-[1080px] divide-y divide-[#ebe4da] pb-6 pt-4 sm:pt-8">
            {rows.map((s, i) => {
              const hasText = s.text?.length > 0
              const n = s.imgs?.length
              const lead = i === 0 && !s.h
              let body
              if (s.photoCards) {
                // short numbered parts: picture on top, heading and text below – 2 / 3 per row
                body = (
                  <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {s.photoCards.map((c) => (
                      <div key={c.h}>
                        <Tile img={c.imgs[0]} onOpen={setOpen} caption={false} />
                        <h2 className="mt-4 text-[17px] font-semibold leading-[1.5] text-[#26211d]">{c.h}</h2>
                        <div className="mt-2 space-y-2.5 text-[14.5px] leading-[1.8] text-[#5a544e]">
                          {c.text.map((b, k) => (
                            <p key={k}>{b.p || b.li}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              } else if (s.cards) {
                // short parts side by side as small cards (2 / 3 per row)
                body = (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                    {s.cards.map((c) => (
                      <div key={c.h} className="rounded-[10px] border border-[#ebe4da] bg-white p-5 sm:p-6">
                        <h2 className="text-[16.5px] font-semibold leading-[1.5] text-[#26211d]">
                          <span aria-hidden="true" className="mb-2.5 block h-[3px] w-7 rounded-full bg-brand-500" />
                          {c.h}
                        </h2>
                        <div className="mt-2.5 space-y-2.5 text-[14.5px] leading-[1.8] text-[#5a544e]">
                          {c.text.map((b, k) => (
                            <p key={k}>{b.p || b.li}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              } else if (n === 0) {
                // text only: one comfortable column
                body = (
                  <div className="mx-auto max-w-[720px]">
                    {s.h && <Heading>{s.h}</Heading>}
                    <Text items={s.text} lead={lead} />
                  </div>
                )
              } else if (n >= 4 || !hasText) {
                // many pictures: the text, then a gallery
                body = (
                  <>
                    {(s.h || hasText) && (
                      <div className="mx-auto mb-8 max-w-[720px]">
                        {s.h && <Heading>{s.h}</Heading>}
                        {hasText && <Text items={s.text} lead={lead} />}
                      </div>
                    )}
                    <Gallery imgs={s.imgs} onOpen={setOpen} />
                  </>
                )
              } else {
                // text beside 1–3 pictures, sides swapping part by part; the pictures stay in view while reading
                const flip = side++ % 2 === 1
                body = (
                  <div className="grid gap-7 lg:grid-cols-12 lg:gap-12">
                    <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                      {s.h && <Heading>{s.h}</Heading>}
                      <Text items={s.text} lead={lead} />
                    </div>
                    <div className={`self-start lg:sticky lg:top-24 lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
                      <Media imgs={s.imgs} onOpen={setOpen} />
                    </div>
                  </div>
                )
              }
              return (
                <div key={i} className="py-8 sm:py-10">
                  {body}
                </div>
              )
            })}
          </div>

          <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 border-t border-[#e3dcd2] pb-14 pt-6 text-[13px] text-[#8a837c] sm:pb-20">
            <SmartLink href="/blog" className="group inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-[#3a342f] hover:text-brand-700">
              <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" strokeWidth={2} />
              {t('กลับไปหน้า Blog')}
            </SmartLink>
            <span>{t('เผยแพร่เมื่อ {date}', { date: post.date })}</span>
          </div>
        </div>
      </section>

      {/* ================= more stories (cards come in one after another) ================= */}
      {more.length > 0 && (
        <section className={`${BLOG_BG} border-t border-[#e8e2d9] pb-20 pt-14 sm:pt-16`}>
          <div className="container-bm">
            <h2 className="text-center text-[24px] font-semibold text-[#26211d] sm:text-[28px]">{t('เรื่องเล่าอื่น ๆ')}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
              {more.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {open >= 0 && pictures[open] && <PhotoViewer imgs={pictures} index={open} onIndex={setOpen} onClose={close} />}
    </>
  )
}

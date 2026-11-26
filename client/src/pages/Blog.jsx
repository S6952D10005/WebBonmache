import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { BookOpen } from 'lucide-react'
import SmartLink from '../components/SmartLink'
import { useParallax } from '../components/ScrollFx'
import { BLOG } from '../data/blogData'
import { useI18n } from '../i18n'

/*
 * Blog (/blog) – เรื่องเล่าจากตลาด, laid out like the blog template:
 *   dark photo with "THE BLOG" → "เลือกอ่านตามหมวด :" topic bar → the newest post large
 *   (photo + white card over its edge) → the other posts, 3 per row, topic written up the photo's side.
 * Posts + pictures: src/data/blogData.js · a post opens at /blog/<slug> (BlogPost.jsx)
 * The chosen topic is kept in the address (/blog?tag=เทศกาล) so it can be shared.
 */

export const blogHref = (post) => `/blog/${post.slug}`
export const BLOG_BG = 'bg-[#f8f6f2]' // warm off-white page, as in the template

/** a post's cover photo; `focus` keeps the important part in view when it is cropped */
export function Cover({ post, className = '', eager = false }) {
  return (
    <img
      src={post.cover}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ objectPosition: post.focus || 'center' }}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

/** "อ่านต่อ ⟶" – small spaced-out label + a long thin arrow that stretches on hover */
export function ReadMore({ label }) {
  return (
    <span className="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4a4540] transition-colors group-hover:text-brand-700">
      {label}
      <span
        aria-hidden="true"
        className="relative h-px w-9 bg-current transition-[width] duration-300 group-hover:w-14 after:absolute after:-right-px after:-top-[3px] after:size-[7px] after:rotate-45 after:border-r after:border-t after:border-current"
      />
    </span>
  )
}

/** one post: topic written up the photo's left side · title · two lines · "อ่านต่อ ⟶" */
export function BlogCard({ post }) {
  const { t } = useI18n()
  return (
    <SmartLink href={blogHref(post)} className="group flex flex-col outline-none">
      <div className="flex gap-2.5">
        <span className="w-4 shrink-0 rotate-180 self-start whitespace-nowrap pb-1 text-[10.5px] font-semibold uppercase leading-4 tracking-[0.22em] text-[#77706a] [writing-mode:vertical-rl]">
          {t(post.tag)}
        </span>
        <div className="relative aspect-[5/4] flex-1 overflow-hidden bg-[#ebe5dd] ring-brand-600 ring-offset-2 group-focus-visible:ring-2">
          <Cover post={post} className="transition duration-700 ease-out group-hover:scale-[1.04]" />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center pl-[26px] pt-5 text-center">
        <h3 className="line-clamp-3 text-[17px] font-semibold leading-[1.55] text-[#26211d] transition-colors group-hover:text-brand-700">
          {post.title}
        </h3>
        <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-[1.75] text-[#6b6560]">{post.excerpt}</p>
        <span className="mt-auto pt-4">
          <ReadMore label={t('อ่านต่อ')} />
        </span>
      </div>
    </SmartLink>
  )
}

/** the newest post: big photo and a white card over its right edge */
function Featured({ post }) {
  const { t } = useI18n()
  return (
    <article className="relative grid lg:grid-cols-12 lg:items-center">
      <SmartLink href={blogHref(post)} tabIndex={-1} aria-hidden="true" className="group relative block lg:col-span-7 lg:col-start-1 lg:row-start-1">
        <div className="aspect-[4/3] overflow-hidden bg-[#ebe5dd] sm:aspect-[16/11]">
          <Cover post={post} eager className="transition duration-700 ease-out group-hover:scale-[1.03]" />
        </div>
      </SmartLink>

      <div className="relative z-10 mx-3 -mt-14 bg-white p-6 shadow-[0_24px_50px_-32px_rgb(40_30_20/0.45)] sm:mx-12 sm:p-9 lg:col-span-5 lg:col-start-7 lg:row-start-1 lg:mx-0 lg:mt-0 lg:p-11">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          {t(post.tag)} <span className="mx-1.5 text-[#c9c1b6]">·</span> <span className="tracking-[0.08em] text-[#8a837c]">{post.date}</span>
        </p>
        <h2 className="mt-3 text-[22px] font-semibold leading-[1.5] text-[#26211d] sm:text-[27px]">
          <SmartLink href={blogHref(post)} className="transition-colors hover:text-brand-700">
            {post.title}
          </SmartLink>
        </h2>
        <p className="mt-4 line-clamp-4 text-[14px] leading-[1.85] text-[#6b6560]">{post.excerpt}</p>
        <SmartLink
          href={blogHref(post)}
          className="mt-7 inline-flex bg-[#ece6dd] px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#3a342f] transition hover:bg-[#1f1c1a] hover:text-white"
        >
          {t('อ่านบทความ')}
        </SmartLink>
      </div>
    </article>
  )
}

export default function Blog() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag') || ''
  const posts = BLOG.posts
  const parallax = useParallax(0.3, 1.1) // banner photo moves slower than the page, as on the other pages

  // topics in the order they first appear in the data
  const tags = useMemo(() => [...new Set(posts.map((p) => p.tag).filter(Boolean))], [posts])
  const list = tag ? posts.filter((p) => p.tag === tag) : posts
  const [first, ...rest] = list

  const pick = (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set('tag', value)
    else next.delete('tag')
    setParams(next, { replace: true })
  }

  return (
    <>
      {/* ================= "THE BLOG" on a dark photo of the market ================= */}
      <section className="relative isolate grid h-[280px] place-items-center overflow-hidden bg-[#1c1a19] text-center text-white sm:h-[360px] lg:h-[440px]">
        <img ref={parallax} src={BLOG.hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_42%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/45 to-black/65" />
        <div className="px-4 lg:pt-14">
          {/* heavy + a little spaced; pl = the last letter's spacing, so the word stays centred */}
          <h1 className="pl-[0.06em] text-[46px] font-black uppercase leading-none tracking-[0.06em] [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[66px] lg:text-[80px]">The Blog</h1>
          <p className="mx-auto mt-4 max-w-[440px] text-[11.5px] font-semibold uppercase leading-[1.9] tracking-[0.2em] text-white/90 sm:mt-5 sm:max-w-[520px] sm:text-[12.5px]">
            {t('เรื่องเล่าจากตลาด ร้านเด็ด และเทศกาล ในสวนการค้าบองมาร์เช่')}
          </p>
        </div>
      </section>

      {/* sections side by side under the page (not wrapped): the site's scroll animation picks them up –
          the bar and the posts rise in as they come on screen, the cards one after another (ScrollFx.jsx) */}
      {/* ================= เลือกอ่านตามหมวด : ================= */}
      <section className={`${BLOG_BG} border-b border-[#e8e2d9]`}>
        <nav aria-label={t('เลือกอ่านตามหมวด')}>
          {/* phone: one row that slides sideways · wider: centred */}
          <div className="container-bm flex items-center gap-6 overflow-x-auto py-5 [scrollbar-width:none] sm:justify-center sm:gap-9 sm:py-6">
            <span className="shrink-0 text-[14px] font-semibold text-[#3a342f] sm:text-[15px]">{t('เลือกอ่านตามหมวด')} :</span>
            {[['', t('ทั้งหมด')], ...tags.map((x) => [x, t(x)])].map(([value, label]) => (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => pick(value)}
                aria-pressed={tag === value}
                className="relative shrink-0 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b6560] transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-[#1f1c1a] aria-pressed:text-[#1f1c1a] aria-pressed:after:scale-x-100"
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </section>

      {/* ================= posts: the newest large (photo, then its card), the rest 3 per row ================= */}
      <section className={`${BLOG_BG} pb-20 pt-14 sm:pt-16 lg:pb-24`}>
        <div className="container-bm">
          {!first ? (
            <div className="grid place-items-center py-16 text-center text-[#8a837c]">
              <BookOpen className="size-10" strokeWidth={1.4} />
              <p className="mt-3 text-[14px]">{t('ยังไม่มีบทความในหมวดนี้')}</p>
            </div>
          ) : (
            <>
              {/* key = topic: a new topic brings new elements, which animate in again */}
              <div key={`f-${tag}`} className="mx-auto max-w-[1040px]">
                <Featured post={first} />
              </div>
              {rest.length > 0 && (
                <div key={`g-${tag}`} className="mt-16 grid gap-x-8 gap-y-14 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
                  {rest.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

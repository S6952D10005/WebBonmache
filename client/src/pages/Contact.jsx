import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Heart, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import SmartLink from '../components/SmartLink'
import { useParallax } from '../components/ScrollFx'
import { Social } from '../components/Footer'
import { useI18n } from '../i18n'

/*
 * Contact (/contact) – laid out like the "Contact Us" template, in the site's white theme:
 *   photo header "Contact Us" → contact details (address · hours · phone · e-mail · follow us)
 *   beside the "ส่งข้อความถึงเรา" form → Google map in a rounded box (page width) with an address card.
 * Details come from the site settings (database site_settings / src/data/defaultData.js) – the same
 * values as the footer. The form posts to /api/contact (server/src/routes/contact.js), which saves
 * the message in the contact_messages table.
 * Motion: header photo moves slower than the page; sections and cards rise in as they come on screen.
 */

const HERO = '/images/contact/hero.webp' // front plaza with the Bon sign
const MAP_QUERY = 'Bon Marché Market Park, Lat Yao, Chatuchak, Bangkok'
// the same list as TOPICS in server/src/routes/contact.js (the server only accepts these)
const TOPICS = ['สอบถามทั่วไป', 'เช่าพื้นที่ / ร่วมธุรกิจ', 'ร้านค้าและสินค้า', 'แจ้งปัญหา / ข้อเสนอแนะ']
const EMPTY = {
  name: '',
  contact: '',
  topic: TOPICS[0],
  message: '',
  website: '',
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
const isPhone = (s) => /^\+?[\d\s-]{9,20}$/.test(s) && s.replace(/\D/g, '').length >= 9
const SOCIAL_COLORS = { facebook: '#1877f2', instagram: '#e1306c', line: '#06c755', tiktok: '#111111' }
const tel = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`

function check(v) {
  const errors = {}
  if (!v.name.trim()) errors.name = 'กรุณาใส่ชื่อ'
  if (!isEmail(v.contact.trim()) && !isPhone(v.contact.trim())) errors.contact = 'กรุณาใส่เบอร์โทรหรืออีเมลที่ติดต่อกลับได้'
  if (v.message.trim().length < 5) errors.message = 'กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร'
  return errors
}

/* ---------------------------------- form ---------------------------------- */

function Field({ id, label, error, children }) {
  const { t } = useI18n()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-[#c2410c] motion-safe:animate-[reveal-fade_.2s_ease-out]">
          <AlertCircle className="size-3.5 shrink-0" strokeWidth={2.4} />
          {t(error)}
        </p>
      )}
    </div>
  )
}

const inputClass = (bad) =>
  `w-full rounded-[12px] border bg-[#fbfaf8] px-4 py-3 text-[14.5px] text-ink outline-none transition placeholder:text-[#a8a49e] focus:bg-white focus:ring-4 ${
    bad ? 'border-[#f0a77c] focus:border-[#ea7b3d] focus:ring-[#fde3d3]' : 'border-[#e6e3de] hover:border-[#d6d2cb] focus:border-[#f5a46b] focus:ring-[#fdeee3]'
  }`

function MessageForm({ settings }) {
  const { t } = useI18n()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle · sending · sent · failed · busy
  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }))
    if (status === 'failed' || status === 'busy') setStatus('idle')
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = check(values)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`cf-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('sent')
        setValues(EMPTY)
      } else if (res.status === 400 && body.fields?.length) {
        setErrors(check(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, body.fields.includes(k) ? '' : values[k]]))))
        setStatus('idle')
      } else setStatus(res.status === 429 ? 'busy' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  if (status === 'sent')
    return (
      <div role="status" className="grid place-items-center py-10 text-center motion-safe:animate-[card-in_.45s_cubic-bezier(0.22,1,0.36,1)]">
        <span className="grid size-16 place-items-center rounded-full bg-[#fdeee3] text-accent-500 motion-safe:animate-[pin-ring_1.2s_ease-out_1]">
          <CheckCircle2 className="size-9" strokeWidth={2} />
        </span>
        <p className="mt-5 text-[19px] font-bold text-ink">{t('ส่งข้อความเรียบร้อยแล้ว')}</p>
        <p className="mt-2 max-w-[300px] text-[14px] leading-[1.7] text-muted">{t('ขอบคุณที่ติดต่อเรา เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด')}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-full border border-[#e6e3de] px-5 py-2.5 text-[13.5px] font-semibold text-ink transition hover:bg-[#faf8f5]"
        >
          {t('ส่งข้อความอีกครั้ง')}
        </button>
      </div>
    )

  const aria = (key) => ({
    'aria-invalid': !!errors[key] || undefined,
    'aria-describedby': errors[key] ? `cf-${key}-error` : undefined,
  })
  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field id="cf-name" label={t('ชื่อ-นามสกุล')} error={errors.name}>
        <input id="cf-name" autoComplete="name" value={values.name} onChange={set('name')} maxLength={100} className={inputClass(errors.name)} {...aria('name')} />
      </Field>
      <Field id="cf-contact" label={t('เบอร์โทร หรือ อีเมล')} error={errors.contact}>
        <input
          id="cf-contact"
          autoComplete="email"
          inputMode="email"
          placeholder="08x-xxx-xxxx / name@email.com"
          value={values.contact}
          onChange={set('contact')}
          maxLength={120}
          className={inputClass(errors.contact)}
          {...aria('contact')}
        />
      </Field>
      <Field id="cf-topic" label={t('เรื่องที่ติดต่อ')}>
        <select
          id="cf-topic"
          value={values.topic}
          onChange={set('topic')}
          className={`${inputClass(false)} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23138377' stroke-width='2.2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10`}
        >
          {TOPICS.map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </select>
      </Field>
      <Field id="cf-message" label={t('ข้อความ')} error={errors.message}>
        <textarea
          id="cf-message"
          rows={4}
          value={values.message}
          onChange={set('message')}
          maxLength={2000}
          className={`${inputClass(errors.message)} resize-y`}
          {...aria('message')}
        />
      </Field>
      {/* spam trap: hidden from people, bots fill it in */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.website}
        onChange={set('website')}
        className="absolute -left-[9999px] size-px opacity-0"
      />

      {(status === 'failed' || status === 'busy') && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[12px] bg-[#fff4ec] px-4 py-3 text-[13px] leading-[1.6] text-[#9a3412] motion-safe:animate-[reveal-fade_.2s_ease-out]"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
          <span>
            {status === 'busy'
              ? t('ส่งบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่')
              : t('ส่งไม่สำเร็จ ลองอีกครั้ง หรือโทร {phone}', {
                  phone: settings.phone,
                })}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-[12px] text-[#8a9895]">{t('ข้อมูลของคุณใช้เพื่อติดต่อกลับเท่านั้น')}</p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f7931e] to-accent-500 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_-10px_rgb(243_112_33/0.75)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-80"
        >
          {status === 'sending' ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <Send className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
          )}
          {status === 'sending' ? t('กำลังส่ง…') : t('ส่งข้อความ')}
        </button>
      </div>
    </form>
  )
}

/* ---------------------------------- page ---------------------------------- */

export default function Contact({ settings }) {
  const { t } = useI18n()
  const heroPhoto = useParallax(0.3, 1.1)
  const socials = [
    ['facebook', 'Facebook', settings.facebook_url],
    ['instagram', 'Instagram', settings.instagram_url],
    ['line', 'LINE', settings.line_url],
    ['tiktok', 'TikTok', settings.tiktok_url],
  ].filter(([, , url]) => url)

  // each detail in one of the brand colours (the same set as the home page topic bar)
  // wide = takes the whole row (the address is long; the other 4 then pair up 2 + 2)
  const details = [
    {
      icon: MapPin,
      color: '#f37021',
      title: t('ที่อยู่'),
      body: settings.address,
      href: settings.map_url,
      wide: true,
    },
    { icon: Clock, color: '#00a3e0', title: t('เวลาทำการ'), body: settings.opening_hours },
    {
      icon: Phone,
      color: '#ec1c8c',
      title: t('โทรศัพท์'),
      body: settings.phone,
      href: settings.phone && tel(settings.phone),
    },
    {
      icon: Mail,
      color: '#ea4335',
      title: t('อีเมล'),
      body: settings.email,
      href: settings.email && `mailto:${settings.email}`,
    },
    {
      icon: Heart,
      color: '#5c5853',
      title: t('ติดตามเรา'),
      body: (
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {/* each button in its own brand colour */}
          {socials.map(([key, label, url]) => (
            <SmartLink
              key={key}
              href={url}
              aria-label={label}
              title={label}
              style={{ backgroundColor: SOCIAL_COLORS[key] }}
              className="grid size-8 place-items-center rounded-full text-white shadow-[0_4px_10px_-6px_rgb(0_0_0/0.5)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                {Social[key]}
              </svg>
            </SmartLink>
          ))}
        </span>
      ),
    },
  ].filter((d) => d.body)

  return (
    <>
      {/* ================= photo header ================= */}
      <section className="relative isolate grid h-[280px] place-items-center overflow-hidden bg-[#1c1a19] text-center text-white sm:h-[360px] lg:h-[440px]">
        <img ref={heroPhoto} src={HERO} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_55%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/55" />
        <div className="px-4 lg:pt-14">
          <h1 className="text-[44px] font-black leading-none [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[60px] lg:text-[72px]">Contact Us</h1>
          <nav aria-label="breadcrumb" className="mt-4 flex items-center justify-center gap-2 text-[13px] font-medium text-white/85">
            <SmartLink href="/" className="hover:text-white">
              {t('หน้าแรก')}
            </SmartLink>
            <span className="text-white/50">/</span>
            <span className="text-white">{t('ติดต่อเรา')}</span>
          </nav>
        </div>
      </section>

      {/* ================= details + message form ================= */}
      {/* overflow-clip (not -hidden): the shapes below stick out, and a hidden-overflow box could be scrolled
          sideways when a field takes focus – clip can't be scrolled */}
      <section className="relative overflow-clip bg-gradient-to-b from-white via-white to-[#faf8f5] py-16 sm:py-20 lg:py-24">
        {/* soft round shapes in the background */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-[#e5f6fc]/70 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-[#fde9dc]/60 blur-3xl" />

        <div className="container-bm relative grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 lg:pt-6">
            <h2 className="text-[28px] leading-[1.3] text-ink sm:text-[34px]">
              {/* each half stays on one line (Thai would otherwise break inside "ช่องทาง") */}
              <span className="inline-block font-black">{t('ติดต่อบองมาร์เช่')}</span> <span className="inline-block font-light">{t('ได้ทุกช่องทาง')}</span>
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-[1.85] text-muted">{t('สอบถามข้อมูลร้านค้า เช่าพื้นที่ หรือแนะนำติชม ส่งข้อความถึงเรา หรือโทรหาเราได้ทุกวัน')}</p>

            {/* the details: address across the top, then 2 per row – icon tile tinted with the detail's colour (no hover effect) */}
            <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {details.map(({ icon: Icon, color, title, body, href, wide }) => (
                <div key={title} className={`flex items-center gap-4 ${wide ? 'sm:col-span-2' : ''}`} style={{ '--c': color }}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[color-mix(in_srgb,var(--c)_12%,white)] text-[var(--c)]">
                    <Icon className="size-[22px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[16.5px] font-bold text-ink">{title}</h3>
                    <div className="mt-1 text-[14px] leading-[1.7] text-[#6b706e]">
                      {href ? (
                        <SmartLink href={href} className="transition hover:text-[var(--c)]">
                          {body}
                        </SmartLink>
                      ) : (
                        body
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* message form card */}
          <div className="rounded-[24px] border border-[#ece9e4] bg-white p-6 shadow-[0_30px_60px_-36px_rgb(60_40_20/0.3)] sm:p-8 lg:col-span-5">
            <h2 className="text-[22px] font-bold text-ink">{t('ส่งข้อความถึงเรา')}</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.7] text-muted">{t('กรอกข้อมูลด้านล่าง เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด')}</p>
            <div className="mt-6">
              <MessageForm settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= map: a rounded box within the page width ================= */}
      <section className="bg-[#faf8f5] pb-16 sm:pb-20 lg:pb-24">
        <div className="container-bm">
          <div className="relative h-[340px] overflow-hidden rounded-[24px] border border-[#ece9e4] bg-[#f1efeb] shadow-[0_30px_60px_-40px_rgb(60_40_20/0.35)] sm:h-[420px]">
            <iframe
              title={t('แผนที่ {name}', { name: settings.site_name })}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&hl=th&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0"
            />
            {/* address card – top right (Google's own place card sits top left); phones: hidden, the address is just above */}
            <div className="absolute right-4 top-4 hidden max-w-[290px] rounded-[18px] bg-white p-5 shadow-[0_18px_40px_-20px_rgb(60_40_20/0.35)] md:block">
              <p className="flex items-center gap-2 text-[15px] font-bold text-ink">
                <MapPin className="size-4 text-accent-500" strokeWidth={2.4} />
                {settings.address_title}
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-muted">{settings.address}</p>
              {settings.map_url && (
                <SmartLink href={settings.map_url} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-600 hover:text-accent-500">
                  {t('เปิดใน Google Maps')}
                  <ExternalLink className="size-3.5" strokeWidth={2.4} />
                </SmartLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

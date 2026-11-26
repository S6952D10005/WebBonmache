import { Router } from 'express'
import { query } from '../db.js'

/*
 * POST /api/contact – the "ส่งข้อความถึงเรา" form on the Contact page (/contact)
 *   body: { name, contact, topic, message, website }
 *     contact = phone number or e-mail to answer · website = hidden spam trap (people leave it empty)
 *   → one row in contact_messages (database/update-2026-11-26-contact-messages.sql)
 *   Read them in MySQL Workbench:  SELECT * FROM contact_messages ORDER BY id DESC;
 *
 * Answers: 200 { ok } · 400 { error: 'invalid', fields } · 429 { error: 'too_many' }
 *          503 { error: 'not_ready' } (table not created yet) / database errors
 */
const router = Router()

export const TOPICS = ['สอบถามทั่วไป', 'เช่าพื้นที่ / ร่วมธุรกิจ', 'ร้านค้าและสินค้า', 'แจ้งปัญหา / ข้อเสนอแนะ']
const LIMIT = 5 // messages per visitor …
const WINDOW = 10 * 60 * 1000 // … in 10 minutes
const sent = new Map() // ip → times of their recent messages

const text = (v, max) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '')
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
const isPhone = (s) => /^\+?[\d\s-]{9,20}$/.test(s) && s.replace(/\D/g, '').length >= 9

router.post('/contact', async (req, res, next) => {
  const body = req.body || {}
  if (body.website) return res.json({ ok: true }) // a bot filled the hidden field – say "sent", keep nothing

  const name = text(body.name, 100)
  const contact = text(body.contact, 120)
  const topic = TOPICS.includes(body.topic) ? body.topic : TOPICS[0]
  const message = text(body.message, 2000)
  const fields = []
  if (!name) fields.push('name')
  if (!isEmail(contact) && !isPhone(contact)) fields.push('contact')
  if (message.length < 5) fields.push('message')
  if (fields.length) return res.status(400).json({ error: 'invalid', fields })

  // a few messages per visitor at most (stops one person flooding the table)
  const ip = req.ip || ''
  const now = Date.now()
  const times = (sent.get(ip) || []).filter((t) => now - t < WINDOW)
  if (times.length >= LIMIT) return res.status(429).json({ error: 'too_many' })
  sent.set(ip, [...times, now])
  if (sent.size > 5000) for (const [k, v] of sent) if (now - v[v.length - 1] > WINDOW) sent.delete(k)

  try {
    await query('INSERT INTO contact_messages (name, contact, topic, message, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)', [
      name,
      contact,
      topic,
      message,
      ip.slice(0, 45),
      text(req.get('user-agent'), 255),
    ])
    res.json({ ok: true })
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.warn('[contact] ยังไม่มีตาราง contact_messages → รัน database/update-2026-11-26-contact-messages.sql ใน MySQL Workbench')
      return res.status(503).json({ error: 'not_ready' })
    }
    next(err)
  }
})

export default router

/*
 * GET /api/social – latest posts from the market's Facebook Page (and its Instagram
 * business account), shaped like the social cards on the home page.
 * ---------------------------------------------------------------------------
 *  Settings in server/.env (how to get them: server/SOCIAL-SETUP.md)
 *    FB_PAGE_ID      Facebook Page ID
 *    FB_PAGE_TOKEN   Page access token (never put it in the website's front end)
 *    IG_USER_ID      optional – Instagram business account linked to the Page
 *    FB_GRAPH_VERSION, SOCIAL_CACHE_MINUTES   optional
 *
 *  - Results are kept for SOCIAL_CACHE_MINUTES (10): a new post shows on the site
 *    within ~10 minutes, and Facebook is asked at most once per 10 minutes.
 *  - The last good result is also saved to server/.cache/social.json, so the site
 *    keeps showing posts if Facebook can't be reached for a while.
 *  - Not set up yet → { configured: false } and the site shows its sample cards.
 * ---------------------------------------------------------------------------
 */
import { Router } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const router = Router()

const GRAPH = `https://graph.facebook.com/${process.env.FB_GRAPH_VERSION || 'v24.0'}`
const CACHE_MS = Number(process.env.SOCIAL_CACHE_MINUTES || 10) * 60_000
const PER_SOURCE = 8 // posts asked from each app (the site shows the newest 4)
const CACHE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.cache/social.json')

/* ---------------- Graph API ---------------- */
async function graph(endpoint, params) {
  const url = new URL(`${GRAPH}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error) {
    const err = new Error(body.error?.message || `HTTP ${res.status}`)
    err.code = body.error?.code
    throw err
  }
  return body
}

// first line of the post = card title, the rest = card text
export function splitMessage(message = '') {
  const lines = message.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  return { title: lines[0] || '', text: lines.slice(1).join(' ') }
}

export function fromFacebook(rows = []) {
  return rows
    .filter((p) => p.message || p.full_picture) // skip empty shares / cover changes
    .map((p) => {
      const kind = `${p.attachments?.data?.[0]?.media_type || ''} ${p.attachments?.data?.[0]?.type || ''} ${p.status_type || ''}`
      return {
        id: `fb-${p.id}`,
        platform: 'facebook',
        ...splitMessage(p.message),
        time: p.created_time,
        likes: p.reactions?.summary?.total_count ?? 0, // all reactions (👍❤️😆 …)
        comments: p.comments?.summary?.total_count ?? 0,
        image: p.full_picture || null,
        video: /video/i.test(kind),
        url: p.permalink_url,
      }
    })
}

export function fromInstagram(rows = []) {
  return rows.map((m) => ({
    id: `ig-${m.id}`,
    platform: 'instagram',
    ...splitMessage(m.caption),
    time: m.timestamp,
    likes: m.like_count ?? null, // hidden when the account hides like counts
    comments: m.comments_count ?? null,
    image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url,
    video: m.media_type === 'VIDEO',
    url: m.permalink,
  }))
}

async function fetchAll() {
  const { FB_PAGE_ID, FB_PAGE_TOKEN: token, IG_USER_ID } = process.env
  const jobs = []
  if (FB_PAGE_ID)
    jobs.push(
      graph(`${FB_PAGE_ID}/posts`, {
        fields:
          'id,message,created_time,permalink_url,full_picture,status_type,attachments.limit(1){media_type,type},reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)',
        limit: PER_SOURCE,
        access_token: token,
      }).then((r) => fromFacebook(r.data)),
    )
  if (IG_USER_ID)
    jobs.push(
      graph(`${IG_USER_ID}/media`, {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit: PER_SOURCE,
        access_token: token,
      }).then((r) => fromInstagram(r.data)),
    )
  const results = await Promise.allSettled(jobs)
  const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason)
  failed.forEach(logOnce)
  if (failed.length === results.length) throw failed[0] // nothing worked
  const posts = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
  return { configured: true, updatedAt: new Date().toISOString(), posts }
}

/* ---------------- cache (memory + file) ---------------- */
let cache = null // { at, data }
let pending = null

async function readFileCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'))
  } catch {
    return null
  }
}
async function writeFileCache(entry) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true })
    await fs.writeFile(CACHE_FILE, JSON.stringify(entry))
  } catch (err) {
    logOnce(err)
  }
}

async function latest() {
  if (!cache) cache = await readFileCache() // after a restart: reuse what was saved
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data
  pending ||= fetchAll()
    .then(async (data) => {
      cache = { at: Date.now(), data }
      await writeFileCache(cache)
      return data
    })
    .finally(() => (pending = null))
  try {
    return await pending
  } catch (err) {
    if (cache) return { ...cache.data, stale: true } // Facebook down → last good posts
    throw err
  }
}

/* ---------------- errors in plain words (Thai) ---------------- */
function hint(err) {
  switch (err.code) {
    case 190:
      return 'token หมดอายุหรือใช้ไม่ได้ → สร้าง Page token ใหม่ตาม server/SOCIAL-SETUP.md แล้วแก้ FB_PAGE_TOKEN ใน server/.env'
    case 10:
    case 200:
      return 'token ยังไม่มีสิทธิ์อ่านโพสต์ → ตอนสร้าง token ให้ติ๊ก pages_read_engagement (และ instagram_basic ถ้าดึง IG)'
    case 100:
      return 'FB_PAGE_ID / IG_USER_ID ไม่ถูกต้อง → ตรวจตัวเลข ID ใน server/.env'
    case 4:
    case 17:
    case 32:
      return 'เรียก Facebook ถี่เกินไป → รอสักครู่ (ระบบจะใช้โพสต์ที่เก็บไว้ล่าสุดแทน)'
    default:
      return 'ตรวจการตั้งค่าใน server/.env ตาม server/SOCIAL-SETUP.md'
  }
}
const logged = new Set()
function logOnce(err) {
  const key = `${err.code}:${err.message}`
  if (logged.has(key)) return
  logged.add(key)
  console.warn(`[social] ${err.code ?? ''} ${err.message}\n      วิธีแก้: ${hint(err)}`)
}

/* ---------------- route ---------------- */
router.get('/social', async (_req, res) => {
  const { FB_PAGE_ID, FB_PAGE_TOKEN, IG_USER_ID } = process.env
  if (!FB_PAGE_TOKEN || !(FB_PAGE_ID || IG_USER_ID)) return res.json({ configured: false, posts: [] })
  try {
    res.set('Cache-Control', 'public, max-age=120')
    res.json(await latest())
  } catch (err) {
    logOnce(err)
    res.status(502).json({ configured: true, posts: [], error: err.message, hint: hint(err) })
  }
})

export default router

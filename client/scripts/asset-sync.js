/**
 * Asset auto-sync
 * ---------------
 * Converts the designer's source images in client/asset/ into the web-ready
 * files in client/public/ (see assets.config.js for the list).
 *
 *  - `npm run dev`   : converts anything out of date on start, then watches
 *                      client/asset/ and assets.config.js. Saving / replacing a
 *                      file converts it and reloads every open browser tab.
 *  - `npm run build` : converts anything out of date before building.
 *  - `npm run assets`: converts everything again (node scripts/asset-sync.js --all).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

// don't keep source files open/cached – on Windows that would block re-saving them
sharp.cache(false)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const ASSET_DIR = path.join(ROOT, 'asset')
export const PUBLIC_DIR = path.join(ROOT, 'public')
export const CONFIG_FILE = path.join(ROOT, 'assets.config.js')

/** comparable path: forward slashes, one Unicode form, case-insensitive (Windows) */
const norm = (p) => p.normalize('NFC').replace(/\\/g, '/').toLowerCase()

export async function loadConfig() {
  // query string = always read the latest version of the file
  const mod = await import(`${pathToFileURL(CONFIG_FILE).href}?t=${Date.now()}`)
  return mod.default || []
}

const LOGO_OUTPUTS = ['images/logo-white.webp', 'images/logo-color.webp', 'favicon.png']
const outputsOf = (e) => (e.type === 'logo' ? LOGO_OUTPUTS : [e.out])

/** the config entry for an absolute file path inside client/asset (or undefined) */
export function findEntry(entries, file) {
  const rel = norm(path.relative(ASSET_DIR, file))
  return entries.find((e) => norm(e.src) === rel)
}

/** write via a temp file so the browser never receives a half-written image */
async function write(pipeline, outRel) {
  const out = path.join(PUBLIC_DIR, outRel)
  const tmp = `${out}.tmp`
  await fs.promises.mkdir(path.dirname(out), { recursive: true })
  await pipeline.toFile(tmp)
  try {
    await fs.promises.rename(tmp, out)
  } catch {
    await fs.promises.copyFile(tmp, out)
    await fs.promises.rm(tmp, { force: true })
  }
}

async function makeLogo(src) {
  const { data, info } = await sharp(src)
    .trim({ threshold: 1 })
    .resize({ width: 480 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // colour version: everything that isn't the orange star becomes brand teal #0f6f66
  const color = Buffer.from(data)
  for (let i = 0; i < color.length; i += 4) {
    const [r, g, b] = [color[i], color[i + 1], color[i + 2]]
    const isOrange = r > 180 && g < 160 && b < 110
    if (!isOrange) [color[i], color[i + 1], color[i + 2]] = [15, 111, 102]
  }
  const raw = { raw: { width: info.width, height: info.height, channels: 4 } }
  const clear = { r: 0, g: 0, b: 0, alpha: 0 }

  await write(sharp(data, raw).webp({ quality: 92, alphaQuality: 100 }), LOGO_OUTPUTS[0])
  await write(sharp(color, raw).webp({ quality: 92, alphaQuality: 100 }), LOGO_OUTPUTS[1])
  await write(
    sharp(color, raw)
      .resize(56, 56, { fit: 'contain', background: clear })
      .extend({ top: 4, bottom: 4, left: 4, right: 4, background: clear })
      .png(),
    LOGO_OUTPUTS[2],
  )
}

/** convert one config entry */
export async function convert(entry) {
  const src = path.join(ASSET_DIR, entry.src)
  if (entry.type === 'logo') return makeLogo(src)

  let img = sharp(src)
  if (entry.width && entry.height)
    // fixed box (e.g. 720×480) – crop to fill, `position` picks which part stays (centre / top / bottom …)
    img = img.resize({ width: entry.width, height: entry.height, fit: 'cover', position: entry.position || 'centre' })
  else if (entry.width) img = img.resize({ width: entry.width, withoutEnlargement: true })
  const ext = path.extname(entry.out).toLowerCase()
  if (ext === '.webp') img = img.webp({ quality: entry.quality ?? 84 })
  else if (ext === '.jpg' || ext === '.jpeg')
    img = img.flatten({ background: '#ffffff' }).jpeg({ quality: entry.quality ?? 82, mozjpeg: true })
  else if (ext === '.png') img = img.png()
  else throw new Error(`unsupported output type "${ext}" (use .webp, .jpg or .png)`)
  await write(img, entry.out)
}

const mtime = (file) => fs.promises.stat(file).then((s) => s.mtimeMs, () => 0)

/** convert every entry whose output is missing or older than its source (or all with force) */
export async function syncAll(entries, { force = false, log = console } = {}) {
  const done = []
  for (const e of entries) {
    const src = path.join(ASSET_DIR, e.src)
    const srcTime = await mtime(src)
    if (!srcTime) {
      log.warn(`[assets] ไม่พบไฟล์ asset/${e.src}`)
      continue
    }
    const outTimes = await Promise.all(outputsOf(e).map((o) => mtime(path.join(PUBLIC_DIR, o))))
    if (!force && outTimes.every((t) => t >= srcTime)) continue
    try {
      await convert(e)
      done.push(e)
      log.info(`[assets] ✓ asset/${e.src} → public/${outputsOf(e).join(', public/')}`)
    } catch (err) {
      log.error(`[assets] ✗ asset/${e.src}: ${err.message}`)
    }
  }
  return done
}

/* ---------------- Vite plugin ---------------- */
export function assetSync() {
  let entries = []
  const log = {
    info: (m) => console.log(`\x1b[32m${m}\x1b[0m`),
    warn: (m) => console.warn(`\x1b[33m${m}\x1b[0m`),
    error: (m) => console.error(`\x1b[31m${m}\x1b[0m`),
  }

  return {
    name: 'bonmarche-asset-sync',

    async buildStart() {
      // on Vercel / CI the converted images are already in public/images (committed) – skip
      if (process.env.VERCEL || process.env.CI) return
      entries = await loadConfig()
      await syncAll(entries, { log })
    },

    configureServer(server) {
      // always re-check images with the dev server, so a replaced image shows up on reload
      server.middlewares.use((req, res, next) => {
        if (/^\/(images\/|favicon)/.test(req.url || '')) res.setHeader('Cache-Control', 'no-cache')
        next()
      })

      server.watcher.add([ASSET_DIR, CONFIG_FILE])
      const reload = () => server.ws.send({ type: 'full-reload', path: '*' })
      const timers = new Map()

      const handle = async (file, attempt = 1) => {
        // assets.config.js edited → reload the list and convert what changed
        if (norm(file) === norm(CONFIG_FILE)) {
          entries = await loadConfig()
          if ((await syncAll(entries, { log })).length) reload()
          return
        }
        const entry = findEntry(entries, file)
        if (!entry) {
          log.warn(
            `[assets] asset/${path.relative(ASSET_DIR, file).replace(/\\/g, '/')} ยังไม่ได้ผูกกับรูปบนเว็บ → เพิ่มบรรทัดใน client/assets.config.js`,
          )
          return
        }
        try {
          await convert(entry)
          log.info(`[assets] ✓ อัปเดต asset/${entry.src} → public/${outputsOf(entry).join(', public/')}`)
          reload()
        } catch (err) {
          // the design app may still be writing the file – try again shortly
          if (attempt < 4) setTimeout(() => handle(file, attempt + 1), 800)
          else log.error(`[assets] ✗ asset/${entry.src}: ${err.message}`)
        }
      }

      const onFile = (file) => {
        const f = norm(file)
        if (f !== norm(CONFIG_FILE) && !f.startsWith(`${norm(ASSET_DIR)}/`)) return
        // wait until the file has finished saving (many apps write in several steps)
        clearTimeout(timers.get(f))
        timers.set(
          f,
          setTimeout(() => {
            timers.delete(f)
            handle(file)
          }, 400),
        )
      }
      server.watcher.on('add', onFile)
      server.watcher.on('change', onFile)
    },
  }
}

/* ---------------- CLI: npm run assets ---------------- */
if (process.argv[1] && norm(path.resolve(process.argv[1])) === norm(fileURLToPath(import.meta.url))) {
  const force = process.argv.includes('--all')
  const done = await syncAll(await loadConfig(), { force })
  console.log(`[assets] เสร็จแล้ว – แปลง ${done.length} รายการ`)
}

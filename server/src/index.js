import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { pool } from './db.js'
import homeRoutes from './routes/home.js'
import socialRoutes from './routes/social.js'

const app = express()
const PORT = Number(process.env.PORT || 5000)

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', code: err.code, hint: dbHint(err) })
  }
})

app.use('/api', homeRoutes)
app.use('/api', socialRoutes) // GET /api/social – latest Facebook / Instagram posts

// Explain common MySQL errors in plain words (Thai) so they are easy to fix
function dbHint(err) {
  switch (err.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return process.env.DB_PASSWORD
        ? 'รหัสผ่าน MySQL ไม่ถูกต้อง → แก้ DB_USER / DB_PASSWORD ใน server/.env ให้ตรงกับที่ใช้ล็อกอิน MySQL Workbench'
        : 'ยังไม่ได้ใส่รหัสผ่าน MySQL → ใส่ DB_PASSWORD=รหัสผ่านของคุณ ใน server/.env แล้วบันทึกไฟล์ (เซิร์ฟเวอร์จะรีสตาร์ทเอง)'
    case 'ER_BAD_DB_ERROR':
      return 'ยังไม่มีฐานข้อมูล "' + (process.env.DB_NAME || 'bonmarche') + '" → เปิด database/bonmarche.sql ใน MySQL Workbench แล้วกด Execute (⚡)'
    case 'ER_NO_SUCH_TABLE':
      return 'ยังไม่มีตารางในฐานข้อมูล → รัน database/bonmarche.sql ใน MySQL Workbench'
    case 'ECONNREFUSED':
      return 'เชื่อมต่อ MySQL ไม่ได้ → ตรวจว่า MySQL Server เปิดอยู่ และ DB_HOST / DB_PORT ใน server/.env ถูกต้อง'
    default:
      return 'ตรวจการตั้งค่าใน server/.env'
  }
}

// error handler – log each distinct error once instead of on every request
const logged = new Set()
app.use((err, _req, res, _next) => {
  const key = err.code || err.message
  if (!logged.has(key)) {
    logged.add(key)
    console.error(`[api] ${err.code || 'ERROR'}: ${err.message}
      วิธีแก้: ${dbHint(err)}`)
  }
  res.status(503).json({ error: 'Database unavailable', code: err.code, hint: dbHint(err) })
})

app.listen(PORT, async () => {
  console.log(`Bon Marché API → http://localhost:${PORT}/api`)
  try {
    await pool.query('SELECT 1')
    console.log(`MySQL connected → ${process.env.DB_NAME || 'bonmarche'}`)
  } catch (err) {
    console.warn(`MySQL not connected (${err.code || err.message})
      วิธีแก้: ${dbHint(err)}
      ระหว่างนี้หน้าเว็บจะใช้ข้อมูลตัวอย่างแทน`)
    logged.add(err.code || err.message)
  }
})

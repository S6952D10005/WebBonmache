# Bon Marché – Website

เว็บไซต์ Bon Marché (Fresh • Healthy • Community)
**Frontend:** React 19 + Vite + Tailwind CSS v4 · **Backend:** Node.js + Express · **Database:** MySQL (MySQL Workbench)

```
WebBonmache/
├─ client/                 ← React + Tailwind (หน้าเว็บ)
│  └─ src/
│     ├─ App.jsx           ← ประกอบทุก section + ดึงข้อมูลจาก /api/home
│     ├─ data/defaultData.js  ← ข้อมูลสำรอง (ใช้เมื่อยังไม่ได้ต่อฐานข้อมูล)
│     └─ components/       ← Header, Hero, ThisWeek, Categories, MustTry,
│                             VisitInfo, LeasingBanner, Footer, Decor (brush/leaf/logo)
├─ server/                 ← Express API ต่อ MySQL
│  ├─ .env                 ← ตั้งค่า user/password ของ MySQL
│  └─ src/ (index.js, db.js, routes/home.js)
└─ database/bonmarche.sql  ← สร้างฐานข้อมูล + ตาราง + ข้อมูลตัวอย่าง
```

## 1) ตั้งค่าฐานข้อมูล (MySQL Workbench)
1. เปิด MySQL Workbench → เชื่อมต่อ `Local instance`
2. File → Open SQL Script → เลือก `database/bonmarche.sql`
3. กด ⚡ Execute ทั้งไฟล์ → จะได้ฐานข้อมูล `bonmarche` พร้อมข้อมูลตัวอย่าง
4. แก้ไฟล์ `server/.env` ใส่รหัสผ่าน MySQL ของคุณ:
   ```
   DB_USER=root
   DB_PASSWORD=รหัสผ่านของคุณ
   DB_NAME=bonmarche
   ```

## 2) ติดตั้งและรัน
```bash
npm run install:all
```
```bash
npm run dev
```
- หน้าเว็บ: http://localhost:5173
- API: http://localhost:5000/api/home · ตรวจการเชื่อมต่อ DB: http://localhost:5000/api/health

> ถ้ายังต่อฐานข้อมูลไม่ได้ หน้าเว็บจะใช้ข้อมูลจาก `client/src/data/defaultData.js` แทน จึงแสดงผลได้เสมอ

## ตารางในฐานข้อมูล
| ตาราง | ใช้กับส่วน |
|---|---|
| `site_settings` | ข้อความ Hero, รูปภาพ, แบนเนอร์ผู้เช่า, ที่อยู่, ลิงก์โซเชียล (key/value) |
| `nav_menus` | เมนูด้านบน + Footer |
| `highlights` | This week at Bon Marché (อีเวนต์ / โปรโมชั่น) |
| `categories` | ค้นหาตามหมวดหมู่ (`icon`: utensils, salad, bag, coffee, heart, gift, sparkles, map · `color`: orange, teal, pink) |
| `shops` | Must-try & New Shops |
| `visit_info` | Visit Info (`icon`: clock, car, wheelchair) |

## API
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/home` | ข้อมูลทั้งหมดของหน้าแรกใน request เดียว |
| GET | `/api/settings` `/api/menus` `/api/highlights` `/api/categories` `/api/shops` `/api/visit-info` | แยกตามส่วน |
| GET | `/api/shops/:id` | รายละเอียดร้าน |
| GET | `/api/health` | สถานะการเชื่อมต่อ MySQL |

## เปลี่ยนเนื้อหา / รูปภาพ
- แก้ข้อมูลในตารางผ่าน MySQL Workbench แล้วรีเฟรชหน้าเว็บ
- รูปตัวอย่างมาจาก Unsplash — เปลี่ยนเป็นรูปจริงได้โดยใส่ URL ใหม่ในคอลัมน์ `image_url` / `site_settings` หรือวางไฟล์ไว้ที่ `client/public/images/` แล้วใช้ path เช่น `/images/hero.jpg`
- สีหลักของแบรนด์ตั้งไว้ที่ `client/src/index.css` (`--color-brand-*`, `--color-accent-*`)

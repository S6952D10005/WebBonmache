/*
 * ============================================================================
 *  รายการรูปที่ "อัปเดตอัตโนมัติ"
 * ============================================================================
 *  วางไฟล์ / เซฟทับไฟล์ในโฟลเดอร์ client/asset แล้วเว็บจะอัปเดตเองทันที
 *  (ขณะ `npm run dev` เปิดอยู่) – ระบบจะย่อ/แปลงรูปลง client/public แล้วรีโหลดหน้าเว็บให้
 *
 *  ต้องการผูกรูปใหม่ → เพิ่ม 1 บรรทัดในรายการด้านล่าง
 *    src     : ไฟล์ต้นฉบับ (นับจากโฟลเดอร์ client/asset)
 *    out     : ไฟล์ที่เว็บใช้ (นับจากโฟลเดอร์ client/public) – นามสกุล .webp / .jpg / .png
 *    width   : (ไม่บังคับ) ย่อความกว้างเหลือกี่ px
 *    quality : (ไม่บังคับ) คุณภาพ 1–100
 *    type    : 'logo' = สร้างโลโก้สีขาว + สีเขียว + favicon จากไฟล์เดียว
 *
 *  แปลงทั้งหมดใหม่ด้วยมือ:  npm run assets
 * ============================================================================
 */
export default [
  // ---------- แบนเนอร์ / พื้นหลัง (ขนาดจริง) ----------
  { src: 'blackground/blackgroundBonMarché.png', out: 'images/hero-banner.webp', quality: 84 },
  { src: 'blackground/VisitInfo.png', out: 'images/visit-banner.webp', quality: 84 },
  { src: 'blackground/Let’s Grow.png', out: 'images/leasing-banner.webp', quality: 84 },
  { src: 'blackground/footer.png', out: 'images/footer-bg.webp', quality: 86 },

  // ---------- โลโก้ (→ logo-white.webp, logo-color.webp, favicon.png) ----------
  { src: 'blackground/Logo.png', type: 'logo' },

  // ---------- This week at Bon Marché (การ์ด 1–5) ----------
  { src: 'Ohter/fresh.png', out: 'images/week-1.jpg', width: 720, quality: 82 },
  { src: 'Ohter/Bon Cafe.png', out: 'images/week-2.jpg', width: 720, quality: 82 },
  { src: 'Ohter/Green Corner.png', out: 'images/week-3.jpg', width: 720, quality: 82 },
  { src: 'Ohter/Taste of thailand.png', out: 'images/week-4.jpg', width: 720, quality: 82 },
  { src: 'Ohter/Wellness Shop.png', out: 'images/week-5.jpg', width: 720, quality: 82 },

  // ---------- Must-try & New Shops (การ์ด 1–5) ----------
  // width + height = ตัดทุกรูปให้เป็นสัดส่วนเดียวกัน (3:2) การ์ดจะเท่ากันทุกใบ
  // position = ส่วนของรูปที่ต้องการเก็บไว้เมื่อถูกตัด: 'centre' | 'top' | 'bottom' | 'left' | 'right'
  { src: 'Ohter/ข้าวมันไก่.png', out: 'images/shop-1.jpg', width: 720, height: 480, quality: 82 },
  { src: 'Ohter/maison.png', out: 'images/shop-2.jpg', width: 720, height: 480, quality: 82 },
  { src: 'Ohter/green day smoothie.png', out: 'images/shop-3.jpg', width: 720, height: 480, quality: 82 },
  { src: 'Ohter/urban.png', out: 'images/shop-4.jpg', width: 720, height: 480, quality: 82 },
  { src: 'Ohter/seafood.png', out: 'images/shop-5.jpg', width: 720, height: 480, quality: 82 },

  // ---------- หน้าแรก: ไฮไลต์ที่ไม่ควรพลาด (การ์ด 1–4, สัดส่วน 4:5) ----------
  { src: 'highlig/1.jpg', out: 'images/happening-1.jpg', width: 720, height: 900, quality: 82 },
  { src: 'highlig/2.jpg', out: 'images/happening-2.jpg', width: 720, height: 900, quality: 82 },
  { src: 'highlig/3.jpg', out: 'images/happening-3.jpg', width: 720, height: 900, quality: 82 },
  { src: 'highlig/4.jpg', out: 'images/happening-4.jpg', width: 720, height: 900, quality: 82 },
]

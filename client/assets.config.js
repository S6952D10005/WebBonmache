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
  { src: 'Ohter/highlig/1.jpg', out: 'images/happening-1.jpg', width: 720, height: 900, quality: 82 },
  { src: 'Ohter/highlig/2.jpg', out: 'images/happening-2.jpg', width: 720, height: 900, quality: 82 },
  { src: 'Ohter/highlig/3.jpg', out: 'images/happening-3.jpg', width: 720, height: 900, quality: 82 },
  { src: 'Ohter/highlig/4.jpg', out: 'images/happening-4.jpg', width: 720, height: 900, quality: 82 },

  // ---------- หน้าแรก: กิจกรรมทั้งหมด (การ์ด 1–4, แบนเนอร์แนวนอน – ไม่ตัดรูป แสดงเต็มภาพ) ----------
  { src: 'Ohter/activity/1.png', out: 'images/event-1.jpg', width: 960, quality: 84 },
  { src: 'Ohter/activity/2.png', out: 'images/event-2.jpg', width: 960, quality: 84 },
  { src: 'Ohter/activity/3.png', out: 'images/event-3.jpg', width: 960, quality: 84 },
  { src: 'Ohter/activity/4.png', out: 'images/event-4.jpg', width: 960, quality: 84 },

  // ---------- หน้าแรก: เรื่องอร่อยในบองมาร์เช่ (รูปจากหน้าร้านใน bonmarche.co.th/explore, ตัด 4:3 ทุกรูป) ----------
  { src: 'Ohter/stories/oaw-leng-yoo.jpg', out: 'images/stories/oaw-leng-yoo.jpg', width: 1200, height: 900, quality: 82 },
  { src: 'Ohter/stories/akong-ngee.jpg', out: 'images/stories/akong-ngee.jpg', width: 960, height: 720, quality: 82 },
  { src: 'Ohter/stories/kuntoy.jpg', out: 'images/stories/kuntoy.jpg', width: 960, height: 720, quality: 82 },
  { src: 'Ohter/stories/neighbourhood.jpg', out: 'images/stories/neighbourhood.jpg', width: 960, height: 720, quality: 82 },
  { src: 'Ohter/stories/sanaejunn.jpg', out: 'images/stories/sanaejunn.jpg', width: 960, height: 720, quality: 82 },
  { src: 'Ohter/stories/akong-ngee-logo.jpg', out: 'images/stories/akong-ngee-logo.webp', width: 160, quality: 86 },

  // ข่าวสารบองมาร์เช่ (หน้าแรก) – รูปจากข่าวใน bonmarche.co.th/news · ไม่ crop (เป็นโปสเตอร์มีตัวหนังสือ)
  { src: 'Ohter/news/premium-market-2565.jpg', out: 'images/news/premium-market-2565.jpg', width: 1400, quality: 82 },
  { src: 'Ohter/news/red-line-route.jpg', out: 'images/news/red-line-route.jpg', width: 960, quality: 82 },
  { src: 'Ohter/news/diamond-market.jpg', out: 'images/news/diamond-market.jpg', width: 960, quality: 82 },
  { src: 'Ohter/news/covid-check-2564.jpg', out: 'images/news/covid-check-2564.jpg', width: 960, quality: 82 },
  { src: 'Ohter/news/survey-2563.jpg', out: 'images/news/survey-2563.jpg', width: 960, quality: 82 },
  { src: 'Ohter/news/covid-procedure.jpg', out: 'images/news/covid-procedure.jpg', width: 1280, quality: 82 },

  // สไลด์หน้าแรก (Hero slider) – รูปตลาดจริงจาก bonmarche.co.th (หน้าเกี่ยวกับเรา)
  { src: 'Ohter/slides/lakeside-night.jpg', out: 'images/slides/lakeside-night.jpg', width: 1600, height: 1000, quality: 80 },
  { src: 'Ohter/slides/fresh-market.jpg', out: 'images/slides/fresh-market.jpg', width: 1600, height: 1000, quality: 80 },
  { src: 'Ohter/slides/lakeside-dusk.jpg', out: 'images/slides/lakeside-dusk.jpg', width: 1600, height: 1000, quality: 80 },
  { src: 'Ohter/slides/plaza.jpg', out: 'images/slides/plaza.jpg', width: 1600, height: 1000, quality: 80 },

  // ---------- หน้าแรก: ร้านดังในบองมาร์เช่ (โลโก้ร้าน = zone/<โซน>/<บูธ>/LOGO.jpg) ----------
  { src: 'zone/J/J101/LOGO.jpg', out: 'images/brands/starbucks.webp', width: 360, quality: 86 },
  { src: 'zone/G/G106/LOGO.jpg', out: 'images/brands/dairy-queen.webp', width: 360, quality: 86 },
  { src: 'zone/C/C101/LOGO.jpg', out: 'images/brands/tops.webp', width: 360, quality: 86 },
  { src: 'zone/E/E105-2/LOGO.jpg', out: 'images/brands/chesters.webp', width: 360, quality: 86 },
  { src: 'zone/ปรับปรุง/ป.19/LOGO.jpg', out: 'images/brands/jones-salad.webp', width: 360, quality: 86 },
  { src: 'zone/G/G105/LOGO.jpg', out: 'images/brands/yoguruto.webp', width: 360, quality: 86 },
  { src: 'zone/ปรับปรุง/ป.4/LOGO.jpg', out: 'images/brands/shaho-roti.webp', width: 360, quality: 86 },
  { src: 'zone/ปรับปรุง/ป.1/LOGO.jpg', out: 'images/brands/pratad-lom-noodles.webp', width: 360, quality: 86 },
  { src: 'zone/E/E102-1/LOGO.jpg', out: 'images/brands/chamto.webp', width: 360, quality: 86 },
  { src: 'zone/E/E103/LOGO.jpg', out: 'images/brands/salada.webp', width: 360, quality: 86 },
  { src: 'zone/FC/อ.24/LOGO.jpg', out: 'images/brands/ann-guay-tiew-kua-gai.webp', width: 360, quality: 86 },
  { src: 'zone/FC/อ.8/LOGO.jpg', out: 'images/brands/radna-9-yod.webp', width: 360, quality: 86 },
  { src: 'zone/ซุ้มทางเดิน/ซ.6/LOGO.jpg', out: 'images/brands/tua-bang-nara.webp', width: 360, quality: 86 },
  { src: 'zone/ตลาด/ต.118/LOGO.jpg', out: 'images/brands/mae-ranjuan.webp', width: 360, quality: 86 },
  { src: 'zone/ตลาด/ต.21-26/LOGO.jpg', out: 'images/brands/sanaejunn.webp', width: 360, quality: 86 },
  { src: 'zone/ตลาด/ต.101-106/LOGO.jpg', out: 'images/brands/baan-mahabundit.webp', width: 360, quality: 86 },
  { src: 'zone/A/A116-121/LOGO.jpg', out: 'images/brands/pryya.webp', width: 360, quality: 86 },
  { src: 'zone/A/A177-178/LOGO.jpg', out: 'images/brands/madame-pearl.webp', width: 360, quality: 86 },
  { src: 'zone/B/B143,166/LOGO.jpg', out: 'images/brands/soulmate.webp', width: 360, quality: 86 },
  { src: 'zone/D/D103/LOGO.jpg', out: 'images/brands/chaaum.webp', width: 360, quality: 86 },
  { src: 'zone/G/G107-108/LOGO.jpg', out: 'images/brands/wolf.webp', width: 360, quality: 86 },
  { src: 'zone/A/A137/LOGO.jpg', out: 'images/brands/sriya-pharmacy.webp', width: 360, quality: 86 },
  { src: 'zone/H/H201/LOGO.jpg', out: 'images/brands/mos-dental-clinic.webp', width: 360, quality: 86 },
  { src: 'zone/F/F101-104/LOGO.jpg', out: 'images/brands/elite.webp', width: 360, quality: 86 },
  { src: 'zone/F/F206/LOGO.jpg', out: 'images/brands/bwk-international.webp', width: 360, quality: 86 },
  { src: 'zone/F/F201-203/LOGO.jpg', out: 'images/brands/de-loop.webp', width: 360, quality: 86 },
  { src: 'zone/H/H101/LOGO.jpg', out: 'images/brands/byd.webp', width: 360, quality: 86 },
  { src: 'zone/N/N101/LOGO.jpg', out: 'images/brands/infinity-carwash.webp', width: 360, quality: 86 },

  // ---------- Shop Directory: รูปร้าน (zone/<โซน>/<บูธ>/*.jpg → images/shops/<ร้าน>-<n>.webp) ----------
  { src: 'zone/J/J101/S__57483279_0.jpg', out: 'images/shops/starbucks-1.webp', width: 800, quality: 76 },
  { src: 'zone/J/J101/S__57483280_0.jpg', out: 'images/shops/starbucks-2.webp', width: 800, quality: 76 },
  { src: 'zone/J/J101/S__57483281_0.jpg', out: 'images/shops/starbucks-3.webp', width: 800, quality: 76 },
  { src: 'zone/G/G106/S__57483289_0.jpg', out: 'images/shops/dairy-queen-1.webp', width: 800, quality: 76 },
  { src: 'zone/C/C101/messageImage_1795073175674.jpg', out: 'images/shops/tops-1.webp', width: 800, quality: 76 },
  { src: 'zone/C/C101/messageImage_1795073253903.jpg', out: 'images/shops/tops-2.webp', width: 800, quality: 76 },
  { src: 'zone/E/E105-2/S__57475169_0.jpg', out: 'images/shops/chesters-1.webp', width: 800, quality: 76 },
  { src: 'zone/E/E105-2/S__57475170_0.jpg', out: 'images/shops/chesters-2.webp', width: 800, quality: 76 },
  { src: 'zone/E/E105-2/S__57475171_0.jpg', out: 'images/shops/chesters-3.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.19/S__57450600_0.jpg', out: 'images/shops/jones-salad-1.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.19/S__57450601_0.jpg', out: 'images/shops/jones-salad-2.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.19/S__57450602_0.jpg', out: 'images/shops/jones-salad-3.webp', width: 800, quality: 76 },
  { src: 'zone/G/G105/S__57483291_0.jpg', out: 'images/shops/yoguruto-1.webp', width: 800, quality: 76 },
  { src: 'zone/G/G105/S__57483292_0.jpg', out: 'images/shops/yoguruto-2.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.4/S__57450570_0.jpg', out: 'images/shops/shaho-roti-1.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.4/S__57450571_0.jpg', out: 'images/shops/shaho-roti-2.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.4/S__57450572_0.jpg', out: 'images/shops/shaho-roti-3.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.1/S__57450588_0.jpg', out: 'images/shops/pratad-lom-noodles-1.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.1/S__57450589_0.jpg', out: 'images/shops/pratad-lom-noodles-2.webp', width: 800, quality: 76 },
  { src: 'zone/ปรับปรุง/ป.1/S__57450590_0.jpg', out: 'images/shops/pratad-lom-noodles-3.webp', width: 800, quality: 76 },
  { src: 'zone/E/E102-1/S__57475162_0.jpg', out: 'images/shops/chamto-1.webp', width: 800, quality: 76 },
  { src: 'zone/E/E102-1/S__57475163_0.jpg', out: 'images/shops/chamto-2.webp', width: 800, quality: 76 },
  { src: 'zone/E/E102-1/S__57475164_0.jpg', out: 'images/shops/chamto-3.webp', width: 800, quality: 76 },
  { src: 'zone/E/E102-1/S__57475165_0.jpg', out: 'images/shops/chamto-4.webp', width: 800, quality: 76 },
  { src: 'zone/E/E103/S__57475156_0.jpg', out: 'images/shops/salada-1.webp', width: 800, quality: 76 },
  { src: 'zone/E/E103/S__57475157_0.jpg', out: 'images/shops/salada-2.webp', width: 800, quality: 76 },
  { src: 'zone/E/E103/S__57475158_0.jpg', out: 'images/shops/salada-3.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.24/S__57458693_0.jpg', out: 'images/shops/ann-guay-tiew-kua-gai-1.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.24/S__57458694_0.jpg', out: 'images/shops/ann-guay-tiew-kua-gai-2.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.24/S__57458695_0.jpg', out: 'images/shops/ann-guay-tiew-kua-gai-3.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.8/S__57458702_0.jpg', out: 'images/shops/radna-9-yod-1.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.8/S__57458703_0.jpg', out: 'images/shops/radna-9-yod-2.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.8/S__57458704_0.jpg', out: 'images/shops/radna-9-yod-3.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.8/S__57458705_0.jpg', out: 'images/shops/radna-9-yod-4.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.6/S__57458714_0.jpg', out: 'images/shops/tua-bang-nara-1.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.6/S__57458715_0.jpg', out: 'images/shops/tua-bang-nara-2.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.118/S__57458747_0.jpg', out: 'images/shops/mae-ranjuan-1.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.118/S__57458748_0.jpg', out: 'images/shops/mae-ranjuan-2.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.118/S__57458749_0.jpg', out: 'images/shops/mae-ranjuan-3.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.21-26/S__57458734_0.jpg', out: 'images/shops/sanaejunn-1.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.21-26/S__57458735_0.jpg', out: 'images/shops/sanaejunn-2.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.21-26/S__57458736_0.jpg', out: 'images/shops/sanaejunn-3.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.101-106/S__57458754_0.jpg', out: 'images/shops/baan-mahabundit-1.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.101-106/S__57458755_0.jpg', out: 'images/shops/baan-mahabundit-2.webp', width: 800, quality: 76 },
  { src: 'zone/ตลาด/ต.101-106/S__57458756_0.jpg', out: 'images/shops/baan-mahabundit-3.webp', width: 800, quality: 76 },
  { src: 'zone/A/A116-121/S__57475077_0.jpg', out: 'images/shops/pryya-1.webp', width: 800, quality: 76 },
  { src: 'zone/A/A116-121/S__57475078_0.jpg', out: 'images/shops/pryya-2.webp', width: 800, quality: 76 },
  { src: 'zone/A/A116-121/S__57475079_0.jpg', out: 'images/shops/pryya-3.webp', width: 800, quality: 76 },
  { src: 'zone/A/A177-178/S__57475085_0.jpg', out: 'images/shops/madame-pearl-1.webp', width: 800, quality: 76 },
  { src: 'zone/A/A177-178/S__57475086_0.jpg', out: 'images/shops/madame-pearl-2.webp', width: 800, quality: 76 },
  { src: 'zone/A/A177-178/S__57475087_0.jpg', out: 'images/shops/madame-pearl-3.webp', width: 800, quality: 76 },
  { src: 'zone/B/B143,166/S__57475101_0.jpg', out: 'images/shops/soulmate-1.webp', width: 800, quality: 76 },
  { src: 'zone/B/B143,166/S__57475102_0.jpg', out: 'images/shops/soulmate-2.webp', width: 800, quality: 76 },
  { src: 'zone/B/B143,166/S__57475103_0.jpg', out: 'images/shops/soulmate-3.webp', width: 800, quality: 76 },
  { src: 'zone/D/D103/S__57475144_0.jpg', out: 'images/shops/chaaum-1.webp', width: 800, quality: 76 },
  { src: 'zone/D/D103/S__57475145_0.jpg', out: 'images/shops/chaaum-2.webp', width: 800, quality: 76 },
  { src: 'zone/D/D103/S__57475146_0.jpg', out: 'images/shops/chaaum-3.webp', width: 800, quality: 76 },
  { src: 'zone/G/G107-108/S__57483296_0.jpg', out: 'images/shops/wolf-1.webp', width: 800, quality: 76 },
  { src: 'zone/G/G107-108/S__57483297_0.jpg', out: 'images/shops/wolf-2.webp', width: 800, quality: 76 },
  { src: 'zone/G/G107-108/S__57483298_0.jpg', out: 'images/shops/wolf-3.webp', width: 800, quality: 76 },
  { src: 'zone/A/A137/S__57475095_0.jpg', out: 'images/shops/sriya-pharmacy-1.webp', width: 800, quality: 76 },
  { src: 'zone/A/A137/S__57475097_0.jpg', out: 'images/shops/sriya-pharmacy-2.webp', width: 800, quality: 76 },
  { src: 'zone/A/A137/S__57475098_0.jpg', out: 'images/shops/sriya-pharmacy-3.webp', width: 800, quality: 76 },
  { src: 'zone/H/H201/S__57483301_0.jpg', out: 'images/shops/mos-dental-clinic-1.webp', width: 800, quality: 76 },
  { src: 'zone/H/H201/S__57483302_0.jpg', out: 'images/shops/mos-dental-clinic-2.webp', width: 800, quality: 76 },
  { src: 'zone/H/H201/S__57483303_0.jpg', out: 'images/shops/mos-dental-clinic-3.webp', width: 800, quality: 76 },
  { src: 'zone/F/F101-104/S__57827338_0.jpg', out: 'images/shops/elite-1.webp', width: 800, quality: 76 },
  { src: 'zone/F/F101-104/S__57827339_0.jpg', out: 'images/shops/elite-2.webp', width: 800, quality: 76 },
  { src: 'zone/F/F101-104/S__57827340_0.jpg', out: 'images/shops/elite-3.webp', width: 800, quality: 76 },
  { src: 'zone/F/F206/S__57827348_0.jpg', out: 'images/shops/bwk-international-1.webp', width: 800, quality: 76 },
  { src: 'zone/F/F206/S__57827349_0.jpg', out: 'images/shops/bwk-international-2.webp', width: 800, quality: 76 },
  { src: 'zone/F/F206/S__57827350.jpg', out: 'images/shops/bwk-international-3.webp', width: 800, quality: 76 },
  { src: 'zone/F/F201-203/S__57827343_0.jpg', out: 'images/shops/de-loop-1.webp', width: 800, quality: 76 },
  { src: 'zone/F/F201-203/S__57827344_0.jpg', out: 'images/shops/de-loop-2.webp', width: 800, quality: 76 },
  { src: 'zone/F/F201-203/S__57827345_0.jpg', out: 'images/shops/de-loop-3.webp', width: 800, quality: 76 },
  { src: 'zone/N/N101/S__57483284_0.jpg', out: 'images/shops/infinity-carwash-1.webp', width: 800, quality: 76 },
  { src: 'zone/N/N101/S__57483285_0.jpg', out: 'images/shops/infinity-carwash-2.webp', width: 800, quality: 76 },
  { src: 'zone/N/N101/messageImage_1795077375355.jpg', out: 'images/shops/infinity-carwash-3.webp', width: 800, quality: 76 },
  { src: 'zone/D/D101-1/S__57475138_0.jpg', out: 'images/shops/namyen-amethyst-1.webp', width: 800, quality: 76 },
  { src: 'zone/D/D101-1/S__57475139_0.jpg', out: 'images/shops/namyen-amethyst-2.webp', width: 800, quality: 76 },
  { src: 'zone/D/D101-1/S__57475140_0.jpg', out: 'images/shops/namyen-amethyst-3.webp', width: 800, quality: 76 },
  { src: 'zone/B/B147,162/S__57475120_0.jpg', out: 'images/shops/chanya-beyond-1.webp', width: 800, quality: 76 },
  { src: 'zone/B/B147,162/S__57475121_0.jpg', out: 'images/shops/chanya-beyond-2.webp', width: 800, quality: 76 },
  { src: 'zone/B/B147,162/S__57475122.jpg', out: 'images/shops/chanya-beyond-3.webp', width: 800, quality: 76 },
  { src: 'zone/B/B206,231/S__57475109_0.jpg', out: 'images/shops/shop-b206-1.webp', width: 800, quality: 76 },
  { src: 'zone/B/B206,231/S__57475110_0.jpg', out: 'images/shops/shop-b206-2.webp', width: 800, quality: 76 },
  { src: 'zone/B/B206,231/S__57475111_0.jpg', out: 'images/shops/shop-b206-3.webp', width: 800, quality: 76 },
  { src: 'zone/C/C113/S__57475131_0.jpg', out: 'images/shops/baroque-natpassorn-1.webp', width: 800, quality: 76 },
  { src: 'zone/C/C113/S__57475132_0.jpg', out: 'images/shops/baroque-natpassorn-2.webp', width: 800, quality: 76 },
  { src: 'zone/C/C127-128/S__25444356.jpg', out: 'images/shops/shop-c127-1.webp', width: 800, quality: 76 },
  { src: 'zone/C/C127-128/S__54313062_0.jpg', out: 'images/shops/shop-c127-2.webp', width: 800, quality: 76 },
  { src: 'zone/C/C127-128/S__54313063_0.jpg', out: 'images/shops/shop-c127-3.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.5/S__57450609_0.jpg', out: 'images/shops/sang-hai-1.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.5/S__57450610_0.jpg', out: 'images/shops/sang-hai-2.webp', width: 800, quality: 76 },
  { src: 'zone/FC/อ.5/S__57450611_0.jpg', out: 'images/shops/sang-hai-3.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.15/S__57458721_0.jpg', out: 'images/shops/aprils-bakery-1.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.15/S__57458722_0.jpg', out: 'images/shops/aprils-bakery-2.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.15/S__57458723_0.jpg', out: 'images/shops/aprils-bakery-3.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.15/S__57458724_0.jpg', out: 'images/shops/aprils-bakery-4.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.7-1/S__57458728_0.jpg', out: 'images/shops/makee-ratchawat-1.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.7-1/S__57458729_0.jpg', out: 'images/shops/makee-ratchawat-2.webp', width: 800, quality: 76 },
  { src: 'zone/ซุ้มทางเดิน/ซ.7-1/S__57458730_0.jpg', out: 'images/shops/makee-ratchawat-3.webp', width: 800, quality: 76 },
]

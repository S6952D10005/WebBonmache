// Fallback content used when the API / MySQL database is not reachable.
// The same structure is returned by GET /api/home (see server/src/routes/home.js).
// Images live in client/public/images – replace the files to change photos.

export const defaultData = {
  settings: {
    site_name: 'Bon Marché',
    tagline: 'Fresh • Healthy • Community',
    hero_title_1: 'สุขภาพดี',
    hero_title_2: 'เริ่มได้ที่นี่',
    hero_subtitle: 'อาหารดี ของใช้ปลอดภัย\nเพื่อสุขภาพที่ยั่งยืน',
    hero_badge: 'Open now',
    hero_video_label: 'ชมวิดีโอแนะนำบอนมาร์เช่',
    hero_video_duration: '(1:00)',
    hero_video_url: '',
    hero_image: '/images/hero-banner.webp',
    visit_image: '/images/visit-banner.webp',
    visit_map_url: 'https://goo.gl/maps/oYkWq3kYKCFHew236',
    leasing_image: '/images/leasing-banner.webp',
    leasing_url: '#contact',
    footer_image: '/images/footer-bg.webp',
    leasing_title: 'พื้นที่ให้เช่า ร้านค้า / ร้านอาหาร / คอมมูนิตี้สเปซ',
    leasing_text: 'พร้อมเปิดโอกาสให้ธุรกิจของคุณเติบโต\nไปกับสังคมที่ยั่งยืน และชุมชนของเรา',
    leasing_button: 'สอบถามข้อมูลเพิ่มเติม',
    // ---- footer / contact (source: bonmarche.co.th/contact) ----
    address_title: 'บอง มาร์เช่ มาร์เก็ตพาร์ค',
    address: '105/1 ถ.เทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
    opening_hours: 'ทุกวัน 05.00 – 22.00 น.',
    phone: '02-953-8980',
    email: 'info@bonmarche.co.th', // placeholder – the official site lists no e-mail
    map_url: 'https://goo.gl/maps/oYkWq3kYKCFHew236',
    footer_description:
      'ตลาดสดพรีเมียมและคอมมูนิตี้ย่านจตุจักร มาตรฐานตลาดระดับเพชร และรางวัล Bangkok Premium Market 2565 อาหารดี ของใช้ปลอดภัย เพื่อสุขภาพที่ยั่งยืน',
    footer_slogan: 'สุขภาพดี เริ่มได้ที่นี่',
    copyright: 'Bon Marché Market Park. สงวนลิขสิทธิ์',
    facebook_url: 'https://www.facebook.com/bonmarche.marketpark',
    instagram_url: 'https://www.instagram.com/bonmarchemarket/',
    youtube_url: '',
    line_url: 'https://line.me/R/ti/p/@mzn5714l',
  },

  // footer link columns (group: quick | service | legal)
  footerLinks: [
    { id: 1, group_key: 'quick', label: 'หน้าแรก', url: '#' },
    { id: 2, group_key: 'quick', label: 'เกี่ยวกับเรา', url: '#about' },
    { id: 3, group_key: 'quick', label: 'ค้นหาร้านค้า', url: '/shops' },
    { id: 4, group_key: 'quick', label: 'โปรโมชั่น', url: '#events' },
    { id: 5, group_key: 'quick', label: 'กิจกรรม', url: '#events' },
    { id: 6, group_key: 'quick', label: 'ข่าวสารและประกาศ', url: '#news' },
    { id: 7, group_key: 'service', label: 'พื้นที่ให้เช่าร้านค้า', url: '#contact' },
    { id: 8, group_key: 'service', label: 'ที่จอดรถกว่า 500 คัน', url: '#visit' },
    { id: 9, group_key: 'service', label: 'รถเข็นผู้สูงอายุ (ฟรี)', url: '#visit' },
    { id: 10, group_key: 'service', label: 'รถเข็นสัตว์เลี้ยง (ฟรี)', url: '#visit' },
    { id: 11, group_key: 'service', label: 'ตลาดมาตรฐานระดับเพชร', url: '#about' },
    { id: 12, group_key: 'service', label: 'ระบบผู้ประกอบการ', url: 'https://invoice.bonmarche.co.th/InvoiceSender/fe/#/' },
    { id: 13, group_key: 'legal', label: 'ข้อกำหนดการใช้งาน', url: '#' },
    { id: 14, group_key: 'legal', label: 'นโยบายความเป็นส่วนตัว', url: '#' },
    { id: 15, group_key: 'legal', label: 'นโยบายคุกกี้', url: '#' },
    { id: 16, group_key: 'legal', label: 'แผนผังเว็บไซต์', url: '#' },
  ],

  // main menu; `children` = dropdown items (same as nav_menus in the database)
  menus: [
    { id: 1, label: 'หน้าแรก', url: '#', has_dropdown: 0 },
    {
      id: 4,
      label: 'ร่วมธุรกิจกับเรา',
      url: '#leasing',
      description: 'เช่าพื้นที่', // heading inside the dropdown
      has_dropdown: 1,
      children: [
        { id: 7, label: 'ร้านค้า', url: '#leasing', icon: 'Store', description: 'เปิดร้านในตลาดและโซนอาหาร' },
        { id: 8, label: 'สำนักงาน', url: '#leasing', icon: 'Building', description: 'ออฟฟิศพร้อมใช้ ใจกลางชุมชน' },
        { id: 9, label: 'บูธชั่วคราว', url: '#leasing', icon: 'Tent', description: 'ออกบูธรายวัน / รายสัปดาห์' },
        { id: 10, label: 'บูธกิจกรรม', url: '#leasing', icon: 'PartyPopper', description: 'อีเวนต์ เปิดตัวสินค้า เวิร์กช็อป' },
        { id: 11, label: 'ห้องประชุม/สัมมนา', url: '#leasing', icon: 'Presentation', description: 'ห้องประชุม อบรม สัมมนา' },
        { id: 12, label: 'สื่อประชาสัมพันธ์', url: '#leasing', icon: 'Megaphone', description: 'ป้ายโฆษณา จอ LED และโซเชียล' },
        { id: 13, label: 'พื้นที่เก็บสินค้า', url: '#leasing', icon: 'Warehouse', description: 'คลังเก็บสินค้าใกล้ร้านคุณ' },
      ],
    },
    { id: 2, label: 'Shop Directory', url: '/shops', has_dropdown: 0 },
    { id: 3, label: 'Blog', url: '#blog', has_dropdown: 0 },
    { id: 5, label: 'About Us', url: '#about', has_dropdown: 0 },
    { id: 6, label: 'Contact', url: '#contact', has_dropdown: 0 },
  ],

  highlights: [
    { id: 1, tag: 'อีเวนต์', title: 'Fresh & Healthy Salad', subtitle: 'เมนูสุขภาพเพื่อคุณ', date_label: '12–14 ก.ย. 68', image_url: '/images/week-1.jpg' },
    { id: 2, tag: 'โปรโมชั่น', title: 'Bon Café', subtitle: 'กาแฟพรีเมียม ลดพิเศษ', date_label: '12–15 ก.ย. 68', image_url: '/images/week-2.jpg' },
    { id: 3, tag: 'อีเวนต์', title: 'Green Corner', subtitle: 'ผักผลไม้ปลอดสารพิษ', date_label: '13–14 ก.ย. 68', image_url: '/images/week-3.jpg' },
    { id: 4, tag: 'โปรโมชั่น', title: 'Taste of Thailand', subtitle: 'อาหารไทยต้นตำรับ', date_label: '14–16 ก.ย. 68', image_url: '/images/week-4.jpg' },
    { id: 5, tag: 'อีเวนต์', title: 'Wellness Shop', subtitle: 'ผลิตภัณฑ์ดูแลสุขภาพ', date_label: '15–17 ก.ย. 68', image_url: '/images/week-5.jpg' },
  ],

  categories: [
    { id: 1, name: 'อาหาร & เครื่องดื่ม', icon: 'utensils', color: 'orange' },
    { id: 2, name: 'ผักผลไม้\nของสด', icon: 'salad', color: 'teal' },
    { id: 3, name: 'แฟชั่น & ไลฟ์สไตล์', icon: 'bag', color: 'teal' },
    { id: 4, name: 'คาเฟ่ & ร้านอาหาร', icon: 'coffee', color: 'teal' },
    { id: 5, name: 'สุขภาพ & ความงาม', icon: 'heart', color: 'pink' },
    { id: 6, name: 'ของใช้ในบ้าน', icon: 'gift', color: 'orange' },
    { id: 7, name: 'ดูดวง & โหราศาสตร์', icon: 'sparkles', color: 'yellow' },
    { id: 8, name: 'แผนที่ & การเดินทาง', icon: 'map', color: 'teal', link: '#visit' },
  ],

  shops: [
    { id: 1, name: 'ข้าวมันไก่ไรรินทร์', category_label: 'ร้านอาหารไทยชื่อดัง', badge: 'ร้านเด็ด', is_new: 1, image_url: '/images/shop-1.jpg' },
    { id: 2, name: 'Maison Pâtisserie', category_label: 'เบเกอรี่ & ขนมหวาน', badge: 'ร้านเปิดใหม่', is_new: 1, image_url: '/images/shop-2.jpg' },
    { id: 3, name: 'Green Day Smoothie', category_label: 'น้ำผลไม้ปั่นเพื่อสุขภาพ', badge: 'ร้านเด็ด', is_new: 0, image_url: '/images/shop-3.jpg' },
    { id: 4, name: 'Urban Style', category_label: 'แฟชั่น & ระดับไลฟ์สไตล์', badge: 'ร้านเปิดใหม่', is_new: 0, image_url: '/images/shop-4.jpg' },
    { id: 5, name: 'Seafood Corner', category_label: 'อาหารทะเลสดใหม่', badge: 'ร้านเด็ด', is_new: 0, image_url: '/images/shop-5.jpg' },
  ],

  visitInfo: [
    { id: 1, icon: 'clock', title: 'เวลาเปิด-ปิด', detail: 'ทุกวัน 08.00 – 22.00 น.' },
    { id: 2, icon: 'car', title: 'ที่จอดรถ', detail: 'มากกว่า 500 คัน' },
    { id: 3, icon: 'wheelchair', title: 'รถเข็นผู้สูงอายุ', detail: 'บริการฟรีที่จุดประชาสัมพันธ์' },
  ],
}

/*
 * ===========================================================================
 *  หน้าแรก (/home) – ข้อมูลตัวอย่าง
 * ===========================================================================
 *  ทุกส่วนของหน้าแรกอ่านข้อมูลจากไฟล์นี้ แก้ข้อความ / รูป / ลิงก์ได้ที่นี่เลย
 *  (ภายหลังย้ายไปเก็บในฐานข้อมูลได้ โดยใช้ชื่อช่องข้อมูลเดียวกัน)
 *
 *  รูป: ใส่ path จาก client/public เช่น '/images/week-1.jpg'
 *  ลิงก์: '/shops' = หน้าในเว็บ, '#events' = ส่วนในหน้านี้, 'https://…' = เว็บอื่น
 * ===========================================================================
 */

export const HOME = {
  /* ---------- Headline tab: การ์ดขาวบนขอบรูปพื้นหลัง กดหัวข้อเพื่อเปิดดู (icon: Utensils | ShoppingBag | Store) ---------- */
  headline: {
    tabs: [
      {
        id: 'food',
        icon: 'Utensils',
        color: '#f37021', // topic colour (hover, icon, underline)
        label: 'ร้านอาหารแนะนำ',
        hint: 'ร้านเด็ดประจำสัปดาห์', // short line under the label
        intro: 'คัดร้านเด็ดประจำสัปดาห์ ทั้งของคาว ของหวาน และเครื่องดื่ม',
        links: [
          { label: 'อาหารและเครื่องดื่ม', url: '/shops?cat=1' },
          { label: 'คาเฟ่และร้านขนม', url: '/shops?cat=4' },
          { label: 'ผักผลไม้ ของสด', url: '/shops?cat=2' },
        ],
        cards: [
          { title: 'แนะนำร้านอาหาร', image: '/images/shop-1.jpg', url: '/shops?cat=1' },
          { title: 'คาเฟ่ห้ามพลาด', image: '/images/week-2.jpg', url: '/shops?cat=4' },
        ],
      },
      {
        id: 'shopping',
        icon: 'ShoppingBag',
        color: '#ec1c8c',
        label: 'ช้อปปิ้ง',
        hint: 'แฟชั่น · ของใช้ · สุขภาพ',
        intro: 'แฟชั่น ของใช้ และสินค้าสุขภาพ ครบในที่เดียว',
        links: [
          { label: 'แฟชั่นและไลฟ์สไตล์', url: '/shops?cat=3' },
          { label: 'สุขภาพและความงาม', url: '/shops?cat=6' },
          { label: 'ของใช้ในบ้าน', url: '/shops?cat=7' },
        ],
        cards: [
          { title: 'แนะนำร้านเสื้อผ้า', image: '/images/week-5.jpg', url: '/shops?cat=3' },
          { title: 'สินค้าสุขภาพ', image: '/images/week-3.jpg', url: '/shops?cat=6' },
        ],
      },
      {
        id: 'services',
        icon: 'Store',
        color: '#00a3e0',
        label: 'ร้านค้าและบริการ',
        hint: 'แผนผัง · ที่จอดรถ · เช่าพื้นที่',
        intro: 'บริการที่จอดรถ จุดรับส่ง และสิ่งอำนวยความสะดวกในตลาด',
        links: [
          { label: 'แผนผังและร้านค้าทั้งหมด', url: '/shops' },
          { label: 'การเดินทาง', url: '/#visit' },
          { label: 'เช่าพื้นที่', url: '/#leasing' },
        ],
        cards: [
          { title: 'แผนผังตลาด', image: '/images/visit-banner.webp', url: '/shops' },
          { title: 'เช่าพื้นที่ขายของ', image: '/images/leasing-banner.webp', url: '/#leasing' },
        ],
      },
    ],
  },

  /* ---------- Hero slider ----------
   * layout 'split'  = ข้อความซ้าย + รูปขวา
   * layout 'banner' = รูปเต็มกว้าง (แบนเนอร์โฆษณา / Option) – ใส่ title ได้หรือเว้นว่าง */
  slides: [
    {
      id: 1,
      layout: 'split',
      eyebrow: 'Bon Marché Market',
      title: 'ตลาดสด สะอาด ปลอดภัย ใจกลางชุมชน',
      text: 'ของสดคัดคุณภาพทุกเช้า ร้านอาหารกว่า 100 ร้าน และกิจกรรมสำหรับทุกคนในครอบครัว เปิดทุกวัน 08:00 – 17:00 น.',
      cta: 'ดูรายละเอียด',
      url: '/shops',
      image: '/images/hero-banner.webp',
    },
    {
      id: 2,
      layout: 'banner',
      title: 'Taste of Thailand',
      text: 'เทศกาลอาหารไทยทั่วไทย ทุกเสาร์–อาทิตย์ ตลอดเดือนนี้',
      cta: 'ดูกิจกรรม',
      url: '#events',
      image: '/images/week-4.jpg',
    },
    {
      id: 3,
      layout: 'split',
      eyebrow: 'Fresh Market',
      title: 'ของสดจากเกษตรกร ส่งตรงทุกเช้า',
      text: 'ผัก ผลไม้ เนื้อสัตว์ และอาหารทะเล คัดสดใหม่ทุกวัน ราคายุติธรรม',
      cta: 'ดูร้านของสด',
      url: '/shops?cat=2',
      image: '/images/week-1.jpg',
    },
  ],

  /* ---------- Quick links (icon = ชื่อไอคอนจาก lucide) ---------- */
  quickLinks: [
    // color = the card's own colour on hover; hint = small line under the label
    { label: 'ค้นหาร้านค้า', hint: 'ร้านค้ากว่า 100 ร้าน', icon: 'Store', color: '#ec1c8c', url: '/shops' },
    { label: 'กิจกรรม', hint: 'อัปเดตทุกสัปดาห์', icon: 'CalendarDays', color: '#f37021', url: '#events' },
    { label: 'การเดินทาง', hint: 'แผนที่ · ที่จอดรถ', icon: 'MapPin', color: '#00a3e0', url: '/#visit' },
    { label: 'เช่าพื้นที่', hint: 'เปิดร้านกับเรา', icon: 'Building', color: '#1f9285', url: '/#leasing' },
  ],

  /* ---------- Happening (ไฮไลต์) ---------- */
  happening: [
    { id: 1, tag: 'ไฮไลต์', title: 'Bon Marché Fresh Morning', date: '1 – 30 พ.ย. 2569', image: '/images/happening-1.jpg', url: '#' },
    { id: 2, tag: 'เทศกาล', title: 'Taste of Thailand เทศกาลอาหารไทย', date: '15 – 30 พ.ย. 2569', image: '/images/happening-2.jpg', url: '#' },
    { id: 3, tag: 'คาเฟ่', title: 'Bon Cafe เมนูใหม่ต้อนรับหน้าหนาว', date: 'ตลอดเดือนพฤศจิกายน', image: '/images/happening-3.jpg', url: '#' },
    { id: 4, tag: 'สุขภาพ', title: 'Green Corner ตลาดผักอินทรีย์', date: 'ทุกวันเสาร์', image: '/images/happening-4.jpg', url: '#' },
    { id: 5, tag: 'ช้อปปิ้ง', title: 'Wellness Shop ลดสูงสุด 30%', date: '20 – 26 พ.ย. 2569', image: '/images/week-5.jpg', url: '#' },
  ],

  /* ---------- Food article (บทความอาหาร) ---------- */
  foodArticles: [
    { id: 1, title: '10 ร้านเด็ดในตลาดที่ต้องลองสักครั้ง', date: '12 พ.ย. 2569', read: '5 นาที', image: '/images/shop-1.jpg', url: '#' },
    { id: 2, title: 'เมนูสมูทตี้ผักผลไม้ ดื่มง่าย ดีต่อสุขภาพ', date: '8 พ.ย. 2569', read: '3 นาที', image: '/images/shop-3.jpg', url: '#' },
    { id: 3, title: 'เบเกอรี่โฮมเมดจากร้าน Maison ที่ต่อคิวทุกเช้า', date: '2 พ.ย. 2569', read: '4 นาที', image: '/images/shop-2.jpg', url: '#' },
    { id: 4, title: 'อาหารทะเลสดจากแม่กลอง ส่งตรงถึงตลาดทุกเช้า', date: '28 ต.ค. 2569', read: '4 นาที', image: '/images/shop-5.jpg', url: '#' },
  ],

  /* ---------- Food brand ร้านดัง (ใส่ logo เป็นรูปได้ ถ้าไม่มีจะแสดงชื่อร้านบนพื้นสี) ---------- */
  foodBrands: [
    { id: 1, name: 'ข้าวมันไก่ป้าศรี', color: '#d63a2f', url: '/shops' },
    { id: 2, name: 'Maison', color: '#2b2b2b', url: '/shops' },
    { id: 3, name: 'Green Day', color: '#5c9e3a', url: '/shops' },
    { id: 4, name: 'Bon Cafe', color: '#7a4a2a', url: '/shops' },
    { id: 5, name: 'ก๋วยเตี๋ยวเรือ', color: '#c8641e', url: '/shops' },
    { id: 6, name: 'Taste of Thailand', color: '#0f6f66', url: '/shops' },
    { id: 7, name: 'ชาไทยแท้', color: '#e2862b', url: '/shops' },
  ],

  /* ---------- All events ---------- */
  events: [
    { id: 1, title: 'Bon Marché Night Market', date: '22 – 23 พ.ย. 2569', place: 'ลานกิจกรรม อาคาร A', image: '/images/event-1.jpg', url: '#' },
    { id: 2, title: 'เวิร์กช็อปทำขนมไทยกับครอบครัว', date: '29 พ.ย. 2569', place: 'ห้องสัมมนา อาคาร E', image: '/images/event-2.jpg', url: '#' },
    { id: 3, title: 'ตลาดนัดสินค้าเกษตรอินทรีย์', date: '1 – 7 ธ.ค. 2569', place: 'ลานริมสระน้ำ', image: '/images/event-3.jpg', url: '#' },
    { id: 4, title: 'ตลาดนัดแฟชั่นมือสองและงานคราฟต์', date: '13 – 14 ธ.ค. 2569', place: 'ลานหน้าอาคาร B&C', image: '/images/event-4.jpg', url: '#' },
  ],

  /* ---------- News ---------- */
  news: [
    { id: 1, title: 'บองมาร์เช่ รับรางวัลตลาดสดน่าซื้อ ระดับดีเด่น', date: '10 พ.ย. 2569', image: '/images/visit-banner.webp', url: '#' },
    { id: 2, title: 'รถไฟฟ้าสายสีแดง เดินทางสะดวก ถึงบองมาร์เช่', date: '3 พ.ย. 2569', image: '/images/hero-banner.webp', url: '#' },
    { id: 3, title: 'มาตรการความสะอาดและความปลอดภัยภายในตลาด', date: '28 ต.ค. 2569', image: '/images/leasing-banner.webp', url: '#' },
  ],

  /* ---------- Awards (icon: Award | Trophy | ShieldCheck | Medal) ---------- */
  awards: [
    { id: 1, icon: 'Award', name: 'ตลาดสดน่าซื้อ ระดับดีเด่น', by: 'กรมอนามัย', year: '2568' },
    { id: 2, icon: 'Trophy', name: 'ตลาดต้นแบบด้านสิ่งแวดล้อม', by: 'กรุงเทพมหานคร', year: '2567' },
    { id: 3, icon: 'ShieldCheck', name: 'มาตรฐานความปลอดภัยอาหาร', by: 'สำนักงานคณะกรรมการอาหารและยา', year: '2567' },
  ],

  /* ---------- Map / Getting here ----------
   * ที่อยู่ เบอร์โทร และเวลาเปิด ดึงจากข้อมูลเว็บ (settings) – แก้ที่เดียวกับ footer
   * mapQuery = ชื่อที่ใช้ค้นหาใน Google Maps */
  gettingHere: {
    title: 'การเดินทาง',
    text: 'ตลาดสดพรีเมียมและคอมมูนิตี้ย่านจตุจักร เดินทางสะดวก มีที่จอดรถกว่า 500 คัน',
    mapQuery: 'Bon Marche Market Park Chatuchak Bangkok',
    discoverUrl: '/shops',
  },

  /* ---------- Follow us (platform: facebook | youtube | instagram | tiktok) ---------- */
  social: {
    links: [
      { platform: 'facebook', url: 'https://www.facebook.com/' },
      { platform: 'youtube', url: 'https://www.youtube.com/' },
      { platform: 'instagram', url: 'https://www.instagram.com/' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/' },
    ],
    /*
     * โพสต์ตัวอย่าง (ใส่เองจนกว่าจะต่อกับเพจจริง)
     *   title = หัวข้อโพสต์ (ตัวหนา) · text = เนื้อความย่อ · date = วันเวลาที่โพสต์
     *   likes / comments / views = ตัวเลขใต้โพสต์ (ใส่เท่าที่มี)
     */
    posts: [
      { id: 1, platform: 'facebook', title: 'เช้านี้ของสดมาเต็มตลาด 🥬', text: 'ผักสด ผลไม้ อาหารทะเล ส่งตรงจากเกษตรกร แวะมาเลือกกันได้ตั้งแต่ 8 โมง จอดรถฟรี 2 ชม.', date: '3 พ.ย. 2569 · 10:00', likes: 1240, comments: 86, image: '/images/week-1.jpg', url: 'https://www.facebook.com/' },
      { id: 2, platform: 'youtube', title: 'พาเดินตลาด Bon Marché ใน 5 นาที', text: 'รวมร้านเด็ด มุมถ่ายรูป และของกินห้ามพลาด ดูจบรู้เลยว่าต้องไปโซนไหนก่อน', date: '2 พ.ย. 2569 · 20:00', views: 18400, likes: 932, image: '/images/hero-banner.webp', url: 'https://www.youtube.com/' },
      { id: 3, platform: 'instagram', title: 'มุมถ่ายรูปใหม่ริมสระน้ำ 📸', text: 'แสงสวยช่วงเย็น 4–6 โมง แท็ก #BonMarche มาให้เราดูด้วยนะ', date: '31 ต.ค. 2569 · 13:00', likes: 3105, comments: 142, image: '/images/visit-banner.webp', url: 'https://www.instagram.com/' },
      { id: 4, platform: 'facebook', title: 'Taste of Thailand เริ่มเสาร์นี้!', text: 'เทศกาลอาหารไทยจากทั่วประเทศ กว่า 40 ร้าน 15–30 พ.ย. ลานกิจกรรม อาคาร A', date: '30 ต.ค. 2569 · 09:00', likes: 2018, comments: 210, image: '/images/week-4.jpg', url: 'https://www.facebook.com/' },
      { id: 5, platform: 'tiktok', title: 'สมูทตี้แก้วละ 39 บาท 🍹', text: 'ลองเมนูใหม่ Green Day ผักผลไม้ปั่นสด ไม่ใส่น้ำตาล อร่อยจนต้องกดซ้ำ', date: '29 ต.ค. 2569 · 18:30', views: 56200, likes: 4870, image: '/images/shop-3.jpg', url: 'https://www.tiktok.com/' },
      { id: 6, platform: 'youtube', title: 'สูตรข้าวมันไก่ต้นตำรับ', text: 'เปิดครัวร้านข้าวมันไก่ในตลาด ต้มไก่ หุงข้าว และน้ำจิ้มเต้าเจี้ยวสูตรเด็ด', date: '27 ต.ค. 2569 · 19:00', views: 9800, likes: 611, image: '/images/shop-1.jpg', url: 'https://www.youtube.com/' },
    ],
  },
}

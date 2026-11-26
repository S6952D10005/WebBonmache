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
  /* ---------- Headline tab: การ์ดขาวบนขอบรูปพื้นหลัง กดหัวข้อเพื่อเปิดดู (icon: Utensils | ShoppingBag | Store) ----------
   * ข้อมูลจริงจากในเว็บ: หมวด (cat) และโซน (zone) ตรงกับหน้า Shop Directory · ร้านจริงจาก src/data/directoryData.js
   *   links = ลิงก์ซ้าย · cards = การ์ดรูป 2 ใบ (ร้านจริง: url '/shops?shop=<id ร้าน>' = เปิดป๊อปอัปร้านนั้นในหน้า Shop Directory)
   *   cat: 1 อาหาร & เครื่องดื่ม · 2 ผักผลไม้ ของสด · 3 แฟชั่น & ไลฟ์สไตล์ · 4 คาเฟ่ & ร้านอาหาร · 5 สุขภาพ & ความงาม
   *        6 ของใช้ในบ้าน · 7 ดูดวง & โหราศาสตร์ · 9 บริการ & การศึกษา · zone FC = ศูนย์อาหาร (ฟู้ดคอร์ท) */
  headline: {
    tabs: [
      {
        id: 'food',
        icon: 'Utensils',
        color: '#f37021', // topic colour (hover, icon, underline)
        label: 'ร้านอาหารแนะนำ',
        hint: 'ฟู้ดคอร์ท · คาเฟ่ · ของฝาก', // short line under the label
        intro: 'ฟู้ดคอร์ทในสวนริมบึง ร้านดังอย่าง Starbucks และ Dairy Queen คาเฟ่ เบเกอรี่ และขนมของฝากเจ้าเก่าของตลาด',
        links: [
          { label: 'อาหาร & เครื่องดื่ม', url: '/shops?cat=1' },
          { label: 'คาเฟ่ & ร้านอาหาร', url: '/shops?cat=4' },
          { label: 'ร้านในฟู้ดคอร์ท', url: '/shops?zone=FC' },
          { label: 'ผักผลไม้ ของสด', url: '/shops?cat=2' },
        ],
        cards: [
          { title: 'ข้าวมันไก่ซั่งไห่', image: '/images/shops/sang-hai-3.webp', url: '/shops?shop=34' },
          { title: 'Wolf Croissant', image: '/images/shops/wolf-2.webp', url: '/shops?shop=21' },
        ],
      },
      {
        id: 'shopping',
        icon: 'ShoppingBag',
        color: '#ec1c8c',
        label: 'ช้อปปิ้ง',
        hint: 'แฟชั่น · ของใช้ · สุขภาพ',
        intro: 'เสื้อผ้า กระเป๋า เครื่องประดับ ผ้าไหมไทย ของใช้ในบ้าน และร้านสุขภาพ ในพลาซ่าทั้ง 6 อาคาร',
        links: [
          { label: 'แฟชั่น & ไลฟ์สไตล์', url: '/shops?cat=3' },
          { label: 'สุขภาพ & ความงาม', url: '/shops?cat=5' },
          { label: 'ของใช้ในบ้าน', url: '/shops?cat=6' },
          { label: 'ดูดวง & โหราศาสตร์', url: '/shops?cat=7' },
        ],
        cards: [
          { title: 'Madame Pearl', image: '/images/shops/madame-pearl-2.webp', url: '/shops?shop=18' },
          { title: 'Soulmate', image: '/images/shops/soulmate-1.webp', url: '/shops?shop=19' },
        ],
      },
      {
        id: 'services',
        icon: 'Store',
        color: '#00a3e0',
        label: 'ร้านค้าและบริการ',
        hint: 'แผนผัง · ที่จอดรถ · เช่าพื้นที่',
        intro: 'แผนผังตลาด 3 มิติ ที่จอดรถกว่า 500 คัน รถเข็นผู้สูงอายุและรถเข็นสัตว์เลี้ยงฟรี พร้อมพื้นที่ให้เช่าสำหรับร้านค้า',
        links: [
          { label: 'แผนผังและร้านค้าทั้งหมด', url: '/shops' },
          { label: 'บริการ & การศึกษา', url: '/shops?cat=9' },
          { label: 'การเดินทาง · ที่จอดรถ', url: '/#visit' },
          { label: 'ติดต่อเรา', url: '/contact' },
        ],
        cards: [
          { title: 'แผนผังตลาด 3 มิติ', image: '/images/about/aerial.webp', url: '/shops' },
          { title: 'เช่าพื้นที่ขายของ', image: '/images/about/zone-plaza.webp', url: '/#leasing' },
        ],
      },
    ],
  },

  /* ---------- Hero slider ----------
   * layout 'split'  = ข้อความซ้าย + รูปขวา (ใช้แบบนี้ทุกสไลด์)
   * layout 'banner' = รูปเต็มกว้าง (แบนเนอร์โฆษณา / Option) – ใส่ title ได้หรือเว้นว่าง
   * ข้อมูลจริงจาก bonmarche.co.th (หน้าแรก · เกี่ยวกับเรา · ติดต่อเรา) · รูปตลาดจริงจากหน้าเกี่ยวกับเรา */
  slides: [
    {
      id: 1,
      layout: 'split',
      eyebrow: 'Bon Marché Market Park',
      title: 'สบาย สบาย สไตล์บองมาร์เช่',
      text: 'ตลาดและคอมมูนิตี้ย่านจตุจักร สินค้าคุณภาพดี มีมาตรฐาน บริการเหนือความคาดหมาย เปิดทุกวัน 05.00 – 22.00 น.',
      cta: 'ค้นหาร้านค้า',
      url: '/shops',
      image: '/images/slides/lakeside-night.jpg',
    },
    {
      id: 2,
      layout: 'split',
      eyebrow: 'Diamond-standard market',
      title: 'ตลาดมาตรฐานระดับเพชร จากกรุงเทพมหานคร',
      text: 'ตลาดสด ของชำ ผักผลไม้ สะอาด ถูกสุขอนามัย และคุ้มครองผู้บริโภค พร้อมรางวัล Bangkok Premium Market ปี 2565',
      cta: 'อ่านข่าว',
      url: '/news?tag=มาตรฐานตลาด',
      image: '/images/slides/fresh-market.jpg',
    },
    {
      id: 3,
      layout: 'split',
      eyebrow: 'Family friendly',
      title: 'มากันได้ทั้งครอบครัว รวมถึงน้องหมา',
      text: 'บริการรถเข็นผู้สูงอายุและรถเข็นสุนัขฟรี ที่จอดรถกว่า 500 คัน ใกล้รถไฟฟ้าสายสีแดง สถานีวัดเสมียนนารี',
      cta: 'การเดินทาง',
      url: '/home#getting-here',
      image: '/images/slides/lakeside-dusk.jpg',
    },
    {
      id: 4,
      layout: 'split',
      eyebrow: 'Since 1999',
      title: 'ตลาดเพื่อชุมชน ตั้งแต่ปี 2542',
      text: 'จากตลาดสดในวันแรก สู่ตลาดของชำ ผักผลไม้ ศูนย์อาหาร ภัตตาคาร พลาซ่าแฟชั่น จิวเวลรี่ และโหราศาสตร์ ครบในที่เดียว',
      cta: 'ดูร้านทั้งหมด',
      url: '/shops',
      image: '/images/slides/plaza.jpg',
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
  // place = where it happens (shown under the date)
  happening: [
    { id: 1, tag: 'ไฮไลต์', color: '#1f9285', title: 'Bon Marché Fresh Morning', date: '1 – 30 พ.ย. 2569', place: 'โซนตลาดสด อาคารตลาด', image: '/images/happening-1.jpg', url: '#' },
    { id: 2, tag: 'เทศกาล', color: '#f37021', title: 'Taste of Thailand เทศกาลอาหารไทย', date: '15 – 30 พ.ย. 2569', place: 'ลานกิจกรรม พลาซ่า B&C', image: '/images/happening-2.jpg', url: '#' },
    { id: 3, tag: 'คาเฟ่', color: '#a0612f', title: 'Bon Cafe เมนูใหม่ต้อนรับหน้าหนาว', date: 'ตลอดเดือนพฤศจิกายน', place: 'Bon Cafe อาคาร B&C ชั้น 1', image: '/images/happening-3.jpg', url: '#' },
    { id: 4, tag: 'สุขภาพ', color: '#16a34a', title: 'Green Corner ตลาดผักอินทรีย์', date: 'ทุกวันเสาร์', place: 'ลานริมสระน้ำ หน้าอาคาร E', image: '/images/happening-4.jpg', url: '#' },
    { id: 5, tag: 'ช้อปปิ้ง', color: '#ec1c8c', title: 'Wellness Shop ลดสูงสุด 30%', date: '20 – 26 พ.ย. 2569', place: 'อาคาร F ชั้น 1', image: '/images/week-5.jpg', url: '#' },
  ],

  /* ---------- Food article (บทความอาหาร) ---------- */
  // ร้านจริงจาก bonmarche.co.th/explore – เรื่องแรก = เรื่องเด่นรูปใหญ่, อีก 4 เรื่องเรียงด้านข้าง · คลิกการ์ด = ป๊อปอัปโปรโมทร้าน
  //   tag = หมวด · shop / logo = ร้าน · place = บูธ (บนการ์ด)
  //   ป๊อปอัป: zone = โซน · hours = เวลาเปิด-ปิด · phone = โทร · menu = เมนูแนะนำ · detail = รายละเอียดร้าน (\n = ขึ้นบรรทัดใหม่)
  //   url = หน้าร้านเดิมใน bonmarche.co.th (เก็บไว้อ้างอิง – ไม่ได้แสดงบนเว็บ)
  foodArticles: [
    {
      id: 1,
      tag: 'อาหารใต้',
      title: 'โอ้ว เหล่ง อยู้ ข้าวพระรามลงสรงต้นตำรับสุราษฎร์ฯ สูตร 51 ปี',
      excerpt: 'น้ำกะทิเคี่ยวหอมกลิ่นเครื่องยาจีน น้ำพริกเผาทำเองเคี่ยวนาน 7 ชั่วโมง พร้อมเมนูเด็ดก๋วยเตี๋ยวหมูตุ๋น / เนื้อตุ๋น',
      shop: 'โอ้ว เหล่ง อยู้',
      place: 'บูธ อ.2',
      zone: 'ฟู้ดคอร์ท',
      hours: 'อังคาร – อาทิตย์ 08.00 – 16.00 น. (ปิดวันจันทร์)',
      phone: '081-834-9117',
      menu: ['ข้าวพระรามลงสรง', 'ก๋วยเตี๋ยวเนื้อตุ๋น', 'ก๋วยเตี๋ยวหมูตุ๋น'],
      detail: 'ร้านอาหารต้นตำรับเลื่องชื่อจากสุราษฎร์ธานี “ข้าวพระรามลงสรง” สูตร 51 ปี! “น้ำกะทิ” เคี่ยวอย่างพิถีพิถันหอมกลิ่นเครื่องยาจีน และทำ “น้ำพริกเผา” เอง ใช้เวลาเคี่ยวถึง 7 ชั่วโมง\nอีกเมนูเด็ดที่ห้ามพลาดคือ “ก๋วยเตี๋ยวหมูตุ๋น / เนื้อตุ๋น”',
      date: '20 พ.ย. 2569',
      image: '/images/stories/oaw-leng-yoo.jpg',
      url: 'https://bonmarche.co.th/store/food-court/%e0%b9%82%e0%b8%ad%e0%b9%89%e0%b8%a7-%e0%b9%80%e0%b8%ab%e0%b8%a5%e0%b9%88%e0%b8%87-%e0%b8%ad%e0%b8%a2%e0%b8%b9%e0%b9%89/',
    },
    {
      id: 2,
      tag: 'บะหมี่',
      title: 'บะหมี่เป็ดอากงหงี เป็ดตุ๋นเคี่ยวกว่า 5 ชั่วโมง เนื้อนุ่มละลาย',
      shop: 'บะหมี่เป็ดอากงหงี',
      logo: '/images/stories/akong-ngee-logo.webp',
      place: 'บูธ ป.5',
      zone: 'โซนปรับปรุง',
      hours: 'ทุกวัน 09.00 – 18.00 น.',
      phone: '086-888-3511, 094-887-9395',
      menu: ['บะหมี่เส้นไข่เป็ดตุ๋น'],
      detail: 'บะหมี่เส้นไข่เป็ดตุ๋นสูตรลับของอากงหงี เนื้อเป็ดจากเป็ดตัวโตเต็มวัยและสมบูรณ์ เนื้อแน่น นำมาเคี่ยวกว่า 5 ชั่วโมง จนเนื้อนุ่ม ละลาย และน้ำเข้าเนื้อ\nน้ำซุปตุ๋นยาจีนเข้มข้น หอมกรุ่นสมุนไพร รสชาตินุ่มละมุนกลมกล่อม เส้นบะหมี่ไข่ทำเอง มีให้เลือกถึง 3 ขนาด น้ำจิ้มรสนัว ใช้มะนาวแท้ รสไม่เปรี้ยวแหลม',
      date: '18 พ.ย. 2569',
      image: '/images/stories/akong-ngee.jpg',
      url: 'https://bonmarche.co.th/store/improvement-zone/%e0%b8%9a%e0%b8%b0%e0%b8%ab%e0%b8%a1%e0%b8%b5%e0%b9%88%e0%b9%80%e0%b8%9b%e0%b9%87%e0%b8%94%e0%b8%ad%e0%b8%b2%e0%b8%81%e0%b8%87%e0%b8%ab%e0%b8%87%e0%b8%b5/',
    },
    {
      id: 3,
      tag: 'ก๋วยจั๊บ',
      title: 'คุณต๋อย ก๋วยจั๊บน้ำข้น ครบเครื่องในหมูและหมูกรอบแสนอร่อย',
      shop: 'คุณต๋อย ก๋วยจั๊บน้ำข้น (Kuntoy)',
      place: 'บูธ อ.21',
      zone: 'ฟู้ดคอร์ท',
      hours: 'ทุกวัน 09.00 – 16.00 น.',
      phone: '081-840-5162',
      menu: ['ก๋วยจั๊บน้ำข้น', 'ตือฮวนจุกบี้', 'ตือฮวนเกี่ยมฉ่าย'],
      detail: 'ก๋วยจั๊บน้ำข้น ครบเครื่องเครื่องในหมูและหมูกรอบแสนอร่อย\nสั่งเดลิเวอรี่ได้ผ่าน Grabfood, LINE MAN, Robinhood และ Wongnai',
      date: '15 พ.ย. 2569',
      image: '/images/stories/kuntoy.jpg',
      url: 'https://bonmarche.co.th/store/food-court/%e0%b8%84%e0%b8%b8%e0%b8%93%e0%b8%95%e0%b9%8b%e0%b8%ad%e0%b8%a2-%e0%b8%81%e0%b9%8b%e0%b8%a7%e0%b8%a2%e0%b8%88%e0%b8%b1%e0%b9%8a%e0%b8%9a%e0%b8%99%e0%b9%89%e0%b8%b3%e0%b8%82%e0%b9%89%e0%b8%99-kuntoy/',
    },
    {
      id: 4,
      tag: 'เบเกอรี่ & เครื่องดื่ม',
      title: 'NEIGHBOURHOOD เบเกอรี่และเครื่องดื่ม หวานน้อย วัตถุดิบคุณภาพ',
      shop: 'NEIGHBOURHOOD',
      place: 'บูธ ซ.19',
      zone: 'ซุ้มทางเดิน',
      phone: '081-442-4388',
      menu: ['เบเกอรี่ขนมอบ', 'เค้กหน้านิ่ม', 'เครื่องดื่ม'],
      detail: 'ร้านเครื่องดื่มและเบเกอรี่ในฝันที่ผลิตทุกเมนูด้วยแนวคิดว่า “วัตถุดิบต้องมีคุณภาพ ใช้น้ำตาลให้น้อยที่สุด ทำทุกเมนูให้เหมือนที่เรารับประทานเอง”',
      date: '12 พ.ย. 2569',
      image: '/images/stories/neighbourhood.jpg',
      url: 'https://bonmarche.co.th/store/archway/neghbourhood/',
    },
    {
      id: 5,
      tag: 'ของฝาก',
      title: 'เสน่ห์จันทร์ ร้านของฝากยอดนิยม ข้าวตังหน้าหมูหยอง ข้าวตังเนยสด',
      shop: 'เสน่ห์จันทร์',
      logo: '/images/brands/sanaejunn.webp',
      place: 'บูธ ต.21, 23–26',
      zone: 'ตลาด',
      hours: 'ทุกวัน 07.00 – 16.00 น.',
      phone: '081-482-7072, 02-953-8698',
      menu: ['อาหารไทย 4 ภาค', 'ข้าวตังหน้าหมูหยอง', 'ข้าวตังเนยสด', 'ขนมอบ'],
      detail: 'ขายอาหารไทย 4 ภาค และขนมอบ อย่างข้าวตังหน้าหมูหยอง และข้าวตังเนยสด\nร้านของฝากที่ได้รับความนิยมสูงของตลาดบองมาร์เช่',
      date: '8 พ.ย. 2569',
      image: '/images/stories/sanaejunn.jpg',
      url: 'https://bonmarche.co.th/store/market/%e0%b9%80%e0%b8%aa%e0%b8%99%e0%b9%88%e0%b8%ab%e0%b9%8c%e0%b8%88%e0%b8%b1%e0%b8%99%e0%b8%97%e0%b8%a3%e0%b9%8c/',
    },
  ],

  /* ---------- Food brand ร้านดัง (ใส่ logo เป็นรูปได้ ถ้าไม่มีจะแสดงชื่อร้านบนพื้นสี) ---------- */
  // logo = โลโก้ร้านจาก client/asset/zone/<โซน>/<บูธ>/LOGO.jpg (ผูกไว้ใน assets.config.js)
  foodBrands: [
    { id: 1, name: 'Starbucks', logo: '/images/brands/starbucks.webp', url: '/shops' },
    { id: 2, name: 'Dairy Queen', logo: '/images/brands/dairy-queen.webp', url: '/shops' },
    { id: 3, name: 'Tops', logo: '/images/brands/tops.webp', url: '/shops' },
    { id: 4, name: "Chester's", logo: '/images/brands/chesters.webp', url: '/shops' },
    { id: 5, name: "Jones' Salad", logo: '/images/brands/jones-salad.webp', url: '/shops' },
    { id: 6, name: 'Yoguruto', logo: '/images/brands/yoguruto.webp', url: '/shops' },
    { id: 7, name: 'Shaho Roti', logo: '/images/brands/shaho-roti.webp', url: '/shops' },
    { id: 8, name: 'ป. เส้นคลุกประทัดลม', logo: '/images/brands/pratad-lom-noodles.webp', url: '/shops' },
    { id: 9, name: 'ก๋วยเตี๋ยวเรือชามโต', logo: '/images/brands/chamto.webp', url: '/shops' },
    { id: 10, name: 'Salada', logo: '/images/brands/salada.webp', url: '/shops' },
    { id: 11, name: 'แอน ก๋วยเตี๋ยวคั่วไก่', logo: '/images/brands/ann-guay-tiew-kua-gai.webp', url: '/shops' },
    { id: 12, name: 'ราดหน้า ๙ ยอด (นายลภ)', logo: '/images/brands/radna-9-yod.webp', url: '/shops' },
    { id: 13, name: 'ถั่วบางนรา', logo: '/images/brands/tua-bang-nara.webp', url: '/shops' },
    { id: 14, name: 'แม่รัญจวน', logo: '/images/brands/mae-ranjuan.webp', url: '/shops' },
    { id: 15, name: 'เสน่ห์จันทร์', logo: '/images/brands/sanaejunn.webp', url: '/shops' },
    { id: 16, name: 'บ้านมหาบัณฑิต', logo: '/images/brands/baan-mahabundit.webp', url: '/shops' },
    { id: 17, name: 'PRYYA', logo: '/images/brands/pryya.webp', url: '/shops' },
    { id: 18, name: 'Madame Pearl', logo: '/images/brands/madame-pearl.webp', url: '/shops' },
    { id: 19, name: 'Soulmate', logo: '/images/brands/soulmate.webp', url: '/shops' },
    { id: 20, name: 'CHAAUM', logo: '/images/brands/chaaum.webp', url: '/shops' },
    { id: 21, name: 'Wolf', logo: '/images/brands/wolf.webp', url: '/shops' },
    { id: 22, name: 'ร้านศรียา', logo: '/images/brands/sriya-pharmacy.webp', url: '/shops' },
    { id: 23, name: 'MOS Dental Clinic', logo: '/images/brands/mos-dental-clinic.webp', url: '/shops' },
    { id: 24, name: 'ELITE', logo: '/images/brands/elite.webp', url: '/shops' },
    { id: 25, name: 'BWK International', logo: '/images/brands/bwk-international.webp', url: '/shops' },
    { id: 26, name: 'De Loop', logo: '/images/brands/de-loop.webp', url: '/shops' },
    { id: 27, name: 'BYD', logo: '/images/brands/byd.webp', url: '/shops' },
    { id: 28, name: 'Infinity Carwash', logo: '/images/brands/infinity-carwash.webp', url: '/shops' },
  ],

  /* ---------- All events ---------- */
  /*
   * All events
   *   start / end = วันจัดงาน (ปี ค.ศ. YYYY-MM-DD) → เว็บคำนวณวันในสัปดาห์ + สถานะให้เอง:
   *       ยังไม่ถึงวันงาน = กำลังจะมาถึง (+ อีก N วัน) · ระหว่างงาน = กำลังจัดงาน · เลยวันงาน = จบแล้ว
   *   status (ใส่เองเมื่อจำเป็น):
   *       'postponed' = เลื่อนจัด → start/end คือวันใหม่, was = วันเดิม { start, end }
   *       'cancelled' = ยกเลิก
   *   time = เวลาจัดงาน (แสดงใต้วันที่) · detail = รายละเอียดในป๊อปอัป (คลิกการ์ด) – \n = ขึ้นย่อหน้าใหม่
   *   url = ลิงก์หน้ากิจกรรมเดิมบน bonmarche.co.th (เก็บไว้อ้างอิง – ไม่ได้แสดงบนเว็บ)
   *   ข้อมูล event 1–3 มาจากหน้ากิจกรรมใน bonmarche.co.th · event 4 (BON Picnic Market) เป็นงานจำลอง – วันที่ / สถานที่สมมติ
   */
  events: [
    { id: 1, title: 'ออกร้านริมบึง', detail: '‘งานออกร้านริมบึง’ โดยผู้ประกอบการคุณภาพของตลาดบองมาร์เช่ ที่ได้คัดสรรสินค้าดี ๆ อาทิ ร้านเสื้อผ้าหลากหลายสไตล์ เครื่องประดับหินมงคล ไข่มุกน้ำดี เพชรน้ำหนึ่ง มาให้เลือกซื้อกันอย่างหลากหลาย\n\nช้อปสินค้าคุณภาพได้ตั้งแต่เช้ายันเย็นที่ “งานออกร้านริมบึง” ประจำเดือนกันยายน', start: '2020-09-11', end: '2020-09-27', time: '10.00 – 17.00 น.', place: 'เต็นท์ขาว ข้างฟู้ดคอร์ท', image: '/images/event-1.jpg', url: 'https://bonmarche.co.th/event/food-court/%e0%b8%ad%e0%b8%ad%e0%b8%81%e0%b8%a3%e0%b9%89%e0%b8%b2%e0%b8%99%e0%b8%a3%e0%b8%b4%e0%b8%a1%e0%b8%9a%e0%b8%b6%e0%b8%87/' },
    { id: 2, title: 'ตลาดนัด ส.มก. ครั้งที่ 9', detail: 'กันยานี้ เตรียมพบกับ “งานออกร้านโดยศิษย์เก่า ม.เกษตรฯ” อีกครั้ง ในตลาดนัด ส.มก. ครั้งที่ 9\n\nตลาดนัด ส.มก. สัญจร ครั้งที่ 9 จัดโดยสมาคมนิสิตเก่ามหาวิทยาลัยเกษตรศาสตร์ คัดสรรสินค้าดี ของกินอร่อยมีคุณภาพ และสินค้าอื่น ๆ ที่น่าสนใจอีกมากมาย', start: '2020-09-04', end: '2020-09-06', time: '08.00 – 16.30 น.', place: 'เต็นท์ขาว ข้างฟู้ดคอร์ท', image: '/images/event-2.jpg', url: 'https://bonmarche.co.th/event/food-court/%e0%b8%95%e0%b8%a5%e0%b8%b2%e0%b8%94%e0%b8%99%e0%b8%b1%e0%b8%94-%e0%b8%aa-%e0%b8%a1%e0%b8%81-%e0%b8%84%e0%b8%a3%e0%b8%b1%e0%b9%89%e0%b8%87%e0%b8%97%e0%b8%b5%e0%b9%88-9/' },
    { id: 3, title: 'ริมน้ำ on TOUR', detail: 'สายอาหารเตรียมตัวไปช้อป ชิลล์ ชิมเมนูอร่อย จากริมน้ำปิง ถึงแม่น้ำตาปี\n\nรวมความอร่อยจากร้านเด็ดดังทั่วไทย มาไว้ที่บองมาร์เช่ ใจกลางย่านประชาชื่น เช่น ปลาสลิดร้านติ๋มปลาสลิด ข้าวหลามแม่ระเบียบ คุณต้องข้าวแกงโบราณ มะขามหวานตลาดดอนหวาย KhaoKho Food Story น้ำพริกแม่เล็ก สุบินเนื้อย่าง ร้าน Beergasm สมทรงเป็ดย่าง และไก่ทอดร้านนิมาเรียม', start: '2020-08-26', end: '2020-08-30', time: '08.00 – 18.00 น.', place: 'เต็นท์ขาว ใกล้ฟู้ดคอร์ท', image: '/images/event-3.jpg', url: 'https://bonmarche.co.th/event/food-court/%e0%b8%a3%e0%b8%b4%e0%b8%a1%e0%b8%99%e0%b9%89%e0%b8%b3-on-tour/' },
    { id: 4, title: 'BON Picnic Market ช้อป ชิม ชิลล์ เติมความสุขริมบึง', detail: 'กิจกรรมใหม่ริมบึง ปูเสื่อปิกนิก ช้อป ชิม ชิลล์ เติมความสุขกับครอบครัวและเพื่อน ๆ\n\nภายในงานมีอาหารและเครื่องดื่ม ดนตรีสด Acoustic สินค้า Handmade และ Workshop งานศิลปะ', start: '2026-12-12', end: '2026-12-13', time: '10.00 – 20.00 น.', place: 'ริมบึง หน้า Plaza E', image: '/images/event-4.jpg', url: '#' },
  ],

  /* ---------- News ----------
   * ข่าวจริงจาก bonmarche.co.th/news – ข่าวแรก = ข่าวเด่นรูปใหญ่ · คลิกข่าว = ป๊อปอัปอ่านข่าวเต็ม
   *   tag = หมวดข่าว · excerpt = เกริ่นสั้น (ใต้หัวข้อข่าวเด่น) · detail = เนื้อข่าวในป๊อปอัป (\n = ขึ้นบรรทัดใหม่)
   *   url = หน้าข่าวเดิมใน bonmarche.co.th (เก็บไว้อ้างอิง – ไม่ได้แสดงบนเว็บ) */
  news: [
    {
      id: 1,
      tag: 'รางวัล',
      title: 'บองมาร์เช่ คว้ารางวัล Bangkok Premium Market ประจำปี 2565',
      excerpt: 'รับมอบป้าย “สุดยอดตลาดต้นแบบพรีเมียมมาร์เก็ต” จากกรุงเทพมหานคร',
      detail: 'บองมาร์เช่ มาร์เก็ตพาร์ค ได้รับรางวัล Bangkok Premium Market ประจำปี 2565 เมื่อวันพฤหัสบดีที่ 25 สิงหาคม ณ อาคารไอราวัตพัฒนา ศาลาว่าการกรุงเทพมหานคร (ดินแดง) ในพิธีมอบป้ายตลาด Premium Market “สุดยอดตลาดต้นแบบ” จากกรุงเทพมหานคร โดย ผศ.ดร.ทวิดา กมลเวชช รองผู้ว่าราชการกรุงเทพมหานคร\n\nนับเป็นอีกหนึ่งความสำเร็จของตลาดบองมาร์เช่ฯ ที่รักษาระดับมาตรฐานได้อย่างดีเยี่ยม และเร็ว ๆ นี้ยังมีโครงการใหม่อีกมากมาย พร้อมรองรับกลุ่มครอบครัว น้อง ๆ นักเรียน และนักศึกษา ภายใต้สโลแกน “สบาย สบาย สไตล์บองมาร์เช่”\n\nขอขอบพระคุณลูกค้าทุกท่านที่ให้การสนับสนุนตลอดมา',
      date: '30 ส.ค. 2565',
      image: '/images/news/premium-market-2565.jpg',
      url: 'https://bonmarche.co.th/2022/08/30/%f0%9f%8f%86%e0%b8%a3%e0%b8%b2%e0%b8%87%e0%b8%a7%e0%b8%b1%e0%b8%a5-bangkok-premium-market-%e0%b8%9b%e0%b8%b5-2565-%f0%9f%8f%86%f0%9f%92%8e/',
    },
    {
      id: 2,
      tag: 'การเดินทาง',
      title: 'เดินทางมาบองมาร์เช่ง่ายขึ้น ด้วยรถไฟฟ้าสายสีแดง',
      excerpt: 'ลงสถานีวัดเสมียนนารี ใกล้ตลาด พร้อมเส้นทางอื่น ๆ อีกมากมาย',
      detail: 'เดินทางมาบองมาร์เช่โดยรถไฟฟ้าสายสีแดง บางซื่อ–รังสิต ได้แล้ว ลงที่สถานีวัดเสมียนนารี เส้นทางเริ่มจากบริเวณแยกประดิพัทธ์ ผ่านเขตจตุจักร บางเขน หลักสี่ ดอนเมือง ไปสิ้นสุดที่สถานีรังสิต\n\nนอกจากรถไฟฟ้าสายสีแดง ยังเดินทางมาได้หลายทาง\n• รถยนต์ส่วนตัว – ตลาดอยู่บนถนนเทศบาลสงเคราะห์ ห่างจากวัดเสมียนนารี 200 เมตร เข้าได้ทั้งจากถนนวิภาวดีฯ และถนนประชาชื่น มีที่จอดรถในตลาด\n• แท็กซี่ / Grab – ปักหมุด “ตลาดบองมาร์เช่”\n• BTS – สถานีหมอชิต หรือสถานีห้าแยกลาดพร้าว\n• MRT – สถานีสวนจตุจักร หรือสถานีบางซื่อ\n• รถเมล์ – สาย 29, 52, 510, 134, 191, 66, 67, 70 (สาย 67 จอดหน้าตลาด)\n• รถสองแถว 1075 จัดสรรเทศบาล 1 – สามแยกเกษตร (ใต้)\n• มอเตอร์ไซค์รับจ้าง\n\nสะดวกแบบไหนก็มาเที่ยวพักผ่อน แวะหาของอร่อยในบรรยากาศสบาย ๆ ที่บองมาร์เช่กันได้เลย',
      date: '6 ก.ย. 2564',
      image: '/images/news/red-line-route.jpg',
      url: 'https://bonmarche.co.th/2021/09/06/%e0%b8%a3%e0%b8%b9%e0%b9%89%e0%b8%ab%e0%b8%a3%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%a1%e0%b9%88-%e0%b8%9a%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b2%e0%b8%a3%e0%b9%8c%e0%b9%80%e0%b8%8a%e0%b9%88-%e0%b8%a1/',
    },
    {
      id: 3,
      tag: 'มาตรฐานตลาด',
      title: 'บองมาร์เช่ มาร์เก็ตพาร์ค ได้มาตรฐานตลาดระดับเพชร',
      excerpt: 'ตลาดสะอาด ถูกสุขอนามัย คุ้มครองผู้บริโภค รับรองโดยกรุงเทพมหานคร',
      detail: 'บองมาร์เช่ มาร์เก็ตพาร์ค ได้มาตรฐานตลาดระดับเพชรจากกรุงเทพมหานคร\n\nตลาดระดับเพชร คือตลาดที่ผ่านเกณฑ์มาตรฐานว่าสะอาด ถูกสุขอนามัย และคุ้มครองผู้บริโภค ลูกค้ามั่นใจได้ว่ามาใช้บริการที่ตลาดบองมาร์เช่ จะได้เดินตลาดที่สะอาดและปลอดภัย ตลาดทำความสะอาดทุกจุดที่มีการสัมผัส เพื่อสร้างความเชื่อมั่นให้ลูกค้าทุกท่าน\n\nมั่นใจ ปลอดภัย ได้มาตรฐาน นึกถึงตลาดสะอาด นึกถึงบองมาร์เช่',
      date: '21 ส.ค. 2563',
      image: '/images/news/diamond-market.jpg',
      url: 'https://bonmarche.co.th/2020/08/21/%e0%b8%9a%e0%b8%ad%e0%b8%87-%e0%b8%a1%e0%b8%b2%e0%b8%a3%e0%b9%8c%e0%b9%80%e0%b8%8a%e0%b9%88-%e0%b8%a1%e0%b8%b2%e0%b8%a3%e0%b9%8c%e0%b9%80%e0%b8%81%e0%b9%87%e0%b8%95%e0%b8%9e%e0%b8%b2%e0%b8%a3%e0%b9%8c/',
    },
    // ↓ แสดงเฉพาะหน้า "ข่าวทั้งหมด" (/news) – หน้าแรกแสดง 3 ข่าวแรก
    {
      id: 4,
      tag: 'มาตรฐานตลาด',
      title: 'บองมาร์เช่ ผ่านมาตรการเฝ้าระวัง COVID-19 แห่งเดียวในจตุจักร',
      excerpt: 'ผ่านการตรวจครบทั้ง 9 ข้อ โดยสำนักอนามัย กรุงเทพมหานคร (เขตจตุจักร)',
      detail: 'บองมาร์เช่ เป็นโครงการเดียวที่ผ่านการตรวจมาตรการเฝ้าระวัง ป้องกัน และควบคุมการแพร่ระบาด COVID-19 โดยสำนักอนามัย กรุงเทพมหานคร (เขตจตุจักร) ครบทั้ง 9 ข้อ\n\n1. ปรับปรุงสภาพแวดล้อมตลาด ระบายอากาศเพียงพอ ไม่มีกลิ่นอับ\n2. จัดทำทะเบียนผู้ค้าและลูกจ้าง\n3. ทำความสะอาดพื้นและจุดสัมผัสบ่อยทั้งก่อนและหลังให้บริการ กำจัดขยะทุกวัน\n4. ผู้ค้า ลูกจ้าง และผู้ใช้บริการสวมหน้ากากตลอดเวลา\n5. มีจุดล้างมือด้วยสบู่หรือแอลกอฮอล์เจล\n6. เว้นระยะห่างของแผงและการเลือกซื้อ–ชำระเงินอย่างน้อย 1 เมตร\n7. ควบคุมจำนวนคนไม่ให้แออัด\n8. ควบคุมทางเข้าออกและคัดกรองอาการป่วย\n9. ใช้แอปพลิเคชันติดตามตัวตามที่ทางราชการกำหนด\n\nขอให้ทุกท่านมั่นใจในความสะอาดปลอดภัย เราพร้อมใส่ใจดูแลและรักษามาตรฐานนี้ต่อไป ขอบพระคุณลูกค้าทุกท่านที่ไว้วางใจบองมาร์เช่เสมอมา',
      date: '18 มิ.ย. 2564',
      image: '/images/news/covid-check-2564.jpg',
      url: 'https://bonmarche.co.th/2021/06/18/%e0%b8%9a%e0%b8%ad%e0%b8%87-%e0%b8%a1%e0%b8%b2%e0%b8%a3%e0%b9%8c%e0%b9%80%e0%b8%8a%e0%b9%88-%e0%b8%9c%e0%b9%88%e0%b8%b2%e0%b8%99%e0%b8%a1%e0%b8%b2%e0%b8%95%e0%b8%a3%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b9%80/',
    },
    {
      id: 5,
      tag: 'กิจกรรม',
      title: 'ร่วมตอบแบบสอบถามความพึงพอใจ บองมาร์เช่ มาร์เก็ต พาร์ค',
      excerpt: 'ตอบแบบสอบถามผ่าน LINE รับ Gift Voucher หรือของสมนาคุณ (กิจกรรมสิ้นสุดแล้ว)',
      detail: 'กิจกรรมนี้สิ้นสุดแล้ว (7 ส.ค. – 4 ก.ย. 2563)\n\nเพียงเพิ่มเพื่อน LINE Official Account ของบองมาร์เช่ แล้วตอบแบบสอบถามความพึงพอใจออนไลน์ แคปหน้าจอหลังตอบเสร็จ นำมารับของตอบแทนได้ที่บูธกิจกรรม ใกล้ธนาคารไทยพาณิชย์ สาขาตลาดบองมาร์เช่ (จันทร์–เสาร์ 10.00–17.00 น.) ท่านละ 1 สิทธิ์\n\nของตอบแทน\n• Gift Voucher ส่วนลด 50 บาท เครื่องดื่มร้าน Café Au Lac\n• Gift Voucher ส่วนลด 50 บาท อาหารร้านในโซนฟู้ดคอร์ท\n• ของสมนาคุณจากบองมาร์เช่\n\nสอบถามฝ่ายกิจกรรม โทร 02-953-8980 ต่อ 120',
      date: '7 ส.ค. 2563',
      image: '/images/news/survey-2563.jpg',
      url: 'https://bonmarche.co.th/2020/08/07/%e0%b8%a3%e0%b9%88%e0%b8%a7%e0%b8%a1%e0%b8%95%e0%b8%ad%e0%b8%9a%e0%b9%81%e0%b8%9a%e0%b8%9a%e0%b8%aa%e0%b8%ad%e0%b8%9a%e0%b8%96%e0%b8%b2%e0%b8%a1%e0%b8%aa%e0%b8%b3%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b8%84/',
    },
    {
      id: 6,
      tag: 'ประกาศ',
      title: 'มาตรการป้องกัน “ไวรัสโควิด 19”',
      excerpt: 'วิธีป้องกันไวรัส COVID-19 และกำลังใจถึงทีมแพทย์ พยาบาล และเจ้าหน้าที่ทุกท่าน',
      detail: 'ตลาดบองมาร์เช่ ขอนำเสนอวิธีป้องกัน “ไวรัส COVID-19” และขอร่วมเป็นกำลังใจให้ทีมแพทย์ พยาบาล และเจ้าหน้าที่ที่เกี่ยวข้องทุกท่าน ในการปฏิบัติงานและควบคุมสถานการณ์การแพร่ระบาดของไวรัส COVID-19\n\nขอบคุณค่ะ',
      date: '16 เม.ย. 2563',
      image: '/images/news/covid-procedure.jpg',
      url: 'https://bonmarche.co.th/2020/04/16/covid-19-procedure/',
    },
  ],

  /* ---------- Awards (icon: Award | Trophy | ShieldCheck | Medal) ---------- */
  awards: [
    { id: 1, icon: 'Award', name: 'ตลาดสดน่าซื้อ ระดับดีเด่น', by: 'กรมอนามัย', year: '2568' },
    { id: 2, icon: 'Trophy', name: 'ตลาดต้นแบบด้านสิ่งแวดล้อม', by: 'กรุงเทพมหานคร', year: '2567' },
    { id: 3, icon: 'ShieldCheck', name: 'มาตรฐานความปลอดภัยอาหาร', by: 'สำนักงานคณะกรรมการอาหารและยา', year: '2567' },
  ],

  /* ---------- Map / Getting here ----------
   * ข้อมูลตามหน้า "ติดต่อเรา" ของ bonmarche.co.th/contact
   *   place = ชื่อสถานที่ · address / hours / phone = ที่อยู่ เวลาทำการ เบอร์โทร
   *   mapQuery = ชื่อที่ใช้ปักหมุดใน Google Maps (เหมือนแผนที่ในหน้า contact) · mapUrl = ลิงก์ปุ่ม "นำทาง"
   *   socials = ปุ่มโซเชียลใต้ข้อมูล (platform: facebook | instagram | line)
   *   (ช่องไหนเว้นว่าง จะใช้ค่าจากข้อมูลเว็บ / settings แทน) */
  gettingHere: {
    title: 'การเดินทาง',
    text: 'ตลาดสดพรีเมียมและคอมมูนิตี้ย่านจตุจักร ใกล้รถไฟฟ้าสายสีแดง สถานีวัดเสมียนนารี มีที่จอดรถกว่า 500 คัน',
    place: 'บองมาร์เช่ มาร์เก็ตพาร์ค',
    address: '105 ถนน เทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900',
    hours: 'วันจันทร์ – วันอาทิตย์ 05.00 – 22.00 น.',
    phone: '02-953-8980',
    mapQuery: 'บอง มาเช่ร์',
    mapUrl: 'https://goo.gl/maps/oYkWq3kYKCFHew236',
    socials: [
      { platform: 'facebook', label: 'Bon Marché Market Park', url: 'https://www.facebook.com/bonmarche.marketpark/' },
      { platform: 'instagram', label: 'bonmarchemarket', url: 'https://www.instagram.com/bonmarchemarket/' },
      { platform: 'line', label: '@bonmarche', url: 'https://line.me/R/ti/p/@mzn5714l' },
    ],
    discoverUrl: '/shops',
  },

  /* ---------- Follow us (platform: facebook | youtube | instagram | tiktok) ---------- */
  social: {
    links: [
      { platform: 'facebook', url: 'https://www.facebook.com/' },
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
      { id: 2, platform: 'tiktok', title: 'พาเดินตลาด Bon Marché ใน 5 นาที', text: 'รวมร้านเด็ด มุมถ่ายรูป และของกินห้ามพลาด ดูจบรู้เลยว่าต้องไปโซนไหนก่อน', date: '2 พ.ย. 2569 · 20:00', views: 18400, likes: 932, image: '/images/hero-banner.webp', url: 'https://www.tiktok.com/' },
      { id: 3, platform: 'instagram', title: 'มุมถ่ายรูปใหม่ริมสระน้ำ 📸', text: 'แสงสวยช่วงเย็น 4–6 โมง แท็ก #BonMarche มาให้เราดูด้วยนะ', date: '31 ต.ค. 2569 · 13:00', likes: 3105, comments: 142, image: '/images/visit-banner.webp', url: 'https://www.instagram.com/' },
      { id: 4, platform: 'facebook', title: 'Taste of Thailand เริ่มเสาร์นี้!', text: 'เทศกาลอาหารไทยจากทั่วประเทศ กว่า 40 ร้าน 15–30 พ.ย. ลานกิจกรรม อาคาร A', date: '30 ต.ค. 2569 · 09:00', likes: 2018, comments: 210, image: '/images/week-4.jpg', url: 'https://www.facebook.com/' },
      { id: 5, platform: 'tiktok', title: 'สมูทตี้แก้วละ 39 บาท 🍹', text: 'ลองเมนูใหม่ Green Day ผักผลไม้ปั่นสด ไม่ใส่น้ำตาล อร่อยจนต้องกดซ้ำ', date: '29 ต.ค. 2569 · 18:30', views: 56200, likes: 4870, image: '/images/shop-3.jpg', url: 'https://www.tiktok.com/' },
      { id: 6, platform: 'tiktok', title: 'สูตรข้าวมันไก่ต้นตำรับ', text: 'เปิดครัวร้านข้าวมันไก่ในตลาด ต้มไก่ หุงข้าว และน้ำจิ้มเต้าเจี้ยวสูตรเด็ด', date: '27 ต.ค. 2569 · 19:00', views: 9800, likes: 611, image: '/images/shop-1.jpg', url: 'https://www.tiktok.com/' },
    ],
  },
}

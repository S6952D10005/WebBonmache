/*
 * Shop Directory – built-in data (same as database/update-2026-11-16-shops.sql).
 * Used while the database has not been updated yet or is offline.
 */
/*
 * Zones = the buildings in the CAD drawing (asset/cad/market.dwg → src/data/marketPlan.js).
 * code must match marketPlan.js; the part before "·" is the building, after it what's inside.
 */
export const zones = [
  { code: 'MK', name: 'ตลาด · ตลาดสด' },
  { code: 'A', name: 'อาคาร A · ฟู้ดคอร์ท' },
  { code: 'BC', name: 'อาคาร B&C · คาเฟ่ & เบเกอรี่' },
  { code: 'E', name: 'อาคาร E · แฟชั่น & ไลฟ์สไตล์' },
  { code: 'F', name: 'อาคาร F · สุขภาพ & บริการ' },
  { code: 'G', name: 'อาคาร G' },
  { code: 'H', name: 'อาคาร H' },
  { code: 'D', name: 'อาคาร D' },
  { code: 'M', name: 'อาคาร M' },
  { code: 'N', name: 'อาคาร N' },
  { code: 'P', name: 'อาคารจอดรถ' },
]

export const directoryShops = [
  { id: 1, category_id: 1, name: 'ข้าวมันไก่ไรรินทร์', category_label: 'ร้านอาหารไทยชื่อดัง', badge: 'ร้านเด็ด', is_new: 1, is_featured: 1, image_url: '/images/shop-1.jpg', zone: 'A', unit_no: 'A-03', open_hours: '07:00-14:00', phone: '02-953-8980 ต่อ 101', description: 'ข้าวมันไก่ต้มสูตรต้นตำรับ น้ำจิ้มเต้าเจี้ยวรสเข้ม หุงข้าวด้วยน้ำซุปไก่ทุกวัน' },
  { id: 2, category_id: 4, name: 'Maison Pâtisserie', category_label: 'เบเกอรี่ & ขนมหวาน', badge: 'ร้านเปิดใหม่', is_new: 1, is_featured: 1, image_url: '/images/shop-2.jpg', zone: 'BC', unit_no: 'BC-05', open_hours: '08:00-20:00', phone: '02-953-8980 ต่อ 102', description: 'เบเกอรี่สไตล์ฝรั่งเศส อบสดใหม่ทุกเช้า มัฟฟิน ครัวซองต์ และเค้กโฮมเมด' },
  { id: 3, category_id: 1, name: 'Green Day Smoothie', category_label: 'น้ำผลไม้ปั่นเพื่อสุขภาพ', badge: 'ร้านเด็ด', is_new: 0, is_featured: 1, image_url: '/images/shop-3.jpg', zone: 'A', unit_no: 'A-11', open_hours: '09:00-21:00', phone: '02-953-8980 ต่อ 103', description: 'สมูทตี้ผักผลไม้ปั่นสด ไม่ใส่น้ำตาล เลือกท็อปปิ้งเพื่อสุขภาพได้' },
  { id: 4, category_id: 3, name: 'Urban Style', category_label: 'แฟชั่น & ไลฟ์สไตล์', badge: 'ร้านเปิดใหม่', is_new: 0, is_featured: 1, image_url: '/images/shop-4.jpg', zone: 'E', unit_no: 'E-02', open_hours: '10:00-21:00', phone: '02-953-8980 ต่อ 104', description: 'เสื้อผ้าแฟชั่นสไตล์มินิมอล ใส่ได้ทุกวัน ทั้งผู้หญิงและผู้ชาย' },
  { id: 5, category_id: 1, name: 'Seafood Corner', category_label: 'อาหารทะเลสดใหม่', badge: 'ร้านเด็ด', is_new: 0, is_featured: 1, image_url: '/images/shop-5.jpg', zone: 'MK', unit_no: 'MK-08', open_hours: '06:00-19:00', phone: '02-953-8980 ต่อ 105', description: 'อาหารทะเลสดส่งตรงทุกเช้า หอย กุ้ง ปลา พร้อมบริการปรุงสุก' },
  { id: 6, category_id: 1, name: 'Fresh & Healthy Salad', category_label: 'สลัดและเมนูสุขภาพ', badge: null, is_new: 0, is_featured: 0, image_url: '/images/week-1.jpg', zone: 'A', unit_no: 'A-07', open_hours: '09:00-20:00', phone: '02-953-8980 ต่อ 106', description: 'สลัดผักออร์แกนิก อกไก่ย่าง และน้ำสลัดโฮมเมดแคลอรี่ต่ำ' },
  { id: 7, category_id: 4, name: 'Bon Café', category_label: 'กาแฟพรีเมียม', badge: null, is_new: 0, is_featured: 0, image_url: '/images/week-2.jpg', zone: 'BC', unit_no: 'BC-01', open_hours: '07:00-21:00', phone: '02-953-8980 ต่อ 107', description: 'กาแฟคั่วเองจากเมล็ดไทย ลาเต้อาร์ตทุกแก้ว มุมนั่งสบายรับลม' },
  { id: 8, category_id: 2, name: 'Green Corner', category_label: 'ผักผลไม้ปลอดสารพิษ', badge: null, is_new: 0, is_featured: 0, image_url: '/images/week-3.jpg', zone: 'MK', unit_no: 'MK-01', open_hours: '05:00-18:00', phone: '02-953-8980 ต่อ 108', description: 'ผักผลไม้ปลอดสารจากเกษตรกรเครือข่าย คัดสดใหม่ทุกวัน' },
  { id: 9, category_id: 1, name: 'Taste of Thailand', category_label: 'อาหารไทยต้นตำรับ', badge: null, is_new: 0, is_featured: 0, image_url: '/images/week-4.jpg', zone: 'A', unit_no: 'A-15', open_hours: '10:00-21:00', phone: '02-953-8980 ต่อ 109', description: 'อาหารไทยรสจัดจ้าน ปลาหมึกย่าง ส้มตำ ลาบ และกับข้าวพร้อมทาน' },
  { id: 10, category_id: 5, name: 'Wellness Shop', category_label: 'ผลิตภัณฑ์ดูแลสุขภาพ', badge: null, is_new: 0, is_featured: 0, image_url: '/images/week-5.jpg', zone: 'F', unit_no: 'F-04', open_hours: '10:00-20:00', phone: '02-953-8980 ต่อ 110', description: 'สกินแคร์และผลิตภัณฑ์ดูแลผิวจากธรรมชาติ อ่อนโยน ปลอดภัย' },
  { id: 11, category_id: 2, name: 'สวนผลไม้ป้าแดง', category_label: 'ผลไม้ตามฤดูกาล', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'MK', unit_no: 'MK-05', open_hours: '05:00-17:00', phone: '02-953-8980 ต่อ 111', description: 'ผลไม้ตามฤดูกาลจากสวน ทุเรียน มังคุด มะม่วง หวานฉ่ำ' },
  { id: 12, category_id: 2, name: 'ปลาสดแม่กลอง', category_label: 'ปลาและอาหารทะเลสด', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'MK', unit_no: 'MK-10', open_hours: '05:00-14:00', phone: '02-953-8980 ต่อ 112', description: 'ปลาทู ปลากะพง และอาหารทะเลสดจากแม่กลอง ขอดเกล็ดให้ฟรี' },
  { id: 13, category_id: 2, name: 'เขียงหมูลุงชัย', category_label: 'เนื้อสัตว์สดอนามัย', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'MK', unit_no: 'MK-12', open_hours: '05:00-13:00', phone: '02-953-8980 ต่อ 113', description: 'เนื้อหมูสดจากฟาร์มมาตรฐาน ตัดแต่งตามสั่ง สะอาด ถูกหลักอนามัย' },
  { id: 14, category_id: 1, name: 'ก๋วยเตี๋ยวเรือป้าศรี', category_label: 'ก๋วยเตี๋ยวเรือ', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'A', unit_no: 'A-20', open_hours: '08:00-16:00', phone: '02-953-8980 ต่อ 114', description: 'ก๋วยเตี๋ยวเรือน้ำตกสูตรโบราณ ชามเล็กอิ่มอร่อย' },
  { id: 15, category_id: 1, name: 'ขนมไทยแม่บุญ', category_label: 'ขนมไทยโบราณ', badge: 'ร้านเด็ด', is_new: 0, is_featured: 0, image_url: null, zone: 'A', unit_no: 'A-09', open_hours: '07:00-18:00', phone: '02-953-8980 ต่อ 115', description: 'ขนมชั้น ทองหยิบ ขนมตาล ทำสดทุกวันแบบดั้งเดิม' },
  { id: 16, category_id: 4, name: 'ชาหอม Tea House', category_label: 'ชาไทยและชาสมุนไพร', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'BC', unit_no: 'BC-09', open_hours: '09:00-20:00', phone: '02-953-8980 ต่อ 116', description: 'ชาไทย ชาเขียว และชาสมุนไพรชงสด หอมกลมกล่อม' },
  { id: 17, category_id: 4, name: 'Ice-Cream Lab', category_label: 'ไอศกรีมโฮมเมด', badge: 'ร้านเปิดใหม่', is_new: 1, is_featured: 0, image_url: null, zone: 'BC', unit_no: 'BC-12', open_hours: '11:00-21:00', phone: '02-953-8980 ต่อ 117', description: 'ไอศกรีมโฮมเมดรสผลไม้ไทย ทำสดในร้านทุกวัน' },
  { id: 18, category_id: 3, name: 'Little Linen', category_label: 'เสื้อผ้าผ้าลินิน', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'E', unit_no: 'E-06', open_hours: '10:00-20:00', phone: '02-953-8980 ต่อ 118', description: 'เสื้อผ้าผ้าลินินและผ้าฝ้าย ใส่สบาย เหมาะกับอากาศเมืองไทย' },
  { id: 19, category_id: 3, name: 'Sole Story', category_label: 'รองเท้าและกระเป๋า', badge: 'ร้านเปิดใหม่', is_new: 1, is_featured: 0, image_url: null, zone: 'E', unit_no: 'E-10', open_hours: '10:00-21:00', phone: '02-953-8980 ต่อ 119', description: 'รองเท้าและกระเป๋าดีไซน์เรียบหรู ราคาเป็นมิตร' },
  { id: 20, category_id: 5, name: 'สมุนไพรบ้านยาย', category_label: 'สมุนไพรไทย', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'F', unit_no: 'F-02', open_hours: '09:00-19:00', phone: '02-953-8980 ต่อ 120', description: 'ยาดม ลูกประคบ และผลิตภัณฑ์สมุนไพรไทยสูตรดั้งเดิม' },
  { id: 21, category_id: 5, name: 'Glow Nail & Spa', category_label: 'ทำเล็บและสปา', badge: 'ร้านเปิดใหม่', is_new: 1, is_featured: 0, image_url: null, zone: 'F', unit_no: 'F-08', open_hours: '10:00-20:00', phone: '02-953-8980 ต่อ 121', description: 'ทำเล็บ สปามือเท้า และนวดผ่อนคลาย โดยช่างมืออาชีพ' },
  { id: 22, category_id: 6, name: 'Home & Living', category_label: 'ของใช้ในบ้าน', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'E', unit_no: 'E-14', open_hours: '10:00-20:00', phone: '02-953-8980 ต่อ 122', description: 'ของแต่งบ้าน ภาชนะ และของใช้ในครัวดีไซน์สวย' },
  { id: 23, category_id: 6, name: 'Green Thumb', category_label: 'ต้นไม้และอุปกรณ์จัดสวน', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'E', unit_no: 'E-16', open_hours: '08:00-18:00', phone: '02-953-8980 ต่อ 123', description: 'ต้นไม้ฟอกอากาศ ไม้มงคล กระถาง และอุปกรณ์จัดสวน' },
  { id: 24, category_id: 7, name: 'อาจารย์ทิพย์ ดูดวง', category_label: 'ดูดวงและโหราศาสตร์', badge: null, is_new: 0, is_featured: 0, image_url: null, zone: 'F', unit_no: 'F-12', open_hours: '11:00-19:00', phone: '02-953-8980 ต่อ 124', description: 'ดูดวงไพ่ยิปซี ลายมือ และฤกษ์มงคล' },
]

/*
 * Buildings shown as tabs above the shop list (and on the market map).
 * Each building groups some zones. Change names / zones here (or later move
 * them into the database).
 */
export const buildings = [
  { code: 'market', name: 'Fresh Market', label: 'ตลาดสด & ฟู้ดคอร์ท', zones: ['MK', 'A'] },
  { code: 'plaza', name: 'Bon Marché Plaza', label: 'คาเฟ่ · แฟชั่น · สุขภาพ', zones: ['BC', 'D', 'E', 'F', 'G', 'H', 'M', 'N', 'P'] },
]

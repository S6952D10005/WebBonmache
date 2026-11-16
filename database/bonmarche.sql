-- =====================================================================
--  Bon Marché – MySQL schema + sample data
--  วิธีใช้: เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) ทั้งไฟล์
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bonmarche
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE bonmarche;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS site_settings, nav_menus, highlights, categories, shops, shop_zones, visit_info, footer_links;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  ค่าตั้งค่าทั่วไปของเว็บ (ข้อความ Hero, รูป, ที่อยู่, โซเชียล ฯลฯ)
-- ---------------------------------------------------------------------
CREATE TABLE site_settings (
  setting_key   VARCHAR(64)  NOT NULL PRIMARY KEY,
  setting_value TEXT         NULL,
  description   VARCHAR(255) NULL,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  เมนูด้านบน / ด้านล่าง
-- ---------------------------------------------------------------------
CREATE TABLE nav_menus (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id    INT UNSIGNED NULL     COMMENT 'NULL = เมนูหลัก, ใส่ id เมนูหลัก = เมนูย่อยใน Dropdown',
  label        VARCHAR(100) NOT NULL,
  url          VARCHAR(255) NOT NULL DEFAULT '#',
  icon         VARCHAR(40)  NULL     COMMENT 'ชื่อไอคอน lucide เช่น Store, Building (เมนูย่อย)',
  description  VARCHAR(160) NULL     COMMENT 'คำอธิบายสั้นใต้ชื่อเมนูย่อย',
  has_dropdown TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order   INT          NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  KEY idx_nav_parent (parent_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  This week at Bon Marché (อีเวนต์ / โปรโมชั่น)
-- ---------------------------------------------------------------------
CREATE TABLE highlights (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tag         VARCHAR(50)  NOT NULL COMMENT 'อีเวนต์ / โปรโมชั่น',
  title       VARCHAR(150) NOT NULL,
  subtitle    VARCHAR(255) NULL,
  date_label  VARCHAR(50)  NULL COMMENT 'ข้อความวันที่ที่แสดงบนการ์ด',
  start_date  DATE         NULL,
  end_date    DATE         NULL,
  image_url   VARCHAR(500) NULL,
  link        VARCHAR(255) NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  หมวดหมู่ (icon: utensils | salad | bag | coffee | heart | gift | sparkles | map)
--  (color: orange | teal | pink | yellow)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(30)  NOT NULL DEFAULT 'utensils',
  color       VARCHAR(20)  NOT NULL DEFAULT 'teal',
  link        VARCHAR(255) NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  ร้านค้า (Must-try & New Shops)
-- ---------------------------------------------------------------------
CREATE TABLE shop_zones (
  code        VARCHAR(10)  NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE shops (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NULL,
  name            VARCHAR(150) NOT NULL,
  category_label  VARCHAR(150) NULL,
  badge           VARCHAR(50)  NULL COMMENT 'ร้านเด็ด / ร้านเปิดใหม่',
  is_new          TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured     TINYINT(1)   NOT NULL DEFAULT 1 COMMENT 'แสดงใน Must-try',
  image_url       VARCHAR(500) NULL,
  link            VARCHAR(255) NULL,
  zone            VARCHAR(10)  NULL COMMENT 'รหัสโซน (shop_zones.code) เช่น A',
  unit_no         VARCHAR(20)  NULL COMMENT 'เลขล็อก เช่น A-08',
  open_hours      VARCHAR(60)  NULL COMMENT 'เวลาเปิด-ปิด เช่น 08:00-20:00',
  phone           VARCHAR(50)  NULL,
  description     VARCHAR(500) NULL,
  sort_order      INT          NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shops_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Visit Info (icon: clock | car | wheelchair)
-- ---------------------------------------------------------------------
CREATE TABLE visit_info (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  icon        VARCHAR(30)  NOT NULL DEFAULT 'clock',
  title       VARCHAR(100) NOT NULL,
  detail      VARCHAR(255) NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  ลิงก์ใน Footer (group_key: quick = ลิงก์ด่วน | service = บริการของเรา | legal = แถบล่างสุด)
-- ---------------------------------------------------------------------
CREATE TABLE footer_links (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  group_key   VARCHAR(20)  NOT NULL,
  label       VARCHAR(100) NOT NULL,
  url         VARCHAR(255) NOT NULL DEFAULT '#',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================================
--  SAMPLE DATA  (แก้ไขเนื้อหาได้ภายหลัง)
-- =====================================================================
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name',           'Bon Marché',                                   'ชื่อเว็บไซต์'),
('tagline',             'Fresh • Healthy • Community',                  'สโลแกนใต้โลโก้'),
('hero_title_1',        'สุขภาพดี',                                      'Hero บรรทัด 1'),
('hero_title_2',        'เริ่มได้ที่นี่',                                   'Hero บรรทัด 2'),
('hero_subtitle',       'อาหารดี ของใช้ปลอดภัย\nเพื่อสุขภาพที่ยั่งยืน',        'Hero ข้อความรอง (\\n = ขึ้นบรรทัดใหม่)'),
('hero_badge',          'Open now',                                     'ป้ายสีส้มใน Hero'),
('hero_video_label',    'ชมวิดีโอแนะนำบอนมาร์เช่',                              'ข้อความปุ่มวิดีโอ'),
('hero_video_duration', '(1:00)',                                       'ความยาววิดีโอ'),
('hero_video_url',      '',                                             'ลิงก์วิดีโอ'),
('hero_image',          '/images/hero-banner.webp',   'รูปแบนเนอร์ Hero (2172×724) – ข้อความอยู่ในรูป'),
('visit_image',         '/images/visit-banner.webp',  'รูปแบนเนอร์ Visit Info (2172×724)'),
('visit_map_url',       'https://goo.gl/maps/oYkWq3kYKCFHew236', 'ลิงก์ปุ่ม ดูแผนที่ (เช่น Google Maps)'),
('leasing_image',       '/images/leasing-banner.webp','รูปแบนเนอร์ Let''s Grow (2172×724)'),
('leasing_url',         '#contact',                   'ลิงก์ปุ่มสีส้มในแบนเนอร์ผู้เช่า'),
('footer_image',        '/images/footer-bg.webp',     'พื้นหลัง Footer (2172×724)'),
('leasing_title',       'พื้นที่ให้เช่า ร้านค้า / ร้านอาหาร / คอมมูนิตี้สเปซ',        'หัวข้อแบนเนอร์ผู้เช่า'),
('leasing_text',        'พร้อมเปิดโอกาสให้ธุรกิจของคุณเติบโต\nไปกับสังคมที่ยั่งยืน และชุมชนของเรา', 'ข้อความแบนเนอร์ผู้เช่า'),
('leasing_button',      'สอบถามข้อมูลเพิ่มเติม',                               'ปุ่มแบนเนอร์ผู้เช่า'),
('address_title',       'บอง มาร์เช่ มาร์เก็ตพาร์ค',                          'ชื่อสถานที่ใน Footer'),
('address',             '105/1 ถ.เทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900', 'ที่อยู่'),
('opening_hours',       'ทุกวัน 05.00 – 22.00 น.',                           'เวลาทำการ (Footer)'),
('phone',               '02-953-8980',                                      'เบอร์โทร'),
('email',               'info@bonmarche.co.th',                             'อีเมล (ตัวอย่าง – เว็บจริงไม่ได้ระบุ)'),
('map_url',             'https://goo.gl/maps/oYkWq3kYKCFHew236',            'ลิงก์ Google Maps'),
('footer_description',  'ตลาดสดพรีเมียมและคอมมูนิตี้ย่านจตุจักร มาตรฐานตลาดระดับเพชร และรางวัล Bangkok Premium Market 2565 อาหารดี ของใช้ปลอดภัย เพื่อสุขภาพที่ยั่งยืน', 'คำอธิบายใต้โลโก้ใน Footer'),
('footer_slogan',       'สุขภาพดี เริ่มได้ที่นี่',                              'สโลแกนท้ายเว็บ'),
('copyright',           'Bon Marché Market Park. สงวนลิขสิทธิ์',               'ข้อความลิขสิทธิ์ (ปีใส่ให้อัตโนมัติ)'),
('facebook_url',        'https://www.facebook.com/bonmarche.marketpark', 'Facebook'),
('instagram_url',       'https://www.instagram.com/bonmarchemarket/',    'Instagram'),
('youtube_url',         '',                                              'YouTube (เว้นว่าง = ไม่แสดง)'),
('line_url',            'https://line.me/R/ti/p/@mzn5714l',              'LINE');

INSERT INTO nav_menus (id, parent_id, label, url, icon, description, has_dropdown, sort_order) VALUES
-- เมนูหลัก
(1,  NULL, 'หน้าแรก',            '#',        NULL, NULL, 0, 1),
(2,  NULL, 'Shop Directory',     '/shops',   NULL, NULL, 0, 3),
(3,  NULL, 'Blog',               '#blog',    NULL, NULL, 0, 4),
(4,  NULL, 'ร่วมธุรกิจกับเรา',      '#leasing', NULL, 'เช่าพื้นที่', 1, 2),
(5,  NULL, 'About Us',           '#about',   NULL, NULL, 0, 5),
(6,  NULL, 'Contact',            '#contact', NULL, NULL, 0, 6),
-- Dropdown "ร่วมธุรกิจกับเรา" → เช่าพื้นที่
(7,  4, 'ร้านค้า',             '#leasing', 'Store',        'เปิดร้านในตลาดและโซนอาหาร',      0, 1),
(8,  4, 'สำนักงาน',            '#leasing', 'Building',    'ออฟฟิศพร้อมใช้ ใจกลางชุมชน',      0, 2),
(9,  4, 'บูธชั่วคราว',          '#leasing', 'Tent',         'ออกบูธรายวัน / รายสัปดาห์',       0, 3),
(10, 4, 'บูธกิจกรรม',           '#leasing', 'PartyPopper',  'อีเวนต์ เปิดตัวสินค้า เวิร์กช็อป',     0, 4),
(11, 4, 'ห้องประชุม/สัมมนา',     '#leasing', 'Presentation', 'ห้องประชุม อบรม สัมมนา',          0, 5),
(12, 4, 'สื่อประชาสัมพันธ์',      '#leasing', 'Megaphone',    'ป้ายโฆษณา จอ LED และโซเชียล',    0, 6),
(13, 4, 'พื้นที่เก็บสินค้า',       '#leasing', 'Warehouse',    'คลังเก็บสินค้าใกล้ร้านคุณ',         0, 7);

INSERT INTO highlights (tag, title, subtitle, date_label, start_date, end_date, image_url, sort_order) VALUES
('อีเวนต์',   'Fresh & Healthy Salad', 'เมนูสุขภาพเพื่อคุณ', '12–14 ก.ย. 68', '2025-09-12', '2025-09-14', '/images/week-1.jpg', 1),
('โปรโมชั่น', 'Bon Café',              'กาแฟพรีเมียม ลดพิเศษ',    '12–15 ก.ย. 68', '2025-09-12', '2025-09-15', '/images/week-2.jpg', 2),
('อีเวนต์',   'Green Corner',          'ผักผลไม้ปลอดสารพิษ',      '13–14 ก.ย. 68', '2025-09-13', '2025-09-14', '/images/week-3.jpg', 3),
('โปรโมชั่น', 'Taste of Thailand',     'อาหารไทยต้นตำรับ',        '14–16 ก.ย. 68', '2025-09-14', '2025-09-16', '/images/week-4.jpg', 4),
('อีเวนต์',   'Wellness Shop',         'ผลิตภัณฑ์ดูแลสุขภาพ',      '15–17 ก.ย. 68', '2025-09-15', '2025-09-17', '/images/week-5.jpg', 5);

INSERT INTO categories (name, icon, color, sort_order) VALUES
('อาหาร & เครื่องดื่ม',  'utensils', 'orange', 1),
('ผักผลไม้\nของสด',     'salad',    'teal',   2),
('แฟชั่น & ไลฟ์สไตล์',  'bag',      'teal',   3),
('คาเฟ่ & ร้านอาหาร',   'coffee',   'teal', 4),
('สุขภาพ & ความงาม',   'heart',    'pink',   5),
('ของใช้ในบ้าน',        'gift',     'orange', 6),
('ดูดวง & โหราศาสตร์',  'sparkles', 'yellow', 7),
('แผนที่ & การเดินทาง', 'map',      'teal',   8);
UPDATE categories SET link = '#visit' WHERE name = 'แผนที่ & การเดินทาง';

INSERT INTO shop_zones (code, name, sort_order) VALUES
('A', 'โซน A · ตลาดสด', 1),
('B', 'โซน B · ฟู้ดคอร์ท', 2),
('C', 'โซน C · คาเฟ่ & เบเกอรี่', 3),
('D', 'โซน D · แฟชั่น & ไลฟ์สไตล์', 4),
('E', 'โซน E · สุขภาพ & บริการ', 5);

INSERT INTO shops (id, category_id, name, category_label, badge, is_new, is_featured, image_url, zone, unit_no, open_hours, phone, description, sort_order) VALUES
(1, 1, 'ข้าวมันไก่ไรรินทร์', 'ร้านอาหารไทยชื่อดัง', 'ร้านเด็ด', 1, 1, '/images/shop-1.jpg', 'B', 'B-03', '07:00-14:00', '02-953-8980 ต่อ 101', 'ข้าวมันไก่ต้มสูตรต้นตำรับ น้ำจิ้มเต้าเจี้ยวรสเข้ม หุงข้าวด้วยน้ำซุปไก่ทุกวัน', 1),
(2, 4, 'Maison Pâtisserie', 'เบเกอรี่ & ขนมหวาน', 'ร้านเปิดใหม่', 1, 1, '/images/shop-2.jpg', 'C', 'C-05', '08:00-20:00', '02-953-8980 ต่อ 102', 'เบเกอรี่สไตล์ฝรั่งเศส อบสดใหม่ทุกเช้า มัฟฟิน ครัวซองต์ และเค้กโฮมเมด', 2),
(3, 1, 'Green Day Smoothie', 'น้ำผลไม้ปั่นเพื่อสุขภาพ', 'ร้านเด็ด', 0, 1, '/images/shop-3.jpg', 'B', 'B-11', '09:00-21:00', '02-953-8980 ต่อ 103', 'สมูทตี้ผักผลไม้ปั่นสด ไม่ใส่น้ำตาล เลือกท็อปปิ้งเพื่อสุขภาพได้', 3),
(4, 3, 'Urban Style', 'แฟชั่น & ไลฟ์สไตล์', 'ร้านเปิดใหม่', 0, 1, '/images/shop-4.jpg', 'D', 'D-02', '10:00-21:00', '02-953-8980 ต่อ 104', 'เสื้อผ้าแฟชั่นสไตล์มินิมอล ใส่ได้ทุกวัน ทั้งผู้หญิงและผู้ชาย', 4),
(5, 1, 'Seafood Corner', 'อาหารทะเลสดใหม่', 'ร้านเด็ด', 0, 1, '/images/shop-5.jpg', 'A', 'A-08', '06:00-19:00', '02-953-8980 ต่อ 105', 'อาหารทะเลสดส่งตรงทุกเช้า หอย กุ้ง ปลา พร้อมบริการปรุงสุก', 5),
(6, 1, 'Fresh & Healthy Salad', 'สลัดและเมนูสุขภาพ', NULL, 0, 0, '/images/week-1.jpg', 'B', 'B-07', '09:00-20:00', '02-953-8980 ต่อ 106', 'สลัดผักออร์แกนิก อกไก่ย่าง และน้ำสลัดโฮมเมดแคลอรี่ต่ำ', 6),
(7, 4, 'Bon Café', 'กาแฟพรีเมียม', NULL, 0, 0, '/images/week-2.jpg', 'C', 'C-01', '07:00-21:00', '02-953-8980 ต่อ 107', 'กาแฟคั่วเองจากเมล็ดไทย ลาเต้อาร์ตทุกแก้ว มุมนั่งสบายรับลม', 7),
(8, 2, 'Green Corner', 'ผักผลไม้ปลอดสารพิษ', NULL, 0, 0, '/images/week-3.jpg', 'A', 'A-01', '05:00-18:00', '02-953-8980 ต่อ 108', 'ผักผลไม้ปลอดสารจากเกษตรกรเครือข่าย คัดสดใหม่ทุกวัน', 8),
(9, 1, 'Taste of Thailand', 'อาหารไทยต้นตำรับ', NULL, 0, 0, '/images/week-4.jpg', 'B', 'B-15', '10:00-21:00', '02-953-8980 ต่อ 109', 'อาหารไทยรสจัดจ้าน ปลาหมึกย่าง ส้มตำ ลาบ และกับข้าวพร้อมทาน', 9),
(10, 5, 'Wellness Shop', 'ผลิตภัณฑ์ดูแลสุขภาพ', NULL, 0, 0, '/images/week-5.jpg', 'E', 'E-04', '10:00-20:00', '02-953-8980 ต่อ 110', 'สกินแคร์และผลิตภัณฑ์ดูแลผิวจากธรรมชาติ อ่อนโยน ปลอดภัย', 10),
(11, 2, 'สวนผลไม้ป้าแดง', 'ผลไม้ตามฤดูกาล', NULL, 0, 0, NULL, 'A', 'A-05', '05:00-17:00', '02-953-8980 ต่อ 111', 'ผลไม้ตามฤดูกาลจากสวน ทุเรียน มังคุด มะม่วง หวานฉ่ำ', 11),
(12, 2, 'ปลาสดแม่กลอง', 'ปลาและอาหารทะเลสด', NULL, 0, 0, NULL, 'A', 'A-10', '05:00-14:00', '02-953-8980 ต่อ 112', 'ปลาทู ปลากะพง และอาหารทะเลสดจากแม่กลอง ขอดเกล็ดให้ฟรี', 12),
(13, 2, 'เขียงหมูลุงชัย', 'เนื้อสัตว์สดอนามัย', NULL, 0, 0, NULL, 'A', 'A-12', '05:00-13:00', '02-953-8980 ต่อ 113', 'เนื้อหมูสดจากฟาร์มมาตรฐาน ตัดแต่งตามสั่ง สะอาด ถูกหลักอนามัย', 13),
(14, 1, 'ก๋วยเตี๋ยวเรือป้าศรี', 'ก๋วยเตี๋ยวเรือ', NULL, 0, 0, NULL, 'B', 'B-20', '08:00-16:00', '02-953-8980 ต่อ 114', 'ก๋วยเตี๋ยวเรือน้ำตกสูตรโบราณ ชามเล็กอิ่มอร่อย', 14),
(15, 1, 'ขนมไทยแม่บุญ', 'ขนมไทยโบราณ', 'ร้านเด็ด', 0, 0, NULL, 'B', 'B-09', '07:00-18:00', '02-953-8980 ต่อ 115', 'ขนมชั้น ทองหยิบ ขนมตาล ทำสดทุกวันแบบดั้งเดิม', 15),
(16, 4, 'ชาหอม Tea House', 'ชาไทยและชาสมุนไพร', NULL, 0, 0, NULL, 'C', 'C-09', '09:00-20:00', '02-953-8980 ต่อ 116', 'ชาไทย ชาเขียว และชาสมุนไพรชงสด หอมกลมกล่อม', 16),
(17, 4, 'Ice-Cream Lab', 'ไอศกรีมโฮมเมด', 'ร้านเปิดใหม่', 1, 0, NULL, 'C', 'C-12', '11:00-21:00', '02-953-8980 ต่อ 117', 'ไอศกรีมโฮมเมดรสผลไม้ไทย ทำสดในร้านทุกวัน', 17),
(18, 3, 'Little Linen', 'เสื้อผ้าผ้าลินิน', NULL, 0, 0, NULL, 'D', 'D-06', '10:00-20:00', '02-953-8980 ต่อ 118', 'เสื้อผ้าผ้าลินินและผ้าฝ้าย ใส่สบาย เหมาะกับอากาศเมืองไทย', 18),
(19, 3, 'Sole Story', 'รองเท้าและกระเป๋า', 'ร้านเปิดใหม่', 1, 0, NULL, 'D', 'D-10', '10:00-21:00', '02-953-8980 ต่อ 119', 'รองเท้าและกระเป๋าดีไซน์เรียบหรู ราคาเป็นมิตร', 19),
(20, 5, 'สมุนไพรบ้านยาย', 'สมุนไพรไทย', NULL, 0, 0, NULL, 'E', 'E-02', '09:00-19:00', '02-953-8980 ต่อ 120', 'ยาดม ลูกประคบ และผลิตภัณฑ์สมุนไพรไทยสูตรดั้งเดิม', 20),
(21, 5, 'Glow Nail & Spa', 'ทำเล็บและสปา', 'ร้านเปิดใหม่', 1, 0, NULL, 'E', 'E-08', '10:00-20:00', '02-953-8980 ต่อ 121', 'ทำเล็บ สปามือเท้า และนวดผ่อนคลาย โดยช่างมืออาชีพ', 21),
(22, 6, 'Home & Living', 'ของใช้ในบ้าน', NULL, 0, 0, NULL, 'D', 'D-14', '10:00-20:00', '02-953-8980 ต่อ 122', 'ของแต่งบ้าน ภาชนะ และของใช้ในครัวดีไซน์สวย', 22),
(23, 6, 'Green Thumb', 'ต้นไม้และอุปกรณ์จัดสวน', NULL, 0, 0, NULL, 'D', 'D-16', '08:00-18:00', '02-953-8980 ต่อ 123', 'ต้นไม้ฟอกอากาศ ไม้มงคล กระถาง และอุปกรณ์จัดสวน', 23),
(24, 7, 'อาจารย์ทิพย์ ดูดวง', 'ดูดวงและโหราศาสตร์', NULL, 0, 0, NULL, 'E', 'E-12', '11:00-19:00', '02-953-8980 ต่อ 124', 'ดูดวงไพ่ยิปซี ลายมือ และฤกษ์มงคล', 24);

INSERT INTO visit_info (icon, title, detail, sort_order) VALUES
('clock',      'เวลาเปิด-ปิด',      'ทุกวัน 08.00 – 22.00 น.',        1),
('car',        'ที่จอดรถ',          'มากกว่า 500 คัน',               2),
('wheelchair', 'รถเข็นผู้สูงอายุ',    'บริการฟรีที่จุดประชาสัมพันธ์',      3);

INSERT INTO footer_links (group_key, label, url, sort_order) VALUES
('quick',   'หน้าแรก',                '#',         1),
('quick',   'เกี่ยวกับเรา',             '#about',    2),
('quick',   'ค้นหาร้านค้า',            '/shops',    3),
('quick',   'โปรโมชั่น',               '#events',   4),
('quick',   'กิจกรรม',                '#events',   5),
('quick',   'ข่าวสารและประกาศ',        '#news',     6),
('service', 'พื้นที่ให้เช่าร้านค้า',        '#contact',  1),
('service', 'ที่จอดรถกว่า 500 คัน',      '#visit',    2),
('service', 'รถเข็นผู้สูงอายุ (ฟรี)',      '#visit',    3),
('service', 'รถเข็นสัตว์เลี้ยง (ฟรี)',     '#visit',    4),
('service', 'ตลาดมาตรฐานระดับเพชร',     '#about',    5),
('service', 'ระบบผู้ประกอบการ',          'https://invoice.bonmarche.co.th/InvoiceSender/fe/#/', 6),
('legal',   'ข้อกำหนดการใช้งาน',        '#',         1),
('legal',   'นโยบายความเป็นส่วนตัว',     '#',         2),
('legal',   'นโยบายคุกกี้',             '#',         3),
('legal',   'แผนผังเว็บไซต์',           '#',         4);

-- (ทางเลือก) สร้าง user สำหรับแอป แทนการใช้ root
-- CREATE USER IF NOT EXISTS 'bonmarche'@'localhost' IDENTIFIED BY 'change_me';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bonmarche.* TO 'bonmarche'@'localhost';
-- FLUSH PRIVILEGES;

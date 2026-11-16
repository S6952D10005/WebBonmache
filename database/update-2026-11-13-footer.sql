-- =====================================================================
--  Bon Marché – อัปเดตฐานข้อมูลเดิม (ไม่ลบข้อมูลที่มีอยู่)
--  ใช้เมื่อเคยรัน bonmarche.sql ไปแล้ว: เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡)
--
--  สิ่งที่อัปเดต
--   1) สร้างตาราง footer_links (ลิงก์ใน Footer) พร้อมข้อมูลเริ่มต้น
--   2) ข้อมูลติดต่อจริงจาก bonmarche.co.th (ที่อยู่ เบอร์ เวลาทำการ โซเชียล แผนที่)
--   3) ข้อความแบนเนอร์ผู้เช่าให้ตรงกับรูป Let's Grow
--  (ต้องใช้ MySQL 8.0.19 ขึ้นไป)
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;

-- 1) footer_links -------------------------------------------------------
CREATE TABLE IF NOT EXISTS footer_links (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  group_key   VARCHAR(20)  NOT NULL COMMENT 'quick | service | legal',
  label       VARCHAR(100) NOT NULL,
  url         VARCHAR(255) NOT NULL DEFAULT '#',
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

DELETE FROM footer_links WHERE id > 0;
INSERT INTO footer_links (group_key, label, url, sort_order) VALUES
('quick',   'หน้าแรก',                '#',         1),
('quick',   'เกี่ยวกับเรา',             '#about',    2),
('quick',   'ค้นหาร้านค้า',            '#shops',    3),
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

-- 2) + 3) site_settings (เพิ่มใหม่ หรือแทนค่าเดิม) -------------------------
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('address_title',      'บอง มาร์เช่ มาร์เก็ตพาร์ค',                                   'ชื่อสถานที่ใน Footer'),
('address',            '105/1 ถ.เทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900', 'ที่อยู่'),
('opening_hours',      'ทุกวัน 05.00 – 22.00 น.',                                    'เวลาทำการ (Footer)'),
('phone',              '02-953-8980',                                               'เบอร์โทร'),
('email',              'info@bonmarche.co.th',                                      'อีเมล (ตัวอย่าง – เว็บจริงไม่ได้ระบุ)'),
('map_url',            'https://goo.gl/maps/oYkWq3kYKCFHew236',                     'ลิงก์ Google Maps'),
('visit_map_url',      'https://goo.gl/maps/oYkWq3kYKCFHew236',                     'ลิงก์ปุ่ม ดูแผนที่'),
('footer_description', 'ตลาดสดพรีเมียมและคอมมูนิตี้ย่านจตุจักร มาตรฐานตลาดระดับเพชร และรางวัล Bangkok Premium Market 2565 อาหารดี ของใช้ปลอดภัย เพื่อสุขภาพที่ยั่งยืน', 'คำอธิบายใต้โลโก้ใน Footer'),
('copyright',          'Bon Marché Market Park. สงวนลิขสิทธิ์',                        'ข้อความลิขสิทธิ์ (ปีใส่ให้อัตโนมัติ)'),
('facebook_url',       'https://www.facebook.com/bonmarche.marketpark',             'Facebook'),
('instagram_url',      'https://www.instagram.com/bonmarchemarket/',                'Instagram'),
('youtube_url',        '',                                                          'YouTube (เว้นว่าง = ไม่แสดง)'),
('line_url',           'https://line.me/R/ti/p/@mzn5714l',                          'LINE'),
('leasing_title',      'พื้นที่ให้เช่า ร้านค้า / ร้านอาหาร / คอมมูนิตี้สเปซ',               'หัวข้อแบนเนอร์ผู้เช่า'),
('leasing_text',       'พร้อมเปิดโอกาสให้ธุรกิจของคุณเติบโต\nไปกับสังคมที่ยั่งยืน และชุมชนของเรา', 'ข้อความแบนเนอร์ผู้เช่า'),
('leasing_button',     'สอบถามข้อมูลเพิ่มเติม',                                       'ปุ่มแบนเนอร์ผู้เช่า')
AS new_row
ON DUPLICATE KEY UPDATE setting_value = new_row.setting_value, description = new_row.description;

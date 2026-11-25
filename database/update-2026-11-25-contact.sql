-- =====================================================================
--  Bon Marché – ข้อมูลติดต่อให้ตรงกับหน้า "ติดต่อเรา" ของ bonmarche.co.th/contact
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้ ไม่มีผลเสีย
--  แก้เฉพาะตาราง site_settings (ข้อมูลติดต่อ) – ตารางอื่นไม่ถูกแตะ
--
--  ที่อยู่ / เวลาทำการ / เบอร์โทร / แผนที่ / Facebook / Instagram / LINE
--  ขึ้นใน footer ทุกหน้า (ส่วน "การเดินทาง" หน้าแรกใช้ข้อมูลชุดเดียวกันอยู่แล้ว)
--  (ต้องใช้ MySQL 8.0.19 ขึ้นไป)
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;

INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('address_title', 'บองมาร์เช่ มาร์เก็ตพาร์ค',                              'ชื่อสถานที่ใน Footer'),
('address',       '105/1 ถ.เทศบาลสงเคราะห์ ลาดยาว จตุจักร กรุงเทพ 10900', 'ที่อยู่'),
('opening_hours', 'วันจันทร์ – วันอาทิตย์ 05.00 – 22.00 น.',              'เวลาทำการ (Footer)'),
('phone',         '02-953-8980',                                         'เบอร์โทร'),
('map_url',       'https://goo.gl/maps/oYkWq3kYKCFHew236',               'ลิงก์ Google Maps'),
('visit_map_url', 'https://goo.gl/maps/oYkWq3kYKCFHew236',               'ลิงก์ปุ่ม ดูแผนที่'),
('facebook_url',  'https://www.facebook.com/bonmarche.marketpark/',      'Facebook'),
('instagram_url', 'https://www.instagram.com/bonmarchemarket/',          'Instagram'),
('line_url',      'https://line.me/R/ti/p/@mzn5714l',                    'LINE'),
('youtube_url',   '',                                                    'YouTube (เว้นว่าง = ไม่แสดง)')
AS new_row
ON DUPLICATE KEY UPDATE setting_value = new_row.setting_value, description = new_row.description;

-- ตรวจผล: ควรเห็นข้อมูลชุดใหม่ 10 แถว
SELECT setting_key, setting_value FROM site_settings
WHERE setting_key IN ('address_title', 'address', 'opening_hours', 'phone', 'map_url', 'visit_map_url',
                      'facebook_url', 'instagram_url', 'line_url', 'youtube_url');

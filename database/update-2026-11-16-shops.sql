-- =====================================================================
--  Bon Marché – หน้า Shop Directory (รายชื่อร้านค้าทั้งหมด)
--  ใช้เมื่อเคยรัน bonmarche.sql ไปแล้ว: เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡)
--  รันซ้ำได้ ไม่ลบข้อมูลเดิม (ต้องใช้ MySQL 8.0.19 ขึ้นไป)
--
--  สิ่งที่อัปเดต
--   1) ตาราง shops เพิ่มคอลัมน์: zone, unit_no, open_hours, phone, description
--   2) ตารางใหม่ shop_zones (ชื่อโซนในตลาด)
--   3) ร้านค้าตัวอย่าง 24 ร้าน (id 1–24 จะถูกเขียนทับด้วยข้อมูลชุดนี้)
--   4) เมนู Shop Directory และลิงก์ "ค้นหาร้านค้า" ใน Footer → หน้า /shops
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;

-- 1) เพิ่มคอลัมน์ (ข้ามถ้ามีอยู่แล้ว) -------------------------------------
DROP PROCEDURE IF EXISTS bm_add_column;
DELIMITER //
CREATE PROCEDURE bm_add_column(IN tbl VARCHAR(64), IN col VARCHAR(64), IN def TEXT)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col) THEN
    SET @sql = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col, ' ', def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL bm_add_column('shops', 'zone',        "VARCHAR(10)  NULL COMMENT 'รหัสโซน (shop_zones.code) เช่น A' AFTER link");
CALL bm_add_column('shops', 'unit_no',     "VARCHAR(20)  NULL COMMENT 'เลขล็อก เช่น A-08' AFTER zone");
CALL bm_add_column('shops', 'open_hours',  "VARCHAR(60)  NULL COMMENT 'เวลาเปิด-ปิด เช่น 08:00-20:00' AFTER unit_no");
CALL bm_add_column('shops', 'phone',       "VARCHAR(50)  NULL AFTER open_hours");
CALL bm_add_column('shops', 'description', "VARCHAR(500) NULL AFTER phone");
DROP PROCEDURE bm_add_column;

-- 2) โซน ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_zones (
  code        VARCHAR(10)  NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO shop_zones (code, name, sort_order) VALUES
('A', 'โซน A · ตลาดสด', 1),
('B', 'โซน B · ฟู้ดคอร์ท', 2),
('C', 'โซน C · คาเฟ่ & เบเกอรี่', 3),
('D', 'โซน D · แฟชั่น & ไลฟ์สไตล์', 4),
('E', 'โซน E · สุขภาพ & บริการ', 5)
AS new_row ON DUPLICATE KEY UPDATE name = new_row.name, sort_order = new_row.sort_order;

-- 3) ร้านค้า ----------------------------------------------------------------
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
(24, 7, 'อาจารย์ทิพย์ ดูดวง', 'ดูดวงและโหราศาสตร์', NULL, 0, 0, NULL, 'E', 'E-12', '11:00-19:00', '02-953-8980 ต่อ 124', 'ดูดวงไพ่ยิปซี ลายมือ และฤกษ์มงคล', 24)
AS new_row ON DUPLICATE KEY UPDATE
  category_id = new_row.category_id, name = new_row.name, category_label = new_row.category_label,
  badge = new_row.badge, is_new = new_row.is_new, is_featured = new_row.is_featured, image_url = new_row.image_url,
  zone = new_row.zone, unit_no = new_row.unit_no, open_hours = new_row.open_hours, phone = new_row.phone,
  description = new_row.description, sort_order = new_row.sort_order;

-- 4) ลิงก์ไปหน้า Shop Directory ---------------------------------------------
UPDATE nav_menus    SET url = '/shops' WHERE label = 'Shop Directory';
UPDATE footer_links SET url = '/shops' WHERE label = 'ค้นหาร้านค้า';
UPDATE categories   SET link = '#visit' WHERE name = 'แผนที่ & การเดินทาง';

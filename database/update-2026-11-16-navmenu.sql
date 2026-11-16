-- =====================================================================
--  Bon Marché – อัปเดตเมนูด้านบน (Nav bar) + Dropdown "ร่วมธุรกิจกับเรา"
--  ใช้เมื่อเคยรัน bonmarche.sql ไปแล้ว: เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡)
--  รันซ้ำได้ – สร้างตาราง nav_menus ใหม่ (ตารางนี้เก็บแค่เมนู ข้อมูลอื่นไม่ถูกแตะ)
--
--  เพิ่มคอลัมน์
--   parent_id   : NULL = เมนูหลัก / ใส่ id เมนูหลัก = เมนูย่อยใน Dropdown
--   icon        : ชื่อไอคอนของเมนูย่อย (Store, Building, Tent, PartyPopper,
--                 Presentation, Megaphone, Warehouse, …)
--   description : คำอธิบายสั้นใต้ชื่อเมนูย่อย
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS nav_menus;
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

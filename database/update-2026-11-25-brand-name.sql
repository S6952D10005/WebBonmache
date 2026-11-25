-- =====================================================================
--  Bon Marché – สะกดชื่อภาษาไทยให้ตรงกันทุกจุด: "บองมาร์เช่"
--  แก้ข้อความที่สะกดแบบเก่าในฐานข้อมูล:
--     บอนมาร์เช่  /  บอน มาร์เช่  /  บอง มาร์เช่   →   บองมาร์เช่
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้ ไม่มีผลเสีย
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;
SET @old_safe = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0; -- Workbench blocks UPDATE without a key column otherwise (Error 1175)

-- แทนคำทั้ง 3 แบบที่สะกดผิด ในทุกคอลัมน์ข้อความ
UPDATE site_settings
   SET setting_value = REPLACE(REPLACE(REPLACE(setting_value, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       description = REPLACE(REPLACE(REPLACE(description, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE nav_menus
   SET label = REPLACE(REPLACE(REPLACE(label, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       description = REPLACE(REPLACE(REPLACE(description, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE highlights
   SET tag = REPLACE(REPLACE(REPLACE(tag, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       title = REPLACE(REPLACE(REPLACE(title, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       subtitle = REPLACE(REPLACE(REPLACE(subtitle, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE categories
   SET name = REPLACE(REPLACE(REPLACE(name, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE shop_zones
   SET name = REPLACE(REPLACE(REPLACE(name, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE shops
   SET name = REPLACE(REPLACE(REPLACE(name, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       category_label = REPLACE(REPLACE(REPLACE(category_label, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       description = REPLACE(REPLACE(REPLACE(description, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE visit_info
   SET title = REPLACE(REPLACE(REPLACE(title, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่'),
       detail = REPLACE(REPLACE(REPLACE(detail, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');
UPDATE footer_links
   SET label = REPLACE(REPLACE(REPLACE(label, 'บอน มาร์เช่', 'บองมาร์เช่'), 'บอนมาร์เช่', 'บองมาร์เช่'), 'บอง มาร์เช่', 'บองมาร์เช่');

SET SQL_SAFE_UPDATES = @old_safe;

-- ตรวจผล: ควรไม่เหลือแถวไหนเลย
SELECT 'site_settings' AS tbl, setting_key AS id, setting_value AS text FROM site_settings
 WHERE setting_value LIKE '%บอนมาร์เช่%' OR setting_value LIKE '%บอน มาร์เช่%' OR setting_value LIKE '%บอง มาร์เช่%';

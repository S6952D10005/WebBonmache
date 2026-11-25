-- =====================================================================
--  Bon Marché – สะกดชื่อภาษาไทยให้ตรงกันทุกจุด: "บองมาร์เช่"
--  แก้ข้อความที่สะกดแบบเก่าในฐานข้อมูล:
--     บอนมาร์เช่  /  บอน มาร์เช่  /  บอง มาร์เช่   →   บองมาร์เช่
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้ ไม่มีผลเสีย
--  คอลัมน์ / ตารางที่ยังไม่มีในฐานข้อมูลของคุณจะถูกข้ามไปเอง (ไม่ error)
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;
SET @old_safe = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0; -- Workbench blocks UPDATE without a key column otherwise (Error 1175)

DROP PROCEDURE IF EXISTS bm_brand_fix;
DELIMITER //
-- แก้ 1 คอลัมน์ – ข้ามถ้าตาราง/คอลัมน์นั้นไม่มี
CREATE PROCEDURE bm_brand_fix(IN tbl VARCHAR(64), IN col VARCHAR(64))
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col) THEN
    SET @sql = CONCAT(
      'UPDATE `', tbl, '` SET `', col, '` = ',
      'REPLACE(REPLACE(REPLACE(`', col, '`, ''บอน มาร์เช่'', ''บองมาร์เช่''), ''บอนมาร์เช่'', ''บองมาร์เช่''), ''บอง มาร์เช่'', ''บองมาร์เช่'') ',
      'WHERE `', col, '` LIKE ''%มาร์เช่%''');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL bm_brand_fix('site_settings', 'setting_value');
CALL bm_brand_fix('site_settings', 'description');
CALL bm_brand_fix('nav_menus', 'label');
CALL bm_brand_fix('nav_menus', 'description');
CALL bm_brand_fix('highlights', 'tag');
CALL bm_brand_fix('highlights', 'title');
CALL bm_brand_fix('highlights', 'subtitle');
CALL bm_brand_fix('categories', 'name');
CALL bm_brand_fix('shop_zones', 'name');
CALL bm_brand_fix('shops', 'name');
CALL bm_brand_fix('shops', 'category_label');
CALL bm_brand_fix('shops', 'description');
CALL bm_brand_fix('visit_info', 'title');
CALL bm_brand_fix('visit_info', 'detail');
CALL bm_brand_fix('footer_links', 'label');

DROP PROCEDURE bm_brand_fix;
SET SQL_SAFE_UPDATES = @old_safe;

-- ตรวจผล: ควรไม่เหลือแถวไหนเลย
SELECT setting_key, setting_value FROM site_settings
 WHERE setting_value LIKE '%บอนมาร์เช่%' OR setting_value LIKE '%บอน มาร์เช่%' OR setting_value LIKE '%บอง มาร์เช่%';

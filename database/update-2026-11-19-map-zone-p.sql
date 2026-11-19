-- =====================================================================
--  Bon Marché – อาคารจอดรถเป็นโซนร้านค้า (กดที่อาคารในแผนที่ 3D ได้)
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้
--  ร้านในอาคารจอดรถ: แก้คอลัมน์ shops.zone เป็น 'P'
-- =====================================================================

INSERT INTO shop_zones (code, name, sort_order) VALUES
('P', 'อาคารจอดรถ', 11)
AS new_row
ON DUPLICATE KEY UPDATE name = new_row.name, sort_order = new_row.sort_order;

-- ตรวจผล
SELECT code, name, sort_order FROM shop_zones ORDER BY sort_order;

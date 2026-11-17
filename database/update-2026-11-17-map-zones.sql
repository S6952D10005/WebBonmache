-- =====================================================================
--  Bon Marché – โซนร้านค้า = อาคารในแบบ CAD (แผนที่ 3D หน้า Shop Directory)
--  ใช้หลังจากรัน update-2026-11-16-shops.sql แล้ว
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้ ไม่ย้ายร้านซ้ำ
--
--  สิ่งที่อัปเดต
--   1) ย้ายร้านจากโซนเดิม → อาคารใหม่ (พร้อมเลขล็อก เช่น B-03 → A-03)
--        A ตลาดสด      → MK ตลาด
--        B ฟู้ดคอร์ท    → A  อาคาร A
--        C คาเฟ่        → BC อาคาร B&C
--        D แฟชั่น       → E  อาคาร E
--        E สุขภาพ       → F  อาคาร F
--   2) ตาราง shop_zones = รายชื่ออาคาร (ตลาด, A, B&C, E, F, G, H)
--  หมายเหตุ: ถ้ารัน update-2026-11-16-shops.sql ซ้ำภายหลัง ให้รันไฟล์นี้ต่ออีกครั้ง
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;
SET @old_safe = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0; -- Workbench blocks UPDATE/DELETE without a key column otherwise (Error 1175)

-- 1) ย้ายร้าน – ทำเฉพาะตอนที่ยังเป็นโซนแบบเดิม (ยังไม่มีโซน MK) ----------------
UPDATE shops
SET unit_no = CASE
      WHEN unit_no LIKE '_-%' THEN CONCAT(CASE zone WHEN 'A' THEN 'MK' WHEN 'B' THEN 'A' WHEN 'C' THEN 'BC' WHEN 'D' THEN 'E' WHEN 'E' THEN 'F' END,
                                          SUBSTRING(unit_no, 2))
      ELSE unit_no
    END,
    zone = CASE zone WHEN 'A' THEN 'MK' WHEN 'B' THEN 'A' WHEN 'C' THEN 'BC' WHEN 'D' THEN 'E' WHEN 'E' THEN 'F' END
WHERE zone IN ('A', 'B', 'C', 'D', 'E')
  AND NOT EXISTS (SELECT 1 FROM shop_zones WHERE code = 'MK');

-- 2) รายชื่ออาคาร (โซน) -------------------------------------------------------
DELETE FROM shop_zones;
INSERT INTO shop_zones (code, name, sort_order) VALUES
('MK', 'ตลาด · ตลาดสด', 1),
('A',  'อาคาร A · ฟู้ดคอร์ท', 2),
('BC', 'อาคาร B&C · คาเฟ่ & เบเกอรี่', 3),
('E',  'อาคาร E · แฟชั่น & ไลฟ์สไตล์', 4),
('F',  'อาคาร F · สุขภาพ & บริการ', 5),
('G',  'อาคาร G', 6),
('H',  'อาคาร H', 7);

SET SQL_SAFE_UPDATES = @old_safe;

-- ตรวจผล
SELECT zone, COUNT(*) AS shops FROM shops GROUP BY zone ORDER BY zone;

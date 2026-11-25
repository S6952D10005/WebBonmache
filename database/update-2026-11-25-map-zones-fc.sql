-- =====================================================================
--  Bon Marché – โซนบนแผนที่ 3D ตามแบบแปลน CAD 1:250 (หน้า Shop Directory)
--  ใช้หลังจากรัน update-2026-11-17-map-zones.sql และ update-2026-11-19-*.sql แล้ว
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้
--
--  สิ่งที่อัปเดต (ตาราง shop_zones เท่านั้น ไม่ย้ายร้าน)
--   A  = เปลี่ยนชื่อเป็น "อาคาร A" (เดิม "อาคาร A · ฟู้ดคอร์ท" – ฟู้ดคอร์ทย้ายไปเป็นโซน FC)
--   FC = FOOD COURT (โซนใหม่ ลานอาหารระหว่างอาคาร E กับตลาด)
--   J  = อาคาร J (ร้าน Starbucks ริมสระน้ำ)
--   K  = อาคาร K (ข้างลานจอดรถฝั่งตะวันออก)
--   D  = อาคาร D (อาคารแนวเฉียงทางขวาของอาคาร N – ในแบบแปลนไม่มีป้ายชื่อ)
--  ร้านในโซนเหล่านี้: แก้คอลัมน์ shops.zone เป็น 'FC' / 'J' / 'K' / 'D'
-- =====================================================================

INSERT INTO shop_zones (code, name, sort_order) VALUES
('A',  'อาคาร A', 2),
('FC', 'FOOD COURT · ศูนย์อาหาร', 2),
('D',  'อาคาร D', 8),
('J',  'อาคาร J', 12),
('K',  'อาคาร K', 13)
AS new_row
ON DUPLICATE KEY UPDATE name = new_row.name, sort_order = new_row.sort_order;

-- ตรวจผล
SELECT code, name, sort_order FROM shop_zones ORDER BY sort_order;

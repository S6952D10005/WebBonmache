-- =====================================================================
--  Bon Marché – โซนร้านค้าใหม่จากแบบ CAD ชุดใหม่: อาคาร D, อาคาร M, อาคาร N
--  ใช้หลังจากรัน update-2026-11-17-map-zones.sql แล้ว
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้
--
--  อาคาร D = อาคารสูงแนวยาวด้านเหนือของอาคารจอดรถ
--  อาคาร M = อาคารฝั่งตะวันออก ข้างลานจอดรถ (ติดอาคาร H)
--  อาคาร N = อาคารแนวเฉียงด้านเหนือสุด
--  ยังไม่มีร้านในโซนเหล่านี้ – ย้ายร้านเข้าโซนได้โดยแก้คอลัมน์ shops.zone เป็น 'D' / 'M' / 'N'
-- =====================================================================

INSERT INTO shop_zones (code, name, sort_order) VALUES
('D', 'อาคาร D', 8),
('M', 'อาคาร M', 9),
('N', 'อาคาร N', 10)
AS new_row
ON DUPLICATE KEY UPDATE name = new_row.name, sort_order = new_row.sort_order;

-- ตรวจผล
SELECT code, name, sort_order FROM shop_zones ORDER BY sort_order;

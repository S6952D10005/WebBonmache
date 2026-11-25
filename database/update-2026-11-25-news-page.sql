-- =====================================================================
--  Bon Marché – ลิงก์ "ข่าวสารและประกาศ" ใน Footer ไปหน้าข่าวทั้งหมด (/news)
--  ใช้เมื่อเคยรัน bonmarche.sql ไปแล้ว: เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡)
--  รันซ้ำได้ ไม่มีผลเสีย
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;
SET @old_safe = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0; -- Workbench blocks UPDATE without a key column otherwise (Error 1175)

UPDATE footer_links SET url = '/news' WHERE label = 'ข่าวสารและประกาศ' AND url = '#news';

SET SQL_SAFE_UPDATES = @old_safe;

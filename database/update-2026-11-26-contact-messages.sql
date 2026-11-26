-- =====================================================================
--  Bon Marché – ตารางเก็บข้อความจากฟอร์ม "ส่งข้อความถึงเรา" (หน้า Contact /contact)
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้ ไม่มีผลเสีย
--  สร้างตารางใหม่ contact_messages เท่านั้น – ตารางอื่นไม่ถูกแตะ
--
--  ก่อนรันไฟล์นี้ ฟอร์มจะแจ้งผู้ส่งว่า "ส่งไม่สำเร็จ" และแนะนำให้โทร / ทัก LINE แทน
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,                -- ชื่อผู้ติดต่อ
  contact     VARCHAR(120) NOT NULL,                -- เบอร์โทร หรือ อีเมล สำหรับติดต่อกลับ
  topic       VARCHAR(60)  NOT NULL DEFAULT '',     -- เรื่องที่ติดต่อ
  message     TEXT         NOT NULL,                -- ข้อความ
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,      -- 1 = อ่าน / ติดต่อกลับแล้ว
  ip          VARCHAR(45)  NOT NULL DEFAULT '',
  user_agent  VARCHAR(255) NOT NULL DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตรวจผล: ควรเห็นตาราง contact_messages (ยังว่าง)
SHOW TABLES LIKE 'contact_messages';

-- ---------------------------------------------------------------------
--  ดูข้อความล่าสุด (ใช้ได้ทุกเมื่อ)
--    SELECT id, created_at, name, contact, topic, message, is_read
--    FROM contact_messages ORDER BY id DESC LIMIT 50;
--  ทำเครื่องหมายว่าอ่านแล้ว
--    UPDATE contact_messages SET is_read = 1 WHERE id = 1;
-- ---------------------------------------------------------------------

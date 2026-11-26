-- =====================================================================
--  Bon Marché – แก้ที่อยู่ตลาดในฐานข้อมูลให้ถูกต้อง
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้
--
--  ตอนนี้ฐานข้อมูลเก็บที่อยู่เป็น "123 ถนนสุขุมวิท แขวงคลองเตย ..." (ค่าตัวอย่าง)
--  ไฟล์นี้เปลี่ยนเป็นที่อยู่จริงของบองมาร์เช่ ซึ่งขึ้นใน footer และส่วนแผนที่ (การเดินทาง) ในหน้าแรก
--
--  เวลาเปิด-ปิด (opening_hours) ไม่ได้แก้ในไฟล์นี้ – ถ้าต้องการเปลี่ยน ให้ลบ -- หน้าบรรทัดล่างสุดแล้วแก้เวลา
-- =====================================================================

INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('address_title', 'บองมาร์เช่ มาร์เก็ตพาร์ค',                                   'ชื่อสถานที่ใน Footer'),
('address',       '105 ถนน เทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900', 'ที่อยู่')
AS new_row
ON DUPLICATE KEY UPDATE setting_value = new_row.setting_value, description = new_row.description;

-- UPDATE site_settings SET setting_value = 'ทุกวัน 08.00 – 22.00 น.' WHERE setting_key = 'opening_hours';

-- ตรวจผล
SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('address_title', 'address', 'opening_hours', 'phone');

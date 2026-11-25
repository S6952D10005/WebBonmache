-- =====================================================================
--  Bon Marché – ร้านค้าจริงในหน้า Shop Directory (แทนร้านตัวอย่างทั้งหมด)
--  ใช้หลังจากรัน update-2026-11-16-shops.sql, update-2026-11-17-map-zones.sql
--  และ update-2026-11-25-map-zones-fc.sql แล้ว
--  เปิดไฟล์นี้ใน MySQL Workbench แล้วกด Execute (⚡) – รันซ้ำได้
--
--  สิ่งที่อัปเดต
--   1) ตาราง shops เพิ่มคอลัมน์ logo_url (โลโก้ร้าน), gallery (รูปร้าน คั่นด้วย ,), facebook, instagram
--   2) หมวดใหม่ id 9 "บริการ & การศึกษา" (ใช้ในหน้า Shop Directory เท่านั้น)
--   3) โซนใหม่ SW = ซุ้มทางเดิน, RN = โซนปรับปรุง
--   4) ลบร้านตัวอย่าง แล้วใส่ร้านจริง 37 ร้าน (รูปอยู่ที่ client/public/images/shops, โลโก้ที่ images/brands)
--      ชื่อ เลขล็อก เวลาเปิด-ปิด เบอร์โทร สโลแกน Facebook / Instagram มาจาก Social_Media_Directory.xlsx
-- =====================================================================
USE bonmarche;
SET NAMES utf8mb4;
SET @old_safe = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0; -- Workbench blocks DELETE without a key column otherwise (Error 1175)

-- 1) คอลัมน์ใหม่ – ข้ามถ้ามีอยู่แล้ว ---------------------------------------------
DROP PROCEDURE IF EXISTS bm_add_column;
DELIMITER //
CREATE PROCEDURE bm_add_column(IN tbl VARCHAR(64), IN col VARCHAR(64), IN def VARCHAR(255))
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;
CALL bm_add_column('shops', 'logo_url', 'VARCHAR(255) NULL AFTER image_url');
CALL bm_add_column('shops', 'gallery', 'TEXT NULL AFTER logo_url');
CALL bm_add_column('shops', 'facebook', 'VARCHAR(255) NULL AFTER phone');
CALL bm_add_column('shops', 'instagram', 'VARCHAR(255) NULL AFTER facebook');
DROP PROCEDURE bm_add_column;

-- 2) หมวด บริการ & การศึกษา ---------------------------------------------------
INSERT INTO categories (id, name, icon, color, sort_order) VALUES
(9, 'บริการ & การศึกษา', 'service', 'teal', 9)
AS new_row
ON DUPLICATE KEY UPDATE name = new_row.name, icon = new_row.icon, color = new_row.color, sort_order = new_row.sort_order;

-- 3) โซน ----------------------------------------------------------------------
INSERT INTO shop_zones (code, name, sort_order) VALUES
('SW', 'ซุ้มทางเดิน', 14),
('RN', 'โซนปรับปรุง', 15)
AS new_row
ON DUPLICATE KEY UPDATE name = new_row.name, sort_order = new_row.sort_order;

-- 4) ร้านจริง -----------------------------------------------------------------
DELETE FROM shops;
INSERT INTO shops (id, category_id, name, category_label, image_url, logo_url, gallery, zone, unit_no, open_hours, phone, facebook, instagram, description, sort_order) VALUES
(1, 4, 'Starbucks', 'กาแฟและเครื่องดื่ม', '/images/shops/starbucks-3.webp', '/images/brands/starbucks.webp', '/images/shops/starbucks-1.webp,/images/shops/starbucks-2.webp,/images/shops/starbucks-3.webp', 'J', 'J101', '06:30-19:00', '092-259-0174', 'https://www.facebook.com/share/1VmHzNQY8U/', 'https://www.instagram.com/starbucksthailand', 'It''s not just coffee. It''s Starbucks.', 1),
(2, 1, 'Dairy Queen', 'ไอศกรีม', '/images/shops/dairy-queen-1.webp', '/images/brands/dairy-queen.webp', '/images/shops/dairy-queen-1.webp', 'G', 'G106', '09:00-17:00', '081-982-7337', 'https://www.facebook.com/share/1JFac578kg/', NULL, 'Happy Tastes Good', 2),
(3, 2, 'Tops', 'ซูเปอร์มาร์เก็ต', '/images/shops/tops-1.webp', '/images/brands/tops.webp', '/images/shops/tops-1.webp,/images/shops/tops-2.webp', 'BC', 'C101', '08:00-22:00', '02-953-8014', 'https://www.facebook.com/share/19JxX2Awvh/', 'https://www.instagram.com/topsthailand', 'Every Day DISCOVERY | ค้นพบทุกวันที่ไม่ธรรมดา', 3),
(4, 1, 'Chester''s Grill', 'ไก่ย่างและข้าวจานเดียว', '/images/shops/chesters-2.webp', '/images/brands/chesters.webp', '/images/shops/chesters-1.webp,/images/shops/chesters-2.webp,/images/shops/chesters-3.webp', 'E', 'E105/2', '08:00-20:00', '082-005-6803', 'https://www.facebook.com/share/18JEM2U6AH/', 'https://www.instagram.com/chesters_official', 'Good Food Good Mood', 4),
(5, 4, 'Jones'' Salad', 'สลัดและอาหารสุขภาพ', '/images/shops/jones-salad-1.webp', '/images/brands/jones-salad.webp', '/images/shops/jones-salad-1.webp,/images/shops/jones-salad-2.webp,/images/shops/jones-salad-3.webp', 'RN', 'ป.19', '08:00-21:00', '094-555-3764', 'https://www.facebook.com/share/19omuweGxN/', 'https://www.instagram.com/jonessalad', 'เฮลท์ตี้กว่า อร่อยกว่า คุ้มค่ากว่า', 5),
(6, 1, 'Yoguruto', 'เครื่องดื่มโยเกิร์ต', '/images/shops/yoguruto-1.webp', '/images/brands/yoguruto.webp', '/images/shops/yoguruto-1.webp,/images/shops/yoguruto-2.webp', 'G', 'G105', '08:00-17:00', '093-146-9154', 'https://www.facebook.com/share/1KLfMtzrvB/', NULL, 'Happiness in a cup — your everyday Yoguruto', 6),
(7, 4, 'Shaho Roti', 'ชาชักและโรตี', '/images/shops/shaho-roti-3.webp', '/images/brands/shaho-roti.webp', '/images/shops/shaho-roti-1.webp,/images/shops/shaho-roti-2.webp,/images/shops/shaho-roti-3.webp', 'RN', 'ป.4', NULL, '098-539-1800', 'https://www.facebook.com/share/1GEchWEDo6/', 'https://www.instagram.com/shaho.roti', 'ชาไทย ชาชัก และโรตีสไตล์ใต้', 7),
(8, 1, 'ช.เส้นคลุกประทัดลม', 'เส้นคลุก', '/images/shops/pratad-lom-noodles-1.webp', '/images/brands/pratad-lom-noodles.webp', '/images/shops/pratad-lom-noodles-1.webp,/images/shops/pratad-lom-noodles-2.webp,/images/shops/pratad-lom-noodles-3.webp', 'RN', 'ป.1', '10:00-20:00', '064-514-2966', 'https://www.facebook.com/share/19tzDCZxdy/', 'https://www.instagram.com/pratadlom_noodle', 'พร้อมเสิร์ฟเมนูอร่อยสไตล์คลาสสิก ที่ผสานรสชาติต้นตำรับกับความแปลกใหม่อย่างลงตัว', 8),
(9, 1, 'ก๋วยเตี๋ยวเรือชามโต', 'ก๋วยเตี๋ยวเรือ', '/images/shops/chamto-2.webp', '/images/brands/chamto.webp', '/images/shops/chamto-1.webp,/images/shops/chamto-2.webp,/images/shops/chamto-3.webp,/images/shops/chamto-4.webp', 'E', 'E102/1', '08:30-18:00', '098-159-9008', 'https://www.facebook.com/share/1MqyGjjqc4/', NULL, 'ก๋วยเตี๋ยวเรือพรีเมียม รสเด็ดเข้มข้นหอมกลิ่นเครื่องเทศ', 9),
(10, 4, 'Salada', 'อาหารสุขภาพ', '/images/shops/salada-2.webp', '/images/brands/salada.webp', '/images/shops/salada-1.webp,/images/shops/salada-2.webp,/images/shops/salada-3.webp', 'E', 'E103', '09:00-18:30', '080-221-9490', 'https://www.facebook.com/share/19rLHfQiPG/', NULL, 'อร่อยทุกคำ สุขภาพดีทุกวัน', 10),
(11, 1, 'แอน ก๋วยเตี๋ยวคั่วไก่', 'ก๋วยเตี๋ยวคั่วไก่', '/images/shops/ann-guay-tiew-kua-gai-1.webp', '/images/brands/ann-guay-tiew-kua-gai.webp', '/images/shops/ann-guay-tiew-kua-gai-1.webp,/images/shops/ann-guay-tiew-kua-gai-2.webp,/images/shops/ann-guay-tiew-kua-gai-3.webp', 'FC', 'อ.5', '08:00-16:00', '064-585-2135', 'https://www.facebook.com/share/19a61ubWiv/', 'https://www.instagram.com/annkuagai.bkk', 'ก๋วยเตี๋ยวคั่วไก่เตาถ่านสูตรต้นตำรับกว่า 70 ปี มิชลิน 6 ปีซ้อน', 11),
(12, 1, 'ราดหน้า ๙ ยอด (นายลภ)', 'ราดหน้า', '/images/shops/radna-9-yod-1.webp', '/images/brands/radna-9-yod.webp', '/images/shops/radna-9-yod-1.webp,/images/shops/radna-9-yod-2.webp,/images/shops/radna-9-yod-3.webp,/images/shops/radna-9-yod-4.webp', 'FC', 'อ.8', '08:00-14:00', '098-830-8851', 'https://www.facebook.com/share/1F569YAqH1/', NULL, 'ราดหน้าทะเล ราดหน้าหมี่กรอบ และเมนูเส้น', 12),
(13, 1, 'ถั่วบางนรา', 'ขนมและของฝาก', '/images/shops/tua-bang-nara-1.webp', '/images/brands/tua-bang-nara.webp', '/images/shops/tua-bang-nara-1.webp,/images/shops/tua-bang-nara-2.webp', 'SW', 'ซ.6', '08:00-17:00', '063-589-9879', 'https://www.facebook.com/share/19trTKeSPJ/', 'https://www.instagram.com/bangnarashop', 'ถั่วทอดสูตรต้นตำรับกว่า 100 ปี แป้งบางกรอบ ยิ่งแช่เย็นยิ่งอร่อย', 13),
(14, 1, 'แม่รัญจวน ขนมครกโบราณ น้ำกะทิ', 'ขนมครก', '/images/shops/mae-ranjuan-2.webp', '/images/brands/mae-ranjuan.webp', '/images/shops/mae-ranjuan-1.webp,/images/shops/mae-ranjuan-2.webp,/images/shops/mae-ranjuan-3.webp', 'MK', 'ต.118', '07:00-16:30', '063-932-6591', 'https://www.facebook.com/share/14yBPiKFTNJ/', NULL, 'คิดถึงขนมครก คิดถึงแม่รัญจวน', 14),
(15, 1, 'เสน่ห์จันทร์', 'ขนมและของฝาก', '/images/shops/sanaejunn-3.webp', '/images/brands/sanaejunn.webp', '/images/shops/sanaejunn-1.webp,/images/shops/sanaejunn-2.webp,/images/shops/sanaejunn-3.webp', 'MK', 'ต.21, 23-26', '07:00-16:00', '081-482-7072', 'https://www.facebook.com/share/1DXjEYJqyx/', NULL, 'เสน่ห์จันทร์คัดสรรความอร่อยด้วยความใส่ใจ เพื่อส่งต่อความสุขในทุกคำที่คุณได้ลิ้มลอง', 15),
(16, 6, 'บ้านมหาบัณฑิต', 'ของใช้และของฝาก', '/images/shops/baan-mahabundit-3.webp', '/images/brands/baan-mahabundit.webp', '/images/shops/baan-mahabundit-1.webp,/images/shops/baan-mahabundit-2.webp,/images/shops/baan-mahabundit-3.webp', 'MK', 'ต.101-106', '09:00-20:00', '062-826-4965', 'https://www.facebook.com/share/19monVvNo1/', NULL, 'ร้านขายสินค้านำเข้า ขนมญี่ปุ่น เอนจอยได้ทั้งครอบครัว มีสาขาเดียว', 16),
(17, 3, 'PRYYA', 'เครื่องประดับ', '/images/shops/pryya-2.webp', '/images/brands/pryya.webp', '/images/shops/pryya-1.webp,/images/shops/pryya-2.webp,/images/shops/pryya-3.webp', 'A', 'A116-121, 127-129', '10:00-17:00', '098-224-9265', 'https://www.facebook.com/share/1LCovjy6ns/', 'https://www.instagram.com/pryya_finejewellery', 'PRYYA, You’re a gem. Discover the jewel in you.', 17),
(18, 3, 'Madame Pearl', 'ไข่มุกและเครื่องประดับ', '/images/shops/madame-pearl-2.webp', '/images/brands/madame-pearl.webp', '/images/shops/madame-pearl-1.webp,/images/shops/madame-pearl-2.webp,/images/shops/madame-pearl-3.webp', 'A', 'A177-178', '11:00-16:00', '081-909-3395', 'https://www.facebook.com/share/1KBswuVpD6/', 'https://www.instagram.com/madamepearl', 'นำเข้าไข่มุกจากญี่ปุ่นเพื่อคุณ (We import pearl from Japan for you.)', 18),
(19, 3, 'Soulmate', 'กระเป๋าแบรนด์เนม', '/images/shops/soulmate-1.webp', '/images/brands/soulmate.webp', '/images/shops/soulmate-1.webp,/images/shops/soulmate-2.webp,/images/shops/soulmate-3.webp', 'BC', 'B143, 166', '10:00-17:00', '081-424-5888', 'https://www.facebook.com/share/19rNjWwDHJ/', 'https://www.instagram.com/soulmate_brandname', 'จำหน่ายและรับพรีออเดอร์กระเป๋าแบรนด์เนม ส่งฟรี EMS หรือนัดรับในกรุงเทพฯ', 19),
(20, 3, 'CHAAUM', 'กระเป๋าและสินค้าดีไซน์', '/images/shops/chaaum-3.webp', '/images/brands/chaaum.webp', '/images/shops/chaaum-1.webp,/images/shops/chaaum-2.webp,/images/shops/chaaum-3.webp', 'D', 'D103', '10:00-16:00', '084-268-7071', 'https://www.facebook.com/share/1Cz33FJfFU/', 'https://www.instagram.com/chaaumstudio', 'สินค้า CHAAUM คือการเปลี่ยนวัสดุไร้ค่า กลับมาคืนชีวิตใหม่ในรูปแบบกระเป๋า สไตล์รักษ์โลก', 20),
(21, 4, 'Wolf Croissant', 'คาเฟ่และเบเกอรี่', '/images/shops/wolf-1.webp', '/images/brands/wolf.webp', '/images/shops/wolf-1.webp,/images/shops/wolf-2.webp,/images/shops/wolf-3.webp', 'G', 'G107-108', '07:00-18:00', '086-556-5554', 'https://www.facebook.com/share/1ENHuZBDnc/', 'https://www.instagram.com/wolfcroissanterie', 'Smelling good, sipping better, and biting best. That''s the Wolf lifestyle.', 21),
(22, 5, 'ร้านศรียา', 'ร้านขายยา', '/images/shops/sriya-pharmacy-3.webp', '/images/brands/sriya-pharmacy.webp', '/images/shops/sriya-pharmacy-1.webp,/images/shops/sriya-pharmacy-2.webp,/images/shops/sriya-pharmacy-3.webp', 'A', 'A137', '08:30-17:00', '088-269-9746', 'https://www.facebook.com/share/1AErWsA2pb/', NULL, 'ยา อาหารเสริม วิตามิน โดยเภสัชกรทุกวัน', 22),
(23, 5, 'MOS Dental Clinic', 'คลินิกทันตกรรม', '/images/shops/mos-dental-clinic-3.webp', '/images/brands/mos-dental-clinic.webp', '/images/shops/mos-dental-clinic-1.webp,/images/shops/mos-dental-clinic-2.webp,/images/shops/mos-dental-clinic-3.webp', 'H', 'H202', '10:00-20:00', '095-964-0057', 'https://www.facebook.com/share/19qXu1zoNp/', NULL, 'Miracle of Smile', 23),
(24, 9, 'ELITE', 'สถาบันสอนภาษา', '/images/shops/elite-2.webp', '/images/brands/elite.webp', '/images/shops/elite-1.webp,/images/shops/elite-2.webp,/images/shops/elite-3.webp', 'F', 'F101-104', '10:00-18:00', '093-619-1462', 'https://www.facebook.com/elitetraininginstitute/', NULL, 'English for Life', 24),
(25, 9, 'BWK International', 'แนะแนวเรียนต่อต่างประเทศ', '/images/shops/bwk-international-2.webp', '/images/brands/bwk-international.webp', '/images/shops/bwk-international-1.webp,/images/shops/bwk-international-2.webp,/images/shops/bwk-international-3.webp', 'F', 'F206', '09:00-17:00', '084-669-9519', 'https://www.facebook.com/share/19z3Ci8syT/', NULL, 'เปิดโลกทัศน์ เรียนรู้วัฒนธรรม พัฒนาภาษา สร้างมิตรภาพระดับนานาชาติ', 25),
(26, 5, 'De Loop', 'ร้านทำผม', '/images/shops/de-loop-2.webp', '/images/brands/de-loop.webp', '/images/shops/de-loop-1.webp,/images/shops/de-loop-2.webp,/images/shops/de-loop-3.webp', 'F', 'F201-203', '10:00-20:00', '088-949-1456', 'https://www.facebook.com/deloopbybellamay/', 'https://www.instagram.com/deloop_by_bellamay', 'De Loop – สวย สุขภาพดี มีสไตล์ในแบบของคุณ', 26),
(27, 9, 'BYD', 'โชว์รูมรถยนต์', '/images/brands/byd.webp', '/images/brands/byd.webp', NULL, 'H', 'H101', '08:00-18:00', '083-117-8176', 'https://www.facebook.com/BYDHiclassBonMarche/', NULL, 'Build Your Dreams', 27),
(28, 9, 'Infinity Carwash', 'คาร์แคร์', '/images/shops/infinity-carwash-2.webp', '/images/brands/infinity-carwash.webp', '/images/shops/infinity-carwash-1.webp,/images/shops/infinity-carwash-2.webp,/images/shops/infinity-carwash-3.webp', 'N', 'N101', '08:00-18:00', '096-789-8969', 'https://www.facebook.com/p/Infinity-Car-Wash-Detailing-61582504019862/', NULL, 'ให้รถของคุณสะอาดเหมือนใหม่ทุกมุม', 28),
(29, 7, 'Namyen Amethyst', 'หินมงคลและพระพุทธรูป', '/images/shops/namyen-amethyst-1.webp', NULL, '/images/shops/namyen-amethyst-1.webp,/images/shops/namyen-amethyst-2.webp,/images/shops/namyen-amethyst-3.webp', 'D', 'D101/1', '08:30-20:30', '099-159-6454', 'https://www.facebook.com/share/1VWxAh8B29/', NULL, 'หินสี พลอยสี คุณภาพ เกรด Premium', 29),
(30, 3, 'Chanya & Beyond', 'รองเท้า', '/images/shops/chanya-beyond-1.webp', NULL, '/images/shops/chanya-beyond-1.webp,/images/shops/chanya-beyond-2.webp,/images/shops/chanya-beyond-3.webp', 'BC', 'B147, 162', '10:30-17:00', '081-642-5894', 'https://www.facebook.com/share/1DvPc42UHJ/', NULL, 'รองเท้าหนังแกะแท้เพื่อสุขภาพ ใส่นุ่มสบายเท้าตั้งแต่ครั้งแรกที่ได้ลอง', 30),
(31, 3, 'Bangkok Ragcie', 'เสื้อผ้า', '/images/shops/shop-b206-3.webp', NULL, '/images/shops/shop-b206-1.webp,/images/shops/shop-b206-2.webp,/images/shops/shop-b206-3.webp', 'BC', 'B206, 231', '09:00-17:00', '064-456-6951', 'https://www.facebook.com/share/1HSSdSY86J/', 'https://www.instagram.com/bangkok_rag_cie', 'Original by BangkokRagCie', 31),
(32, 3, 'Natpassorn', 'เสื้อผ้า', '/images/shops/baroque-natpassorn-1.webp', NULL, '/images/shops/baroque-natpassorn-1.webp,/images/shops/baroque-natpassorn-2.webp', 'BC', 'C113', '10:00-17:00', '081-462-4998', 'https://www.facebook.com/share/1B71YKJ26w/', NULL, 'จำหน่ายเสื้อผ้าสตรี ชุดผ้าอินเดีย ชุดโบฮีเมียน ชุดหลากสี กระเป๋า นำเข้าจากอินเดียเกรดพรีเมียม', 32),
(33, 3, 'มณีรัตน์ ไหมไทย', 'ผ้าไหมไทย', '/images/shops/shop-c127-1.webp', NULL, '/images/shops/shop-c127-1.webp,/images/shops/shop-c127-2.webp,/images/shops/shop-c127-3.webp', 'BC', 'C127-128', '10:00-18:00', '081-875-5494', 'https://www.facebook.com/share/1L6EEZijWx/', NULL, 'จำหน่ายผ้าไหมศิลปาชีพ ไหมยกดอกลำพูน ไหมทอมือพื้น ฯลฯ', 33),
(34, 1, 'ข้าวมันไก่ซั่งไห่', 'ข้าวมันไก่และติ่มซำ', '/images/shops/sang-hai-3.webp', NULL, '/images/shops/sang-hai-1.webp,/images/shops/sang-hai-2.webp,/images/shops/sang-hai-3.webp', 'FC', 'อ.5', '08:00-18:00', '065-510-4656', 'https://www.facebook.com/share/1bZyFtFzQ9/', 'https://www.instagram.com/shanghai.cuisine', 'อิ่มเต็มคำ ตำรับเซี่ยงไฮ้', 34),
(35, 1, 'April''s Bakery', 'เบเกอรี่', '/images/shops/aprils-bakery-3.webp', NULL, '/images/shops/aprils-bakery-1.webp,/images/shops/aprils-bakery-2.webp,/images/shops/aprils-bakery-3.webp,/images/shops/aprils-bakery-4.webp', 'SW', 'ซ.15', '07:00-17:00', '02-953-8980', 'https://www.facebook.com/share/191vfeWVVn/', 'https://www.instagram.com/aprilbakery', 'พายทำด้วยใจ ไม่ใส่วัตถุกันเสีย ไม่มีส่วนผสมของนมและเนย', 35),
(36, 1, 'แม่กีราชวัตร', 'ขนมไทย', '/images/shops/makee-ratchawat-2.webp', NULL, '/images/shops/makee-ratchawat-1.webp,/images/shops/makee-ratchawat-2.webp,/images/shops/makee-ratchawat-3.webp', 'SW', 'ซ.7/1', '09:30-17:00', '098-898-3590', 'https://www.facebook.com/share/19XJEjqSTH/', 'https://www.instagram.com/makeesakusaimhu', 'เป็นร้านแรกดั้งเดิมของราชวัตร ทุกสาขาครัวกลางเดียวกัน มั่นใจได้ในความอร่อย', 36),
(37, 5, 'Healthy First', 'คลินิกดูแลสุขภาพ', NULL, NULL, NULL, 'D', 'D101/2-3', '10:00-18:00', '089-955-4599', 'https://www.facebook.com/share/1NKJTv1z8W/', NULL, 'ใช้ชีวิตให้มีคุณภาพ เราออกแบบการรักษาเฉพาะบุคคล', 37);

SET SQL_SAFE_UPDATES = @old_safe;

-- ตรวจผล
SELECT zone, COUNT(*) AS shops FROM shops GROUP BY zone ORDER BY zone;

# ดึงโพสต์ Facebook / Instagram มาแสดงที่หน้าแรก

ส่วน "ติดตามเราบนโซเชียลมีเดีย" ในหน้าแรกดึงโพสต์ล่าสุดจากเพจ Facebook ของตลาด
และจากบัญชี Instagram ที่ผูกกับเพจ ผ่านเซิร์ฟเวอร์นี้ (`GET /api/social`)

- เซิร์ฟเวอร์ถามโพสต์ใหม่จาก Facebook ทุก 10 นาที โพสต์ใหม่จึงขึ้นเว็บภายในประมาณ 10 นาที
- ถ้ายังไม่ได้ตั้งค่า หรือดึงไม่ได้ หน้าเว็บจะแสดงการ์ดตัวอย่างเดิม ไม่พัง
- ถ้า Facebook ล่มชั่วคราว จะแสดงโพสต์ชุดล่าสุดที่เคยดึงไว้ (เก็บใน `server/.cache/social.json`)

> **token คือรหัสเข้าถึงเพจ** เก็บไว้ในไฟล์ `server/.env` เท่านั้น
> ห้ามใส่ในโค้ดหน้าเว็บ ห้ามส่งในแชต และห้าม commit ขึ้น git (`.env` ถูกกันไว้แล้ว)

---

## สิ่งที่ต้องมี

- **เพจ** Facebook ของตลาด (ไม่ใช่โปรไฟล์ส่วนตัว) และคุณเป็นแอดมินของเพจ
- ถ้าจะดึง Instagram ด้วย: บัญชี IG ต้องเป็นบัญชีธุรกิจหรือครีเอเตอร์ และผูกกับเพจนี้แล้ว
  (ตั้งที่ Facebook เพจ → การตั้งค่า → บัญชีที่เชื่อมโยง → Instagram)

## ขั้นตอน (ทำครั้งเดียว ประมาณ 15 นาที)

ชื่อปุ่มในหน้า Meta อาจต่างไปเล็กน้อยตามเวอร์ชัน ถ้าหาไม่เจอให้ดูจากความหมายใกล้เคียง

### 1. สร้างแอปใน Meta for Developers

1. เข้า <https://developers.facebook.com> ด้วยบัญชี Facebook ที่เป็นแอดมินเพจ
   ถ้ายังไม่เคยใช้ ให้กดลงทะเบียนเป็นนักพัฒนา (ฟรี)
2. ไปที่ **My Apps → Create App**
3. เลือกการใช้งานแบบจัดการเพจ (เช่น "Manage everything on your Page")
   หรือถ้ามีให้เลือกประเภทแอป ให้เลือก **Business**
4. ตั้งชื่อแอป เช่น `Bon Marche Website` แล้วกดสร้าง
   แอปอยู่ในโหมด Development ได้ ไม่ต้องส่งตรวจ (App Review) เพราะดึงเฉพาะเพจที่เราเป็นแอดมิน

### 2. สร้าง token ชั่วคราว

1. เปิด **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>
2. มุมขวา: **Meta App** เลือกแอปที่เพิ่งสร้าง · **User or Page** เลือก **Get User Access Token**
3. ติ๊กสิทธิ์ (Permissions):
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_read_user_content` (สำหรับยอดรีแอกชันและคอมเมนต์ ถ้าไม่มี การ์ดจะแสดงโพสต์โดยไม่มีตัวเลข)
     ถ้าไม่มีในรายการ ให้เพิ่มก่อนที่ App Dashboard → Use cases → Customize → Permissions
   - ถ้าดึง Instagram ด้วย: `instagram_basic` และ `business_management`
4. กด **Generate Access Token** → เลือกเพจของตลาด (และบัญชี IG) → อนุญาต

### 3. เปลี่ยนเป็น token ที่ไม่หมดอายุ

1. คัดลอก token จากช่อง Access Token แล้วเปิด **Access Token Debugger**:
   <https://developers.facebook.com/tools/debug/accesstoken>
2. วาง token → กด **Debug** → เลื่อนลงล่าง กด **Extend Access Token**
   จะได้ token แบบใช้ได้ 60 วัน (long-lived user token)
3. กลับไปที่ Graph API Explorer วาง token ใหม่นี้ในช่อง Access Token แล้วเรียก
   ```
   me/accounts?fields=id,name,access_token
   ```
4. ในผลลัพธ์ หาเพจของตลาด:
   - `id` → **Page ID**
   - `access_token` → **Page token** ตัวนี้ไม่หมดอายุ
     (เช็กได้ใน Access Token Debugger ว่า Expires: **Never**)

### 4. (ถ้าดึง Instagram) หา Instagram ID

ใน Graph API Explorer ใช้ Page token แล้วเรียก

```
{Page ID}?fields=instagram_business_account
```

ได้ `instagram_business_account.id` → **Instagram ID**

### 5. ใส่ในเซิร์ฟเวอร์

เปิดไฟล์ `server/.env` (บน Hostatom: ไฟล์ `.env` ของแอป Node.js หรือช่อง Environment Variables ในหน้าตั้งค่าแอป) แล้วใส่

```
FB_PAGE_ID=ตัวเลข Page ID
FB_PAGE_TOKEN=Page token
IG_USER_ID=ตัวเลข Instagram ID (ไม่ดึง IG ให้เว้นว่าง)
```

บันทึกไฟล์ → เซิร์ฟเวอร์รีสตาร์ทเอง (ในเครื่อง) / กด Restart แอปใน Hostatom

### 6. ทดสอบ

เปิด <http://localhost:5000/api/social> (บน Hostatom: `https://โดเมนของเว็บ/api/social`)

- เห็นรายการโพสต์ (`"posts": [ … ]`) → เสร็จแล้ว เปิดหน้าแรกจะเห็นการ์ดเป็นโพสต์จริง
- เห็น `"configured": false` → ยังไม่ได้ใส่ค่าใน `.env` หรือยังไม่ได้รีสตาร์ท
- เห็น `"error"` → อ่านช่อง `"hint"` ซึ่งบอกวิธีแก้เป็นภาษาไทย

---

## token ใช้ไม่ได้เมื่อไหร่

Page token แบบไม่หมดอายุจะใช้ไม่ได้ถ้า

- แอดมินคนที่สร้าง token เปลี่ยนรหัสผ่าน Facebook หรือถูกถอดจากแอดมินเพจ
- ถอนสิทธิ์แอปนี้ออกจากบัญชี

ถ้าเกิดขึ้น หน้าเว็บยังแสดงโพสต์ชุดล่าสุดที่เก็บไว้ และ log ของเซิร์ฟเวอร์จะขึ้น
`token หมดอายุหรือใช้ไม่ได้` → ทำขั้นตอนที่ 2–3 ใหม่ แล้วแก้ `FB_PAGE_TOKEN`

สำหรับระบบจริงระยะยาว ถ้ามี Meta Business Suite จะใช้ **System User token** แทนได้
(ไม่ผูกกับรหัสผ่านของคนใดคนหนึ่ง)

## สิ่งที่การ์ดแสดง

| การ์ด | Facebook | Instagram |
|---|---|---|
| หัวข้อ | บรรทัดแรกของโพสต์ | บรรทัดแรกของแคปชัน |
| ข้อความ | บรรทัดที่เหลือ | บรรทัดที่เหลือ |
| รูป | รูปแรกของโพสต์ (วิดีโอใช้ภาพปก + ปุ่มเล่น) | รูป / ภาพปกวิดีโอ |
| ตัวเลข | ความรู้สึกทั้งหมด (👍❤️😆…) + คอมเมนต์ | ไลก์ + คอมเมนต์ |
| กดการ์ด | ไปที่โพสต์บน Facebook | ไปที่โพสต์บน Instagram |

ยอดรีแอกชัน / คอมเมนต์ของ Facebook ต้องใช้สิทธิ์ `pages_read_user_content`
ถ้า token ยังไม่มีสิทธิ์นี้ การ์ดจะแสดงโพสต์ตามปกติแต่ไม่มีตัวเลข และ log ของเซิร์ฟเวอร์จะบอกวิธีเพิ่ม

ยอดวิววิดีโอต้องขอสิทธิ์สถิติเพิ่ม จึงยังไม่แสดง
TikTok ยังเป็นการ์ดตัวอย่าง (ต้องสมัคร TikTok for Developers และรออนุมัติแยกต่างหาก)

ตั้งค่าเพิ่มเติมได้ใน `.env`: `SOCIAL_CACHE_MINUTES` (ความถี่ในการเช็กโพสต์ใหม่ ค่าเริ่มต้น 10 นาที)
และ `FB_GRAPH_VERSION` (เวอร์ชัน Graph API ค่าเริ่มต้น `v24.0`)

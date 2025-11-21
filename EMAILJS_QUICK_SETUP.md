# 🚀 EmailJS Quick Setup - ขั้นตอนง่ายๆ

## ✅ สิ่งที่คุณมีแล้ว

จากภาพที่เห็น:
- ✅ Service ID: `service_8z92hko` (Gmail)
- ✅ Gmail Connected: `ppthana402@gmail.com`

---

## 📋 สิ่งที่ต้องทำต่อ (3 ขั้นตอน)

### 1. **หาค่า Public Key**

1. ไปที่ EmailJS Dashboard: https://dashboard.emailjs.com
2. ไปที่ **Account** → **General** (หรือ **API Keys**)
3. คัดลอก **Public Key** (หรือ **API Key**)
   - ตัวอย่าง: `abcdefghijklmnop` (ยาวประมาณ 20-30 ตัวอักษร)
4. วางใน `index.html`:
```javascript
window.__emailjs_public_key = 'abcdefghijklmnop';  // ใส่ Public Key ที่คัดลอกมา
```

---

### 2. **สร้าง Email Template**

1. ไปที่ **Email Templates** → **Create New Template**

2. **ตั้งค่า Template:**
   - **Template Name**: `Request Notification`
   - **Subject**: `คำขออัตรากำลังพลใหม่ - {{faculty_name}}`

3. **Content (HTML)** - คัดลอกทั้งหมดนี้:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .info-box { background: white; border-left: 4px solid #ec4899; padding: 15px; margin: 15px 0; }
    .label { font-weight: bold; color: #6b7280; }
    .value { color: #111827; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📋 คำขออัตรากำลังพลใหม่</h2>
      <p>SPU Personnel System</p>
    </div>
    
    <div class="content">
      <p>สวัสดีครับ/ค่ะ,</p>
      
      <p>มีคำขออัตรากำลังพลใหม่จาก <strong>{{faculty_name}}</strong></p>
      
      <div class="info-box">
        <p><span class="label">Request ID:</span> <span class="value">{{request_id}}</span></p>
        <p><span class="label">ตำแหน่ง:</span> <span class="value">{{position}}</span></p>
        <p><span class="label">ประเภท:</span> <span class="value">{{type}}</span></p>
        <p><span class="label">จำนวน:</span> <span class="value">{{amount}} ตำแหน่ง</span></p>
        <p><span class="label">สถานะ:</span> <span class="value">{{status}}</span></p>
        <p><span class="label">วันที่:</span> <span class="value">{{date}}</span></p>
      </div>
      
      <div class="info-box">
        <p><span class="label">รายละเอียด:</span></p>
        <p class="value">{{description}}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{confirmation_link}}" class="button">✅ ยืนยันคำขอ</a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280;">
        หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>
        <a href="{{confirmation_link}}" style="color: #ec4899; word-break: break-all;">{{confirmation_link}}</a>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 Sripatum University. All rights reserved.</p>
      <p>ระบบอัตรากำลังพล SPU Personnel System</p>
    </div>
  </div>
</body>
</html>
```

4. **ตั้งค่า To Email:**
   - ใน Template Settings → **To Email**: `{{to_email}}`
   - หรือใส่ตรงๆ: `hatwst1@gmail.com`

5. **บันทึก Template** → จะได้ **Template ID** (เช่น `template_xxxxx`)

6. **คัดลอก Template ID** → วางใน `index.html`:
```javascript
window.__emailjs_template_id = 'template_xxxxx';  // ใส่ Template ID ที่ได้
```

---

### 3. **แก้ไข index.html**

เปิดไฟล์ `index.html` และแก้ไขให้ถูกต้อง:

```javascript
// EmailJS Configuration
window.__emailjs_service_id = 'service_8z92hko';      // ✅ ถูกต้องแล้ว
window.__emailjs_template_id = 'template_xxxxx';      // ⚠️ ใส่ Template ID ที่สร้าง
window.__emailjs_public_key = 'abcdefghijklmnop';    // ⚠️ ใส่ Public Key จาก Account
```

---

## ✅ ตรวจสอบการตั้งค่า

### 1. **ตรวจสอบใน index.html:**
```javascript
window.__emailjs_service_id = 'service_8z92hko';     // ✅ ต้องมี
window.__emailjs_template_id = 'template_xxxxx';     // ✅ ต้องมี (ไม่ใช่ YOUR_TEMPLATE_ID)
window.__emailjs_public_key = 'xxxxxxxxxxxxx';        // ✅ ต้องมี (ไม่ใช่ YOUR_PUBLIC_KEY)
```

### 2. **ทดสอบส่งอีเมล:**
1. สร้างคำขอใหม่ในระบบ
2. ตรวจสอบ Console (F12):
   - ควรเห็น: `✅ ส่งอีเมลแจ้งเตือนสำเร็จ`
3. ตรวจสอบอีเมล:
   - ไปที่ `hatwst1@gmail.com`
   - ควรได้รับอีเมลแจ้งเตือน

---

## 🔍 หา Public Key ยังไง?

### วิธีที่ 1: จาก Dashboard
1. ไปที่ EmailJS Dashboard
2. คลิก **Account** (มุมขวาบน)
3. เลือก **General**
4. หา **Public Key** หรือ **API Key**
5. คัดลอกมา

### วิธีที่ 2: จาก Integration
1. ไปที่ **Integration**
2. เลือก **React** หรือ **JavaScript**
3. จะเห็น Public Key ในโค้ดตัวอย่าง

---

## ⚠️ ปัญหาที่พบบ่อย

### 1. **"EmailJS config ไม่ครบถ้วน"**
- ตรวจสอบว่าใส่ค่าทั้ง 3 ตัวแล้วหรือยัง
- ตรวจสอบว่าไม่มี `YOUR_` อยู่

### 2. **"Error sending email"**
- ตรวจสอบว่า Gmail Connected แล้ว
- ตรวจสอบว่า Template ตั้งค่า To Email แล้ว
- ตรวจสอบว่า Public Key ถูกต้อง

### 3. **"ไม่ได้รับอีเมล"**
- ตรวจสอบ Spam Folder
- ตรวจสอบว่า To Email ถูกต้อง (`hatwst1@gmail.com`)
- ตรวจสอบ Console Logs

---

## 📝 Checklist

- [ ] Service ID: `service_8z92hko` ✅ (มีแล้ว)
- [ ] Public Key: `xxxxxxxxxxxxx` ⚠️ (ต้องหา)
- [ ] Template ID: `template_xxxxx` ⚠️ (ต้องสร้าง)
- [ ] Template To Email: `hatwst1@gmail.com` ⚠️ (ต้องตั้งค่า)
- [ ] Gmail Connected: `ppthana402@gmail.com` ✅ (มีแล้ว)

---

**ทำตาม 3 ขั้นตอนแล้วแจ้งผล!**


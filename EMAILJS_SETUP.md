# 📧 EmailJS Setup Guide - SPU Personnel System

## ✅ ระบบส่งอีเมลและยืนยันผ่านอีเมล

ระบบใช้ **EmailJS** สำหรับส่งอีเมลจาก Frontend โดยไม่ต้องมี Backend

---

## 🚀 ขั้นตอนการตั้งค่า

### 1. **สร้างบัญชี EmailJS**

1. ไปที่: https://www.emailjs.com/
2. สร้างบัญชี (Sign Up) หรือ Login
3. เลือกแผนฟรี (Free Plan) - ส่งได้ 200 อีเมล/เดือน

---

### 2. **ตั้งค่า Email Service**

1. ไปที่ **Email Services** → **Add New Service**
2. เลือก Email Provider:
   - **Gmail** (แนะนำ)
   - **Outlook**
   - **Yahoo**
   - หรืออื่นๆ
3. ตั้งค่า:
   - **Service Name**: `spu-hr-email` (หรือชื่ออื่น)
   - **Service ID**: จะได้อัตโนมัติ (เช่น `service_xxxxx`)
4. **บันทึก Service ID** ไว้ใช้ตอนตั้งค่า Template

---

### 3. **สร้าง Email Template**

1. ไปที่ **Email Templates** → **Create New Template**
2. **Template Name**: `Request Notification`
3. **Subject**: `คำขออัตรากำลังพลใหม่ - {{faculty_name}}`
4. **Content** (HTML):

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

5. **Template Variables** (ใช้ใน Template):
   - `{{to_email}}` - อีเมลผู้รับ
   - `{{to_name}}` - ชื่อผู้รับ
   - `{{request_id}}` - ID ของคำขอ
   - `{{faculty_name}}` - ชื่อคณะ
   - `{{position}}` - ตำแหน่ง
   - `{{type}}` - ประเภท (อัตราใหม่/ทดแทน)
   - `{{amount}}` - จำนวน
   - `{{description}}` - รายละเอียด
   - `{{status}}` - สถานะ
   - `{{confirmation_link}}` - ลิงก์ยืนยัน
   - `{{date}}` - วันที่

6. **บันทึก Template ID** ไว้ใช้ตอนตั้งค่า

---

### 4. **ตั้งค่า Public Key**

1. ไปที่ **Account** → **General**
2. คัดลอก **Public Key** (หรือ **API Key**)
3. **บันทึก Public Key** ไว้ใช้ตอนตั้งค่า

---

### 5. **ตั้งค่าใน index.html**

เปิดไฟล์ `index.html` และแก้ไข:

```javascript
// EmailJS Configuration
window.__emailjs_service_id = 'service_xxxxx';      // Service ID จาก EmailJS
window.__emailjs_template_id = 'template_xxxxx';    // Template ID จาก EmailJS
window.__emailjs_public_key = 'xxxxxxxxxxxxx';      // Public Key จาก EmailJS
```

---

## 📋 Template Variables

### สำหรับ Request Notification Email:

| Variable | คำอธิบาย | ตัวอย่าง |
|----------|----------|---------|
| `{{to_email}}` | อีเมลผู้รับ | hatwst1@gmail.com |
| `{{to_name}}` | ชื่อผู้รับ | HR Team |
| `{{request_id}}` | ID ของคำขอ | local-1234567890-abc123 |
| `{{faculty_name}}` | ชื่อคณะ | คณะดิจิทัลมีเดีย |
| `{{position}}` | ตำแหน่ง | เจ้าหน้าที่บริหารงานทั่วไป |
| `{{type}}` | ประเภท | อัตราใหม่ |
| `{{amount}}` | จำนวน | 1 |
| `{{description}}` | รายละเอียด | หน้าที่ความรับผิดชอบ... |
| `{{status}}` | สถานะ | submitted |
| `{{confirmation_link}}` | ลิงก์ยืนยัน | https://hr-project-ivory.vercel.app/confirm/xxx |
| `{{date}}` | วันที่ | 24 พฤศจิกายน 2025, 12:00 น. |

---

## 🔧 การทำงาน

### 1. **เมื่อบันทึกคำขอใหม่:**
- ระบบจะส่งอีเมลไปที่ `hatwst1@gmail.com` อัตโนมัติ
- อีเมลจะมี confirmation link สำหรับยืนยัน

### 2. **เมื่อกดยืนยันในอีเมล:**
- เปิดหน้า Confirmation Page
- อัปเดตสถานะคำขอเป็น `confirmed`
- ส่งอีเมลยืนยันกลับไป

---

## ✅ ตรวจสอบการทำงาน

### 1. **ทดสอบส่งอีเมล:**
- สร้างคำขอใหม่
- ตรวจสอบ Console: ควรเห็น `✅ ส่งอีเมลแจ้งเตือนสำเร็จ`
- ตรวจสอบอีเมล: ควรได้รับอีเมลที่ `hatwst1@gmail.com`

### 2. **ทดสอบยืนยัน:**
- กด confirmation link ในอีเมล
- ควรเปิดหน้า Confirmation Page
- ควรเห็นข้อความ "ยืนยันสำเร็จ"

---

## ⚠️ ข้อจำกัด

### Free Plan:
- ส่งได้ **200 อีเมล/เดือน**
- ถ้าเกินต้องอัปเกรดเป็น Paid Plan

### Security:
- Public Key ควรเก็บเป็น Environment Variable
- ไม่ควร commit Public Key ลง Git

---

## 🔒 Environment Variables (แนะนำ)

### สำหรับ Production:

สร้างไฟล์ `.env`:
```
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

แก้ไข `index.html`:
```javascript
// EmailJS Configuration - ใช้ Environment Variables
window.__emailjs_service_id = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
window.__emailjs_template_id = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
window.__emailjs_public_key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
```

---

## 📞 สรุป

1. ✅ สร้างบัญชี EmailJS
2. ✅ ตั้งค่า Email Service
3. ✅ สร้าง Email Template
4. ✅ ตั้งค่า Public Key
5. ✅ ตั้งค่าใน `index.html`
6. ✅ ทดสอบการส่งอีเมล

**พร้อมใช้งานแล้ว! 📧**


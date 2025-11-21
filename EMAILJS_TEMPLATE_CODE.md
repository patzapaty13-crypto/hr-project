# 📧 EmailJS Template Code - SPU Personnel System

## ✅ โค้ด HTML Template สำหรับ EmailJS

### 📋 Template Variables ที่ใช้:

- `{{to_email}}` - อีเมลผู้รับ (hatwst1@gmail.com)
- `{{to_name}}` - ชื่อผู้รับ (HR Team)
- `{{request_id}}` - ID ของคำขอ
- `{{faculty_name}}` - ชื่อคณะ
- `{{position}}` - ตำแหน่ง
- `{{type}}` - ประเภท (อัตราใหม่/ทดแทน)
- `{{amount}}` - จำนวน
- `{{description}}` - รายละเอียด
- `{{status}}` - สถานะ
- `{{confirmation_link}}` - ลิงก์ยืนยัน
- `{{date}}` - วันที่

---

## 🎨 Version 1: Full Template (แนะนำ)

### วิธีการใช้:

1. ไปที่ EmailJS Dashboard → **Email Templates**
2. กด **Create New Template**
3. ตั้งค่า:
   - **Template Name**: `Request Notification`
   - **Subject**: `คำขออัตรากำลังพลใหม่ - {{faculty_name}}`
   - **To Email**: `{{to_email}}` หรือ `hatwst1@gmail.com`
4. คัดลอกโค้ดด้านล่างไปวางใน **Content (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: white;
    }
    .header { 
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); 
      color: white; 
      padding: 30px 20px; 
      border-radius: 8px 8px 0 0; 
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content { 
      background: #f9fafb; 
      padding: 30px 20px; 
      border: 1px solid #e5e7eb; 
      border-top: none;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #111827;
    }
    .info-box { 
      background: white; 
      border-left: 4px solid #ec4899; 
      padding: 20px; 
      margin: 20px 0; 
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label { 
      font-weight: bold; 
      color: #6b7280; 
      width: 120px;
      flex-shrink: 0;
    }
    .value { 
      color: #111827; 
      flex: 1;
    }
    .description-box {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      color: #374151;
      white-space: pre-wrap;
    }
    .button-container {
      text-align: center; 
      margin: 30px 0;
    }
    .button { 
      display: inline-block; 
      background: #ec4899; 
      color: white; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
      transition: background 0.3s;
    }
    .button:hover {
      background: #db2777;
    }
    .link-text {
      font-size: 12px; 
      color: #6b7280; 
      margin-top: 15px;
      word-break: break-all;
    }
    .link-text a {
      color: #ec4899;
      text-decoration: none;
    }
    .footer { 
      background: #f3f4f6; 
      padding: 20px; 
      text-align: center; 
      font-size: 12px; 
      color: #6b7280; 
      border-radius: 0 0 8px 8px; 
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📋 คำขออัตรากำลังพลใหม่</h2>
      <p>SPU Personnel System</p>
    </div>
    
    <div class="content">
      <p class="greeting">สวัสดีครับ/ค่ะ,</p>
      
      <p>มีคำขออัตรากำลังพลใหม่จาก <strong>{{faculty_name}}</strong></p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="label">Request ID:</span>
          <span class="value">{{request_id}}</span>
        </div>
        <div class="info-row">
          <span class="label">คณะ:</span>
          <span class="value">{{faculty_name}}</span>
        </div>
        <div class="info-row">
          <span class="label">ตำแหน่ง:</span>
          <span class="value">{{position}}</span>
        </div>
        <div class="info-row">
          <span class="label">ประเภท:</span>
          <span class="value">{{type}}</span>
        </div>
        <div class="info-row">
          <span class="label">จำนวน:</span>
          <span class="value">{{amount}} ตำแหน่ง</span>
        </div>
        <div class="info-row">
          <span class="label">สถานะ:</span>
          <span class="value">{{status}}</span>
        </div>
        <div class="info-row">
          <span class="label">วันที่:</span>
          <span class="value">{{date}}</span>
        </div>
      </div>
      
      <div class="description-box">
        <strong style="color: #6b7280; font-size: 14px;">รายละเอียด:</strong>
        <div style="margin-top: 10px; color: #374151;">{{description}}</div>
      </div>
      
      <div class="button-container">
        <a href="{{confirmation_link}}" class="button">✅ ยืนยันคำขอ</a>
        <p class="link-text">
          หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>
          <a href="{{confirmation_link}}">{{confirmation_link}}</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>© 2025 Sripatum University.</strong> All rights reserved.</p>
      <p>ระบบอัตรากำลังพล SPU Personnel System</p>
    </div>
  </div>
</body>
</html>
```

5. **บันทึก Template** → จะได้ **Template ID** (เช่น `template_xxxxx`)

6. **คัดลอก Template ID** → วางใน `index.html`:
```javascript
window.__emailjs_template_id = 'template_xxxxx';
```

---

## 🎨 Version 2: Simple Template (แบบง่าย)

หากต้องการ Template แบบง่ายกว่า:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: white;
    }
    .header { 
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); 
      color: white; 
      padding: 25px 20px; 
      border-radius: 8px 8px 0 0; 
      text-align: center;
    }
    .content { 
      background: #f9fafb; 
      padding: 25px 20px; 
      border: 1px solid #e5e7eb; 
    }
    .info-box { 
      background: white; 
      border-left: 4px solid #ec4899; 
      padding: 15px; 
      margin: 15px 0; 
    }
    .label { 
      font-weight: bold; 
      color: #6b7280; 
    }
    .value { 
      color: #111827; 
    }
    .button { 
      display: inline-block; 
      background: #ec4899; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 20px 0; 
    }
    .footer { 
      background: #f3f4f6; 
      padding: 15px; 
      text-align: center; 
      font-size: 12px; 
      color: #6b7280; 
      border-radius: 0 0 8px 8px; 
    }
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

---

## 📋 ตั้งค่า Template Settings

### ใน EmailJS Dashboard:

1. **Template Name**: `Request Notification`
2. **Subject**: `คำขออัตรากำลังพลใหม่ - {{faculty_name}}`
3. **To Email**: `{{to_email}}` หรือ `hatwst1@gmail.com`
4. **From Name**: `SPU Personnel System`
5. **From Email**: จะใช้ Gmail ของคุณอัตโนมัติ (`ppthana402@gmail.com`)
6. **Reply To**: `hatwst1@gmail.com` (ถ้าต้องการ)

---

## ✅ Checklist

- [ ] คัดลอกโค้ด HTML Template
- [ ] สร้าง Template ใน EmailJS Dashboard
- [ ] วางโค้ดใน Content (HTML)
- [ ] ตั้งค่า Subject: `คำขออัตรากำลังพลใหม่ - {{faculty_name}}`
- [ ] ตั้งค่า To Email: `{{to_email}}` หรือ `hatwst1@gmail.com`
- [ ] บันทึก Template
- [ ] คัดลอก Template ID
- [ ] วาง Template ID ใน `index.html`

---

**คัดลอกโค้ดไปใช้ได้เลย!**


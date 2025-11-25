# 🚀 คู่มือตั้งค่าโปรเจกต์สำหรับสมาชิกใหม่

## 📋 สารบัญ
1. [ความต้องการของระบบ](#ความต้องการของระบบ)
2. [การติดตั้ง](#การติดตั้ง)
3. [การตั้งค่า](#การตั้งค่า)
4. [การรันโปรเจกต์](#การรันโปรเจกต์)
5. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## 💻 ความต้องการของระบบ

### Software ที่ต้องติดตั้ง
- **Node.js** v18.0.0 ขึ้นไป
- **npm** v9.0.0 ขึ้นไป
- **Git** (สำหรับ clone repository)

### ตรวจสอบเวอร์ชัน
```bash
node --version  # ควรเป็น v18.0.0 ขึ้นไป
npm --version   # ควรเป็น v9.0.0 ขึ้นไป
git --version
```

---

## 📥 การติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/patzapaty13-crypto/hr-project.git
cd hr-project
```

### 2. ติดตั้ง Dependencies
```bash
npm install --legacy-peer-deps
```

**หมายเหตุ:** ใช้ `--legacy-peer-deps` เพื่อหลีกเลี่ยงปัญหา peer dependencies

### 3. ตั้งค่า Environment Variables

#### สำหรับ Frontend
```bash
# คัดลอกไฟล์ .env.example เป็น .env
cp .env.example .env

# แก้ไขไฟล์ .env (ใช้ text editor)
# ใส่ API keys ที่จำเป็น
```

#### สำหรับ Backend (API Server)
```bash
# คัดลอกไฟล์ server/.env.example เป็น server/.env
cp server/.env.example server/.env

# แก้ไขไฟล์ server/.env (ใช้ text editor)
# ใส่ API keys และ Firebase config ที่จำเป็น
```

---

## ⚙️ การตั้งค่า

### 1. Firebase Configuration

แก้ไขไฟล์ `index.html`:

```javascript
// หา <script> tag ที่มี window.__firebase_config
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

**วิธีหา Firebase Config:**
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project ของคุณ
3. ไปที่ Project Settings (⚙️)
4. Scroll ลงไปหา "Your apps"
5. คลิก Web app (</>) หรือสร้างใหม่
6. คัดลอก config

### 2. Gemini API Key (Optional - สำหรับ AI Features)

#### สำหรับ Frontend
แก้ไขไฟล์ `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### สำหรับ Backend
แก้ไขไฟล์ `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**วิธีขอ Gemini API Key:**
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login ด้วย Google Account
3. คลิก "Get API Key"
4. คัดลอก API Key

### 3. API Server Configuration

แก้ไขไฟล์ `server/.env`:
```env
PORT=3001
APP_ID=spu-hr-simple
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
GEMINI_API_KEY=your_gemini_api_key_here
```

**หมายเหตุ:** `FIREBASE_SERVICE_ACCOUNT` เป็น optional ถ้าไม่มีจะใช้ Firestore Client SDK

---

## 🚀 การรันโปรเจกต์

### วิธีที่ 1: รัน Frontend เท่านั้น (ไม่ใช้ API Server)

```bash
npm run dev
```

เปิด Browser ไปที่: `http://localhost:5173`

### วิธีที่ 2: รัน Frontend + API Server (แนะนำ)

**Terminal 1 - รัน API Server:**
```bash
npm run dev:server
```

**Terminal 2 - รัน Frontend:**
```bash
npm run dev
```

**ตรวจสอบ:**
- API Server: `http://localhost:3001/health`
- Frontend: `http://localhost:5173`

---

## ✅ Checklist การตั้งค่า

### Frontend
- [ ] Clone repository
- [ ] ติดตั้ง dependencies (`npm install --legacy-peer-deps`)
- [ ] สร้างไฟล์ `.env` จาก `.env.example`
- [ ] ตั้งค่า Firebase Config ใน `index.html`
- [ ] ตั้งค่า `VITE_GEMINI_API_KEY` ใน `.env` (optional)
- [ ] ตั้งค่า `VITE_API_URL` ใน `.env` (ถ้าใช้ API Server)

### Backend (ถ้าใช้ API Server)
- [ ] สร้างไฟล์ `server/.env` จาก `server/.env.example`
- [ ] ตั้งค่า `PORT` ใน `server/.env`
- [ ] ตั้งค่า `APP_ID` ใน `server/.env`
- [ ] ตั้งค่า `FIREBASE_SERVICE_ACCOUNT` ใน `server/.env` (optional)
- [ ] ตั้งค่า `GEMINI_API_KEY` ใน `server/.env` (optional)

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: `npm install` Error

**แก้ไข:**
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install --legacy-peer-deps
```

### ปัญหา: Port 3001 ถูกใช้งาน

**แก้ไข:**
```bash
# เปลี่ยน Port ใน server/.env
PORT=3002
```

### ปัญหา: Firebase ไม่ทำงาน

**ตรวจสอบ:**
1. ตรวจสอบ Firebase Config ใน `index.html`
2. ตรวจสอบว่า Firebase Project ถูกต้อง
3. ตรวจสอบ Firestore Rules

### ปัญหา: API Server ไม่ทำงาน

**ตรวจสอบ:**
1. ตรวจสอบว่า API Server รันอยู่ (`npm run dev:server`)
2. ตรวจสอบ Port ใน `server/.env`
3. ตรวจสอบ Console Log ของ API Server

### ปัญหา: AI Features ไม่ทำงาน

**ตรวจสอบ:**
1. ตรวจสอบว่า API Key ถูกตั้งค่าใน `.env` หรือ `server/.env`
2. ตรวจสอบว่า API Key ถูกต้อง
3. ตรวจสอบ Console Log สำหรับ Error Messages

---

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - ข้อมูลโปรเจกต์
- [QUICK_START_TEAM.md](./QUICK_START_TEAM.md) - Quick Start สำหรับทีม
- [GIT_TEAM_WORKFLOW.md](./GIT_TEAM_WORKFLOW.md) - Git Workflow
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API Documentation

---

## ❓ FAQ

### Q: ต้องใช้ API Server หรือไม่?
**A:** ไม่จำเป็น แต่แนะนำให้ใช้เพื่อความปลอดภัยและประสิทธิภาพ

### Q: ต้องมี Gemini API Key หรือไม่?
**A:** ไม่จำเป็น แต่ถ้าต้องการใช้ AI Features (เช่น วิเคราะห์ Resume) ต้องมี

### Q: ต้องมี Firebase หรือไม่?
**A:** จำเป็นสำหรับ Database และ Authentication

### Q: ใช้ Node.js เวอร์ชันไหน?
**A:** v18.0.0 ขึ้นไป (เพราะใช้ ES Modules)

---

## 🆘 ต้องการความช่วยเหลือ?

1. ตรวจสอบ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. ตรวจสอบ Console Log สำหรับ Error Messages
3. ถามเพื่อนในทีม
4. สร้าง Issue บน GitHub

---

**Happy Coding! 🚀**


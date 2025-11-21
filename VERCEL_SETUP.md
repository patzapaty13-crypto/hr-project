# 🚀 คู่มือตั้งค่า Vercel สำหรับ SPU Personnel System

## ⚠️ ปัญหาที่พบ

จากภาพที่เห็น Build Command ใน Vercel ตั้งเป็น `npm start` ซึ่งไม่ถูกต้อง

## ✅ วิธีแก้ไข

### วิธีที่ 1: แก้ไขใน Vercel Dashboard (แนะนำ)

1. ไปที่ Vercel Dashboard → Project Settings
2. ไปที่แท็บ **"General"** → **"Build & Development Settings"**
3. แก้ไข:
   - **Build Command**: เปลี่ยนจาก `npm start` เป็น `npm run build`
   - **Output Directory**: ตรวจสอบว่าเป็น `dist`
   - **Install Command**: เปลี่ยนเป็น `npm install --legacy-peer-deps`
4. คลิก **"Save"**
5. ไปที่แท็บ **"Deployments"** → คลิก **"Redeploy"** → เลือก **"Use existing Build Cache"** → **"Redeploy"**

### วิธีที่ 2: ใช้ vercel.json (อัตโนมัติ)

ไฟล์ `vercel.json` ถูกสร้างไว้แล้ว ซึ่งจะตั้งค่าอัตโนมัติ:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps"
}
```

**หมายเหตุ:** หลังจาก push `vercel.json` ขึ้น GitHub แล้ว Vercel จะใช้การตั้งค่านี้อัตโนมัติ

---

## 📋 Checklist การตั้งค่า Vercel

### ✅ Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install --legacy-peer-deps`
- [ ] Framework Preset: `Vite`

### ✅ Environment Variables (ถ้าต้องการ)
- [ ] `VITE_GEMINI_API_KEY` (ถ้าใช้ Gemini API)

### ✅ Root Directory
- [ ] Root Directory: `./` (root)

---

## 🔧 การแก้ไขปัญหา Build Error

### Error: Cannot find module

```bash
# ตรวจสอบว่า package.json มี dependencies ครบ
npm install --legacy-peer-deps
```

### Error: Build failed

1. ตรวจสอบ Build Logs ใน Vercel
2. ทดสอบ build ในเครื่อง:
   ```bash
   npm run build
   ```
3. ถ้าสำเร็จในเครื่อง แต่ล้มเหลวใน Vercel:
   - ตรวจสอบ Node.js version (ควรเป็น 18+)
   - ตรวจสอบว่าใช้ `--legacy-peer-deps` ใน Install Command

### Error: Output directory not found

- ตรวจสอบว่า Output Directory เป็น `dist`
- ตรวจสอบว่า `vite.config.js` ไม่ได้เปลี่ยน output directory

---

## 🚀 หลังจากแก้ไขแล้ว

1. **Redeploy:**
   - ไปที่ Vercel Dashboard
   - คลิก **"Deployments"**
   - คลิก **"..."** → **"Redeploy"**
   - เลือก **"Use existing Build Cache"** (ถ้าต้องการ)
   - คลิก **"Redeploy"**

2. **ตรวจสอบ Build Logs:**
   - ดู Build Logs ว่า build สำเร็จหรือไม่
   - ถ้ามี error ให้แก้ไขตาม error message

3. **ทดสอบ Website:**
   - ไปที่ URL ที่ Vercel ให้มา
   - ทดสอบการทำงานของเว็บไซต์

---

## 📝 หมายเหตุ

- **Build Command**: ต้องเป็น `npm run build` (ไม่ใช่ `npm start`)
- **Output Directory**: ต้องเป็น `dist` (Vite build output)
- **Install Command**: ใช้ `npm install --legacy-peer-deps` เพื่อแก้ปัญหา peer dependency conflicts
- **Framework**: Vercel จะ detect Vite อัตโนมัติ

---

## 🆘 ยังมีปัญหา?

1. ตรวจสอบ Build Logs ใน Vercel Dashboard
2. ทดสอบ build ในเครื่องก่อน: `npm run build`
3. ตรวจสอบว่าไฟล์ `vercel.json` ถูก push ขึ้น GitHub แล้ว
4. ลอง Redeploy อีกครั้ง

---

**หลังจากแก้ไขแล้ว Website จะพร้อมใช้งาน! 🎉**


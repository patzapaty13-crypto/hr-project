# 🚀 Quick Start Guide - SPU Personnel System

## ขั้นตอนการ Push ขึ้น GitHub และ Deploy

### 📋 ขั้นตอนที่ 1: Push ขึ้น GitHub

#### วิธีที่ 1: ใช้สคริปต์ (แนะนำ)

```powershell
# รันสคริปต์
.\setup-github.ps1
```

#### วิธีที่ 2: ทำเอง

1. **สร้าง Repository บน GitHub:**
   - ไปที่ https://github.com/new
   - ตั้งชื่อ repository (เช่น: `spu-personnel-system`)
   - เลือก Public หรือ Private
   - **อย่า** check "Initialize with README"
   - คลิก "Create repository"

2. **Push ขึ้น GitHub:**

```bash
# เพิ่ม remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# เปลี่ยน branch เป็น main
git branch -M main

# Push
git push -u origin main
```

---

### 🌐 ขั้นตอนที่ 2: Deploy ไปยัง Website

#### วิธีที่ 1: Vercel (แนะนำ - ง่ายที่สุด) ⭐

1. ไปที่ https://vercel.com
2. Login ด้วย GitHub
3. คลิก "Add New..." → "Project"
4. เลือก repository
5. ตั้งค่า:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. คลิก "Deploy"
7. ✅ ได้ URL เช่น: `https://your-project.vercel.app`

#### วิธีที่ 2: Netlify

1. ไปที่ https://netlify.com
2. Login ด้วย GitHub
3. คลิก "Add new site" → "Import an existing project"
4. เลือก repository
5. ตั้งค่า:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. คลิก "Deploy site"

#### วิธีที่ 3: Firebase Hosting

```bash
# ติดตั้ง Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# - Public directory: dist
# - Single-page app: Yes

# Build และ Deploy
npm run build
firebase deploy
```

---

### ⚙️ ขั้นตอนที่ 3: ตั้งค่า Firebase

**สำคัญ:** ต้องตั้งค่า Firebase Config ใน `index.html`:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

---

### 📝 การอัพเดทโค้ด

```bash
# แก้ไขโค้ด...

# Add และ Commit
git add .
git commit -m "Description"

# Push
git push

# Vercel/Netlify จะ auto-deploy อัตโนมัติ
```

---

### 🆘 ปัญหาที่พบบ่อย

**Build Error:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Firebase Error:**
- ตรวจสอบ Firebase Config ใน `index.html`

---

### 📚 เอกสารเพิ่มเติม

- `README.md` - ข้อมูลโปรเจกต์
- `DEPLOY.md` - คู่มือ Deploy แบบละเอียด

---

### ✅ Checklist

- [ ] สร้าง GitHub repository
- [ ] Push code ขึ้น GitHub
- [ ] Deploy ไปยัง Vercel/Netlify/Firebase
- [ ] ตั้งค่า Firebase Config
- [ ] ทดสอบการทำงาน
- [ ] แชร์ URL ให้ทีม

---

**พร้อมใช้งานแล้ว! 🎉**


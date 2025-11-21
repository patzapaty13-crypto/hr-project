# คู่มือการ Deploy SPU Personnel System

## ขั้นตอนที่ 1: Push ขึ้น GitHub

### 1.1 สร้าง Repository บน GitHub

1. ไปที่ [GitHub.com](https://github.com) และ Login
2. คลิกปุ่ม **"New"** หรือ **"+"** → **"New repository"**
3. ตั้งชื่อ repository เช่น `spu-personnel-system`
4. เลือก **Public** หรือ **Private** ตามต้องการ
5. **อย่า** check "Initialize this repository with a README" (เพราะเรามีแล้ว)
6. คลิก **"Create repository"**

### 1.2 เชื่อมต่อกับ GitHub

รันคำสั่งต่อไปนี้ใน Terminal (แทนที่ `YOUR_USERNAME` และ `YOUR_REPO_NAME`):

```bash
# เพิ่ม remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# เปลี่ยนชื่อ branch เป็น main (ถ้ายังใช้ master)
git branch -M main

# Push ขึ้น GitHub
git push -u origin main
```

**ตัวอย่าง:**
```bash
git remote add origin https://github.com/yourusername/spu-personnel-system.git
git branch -M main
git push -u origin main
```

---

## ขั้นตอนที่ 2: Deploy ไปยัง Website

### วิธีที่ 1: Vercel (แนะนำ - ง่ายและเร็วที่สุด) ⭐

#### 2.1.1 ผ่านเว็บไซต์ Vercel

1. ไปที่ [vercel.com](https://vercel.com) และ Login ด้วย GitHub
2. คลิก **"Add New..."** → **"Project"**
3. เลือก repository ที่เพิ่ง push ขึ้น GitHub
4. ตั้งค่า:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. คลิก **"Deploy"**
6. รอสักครู่ Vercel จะให้ URL เช่น `https://your-project.vercel.app`

#### 2.1.2 ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

---

### วิธีที่ 2: Netlify

#### 2.2.1 ผ่านเว็บไซต์ Netlify

1. ไปที่ [netlify.com](https://netlify.com) และ Login ด้วย GitHub
2. คลิก **"Add new site"** → **"Import an existing project"**
3. เลือก repository จาก GitHub
4. ตั้งค่า:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. คลิก **"Deploy site"**

#### 2.2.2 ผ่าน Netlify CLI

```bash
# ติดตั้ง Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

### วิธีที่ 3: Firebase Hosting

#### 2.3.1 Setup Firebase Hosting

```bash
# ติดตั้ง Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize Firebase (เลือก Hosting)
firebase init hosting

# ตอบคำถาม:
# - What do you want to use as your public directory? → dist
# - Configure as a single-page app? → Yes
# - Set up automatic builds? → No (หรือ Yes ถ้าต้องการ)
```

#### 2.3.2 Build และ Deploy

```bash
# Build project
npm run build

# Deploy
firebase deploy
```

---

### วิธีที่ 4: GitHub Pages

#### 2.4.1 สร้างไฟล์ `vite.config.js` (ถ้ายังไม่มี)

ตรวจสอบว่าไฟล์ `vite.config.js` มี `base` path:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/' // เปลี่ยนเป็นชื่อ repository ของคุณ
})
```

#### 2.4.2 Deploy Script

สร้างไฟล์ `deploy.sh`:

```bash
#!/usr/bin/env sh

# Build
npm run build

# Deploy to GitHub Pages
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git main:gh-pages
cd -
```

#### 2.4.3 ตั้งค่า GitHub Pages

1. ไปที่ repository บน GitHub
2. ไปที่ **Settings** → **Pages**
3. Source: เลือก **gh-pages** branch
4. Save

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### สำหรับ Vercel/Netlify

1. ไปที่ Project Settings → Environment Variables
2. เพิ่มตัวแปร (ถ้าต้องการ):
   - `VITE_GEMINI_API_KEY` (ถ้าใช้ Gemini API)

### สำหรับ Firebase

แก้ไขไฟล์ `index.html` โดยตรง หรือใช้ Firebase Functions

---

## ขั้นตอนที่ 4: ตั้งค่า Firebase Config

**สำคัญ:** ต้องตั้งค่า Firebase Config ใน `index.html` ก่อน deploy

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

## การอัพเดทโค้ด

เมื่อแก้ไขโค้ดแล้ว:

```bash
# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push

# Vercel/Netlify จะ auto-deploy อัตโนมัติ
# Firebase ต้อง deploy เอง:
npm run build
firebase deploy
```

---

## Troubleshooting

### Build Error

```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Firebase Error

ตรวจสอบว่า Firebase Config ถูกต้องใน `index.html`

### CORS Error

ตรวจสอบว่า Firebase Rules อนุญาตให้เข้าถึงได้

---

## คำแนะนำ

- **Vercel**: แนะนำสำหรับผู้เริ่มต้น ใช้งานง่าย deploy เร็ว
- **Netlify**: ดีสำหรับ static sites มี free tier ดี
- **Firebase Hosting**: ดีถ้าใช้ Firebase อยู่แล้ว
- **GitHub Pages**: ฟรีแต่ต้องตั้งค่าเพิ่มเติม

---

## Support

หากมีปัญหาติดต่อ: hr@spu.ac.th


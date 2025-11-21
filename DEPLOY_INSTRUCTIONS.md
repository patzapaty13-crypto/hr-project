# 🚀 คำแนะนำการ Deploy บน Vercel

## ✅ สิ่งที่ทำแล้ว

1. ✅ Merge `feature/vercel-config` → `main`
2. ✅ Push ขึ้น GitHub
3. ✅ Vercel จะ auto-deploy จาก `main` branch

---

## 🔍 ตรวจสอบ Vercel Deployment

### 1. **ไปที่ Vercel Dashboard**
- URL: https://vercel.com/dashboard
- เลือก Project: `hr-project`

### 2. **ตรวจสอบ Branch ที่ Deploy**
- ไปที่ Settings → Git
- ตรวจสอบว่า Production Branch = `main`
- ตรวจสอบว่า Deploy จาก branch `main`

### 3. **ตรวจสอบ Deployment ล่าสุด**
- ไปที่ Deployments tab
- ดูว่า deployment ล่าสุดสำเร็จหรือไม่
- ดูว่า deploy จาก commit ไหน

---

## 🔧 ถ้า Vercel ยังไม่ได้ Deploy

### Option 1: Manual Redeploy
1. ไปที่ Vercel Dashboard
2. เลือก Project
3. ไปที่ Deployments tab
4. กด "..." → "Redeploy"

### Option 2: Trigger New Deployment
```bash
# สร้าง empty commit เพื่อ trigger deployment
git commit --allow-empty -m "trigger: Force Vercel deployment"
git push origin main
```

---

## 📋 ตรวจสอบว่า Deploy สำเร็จ

### 1. **ตรวจสอบ Build Logs**
- ไปที่ Vercel Dashboard → Deployments
- ดู Build Logs
- ตรวจสอบว่า build สำเร็จ

### 2. **ตรวจสอบ Website**
- เปิดเว็บ: https://hr-project-ivory.vercel.app
- Hard Refresh: `Ctrl + Shift + R`
- เปิด Console (F12)
- ควรเห็น: `✅ ใช้ Demo Mode: อ่านข้อมูลจาก Local Storage`

---

## ⚠️ ถ้ายังไม่ได้

### ตรวจสอบ Vercel Settings:
1. **Production Branch:**
   - Settings → Git → Production Branch
   - ควรเป็น `main`

2. **Build Command:**
   - Settings → General → Build Command
   - ควรเป็น: `npm run build`

3. **Output Directory:**
   - Settings → General → Output Directory
   - ควรเป็น: `dist`

4. **Install Command:**
   - Settings → General → Install Command
   - ควรเป็น: `npm install --legacy-peer-deps`

---

## 🎯 สรุป

**สิ่งที่ต้องทำ:**
1. ✅ Merge `feature/vercel-config` → `main` (ทำแล้ว)
2. ✅ Push ขึ้น GitHub (ทำแล้ว)
3. ⏳ รอ Vercel auto-deploy (หรือ manual redeploy)
4. ✅ Hard Refresh Browser: `Ctrl + Shift + R`

**ผลลัพธ์ที่คาดหวัง:**
- ✅ ไม่มี Alert
- ✅ ใช้ Demo Mode อัตโนมัติ
- ✅ บันทึกข้อมูลได้ใน Local Storage

---

**ลองตรวจสอบ Vercel Dashboard แล้วแจ้งผล!**


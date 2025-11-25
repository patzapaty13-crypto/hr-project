# 🔥 คู่มือ Deploy ไป Firebase Hosting

## 📋 สารบัญ
1. [การติดตั้ง Firebase CLI](#การติดตั้ง-firebase-cli)
2. [การตั้งค่า Firebase Project](#การตั้งค่า-firebase-project)
3. [การ Deploy](#การ-deploy)
4. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## 🚀 การติดตั้ง Firebase CLI

### Windows (PowerShell)
```bash
npm install -g firebase-tools
```

### Mac/Linux
```bash
npm install -g firebase-tools
```

### ตรวจสอบการติดตั้ง
```bash
firebase --version
```

---

## ⚙️ การตั้งค่า Firebase Project

### 1. Login Firebase
```bash
firebase login
```

จะเปิด Browser ให้ login ด้วย Google Account

### 2. Initialize Firebase Hosting

```bash
firebase init hosting
```

**คำถามที่ Firebase จะถาม:**

1. **Select a default Firebase project**
   - เลือก project ที่มีอยู่ หรือสร้างใหม่

2. **What do you want to use as your public directory?**
   - พิมพ์: `dist` (เพราะ Vite build ไปที่ dist)

3. **Configure as a single-page app?**
   - พิมพ์: `Yes` (เพราะเป็น React SPA)

4. **Set up automatic builds and deploys with GitHub?**
   - พิมพ์: `No` (แนะนำ - ถ้าไม่ต้องการ auto-deploy)
   - **หมายเหตุ:** ถ้าตอบ Yes อาจเกิด authorization error ดู [FIREBASE_GITHUB_WORKFLOW.md](./FIREBASE_GITHUB_WORKFLOW.md)

5. **File dist/index.html already exists. Overwrite?**
   - พิมพ์: `No` (ไม่ต้อง overwrite)

### 3. แก้ไขไฟล์ `.firebaserc`

แก้ไขไฟล์ `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

**วิธีหา Project ID:**
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project ของคุณ
3. ไปที่ Project Settings (⚙️)
4. Project ID จะอยู่ด้านบน

---

## 🚀 การ Deploy

### 1. Build โปรเจกต์
```bash
npm run build
```

### 2. Deploy ไป Firebase
```bash
firebase deploy --only hosting
```

### 3. ตรวจสอบผลลัพธ์

หลังจาก deploy สำเร็จ จะได้ URL:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

---

## 🔄 การ Deploy อีกครั้ง

เมื่อแก้ไขโค้ดแล้ว:

```bash
# 1. Build ใหม่
npm run build

# 2. Deploy
firebase deploy --only hosting
```

---

## 🛠️ การแก้ไขปัญหา

### ปัญหา: "Not in a Firebase app directory"

**สาเหตุ:** ยังไม่ได้ initialize Firebase

**แก้ไข:**
```bash
firebase init hosting
```

### ปัญหา: "Error: Not authorized"

**สาเหตุ:** ยังไม่ได้ login

**แก้ไข:**
```bash
firebase login
```

### ปัญหา: "Error: Project not found"

**สาเหตุ:** Project ID ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบไฟล์ `.firebaserc`
2. ตรวจสอบ Project ID ใน Firebase Console
3. แก้ไข `.firebaserc` ให้ถูกต้อง

### ปัญหา: "Error: Build failed"

**สาเหตุ:** Build มี error

**แก้ไข:**
```bash
# ตรวจสอบ error
npm run build

# แก้ไข error แล้ว build ใหม่
npm run build
```

---

## 📝 ไฟล์ที่สร้างขึ้น

หลังจาก `firebase init hosting`:

- `firebase.json` - Firebase configuration
- `.firebaserc` - Firebase project settings
- `.firebase/` - Firebase cache (ไม่ต้อง commit)

---

## ✅ Checklist

- [ ] ติดตั้ง Firebase CLI (`npm install -g firebase-tools`)
- [ ] Login Firebase (`firebase login`)
- [ ] Initialize Hosting (`firebase init hosting`)
- [ ] แก้ไข `.firebaserc` ให้ถูกต้อง
- [ ] Build โปรเจกต์ (`npm run build`)
- [ ] Deploy (`firebase deploy --only hosting`)

---

## 🎯 Quick Commands

```bash
# Login
firebase login

# Initialize (ครั้งแรกเท่านั้น)
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting

# Deploy ทั้งหมด (hosting + functions + etc.)
firebase deploy
```

---

## 📚 เอกสารเพิ่มเติม

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Happy Deploying! 🚀**


# 🔧 Troubleshooting Guide - SPU Personnel System

## ❌ ปัญหาที่พบบ่อย

### 1. **ยังแสดง Alert "Firestore ไม่พร้อมใช้งาน"**

#### สาเหตุ:
- Browser Cache ยังเก็บโค้ดเก่าอยู่
- ยังไม่ได้ rebuild/redeploy

#### วิธีแก้:
1. **Hard Refresh Browser:**
   - Windows/Linux: `Ctrl + Shift + R` หรือ `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Clear Browser Cache:**
   - เปิด DevTools (F12)
   - ไปที่ Application/Storage → Clear Storage
   - หรือ Settings → Clear browsing data

3. **Rebuild และ Redeploy:**
   ```bash
   npm run build
   # แล้ว push ขึ้น Vercel
   ```

---

### 2. **Demo Mode ไม่ทำงาน**

#### ตรวจสอบ:
1. เปิด Browser Console (F12)
2. ดูว่ามี log:
   - `✅ ใช้ Demo Mode: บันทึกข้อมูลลง Local Storage`
   - `✅ บันทึกข้อมูลสำเร็จใน Local Storage`

3. ตรวจสอบ Local Storage:
   - เปิด DevTools → Application → Local Storage
   - ดูว่ามี key `spu_hr_requests` หรือไม่

#### วิธีแก้:
- ตรวจสอบว่า `utils/localStorage.js` ถูก import ถูกต้อง
- ตรวจสอบว่า `db` เป็น `null` หรือไม่ (ควรเป็น `null` เมื่อไม่มี Firebase)

---

### 3. **ข้อมูลไม่แสดงใน Dashboard**

#### สาเหตุ:
- Dashboard ยังไม่ได้อ่านจาก Local Storage
- Event listener ไม่ทำงาน

#### วิธีแก้:
1. **ตรวจสอบ Console:**
   - ดูว่ามี log `ใช้ Demo Mode: อ่านข้อมูลจาก Local Storage` หรือไม่

2. **ตรวจสอบ Event:**
   - ดูว่ามี `localStorageUpdate` event ถูก trigger หรือไม่

3. **Refresh หน้า:**
   - กด F5 เพื่อ refresh หน้า
   - หรือปิด-เปิด Dashboard ใหม่

---

### 4. **Error: "Cannot read property 'id' of undefined"**

#### สาเหตุ:
- `faculty` เป็น `undefined` หรือ `null`

#### วิธีแก้:
- ตรวจสอบว่า Login สำเร็จหรือไม่
- ตรวจสอบว่า `faculty` ถูกส่งมาใน props หรือไม่

---

### 5. **Build Error**

#### สาเหตุ:
- Syntax Error
- Missing Dependencies

#### วิธีแก้:
```bash
# ลบ node_modules และ reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build ใหม่
npm run build
```

---

## 🔍 Debug Checklist

### ✅ ตรวจสอบว่า Demo Mode ทำงาน:
1. เปิด Browser Console (F12)
2. ดู Console Logs:
   ```
   🔍 Debug: db status: Not Available (Demo Mode)
   ✅ ใช้ Demo Mode: บันทึกข้อมูลลง Local Storage
   ✅ บันทึกข้อมูลสำเร็จใน Local Storage
   ✅ Trigger localStorageUpdate event
   ```

3. ตรวจสอบ Local Storage:
   - DevTools → Application → Local Storage
   - ดู key: `spu_hr_requests`
   - ควรมีข้อมูล JSON array

4. ตรวจสอบ Network Tab:
   - ไม่ควรมี request ไป Firebase (ถ้าใช้ Demo Mode)

---

## 🚀 Quick Fixes

### Fix 1: Clear Cache และ Hard Refresh
```
1. เปิด DevTools (F12)
2. Right-click ปุ่ม Refresh
3. เลือก "Empty Cache and Hard Reload"
```

### Fix 2: Rebuild และ Redeploy
```bash
npm run build
git add .
git commit -m "fix: Update build"
git push
# Vercel จะ auto-deploy
```

### Fix 3: ตรวจสอบ Firebase Config
- เปิด `index.html`
- ตรวจสอบว่า `window.__firebase_config` ถูกต้องหรือไม่
- ถ้าไม่มี → ระบบจะใช้ Demo Mode อัตโนมัติ

---

## 📞 ยังแก้ไม่ได้?

1. **ตรวจสอบ Console Logs:**
   - ดู Error Messages
   - ดู Warning Messages

2. **ตรวจสอบ Network Tab:**
   - ดูว่ามี Request ที่ fail หรือไม่

3. **ตรวจสอบ Local Storage:**
   - ดูว่ามีข้อมูลหรือไม่
   - ลองลบและสร้างใหม่

4. **ตรวจสอบ Code:**
   - ดูว่าโค้ดถูก push ขึ้น GitHub หรือไม่
   - ดูว่า Vercel deploy สำเร็จหรือไม่

---

**หากยังแก้ไม่ได้ กรุณาแจ้ง Error Message และ Console Logs**


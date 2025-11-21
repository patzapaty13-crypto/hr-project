# 🎯 Demo Mode - SPU Personnel System

## ✅ ระบบทำงานได้โดยไม่ต้องมี Firebase!

ระบบได้เพิ่ม **Demo Mode** ที่ใช้ **Local Storage** เพื่อให้สามารถใช้งานได้ทันทีโดยไม่ต้องตั้งค่า Firebase

---

## 🚀 วิธีใช้งาน

### 1. **ไม่ต้องตั้งค่า Firebase**
- ระบบจะตรวจสอบอัตโนมัติว่ามี Firebase Config หรือไม่
- ถ้าไม่มี → ใช้ **Demo Mode** (Local Storage)
- ถ้ามี → ใช้ **Production Mode** (Firestore)

### 2. **Demo Mode Features**
- ✅ สร้างคำขอใหม่ได้
- ✅ ดูรายการคำขอทั้งหมด
- ✅ อัปเดตสถานะคำขอ (สำหรับ HR)
- ✅ กรองข้อมูลตามบทบาท (HR/Faculty)
- ✅ Real-time Updates (อัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลง)

### 3. **ข้อจำกัดของ Demo Mode**
- ⚠️ ข้อมูลเก็บใน Browser Local Storage เท่านั้น
- ⚠️ ข้อมูลจะหายเมื่อ:
  - ลบ Browser Cache
  - ใช้ Browser อื่น
  - ใช้ Private/Incognito Mode
  - ลบข้อมูล Browser

---

## 📋 การทำงาน

### **SimpleForm (สร้างคำขอ)**
```javascript
// ตรวจสอบว่ามี Firebase หรือไม่
if (db) {
  // ใช้ Firestore (Production Mode)
  await addDoc(collection(db, ...), newRequest);
} else {
  // ใช้ Local Storage (Demo Mode)
  addLocalRequest(newRequest);
  window.dispatchEvent(new Event('localStorageUpdate'));
}
```

### **Dashboard (ดูรายการ)**
```javascript
// ตรวจสอบว่ามี Firebase หรือไม่
if (!db) {
  // อ่านจาก Local Storage
  const localRequests = getLocalRequests();
  setRequests(localRequests);
  
  // ฟัง event เพื่ออัปเดตอัตโนมัติ
  window.addEventListener('localStorageUpdate', loadLocalData);
}
```

---

## 🎨 UI Indicators

### **Demo Mode Badge**
- แสดง "Demo Mode" badge ใน Dashboard
- แสดงข้อความแจ้งเตือนใน SimpleForm

### **Error Messages**
- แสดง Error Message ที่สวยงามใน UI
- มีปุ่มปิด Error Message
- แสดงคำแนะนำในการตั้งค่า Firebase

---

## 🔧 Local Storage Structure

### **Storage Key**
```
spu_hr_requests
```

### **Data Structure**
```json
[
  {
    "id": "local-1234567890-abc123",
    "position": "เจ้าหน้าที่บริหารงานทั่วไป",
    "type": "new",
    "amount": 1,
    "description": "รายละเอียดงาน...",
    "facultyId": "faculty-1",
    "facultyName": "คณะดิจิทัลมีเดีย",
    "status": "submitted",
    "userId": "local-user",
    "createdAt": {
      "seconds": 1234567890,
      "nanoseconds": 0
    }
  }
]
```

---

## 📝 Local Storage Utilities

### **Functions**
- `getLocalRequests()` - ดึงข้อมูลคำขอทั้งหมด
- `addLocalRequest(request)` - เพิ่มคำขอใหม่
- `updateLocalRequestStatus(id, status)` - อัปเดตสถานะ
- `deleteLocalRequest(id)` - ลบคำขอ
- `clearLocalRequests()` - ล้างข้อมูลทั้งหมด

---

## 🔄 Real-time Updates

### **Event System**
- ใช้ `localStorageUpdate` event สำหรับอัปเดตภายใน tab เดียวกัน
- ใช้ `storage` event สำหรับอัปเดตข้าม tabs

### **How it Works**
1. SimpleForm บันทึกข้อมูล → Trigger `localStorageUpdate` event
2. Dashboard ฟัง event → อ่านข้อมูลใหม่จาก Local Storage
3. UI อัปเดตอัตโนมัติ

---

## 🚀 Upgrade to Production Mode

### **ตั้งค่า Firebase Config**
1. เปิด `index.html`
2. ตั้งค่า `window.__firebase_config`:
```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

3. ตั้งค่า `window.__app_id`:
```javascript
window.__app_id = "spu-hr-simple";
```

4. Reload หน้าเว็บ → ระบบจะใช้ Firestore อัตโนมัติ

---

## ✅ สรุป

- ✅ **ใช้งานได้ทันที** โดยไม่ต้องตั้งค่า Firebase
- ✅ **Demo Mode** ใช้ Local Storage
- ✅ **Production Mode** ใช้ Firestore (เมื่อตั้งค่า Firebase แล้ว)
- ✅ **Real-time Updates** ทำงานได้ทั้ง 2 โหมด
- ✅ **UI Indicators** แสดงสถานะ Demo Mode

**พร้อมใช้งานแล้ว! 🎉**


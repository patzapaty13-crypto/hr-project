# 🔧 แก้ไขปัญหา API Server

## ❌ ปัญหา: "No response" หรือ "Connection refused"

### สาเหตุที่พบบ่อย:

1. **API Server ไม่ได้รัน**
2. **Port ถูกใช้งานอยู่**
3. **มีปัญหาในการ Import Modules**

---

## ✅ วิธีแก้ไข

### 1. ตรวจสอบว่า Server รันอยู่หรือไม่

```bash
# ตรวจสอบ Port 3001
netstat -ano | findstr :3001
```

ถ้าไม่มีผลลัพธ์ = Server ไม่ได้รัน

---

### 2. รัน API Server

**วิธีที่ 1: ใช้ npm script**
```bash
npm run dev:server
```

**วิธีที่ 2: รันโดยตรง**
```bash
node server/index.js
```

**วิธีที่ 3: ใช้ nodemon (auto-reload)**
```bash
npx nodemon server/index.js
```

---

### 3. ตรวจสอบ Error Messages

ดู Console Output ว่ามี Error อะไร:

**ถ้าเห็น:**
```
Error: Cannot find module 'express'
```

**แก้ไข:**
```bash
npm install express cors dotenv firebase-admin nodemon
```

---

### 4. ตรวจสอบ Environment Variables

สร้างไฟล์ `server/.env`:

```env
PORT=3001
APP_ID=spu-hr-simple
FIREBASE_SERVICE_ACCOUNT=
```

**หมายเหตุ:** `FIREBASE_SERVICE_ACCOUNT` เป็น optional ถ้าไม่มีจะใช้ Firestore Client SDK

---

### 5. ตรวจสอบ Node.js Version

```bash
node --version
```

ต้องเป็น **v18.0.0** ขึ้นไป (เพราะใช้ ES Modules)

---

### 6. ตรวจสอบ package.json

ต้องมี `"type": "module"`:

```json
{
  "type": "module",
  ...
}
```

---

## 🧪 ทดสอบว่า Server รันแล้ว

### วิธีที่ 1: ใช้ curl (PowerShell)

```powershell
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### วิธีที่ 2: ใช้ Browser

เปิด: `http://localhost:3001/health`

### วิธีที่ 3: ใช้ Postman

1. เปิด Postman
2. สร้าง Request ใหม่
3. Method: `GET`
4. URL: `http://localhost:3001/health`
5. คลิก Send

---

## 🐛 Error Messages ที่พบบ่อย

### Error: "Cannot find module"

**แก้ไข:**
```bash
npm install
```

---

### Error: "Port 3001 already in use"

**แก้ไข:**

**วิธีที่ 1: เปลี่ยน Port**
```env
# ใน server/.env
PORT=3002
```

**วิธีที่ 2: หยุด Process ที่ใช้ Port 3001**
```bash
# หา PID
netstat -ano | findstr :3001

# Kill Process (แทนที่ PID ด้วยตัวเลขที่ได้)
taskkill /PID <PID> /F
```

---

### Error: "Firebase Admin not initialized"

**ไม่เป็นปัญหา!** Server จะใช้ Firestore Client SDK แทน

---

### Error: "SyntaxError: Cannot use import statement"

**แก้ไข:**
1. ตรวจสอบ `package.json` ต้องมี `"type": "module"`
2. ตรวจสอบ Node.js version ต้องเป็น v18+

---

## ✅ Checklist

- [ ] Node.js version >= 18
- [ ] ติดตั้ง dependencies แล้ว (`npm install`)
- [ ] มี `"type": "module"` ใน package.json
- [ ] API Server รันอยู่ (ดู Console)
- [ ] Port 3001 ไม่ถูกใช้งาน
- [ ] Health Check ผ่าน (`http://localhost:3001/health`)

---

## 🚀 Quick Fix

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน server
npm run dev:server

# 3. ทดสอบ (เปิด Terminal ใหม่)
curl http://localhost:3001/health
```

---

## 📞 ยังแก้ไม่ได้?

1. ดู Console Log ของ API Server
2. ตรวจสอบ Error Message
3. ดูไฟล์ `TROUBLESHOOTING_API.md` (ไฟล์นี้)


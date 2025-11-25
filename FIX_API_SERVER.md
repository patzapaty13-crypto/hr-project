# 🔧 แก้ไขปัญหา API Server - "No response" ใน Postman

## ⚠️ ปัญหา: "No response" หรือ "Connection refused"

**สาเหตุ:** API Server ไม่ได้รันอยู่

---

## ✅ วิธีแก้ไข (Step by Step)

### ขั้นตอนที่ 1: ตรวจสอบ Dependencies

```bash
npm install
```

### ขั้นตอนที่ 2: รัน API Server

**เปิด Terminal ใหม่** และรัน:

```bash
npm run dev:server
```

หรือ

```bash
node server/index.js
```

**คุณควรเห็น:**
```
🚀 API Server running on port 3001
📡 Health check: http://localhost:3001/health
```

### ขั้นตอนที่ 3: ทดสอบใน Browser

เปิด Browser ไปที่: `http://localhost:3001/health`

**ควรเห็น:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### ขั้นตอนที่ 4: ทดสอบใน Postman อีกครั้ง

1. เปิด Postman
2. ไปที่ **Health Check** → **Health Check**
3. คลิก **Send**

**ควรได้ Response:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 🐛 ถ้ายังไม่ได้ผล

### ตรวจสอบ Port

```bash
# ตรวจสอบว่า Port 3001 ถูกใช้งานหรือไม่
netstat -ano | findstr :3001
```

**ถ้ามีผลลัพธ์:** Port ถูกใช้งานอยู่

**แก้ไข:**
1. หยุด Process ที่ใช้ Port 3001
2. หรือเปลี่ยน Port ใน `server/.env`:
   ```env
   PORT=3002
   ```

### ตรวจสอบ Error ใน Console

ดู Console Output ของ API Server ว่ามี Error อะไร

**Error ที่พบบ่อย:**

#### 1. "Cannot find module 'express'"
```bash
npm install express cors dotenv firebase-admin nodemon
```

#### 2. "Cannot use import statement"
- ตรวจสอบว่า `package.json` มี `"type": "module"`
- ตรวจสอบ Node.js version: `node --version` (ต้อง >= 18)

#### 3. "Firebase Admin not initialized"
**ไม่เป็นปัญหา!** Server จะใช้ Firestore Client SDK แทน

---

## 📝 สร้างไฟล์ .env (ถ้ายังไม่มี)

สร้างไฟล์ `server/.env`:

```env
PORT=3001
APP_ID=spu-hr-simple
FIREBASE_SERVICE_ACCOUNT=
```

**หมายเหตุ:** `FIREBASE_SERVICE_ACCOUNT` เป็น optional

---

## ✅ Checklist

- [ ] ติดตั้ง dependencies แล้ว (`npm install`)
- [ ] API Server รันอยู่ (ดู Console)
- [ ] Health Check ผ่านใน Browser (`http://localhost:3001/health`)
- [ ] Postman Environment ตั้งค่า `base_url` = `http://localhost:3001`
- [ ] Port 3001 ไม่ถูกใช้งาน

---

## 🚀 Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน API Server (เปิด Terminal ใหม่)
npm run dev:server

# 3. ทดสอบใน Browser
# เปิด: http://localhost:3001/health

# 4. ทดสอบใน Postman
# GET http://localhost:3001/health
```

---

**ถ้ายังไม่ได้ผล:** ดู Console Log ของ API Server และบอก Error Message ที่เห็น


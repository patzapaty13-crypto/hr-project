# 🚀 วิธีรัน API Server

## ⚡ Quick Start

### 1. เปิด Terminal/PowerShell

### 2. ไปที่โฟลเดอร์โปรเจกต์

```bash
cd "D:\hr poject"
```

### 3. รัน API Server

```bash
npm run dev:server
```

**หรือ**

```bash
node server/index.js
```

---

## ✅ ตรวจสอบว่า Server รันแล้ว

### วิธีที่ 1: ดู Console Output

คุณควรเห็น:
```
🚀 API Server running on port 3001
📡 Health check: http://localhost:3001/health
```

### วิธีที่ 2: เปิด Browser

ไปที่: `http://localhost:3001/health`

ควรเห็น:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### วิธีที่ 3: ทดสอบใน Postman

1. เปิด Postman
2. สร้าง Request ใหม่
3. Method: `GET`
4. URL: `http://localhost:3001/health`
5. คลิก **Send**

---

## ⚠️ หมายเหตุสำคัญ

**API Server ต้องรันอยู่ตลอดเวลา** ขณะที่ทดสอบใน Postman

- ถ้าปิด Terminal = Server หยุดทำงาน
- ถ้า Server หยุด = Postman จะได้ "No response"

---

## 🔄 รัน Server ใน Background (Windows)

### วิธีที่ 1: ใช้ PowerShell Start-Process

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\hr poject'; npm run dev:server"
```

### วิธีที่ 2: เปิด Terminal ใหม่

1. เปิด Terminal/PowerShell ใหม่
2. รัน `npm run dev:server`
3. ปล่อยให้ Terminal เปิดไว้

---

## 🛑 หยุด Server

กด `Ctrl + C` ใน Terminal ที่รัน Server

---

## 📝 Tips

- **เก็บ Terminal ไว้:** อย่าปิด Terminal ที่รัน Server
- **ดู Console:** ตรวจสอบ Error Messages ใน Console
- **ทดสอบ Health Check ก่อน:** ทดสอบ `/health` ก่อนทดสอบ endpoints อื่นๆ


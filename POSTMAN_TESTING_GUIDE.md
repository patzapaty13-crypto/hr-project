# 🧪 คู่มือทดสอบ API ด้วย Postman

## 📋 ขั้นตอนการทดสอบ

### 1. เริ่มต้น API Server

```bash
# เปิด Terminal 1: รัน API Server
npm run dev:server

# หรือ
npm run server
```

API Server จะรันที่ `http://localhost:3001`

### 2. นำเข้า Postman Collection

1. เปิด Postman
2. คลิก **Import** (มุมซ้ายบน)
3. เลือกไฟล์ `postman/SPU_Personnel_API.postman_collection.json`
4. Collection จะถูกเพิ่มเข้าไป

### 3. ตั้งค่า Environment Variable

1. ใน Postman คลิก **Environments** (ซ้าย)
2. สร้าง Environment ใหม่ชื่อ "SPU Personnel Local"
3. เพิ่ม Variable:
   - `base_url` = `http://localhost:3001`
4. เลือก Environment นี้

---

## 🧪 ตัวอย่างการทดสอบ

### ✅ 1. Health Check (ทดสอบก่อน)

**Request:**
```
GET http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

---

### 📝 2. สร้างคำขอใหม่ (Create Request)

**Request:**
```
POST http://localhost:3001/api/requests
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "position": "Software Engineer",
  "type": "new",
  "amount": 1,
  "description": "พัฒนาระบบ HR Management System ใช้ React และ Node.js",
  "facultyId": "it",
  "facultyName": "คณะเทคโนโลยีสารสนเทศ",
  "userId": "user123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "req_abc123",
    "position": "Software Engineer",
    "status": "submitted",
    "createdAt": "2025-01-XX...",
    ...
  }
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ใช้ทดสอบ endpoint อื่นๆ

---

### 📋 3. ดึงคำขอทั้งหมด (Get All Requests)

**Request:**
```
GET http://localhost:3001/api/requests?role=hr
```

**Query Parameters:**
- `role` = `hr` (หรือ `vp_hr`, `faculty`)
- `facultyId` = `it` (optional)
- `status` = `submitted` (optional)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req_abc123",
      "position": "Software Engineer",
      "status": "submitted",
      ...
    }
  ],
  "count": 1
}
```

---

### 🔍 4. ดึงคำขอตาม ID (Get Request by ID)

**Request:**
```
GET http://localhost:3001/api/requests/req_abc123
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "req_abc123",
    "position": "Software Engineer",
    "status": "submitted",
    ...
  }
}
```

---

### ✏️ 5. เปลี่ยนสถานะคำขอ (Update Status)

**Request:**
```
PATCH http://localhost:3001/api/requests/req_abc123/status
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "hr_review"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

**สถานะที่ใช้ได้:**
- `submitted`
- `hr_review`
- `vp_hr`
- `recruiting`
- `sourcing`
- `screening`
- `application_review`
- `interview_scheduled`
- `interview`
- `interview_result`
- `president`
- `notified`

---

### 🤖 6. สร้าง Job Description ด้วย AI

**Request:**
```
POST http://localhost:3001/api/ai/generate-jd
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "position": "Software Engineer",
  "type": "new",
  "amount": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "jobDescription": "ตำแหน่ง Software Engineer...",
    "position": "Software Engineer",
    "type": "new",
    "amount": 1
  }
}
```

**⚠️ หมายเหตุ:** ต้องตั้งค่า Gemini API Key ใน `utils/gemini.js` ก่อน

---

### 📊 7. วิเคราะห์ Resume ด้วย AI

**Request:**
```
POST http://localhost:3001/api/ai/analyze-resume
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "jobDescription": "ตำแหน่ง Software Engineer ต้องการประสบการณ์ 3 ปีขึ้นไป ใช้ React, Node.js",
  "resumeText": "มีประสบการณ์พัฒนาเว็บแอปพลิเคชัน 5 ปี ใช้ React, Node.js, MongoDB"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": "85%",
    "summary": "ผู้สมัครมีประสบการณ์ตรงกับตำแหน่ง...",
    "strengths": [
      "มีประสบการณ์ตรงกับที่ต้องการ",
      "ใช้เทคโนโลยีที่ตรงกับ JD"
    ],
    "gaps": [
      "ยังไม่มีประสบการณ์ด้าน DevOps"
    ],
    "recommendations": [
      "ควรเพิ่มประสบการณ์ด้าน CI/CD"
    ],
    "scores_breakdown": {
      "hr_functional_match": {
        "score": "90%",
        "reason": "..."
      },
      ...
    }
  }
}
```

---

### 👥 8. สร้างผู้ใช้ใหม่ (Create User)

**Request:**
```
POST http://localhost:3001/api/users
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "hr@spu.ac.th",
  "role": "hr",
  "name": "John Doe",
  "facultyId": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user_xyz789",
    "email": "hr@spu.ac.th",
    "role": "hr",
    ...
  }
}
```

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot GET /api/requests"

**สาเหตุ:** API Server ไม่ได้รัน

**แก้ไข:**
```bash
npm run dev:server
```

---

### ❌ Error: "Firebase Admin not initialized"

**สาเหตุ:** ไม่มี Firebase Service Account

**แก้ไข:**
1. สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`
2. เพิ่ม:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

---

### ❌ Error: "Connection refused"

**สาเหตุ:** Port 3001 ถูกใช้งานอยู่

**แก้ไข:**
1. เปลี่ยน PORT ใน `.env`:
   ```env
   PORT=3002
   ```
2. อัปเดต `base_url` ใน Postman เป็น `http://localhost:3002`

---

## 📚 ตัวอย่าง Request/Response เพิ่มเติม

ดูรายละเอียดเพิ่มเติมที่ `API_DOCUMENTATION.md`

---

## ✅ Checklist การทดสอบ

- [ ] Health Check ทำงาน
- [ ] สร้างคำขอใหม่ได้
- [ ] ดึงคำขอทั้งหมดได้
- [ ] ดึงคำขอตาม ID ได้
- [ ] เปลี่ยนสถานะได้
- [ ] สร้าง Job Description ด้วย AI ได้
- [ ] วิเคราะห์ Resume ด้วย AI ได้
- [ ] จัดการผู้ใช้ได้ (CRUD)

---

## 🎯 Tips

1. **ใช้ Variables:** เก็บ Request ID ใน Postman Variable เพื่อใช้ซ้ำ
2. **Save Responses:** บันทึก Response ตัวอย่างไว้ใน Postman
3. **Test Error Cases:** ทดสอบกรณี Error เช่น ส่งข้อมูลไม่ครบ
4. **Use Collection Runner:** รัน Collection ทั้งหมดอัตโนมัติ

---

**Happy Testing! 🚀**


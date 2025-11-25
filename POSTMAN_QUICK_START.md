# 🚀 Quick Start: ทดสอบ API ใน Postman

## ขั้นตอนที่ 1: เริ่มต้น API Server

เปิด Terminal และรัน:

```bash
npm run dev:server
```

หรือ

```bash
npm run server
```

คุณจะเห็น:
```
🚀 API Server running on port 3001
📡 Health check: http://localhost:3001/health
```

---

## ขั้นตอนที่ 2: นำเข้า Postman Collection

1. เปิด **Postman**
2. คลิก **Import** (มุมซ้ายบน)
3. เลือกไฟล์: `postman/SPU_Personnel_API.postman_collection.json`
4. Collection จะถูกเพิ่มเข้าไป

---

## ขั้นตอนที่ 3: ตั้งค่า Environment

1. คลิก **Environments** (ซ้าย)
2. คลิก **+** เพื่อสร้าง Environment ใหม่
3. ตั้งชื่อ: `SPU Personnel Local`
4. เพิ่ม Variable:
   - **Variable:** `base_url`
   - **Initial Value:** `http://localhost:3001`
   - **Current Value:** `http://localhost:3001`
5. คลิก **Save**
6. เลือก Environment นี้ (คลิกที่ชื่อ)

---

## ขั้นตอนที่ 4: ทดสอบ Health Check

1. เปิด Collection: **SPU Personnel System API**
2. ไปที่ **Health Check** → **Health Check**
3. คลิก **Send**

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

✅ ถ้าได้ Response แบบนี้ แสดงว่า API Server ทำงานแล้ว!

---

## 📝 ตัวอย่างการทดสอบแต่ละ Endpoint

### 1️⃣ สร้างคำขอใหม่

**Path:** `POST /api/requests`

**Body (JSON):**
```json
{
  "position": "Software Engineer",
  "type": "new",
  "amount": 1,
  "description": "พัฒนาระบบ HR Management System",
  "facultyId": "it",
  "facultyName": "คณะเทคโนโลยีสารสนเทศ",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "req_abc123",
    "position": "Software Engineer",
    "status": "submitted",
    "createdAt": "2025-01-XX..."
  }
}
```

**💡 Tip:** เก็บ `id` ที่ได้ไว้ (เช่น `req_abc123`) เพื่อใช้ทดสอบ endpoint อื่นๆ

---

### 2️⃣ ดึงคำขอทั้งหมด

**Path:** `GET /api/requests?role=hr`

**Query Params:**
- `role`: `hr` (หรือ `vp_hr`, `faculty`)
- `facultyId`: `it` (optional)
- `status`: `submitted` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req_abc123",
      "position": "Software Engineer",
      "status": "submitted"
    }
  ],
  "count": 1
}
```

---

### 3️⃣ ดึงคำขอตาม ID

**Path:** `GET /api/requests/:id`

**แก้ไข `:id` เป็น ID ที่ได้จากขั้นตอนที่ 1** (เช่น `req_abc123`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "req_abc123",
    "position": "Software Engineer",
    "status": "submitted",
    "type": "new",
    "amount": 1
  }
}
```

---

### 4️⃣ เปลี่ยนสถานะคำขอ

**Path:** `PATCH /api/requests/:id/status`

**แก้ไข `:id` เป็น ID ที่ได้จากขั้นตอนที่ 1**

**Body (JSON):**
```json
{
  "status": "hr_review"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

**สถานะที่ใช้ได้:**
- `submitted` → `hr_review` → `vp_hr` → `recruiting` → `sourcing` → `screening` → `application_review` → `interview_scheduled` → `interview` → `interview_result` → `president` → `notified`

---

### 5️⃣ สร้าง Job Description ด้วย AI

**Path:** `POST /api/ai/generate-jd`

**Body (JSON):**
```json
{
  "position": "Software Engineer",
  "type": "new",
  "amount": 1
}
```

**Response:**
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

### 6️⃣ วิเคราะห์ Resume ด้วย AI

**Path:** `POST /api/ai/analyze-resume`

**Body (JSON):**
```json
{
  "jobDescription": "ตำแหน่ง Software Engineer ต้องการประสบการณ์ 3 ปีขึ้นไป ใช้ React, Node.js",
  "resumeText": "มีประสบการณ์พัฒนาเว็บแอปพลิเคชัน 5 ปี ใช้ React, Node.js, MongoDB"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": "85%",
    "summary": "ผู้สมัครมีประสบการณ์ตรงกับตำแหน่ง...",
    "strengths": ["มีประสบการณ์ตรง", "ใช้เทคโนโลยีที่ตรง"],
    "gaps": ["ยังไม่มีประสบการณ์ด้าน DevOps"],
    "recommendations": ["ควรเพิ่มประสบการณ์ด้าน CI/CD"],
    "scores_breakdown": {
      "hr_functional_match": {
        "score": "90%",
        "reason": "..."
      }
    }
  }
}
```

---

### 7️⃣ สร้างผู้ใช้ใหม่

**Path:** `POST /api/users`

**Body (JSON):**
```json
{
  "email": "hr@spu.ac.th",
  "role": "hr",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user_xyz789",
    "email": "hr@spu.ac.th",
    "role": "hr"
  }
}
```

---

## 🎯 Tips สำหรับ Postman

### 1. ใช้ Variables เพื่อเก็บ ID

1. หลังจากสร้าง Request สำเร็จ
2. คลิก **Tests** tab
3. เพิ่มโค้ด:
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("request_id", jsonData.data.id);
}
```
4. ใช้ `{{request_id}}` ใน endpoint อื่นๆ

### 2. Save Response เป็น Example

1. หลังจากได้ Response
2. คลิก **Save Response** → **Save as Example**
3. จะมี Example Response ไว้ดู

### 3. ใช้ Collection Runner

1. คลิก **Run** (Collection)
2. เลือก Requests ที่ต้องการทดสอบ
3. คลิก **Run SPU Personnel System API**
4. จะรันทุก Request อัตโนมัติ

---

## 🐛 แก้ไขปัญหา

### ❌ "Cannot connect to server"

**แก้ไข:**
1. ตรวจสอบว่า API Server รันอยู่: `npm run dev:server`
2. ตรวจสอบ Port: ควรเป็น `3001`
3. ตรวจสอบ `base_url` ใน Environment

### ❌ "404 Not Found"

**แก้ไข:**
- ตรวจสอบ URL: ต้องเป็น `http://localhost:3001/api/...`
- ตรวจสอบ Method: GET, POST, PUT, PATCH, DELETE

### ❌ "500 Internal Server Error"

**แก้ไข:**
- ตรวจสอบ Firebase Service Account ใน `.env`
- ดู Console Log ของ API Server

---

## ✅ Checklist

- [ ] API Server รันที่ Port 3001
- [ ] Health Check ผ่าน
- [ ] สร้างคำขอใหม่ได้
- [ ] ดึงคำขอได้
- [ ] เปลี่ยนสถานะได้
- [ ] AI Endpoints ทำงาน (ถ้ามี API Key)

---

**พร้อมทดสอบแล้ว! 🚀**

ดูรายละเอียดเพิ่มเติมที่ `POSTMAN_TESTING_GUIDE.md`


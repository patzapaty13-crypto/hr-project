# RESTful API Documentation

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Requests

#### GET /api/requests
ดึงคำขอทั้งหมด

**Query Parameters:**
- `role` (string, optional): บทบาท (hr, vp_hr, faculty)
- `facultyId` (string, optional): ID ของคณะ
- `status` (string, optional): สถานะคำขอ

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### GET /api/requests/:id
ดึงคำขอตาม ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "req123",
    "position": "Software Engineer",
    "status": "submitted",
    ...
  }
}
```

#### POST /api/requests
สร้างคำขอใหม่

**Request Body:**
```json
{
  "position": "Software Engineer",
  "type": "new",
  "amount": 1,
  "description": "...",
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
    "id": "req123",
    ...
  }
}
```

#### PUT /api/requests/:id
อัปเดตคำขอ

**Request Body:**
```json
{
  "position": "Updated Position",
  "description": "..."
}
```

#### PATCH /api/requests/:id/status
เปลี่ยนสถานะคำขอ

**Request Body:**
```json
{
  "status": "hr_review"
}
```

#### DELETE /api/requests/:id
ลบคำขอ

### Users

#### GET /api/users
ดึงผู้ใช้ทั้งหมด

#### GET /api/users/:id
ดึงผู้ใช้ตาม ID

#### POST /api/users
สร้างผู้ใช้ใหม่

**Request Body:**
```json
{
  "email": "user@spu.ac.th",
  "role": "hr",
  "facultyId": "it"
}
```

#### PUT /api/users/:id
อัปเดตผู้ใช้

#### DELETE /api/users/:id
ลบผู้ใช้

### AI

#### POST /api/ai/generate-jd
สร้าง Job Description ด้วย AI

**Request Body:**
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
    "jobDescription": "...",
    "position": "Software Engineer",
    "type": "new",
    "amount": 1
  }
}
```

#### POST /api/ai/analyze-resume
วิเคราะห์ Resume ด้วย AI

**Request Body:**
```json
{
  "jobDescription": "...",
  "resumeText": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": "85%",
    "summary": "...",
    "strengths": [...],
    "gaps": [...],
    "recommendations": [...],
    "scores_breakdown": {...}
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Health Check

#### GET /health
ตรวจสอบสถานะ API

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```


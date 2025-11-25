# RESTful API Setup Guide

## การติดตั้ง

```bash
# ติดตั้ง dependencies
npm install
```

## การรัน API Server

```bash
# Development mode (with auto-reload)
npm run dev:server

# Production mode
npm run server
```

API Server จะรันที่ `http://localhost:3001`

## การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`:

```env
# Firebase Service Account (JSON string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Server Port
PORT=3001

# App ID
APP_ID=spu-hr-simple
```

## การใช้งาน API

ดูเอกสาร API ที่ `API_DOCUMENTATION.md`

## Frontend Integration

ตั้งค่า `VITE_API_URL` ใน `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

จากนั้นใช้ `utils/api.js` ใน frontend:

```javascript
import { requestsAPI } from './utils/api';

// ดึงคำขอทั้งหมด
const response = await requestsAPI.getAll({ role: 'hr' });

// สร้างคำขอใหม่
const newRequest = await requestsAPI.create({
  position: 'Software Engineer',
  type: 'new',
  amount: 1,
  ...
});
```


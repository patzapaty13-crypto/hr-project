/**
 * ============================================================================
 * RESTful API Server for SPU Personnel System
 * ============================================================================
 * 
 * Endpoints:
 * - GET    /api/requests           - ดึงคำขอทั้งหมด
 * - GET    /api/requests/:id      - ดึงคำขอตาม ID
 * - POST   /api/requests           - สร้างคำขอใหม่
 * - PUT    /api/requests/:id       - อัปเดตคำขอ
 * - PATCH  /api/requests/:id/status - เปลี่ยนสถานะคำขอ
 * - DELETE /api/requests/:id      - ลบคำขอ
 * 
 * - GET    /api/users              - ดึงผู้ใช้ทั้งหมด
 * - POST   /api/users              - สร้างผู้ใช้ใหม่
 * - PUT    /api/users/:id          - อัปเดตผู้ใช้
 * - DELETE /api/users/:id         - ลบผู้ใช้
 * 
 * - POST   /api/analyze-resume     - วิเคราะห์ Resume ด้วย AI
 * - POST   /api/generate-jd        - สร้าง Job Description ด้วย AI
 * 
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import requestsRouter from './routes/requests.js';
import usersRouter from './routes/users.js';
import aiRouter from './routes/ai.js';

// Load environment variables
dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️ Firebase Service Account not found, using Firestore client SDK');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
}

// Routes
app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SPU Personnel System API',
    version: '1.0.0',
    endpoints: {
      requests: '/api/requests',
      users: '/api/users',
      ai: '/api/ai',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      path: req.path
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;


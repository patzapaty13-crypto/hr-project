/**
 * ============================================================================
 * Configuration: Firebase Setup (firebase.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ตั้งค่าและเริ่มต้น Firebase App
 * - สร้าง Authentication Instance สำหรับจัดการการเข้าสู่ระบบ
 * - สร้าง Firestore Instance สำหรับจัดการฐานข้อมูล
 * - Export Configuration ทั้งหมดให้ Components อื่นใช้
 * 
 * Firebase Services ที่ใช้:
 * 1. Firebase Authentication (auth)
 *   - จัดการการเข้าสู่ระบบ/ออกจากระบบ
 *   - Anonymous Authentication (ไม่ระบุตัวตน)
 * 
 * 2. Cloud Firestore (db)
 *   - เก็บข้อมูลคำขอทั้งหมด
 *   - Real-time Database (อัปเดตอัตโนมัติเมื่อข้อมูลเปลี่ยน)
 * 
 * การตั้งค่า:
 * - ต้องตั้งค่า Firebase Config ใน index.html (window.__firebase_config)
 * - ต้องตั้งค่า App ID ใน index.html (window.__app_id)
 * 
 * ============================================================================
 */

// ============================================================================
// นำเข้า Firebase Functions
// ============================================================================
// initializeApp: ฟังก์ชันสำหรับเริ่มต้น Firebase App
// getAuth: ฟังก์ชันสำหรับสร้าง Authentication Instance
// getFirestore: ฟังก์ชันสำหรับสร้าง Firestore Database Instance
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ============================================================================
// Firebase Configuration
// ============================================================================
/**
 * ดึงค่า Config จาก window.__firebase_config (ตั้งค่าใน index.html)
 * 
 * Firebase Config ต้องมี Properties ดังนี้:
 * - apiKey: API Key ของ Firebase Project
 * - authDomain: Domain สำหรับ Authentication (เช่น project.firebaseapp.com)
 * - projectId: ID ของ Firebase Project
 * - storageBucket: Storage Bucket URL
 * - messagingSenderId: Sender ID สำหรับ Cloud Messaging
 * - appId: App ID ของ Firebase App
 * 
 * หมายเหตุ: 
 * - ถ้าไม่มี __firebase_config จะได้ Empty Object {}
 * - ควรตั้งค่าใน index.html ก่อนใช้งาน
 */
let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(window.__firebase_config || '{}');
} catch (e) {
  console.warn('ไม่สามารถ parse Firebase config ได้:', e);
  firebaseConfig = {};
}

// ============================================================================
// Initialize Firebase Services
// ============================================================================
/**
 * เริ่มต้นใช้งาน Firebase App
 * initializeApp ใช้ Firebase Config เพื่อเชื่อมต่อกับ Firebase Project
 * 
 * @returns {FirebaseApp} - Firebase App Instance
 */
let app;
try {
  // ตรวจสอบว่ามี config ที่จำเป็นหรือไม่
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY' && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    // ถ้าไม่มี config ใช้ default config (เพื่อหลีกเลี่ยง error)
    console.warn('Firebase config ไม่ครบถ้วน ใช้การทำงานแบบ Local State');
    app = null;
  }
} catch (error) {
  console.error('เกิดข้อผิดพลาดในการ initialize Firebase:', error);
  app = null;
}

/**
 * สร้าง Authentication Instance
 * getAuth ใช้สำหรับจัดการการเข้าสู่ระบบ/ออกจากระบบ
 * 
 * Features ที่ใช้:
 * - Anonymous Authentication (signInAnonymously)
 * - Custom Token Authentication (signInWithCustomToken)
 * - Sign Out (signOut)
 * - Auth State Listener (onAuthStateChanged)
 * 
 * @returns {Auth|null} - Authentication Instance หรือ null ถ้าไม่มี app
 */
let auth = null;
try {
  if (app) {
    auth = getAuth(app);
  }
} catch (error) {
  console.error('เกิดข้อผิดพลาดในการสร้าง Auth instance:', error);
  auth = null;
}

/**
 * สร้าง Firestore Database Instance
 * getFirestore ใช้สำหรับอ่าน/เขียนข้อมูลใน Firestore Database
 * 
 * Features ที่ใช้:
 * - Collection Reference (collection)
 * - Document Reference (doc)
 * - Real-time Listener (onSnapshot)
 * - Add Document (addDoc)
 * - Update Document (updateDoc)
 * 
 * @returns {Firestore|null} - Firestore Database Instance หรือ null ถ้าไม่มี app
 */
let db = null;
try {
  if (app) {
    db = getFirestore(app);
  }
} catch (error) {
  console.error('เกิดข้อผิดพลาดในการสร้าง Firestore instance:', error);
  db = null;
}

/**
 * App ID สำหรับ Firestore Path
 * 
 * ใช้สำหรับสร้าง Path ใน Firestore:
 * artifacts/{appId}/public/data/requests
 * 
 * ตัวอย่าง: artifacts/spu-hr-simple/public/data/requests
 * 
 * หมายเหตุ:
 * - ดึงจาก window.__app_id (ตั้งค่าใน index.html)
 * - ถ้าไม่มี จะใช้ค่า Default: 'spu-hr-simple'
 * - ควรตั้งค่าใน index.html ก่อนใช้งาน
 */
const appId = typeof window !== 'undefined' && window.__app_id 
  ? window.__app_id 
  : 'spu-hr-simple';

// ============================================================================
// Export Firebase Services
// ============================================================================
/**
 * Export ทั้งหมดให้ Components อื่นใช้
 * 
 * - app: Firebase App Instance (อาจไม่ค่อยได้ใช้)
 * - auth: Authentication Instance (ใช้ใน App.jsx)
 * - db: Firestore Database Instance (ใช้ใน Dashboard.jsx, SimpleForm.jsx)
 * - appId: App ID สำหรับ Firestore Path (ใช้ใน Dashboard.jsx, SimpleForm.jsx)
 */
export { app, auth, db, appId };


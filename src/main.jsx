/**
 * ============================================================================
 * Entry Point: จุดเริ่มต้นของแอปพลิเคชัน (src/main.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - Import และ Render Component หลัก (App.jsx)
 * - จัดการ DOM และ React Root
 * - เริ่มต้นแอปพลิเคชัน
 * 
 * การทำงาน:
 * 1. Import React และ ReactDOM
 * 2. Import App Component (Component หลัก)
 * 3. หา Element ที่มี id="root" จาก index.html
 * 4. สร้าง React Root
 * 5. Render App Component ลงใน Root
 * 
 * React.StrictMode:
 * - เปิดใช้งาน Strict Mode เพื่อตรวจสอบปัญหาใน Development
 * - ช่วยตรวจสอบ Deprecated APIs และ Potential Issues
 * - ไม่มีผลกระทบใน Production
 * 
 * ============================================================================
 */

// ============================================================================
// นำเข้า React และ ReactDOM
// ============================================================================
// React: ไลบรารีหลักสำหรับสร้าง UI Components
// ReactDOM: ไลบรารีสำหรับ Render Components ลงใน DOM
import React from 'react';
import ReactDOM from 'react-dom/client';

// ============================================================================
// นำเข้า React Router
// ============================================================================
import { BrowserRouter } from 'react-router-dom';

// ============================================================================
// นำเข้า App Component (Component หลัก)
// ============================================================================
// App: Component หลักของแอปพลิเคชัน (จัดการ Authentication และ Navigation)
import App from '../App.jsx';

// ============================================================================
// นำเข้า Error Boundary
// ============================================================================
import ErrorBoundary from '../components/ErrorBoundary';

// ============================================================================
// Render แอปพลิเคชัน
// ============================================================================
/**
 * ReactDOM.createRoot: สร้าง React Root สำหรับ React 18+
 * 
 * document.getElementById('root'):
 * - หา Element ที่มี id="root" จาก index.html
 * - Element นี้คือจุดที่ React จะ Render Components ทั้งหมดลงไป
 * 
 * .render(): Render App Component ลงใน Root
 * 
 * React.StrictMode:
 * - Component ที่ช่วยตรวจสอบปัญหาใน Development Mode
 * - ตรวจสอบ Components ที่ใช้ Deprecated APIs
 * - ตรวจสอบ Side Effects และ Potential Issues
 * - ไม่มีผลกระทบใน Production Build
 * 
 * ErrorBoundary:
 * - จับ Error ที่เกิดขึ้นใน Component Tree
 * - แสดง Error UI แทนที่จะให้แอป crash
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a div with id="root"');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);


/**
 * ============================================================================
 * ไฟล์หลักของแอปพลิเคชัน (App.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - จัดการ Authentication (การเข้าสู่ระบบ/ออกจากระบบ)
 * - จัดการ State หลักของแอป (บทบาท, คณะ, ผู้ใช้)
 * - แสดงหน้า Login หรือ Dashboard ตามสถานะ
 * - ควบคุมการแสดง/ซ่อน Form สร้างคำขอใหม่
 * 
 * การทำงาน:
 * 1. เมื่อเปิดแอป -> ตรวจสอบสถานะ Login
 * 2. ถ้ายังไม่ Login -> แสดงหน้า LoginPage
 * 3. ถ้า Login แล้ว -> แสดงหน้า Dashboard
 * 4. เมื่อกดสร้างคำขอ -> แสดง Popup Form
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// ============================================================================
// นำเข้า Firebase Authentication Functions
// ============================================================================
// signInAnonymously: เข้าสู่ระบบแบบไม่ระบุตัวตน (Anonymous Login)
// signInWithCustomToken: เข้าสู่ระบบด้วย Custom Token (สำหรับกรณีพิเศษ)
// onAuthStateChanged: ฟังก์ชันสำหรับตรวจจับการเปลี่ยนแปลงสถานะ Login
// signOut: ฟังก์ชันสำหรับออกจากระบบ
import { 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

// ============================================================================
// นำเข้า Firebase Configuration
// ============================================================================
// auth: Object ที่ใช้จัดการ Authentication ทั้งหมด
import { auth } from './config/firebase';

// ============================================================================
// นำเข้า Components
// ============================================================================
// LoginPage: Component สำหรับหน้าเข้าสู่ระบบ
// Dashboard: Component สำหรับหน้า Dashboard แสดงรายการคำขอ
// AdminDashboard: Component สำหรับหน้า Admin Dashboard พร้อม Charts
// SimpleForm: Component สำหรับ Popup สร้างคำขอใหม่
// ConfirmationPage: หน้ายืนยันคำขอผ่านอีเมล
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import SimpleForm from './components/SimpleForm';
import ConfirmationPage from './components/ConfirmationPage';

// ============================================================================
// Component หลักของแอปพลิเคชัน
// ============================================================================
export default function App() {
  // ========================================================================
  // State Management (การจัดการสถานะ)
  // ========================================================================
  // user: เก็บข้อมูลผู้ใช้ที่ Login จาก Firebase Auth (null ถ้ายังไม่ Login)
  const [user, setUser] = useState(null);
  
  // role: บทบาทของผู้ใช้ ('hr' = เจ้าหน้าที่ HR, 'faculty' = คณะ/หน่วยงาน)
  const [role, setRole] = useState(null);
  
  // selectedFaculty: ข้อมูลคณะที่เลือก (null ถ้าเป็น HR)
  // เก็บ Object ที่มี id และ name ของคณะ
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  // showForm: ควบคุมการแสดง/ซ่อน Popup Form สร้างคำขอใหม่ (true = แสดง, false = ซ่อน)
  const [showForm, setShowForm] = useState(false);
  
  // useAdminDashboard: ควบคุมการแสดง Admin Dashboard หรือ Dashboard ปกติ (true = Admin Dashboard, false = Dashboard ปกติ)
  const [useAdminDashboard, setUseAdminDashboard] = useState(false);

  // ========================================================================
  // useEffect Hook: จัดการ Authentication เมื่อ Component โหลด
  // ========================================================================
  // useEffect(() => {...}, []) - รันเมื่อ Component โหลดครั้งแรกเท่านั้น
  useEffect(() => {
    /**
     * ฟังก์ชันเริ่มต้น Authentication
     * ตรวจสอบว่ามี Custom Token หรือไม่ ถ้ามีก็ Login อัตโนมัติ
     */
    const initAuth = async () => {
      // ตรวจสอบว่าอยู่ใน Browser และมี Token พิเศษหรือไม่
      // window.__initial_auth_token: Token ที่ตั้งค่าไว้ใน index.html (ถ้ามี)
      if (typeof window !== 'undefined' && window.__initial_auth_token) {
        // Login ด้วย Custom Token (สำหรับกรณีพิเศษ)
        await signInWithCustomToken(auth, window.__initial_auth_token);
      } else {
        // ถ้าไม่มี Token ก็รอให้ผู้ใช้กด Login เองในหน้า LoginPage
        // ไม่ต้องทำอะไร เพียงรอให้ผู้ใช้เลือกบทบาทและกด Login
      }
    };
    
    // เรียกใช้ฟังก์ชันเริ่มต้น Authentication
    initAuth();
    
    /**
     * ตั้ง Listener สำหรับตรวจจับการเปลี่ยนแปลงสถานะ Login
     * onAuthStateChanged จะทำงานทุกครั้งที่:
     * - มีคน Login เข้า
     * - มีคน Logout ออก
     * - Token หมดอายุ
     */
    let unsub = null;
    if (auth) {
      try {
        unsub = onAuthStateChanged(auth, (currentUser) => {
          // currentUser: Object ของผู้ใช้ที่ Login (null ถ้า Logout)
          setUser(currentUser);
          
          // ถ้าผู้ใช้ Logout ให้เคลียร์ State ทั้งหมด
          if (!currentUser) {
            setRole(null);
            setSelectedFaculty(null);
          }
        });
      } catch (error) {
        console.warn('ไม่สามารถตั้งค่า Auth State Listener ได้:', error);
      }
    }
    
    /**
     * Cleanup Function: จะถูกเรียกเมื่อ Component ถูกลบออกจาก DOM
     * เพื่อหยุดการฟัง (unsubscribe) การเปลี่ยนแปลงสถานะ Login
     * ป้องกัน Memory Leak
     */
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []); // [] = รันเพียงครั้งเดียวเมื่อ Component โหลด

  // ========================================================================
  // ฟังก์ชันจัดการ Login (เรียกจาก LoginPage)
  // ========================================================================
  /**
   * handleLogin: ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม Login ในหน้า LoginPage
   * 
   * @param {string} userRole - บทบาทของผู้ใช้ ('hr' หรือ 'faculty')
   * @param {Object|null} faculty - ข้อมูลคณะที่เลือก (null ถ้าเป็น HR)
   */
  const handleLogin = async (userRole, faculty) => {
    try {
      // ตรวจสอบว่ามี auth instance หรือไม่
      if (!auth) {
        // ถ้าไม่มี auth ให้ใช้ Local State โดยตรง
        console.warn('Firebase Auth ไม่พร้อมใช้งาน ใช้การ Login แบบ Local State');
        setRole(userRole);
        setSelectedFaculty(faculty);
        // สร้าง mock user object เพื่อให้ระบบทำงานได้
        setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
        return;
      }

      // ตรวจสอบว่ามี Firebase config หรือไม่
      const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        // ถ้ายังไม่ได้ตั้งค่า Firebase ให้ข้ามการ Login และใช้ State โดยตรง
        console.warn('Firebase config ไม่ถูกต้อง ใช้การ Login แบบ Local State');
        setRole(userRole);
        setSelectedFaculty(faculty);
        // สร้าง mock user object เพื่อให้ระบบทำงานได้
        setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
        return;
      }

      // สร้าง Session จริงใน Firebase ด้วย Anonymous Authentication
      // ไม่ต้องระบุ Email/Password แต่ Firebase จะสร้าง User ID ให้อัตโนมัติ
      try {
        await signInAnonymously(auth);
        // หลังจาก signInAnonymously สำเร็จ onAuthStateChanged จะทำงานอัตโนมัติ
        // และ setUser ให้อัตโนมัติ
      } catch (authError) {
        // ถ้า Firebase Auth ล้มเหลว ให้ใช้ Local State แทน
        console.warn('Firebase Authentication ล้มเหลว ใช้การ Login แบบ Local State:', authError);
        // สร้าง mock user object เพื่อให้ระบบทำงานได้
        setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
      }
      
      // เก็บบทบาทและคณะที่เลือกไว้ใน State
      setRole(userRole);
      setSelectedFaculty(faculty);
    } catch (error) {
      // จัดการ Error ทั่วไป
      console.error('เกิดข้อผิดพลาดในการ Login:', error);
      // แม้เกิด error ก็ให้ Login แบบ Local State เพื่อให้ใช้งานได้
      setRole(userRole);
      setSelectedFaculty(faculty);
      setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
    }
  };

  // ========================================================================
  // ฟังก์ชันจัดการ Logout
  // ========================================================================
  /**
   * handleLogout: ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้กดปุ่มออกจากระบบ
   * จะทำการ Sign Out จาก Firebase Auth
   * เมื่อ Sign Out แล้ว onAuthStateChanged จะทำงานและเคลียร์ State อัตโนมัติ
   */
  const handleLogout = () => {
    if (auth) {
      try {
        signOut(auth);
        // หลังจาก signOut แล้ว onAuthStateChanged จะทำงานและเคลียร์ State ทั้งหมด
      } catch (error) {
        console.warn('เกิดข้อผิดพลาดในการ Logout:', error);
        // แม้เกิด error ก็เคลียร์ State โดยตรง
        setUser(null);
        setRole(null);
        setSelectedFaculty(null);
      }
    } else {
      // ถ้าไม่มี auth ให้เคลียร์ State โดยตรง
      setUser(null);
      setRole(null);
      setSelectedFaculty(null);
    }
  };

  // ========================================================================
  // Conditional Rendering: แสดงหน้า Login หรือ Dashboard
  // ========================================================================
  
  /**
   * ถ้ายังไม่ Login หรือไม่มีบทบาท ให้แสดงหน้า LoginPage
   * - !user: ยังไม่มีข้อมูลผู้ใช้ (ยังไม่ Login)
   * - !role: ยังไม่ได้เลือกบทบาท
   */
  if (!user || !role) {
    return (
      <LoginPage 
        onLogin={handleLogin}  // ส่งฟังก์ชัน handleLogin ไปให้ LoginPage เรียกใช้
      />
    );
  }

  /**
   * ถ้า Login แล้ว ให้แสดง Dashboard และ Form (ถ้าเปิดอยู่)
   */
  return (
    <Routes>
      {/* Route สำหรับ Confirmation Page (ไม่ต้อง Login) */}
      <Route path="/confirm/:requestId" element={<ConfirmationPage />} />
      
      {/* Route หลัก (ต้อง Login) */}
      <Route path="*" element={
        <>
          {/* 
            Conditional Rendering: แสดง AdminDashboard หรือ Dashboard ตาม useAdminDashboard
            - ถ้า useAdminDashboard = true และ role = 'hr' → แสดง AdminDashboard
            - ถ้าไม่ → แสดง Dashboard ปกติ
          */}
          {useAdminDashboard && role === 'hr' ? (
            <AdminDashboard 
              userRole={role} 
              faculty={selectedFaculty} 
              onLogout={handleLogout}
              onCreateRequest={() => setShowForm(true)}
            />
          ) : (
            <>
              {/* 
                Component Dashboard: หน้าแสดงรายการคำขอทั้งหมด
                Props ที่ส่งไป:
                - userRole: บทบาทของผู้ใช้ (สำหรับกรองข้อมูลและแสดงปุ่ม)
                - faculty: ข้อมูลคณะ (สำหรับกรองข้อมูล)
                - onLogout: ฟังก์ชันสำหรับออกจากระบบ
                - onCreateRequest: ฟังก์ชันสำหรับเปิด Popup Form
                - onSwitchToAdmin: ฟังก์ชันสำหรับสลับไป Admin Dashboard (สำหรับ HR)
              */}
              <Dashboard 
                userRole={role} 
                faculty={selectedFaculty} 
                onLogout={handleLogout}
                onCreateRequest={() => setShowForm(true)}  // เมื่อกดปุ่มสร้างคำขอ ให้แสดง Form
                onSwitchToAdmin={role === 'hr' ? () => setUseAdminDashboard(true) : undefined}
              />
            </>
          )}
          
          {/* 
            Conditional Rendering: แสดง SimpleForm เฉพาะเมื่อ showForm = true
            Component SimpleForm: Popup สำหรับสร้างคำขอใหม่
            Props ที่ส่งไป:
            - faculty: ข้อมูลคณะที่เลือก (สำหรับแสดงใน Form)
            - userId: ID ของผู้ใช้ (สำหรับเก็บไว้ในข้อมูลคำขอ)
            - onClose: ฟังก์ชันสำหรับปิด Popup
            - onSubmit: ฟังก์ชันที่เรียกหลังจากบันทึกข้อมูลสำเร็จ
          */}
          {showForm && (
            <SimpleForm 
              faculty={selectedFaculty} 
              userId={user.uid}  // user.uid = Firebase User ID
              onClose={() => setShowForm(false)}  // เมื่อกดปิด ให้ซ่อน Form
              onSubmit={() => setShowForm(false)}  // เมื่อบันทึกสำเร็จ ให้ซ่อน Form
            />
          )}
        </>
      } />
    </Routes>
  );
}

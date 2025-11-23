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
// AdminDashboard: Component สำหรับหน้า Admin Dashboard พร้อม Charts (ใช้ dynamic import เพื่อลด bundle size)
// SimpleForm: Component สำหรับ Popup สร้างคำขอใหม่
// ConfirmationPage: หน้ายืนยันคำขอผ่านอีเมล
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import SimpleForm from './components/SimpleForm';
import ConfirmationPage from './components/ConfirmationPage';

// Dynamic import สำหรับ AdminDashboard เพื่อลด initial bundle size
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

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
  
  // showRegister: ควบคุมการแสดงหน้า Register (true = แสดง Register, false = แสดง Login)
  const [showRegister, setShowRegister] = useState(false);
  
  // isLoading: ควบคุมการแสดง loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // useAdminDashboard: ควบคุมการแสดง Admin Dashboard หรือ Dashboard ปกติ (true = Admin Dashboard, false = Dashboard ปกติ)
  // เก็บค่าใน localStorage เพื่อให้คงอยู่หลัง refresh
  const [useAdminDashboard, setUseAdminDashboard] = useState(() => {
    // อ่านค่าจาก localStorage เมื่อ component โหลดครั้งแรก
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spu_hr_useAdminDashboard');
      return saved === 'true';
    }
    return false;
  });

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
      try {
        // ตรวจสอบว่าอยู่ใน Browser และมี Token พิเศษหรือไม่
        // window.__initial_auth_token: Token ที่ตั้งค่าไว้ใน index.html (ถ้ามี)
        if (typeof window !== 'undefined' && window.__initial_auth_token && auth) {
          // Login ด้วย Custom Token (สำหรับกรณีพิเศษ) - เพิ่ม timeout
          const authPromise = signInWithCustomToken(auth, window.__initial_auth_token);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Authentication timeout')), 10000)
          );
          await Promise.race([authPromise, timeoutPromise]);
        } else {
          // ถ้าไม่มี Token ก็รอให้ผู้ใช้กด Login เองในหน้า LoginPage
          // ไม่ต้องทำอะไร เพียงรอให้ผู้ใช้เลือกบทบาทและกด Login
        }
      } catch (error) {
        console.warn('Error in initAuth:', error);
        // ไม่ throw error เพื่อให้แอปทำงานต่อได้
      }
    };
    
    // เรียกใช้ฟังก์ชันเริ่มต้น Authentication (ไม่ await เพื่อไม่ให้ block)
    initAuth().catch(console.error);
    
    /**
     * ตั้ง Listener สำหรับตรวจจับการเปลี่ยนแปลงสถานะ Login
     * onAuthStateChanged จะทำงานทุกครั้งที่:
     * - มีคน Login เข้า
     * - มีคน Logout ออก
     * - Token หมดอายุ
     */
    let unsub = null;
    let authStateTimeout = null;
    
    if (auth) {
      try {
        // เพิ่ม timeout สำหรับ auth state change
        authStateTimeout = setTimeout(() => {
          setIsLoading(false);
        }, 5000); // ถ้า 5 วินาทียังไม่ตอบกลับ ให้ปิด loading
        
        unsub = onAuthStateChanged(auth, (currentUser) => {
          // Clear timeout เมื่อได้รับ response
          if (authStateTimeout) {
            clearTimeout(authStateTimeout);
            authStateTimeout = null;
          }
          
          // currentUser: Object ของผู้ใช้ที่ Login (null ถ้า Logout)
          setUser(currentUser);
          setIsLoading(false);
          
          // ถ้าผู้ใช้ Logout ให้เคลียร์ State ทั้งหมด
          if (!currentUser) {
            setRole(null);
            setSelectedFaculty(null);
            setUseAdminDashboard(false);
            // ลบค่า useAdminDashboard จาก localStorage เมื่อ Logout
            if (typeof window !== 'undefined') {
              try {
                localStorage.removeItem('spu_hr_useAdminDashboard');
              } catch (e) {
                console.warn('Error removing from localStorage:', e);
              }
            }
          } else {
            // ถ้ามี user ให้ลองโหลดข้อมูลจาก localStorage
            if (typeof window !== 'undefined') {
              try {
                const savedRole = localStorage.getItem('spu_hr_role');
                const savedFaculty = localStorage.getItem('spu_hr_faculty');
                if (savedRole) {
                  setRole(savedRole);
                }
                if (savedFaculty) {
                  try {
                    setSelectedFaculty(JSON.parse(savedFaculty));
                  } catch (e) {
                    console.warn('Error parsing saved faculty:', e);
                  }
                }
              } catch (e) {
                console.warn('Error reading from localStorage:', e);
              }
            }
          }
        }, (error) => {
          // Error callback
          if (authStateTimeout) {
            clearTimeout(authStateTimeout);
            authStateTimeout = null;
          }
          console.warn('Auth state change error:', error);
          setIsLoading(false);
        });
      } catch (error) {
        if (authStateTimeout) {
          clearTimeout(authStateTimeout);
        }
        console.warn('ไม่สามารถตั้งค่า Auth State Listener ได้:', error);
        setIsLoading(false);
      }
    } else {
      // ถ้าไม่มี auth ให้ปิด loading ทันที
      setIsLoading(false);
    }
    
    /**
     * Cleanup Function: จะถูกเรียกเมื่อ Component ถูกลบออกจาก DOM
     * เพื่อหยุดการฟัง (unsubscribe) การเปลี่ยนแปลงสถานะ Login
     * ป้องกัน Memory Leak
     */
    return () => {
      if (authStateTimeout) {
        clearTimeout(authStateTimeout);
      }
      if (unsub) {
        try {
          unsub();
        } catch (error) {
          console.warn('Error unsubscribing auth state:', error);
        }
      }
    };
  }, []); // [] = รันเพียงครั้งเดียวเมื่อ Component โหลด

  // ========================================================================
  // ฟังก์ชันจัดการ Login (เรียกจาก LoginPage)
  // ========================================================================
  /**
   * handleLogin: ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม Login ในหน้า LoginPage
   * 
   * @param {string} userRole - บทบาทของผู้ใช้ ('hr', 'vp_hr', 'president', หรือ 'faculty')
   * @param {Object|null} faculty - ข้อมูลคณะที่เลือก (null ถ้าไม่ใช่ faculty)
   * @param {Object} firebaseUser - Firebase User Object (ถ้ามี)
   */
  const handleLogin = async (userRole, faculty, firebaseUser = null) => {
    try {
      // ถ้ามี Firebase User (จาก Email/Password Login) ให้ใช้
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // ถ้าไม่มี auth instance ให้ใช้ Local State
        if (!auth) {
          console.warn('Firebase Auth ไม่พร้อมใช้งาน ใช้การ Login แบบ Local State');
          setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
        } else {
          // ตรวจสอบว่ามี Firebase config หรือไม่
          try {
            const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
              console.warn('Firebase config ไม่ถูกต้อง ใช้การ Login แบบ Local State');
              setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
            } else {
              // ใช้ Anonymous Authentication เป็น fallback (เพิ่ม timeout)
              try {
                const authPromise = signInAnonymously(auth);
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Authentication timeout')), 10000)
                );
                await Promise.race([authPromise, timeoutPromise]);
              } catch (authError) {
                console.warn('Firebase Authentication ล้มเหลว ใช้การ Login แบบ Local State:', authError);
                setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
              }
            }
          } catch (configError) {
            console.warn('Error parsing Firebase config:', configError);
            setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
          }
        }
      }
      
      // เก็บบทบาทและคณะที่เลือกไว้ใน State และ localStorage
      setRole(userRole);
      setSelectedFaculty(faculty);
      
      // เก็บข้อมูล Login ใน localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('spu_hr_role', userRole);
          if (faculty) {
            localStorage.setItem('spu_hr_faculty', JSON.stringify(faculty));
          }
        } catch (storageError) {
          console.warn('Error saving to localStorage:', storageError);
        }
      }
    } catch (error) {
      // จัดการ Error ทั่วไป
      console.error('เกิดข้อผิดพลาดในการ Login:', error);
      // แม้เกิด error ก็ให้ Login แบบ Local State เพื่อให้ใช้งานได้
      setRole(userRole);
      setSelectedFaculty(faculty);
      setUser({ uid: 'local-user-' + Date.now(), isAnonymous: true });
      
      // เก็บข้อมูล Login ใน localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('spu_hr_role', userRole);
          if (faculty) {
            localStorage.setItem('spu_hr_faculty', JSON.stringify(faculty));
          }
        } catch (storageError) {
          console.warn('Error saving to localStorage:', storageError);
        }
      }
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
    // ลบค่า useAdminDashboard จาก localStorage เมื่อออกจากระบบ
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spu_hr_useAdminDashboard');
    }
    
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
        setUseAdminDashboard(false);
      }
    } else {
      // ถ้าไม่มี auth ให้เคลียร์ State โดยตรง
      setUser(null);
      setRole(null);
      setSelectedFaculty(null);
      setUseAdminDashboard(false);
    }
  };

  // ========================================================================
  // Conditional Rendering: แสดงหน้า Login หรือ Dashboard
  // ========================================================================
  
  // แสดง loading state ขณะกำลังตรวจสอบ authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  
  /**
   * ถ้ายังไม่ Login หรือไม่มีบทบาท ให้แสดงหน้า LoginPage หรือ RegisterPage
   * - !user: ยังไม่มีข้อมูลผู้ใช้ (ยังไม่ Login)
   * - !role: ยังไม่ได้เลือกบทบาท
   * - showRegister: แสดงหน้า Register ถ้าเป็น true
   */
  if (!user || !role) {
    if (showRegister) {
      return (
        <RegisterPage 
          onBackToLogin={() => setShowRegister(false)}
          onRegisterSuccess={(email) => {
            setShowRegister(false);
            // Auto-fill email in login form (optional)
          }}
        />
      );
    }
    
    return (
      <LoginPage 
        onLogin={handleLogin}  // ส่งฟังก์ชัน handleLogin ไปให้ LoginPage เรียกใช้
        onShowRegister={() => setShowRegister(true)}  // ส่งฟังก์ชันแสดงหน้า Register
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
            <React.Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">กำลังโหลด Dashboard...</p>
                </div>
              </div>
            }>
              <AdminDashboard 
                userRole={role} 
                faculty={selectedFaculty} 
                onLogout={handleLogout}
                onCreateRequest={() => setShowForm(true)}
                onSwitchToStandard={() => {
                  setUseAdminDashboard(false);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('spu_hr_useAdminDashboard');
                  }
                }}
              />
            </React.Suspense>
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

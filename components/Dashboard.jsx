/**
 * ============================================================================
 * Component: หน้าหลัก Dashboard (Dashboard.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดงรายการคำขอทั้งหมดในรูปแบบตาราง
 * - ดึงข้อมูลแบบ Real-time จาก Firestore
 * - กรองข้อมูลตามบทบาท (HR เห็นทั้งหมด, คณะเห็นเฉพาะของตัวเอง)
 * - ให้ HR สามารถอัปเดตสถานะคำขอได้
 * - แสดงปุ่มสร้างคำขอใหม่ (เฉพาะฝั่งคณะ)
 * 
 * Props ที่รับมา:
 * - userRole: บทบาทของผู้ใช้ ('hr' หรือ 'faculty')
 * - faculty: ข้อมูลคณะที่เลือก (Object มี id และ name)
 * - onLogout: ฟังก์ชันสำหรับออกจากระบบ (เรียกจาก App.jsx)
 * - onCreateRequest: ฟังก์ชันสำหรับเปิด Popup Form (เรียกจาก App.jsx)
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// นำเข้า Icons จาก lucide-react (ไลบรารี Icon สำหรับ React)
// ============================================================================
// LogOut: Icon ปุ่มออกจากระบบ
// Building: Icon สำหรับคณะ/หน่วยงาน
// Briefcase: Icon สำหรับ HR
// Plus: Icon สำหรับปุ่มเพิ่ม/สร้างใหม่
import { LogOut, Building, Briefcase, Plus } from 'lucide-react';

// ============================================================================
// นำเข้า Firestore Functions
// ============================================================================
// collection: สร้าง Reference ไปยัง Collection ใน Firestore
// query: สร้าง Query สำหรับดึงข้อมูล
// onSnapshot: ฟังก์ชันสำหรับดึงข้อมูลแบบ Real-time (อัปเดตอัตโนมัติเมื่อข้อมูลเปลี่ยน)
// doc: สร้าง Reference ไปยัง Document ใน Firestore
// updateDoc: ฟังก์ชันสำหรับอัปเดตข้อมูลใน Document
// serverTimestamp: ฟังก์ชันสำหรับบันทึกเวลาจาก Server
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// ============================================================================
// นำเข้า Firebase Configuration
// ============================================================================
// db: Firestore Database Instance
// appId: ID ของแอป (ใช้สำหรับสร้าง Path ใน Firestore)
import { db, appId } from '../config/firebase';

// ============================================================================
// นำเข้า Constants
// ============================================================================
// WORKFLOW_STEPS: Array ของขั้นตอนการทำงานทั้งหมด (สำหรับแสดงข้อความสถานะ)
import { WORKFLOW_STEPS } from '../constants';

// ============================================================================
// นำเข้า Components
// ============================================================================
// SPULogo: Component สำหรับแสดง Logo SPU
import SPULogo from './SPULogo';

// ============================================================================
// นำเข้า Local Storage Utility
// ============================================================================
// ใช้สำหรับ Demo Mode เมื่อ Firebase ไม่พร้อมใช้งาน
import { getLocalRequests, updateLocalRequestStatus } from '../utils/localStorage';

/**
 * ============================================================================
 * Component Dashboard
 * ============================================================================
 */
const Dashboard = ({ userRole, faculty, onLogout, onCreateRequest, onSwitchToAdmin }) => {
  // ========================================================================
  // State Management
  // ========================================================================
  // requests: เก็บรายการคำขอทั้งหมด (Array ของ Objects)
  // แต่ละ Object มี: id, position, type, status, facultyId, facultyName, createdAt, etc.
  const [requests, setRequests] = useState([]);
  
  // loading: สถานะการโหลดข้อมูล (true = กำลังโหลด, false = โหลดเสร็จแล้ว)
  // ใช้สำหรับแสดงข้อความ "กำลังโหลด..." ในตาราง
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ navbar scroll effect
  const [scrolled, setScrolled] = useState(false);
  
  // ตรวจจับการ scroll สำหรับ navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========================================================================
  // useEffect Hook: ดึงข้อมูลจาก Firestore แบบ Real-time หรือ Local Storage
  // ========================================================================
  // useEffect(() => {...}, [userRole, faculty]) - รันเมื่อ userRole หรือ faculty เปลี่ยน
  useEffect(() => {
    // ตรวจสอบว่ามี db หรือไม่
    if (!db) {
      // ใช้ Local Storage (Demo Mode)
      console.log('ใช้ Demo Mode: อ่านข้อมูลจาก Local Storage');
      
      const loadLocalData = () => {
        try {
          const localRequests = getLocalRequests();
          
          // เรียงลำดับข้อมูลตามเวลา (ใหม่สุดไปเก่าสุด)
          let data = localRequests.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          // กรองข้อมูลตามบทบาท
          if (userRole === 'hr') {
            setRequests(data);
          } else {
            setRequests(data.filter(r => r.facultyId === faculty?.id));
          }
          setLoading(false);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          setRequests([]);
          setLoading(false);
        }
      };

      // โหลดข้อมูลครั้งแรก
      loadLocalData();

      // ฟัง storage event เพื่ออัปเดตเมื่อมีการเปลี่ยนแปลง
      const handleStorageChange = () => {
        loadLocalData();
      };
      window.addEventListener('storage', handleStorageChange);
      
      // ฟัง custom event สำหรับอัปเดตภายใน tab เดียวกัน
      window.addEventListener('localStorageUpdate', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorageUpdate', handleStorageChange);
      };
    }

    /**
     * สร้าง Query ไปยัง Collection 'requests' ใน Firestore
     * Path: artifacts/{appId}/public/data/requests
     * 
     * โครงสร้าง Firestore:
     * artifacts/
     *   └── {appId}/
     *       └── public/
     *           └── data/
     *               └── requests/  <- Collection นี้
     *                   ├── {requestId1}/  <- Document
     *                   ├── {requestId2}/
     *                   └── ...
     */
    let q;
    try {
      q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'requests')
      );
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้าง Query:', error);
      setRequests([]);
      setLoading(false);
      return;
    }
    
    /**
     * ตั้ง Listener สำหรับดึงข้อมูลแบบ Real-time
     * onSnapshot จะทำงานเมื่อ:
     * - โหลดข้อมูลครั้งแรก
     * - มีการเพิ่ม/ลบ/แก้ไขข้อมูลใน Collection
     * 
     * @param {QuerySnapshot} snapshot - ข้อมูลทั้งหมดจาก Firestore
     */
    let unsubscribe;
    try {
      unsubscribe = onSnapshot(
        q,
      (snapshot) => {
        /**
         * แปลงข้อมูลจาก Firestore Documents เป็น JavaScript Array
         * snapshot.docs = Array ของ Document Snapshots
         * d.id = Document ID (เช่น "abc123")
         * d.data() = ข้อมูลใน Document (Object)
         */
        let data = snapshot.docs.map(doc => ({
          id: doc.id,        // Document ID
          ...doc.data()      // ข้อมูลทั้งหมดใน Document (position, type, status, etc.)
        }));
        
        /**
         * เรียงลำดับข้อมูลตามเวลา (ใหม่สุดไปเก่าสุด)
         * 
         * หมายเหตุ: เราเรียงใน JavaScript แทน Firestore เพื่อเลี่ยงปัญหา Index
         * ใน Firestore ถ้าต้องการ Query แบบเรียงลำดับ ต้องสร้าง Index ก่อน
         * การเรียงใน JavaScript ทำให้โค้ดง่ายขึ้นและไม่ต้องตั้งค่า Index
         * 
         * createdAt.seconds: Timestamp จาก Firestore (เป็นวินาที)
         * แปลงเป็น Date โดยคูณด้วย 1000 (เพราะ JavaScript ใช้มิลลิวินาที)
         */
        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;  // ถ้าไม่มี createdAt ให้ใช้ 0
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;  // เรียงจากมากไปน้อย (ใหม่ไปเก่า)
        });

        /**
         * กรองข้อมูลตามบทบาท
         * - HR: เห็นคำขอทั้งหมด (ไม่ต้องกรอง)
         * - Faculty: เห็นเฉพาะคำขอของคณะตัวเอง (กรองตาม facultyId)
         */
        if (userRole === 'hr') {
          // HR เห็นทั้งหมด
          setRequests(data);
        } else {
          // คณะเห็นเฉพาะของตัวเอง
          // กรองเฉพาะคำขอที่ facultyId ตรงกับคณะที่เลือก
          setRequests(data.filter(request => request.facultyId === faculty?.id));
        }
        
        // ตั้งค่า loading เป็น false เพราะโหลดข้อมูลเสร็จแล้ว
        setLoading(false);
      },
      /**
       * Error Handler: จัดการเมื่อเกิดข้อผิดพลาดในการดึงข้อมูล
       * @param {Error} error - ข้อมูล Error
       */
        (error) => {
          console.error("Snapshot error:", error);
          setLoading(false);  // ตั้งค่า loading เป็น false แม้เกิด Error
        }
      );
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตั้งค่า Snapshot:', error);
      setRequests([]);
      setLoading(false);
      return;
    }
    
    /**
     * Cleanup Function: จะถูกเรียกเมื่อ Component ถูกลบหรือ userRole/faculty เปลี่ยน
     * เพื่อหยุดการฟัง (unsubscribe) การเปลี่ยนแปลงข้อมูล
     * ป้องกัน Memory Leak และการดึงข้อมูลซ้ำ
     */
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('เกิดข้อผิดพลาดในการ unsubscribe:', error);
        }
      }
    };
  }, [userRole, faculty]);  // รันใหม่เมื่อ userRole หรือ faculty เปลี่ยน

  // ========================================================================
  // ฟังก์ชันอัปเดตสถานะคำขอ (สำหรับ HR เท่านั้น)
  // ========================================================================
  /**
   * updateStatus: อัปเดตสถานะของคำขอใน Firestore
   * 
   * @param {string} reqId - ID ของคำขอที่ต้องการอัปเดต (Document ID)
   * @param {string} newStatus - สถานะใหม่ที่ต้องการตั้ง (เช่น 'hr_review', 'vp_hr', etc.)
   */
  const updateStatus = async (reqId, newStatus) => {
    try {
      // ตรวจสอบว่ามี db หรือไม่
      if (!db) {
        // ใช้ Local Storage (Demo Mode)
        console.log('ใช้ Demo Mode: อัปเดตสถานะใน Local Storage');
        updateLocalRequestStatus(reqId, newStatus);
        
        // อัปเดต State โดยตรง
        setRequests(prev => prev.map(req => 
          req.id === reqId 
            ? { ...req, status: newStatus, lastUpdated: { seconds: Math.floor(Date.now() / 1000) } }
            : req
        ));
        
        // Trigger event เพื่อให้ components อื่นอัปเดต
        window.dispatchEvent(new Event('localStorageUpdate'));
        
        return;
      }

      /**
       * สร้าง Reference ไปยัง Document ที่ต้องการอัปเดต
       * doc(db, 'artifacts', appId, 'public', 'data', 'requests', reqId)
       */
      const requestRef = doc(
        db, 
        'artifacts', 
        appId, 
        'public', 
        'data', 
        'requests', 
        reqId
      );
      
      /**
       * อัปเดตข้อมูลใน Document
       * - status: สถานะใหม่
       * - lastUpdated: เวลาที่อัปเดต (ใช้เวลาจาก Server)
       */
      await updateDoc(requestRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()  // ใช้เวลาจาก Server ไม่ใช่เวลาจาก Client
      });
      
      // เมื่ออัปเดตสำเร็จ onSnapshot จะทำงานอัตโนมัติและอัปเดต UI
    } catch (err) {
      // จัดการ Error เมื่ออัปเดตไม่สำเร็จ (เช่น ไม่มี Permission)
      console.error("Update error:", err);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
    }
  };

  // ========================================================================
  // Helper Functions: ฟังก์ชันช่วยในการแสดงผล
  // ========================================================================
  
  /**
   * getStatusLabel: แปลงรหัสสถานะเป็นข้อความภาษาไทย
   * 
   * @param {string} statusId - รหัสสถานะ (เช่น 'submitted', 'hr_review')
   * @returns {string} - ข้อความสถานะภาษาไทย (เช่น 'ส่งเรื่องให้ HR', 'HR ตรวจสอบ')
   */
  const getStatusLabel = (statusId) => {
    // ค้นหาข้อมูลสถานะจาก WORKFLOW_STEPS
    const step = WORKFLOW_STEPS.find(step => step.id === statusId);
    
    // ถ้าพบให้คืนค่า label ถ้าไม่พบให้คืนค่า statusId ตามเดิม
    return step ? step.label : statusId;
  };

  /**
   * getStatusColor: เลือกสี CSS Class สำหรับป้ายสถานะ
   * 
   * @param {string} statusId - รหัสสถานะ
   * @returns {string} - CSS Classes สำหรับ Tailwind CSS (เช่น 'bg-blue-100 text-blue-800')
   */
  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 'submitted': 
        return 'bg-blue-100 text-blue-800 border border-blue-200';      // สีน้ำเงินอ่อน (ส่งเรื่องแล้ว)
      case 'hr_review': 
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';      // สีม่วงอ่อน (กำลังตรวจสอบ)
      case 'vp_hr': 
        return 'bg-purple-200 text-purple-900 border border-purple-300';      // สีม่วงเข้ม (VP พิจารณา)
      case 'president': 
        return 'bg-slate-300 text-slate-900 border border-slate-400';      // สีเทาเข้ม (อธิการบดีพิจารณา)
      case 'recruiting': 
        return 'bg-green-600 text-white border border-green-700';         // สีเขียวเข้ม (ประกาศรับสมัครแล้ว)
      default: 
        return 'bg-gray-100 text-gray-600 border border-gray-200';      // สีเทา (สถานะอื่นๆ)
    }
  };

  // ========================================================================
  // Render: ส่วนแสดงผล UI
  // ========================================================================
  return (
    <div className="min-h-screen bg-white">
      {/* 
        ====================================================================
        แถบเมนูด้านบน (Navbar) - สีชมพูเข้มสวยงาม
        ====================================================================
        - แสดง Icon และชื่อระบบ
        - แสดงบทบาทหรือชื่อคณะ
        - ปุ่มออกจากระบบ
      */}
      <nav className={`bg-white text-gray-900 border-b border-gray-200 px-4 sm:px-6 transition-all duration-500 ease-in-out sticky top-0 z-50 ${
        scrolled 
          ? 'shadow-xl backdrop-blur-xl bg-white/95' 
          : 'shadow-lg'
      }`}>
        <div className={`transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-3 sm:py-4'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          {/* ส่วนซ้าย: Logo SPU และข้อมูลผู้ใช้ */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            {/* Logo SPU */}
            <div className="flex-shrink-0">
              <SPULogo size="sm" />
            </div>
            
            {/* แถบแนวตั้งแยก */}
            <div className="hidden sm:block h-10 w-px bg-gray-300"></div>
            
            {/* ข้อความ: บทบาท/คณะ */}
            <div className="min-w-0 flex-1 sm:flex-none">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 
                  Icon: แสดง Icon ตามบทบาท
                  - HR: Briefcase (กระเป๋า)
                  - Faculty: Building (อาคาร)
                */}
                <div className="bg-gray-100 p-1 sm:p-1.5 rounded shadow-sm flex-shrink-0">
                  {userRole === 'hr' ? (
                    <Briefcase size={16} className="sm:w-[18px] sm:h-[18px] text-gray-700" />
                  ) : (
                    <Building size={16} className="sm:w-[18px] sm:h-[18px] text-gray-700" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {userRole === 'hr' 
                    ? 'สำนักงานบุคคล (HR)'  // ถ้าเป็น HR แสดง "สำนักงานบุคคล (HR)"
                    : faculty?.name          // ถ้าเป็น Faculty แสดงชื่อคณะ
                  }
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 hidden sm:block font-medium">
                Personnel System
              </p>
            </div>
          </div>
          {/* ส่วนขวา: Navigation และปุ่มออกจากระบบ */}
          <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto justify-end">
            {/* ปุ่มสลับไป Admin Dashboard (สำหรับ HR เท่านั้น) */}
            {userRole === 'hr' && onSwitchToAdmin && (
              <button 
                onClick={onSwitchToAdmin}
                className="hidden sm:block text-sm text-gray-700 hover:text-gray-900 transition px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 font-semibold"
                title="Switch to Admin Dashboard"
              >
                📊 Admin View
              </button>
            )}
            <button 
              onClick={onCreateRequest}
              className="hidden sm:block text-sm text-gray-700 hover:text-gray-900 transition px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 font-semibold"
            >
              {userRole === 'faculty' && 'สร้างคำขอใหม่'}
            </button>
            {/* Mobile: Floating Action Button */}
            {userRole === 'faculty' && (
              <button 
                onClick={onCreateRequest}
                className="sm:hidden fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg z-50 transition"
                aria-label="สร้างคำขอใหม่"
              >
                <Plus size={24} />
              </button>
            )}
            <button 
              onClick={onLogout} 
                className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center transition shadow-md font-semibold"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <span className="sm:hidden">ออก</span>
            </button>
          </div>
          </div>
        </div>
      </nav>

      {/* Social Media Navbar - Vertical Circle Icons */}
      <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-3">
        {/* Facebook */}
        <a 
          href="https://www.facebook.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        {/* YouTube */}
        <a 
          href="https://www.youtube.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        {/* TikTok */}
        <a 
          href="https://www.tiktok.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#161823] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>

        {/* LINE */}
        <a 
          href="https://line.me" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#00C300] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.63-.63.63h-2.386c-.345 0-.627-.286-.627-.63V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.133-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.058.896-.023.155-.076.301-.137.437-.09.208-.2.29-.351.405-.262.199-.564.223-.804.14-1.076-.298-5.97-2.543-7.735-4.181-.002 0-.002 0 0 0C.924 16.395 0 13.39 0 10.314 0 4.644 5.373 0 12 0s12 4.644 12 10.314"/>
          </svg>
        </a>

        {/* X (Twitter) */}
        <a 
          href="https://x.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* Instagram */}
        <a 
          href="https://www.instagram.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#8B3A5C] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a 
          href="https://www.linkedin.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#0077B5] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        {/* Discord */}
        <a 
          href="https://discord.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 rounded-full bg-[#5865F2] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </a>
      </nav>

      {/* 
        ====================================================================
        Hero Section - พื้นที่แสดงข้อมูลสรุป
        ====================================================================
      */}
      <section className="bg-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
              {userRole === 'hr' ? 'จัดการคำขอทั้งหมด' : 'คำขอของฉัน'}
            </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              {userRole === 'hr' 
                ? 'ดูและจัดการคำขอลงอัตรากำลังพลทั้งหมดจากคณะและหน่วยงานต่างๆ' 
                : 'ดูและติดตามสถานะคำขอของคณะคุณ'
              }
            </p>
          </div>
          
          {/* KPI Cards - 4 สีตามรูป (Blue, Green, Yellow, Red) with modern animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
            {/* Card 1: Blue - คำขอทั้งหมด */}
            <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/20 group-hover:from-blue-400/20 group-hover:to-blue-400/40 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold">คำขอทั้งหมด</h3>
                  <Briefcase size={24} className="opacity-80 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 transform group-hover:scale-110 transition-transform duration-300">{requests.length}</div>
                <div className="text-xs sm:text-sm text-blue-200">Total Requests</div>
              </div>
            </div>
            
            {/* Card 2: Green - กำลังดำเนินการ */}
            <div className="group bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-400/20 group-hover:from-green-400/20 group-hover:to-green-400/40 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold">กำลังดำเนินการ</h3>
                  <Building size={24} className="opacity-80 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 transform group-hover:scale-110 transition-transform duration-300">
                  {requests.filter(r => r.status === 'submitted' || r.status === 'hr_review').length}
                </div>
                <div className="text-xs sm:text-sm text-green-200">In Progress</div>
              </div>
            </div>
            
            {/* Card 3: Yellow - กำลังพิจารณา */}
            <div className="group bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-400/20 group-hover:from-yellow-400/20 group-hover:to-yellow-400/40 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold">กำลังพิจารณา</h3>
                  <Plus size={24} className="opacity-80 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 transform group-hover:scale-110 transition-transform duration-300">
                  {requests.filter(r => r.status === 'vp_hr' || r.status === 'president').length}
                </div>
                <div className="text-xs sm:text-sm text-yellow-200">Under Review</div>
              </div>
            </div>
            
            {/* Card 4: Red - ประกาศรับสมัครแล้ว */}
            <div className="group bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-red-400/20 group-hover:from-red-400/20 group-hover:to-red-400/40 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold">ประกาศรับสมัคร</h3>
                  <Briefcase size={24} className="opacity-80 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 transform group-hover:scale-110 transition-transform duration-300">
                  {requests.filter(r => r.status === 'recruiting').length}
                </div>
                <div className="text-xs sm:text-sm text-red-200">Recruiting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ====================================================================
        เนื้อหาหลัก (Main Content)
        ====================================================================
      */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 -mt-4 sm:-mt-8 relative z-10">
        {/* ส่วนหัว: หัวข้อและปุ่มสร้างคำขอ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                รายการคำขอทั้งหมด
              </h2>
              {!db && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              {userRole === 'hr' 
                ? 'คำขอลงอัตรากำลังพลทั้งหมดในระบบ' 
                : 'คำขอของคณะที่คุณเลือก'
              }
            </p>
          </div>
          {/* 
            ปุ่มสร้างคำขอใหม่: แสดงเฉพาะฝั่งคณะเท่านั้น
            - HR: ไม่แสดง (เพราะ HR ไม่ต้องสร้างคำขอ)
            - Faculty: แสดง (เพราะคณะต้องสร้างคำขอ)
          */}
          {userRole === 'faculty' && (
            <button 
              onClick={onCreateRequest}  // เมื่อกดให้เรียก onCreateRequest เพื่อเปิด Popup Form
                className="hidden sm:flex bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 items-center text-xs sm:text-sm font-medium shadow-lg transition transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Plus size={18} className="sm:w-5 sm:h-5 mr-2" /> 
              สร้างคำขอใหม่
            </button>
          )}
        </div>

        {/* 
          ====================================================================
          ตารางแสดงข้อมูลคำขอ - Responsive
          ====================================================================
        */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* ส่วนหัวตาราง */}
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">วันที่ / คณะ</th>
                  <th className="p-4">ตำแหน่ง</th>
                  <th className="p-4">ประเภท</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-right">จัดการ</th>
                </tr>
              </thead>
            {/* ส่วนเนื้อหาตาราง */}
            <tbody className="divide-y divide-gray-100">
              {/* 
                Conditional Rendering: แสดงผลตามสถานะ
                1. กำลังโหลด: แสดง "กำลังโหลด..."
                2. ไม่มีข้อมูล: แสดง "ไม่พบข้อมูลคำขอ"
                3. มีข้อมูล: แสดงรายการคำขอทั้งหมด
              */}
              {loading ? (
                // สถานะ: กำลังโหลดข้อมูล
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                // สถานะ: ไม่มีข้อมูลคำขอ
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    ไม่พบข้อมูลคำขอ
                  </td>
                </tr>
              ) : (
                // สถานะ: มีข้อมูลคำขอ -> แสดงรายการทั้งหมด
                requests.map(request => (
                  <tr 
                    key={request.id}  // key สำหรับ React (ใช้ Document ID)
                    className="hover:bg-gray-50 transition"  // เอฟเฟกต์เมื่อ Hover
                  >
                    {/* คอลัมน์ที่ 1: วันที่และคณะ */}
                    <td className="p-4">
                      {/* แสดงวันที่สร้างคำขอ */}
                      <div className="text-sm font-medium text-gray-900">
                        {request.createdAt?.seconds 
                          ? new Date(request.createdAt.seconds * 1000).toLocaleDateString('th-TH')
                          : '-'
                        }
                      </div>
                      {/* แสดงชื่อคณะ */}
                      <div className="text-xs text-gray-500">
                        {request.facultyName}
                      </div>
                    </td>
                    {/* คอลัมน์ที่ 2: ตำแหน่งและรายละเอียด */}
                    <td className="p-4">
                      {/* ชื่อตำแหน่ง */}
                      <div className="text-sm text-gray-900 font-bold">
                        {request.position}
                      </div>
                      {/* รายละเอียดงาน (ตัดข้อความถ้ายาวเกินไป) */}
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {request.description}
                      </div>
                    </td>
                    {/* คอลัมน์ที่ 3: ประเภท (อัตราใหม่/ทดแทน) */}
                    <td className="p-4">
                      <span 
                        className={`text-xs px-2 py-1 rounded border ${
                          request.type === 'new' 
                            ? 'bg-green-50 border-green-200 text-green-700'  // สีเขียวสำหรับอัตราใหม่
                            : 'bg-orange-50 border-orange-200 text-orange-700'  // สีส้มสำหรับทดแทน
                        }`}
                      >
                        {request.type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}
                      </span>
                    </td>
                    {/* คอลัมน์ที่ 4: สถานะ */}
                    <td className="p-4">
                      {/* ป้ายสถานะ: แสดงข้อความและสีตามสถานะ */}
                      <span 
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${getStatusColor(request.status)}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    {/* คอลัมน์ที่ 5: ปุ่มจัดการ (สำหรับ HR เท่านั้น) */}
                    <td className="p-4">
                      {userRole === 'hr' ? (
                        /* 
                          ปุ่ม Action สำหรับ HR
                          แสดงปุ่มตามสถานะปัจจุบันของคำขอ:
                          - submitted (ส่งเรื่องแล้ว) -> ปุ่ม "รับเรื่อง"
                          - hr_review (HR ตรวจสอบแล้ว) -> ปุ่ม "เสนอ VP"
                          - vp_hr (VP อนุมัติแล้ว) -> ปุ่ม "เสนออธิการฯ"
                          - president (อธิการบดีอนุมัติแล้ว) -> ปุ่ม "ประกาศรับสมัคร"
                        */
                        <div className="flex justify-end space-x-2">
                          {/* ถ้าสถานะ = 'submitted' แสดงปุ่ม "รับเรื่อง" */}
                          {request.status === 'submitted' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'hr_review')}
                              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition shadow-md whitespace-nowrap"
                            >
                              รับเรื่อง
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'hr_review' แสดงปุ่ม "เสนอ VP" */}
                          {request.status === 'hr_review' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'vp_hr')}
                              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition shadow-md whitespace-nowrap"
                            >
                              เสนอ VP
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'vp_hr' แสดงปุ่ม "เสนออธิการฯ" */}
                          {request.status === 'vp_hr' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'president')}
                              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-md whitespace-nowrap"
                            >
                              เสนออธิการฯ
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'president' แสดงปุ่ม "ประกาศรับสมัคร" */}
                          {request.status === 'president' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'recruiting')}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition shadow-md whitespace-nowrap"
                            >
                              ประกาศรับสมัคร
                            </button>
                          )}
                        </div>
                      ) : (
                        /* ถ้าไม่ใช่ HR แสดงข้อความ "รายละเอียด" แทน */
                        <span className="text-xs text-gray-400">รายละเอียด</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                กำลังโหลด...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                ไม่พบข้อมูลคำขอ
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map(request => (
                  <div key={request.id} className="p-4 hover:bg-gray-50 transition">
                    {/* Header: วันที่และสถานะ */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1">
                          {request.createdAt?.seconds 
                            ? new Date(request.createdAt.seconds * 1000).toLocaleDateString('th-TH')
                            : '-'
                          }
                        </div>
                        <div className="text-sm font-medium text-gray-700 truncate">
                          {request.facultyName}
                        </div>
                      </div>
                      <span 
                        className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ml-2 ${getStatusColor(request.status)}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* ตำแหน่ง */}
                    <div className="mb-2">
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {request.position}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                    </div>

                    {/* ประเภทและ Action */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <span 
                        className={`text-xs px-2 py-1 rounded border ${
                          request.type === 'new' 
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-orange-50 border-orange-200 text-orange-700'
                        }`}
                      >
                        {request.type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}
                      </span>
                      
                      {/* ปุ่ม Action สำหรับ HR */}
                      {userRole === 'hr' && (
                        <div className="flex gap-2 flex-wrap">
                          {request.status === 'submitted' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'hr_review')}
                              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition shadow-md whitespace-nowrap"
                            >
                              รับเรื่อง
                            </button>
                          )}
                          {request.status === 'hr_review' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'vp_hr')}
                              className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition shadow-md whitespace-nowrap"
                            >
                              เสนอ VP
                            </button>
                          )}
                          {request.status === 'vp_hr' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'president')}
                              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-md whitespace-nowrap"
                            >
                              เสนออธิการฯ
                            </button>
                          )}
                          {request.status === 'president' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'recruiting')}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition shadow-md whitespace-nowrap"
                            >
                              ประกาศรับสมัคร
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 
        ====================================================================
        Footer Section - ส่วนท้ายหน้า
        ====================================================================
      */}
      <footer className="bg-gray-100 text-gray-800 py-8 sm:py-12 px-4 sm:px-6 mt-8 sm:mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  {userRole === 'hr' ? <Briefcase size={20} /> : <Building size={20} />}
                </div>
                SPU PERSONNEL
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                ระบบจัดการอัตรากำลังพลที่ทันสมัยและมีประสิทธิภาพสำหรับมหาวิทยาลัยศรีปทุม
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
              <p className="text-gray-700 text-sm mb-2">มหาวิทยาลัยศรีปทุม</p>
              <p className="text-gray-700 text-sm mb-2">2410/2 ถนนพหลโยธิน</p>
              <p className="text-gray-700 text-sm mb-2">แขวงเสนานิคม เขตจตุจักร กรุงเทพฯ 10900</p>
              <p className="text-gray-700 text-sm mb-2">โทร: (02) 579-1111</p>
              <p className="text-gray-700 text-sm">Email: hr@spu.ac.th</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ลิงก์ที่เกี่ยวข้อง</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.spu.ac.th" 
                    target="_blank" 
                    rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 transition inline-flex items-center"
                  >
                    เว็บไซต์หลักมหาวิทยาลัย <span className="ml-1">↗</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => alert('ระบบอื่นๆ กำลังอยู่ในระหว่างการพัฒนา')}
                        className="text-gray-700 hover:text-gray-900 transition"
                  >
                    ระบบอื่นๆ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      alert('คู่มือการใช้งาน:\n\nสำหรับคณะ:\n- กด "สร้างคำขอใหม่" เพื่อสร้างคำขอ\n- ใช้ AI ช่วยร่าง Job Description\n- ติดตามสถานะคำขอ\n\nสำหรับ HR:\n- รับเรื่องและตรวจสอบ\n- อัปเดตสถานะคำขอ\n- เสนอให้ผู้บริหารพิจารณา');
                    }}
                        className="text-gray-700 hover:text-gray-900 transition"
                  >
                    คู่มือการใช้งาน
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      alert('สำหรับความช่วยเหลือ:\n\nโทร: (02) 579-1111\nEmail: hr@spu.ac.th\n\nเวลาทำการ: จันทร์-ศุกร์ 8:30-17:00 น.');
                    }}
                        className="text-gray-700 hover:text-gray-900 transition"
                  >
                    ความช่วยเหลือ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
            Copyright 2025 Sripatum University. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// Export Component
// ============================================================================
export default Dashboard;


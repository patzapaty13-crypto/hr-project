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

/**
 * ============================================================================
 * Component Dashboard
 * ============================================================================
 */
const Dashboard = ({ userRole, faculty, onLogout, onCreateRequest }) => {
  // ========================================================================
  // State Management
  // ========================================================================
  // requests: เก็บรายการคำขอทั้งหมด (Array ของ Objects)
  // แต่ละ Object มี: id, position, type, status, facultyId, facultyName, createdAt, etc.
  const [requests, setRequests] = useState([]);
  
  // loading: สถานะการโหลดข้อมูล (true = กำลังโหลด, false = โหลดเสร็จแล้ว)
  // ใช้สำหรับแสดงข้อความ "กำลังโหลด..." ในตาราง
  const [loading, setLoading] = useState(true);

  // ========================================================================
  // useEffect Hook: ดึงข้อมูลจาก Firestore แบบ Real-time
  // ========================================================================
  // useEffect(() => {...}, [userRole, faculty]) - รันเมื่อ userRole หรือ faculty เปลี่ยน
  useEffect(() => {
    // ตรวจสอบว่ามี db หรือไม่
    if (!db) {
      console.warn('Firestore ไม่พร้อมใช้งาน ใช้ข้อมูลว่าง');
      setRequests([]);
      setLoading(false);
      return;
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
    // ตรวจสอบว่ามี db หรือไม่
    if (!db) {
      alert('Firestore ไม่พร้อมใช้งาน ไม่สามารถอัปเดตสถานะได้');
      return;
    }

    try {
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
        return 'bg-pink-100 text-pink-800 border border-pink-200';      // สีชมพูอ่อน (ส่งเรื่องแล้ว)
      case 'hr_review': 
        return 'bg-rose-100 text-rose-800 border border-rose-200';      // สีโรส (กำลังตรวจสอบ)
      case 'vp_hr': 
        return 'bg-pink-200 text-pink-900 border border-pink-300';      // สีชมพูเข้ม (VP พิจารณา)
      case 'president': 
        return 'bg-pink-300 text-pink-900 border border-pink-400';      // สีชมพูเข้มขึ้น (อธิการบดีพิจารณา)
      case 'recruiting': 
        return 'bg-pink-600 text-white border border-pink-700';         // สีชมพูเข้มมาก (ประกาศรับสมัครแล้ว)
      default: 
        return 'bg-gray-100 text-gray-600 border border-gray-200';      // สีเทา (สถานะอื่นๆ)
    }
  };

  // ========================================================================
  // Render: ส่วนแสดงผล UI
  // ========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* 
        ====================================================================
        แถบเมนูด้านบน (Navbar) - สีชมพูเข้มสวยงาม
        ====================================================================
        - แสดง Icon และชื่อระบบ
        - แสดงบทบาทหรือชื่อคณะ
        - ปุ่มออกจากระบบ
      */}
      <nav className="bg-pink-900 text-white shadow-lg px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          {/* ส่วนซ้าย: Logo SPU และข้อมูลผู้ใช้ */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            {/* Logo SPU */}
            <div className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md hover:shadow-lg transition flex-shrink-0">
              <SPULogo size="sm" />
            </div>
            
            {/* แถบแนวตั้งแยก */}
            <div className="hidden sm:block h-10 w-px bg-pink-700"></div>
            
            {/* ข้อความ: บทบาท/คณะ */}
            <div className="min-w-0 flex-1 sm:flex-none">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 
                  Icon: แสดง Icon ตามบทบาท
                  - HR: Briefcase (กระเป๋า)
                  - Faculty: Building (อาคาร)
                */}
                <div className="bg-pink-700 p-1 sm:p-1.5 rounded shadow-sm flex-shrink-0">
                  {userRole === 'hr' ? (
                    <Briefcase size={16} className="sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <Building size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-pink-100 truncate">
                  {userRole === 'hr' 
                    ? 'สำนักงานบุคคล (HR)'  // ถ้าเป็น HR แสดง "สำนักงานบุคคล (HR)"
                    : faculty?.name          // ถ้าเป็น Faculty แสดงชื่อคณะ
                  }
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-pink-300 mt-0.5 hidden sm:block">
                Personnel System
              </p>
            </div>
          </div>
          {/* ส่วนขวา: Navigation และปุ่มออกจากระบบ */}
          <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto justify-end">
            <button 
              onClick={onCreateRequest}
              className="hidden sm:block text-sm text-white hover:text-pink-200 transition px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-pink-800"
            >
              {userRole === 'faculty' && 'สร้างคำขอใหม่'}
            </button>
            {/* Mobile: Floating Action Button */}
            {userRole === 'faculty' && (
              <button 
                onClick={onCreateRequest}
                className="sm:hidden fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg z-50 transition"
                aria-label="สร้างคำขอใหม่"
              >
                <Plus size={24} />
              </button>
            )}
            <button 
              onClick={onLogout} 
              className="text-xs sm:text-sm bg-pink-700 hover:bg-pink-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center transition shadow-md"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <span className="sm:hidden">ออก</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 
        ====================================================================
        Hero Section - พื้นที่แสดงข้อมูลสรุป
        ====================================================================
      */}
      <section className="bg-gradient-to-r from-pink-600 via-pink-700 to-rose-700 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              {userRole === 'hr' ? 'จัดการคำขอทั้งหมด' : 'คำขอของฉัน'}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-pink-100 px-4">
              {userRole === 'hr' 
                ? 'ดูและจัดการคำขอลงอัตรากำลังพลทั้งหมดจากคณะและหน่วยงานต่างๆ' 
                : 'ดูและติดตามสถานะคำขอของคณะคุณ'
              }
            </p>
          </div>
          
          {/* สถิติ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{requests.length}</div>
              <div className="text-sm sm:text-base text-pink-100">คำขอทั้งหมด</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {requests.filter(r => r.status === 'submitted' || r.status === 'hr_review').length}
              </div>
              <div className="text-sm sm:text-base text-pink-100">กำลังดำเนินการ</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {requests.filter(r => r.status === 'recruiting').length}
              </div>
              <div className="text-sm sm:text-base text-pink-100">ประกาศรับสมัครแล้ว</div>
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
            <h2 className="text-xl sm:text-2xl font-bold text-pink-900">
              รายการคำขอทั้งหมด
            </h2>
            <p className="text-pink-600 text-xs sm:text-sm mt-1">
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
              className="hidden sm:flex bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-pink-700 hover:to-rose-700 items-center text-xs sm:text-sm font-medium shadow-lg transition transform hover:scale-105 w-full sm:w-auto justify-center"
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-200">
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
                    <td className="p-4 text-right">
                      {userRole === 'hr' ? (
                        /* 
                          ปุ่ม Action สำหรับ HR
                          แสดงปุ่มตามสถานะปัจจุบันของคำขอ:
                          - submitted (ส่งเรื่องแล้ว) -> ปุ่ม "รับเรื่อง"
                          - hr_review (HR ตรวจสอบแล้ว) -> ปุ่ม "เสนอ VP"
                          - vp_hr (VP อนุมัติแล้ว) -> ปุ่ม "เสนออธิการฯ"
                          - president (อธิการบดีอนุมัติแล้ว) -> ปุ่ม "ประกาศรับสมัคร"
                        */
                        <div className="space-x-2">
                          {/* ถ้าสถานะ = 'submitted' แสดงปุ่ม "รับเรื่อง" */}
                          {request.status === 'submitted' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'hr_review')}
                              className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded-lg hover:bg-pink-700 transition shadow-md"
                            >
                              รับเรื่อง
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'hr_review' แสดงปุ่ม "เสนอ VP" */}
                          {request.status === 'hr_review' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'vp_hr')}
                              className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-md"
                            >
                              เสนอ VP
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'vp_hr' แสดงปุ่ม "เสนออธิการฯ" */}
                          {request.status === 'vp_hr' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'president')}
                              className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition shadow-md"
                            >
                              เสนออธิการฯ
                            </button>
                          )}
                          {/* ถ้าสถานะ = 'president' แสดงปุ่ม "ประกาศรับสมัคร" */}
                          {request.status === 'president' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'recruiting')}
                              className="text-xs bg-pink-700 text-white px-3 py-1.5 rounded-lg hover:bg-pink-800 transition shadow-md"
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
                              className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded-lg hover:bg-pink-700 transition shadow-md whitespace-nowrap"
                            >
                              รับเรื่อง
                            </button>
                          )}
                          {request.status === 'hr_review' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'vp_hr')}
                              className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-md whitespace-nowrap"
                            >
                              เสนอ VP
                            </button>
                          )}
                          {request.status === 'vp_hr' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'president')}
                              className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition shadow-md whitespace-nowrap"
                            >
                              เสนออธิการฯ
                            </button>
                          )}
                          {request.status === 'president' && (
                            <button 
                              onClick={() => updateStatus(request.id, 'recruiting')}
                              className="text-xs bg-pink-700 text-white px-3 py-1.5 rounded-lg hover:bg-pink-800 transition shadow-md whitespace-nowrap"
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
      <footer className="bg-pink-900 text-white py-8 sm:py-12 px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <div className="bg-pink-700 p-2 rounded-lg mr-3">
                  {userRole === 'hr' ? <Briefcase size={20} /> : <Building size={20} />}
                </div>
                SPU PERSONNEL
              </h4>
              <p className="text-pink-200 text-sm leading-relaxed">
                ระบบจัดการอัตรากำลังพลที่ทันสมัยและมีประสิทธิภาพสำหรับมหาวิทยาลัยศรีปทุม
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
              <p className="text-pink-200 text-sm mb-2">มหาวิทยาลัยศรีปทุม</p>
              <p className="text-pink-200 text-sm mb-2">2410/2 ถนนพหลโยธิน</p>
              <p className="text-pink-200 text-sm mb-2">แขวงเสนานิคม เขตจตุจักร กรุงเทพฯ 10900</p>
              <p className="text-pink-200 text-sm mb-2">โทร: (02) 579-1111</p>
              <p className="text-pink-200 text-sm">Email: hr@spu.ac.th</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ลิงก์ที่เกี่ยวข้อง</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.spu.ac.th" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-200 hover:text-white transition inline-flex items-center"
                  >
                    เว็บไซต์หลักมหาวิทยาลัย <span className="ml-1">↗</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => alert('ระบบอื่นๆ กำลังอยู่ในระหว่างการพัฒนา')}
                    className="text-pink-200 hover:text-white transition"
                  >
                    ระบบอื่นๆ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      alert('คู่มือการใช้งาน:\n\nสำหรับคณะ:\n- กด "สร้างคำขอใหม่" เพื่อสร้างคำขอ\n- ใช้ AI ช่วยร่าง Job Description\n- ติดตามสถานะคำขอ\n\nสำหรับ HR:\n- รับเรื่องและตรวจสอบ\n- อัปเดตสถานะคำขอ\n- เสนอให้ผู้บริหารพิจารณา');
                    }}
                    className="text-pink-200 hover:text-white transition"
                  >
                    คู่มือการใช้งาน
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      alert('สำหรับความช่วยเหลือ:\n\nโทร: (02) 579-1111\nEmail: hr@spu.ac.th\n\nเวลาทำการ: จันทร์-ศุกร์ 8:30-17:00 น.');
                    }}
                    className="text-pink-200 hover:text-white transition"
                  >
                    ความช่วยเหลือ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-pink-800 pt-6 text-center text-sm text-pink-300">
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


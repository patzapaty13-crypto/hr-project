/**
 * ============================================================================
 * Component: หน้าเข้าสู่ระบบ (LoginPage.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ให้ผู้ใช้เลือกบทบาท (คณะ/HR หรือ สำนักงานบุคคล)
 * - ให้ผู้ใช้เลือกคณะ/หน่วยงาน (เฉพาะฝั่งคณะ)
 * - ให้ผู้ใช้กรอกอีเมลและรหัสผ่าน
 * - ส่งข้อมูลไปยัง App.jsx เพื่อทำการ Login
 * 
 * Props ที่รับมา:
 * - onLogin: ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่มเข้าสู่ระบบ
 *   รับพารามิเตอร์: (userRole, faculty)
 *   - userRole: 'hr' หรือ 'faculty'
 *   - faculty: Object ข้อมูลคณะ (null ถ้าเป็น HR)
 * 
 * UI Components:
 * - แท็บเลือกบทบาท (Tabs)
 * - Dropdown เลือกคณะ (เฉพาะฝั่งคณะ)
 * - Input อีเมล
 * - Input รหัสผ่าน
 * - ปุ่มเข้าสู่ระบบ
 * 
 * ============================================================================
 */

import React, { useState } from 'react';

// ============================================================================
// นำเข้า Icons จาก lucide-react
// ============================================================================
// Building: Icon สำหรับคณะ/หน่วยงาน (ใช้กับ Dropdown)
// Lock: Icon สำหรับรหัสผ่าน
// Mail: Icon สำหรับอีเมล
import { Building, Lock, Mail, Briefcase } from 'lucide-react';

// ============================================================================
// นำเข้า Constants
// ============================================================================
// FACULTIES: Array ของคณะทั้งหมดใน SPU (ใช้สำหรับ Dropdown)
import { FACULTIES } from '../constants';

// ============================================================================
// นำเข้า Components
// ============================================================================
// SPULogo: Component สำหรับแสดง Logo SPU
import SPULogo from './SPULogo';

/**
 * ============================================================================
 * Component LoginPage
 * ============================================================================
 */
const LoginPage = ({ onLogin }) => {
  // ========================================================================
  // State Management: เก็บค่าจากฟอร์ม
  // ========================================================================
  // role: บทบาทที่เลือก ('faculty' = คณะ/หน่วยงาน, 'hr' = สำนักงานบุคคล)
  // เริ่มต้นเป็น 'faculty' (ฝั่งคณะ)
  const [role, setRole] = useState('faculty');
  
  // facultyId: ID ของคณะที่เลือก (ใช้สำหรับ Dropdown)
  // เริ่มต้นเป็น ID ของคณะแรกใน Array FACULTIES
  const [facultyId, setFacultyId] = useState(FACULTIES[0].id);
  
  // email: อีเมลที่กรอก (สำหรับการ Login)
  // หมายเหตุ: ปัจจุบันยังไม่ได้ใช้จริง แต่อาจใช้ในอนาคตสำหรับ Authentication
  const [email, setEmail] = useState('');
  
  // password: รหัสผ่านที่กรอก (สำหรับการ Login)
  // หมายเหตุ: ปัจจุบันยังไม่ได้ใช้จริง แต่อาจใช้ในอนาคตสำหรับ Authentication
  const [password, setPassword] = useState('');

  // ========================================================================
  // ฟังก์ชันจัดการเมื่อกดปุ่มเข้าสู่ระบบ
  // ========================================================================
  // State สำหรับจัดการ Loading และ Error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * handleSubmit: ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่ม "เข้าสู่ระบบ"
   * 
   * @param {Event} e - Event Object จาก Form Submit
   */
  const handleSubmit = async (e) => {
    // ป้องกันหน้าเว็บ Refresh (Default Behavior ของ Form Submit)
    e.preventDefault();
    
    // Reset error
    setError('');
    setIsLoading(true);

    try {
      /**
       * ตรวจสอบบทบาทและส่งข้อมูลกลับไปยัง App.jsx
       * 
       * ถ้าเป็น 'faculty':
       * - หาข้อมูลคณะจาก FACULTIES Array ตาม facultyId ที่เลือก
       * - ส่งข้อมูลคณะ (Object) ไปยัง onLogin
       * 
       * ถ้าเป็น 'hr':
       * - ส่ง null แทนข้อมูลคณะ (เพราะ HR ไม่ต้องเลือกคณะ)
       */
      if (role === 'faculty') {
        // ตรวจสอบว่ามีคณะที่เลือกหรือไม่
        if (!facultyId) {
          setError('กรุณาเลือกคณะ/หน่วยงาน');
          setIsLoading(false);
          return;
        }

        // หาข้อมูลคณะจาก Array ตาม ID ที่เลือก
        const selectedFaculty = FACULTIES.find(faculty => faculty.id === facultyId);
        
        if (!selectedFaculty) {
          setError('ไม่พบข้อมูลคณะที่เลือก');
          setIsLoading(false);
          return;
        }

        // เรียก onLogin พร้อมส่งบทบาทและข้อมูลคณะ
        await onLogin('faculty', selectedFaculty);
      } else {
        // เรียก onLogin พร้อมส่งบทบาท HR และ null (ไม่มีคณะ)
        await onLogin('hr', null);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // Render: ส่วนแสดงผล UI
  // ========================================================================
  // Container หลัก: ธีมสีชมพูแบบนุ่มนวล สบายตา
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - ข้อมูลติดต่อ */}
      <div className="bg-pink-100 text-gray-700 py-2 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">โทร: <a href="tel:025791111" className="text-pink-600 hover:text-pink-700">(02) 579-1111</a></span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">อีเมล: <a href="mailto:hr@spu.ac.th" className="text-pink-600 hover:text-pink-700">hr@spu.ac.th</a></span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-gray-500">
            <span className="text-xs">ติดตามเรา</span>
            <a href="#" className="hover:text-pink-600 transition">f</a>
            <a href="#" className="hover:text-pink-600 transition">t</a>
            <a href="#" className="hover:text-pink-600 transition">in</a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo SPU */}
            <div className="flex items-center gap-4">
              <div className="bg-white px-3 py-1.5 rounded shadow-sm hover:shadow-md transition">
                <SPULogo 
                  size="sm" 
                  onClick={() => window.location.reload()}
                />
              </div>
              <span className="hidden md:block text-gray-600 text-sm">Personnel System</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-pink-600 font-medium border-b-2 border-pink-600 pb-1">หน้าหลัก</button>
              <button onClick={() => {
                alert('ระบบอัตรากำลังพล SPU Personnel System\n\nเวอร์ชัน 1.0.0\nพัฒนาสำหรับมหาวิทยาลัยศรีปทุม');
              }} className="text-gray-600 hover:text-pink-600 transition">เกี่ยวกับ</button>
              <button onClick={() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }} className="text-gray-600 hover:text-pink-600 transition">ติดต่อ</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-r from-pink-50 via-white to-pink-50">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-pink-50/80 z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              <p className="text-pink-500 text-sm font-medium uppercase tracking-wider">ยินดีต้อนรับ</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                เข้าสู่ระบบอัตรากำลังพล
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                ระบบขออนุมัติอัตรากำลังพลออนไลน์ที่ทันสมัยและใช้งานง่าย 
                สำหรับคณะและหน่วยงาน รวมถึงสำนักงานบุคคล
              </p>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    alert('ระบบ SPU Personnel System\n\nใช้งานง่าย ปลอดภัย และมีประสิทธิภาพ\n\nเหมาะสำหรับการจัดการอัตรากำลังพล');
                  }}
                  className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow-md font-medium"
                >
                  เรียนรู้เพิ่มเติม
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="px-6 py-3 bg-white text-pink-600 border-2 border-pink-500 rounded-lg hover:bg-pink-50 transition font-medium"
                >
                  ติดต่อเรา
                </button>
              </div>
            </div>

            {/* Right Content - Login Form */}
            <div className="flex justify-center lg:justify-end">
              {/* 
                กล่อง Login: พื้นหลังขาว มีเงาและมุมโค้ง
                max-w-md: ความกว้างสูงสุด 28rem (448px)
              */}
              <div className="bg-white shadow-xl rounded-lg w-full max-w-md overflow-hidden border border-gray-100">
                {/* 
                  ====================================================================
                  ส่วนหัวของกล่อง Login - สีชมพูแบบนุ่มนวล
                  ====================================================================
                */}
                <div className="bg-pink-50 border-b border-pink-100 p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    เข้าสู่ระบบ
                  </h3>
                  <p className="text-gray-600 text-sm">
                    กรุณาเลือกบทบาทและกรอกข้อมูลเพื่อเข้าสู่ระบบ
                  </p>
                </div>

                {/* 
                  ====================================================================
                  แท็บเลือกบทบาท (Tabs) - สีชมพูแบบนุ่มนวล
                  ====================================================================
                */}
                <div className="flex border-b border-gray-100">
                  {/* แท็บที่ 1: สำหรับคณะ/หน่วยงาน */}
                  <button 
                    className={`flex-1 py-3 text-sm font-medium transition ${
                      role === 'faculty' 
                        ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'  // สถานะ Active
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('faculty')}
                  >
                    สำหรับคณะ/หน่วยงาน
                  </button>
                  {/* แท็บที่ 2: สำหรับ HR */}
                  <button 
                    className={`flex-1 py-3 text-sm font-medium transition ${
                      role === 'hr' 
                        ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'  // สถานะ Active
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('hr')}
                  >
                    สำหรับ HR
                  </button>
                </div>

        {/* 
          ====================================================================
          ฟอร์มกรอกข้อมูล (Form)
          ====================================================================
          onSubmit={handleSubmit}: เมื่อกดปุ่ม Submit จะเรียก handleSubmit
          space-y-4: ระยะห่างระหว่าง Elements ในแนวตั้ง
        */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 
            Field 1: Dropdown เลือกคณะ/หน่วยงาน
            แสดงเฉพาะเมื่อ role = 'faculty'
            ถ้า role = 'hr' จะไม่แสดง (เพราะ HR ไม่ต้องเลือกคณะ)
          */}
          {role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลือกคณะ / หน่วยงาน
              </label>
              <div className="relative">
                {/* Icon: Building (แสดงทางซ้ายของ Dropdown) */}
                <Building 
                  className="absolute left-3 top-2.5 text-gray-400" 
                  size={18} 
                />
                {/* 
                  Dropdown: เลือกคณะจาก Array FACULTIES
                  value={facultyId}: ค่าปัจจุบันที่เลือก
                  onChange: เมื่อเปลี่ยนค่าให้อัปเดต facultyId
                */}
                <select 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                >
                  {/* แสดง Option สำหรับแต่ละคณะ */}
                  {FACULTIES.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 
            Field 2: Input อีเมล
            type="email": ตรวจสอบรูปแบบอีเมลอัตโนมัติ
            required: บังคับให้กรอก
            placeholder: เปลี่ยนตามบทบาท (hr@spu.ac.th หรือ staff@spu.ac.th)
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมลมหาวิทยาลัย (@spu.ac.th)
            </label>
            <div className="relative">
              {/* Icon: Mail (แสดงทางซ้ายของ Input) */}
              <Mail 
                className="absolute left-3 top-2.5 text-gray-400" 
                size={18} 
              />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={role === 'hr' ? 'hr@spu.ac.th' : 'staff@spu.ac.th'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}  // อัปเดต email เมื่อพิมพ์
              />
            </div>
          </div>

          {/* 
            Field 3: Input รหัสผ่าน
            type="password": ซ่อนข้อความที่พิมพ์ (แสดงเป็น •)
            required: บังคับให้กรอก
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              {/* Icon: Lock (แสดงทางซ้ายของ Input) */}
              <Lock 
                className="absolute left-3 top-2.5 text-gray-400" 
                size={18} 
              />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}  // อัปเดต password เมื่อพิมพ์
              />
            </div>
          </div>

                {/* แสดง Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4">
                    {error}
                  </div>
                )}

                {/* 
                  ปุ่มเข้าสู่ระบบ - สีชมพูแบบนุ่มนวล
                */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>
        </form>
        
                {/* 
                  ====================================================================
                  ส่วนล่าง: ลิขสิทธิ์ - สีชมพูแบบนุ่มนวล
                  ====================================================================
                */}
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
                  &copy; 2025 Sripatum University. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <Building size={48} className="text-pink-400" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">จัดการคณะ</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  สร้างและจัดการคำขออัตรากำลังพลสำหรับคณะและหน่วยงานของคุณได้อย่างง่ายดาย
                </p>
                <button 
                  onClick={() => {
                    alert('ระบบจัดการคณะ\n\n- สร้างคำขอใหม่\n- ติดตามสถานะ\n- ใช้ AI ช่วยร่าง Job Description');
                  }}
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  อ่านเพิ่มเติม →
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <Briefcase size={48} className="text-pink-400" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">ระบบอนุมัติ</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  ระบบอนุมัติอัตรากำลังพลที่รวดเร็ว มีประสิทธิภาพ และติดตามได้ทุกขั้นตอน
                </p>
                <button 
                  onClick={() => {
                    alert('ระบบอนุมัติ\n\n- รับเรื่องและตรวจสอบ\n- เสนอผู้บริหาร\n- ติดตามสถานะอัตโนมัติ');
                  }}
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  อ่านเพิ่มเติม →
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">ใช้งานง่าย</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  อินเทอร์เฟซที่ใช้งานง่าย พร้อม AI ช่วยเหลือทำให้การทำงานของคุณรวดเร็วขึ้น
                </p>
                <button 
                  onClick={() => {
                    alert('ใช้งานง่าย\n\n- อินเทอร์เฟซทันสมัย\n- AI ช่วยร่าง Job Description\n- ติดตามสถานะแบบ Real-time');
                  }}
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  อ่านเพิ่มเติม →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-50 border-t border-gray-100 text-gray-700 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">SPU PERSONNEL</h4>
              <p className="text-pink-200 text-sm leading-relaxed">
                ระบบจัดการอัตรากำลังพลที่ทันสมัยและมีประสิทธิภาพ
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
              <p className="text-pink-200 text-sm mb-2">มหาวิทยาลัยศรีปทุม</p>
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
                      alert('คู่มือการใช้งาน:\n\n1. เลือกบทบาท (คณะ/HR)\n2. เลือกคณะ (ถ้าเป็นคณะ)\n3. กรอกอีเมลและรหัสผ่าน\n4. กดเข้าสู่ระบบ\n\nสำหรับความช่วยเหลือเพิ่มเติม โปรดติดต่อ hr@spu.ac.th');
                    }}
                    className="text-pink-200 hover:text-white transition"
                  >
                    ความช่วยเหลือ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-pink-800 mt-8 pt-6 text-center text-sm text-pink-300">
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
export default LoginPage;


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

import React, { useState, useEffect } from 'react';

// ============================================================================
// นำเข้า Icons จาก lucide-react
// ============================================================================
// Building: Icon สำหรับคณะ/หน่วยงาน (ใช้กับ Dropdown)
// Lock: Icon สำหรับรหัสผ่าน
// Mail: Icon สำหรับอีเมล
import { Building, Lock, Mail, Briefcase, UserPlus } from 'lucide-react';

// ============================================================================
// นำเข้า Firebase Authentication
// ============================================================================
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// ============================================================================
// นำเข้า User Service
// ============================================================================
import { getUserByEmail, checkAccess } from '../utils/userService';

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
import BackgroundSlider from './BackgroundSlider';

/**
 * ============================================================================
 * Component LoginPage
 * ============================================================================
 */
const LoginPage = ({ onLogin, onShowRegister }) => {
  // ========================================================================
  // State Management: เก็บค่าจากฟอร์ม
  // ========================================================================
  // role: บทบาทที่เลือก ('faculty' = คณะ/หน่วยงาน, 'hr' = เจ้าหน้าที่ฝ่ายบุคคล, 'vp_hr' = รองอธิการบดี, 'president' = อธิการบดี)
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
      // Validation
      if (!email || !password) {
        setError('กรุณากรอกอีเมลและรหัสผ่าน');
        setIsLoading(false);
        return;
      }

      if (role === 'faculty' && !facultyId) {
        setError('กรุณาเลือกคณะ/หน่วยงาน');
        setIsLoading(false);
        return;
      }

      // Login ด้วย Email/Password
      let userCredential;
      if (auth) {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
        } catch (authError) {
          if (authError.code === 'auth/user-not-found') {
            setError('ไม่พบผู้ใช้ในระบบ กรุณาลงทะเบียนก่อน');
            setIsLoading(false);
            return;
          } else if (authError.code === 'auth/wrong-password') {
            setError('รหัสผ่านไม่ถูกต้อง');
            setIsLoading(false);
            return;
          } else if (authError.code === 'auth/invalid-email') {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
            setIsLoading(false);
            return;
          }
          throw authError;
        }
      } else {
        // Demo Mode: สร้าง mock user
        userCredential = {
          user: {
            uid: 'demo-user-' + Date.now(),
            email: email.toLowerCase()
          }
        };
      }

      // ดึงข้อมูลผู้ใช้จาก Database
      const userData = await getUserByEmail(email.toLowerCase());

      if (!userData) {
        setError('ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาลงทะเบียนก่อน');
        setIsLoading(false);
        return;
      }

      // ตรวจสอบสิทธิ์การเข้าถึง
      const accessCheck = checkAccess(userData, role, role === 'faculty' ? facultyId : null);
      
      if (!accessCheck.allowed) {
        setError(accessCheck.message);
        setIsLoading(false);
        return;
      }

      // หาข้อมูลคณะ (ถ้าเป็น faculty)
      let selectedFaculty = null;
      if (role === 'faculty') {
        selectedFaculty = FACULTIES.find(f => f.id === facultyId);
        if (!selectedFaculty) {
          setError('ไม่พบข้อมูลคณะที่เลือก');
          setIsLoading(false);
          return;
        }
      }

      // เรียก onLogin พร้อมส่งข้อมูล
      await onLogin(role, selectedFaculty, userCredential.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // State สำหรับ active navigation menu
  const [activeNav, setActiveNav] = useState('Home');

  // ========================================================================
  // Render: ส่วนแสดงผล UI
  // ========================================================================
  // Container หลัก: Template แบบ Creative Unity
  return (
    <div className="min-h-screen relative">
      {/* Background Image - Aerial view of hills and coastline */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" 
          alt="Aerial view of hills and coastline" 
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Navigation Bar - Top Right */}
      <nav className="fixed top-6 right-6 z-50">
        <div className="flex items-center space-x-1">
          {['Home', 'About', 'How', 'What', 'Portfolio', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`px-4 py-2 text-white text-sm font-medium transition-all duration-300 ${
                activeNav === item
                  ? 'bg-white/20 backdrop-blur-sm rounded-full border border-white/30'
                  : 'hover:text-white/80'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section - Centered Content */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight">
            SPU HR
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 font-light drop-shadow-lg">
            We make the world a beautiful place
          </p>

          {/* Social Media Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* Twitter */}
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative px-6 py-3 rounded-lg bg-[#1DA1F2] text-white flex items-center gap-3 font-semibold text-base shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Twitter</span>
              <div 
                className="absolute inset-0 rounded-lg bg-[#1DA1F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                style={{
                  boxShadow: '0 0 20px rgba(29, 161, 242, 0.6)'
                }}
              ></div>
            </a>

            {/* GitHub */}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative px-6 py-3 rounded-lg bg-[#24292e] text-white flex items-center gap-3 font-semibold text-base shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Github</span>
              <div 
                className="absolute inset-0 rounded-lg bg-[#24292e] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                style={{
                  boxShadow: '0 0 20px rgba(36, 41, 46, 0.6)'
                }}
              ></div>
            </a>

            {/* Codepen */}
            <a 
              href="https://codepen.io" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative px-6 py-3 rounded-lg bg-[#000000] text-white flex items-center gap-3 font-semibold text-base shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6 0 5.302-4.298 9.6-9.6 9.6-5.302 0-9.6-4.298-9.6-9.6 0-5.302 4.298-9.6 9.6-9.6zm-1.2 3.6v7.2L6 8.4l4.8 4.8V6zm2.4 0v4.8L18 8.4l-4.8 4.8V6z"/>
              </svg>
              <span>Codepen</span>
              <div 
                className="absolute inset-0 rounded-lg bg-[#000000] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                style={{
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.6)'
                }}
              ></div>
            </a>
          </div>
        </div>
      </section>

      {/* Login Form - Fixed Position Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-md px-4 sm:px-0">
        {/* 
          กล่อง Login: พื้นหลังขาวใส มีเงาและมุมโค้ง
          max-w-md: ความกว้างสูงสุด 28rem (448px)
          responsive: w-full บน mobile, max-w-md บน desktop
        */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl w-full overflow-hidden border border-white/20 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                {/* 
                  ====================================================================
                  ส่วนหัวของกล่อง Login - สีชมพูแบบนุ่มนวล
                  ====================================================================
                */}
                <div className="bg-pink-50 border-b border-pink-100 p-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
                    เข้าสู่ระบบ
                  </h3>
                  <p className="text-gray-700 text-sm font-medium">
                    กรุณาเลือกบทบาทและกรอกข้อมูลเพื่อเข้าสู่ระบบ
                  </p>
                </div>

                {/* 
                  ====================================================================
                  แท็บเลือกบทบาท (Tabs) - สีชมพูแบบนุ่มนวล
                  ====================================================================
                */}
                <div className="flex border-b border-gray-100 relative">
                  {/* Active indicator slide */}
                  <div 
                    className="absolute bottom-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ease-in-out"
                    style={{
                      width: '25%',
                      left: role === 'faculty' ? '0%' : role === 'hr' ? '25%' : role === 'vp_hr' ? '50%' : '75%'
                    }}
                  ></div>
                  
                  {/* แท็บที่ 1: สำหรับคณะ/หน่วยงาน */}
                  <button 
                    className={`relative flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      role === 'faculty' 
                        ? 'text-pink-600 bg-pink-50'  // สถานะ Active
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('faculty')}
                  >
                    <span className="hidden sm:inline">สำหรับคณะ/หน่วยงาน</span>
                    <span className="sm:hidden">คณะ</span>
                  </button>
                  {/* แท็บที่ 2: สำหรับ HR */}
                  <button 
                    className={`relative flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      role === 'hr' 
                        ? 'text-pink-600 bg-pink-50'  // สถานะ Active
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('hr')}
                  >
                    สำหรับ HR
                  </button>
                  {/* แท็บที่ 3: สำหรับ VP HR */}
                  <button 
                    className={`relative flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      role === 'vp_hr' 
                        ? 'text-pink-600 bg-pink-50'  // สถานะ Active
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('vp_hr')}
                  >
                    รองอธิการฯ
                  </button>
                  {/* แท็บที่ 4: สำหรับ President */}
                  <button 
                    className={`relative flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      role === 'president' 
                        ? 'text-pink-600 bg-pink-50'  // สถานะ Active
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'  // สถานะ Inactive
                    }`}
                    onClick={() => setRole('president')}
                  >
                    อธิการบดี
                  </button>
                </div>

                {/* 
                  ====================================================================
                  ฟอร์มกรอกข้อมูล (Form)
                  ====================================================================
                  onSubmit={handleSubmit}: เมื่อกดปุ่ม Submit จะเรียก handleSubmit
                  space-y-4: ระยะห่างระหว่าง Elements ในแนวตั้ง
                */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* 
            Field 1: Dropdown เลือกคณะ/หน่วยงาน
            แสดงเฉพาะเมื่อ role = 'faculty'
            ถ้า role = 'hr' จะไม่แสดง (เพราะ HR ไม่ต้องเลือกคณะ)
          */}
          {/* แสดง Dropdown เลือกคณะเฉพาะ Faculty */}
          {(role === 'faculty') && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                เลือกคณะ / หน่วยงาน <span className="text-red-500 font-bold">*</span>
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
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer font-medium text-gray-800 transition-all duration-200 hover:border-pink-400"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  required
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
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              อีเมลมหาวิทยาลัย (@spu.ac.th) <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              {/* Icon: Mail (แสดงทางซ้ายของ Input) */}
              <Mail 
                className="absolute left-3 top-3 text-gray-500" 
                size={20} 
              />
              <input 
                type="email" 
                required
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium text-gray-800 placeholder:text-gray-400 transition-all duration-200 hover:border-pink-400"
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
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              รหัสผ่าน <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              {/* Icon: Lock (แสดงทางซ้ายของ Input) */}
              <Lock 
                className="absolute left-3 top-3 text-gray-500" 
                size={20} 
              />
              <input 
                type="password" 
                required
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium text-gray-800 placeholder:text-gray-400 transition-all duration-200 hover:border-pink-400"
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
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3.5 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] text-base"
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
                  ส่วนล่าง: ปุ่มลงทะเบียนและลิขสิทธิ์
                  ====================================================================
                */}
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  {/* ปุ่มลงทะเบียน */}
                  {onShowRegister && (
                    <button
                      onClick={onShowRegister}
                      className="w-full mb-3 bg-white border-2 border-pink-500 text-pink-600 py-2.5 rounded-lg hover:bg-pink-50 hover:border-pink-600 transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                    >
                      <UserPlus size={18} />
                      ลงทะเบียน
                    </button>
                  )}
                  {/* ลิขสิทธิ์ */}
                  <div className="text-center text-xs text-gray-500">
                    &copy; 2025 Sripatum University. All Rights Reserved.
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export Component
// ============================================================================
export default LoginPage;


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

  // ========================================================================
  // Render: ส่วนแสดงผล UI
  // ========================================================================
  // Container หลัก: ธีมสีชมพูแบบนุ่มนวล สบายตา พร้อม Background Slide Show
  return (
    <BackgroundSlider>
      <div className="min-h-screen">
        {/* Top Bar - ข้อมูลติดต่อ - สีขาว */}
        <div className="bg-white text-gray-700 py-2 px-4 sm:px-6 text-xs sm:text-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-gray-700 whitespace-nowrap font-medium">โทร: <a href="tel:025791111" className="text-gray-900 hover:text-pink-600 underline font-semibold cursor-pointer transition-all duration-200 hover:scale-105">(02) 579-1111</a></span>
            <span className="hidden sm:inline text-gray-400 font-bold">|</span>
            <span className="text-gray-700 whitespace-nowrap font-medium">อีเมล: <a href="mailto:hr@spu.ac.th" className="text-gray-900 hover:text-pink-600 underline break-all font-semibold cursor-pointer transition-all duration-200 hover:scale-105">hr@spu.ac.th</a></span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {/* Facebook */}
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative px-4 py-2.5 rounded-lg bg-[#1877F2] text-white flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 0 20px rgba(24, 119, 242, 0.4)'
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
              <div className="absolute inset-0 rounded-lg bg-[#1877F2] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </a>
            {/* Instagram */}
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-black flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* Twitter */}
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-black flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a 
              href="https://www.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-black flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

        {/* Main Navigation Header - Glassmorphism with slide effect */}
        <header 
          className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${
            scrolled 
              ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20' 
              : 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/10'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-500">
            <div className={`flex justify-between items-center transition-all duration-500 ${
              scrolled ? 'py-3' : 'py-4 sm:py-5'
            }`}>
              {/* Logo SPU - Horizontal Layout */}
              <div className="flex items-center gap-3 sm:gap-4">
                <SPULogo 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="cursor-pointer"
                />
                <span className="hidden sm:block text-gray-900 text-base sm:text-lg font-bold tracking-wide">
                  Personnel System
                </span>
              </div>
              
              {/* Navigation Menu - Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  alert('เมนู: หน้าหลัก | เกี่ยวกับ | ติดต่อ');
                }}
                aria-label="เมนู"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Navigation Menu - Desktop with slide effect */}
              <nav className="hidden lg:flex items-center space-x-2 text-sm">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="relative px-4 py-2 text-gray-700 font-semibold rounded-lg transition-all duration-300 hover:text-pink-600 hover:bg-pink-50 group overflow-hidden"
                >
                  <span className="relative z-10">หน้าหลัก</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                </button>
                <button 
                  onClick={() => {
                    alert('ระบบอัตรากำลังพล SPU Personnel System\n\nเวอร์ชัน 1.0.0\nพัฒนาสำหรับมหาวิทยาลัยศรีปทุม');
                  }} 
                  className="relative px-4 py-2 text-gray-700 font-semibold rounded-lg transition-all duration-300 hover:text-pink-600 hover:bg-pink-50 group overflow-hidden"
                >
                  <span className="relative z-10">เกี่ยวกับ</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                </button>
                <button 
                  onClick={() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }} 
                  className="relative px-4 py-2 text-gray-700 font-semibold rounded-lg transition-all duration-300 hover:text-pink-600 hover:bg-pink-50 group overflow-hidden"
                >
                  <span className="relative z-10">ติดต่อ</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section with Background Image */}
        <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content with animations and large logo */}
              <div className="text-left space-y-6 sm:space-y-8 order-2 lg:order-1 animate-fade-in-up">
                {/* Large Logo */}
                <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                  <SPULogo 
                    size="lg" 
                    onClick={() => window.location.reload()}
                    className="cursor-pointer"
                  />
                </div>
                
                <p className="text-pink-100 text-xs sm:text-sm font-semibold uppercase tracking-widest animate-fade-in opacity-0 text-center lg:text-left" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  ยินดีต้อนรับ
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl tracking-tight animate-fade-in-up opacity-0 text-center lg:text-left" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  HR SPU
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed max-w-xl drop-shadow-lg font-medium animate-fade-in-up opacity-0 text-center lg:text-left mx-auto lg:mx-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                  SPU HR Personnel System
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center lg:justify-start animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  <button 
                    onClick={() => {
                      alert('ระบบ SPU Personnel System\n\nใช้งานง่าย ปลอดภัย และมีประสิทธิภาพ\n\nเหมาะสำหรับการจัดการอัตรากำลังพล');
                    }}
                    className="group relative px-8 sm:px-10 py-4 sm:py-4.5 bg-white text-pink-600 rounded-xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-sm sm:text-base cursor-pointer transform hover:scale-110 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>เรียนรู้เพิ่มเติม</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <span className="flex items-center gap-2">
                        <span>เรียนรู้เพิ่มเติม</span>
                        <svg className="w-5 h-5 transform translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </span>
                  </button>
                  <button 
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="group relative px-8 sm:px-10 py-4 sm:py-4.5 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl overflow-hidden hover:bg-white/30 hover:border-white/50 transition-all duration-300 font-bold text-sm sm:text-base cursor-pointer transform hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>ติดต่อเรา</span>
                      <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <span className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </button>
                </div>
              </div>

              {/* Right Content - Login Form */}
              <div className="flex justify-center lg:justify-end order-1 lg:order-2 w-full lg:w-auto">
                {/* 
                  กล่อง Login: พื้นหลังขาวใส มีเงาและมุมโค้ง
                  max-w-md: ความกว้างสูงสุด 28rem (448px)
                  responsive: w-full บน mobile, max-w-md บน desktop
                */}
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md overflow-hidden border border-white/20 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
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
        </div>
      </section>

          {/* Footer Section */}
          <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 text-white py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xl font-black mb-4 text-white tracking-tight">SPU PERSONNEL</h4>
                  <p className="text-white/95 text-sm leading-relaxed font-medium">
                    ระบบจัดการอัตรากำลังพลที่ทันสมัยและมีประสิทธิภาพ
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ติดต่อเรา</h4>
                  <p className="text-white/90 text-sm mb-2">มหาวิทยาลัยศรีปทุม</p>
                  <p className="text-white/90 text-sm mb-2">โทร: (02) 579-1111</p>
                  <p className="text-white/90 text-sm">Email: hr@spu.ac.th</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-4 text-white tracking-wide">ลิงก์ที่เกี่ยวข้อง</h4>
                  <ul className="space-y-2.5 text-sm">
                    <li>
                      <a 
                        href="https://www.spu.ac.th" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/95 hover:text-white transition-all duration-200 inline-flex items-center font-semibold cursor-pointer hover:scale-105 underline decoration-2 underline-offset-2 hover:decoration-white"
                      >
                        เว็บไซต์หลักมหาวิทยาลัย <span className="ml-1 font-bold">↗</span>
                      </a>
                    </li>
                    <li>
                      <button 
                        onClick={() => alert('ระบบอื่นๆ กำลังอยู่ในระหว่างการพัฒนา')}
                        className="text-white/95 hover:text-white transition-all duration-200 font-semibold cursor-pointer hover:scale-105 underline decoration-2 underline-offset-2 hover:decoration-white"
                      >
                        ระบบอื่นๆ
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          alert('คู่มือการใช้งาน:\n\n1. เลือกบทบาท (คณะ/HR)\n2. เลือกคณะ (ถ้าเป็นคณะ)\n3. กรอกอีเมลและรหัสผ่าน\n4. กดเข้าสู่ระบบ\n\nสำหรับความช่วยเหลือเพิ่มเติม โปรดติดต่อ hr@spu.ac.th');
                        }}
                        className="text-white/95 hover:text-white transition-all duration-200 font-semibold cursor-pointer hover:scale-105 underline decoration-2 underline-offset-2 hover:decoration-white"
                      >
                        ความช่วยเหลือ
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/80">
                Copyright 2025 Sripatum University. All Rights Reserved.
              </div>
            </div>
          </footer>
        </div>
      </BackgroundSlider>
    );
  };

// ============================================================================
// Export Component
// ============================================================================
export default LoginPage;


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
  // role: บทบาทที่เลือก ('faculty' = คณะ/หน่วยงาน, 'hr' = เจ้าหน้าที่ฝ่ายบุคคล, 'vp_hr' = รองอธิการบดี)
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
        // Fallback Mode: สร้าง local user เมื่อ Firebase ไม่พร้อมใช้งาน
        userCredential = {
          user: {
            uid: 'local-user-' + Date.now(),
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
        </div>
      </div>

        {/* Social Media Navbar - Vertical Circle Icons */}
        <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
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
                      width: '33.33%',
                      left: role === 'faculty' ? '0%' : role === 'hr' ? '33.33%' : '66.66%'
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


/**
 * ============================================================================
 * Component: หน้าลงทะเบียน (RegisterPage.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ลงทะเบียนผู้ใช้ใหม่ (HR, VP_HR, President, Faculty)
 * - ตรวจสอบอีเมลไม่ซ้ำกัน
 * - ตรวจสอบสิทธิ์การเข้าถึงตาม role และ faculty
 * 
 * Roles ที่รองรับ:
 * 1. hr: เจ้าหน้าที่ฝ่ายบุคคล (สามารถดูทุกคณะ)
 * 2. vp_hr: รองอธิการบดี (สามารถดูทุกคณะ)
 * 3. president: อธิการบดี (สามารถดูทุกคณะ)
 * 4. faculty: คณะ/หน่วยงาน (สามารถดูเฉพาะคณะของตัวเอง)
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { Building, Lock, Mail, User, UserCheck, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';
import { FACULTIES } from '../constants';
import SPULogo from './SPULogo';
import BackgroundSlider from './BackgroundSlider';

const RegisterPage = ({ onBackToLogin, onRegisterSuccess }) => {
  // State Management
  const [role, setRole] = useState('faculty');
  const [facultyId, setFacultyId] = useState(FACULTIES[0]?.id || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * ตรวจสอบว่าอีเมลซ้ำกันหรือไม่
   */
  const checkEmailExists = async (emailToCheck) => {
    if (!db) {
      // Demo Mode: ตรวจสอบจาก localStorage
      const users = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
      return users.some(u => u.email === emailToCheck);
    }

    try {
      const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      const q = query(usersRef, where('email', '==', emailToCheck));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err) {
      console.error('Error checking email:', err);
      return false;
    }
  };

  /**
   * บันทึกข้อมูลผู้ใช้ลง Database
   */
  const saveUserToDatabase = async (userUid, userData) => {
    if (!db) {
      // Demo Mode: เก็บใน localStorage
      const users = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
      users.push({
        uid: userUid,
        ...userData,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      });
      localStorage.setItem('spu_hr_users', JSON.stringify(users));
      return;
    }

    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userUid);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error saving user to database:', err);
      throw err;
    }
  };

  /**
   * ฟังก์ชันจัดการเมื่อกดปุ่มลงทะเบียน
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validation
      if (!email || !password || !confirmPassword || !fullName) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        setIsLoading(false);
        return;
      }

      if (role === 'faculty' && !facultyId) {
        setError('กรุณาเลือกคณะ');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        setIsLoading(false);
        return;
      }

      // ตรวจสอบอีเมลซ้ำ
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
        setIsLoading(false);
        return;
      }

      // สำหรับ Faculty: ตรวจสอบว่าอีเมลนี้มีในคณะอื่นหรือไม่
      if (role === 'faculty') {
        if (!db) {
          const users = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
          const existingFacultyUser = users.find(u => 
            u.role === 'faculty' && 
            u.email === email && 
            u.facultyId !== facultyId
          );
          if (existingFacultyUser) {
            setError('อีเมลนี้ถูกใช้งานในคณะอื่นแล้ว อีเมลกลางใช้ได้แค่ 1 คณะต่ออีเมล');
            setIsLoading(false);
            return;
          }
        } else {
          const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
          const q = query(
            usersRef, 
            where('role', '==', 'faculty'),
            where('email', '==', email)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const existingUser = querySnapshot.docs[0].data();
            if (existingUser.facultyId !== facultyId) {
              setError('อีเมลนี้ถูกใช้งานในคณะอื่นแล้ว อีเมลกลางใช้ได้แค่ 1 คณะต่ออีเมล');
              setIsLoading(false);
              return;
            }
          }
        }
      }

      // สร้าง User ใน Firebase Auth
      let userCredential;
      if (auth) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
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
            email: email
          }
        };
      }

      // บันทึกข้อมูลผู้ใช้ลง Database
      const selectedFaculty = FACULTIES.find(f => f.id === facultyId);
      const userData = {
        email: email,
        fullName: fullName,
        role: role,
        facultyId: role === 'faculty' ? facultyId : null,
        facultyName: role === 'faculty' ? selectedFaculty?.name : null,
        createdAt: new Date()
      };

      await saveUserToDatabase(userCredential.user.uid, userData);

      setSuccess('ลงทะเบียนสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');
      
      // รอ 2 วินาทีแล้วไปหน้า Login
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(email);
        } else if (onBackToLogin) {
          onBackToLogin();
        }
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundSlider>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/30">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <SPULogo size="md" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
          ลงทะเบียน
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          สร้างบัญชีใหม่สำหรับระบบ HR SPU
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <UserCheck className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              บทบาท <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== 'faculty') {
                  setFacultyId('');
                } else {
                  setFacultyId(FACULTIES[0]?.id || '');
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              required
            >
              <option value="faculty">คณะ/หน่วยงาน</option>
              <option value="hr">เจ้าหน้าที่ฝ่ายบุคคล</option>
              <option value="vp_hr">รองอธิการบดี</option>
              <option value="president">อธิการบดี</option>
            </select>
          </div>

          {/* Faculty Selection (เฉพาะ Faculty) */}
          {role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                คณะ/หน่วยงาน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  {FACULTIES.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-pink-900"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-pink-900"
                placeholder="example@spu.ac.th"
                required
              />
            </div>
            {role === 'faculty' && (
              <p className="text-xs text-gray-600 mt-1">
                * อีเมลกลางใช้ได้แค่ 1 คณะต่ออีเมล
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-pink-900"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-pink-900"
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-blue-600 hover:text-blue-800 transition"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </button>
          </div>
        </div>
      </div>
    </BackgroundSlider>
  );
};

export default RegisterPage;


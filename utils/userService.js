/**
 * ============================================================================
 * User Service: จัดการข้อมูลผู้ใช้ (userService.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ดึงข้อมูลผู้ใช้จาก Database
 * - ตรวจสอบสิทธิ์การเข้าถึงตาม role และ faculty
 * - จัดการข้อมูลผู้ใช้ใน Demo Mode (localStorage)
 * 
 * ============================================================================
 */

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { FACULTIES } from '../constants';

/**
 * ดึงข้อมูลผู้ใช้จาก Database ตาม UID
 */
export const getUserData = async (uid) => {
  if (!db) {
    // Demo Mode: อ่านจาก localStorage
    const users = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
    return users.find(u => u.uid === uid) || null;
  }

  try {
    const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * ดึงข้อมูลผู้ใช้จาก Database ตาม Email
 */
export const getUserByEmail = async (email) => {
  if (!db) {
    // Demo Mode: อ่านจาก localStorage
    const users = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
    return users.find(u => u.email === email.toLowerCase()) || null;
  }

  try {
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { uid: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

/**
 * ตรวจสอบสิทธิ์การเข้าถึงตาม role และ faculty
 * 
 * @param {Object} userData - ข้อมูลผู้ใช้ (email, role, facultyId)
 * @param {string} loginRole - บทบาทที่เลือกตอน Login (hr, vp_hr, president, faculty)
 * @param {string} loginFacultyId - ID คณะที่เลือกตอน Login (ถ้าเป็น faculty)
 * @returns {Object} { allowed: boolean, message: string }
 */
export const checkAccess = (userData, loginRole, loginFacultyId) => {
  if (!userData) {
    return { allowed: false, message: 'ไม่พบข้อมูลผู้ใช้' };
  }

  // ตรวจสอบ role
  if (userData.role !== loginRole) {
    return { 
      allowed: false, 
      message: `บัญชีนี้เป็นบทบาท ${getRoleLabel(userData.role)} ไม่สามารถเข้าสู่ระบบด้วยบทบาท ${getRoleLabel(loginRole)} ได้` 
    };
  }

  // สำหรับ Faculty: ตรวจสอบว่า email ตรงกับ facultyId หรือไม่
  if (loginRole === 'faculty') {
    if (!loginFacultyId) {
      return { allowed: false, message: 'กรุณาเลือกคณะ/หน่วยงาน' };
    }

    if (userData.facultyId !== loginFacultyId) {
      const userFaculty = FACULTIES.find(f => f.id === userData.facultyId);
      const loginFaculty = FACULTIES.find(f => f.id === loginFacultyId);
      return { 
        allowed: false, 
        message: `อีเมลนี้ถูกลงทะเบียนสำหรับ${userFaculty?.name || userData.facultyId} ไม่สามารถเข้าสู่ระบบด้วย${loginFaculty?.name || loginFacultyId}ได้` 
      };
    }
  }

  return { allowed: true, message: 'สามารถเข้าสู่ระบบได้' };
};

/**
 * แปลง role เป็น label ภาษาไทย
 */
const getRoleLabel = (role) => {
  const roleLabels = {
    'hr': 'เจ้าหน้าที่ฝ่ายบุคคล',
    'vp_hr': 'รองอธิการบดี',
    'faculty': 'คณะ/หน่วยงาน'
  };
  return roleLabels[role] || role;
};

/**
 * ตรวจสอบว่าอีเมลซ้ำกันหรือไม่
 */
export const checkEmailExists = async (email) => {
  const user = await getUserByEmail(email);
  return user !== null;
};

/**
 * สำหรับ Faculty: ตรวจสอบว่าอีเมลนี้มีในคณะอื่นหรือไม่
 */
export const checkEmailExistsInOtherFaculty = async (email, facultyId) => {
  const user = await getUserByEmail(email);
  if (!user) return false;
  
  if (user.role === 'faculty' && user.facultyId !== facultyId) {
    return true;
  }
  
  return false;
};


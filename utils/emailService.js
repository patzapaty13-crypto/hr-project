/**
 * ============================================================================
 * Utility: Email Service (emailService.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ส่งอีเมลแจ้งเตือนเมื่อมีการสร้างคำขอใหม่
 * - ส่งอีเมลพร้อม confirmation link สำหรับยืนยัน
 * 
 * ใช้ EmailJS สำหรับส่งอีเมลจาก Frontend
 * 
 * ============================================================================
 */

import emailjs from '@emailjs/browser';

// EmailJS Configuration
// ต้องตั้งค่าใน Environment Variables หรือ index.html
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || window.__emailjs_service_id || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || window.__emailjs_template_id || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || window.__emailjs_public_key || '';

// Email ที่จะส่งไป
const RECIPIENT_EMAIL = 'hatwst1@gmail.com';

// Base URL สำหรับ confirmation link
const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://hr-project-ivory.vercel.app';

/**
 * ส่งอีเมลแจ้งเตือนเมื่อมีการสร้างคำขอใหม่
 * @param {Object} requestData - ข้อมูลคำขอ
 * @param {string} requestId - ID ของคำขอ
 * @returns {Promise} - Promise ที่ resolve เมื่อส่งอีเมลสำเร็จ
 */
export const sendRequestNotificationEmail = async (requestData, requestId) => {
  // ตรวจสอบว่ามี EmailJS config หรือไม่
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS config ไม่ครบถ้วน ข้ามการส่งอีเมล');
    console.log('EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID ? '✓' : '✗',
      templateId: EMAILJS_TEMPLATE_ID ? '✓' : '✗',
      publicKey: EMAILJS_PUBLIC_KEY ? '✓' : '✗'
    });
    return { success: false, message: 'EmailJS config ไม่ครบถ้วน' };
  }

  try {
    // สร้าง confirmation link
    const confirmationLink = `${BASE_URL}/confirm/${requestId}`;
    
    // เตรียมข้อมูลสำหรับ Email Template
    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      to_name: 'HR Team',
      from_name: 'SPU Personnel System',
      subject: `คำขออัตรากำลังพลใหม่ - ${requestData.facultyName}`,
      request_id: requestId,
      faculty_name: requestData.facultyName,
      position: requestData.position,
      type: requestData.type === 'new' ? 'อัตราใหม่' : 'ทดแทน',
      amount: requestData.amount,
      description: requestData.description || 'ไม่มีรายละเอียด',
      status: 'submitted',
      confirmation_link: confirmationLink,
      date: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // ส่งอีเมลผ่าน EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ ส่งอีเมลสำเร็จ:', response);
    return { success: true, message: 'ส่งอีเมลสำเร็จ', response };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการส่งอีเมล', error };
  }
};

/**
 * ส่งอีเมลยืนยันเมื่อมีการยืนยันคำขอ
 * @param {Object} requestData - ข้อมูลคำขอ
 * @param {string} requestId - ID ของคำขอ
 * @returns {Promise} - Promise ที่ resolve เมื่อส่งอีเมลสำเร็จ
 */
export const sendConfirmationEmail = async (requestData, requestId) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS config ไม่ครบถ้วน ข้ามการส่งอีเมล');
    return { success: false, message: 'EmailJS config ไม่ครบถ้วน' };
  }

  try {
    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      to_name: 'HR Team',
      from_name: 'SPU Personnel System',
      subject: `ยืนยันคำขออัตรากำลังพล - ${requestData.facultyName}`,
      request_id: requestId,
      faculty_name: requestData.facultyName,
      position: requestData.position,
      confirmation_date: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ ส่งอีเมลยืนยันสำเร็จ:', response);
    return { success: true, message: 'ส่งอีเมลยืนยันสำเร็จ', response };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการส่งอีเมล', error };
  }
};


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

// Initialize EmailJS with Public Key
// หมายเหตุ: @emailjs/browser ใช้ emailjs.init() สำหรับ Public Key
if (EMAILJS_PUBLIC_KEY && typeof window !== 'undefined') {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized with Public Key');
  } catch (error) {
    console.warn('⚠️ Error initializing EmailJS:', error);
  }
}

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
    const configStatus = {
      serviceId: EMAILJS_SERVICE_ID ? '✓' : '✗',
      templateId: EMAILJS_TEMPLATE_ID ? '✓' : '✗',
      publicKey: EMAILJS_PUBLIC_KEY ? '✓' : '✗'
    };
    
    console.warn('❌ EmailJS config ไม่ครบถ้วน ข้ามการส่งอีเมล');
    console.log('EmailJS Config Status:', configStatus);
    
    // แสดงรายละเอียด config ที่ขาด
    const missing = [];
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') missing.push('Service ID');
    if (!EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') missing.push('Template ID');
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') missing.push('Public Key');
    
    return { 
      success: false, 
      message: `EmailJS config ไม่ครบถ้วน: ${missing.join(', ')}. กรุณาตรวจสอบการตั้งค่าใน index.html` 
    };
  }

  try {
    // สร้าง confirmation link
    const confirmationLink = `${BASE_URL}/confirm/${requestId}`;
    
    // เตรียมข้อมูลสำหรับ Email Template
    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      to_name: 'HR Team',
      from_name: 'SPU Personnel System',
      subject: `คำขออัตราใหม่ - ${requestData.facultyName}`,
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
    console.log('📧 กำลังส่งอีเมล...', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY ? '✓' : '✗',
      to: RECIPIENT_EMAIL,
      requestId: requestId,
      templateParams: templateParams
    });

    // ตรวจสอบว่า templateParams มีค่าที่จำเป็น
    if (!templateParams.to_email || !templateParams.faculty_name || !templateParams.position) {
      console.error('❌ Template parameters ไม่ครบถ้วน:', templateParams);
      return { 
        success: false, 
        message: 'Template parameters ไม่ครบถ้วน กรุณาตรวจสอบข้อมูลคำขอ' 
      };
    }

    // ส่งอีเมลผ่าน EmailJS
    // หมายเหตุ: @emailjs/browser ใช้ emailjs.send(serviceId, templateId, templateParams)
    // Public Key จะถูกใช้จาก emailjs.init() ที่เรียกไว้แล้ว
    
    // ตรวจสอบ templateParams ก่อนส่ง
    console.log('📧 Template Parameters:', JSON.stringify(templateParams, null, 2));
    console.log('📧 EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY ? '✓ Initialized' : '✗ Not initialized'
    });
    
    // ส่งอีเมลผ่าน EmailJS
    // ใช้ syntax: emailjs.send(serviceId, templateId, templateParams)
    // ไม่ต้องส่ง publicKey เพราะ init ไว้แล้ว
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ ส่งอีเมลสำเร็จ:', {
      status: response.status,
      text: response.text,
      requestId: requestId,
      to: RECIPIENT_EMAIL
    });
    
    return { 
      success: true, 
      message: `ส่งอีเมลสำเร็จไปยัง ${RECIPIENT_EMAIL}`, 
      response,
      requestId: requestId
    };
  } catch (error) {
    // Log error อย่างละเอียด
    console.error('❌ Error sending email:', {
      error: error,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      text: error.text,
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY ? (EMAILJS_PUBLIC_KEY.substring(0, 10) + '...') : '✗',
      config: {
        serviceId: EMAILJS_SERVICE_ID ? '✓' : '✗',
        templateId: EMAILJS_TEMPLATE_ID ? '✓' : '✗',
        publicKey: EMAILJS_PUBLIC_KEY ? '✓' : '✗'
      }
    });
    
    // แสดง error message ที่ละเอียดขึ้น
    let errorMessage = 'เกิดข้อผิดพลาดในการส่งอีเมล';
    
    // ตรวจสอบ error type
    if (error.status === 400) {
      errorMessage = 'Bad Request (400) - อาจเกิดจาก:\n';
      errorMessage += '1. Template ID ไม่ถูกต้อง\n';
      errorMessage += '2. Template Variables ไม่ตรงกับ Template\n';
      errorMessage += '3. Public Key ไม่ถูกต้อง\n';
      errorMessage += '4. Service ID ไม่ถูกต้อง';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized (401) - Public Key ไม่ถูกต้องหรือหมดอายุ';
    } else if (error.status === 404) {
      errorMessage = 'Not Found (404) - Service ID หรือ Template ID ไม่พบ';
    } else if (error.status) {
      errorMessage += ` (Status: ${error.status})`;
    }
    
    // เพิ่ม error text หรือ message
    if (error.text) {
      errorMessage += `\n\nError Text: ${error.text}`;
    }
    if (error.message && error.message !== error.text) {
      errorMessage += `\nError Message: ${error.message}`;
    }
    
    // เพิ่มคำแนะนำ
    errorMessage += '\n\nกรุณาตรวจสอบ:\n';
    errorMessage += '1. EmailJS Config ใน index.html\n';
    errorMessage += '2. Template Variables ใน EmailJS Dashboard\n';
    errorMessage += '3. Console Logs สำหรับรายละเอียดเพิ่มเติม';
    
    return { 
      success: false, 
      message: errorMessage, 
      error: error,
      status: error.status,
      statusText: error.statusText,
      text: error.text
    };
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


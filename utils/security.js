/**
 * ============================================================================
 * Security Utilities (security.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ป้องกัน XSS (Cross-Site Scripting)
 * - Validate และ Sanitize Input
 * - ตรวจสอบสิทธิ์การเข้าถึง
 * - Rate Limiting
 * 
 * ============================================================================
 */

/**
 * Sanitize string เพื่อป้องกัน XSS
 * @param {string} str - String ที่ต้องการ sanitize
 * @returns {string} - String ที่ sanitize แล้ว
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate email format
 * @param {string} email - Email ที่ต้องการ validate
 * @returns {boolean} - true ถ้า email ถูกต้อง
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validate และ sanitize email
 * @param {string} email - Email ที่ต้องการ validate และ sanitize
 * @returns {Object} - { valid: boolean, sanitized: string, error: string }
 */
export const validateAndSanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'กรุณากรอกอีเมล' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    return { valid: false, sanitized: '', error: 'กรุณากรอกอีเมล' };
  }
  
  if (!validateEmail(trimmed)) {
    return { valid: false, sanitized: '', error: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }
  
  // ตรวจสอบความยาว
  if (trimmed.length > 255) {
    return { valid: false, sanitized: '', error: 'อีเมลยาวเกินไป' };
  }
  
  return { valid: true, sanitized: trimmed, error: '' };
};

/**
 * Validate และ sanitize text input
 * @param {string} text - Text ที่ต้องการ validate และ sanitize
 * @param {Object} options - Options { minLength, maxLength, required }
 * @returns {Object} - { valid: boolean, sanitized: string, error: string }
 */
export const validateAndSanitizeText = (text, options = {}) => {
  const { minLength = 0, maxLength = 10000, required = false } = options;
  
  if (!text || typeof text !== 'string') {
    if (required) {
      return { valid: false, sanitized: '', error: 'กรุณากรอกข้อมูล' };
    }
    return { valid: true, sanitized: '', error: '' };
  }
  
  const trimmed = text.trim();
  
  if (required && !trimmed) {
    return { valid: false, sanitized: '', error: 'กรุณากรอกข้อมูล' };
  }
  
  if (trimmed.length < minLength) {
    return { valid: false, sanitized: '', error: `ข้อมูลต้องมีความยาวอย่างน้อย ${minLength} ตัวอักษร` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, sanitized: '', error: `ข้อมูลยาวเกินไป (สูงสุด ${maxLength} ตัวอักษร)` };
  }
  
  // Sanitize เพื่อป้องกัน XSS
  const sanitized = sanitizeString(trimmed);
  
  return { valid: true, sanitized, error: '' };
};

/**
 * Validate number
 * @param {number|string} value - Number ที่ต้องการ validate
 * @param {Object} options - Options { min, max, required }
 * @returns {Object} - { valid: boolean, sanitized: number, error: string }
 */
export const validateAndSanitizeNumber = (value, options = {}) => {
  const { min = 0, max = 1000000, required = false } = options;
  
  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, sanitized: null, error: 'กรุณากรอกตัวเลข' };
    }
    return { valid: true, sanitized: null, error: '' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, sanitized: null, error: 'กรุณากรอกตัวเลขที่ถูกต้อง' };
  }
  
  if (num < min) {
    return { valid: false, sanitized: null, error: `ตัวเลขต้องไม่น้อยกว่า ${min}` };
  }
  
  if (num > max) {
    return { valid: false, sanitized: null, error: `ตัวเลขต้องไม่เกิน ${max}` };
  }
  
  return { valid: true, sanitized: Math.floor(num), error: '' };
};

/**
 * ตรวจสอบสิทธิ์การเข้าถึง
 * @param {string} userRole - บทบาทของผู้ใช้
 * @param {string} requiredRole - บทบาทที่ต้องการ
 * @param {string|null} userFacultyId - ID คณะของผู้ใช้ (ถ้ามี)
 * @param {string|null} resourceFacultyId - ID คณะของข้อมูลที่ต้องการเข้าถึง (ถ้ามี)
 * @returns {boolean} - true ถ้ามีสิทธิ์
 */
export const checkAccess = (userRole, requiredRole, userFacultyId = null, resourceFacultyId = null) => {
  // HR สามารถเข้าถึงได้ทุกอย่าง
  if (userRole === 'hr') {
    return true;
  }
  
  // ตรวจสอบบทบาท
  if (userRole !== requiredRole) {
    return false;
  }
  
  // สำหรับ Faculty: ตรวจสอบว่าข้อมูลเป็นของคณะเดียวกันหรือไม่
  if (userRole === 'faculty' && userFacultyId && resourceFacultyId) {
    return userFacultyId === resourceFacultyId;
  }
  
  return true;
};

/**
 * Rate Limiting - จำกัดจำนวนการเรียกใช้
 */
const rateLimitMap = new Map();

/**
 * ตรวจสอบ rate limit
 * @param {string} key - Key สำหรับ rate limit (เช่น user ID, IP)
 * @param {number} maxRequests - จำนวนครั้งสูงสุด
 * @param {number} windowMs - ระยะเวลา (milliseconds)
 * @returns {boolean} - true ถ้ายังไม่เกิน limit
 */
export const checkRateLimit = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // ถ้าเกินเวลา window ให้ reset
  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // ตรวจสอบว่ายังไม่เกิน limit หรือไม่
  if (record.count >= maxRequests) {
    return false;
  }
  
  // เพิ่มจำนวนครั้ง
  record.count++;
  return true;
};

/**
 * Clear rate limit สำหรับ key
 * @param {string} key - Key ที่ต้องการ clear
 */
export const clearRateLimit = (key) => {
  rateLimitMap.delete(key);
};

/**
 * Escape HTML เพื่อป้องกัน XSS
 * @param {string} text - Text ที่ต้องการ escape
 * @returns {string} - Text ที่ escape แล้ว
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  return sanitizeString(text);
};

/**
 * Validate role
 * @param {string} role - Role ที่ต้องการ validate
 * @returns {boolean} - true ถ้า role ถูกต้อง
 */
export const validateRole = (role) => {
  const validRoles = ['hr', 'vp_hr', 'faculty'];
  return validRoles.includes(role);
};

/**
 * Validate faculty ID
 * @param {string} facultyId - Faculty ID ที่ต้องการ validate
 * @param {Array} validFaculties - Array ของ valid faculty IDs
 * @returns {boolean} - true ถ้า faculty ID ถูกต้อง
 */
export const validateFacultyId = (facultyId, validFaculties = []) => {
  if (!facultyId) return false;
  if (validFaculties.length === 0) return true; // ถ้าไม่มี validFaculties ให้ผ่าน
  return validFaculties.includes(facultyId);
};


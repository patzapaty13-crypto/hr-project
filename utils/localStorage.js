/**
 * ============================================================================
 * Utility: Local Storage Helper (localStorage.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - จัดการข้อมูลใน Local Storage สำหรับ Demo Mode
 * - ใช้เมื่อ Firebase ไม่พร้อมใช้งาน
 * - เก็บข้อมูลคำขอทั้งหมดใน Browser Local Storage
 * 
 * Features:
 * - บันทึกคำขอใหม่
 * - อ่านคำขอทั้งหมด
 * - อัปเดตสถานะคำขอ
 * - ลบคำขอ
 * 
 * ============================================================================
 */

const STORAGE_KEY = 'spu_hr_requests';

/**
 * ดึงข้อมูลคำขอทั้งหมดจาก Local Storage
 * @returns {Array} - Array ของคำขอทั้งหมด
 */
export const getLocalRequests = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * บันทึกคำขอใหม่ลง Local Storage
 * @param {Object} request - ข้อมูลคำขอใหม่
 * @returns {string} - ID ของคำขอที่สร้าง
 */
export const addLocalRequest = (request) => {
  try {
    const requests = getLocalRequests();
    const newRequest = {
      ...request,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      }
    };
    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return newRequest.id;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะคำขอใน Local Storage
 * @param {string} requestId - ID ของคำขอที่ต้องการอัปเดต
 * @param {string} newStatus - สถานะใหม่
 */
export const updateLocalRequestStatus = (requestId, newStatus) => {
  try {
    const requests = getLocalRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = newStatus;
      requests[index].lastUpdated = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error('Error updating localStorage:', error);
    throw error;
  }
};

/**
 * ลบคำขอจาก Local Storage
 * @param {string} requestId - ID ของคำขอที่ต้องการลบ
 */
export const deleteLocalRequest = (requestId) => {
  try {
    const requests = getLocalRequests();
    const filtered = requests.filter(r => r.id !== requestId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    throw error;
  }
};

/**
 * ล้างข้อมูลทั้งหมดใน Local Storage
 */
export const clearLocalRequests = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};


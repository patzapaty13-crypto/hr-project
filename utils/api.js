/**
 * ============================================================================
 * API Service - RESTful API Client
 * ============================================================================
 * 
 * ใช้สำหรับเรียกใช้ RESTful API แทนการเรียก Firebase โดยตรง
 * 
 * ============================================================================
 */

import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // สามารถเพิ่ม token หรือ headers อื่นๆ ได้ที่นี่
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * Requests API
 * ============================================================================
 */

export const requestsAPI = {
  /**
   * ดึงคำขอทั้งหมด
   * @param {Object} params - { role, facultyId, status }
   */
  getAll: (params = {}) => {
    return api.get('/requests', { params });
  },

  /**
   * ดึงคำขอตาม ID
   * @param {string} id - Request ID
   */
  getById: (id) => {
    return api.get(`/requests/${id}`);
  },

  /**
   * สร้างคำขอใหม่
   * @param {Object} data - Request data
   */
  create: (data) => {
    return api.post('/requests', data);
  },

  /**
   * อัปเดตคำขอ
   * @param {string} id - Request ID
   * @param {Object} data - Update data
   */
  update: (id, data) => {
    return api.put(`/requests/${id}`, data);
  },

  /**
   * เปลี่ยนสถานะคำขอ
   * @param {string} id - Request ID
   * @param {string} status - New status
   */
  updateStatus: (id, status) => {
    return api.patch(`/requests/${id}/status`, { status });
  },

  /**
   * ลบคำขอ
   * @param {string} id - Request ID
   */
  delete: (id) => {
    return api.delete(`/requests/${id}`);
  }
};

/**
 * ============================================================================
 * Users API
 * ============================================================================
 */

export const usersAPI = {
  /**
   * ดึงผู้ใช้ทั้งหมด
   */
  getAll: () => {
    return api.get('/users');
  },

  /**
   * ดึงผู้ใช้ตาม ID
   * @param {string} id - User ID
   */
  getById: (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * สร้างผู้ใช้ใหม่
   * @param {Object} data - User data
   */
  create: (data) => {
    return api.post('/users', data);
  },

  /**
   * อัปเดตผู้ใช้
   * @param {string} id - User ID
   * @param {Object} data - Update data
   */
  update: (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  /**
   * ลบผู้ใช้
   * @param {string} id - User ID
   */
  delete: (id) => {
    return api.delete(`/users/${id}`);
  }
};

/**
 * ============================================================================
 * AI API
 * ============================================================================
 */

export const aiAPI = {
  /**
   * สร้าง Job Description ด้วย AI
   * @param {Object} data - { position, type, amount }
   */
  generateJD: (data) => {
    return api.post('/ai/generate-jd', data);
  },

  /**
   * วิเคราะห์ Resume ด้วย AI
   * @param {Object} data - { jobDescription, resumeText }
   */
  analyzeResume: (data) => {
    return api.post('/ai/analyze-resume', data);
  }
};

export default api;


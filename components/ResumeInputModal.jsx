/**
 * ============================================================================
 * Component: Resume Input Modal (ResumeInputModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Modal สำหรับกรอกข้อมูล Resume
 * - ใช้สำหรับขั้นตอน screening
 * - ระวังเรื่อง PDPA (เก็บเฉพาะข้อมูลที่จำเป็น)
 * 
 * Props:
 * - isOpen: boolean - ควบคุมการแสดง/ซ่อน Modal
 * - onClose: Function - ฟังก์ชันปิด Modal
 * - onSubmit: Function - ฟังก์ชันส่งข้อมูล Resume (รับ resume object)
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

const ResumeInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    experience: '',
    skills: '',
    education: '',
    achievements: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    // Reset form
    setFormData({
      experience: '',
      skills: '',
      education: '',
      achievements: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold">กรอกข้อมูล Resume</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* PDPA Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">หมายเหตุเรื่อง PDPA:</p>
            <p>กรุณากรอกเฉพาะข้อมูลที่เกี่ยวข้องกับงานเท่านั้น ระบบจะไม่เก็บข้อมูลส่วนบุคคลที่ไม่จำเป็น (เช่น เลขบัตรประชาชน, ที่อยู่, เบอร์โทรศัพท์ส่วนตัว)</p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ประสบการณ์การทำงาน <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="4"
              placeholder="เช่น มีประสบการณ์ด้าน HR 5 ปี, Recruitment, Training, Employee Relations"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ทักษะ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="3"
              placeholder="เช่น Interviewing, JD Writing, HR Analytics, Training Facilitation"
              required
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              การศึกษา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="เช่น ปริญญาตรี สาขาบริหารธุรกิจ"
              required
            />
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ผลงาน (ถ้ามี)
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="3"
              placeholder="เช่น ลดเวลาการสรรหาลง 30%, พัฒนาหลักสูตรอบรม 10 หลักสูตร"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold shadow-lg"
            >
              วิเคราะห์ด้วย AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeInputModal;


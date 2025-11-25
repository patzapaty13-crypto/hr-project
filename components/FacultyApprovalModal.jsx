/**
 * ============================================================================
 * Component: Faculty Approval Modal (FacultyApprovalModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ต้นสังกัดพิจารณาและเห็นชอบผู้สมัคร
 * - ใช้สำหรับขั้นตอน application_review
 * 
 * Props:
 * - isOpen: boolean
 * - request: Object
 * - onClose: Function
 * - onApprove: Function
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, CheckCircle, UserCheck } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

const FacultyApprovalModal = ({ isOpen, request, onClose, onApprove }) => {
  const [approved, setApproved] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleApprove = async () => {
    try {
      if (db) {
        const requestRef = doc(db, 'artifacts', appId, 'public', 'data', 'requests', request.id);
        await updateDoc(requestRef, {
          facultyApproved: true,
          facultyApprovedAt: serverTimestamp(),
          facultyNotes: notes,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Local Storage fallback
        const requests = JSON.parse(localStorage.getItem('spu_hr_requests') || '[]');
        const index = requests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          requests[index].facultyApproved = true;
          requests[index].facultyApprovedAt = { seconds: Math.floor(Date.now() / 1000) };
          requests[index].facultyNotes = notes;
          localStorage.setItem('spu_hr_requests', JSON.stringify(requests));
          window.dispatchEvent(new Event('localStorageUpdate'));
        }
      }

      if (onApprove) onApprove();
      onClose();
      alert('บันทึกการเห็นชอบสำเร็จ');
    } catch (error) {
      console.error('Error saving approval:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">พิจารณาและเห็นชอบผู้สมัคร</h2>
              <p className="text-sm text-green-100">{request.position}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              กรุณาพิจารณาใบสมัครที่ HR คัดเลือกมาแล้ว และตัดสินใจเห็นชอบหรือไม่เห็นชอบ
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded"
              />
              <span className="text-lg font-semibold text-gray-900">
                เห็นชอบผู้สมัครที่ HR คัดเลือกมา
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="4"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleApprove}
            disabled={!approved}
            className={`px-6 py-2.5 rounded-lg transition font-semibold shadow-lg ${
              approved
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle size={20} />
              บันทึกการเห็นชอบ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyApprovalModal;


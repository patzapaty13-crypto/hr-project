/**
 * ============================================================================
 * Component: Interview Result Modal (InterviewResultModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - บันทึกผลการสัมภาษณ์
 * - ประเมินผู้สมัคร
 * - ใช้สำหรับขั้นตอน interview_result
 * 
 * Props:
 * - isOpen: boolean
 * - request: Object
 * - onClose: Function
 * - onSave: Function
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, User } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { updateLocalRequestStatus } from '../utils/localStorage';

const InterviewResultModal = ({ isOpen, request, onClose, onSave }) => {
  const [result, setResult] = useState({
    candidateName: '',
    score: '',
    evaluation: '',
    recommendation: 'pass', // 'pass', 'fail', 'pending'
    notes: ''
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!result.candidateName || !result.evaluation) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const interviewResult = {
        ...result,
        recordedAt: new Date().toISOString(),
        recordedBy: 'hr' // ควรดึงจาก user role
      };

      if (db) {
        const requestRef = doc(db, 'artifacts', appId, 'public', 'data', 'requests', request.id);
        await updateDoc(requestRef, {
          interviewResult: interviewResult,
          interviewCompleted: true,
          interviewCompletedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      } else {
        // Local Storage fallback
        const requests = JSON.parse(localStorage.getItem('spu_hr_requests') || '[]');
        const index = requests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          requests[index].interviewResult = interviewResult;
          requests[index].interviewCompleted = true;
          requests[index].interviewCompletedAt = { seconds: Math.floor(Date.now() / 1000) };
          localStorage.setItem('spu_hr_requests', JSON.stringify(requests));
          window.dispatchEvent(new Event('localStorageUpdate'));
        }
      }

      if (onSave) onSave();
      onClose();
      alert('บันทึกผลการสัมภาษณ์สำเร็จ');
    } catch (error) {
      console.error('Error saving interview result:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">บันทึกผลการสัมภาษณ์</h2>
              <p className="text-sm text-purple-100">{request.position}</p>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ชื่อผู้สมัคร <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={result.candidateName}
              onChange={(e) => setResult({ ...result, candidateName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ชื่อ-นามสกุล"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              คะแนนการประเมิน (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={result.score}
              onChange={(e) => setResult({ ...result, score: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="80"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              การประเมิน <span className="text-red-500">*</span>
            </label>
            <textarea
              value={result.evaluation}
              onChange={(e) => setResult({ ...result, evaluation: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="5"
              placeholder="รายละเอียดการประเมิน..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              คำแนะนำ
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="pass"
                  checked={result.recommendation === 'pass'}
                  onChange={(e) => setResult({ ...result, recommendation: e.target.value })}
                  className="w-4 h-4 text-green-600"
                />
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">ผ่าน - เหมาะสมกับตำแหน่ง</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="pending"
                  checked={result.recommendation === 'pending'}
                  onChange={(e) => setResult({ ...result, recommendation: e.target.value })}
                  className="w-4 h-4 text-yellow-600"
                />
                <span className="text-sm text-gray-700">รอพิจารณา</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommendation"
                  value="fail"
                  checked={result.recommendation === 'fail'}
                  onChange={(e) => setResult({ ...result, recommendation: e.target.value })}
                  className="w-4 h-4 text-red-600"
                />
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-700">ไม่ผ่าน</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              value={result.notes}
              onChange={(e) => setResult({ ...result, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
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
            onClick={handleSave}
            className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold shadow-lg"
          >
            บันทึกผล
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultModal;


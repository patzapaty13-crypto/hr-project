/**
 * ============================================================================
 * Component: Status Transition Modal (StatusTransitionModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Modal ยืนยันการเปลี่ยนสถานะ
 * - แสดงคำแนะนำและขั้นตอนที่ต้องทำ
 * - แสดง warnings และข้อควรระวัง
 * - ตรวจสอบความปลอดภัยและความครบถ้วน
 * 
 * Props:
 * - isOpen: boolean
 * - currentStatus: string
 * - newStatus: string
 * - request: Object
 * - onConfirm: Function
 * - onCancel: Function
 * 
 * ============================================================================
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from 'lucide-react';
import { validateStatusTransition, getStepGuidance } from '../utils/workflowValidation';
import { WORKFLOW_STEPS } from '../constants';

const StatusTransitionModal = ({ isOpen, currentStatus, newStatus, request, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  // ตรวจสอบการเปลี่ยนสถานะ
  const validation = validateStatusTransition(currentStatus, newStatus, request);
  const guidance = getStepGuidance(newStatus);

  const currentStep = WORKFLOW_STEPS.find(s => s.id === currentStatus);
  const newStep = WORKFLOW_STEPS.find(s => s.id === newStatus);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 rounded-t-2xl flex justify-between items-center ${
          validation.canProceed 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-red-600 to-rose-600'
        } text-white`}>
          <div className="flex items-center gap-3">
            {validation.canProceed ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
            <h2 className="text-2xl font-bold">
              {validation.canProceed ? 'ยืนยันการเปลี่ยนสถานะ' : 'ไม่สามารถเปลี่ยนสถานะได้'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Transition Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">สถานะปัจจุบัน</p>
                <p className="text-lg font-semibold text-gray-900">{currentStep?.label || currentStatus}</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div>
                <p className="text-sm text-gray-600 mb-1">สถานะใหม่</p>
                <p className="text-lg font-semibold text-gray-900">{newStep?.label || newStatus}</p>
              </div>
            </div>
          </div>

          {/* Validation Message */}
          <div className={`rounded-lg p-4 ${
            validation.canProceed 
              ? 'bg-blue-50 border border-blue-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {validation.canProceed ? (
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${validation.canProceed ? 'text-blue-800' : 'text-red-800'}`}>
                {validation.message}
              </p>
            </div>
          </div>

          {/* Warnings */}
          {validation.warnings && validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-yellow-800">ข้อควรระวัง</h3>
              </div>
              <ul className="space-y-2">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guidance */}
          {validation.canProceed && guidance && (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Info className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-pink-800">คำแนะนำสำหรับขั้นตอนนี้</h3>
              </div>
              <p className="text-sm text-pink-700 mb-3 font-medium">{guidance.title}</p>
              {guidance.steps && guidance.steps.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {guidance.steps.map((step, index) => (
                    <li key={index} className="text-sm text-pink-700 flex items-start gap-2">
                      <span className="text-pink-500 mt-1">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
              {guidance.notes && (
                <div className="bg-pink-100 border border-pink-300 rounded p-3">
                  <p className="text-xs text-pink-800 font-medium">💡 {guidance.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
            <p className="font-semibold mb-1">🔒 หมายเหตุเรื่องความปลอดภัย:</p>
            <p>ระบบจะเก็บเฉพาะข้อมูลที่จำเป็นสำหรับการประมวลผลเท่านั้น ตามหลักการ PDPA</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ยกเลิก
          </button>
          {validation.canProceed && (
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold shadow-lg"
            >
              ยืนยันการเปลี่ยนสถานะ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusTransitionModal;


/**
 * ============================================================================
 * Component: Application Management Modal (ApplicationManagementModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - จัดการใบสมัครสำหรับคำขอแต่ละรายการ
 * - เพิ่ม/ลบ/ดูใบสมัคร
 * - คัดเลือกใบสมัครที่เหมาะสม
 * - ใช้สำหรับขั้นตอน sourcing และ screening
 * 
 * Props:
 * - isOpen: boolean
 * - request: Object - ข้อมูลคำขอ
 * - onClose: Function
 * - onUpdate: Function - เรียกเมื่อมีการอัปเดต
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Plus, FileText, CheckCircle, XCircle, User } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { updateLocalRequestStatus } from '../utils/localStorage';

const ApplicationManagementModal = ({ isOpen, request, onClose, onUpdate }) => {
  const [applications, setApplications] = useState(request.applications || []);
  const [selectedApplications, setSelectedApplications] = useState(request.selectedApplications || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApplication, setNewApplication] = useState({
    name: '',
    email: '',
    phone: '',
    resume: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleAddApplication = () => {
    if (!newApplication.name || !newApplication.email) {
      alert('กรุณากรอกชื่อและอีเมล');
      return;
    }

    const app = {
      id: Date.now().toString(),
      ...newApplication,
      addedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [...applications, app];
    setApplications(updated);
    setNewApplication({ name: '', email: '', phone: '', resume: '', notes: '' });
    setShowAddForm(false);
    saveApplications(updated);
  };

  const handleToggleSelection = (appId) => {
    const updated = selectedApplications.includes(appId)
      ? selectedApplications.filter(id => id !== appId)
      : [...selectedApplications, appId];
    setSelectedApplications(updated);
    saveSelectedApplications(updated);
  };

  const saveApplications = async (apps) => {
    try {
      if (db) {
        const requestRef = doc(db, 'artifacts', appId, 'public', 'data', 'requests', request.id);
        await updateDoc(requestRef, {
          applications: apps,
          hasApplications: apps.length > 0,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Local Storage fallback
        const requests = JSON.parse(localStorage.getItem('spu_hr_requests') || '[]');
        const index = requests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          requests[index].applications = apps;
          requests[index].hasApplications = apps.length > 0;
          localStorage.setItem('spu_hr_requests', JSON.stringify(requests));
          window.dispatchEvent(new Event('localStorageUpdate'));
        }
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving applications:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const saveSelectedApplications = async (selected) => {
    try {
      if (db) {
        const requestRef = doc(db, 'artifacts', appId, 'public', 'data', 'requests', request.id);
        await updateDoc(requestRef, {
          selectedApplications: selected,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Local Storage fallback
        const requests = JSON.parse(localStorage.getItem('spu_hr_requests') || '[]');
        const index = requests.findIndex(r => r.id === request.id);
        if (index !== -1) {
          requests[index].selectedApplications = selected;
          localStorage.setItem('spu_hr_requests', JSON.stringify(requests));
          window.dispatchEvent(new Event('localStorageUpdate'));
        }
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving selected applications:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">จัดการใบสมัคร</h2>
              <p className="text-sm text-blue-100">{request.position}</p>
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
        <div className="p-6 space-y-6">
          {/* Add Application Button */}
          {request.status === 'sourcing' && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
              >
                <Plus size={20} />
                เพิ่มใบสมัคร
              </button>
            </div>
          )}

          {/* Add Application Form */}
          {showAddForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">เพิ่มใบสมัครใหม่</h3>
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล *"
                value={newApplication.name}
                onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="อีเมล *"
                value={newApplication.email}
                onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์"
                value={newApplication.phone}
                onChange={(e) => setNewApplication({ ...newApplication, phone: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="หมายเหตุ/ข้อมูลเพิ่มเติม"
                value={newApplication.notes}
                onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddApplication}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  เพิ่ม
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewApplication({ name: '', email: '', phone: '', resume: '', notes: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Applications List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={20} />
              ใบสมัครทั้งหมด ({applications.length})
            </h3>
            
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>ยังไม่มีใบสมัคร</p>
                {request.status === 'sourcing' && (
                  <p className="text-sm mt-2">กรุณาเพิ่มใบสมัคร</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`border-2 rounded-lg p-4 transition ${
                      selectedApplications.includes(app.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          {selectedApplications.includes(app.id) && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📧 {app.email}</p>
                          {app.phone && <p>📞 {app.phone}</p>}
                          {app.notes && <p className="text-gray-500 italic">{app.notes}</p>}
                        </div>
                      </div>
                      {request.status === 'screening' && (
                        <button
                          onClick={() => handleToggleSelection(app.id)}
                          className={`px-4 py-2 rounded-lg transition font-semibold ${
                            selectedApplications.includes(app.id)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedApplications.includes(app.id) ? 'เลือกแล้ว' : 'เลือก'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Applications Summary */}
          {request.status === 'screening' && selectedApplications.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold">
                คัดเลือกแล้ว: {selectedApplications.length} คน
              </p>
            </div>
          )}

          {/* PDPA Notice */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
            <p className="font-semibold mb-1">🔒 หมายเหตุเรื่อง PDPA:</p>
            <p>ข้อมูลใบสมัครจะถูกเก็บรักษาอย่างปลอดภัย ตามหลักการ PDPA</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationManagementModal;


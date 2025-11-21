/**
 * ============================================================================
 * Component: หน้ายืนยันคำขอ (ConfirmationPage.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดงหน้าสำหรับยืนยันคำขอผ่าน confirmation link จากอีเมล
 * - อัปเดตสถานะคำขอเป็น 'confirmed' เมื่อยืนยันสำเร็จ
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { updateLocalRequestStatus } from '../utils/localStorage';
import { sendConfirmationEmail } from '../utils/emailService';
import SPULogo from './SPULogo';

const ConfirmationPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'notfound'
  const [message, setMessage] = useState('');
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const confirmRequest = async () => {
      if (!requestId) {
        setStatus('error');
        setMessage('ไม่พบ Request ID');
        return;
      }

      try {
        let request = null;

        // ตรวจสอบว่ามี db หรือไม่
        if (db) {
          // ใช้ Firestore (Production Mode)
          const requestRef = doc(
            db,
            'artifacts',
            appId,
            'public',
            'data',
            'requests',
            requestId
          );

          const docSnap = await getDoc(requestRef);

          if (!docSnap.exists()) {
            setStatus('notfound');
            setMessage('ไม่พบคำขอที่ต้องการยืนยัน');
            return;
          }

          request = { id: docSnap.id, ...docSnap.data() };

          // ตรวจสอบว่ายืนยันแล้วหรือยัง
          if (request.status === 'confirmed') {
            setStatus('success');
            setMessage('คำขอนี้ได้รับการยืนยันแล้ว');
            setRequestData(request);
            return;
          }

          // อัปเดตสถานะเป็น 'confirmed'
          await updateDoc(requestRef, {
            status: 'confirmed',
            confirmedAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });

          request.status = 'confirmed';
        } else {
          // ใช้ Local Storage (Demo Mode)
          const localRequests = JSON.parse(localStorage.getItem('spu_hr_requests') || '[]');
          request = localRequests.find(r => r.id === requestId);

          if (!request) {
            setStatus('notfound');
            setMessage('ไม่พบคำขอที่ต้องการยืนยัน');
            return;
          }

          if (request.status === 'confirmed') {
            setStatus('success');
            setMessage('คำขอนี้ได้รับการยืนยันแล้ว');
            setRequestData(request);
            return;
          }

          // อัปเดตสถานะใน Local Storage
          updateLocalRequestStatus(requestId, 'confirmed');
          request.status = 'confirmed';
        }

        // ส่งอีเมลยืนยัน
        sendConfirmationEmail(request, requestId)
          .then(result => {
            if (result.success) {
              console.log('✅ ส่งอีเมลยืนยันสำเร็จ');
            } else {
              console.warn('⚠️ ไม่สามารถส่งอีเมลยืนยันได้:', result.message);
            }
          })
          .catch(error => {
            console.error('❌ Error sending confirmation email:', error);
          });

        setStatus('success');
        setMessage('ยืนยันคำขอสำเร็จ');
        setRequestData(request);
      } catch (error) {
        console.error('Error confirming request:', error);
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดในการยืนยัน: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
      }
    };

    confirmRequest();
  }, [requestId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <SPULogo size="md" />
        </div>

        {/* Status Icon */}
        {status === 'loading' && (
          <div className="mb-6">
            <Loader className="w-16 h-16 text-pink-500 mx-auto animate-spin" />
          </div>
        )}

        {status === 'success' && (
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          </div>
        )}

        {(status === 'error' || status === 'notfound') && (
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
        )}

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'กำลังยืนยัน...'}
          {status === 'success' && 'ยืนยันสำเร็จ'}
          {status === 'error' && 'เกิดข้อผิดพลาด'}
          {status === 'notfound' && 'ไม่พบคำขอ'}
        </h2>

        <p className="text-gray-600 mb-6">{message}</p>

        {/* Request Details */}
        {status === 'success' && requestData && (
          <div className="bg-pink-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700">คณะ:</span>{' '}
                <span className="text-gray-600">{requestData.facultyName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">ตำแหน่ง:</span>{' '}
                <span className="text-gray-600">{requestData.position}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">ประเภท:</span>{' '}
                <span className="text-gray-600">
                  {requestData.type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">จำนวน:</span>{' '}
                <span className="text-gray-600">{requestData.amount} ตำแหน่ง</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition font-medium"
          >
            กลับไปหน้าหลัก
          </button>

          {status === 'success' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              ดู Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;


/**
 * ============================================================================
 * Component: Resume Review (ResumeReview.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Modal สำหรับตรวจสอบ Resume ด้วย AI
 * - อัปโหลดไฟล์ Resume (PDF, DOC, DOCX, TXT)
 * - แสดงผลการตรวจสอบจาก AI
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Upload, FileText, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reviewResumeWithAI } from '../utils/resumeReview';

const ResumeReview = ({ isOpen, onClose, jobRequirements }) => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState('');

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setResumeText('');
      setReviewResult(null);
      setError('');
    }
  }, [isOpen]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setReviewResult(null);

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('กรุณาอัปโหลดไฟล์ PDF, DOC, DOCX หรือ TXT เท่านั้น');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    try {
      // For text files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
      } else {
        // For PDF/DOC files, show message to paste text
        setError('กรุณาคัดลอกข้อความจาก Resume และวางในช่องข้อความด้านล่าง (PDF และ DOC ต้องแปลงเป็นข้อความก่อน)');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
    }
  };

  // Handle analyze
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('กรุณากรอกหรืออัปโหลด Resume');
      return;
    }

    if (!jobRequirements || !jobRequirements.position) {
      setError('ไม่พบข้อมูลตำแหน่งงาน');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setReviewResult(null);

    try {
      const result = await reviewResumeWithAI(resumeText, jobRequirements);
      setReviewResult(result);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบ: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black mb-1">ตรวจสอบ Resume ด้วย AI</h2>
            <p className="text-pink-100 text-sm">ตำแหน่ง: {jobRequirements?.position || 'ไม่ระบุ'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-pink-100 transition p-2 hover:bg-white/20 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          {!reviewResult && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  อัปโหลด Resume (PDF, DOC, DOCX, TXT)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition">
                  <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition font-medium"
                  >
                    เลือกไฟล์
                  </label>
                  <p className="text-sm text-gray-500 mt-2">ขนาดไฟล์ไม่เกิน 5 MB</p>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  หรือวางข้อความจาก Resume
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="วางข้อความจาก Resume ที่นี่..."
                  className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium text-gray-800 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3.5 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    ตรวจสอบ Resume
                  </>
                )}
              </button>
            </>
          )}

          {/* Review Result */}
          {reviewResult && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 border-2 border-pink-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-900">ผลการตรวจสอบ</h3>
                  <div className="text-right">
                    <div className="text-4xl font-black text-pink-600">{reviewResult.score}</div>
                    <div className="text-sm text-gray-600">คะแนนเต็ม 100</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${reviewResult.matchPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700 text-center">
                  ความเหมาะสม: <span className="font-bold text-pink-600">{reviewResult.matchPercentage}%</span>
                </p>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">สรุปผลการตรวจสอบ</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{reviewResult.summary}</p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {reviewResult.strengths.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    จุดแข็ง
                  </h4>
                  <ul className="space-y-2">
                    {reviewResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {reviewResult.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="text-red-600" size={20} />
                    จุดอ่อน
                  </h4>
                  <ul className="space-y-2">
                    {reviewResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {reviewResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="text-blue-600" size={20} />
                    คำแนะนำ
                  </h4>
                  <ul className="space-y-2">
                    {reviewResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setReviewResult(null);
                    setResumeText('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  ตรวจสอบใหม่
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition font-medium"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;


/**
 * ============================================================================
 * Component: Resume Analysis Modal (ResumeAnalysisModal.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Modal สำหรับวิเคราะห์ Resume vs Job Description ด้วย AI
 * - แสดงผลการวิเคราะห์ในรูปแบบ Dashboard
 * - แสดงคะแนนและคำแนะนำ
 * 
 * Props:
 * - isOpen: boolean - ควบคุมการแสดง/ซ่อน Modal
 * - jobDescription: Object - ข้อมูล Job Description
 * - resume: Object - ข้อมูล Resume
 * - onClose: Function - ฟังก์ชันปิด Modal
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { analyzeResume } from '../utils/resumeAnalyzer';

const ResumeAnalysisModal = ({ isOpen, jobDescription, resume, onClose }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // วิเคราะห์เมื่อเปิด Modal
  React.useEffect(() => {
    if (isOpen && jobDescription && resume && !analysisResult && !isAnalyzing) {
      handleAnalyze();
    }
  }, [isOpen, jobDescription, resume]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeResume(jobDescription, resume);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'เหมาะสมมาก';
    if (score >= 60) return 'เหมาะสมปานกลาง';
    return 'ไม่ค่อยเหมาะสม';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">วิเคราะห์ Resume ด้วย AI</h2>
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
          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-pink-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">กำลังวิเคราะห์ด้วย AI...</p>
              <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
              <button
                onClick={handleAnalyze}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <>
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">คะแนนรวม</p>
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreColor(analysisResult.overallScore)}`}>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{analysisResult.overallScore}</div>
                      <div className="text-sm font-semibold">%</div>
                    </div>
                  </div>
                  <p className={`mt-4 text-lg font-semibold ${getScoreColor(analysisResult.overallScore).split(' ')[0]}`}>
                    {getScoreLabel(analysisResult.overallScore)}
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">HR Functional Match</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-600">{analysisResult.functionalMatch}%</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Skills Match</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{analysisResult.skillsMatch}%</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Experience Match</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">{analysisResult.experienceMatch}%</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Education Match</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">{analysisResult.educationMatch}%</span>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {analysisResult.strengths.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">จุดแข็ง</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {analysisResult.gaps.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">จุดที่ควรพัฒนา</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.gaps.map((gap, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">คำแนะนำ</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Analysis */}
              {analysisResult.analysis && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">การวิเคราะห์โดยละเอียด</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{analysisResult.analysis}</p>
                </div>
              )}

              {/* PDPA Notice */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs text-gray-600">
                <p className="font-semibold mb-1">หมายเหตุเรื่อง PDPA:</p>
                <p>การวิเคราะห์นี้ใช้เฉพาะข้อมูลที่เกี่ยวข้องกับงานเท่านั้น ไม่มีการเก็บหรือวิเคราะห์ข้อมูลส่วนบุคคลที่ไม่จำเป็น (เช่น เลขบัตรประชาชน, ที่อยู่) ตามหลักการ PDPA</p>
              </div>
            </>
          )}

          {/* Job Description Info */}
          {jobDescription && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">ตำแหน่งที่วิเคราะห์</h3>
              <p className="text-sm text-gray-700">{jobDescription.position}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisModal;


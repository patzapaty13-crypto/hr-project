/**
 * ============================================================================
 * AI API Routes
 * ============================================================================
 */

import express from 'express';
import { callGemini } from '../../utils/gemini.js';
import { analyzeResume } from '../../utils/resumeAnalyzer.js';

const router = express.Router();

/**
 * POST /api/ai/generate-jd
 * สร้าง Job Description ด้วย AI
 */
router.post('/generate-jd', async (req, res) => {
  try {
    const { position, type, amount } = req.body;
    
    if (!position) {
      return res.status(400).json({
        success: false,
        error: 'Position is required'
      });
    }
    
    const prompt = `เขียนรายละเอียดงาน (Job Description) สำหรับตำแหน่ง "${position}" 
ประเภท: ${type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}
จำนวน: ${amount} ตำแหน่ง

กรุณาเขียนให้ครบถ้วน ครอบคลุม:
1. หน้าที่ความรับผิดชอบหลัก
2. คุณสมบัติผู้สมัคร (วุฒิการศึกษา, ประสบการณ์, ทักษะ)
3. ความรู้และความสามารถที่ต้องการ
4. คุณสมบัติอื่นๆ ที่เกี่ยวข้อง

เขียนเป็นภาษาไทย ให้ชัดเจนและเป็นมืออาชีพ`;

    const jd = await callGemini(prompt);
    
    res.json({
      success: true,
      data: {
        jobDescription: jd,
        position,
        type,
        amount
      }
    });
  } catch (error) {
    console.error('Error generating JD:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/analyze-resume
 * วิเคราะห์ Resume ด้วย AI
 */
router.post('/analyze-resume', async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    
    if (!jobDescription || !resumeText) {
      return res.status(400).json({
        success: false,
        error: 'Job description and resume text are required'
      });
    }
    
    // แปลง resumeText และ jobDescription เป็น object สำหรับ analyzeResume
    let jobDescObj = jobDescription;
    let resumeObj = resumeText;
    
    // ถ้าเป็น string ให้แปลงเป็น object
    if (typeof jobDescription === 'string') {
      // พยายาม parse JSON หรือสร้าง object จาก text
      try {
        jobDescObj = JSON.parse(jobDescription);
      } catch {
        // ถ้า parse ไม่ได้ ให้ parse จาก text format
        const lines = jobDescription.split('\n').map(l => l.trim()).filter(l => l);
        jobDescObj = {
          position: lines.find(l => l.includes('ตำแหน่ง'))?.replace(/ตำแหน่ง:?\s*/i, '').trim() || '',
          description: lines.find(l => l.includes('รายละเอียดงาน'))?.replace(/รายละเอียดงาน:?\s*/i, '').trim() || 
                      lines.find(l => l.includes('รายละเอียด'))?.replace(/รายละเอียด:?\s*/i, '').trim() || 
                      jobDescription,
          requirements: lines.find(l => l.includes('คุณสมบัติ'))?.replace(/คุณสมบัติที่ต้องการ:?\s*/i, '').trim() || 
                       lines.find(l => l.includes('คุณสมบัติ'))?.replace(/คุณสมบัติ:?\s*/i, '').trim() || ''
        };
      }
    }
    
    if (typeof resumeText === 'string') {
      // พยายาม parse JSON หรือสร้าง object จาก text
      try {
        resumeObj = JSON.parse(resumeText);
      } catch {
        // ถ้า parse ไม่ได้ ให้ parse จาก text format
        const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l);
        resumeObj = {
          experience: lines.find(l => l.includes('ประสบการณ์'))?.replace(/ประสบการณ์การทำงาน:?\s*/i, '').trim() || 
                     lines.find(l => l.includes('ประสบการณ์'))?.replace(/ประสบการณ์:?\s*/i, '').trim() || '',
          skills: lines.find(l => l.includes('ทักษะ'))?.replace(/ทักษะ:?\s*/i, '').trim() || '',
          education: lines.find(l => l.includes('การศึกษา'))?.replace(/การศึกษา:?\s*/i, '').trim() || '',
          achievements: lines.find(l => l.includes('ผลงาน'))?.replace(/ผลงาน:?\s*/i, '').trim() || ''
        };
      }
    }
    
    const analysis = await analyzeResume(jobDescObj, resumeObj);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์'
    });
  }
});

export default router;


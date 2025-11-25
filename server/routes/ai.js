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
    
    const analysis = await analyzeResume(jobDescription, resumeText);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;


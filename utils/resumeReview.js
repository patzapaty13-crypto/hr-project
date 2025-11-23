/**
 * ============================================================================
 * Utility: Resume Review with AI (resumeReview.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ใช้ AI (Gemini) ตรวจสอบ Resume
 * - วิเคราะห์ความเหมาะสมกับตำแหน่งงาน
 * - ให้คะแนนและคำแนะนำ
 * 
 * ============================================================================
 */

import { callGemini } from './gemini';

/**
 * ตรวจสอบ Resume ด้วย AI
 * 
 * @param {string} resumeText - ข้อความจาก Resume (text หรือ extracted text)
 * @param {Object} jobRequirements - ข้อมูลตำแหน่งงาน
 * @param {string} jobRequirements.position - ตำแหน่งงาน
 * @param {string} jobRequirements.description - รายละเอียดงาน
 * @param {string} jobRequirements.requirements - คุณสมบัติที่ต้องการ
 * 
 * @returns {Promise<Object>} - ผลการตรวจสอบ
 * {
 *   score: number,           // คะแนน 0-100
 *   matchPercentage: number, // เปอร์เซ็นต์ความเหมาะสม
 *   strengths: string[],    // จุดแข็ง
 *   weaknesses: string[],   // จุดอ่อน
 *   recommendations: string[], // คำแนะนำ
 *   summary: string         // สรุปผลการตรวจสอบ
 * }
 */
export const reviewResumeWithAI = async (resumeText, jobRequirements) => {
  try {
    const prompt = `คุณเป็นผู้เชี่ยวชาญด้านการสรรหาและคัดเลือกบุคลากร กรุณาตรวจสอบ Resume ต่อไปนี้และประเมินความเหมาะสมกับตำแหน่งงาน

**ตำแหน่งงาน:** ${jobRequirements.position || 'ไม่ระบุ'}

**รายละเอียดงาน:**
${jobRequirements.description || 'ไม่ระบุ'}

**คุณสมบัติที่ต้องการ:**
${jobRequirements.requirements || 'ไม่ระบุ'}

**Resume ของผู้สมัคร:**
${resumeText}

กรุณาวิเคราะห์และให้ผลการตรวจสอบในรูปแบบ JSON ต่อไปนี้:
{
  "score": 0-100,
  "matchPercentage": 0-100,
  "strengths": ["จุดแข็ง 1", "จุดแข็ง 2"],
  "weaknesses": ["จุดอ่อน 1", "จุดอ่อน 2"],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2"],
  "summary": "สรุปผลการตรวจสอบโดยย่อ"
}

กรุณาตอบกลับเฉพาะ JSON เท่านั้น ไม่ต้องมีข้อความอื่น`;

    const response = await callGemini(prompt);
    
    // พยายาม parse JSON จาก response
    try {
      // ลบ markdown code blocks ถ้ามี
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const result = JSON.parse(jsonText);
      
      // Validate result structure
      return {
        score: result.score || 0,
        matchPercentage: result.matchPercentage || 0,
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        summary: result.summary || 'ไม่สามารถวิเคราะห์ได้'
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // ถ้า parse ไม่ได้ ให้สร้างผลลัพธ์จากข้อความ
      return {
        score: 0,
        matchPercentage: 0,
        strengths: [],
        weaknesses: [],
        recommendations: ['ไม่สามารถวิเคราะห์ Resume ได้ กรุณาตรวจสอบรูปแบบข้อมูล'],
        summary: response || 'เกิดข้อผิดพลาดในการวิเคราะห์ Resume'
      };
    }
  } catch (error) {
    console.error('Error reviewing resume:', error);
    return {
      score: 0,
      matchPercentage: 0,
      strengths: [],
      weaknesses: [],
      recommendations: ['เกิดข้อผิดพลาดในการตรวจสอบ Resume กรุณาลองใหม่อีกครั้ง'],
      summary: 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI'
    };
  }
};


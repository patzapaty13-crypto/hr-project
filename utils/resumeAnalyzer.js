/**
 * ============================================================================
 * Utility: Resume Analyzer with AI (resumeAnalyzer.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - วิเคราะห์ Resume vs Job Description ด้วย AI (Gemini)
 * - ให้คะแนนความสอดคล้อง (Matching Score)
 * - วิเคราะห์ตามเกณฑ์ต่างๆ ที่เกี่ยวข้องกับงาน HR
 * - ระวังเรื่อง PDPA (ไม่เก็บข้อมูลส่วนบุคคลที่ไม่จำเป็น)
 * 
 * เกณฑ์การประเมิน:
 * 1. HR Functional Match (ความสอดคล้องกับงาน HR)
 * 2. Skills Matching (ทักษะที่ตรงกับ JD)
 * 3. Experience Matching (ประสบการณ์ที่เกี่ยวข้อง)
 * 4. Education Matching (วุฒิการศึกษา)
 * 5. Overall Fit Score (คะแนนรวม)
 * 
 * PDPA Compliance:
 * - ใช้เฉพาะข้อมูลที่จำเป็นสำหรับการประเมิน
 * - ไม่เก็บข้อมูลส่วนบุคคลที่ไม่เกี่ยวข้อง (เช่น เลขบัตรประชาชน, ที่อยู่)
 * - วิเคราะห์เฉพาะข้อมูลที่เกี่ยวข้องกับงาน
 * 
 * ============================================================================
 */

import { callGemini } from './gemini';

/**
 * ============================================================================
 * ฟังก์ชันวิเคราะห์ Resume vs Job Description
 * ============================================================================
 * 
 * @param {Object} jobDescription - ข้อมูล Job Description
 *   - position: ตำแหน่งงาน
 *   - description: รายละเอียดงาน
 *   - requirements: คุณสมบัติที่ต้องการ
 * 
 * @param {Object} resume - ข้อมูล Resume (เฉพาะส่วนที่จำเป็น)
 *   - experience: ประสบการณ์การทำงาน
 *   - skills: ทักษะ
 *   - education: การศึกษา
 *   - achievements: ผลงาน
 * 
 * @returns {Promise<Object>} - ผลการวิเคราะห์
 *   - overallScore: คะแนนรวม (0-100)
 *   - functionalMatch: คะแนนความสอดคล้องกับงาน HR (0-100)
 *   - skillsMatch: คะแนนทักษะ (0-100)
 *   - experienceMatch: คะแนนประสบการณ์ (0-100)
 *   - educationMatch: คะแนนการศึกษา (0-100)
 *   - strengths: จุดแข็ง
 *   - gaps: จุดที่ยังขาด
 *   - recommendations: คำแนะนำ
 *   - analysis: การวิเคราะห์โดยละเอียด
 */
export const analyzeResume = async (jobDescription, resume) => {
  try {
    // สร้าง Prompt สำหรับ AI วิเคราะห์ Resume
    const prompt = `คุณคือผู้เชี่ยวชาญด้าน HRBP และ Talent Acquisition ที่มีประสบการณ์มากกว่า 10 ปี

โปรดวิเคราะห์ Resume กับ Job Description ตามเกณฑ์ต่อไปนี้:

**JOB DESCRIPTION:**
ตำแหน่ง: ${jobDescription.position || 'ไม่ระบุ'}
รายละเอียดงาน: ${jobDescription.description || 'ไม่ระบุ'}
คุณสมบัติที่ต้องการ: ${jobDescription.requirements || 'ไม่ระบุ'}

**RESUME:**
ประสบการณ์: ${resume.experience || 'ไม่ระบุ'}
ทักษะ: ${resume.skills || 'ไม่ระบุ'}
การศึกษา: ${resume.education || 'ไม่ระบุ'}
ผลงาน: ${resume.achievements || 'ไม่ระบุ'}

**เกณฑ์การประเมิน:**
1. HR Functional Match (0-100): ความสอดคล้องกับงาน HR (Recruitment, HRD, C&B, ER, HRIS, OD, etc.)
2. Skills Match (0-100): ทักษะที่ตรงกับ JD (Interviewing, JD Writing, Data Analysis, Training, etc.)
3. Experience Match (0-100): ประสบการณ์ที่เกี่ยวข้อง
4. Education Match (0-100): วุฒิการศึกษาที่เหมาะสม

**โปรดตอบกลับในรูปแบบ JSON เท่านั้น:**
{
  "overallScore": 85,
  "functionalMatch": 90,
  "skillsMatch": 80,
  "experienceMatch": 85,
  "educationMatch": 90,
  "strengths": ["มีประสบการณ์ด้าน Recruitment", "ทักษะการสัมภาษณ์ดี"],
  "gaps": ["ขาดประสบการณ์ด้าน HRIS", "ยังไม่มีประสบการณ์ด้าน OD"],
  "recommendations": ["ควรเพิ่มประสบการณ์ด้าน HR Analytics", "ควรพัฒนาทักษะการใช้ HRIS"],
  "analysis": "การวิเคราะห์โดยละเอียด..."
}

**หมายเหตุ:**
- ให้คะแนนตามความเป็นจริง
- ระบุจุดแข็งและจุดที่ต้องพัฒนาอย่างชัดเจน
- ให้คำแนะนำที่เป็นประโยชน์
- วิเคราะห์เฉพาะข้อมูลที่เกี่ยวข้องกับงาน (ไม่วิเคราะห์ข้อมูลส่วนบุคคลที่ไม่เกี่ยวข้อง)`;

    // เรียกใช้ Gemini AI
    const aiResponse = await callGemini(prompt);
    
    // พยายาม parse JSON จาก response
    let analysisResult;
    try {
      // ลบ markdown code blocks ถ้ามี
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // ถ้า parse ไม่ได้ ให้สร้างผลลัพธ์ default
      console.warn('Failed to parse AI response as JSON:', parseError);
      analysisResult = {
        overallScore: 0,
        functionalMatch: 0,
        skillsMatch: 0,
        experienceMatch: 0,
        educationMatch: 0,
        strengths: ['ไม่สามารถวิเคราะห์ได้'],
        gaps: ['AI ไม่สามารถตอบกลับได้'],
        recommendations: ['กรุณาลองใหม่อีกครั้ง'],
        analysis: aiResponse || 'เกิดข้อผิดพลาดในการวิเคราะห์'
      };
    }

    // Validate และ normalize คะแนน
    const normalizeScore = (score) => {
      const num = typeof score === 'number' ? score : parseInt(score) || 0;
      return Math.max(0, Math.min(100, num));
    };

    return {
      overallScore: normalizeScore(analysisResult.overallScore || 0),
      functionalMatch: normalizeScore(analysisResult.functionalMatch || 0),
      skillsMatch: normalizeScore(analysisResult.skillsMatch || 0),
      experienceMatch: normalizeScore(analysisResult.experienceMatch || 0),
      educationMatch: normalizeScore(analysisResult.educationMatch || 0),
      strengths: Array.isArray(analysisResult.strengths) ? analysisResult.strengths : [],
      gaps: Array.isArray(analysisResult.gaps) ? analysisResult.gaps : [],
      recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
      analysis: analysisResult.analysis || aiResponse || 'ไม่สามารถวิเคราะห์ได้'
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      overallScore: 0,
      functionalMatch: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      strengths: [],
      gaps: ['เกิดข้อผิดพลาดในการวิเคราะห์'],
      recommendations: ['กรุณาลองใหม่อีกครั้ง'],
      analysis: 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI'
    };
  }
};

/**
 * ============================================================================
 * ฟังก์ชันสร้างสรุปผลการวิเคราะห์ (สำหรับแสดงใน Dashboard)
 * ============================================================================
 * 
 * @param {Object} analysisResult - ผลการวิเคราะห์จาก analyzeResume
 * @returns {string} - ข้อความสรุป
 */
export const generateSummary = (analysisResult) => {
  const { overallScore, strengths, gaps } = analysisResult;
  
  let summary = `คะแนนรวม: ${overallScore}%\n\n`;
  
  if (strengths.length > 0) {
    summary += `จุดแข็ง:\n${strengths.map(s => `- ${s}`).join('\n')}\n\n`;
  }
  
  if (gaps.length > 0) {
    summary += `จุดที่ควรพัฒนา:\n${gaps.map(g => `- ${g}`).join('\n')}\n\n`;
  }
  
  return summary;
};


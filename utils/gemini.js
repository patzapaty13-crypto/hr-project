/**
 * ============================================================================
 * Utility: Gemini AI Integration (gemini.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - เชื่อมต่อกับ Google Gemini AI API
 * - ส่ง Prompt และรับข้อความตอบกลับจาก AI
 * - ใช้สำหรับสร้าง Job Description อัตโนมัติใน SimpleForm
 * 
 * วิธีการใช้งาน:
 * 1. ตั้งค่า API Key ของ Gemini ในตัวแปร apiKey
 * 2. เรียกใช้ callGemini(prompt) โดยส่ง Prompt เป็น String
 * 3. รับข้อความตอบกลับจาก AI
 * 
 * หมายเหตุ:
 * - ต้องมี Gemini API Key (ขอได้จาก Google AI Studio)
 * - API Key ไม่ควร Hard-code ในโค้ด ควรใช้ Environment Variable
 * - กรณี Production ควรใช้ Backend Server เพื่อซ่อน API Key
 * 
 * ============================================================================
 */

// ============================================================================
// API Key สำหรับเรียกใช้ Gemini AI
// ============================================================================
// หมายเหตุ: ควรย้ายไปใช้ Environment Variable (.env) แทนการ Hard-code
// ตัวอย่าง: const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const apiKey = "";

/**
 * ============================================================================
 * ฟังก์ชันเรียกใช้ Gemini AI เพื่อสร้างข้อความอัตโนมัติ
 * ============================================================================
 * 
 * @param {string} prompt - คำสั่งหรือคำถามที่ต้องการให้ AI ทำ
 *   ตัวอย่าง: "เขียนรายละเอียดงาน สำหรับตำแหน่ง Programmer ภาษาไทย"
 * 
 * @returns {Promise<string>} - ข้อความตอบกลับจาก AI
 *   ตัวอย่าง: "ตำแหน่ง Programmer มีหน้าที่พัฒนาโปรแกรม..."
 * 
 * การทำงาน:
 * 1. ส่ง HTTP POST Request ไปยัง Gemini API
 * 2. รอรับ Response จาก API
 * 3. แปลง JSON Response เป็นข้อความ
 * 4. คืนค่าข้อความ หรือข้อความ Error ถ้าเกิดปัญหา
 * 
 * Error Handling:
 * - ถ้า API ไม่ตอบกลับ: คืนค่า "เกิดข้อผิดพลาดในการเชื่อมต่อ AI"
 * - ถ้า Response ไม่ถูกต้อง: คืนค่า "AI ไม่สามารถตอบกลับได้"
 */
export const callGemini = async (prompt) => {
  try {
    /**
     * สร้าง URL สำหรับเรียกใช้ Gemini API
     * 
     * API Endpoint:
     * https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
     * 
     * Model: gemini-2.5-flash-preview-09-2025
     * - เป็น Model Preview (อาจเปลี่ยนแปลงในอนาคต)
     * - ใช้สำหรับ Text Generation ที่รวดเร็ว
     * 
     * Query Parameter: key={apiKey}
     * - ต้องส่ง API Key เป็น Query Parameter
     */
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    /**
     * ส่ง HTTP POST Request ไปยัง Gemini API
     * 
     * Request Body (JSON):
     * {
     *   "contents": [
     *     {
     *       "parts": [
     *         { "text": "prompt ที่ส่งมา" }
     *       ]
     *     }
     *   ]
     * }
     */
    const response = await fetch(apiUrl, {
      method: 'POST',  // HTTP Method: POST
      headers: { 
        'Content-Type': 'application/json'  // ระบุว่าเป็น JSON
      },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ 
            text: prompt  // Prompt ที่ส่งมาจาก SimpleForm
          }] 
        }] 
      })
    });
    
    /**
     * แปลง Response จาก JSON เป็น JavaScript Object
     * Response Structure:
     * {
     *   "candidates": [
     *     {
     *       "content": {
     *         "parts": [
     *           { "text": "ข้อความตอบกลับจาก AI" }
     *         ]
     *       }
     *     }
     *   ]
     * }
     */
    const data = await response.json();
    
    /**
     * ดึงข้อความจาก JSON Response
     * 
     * Optional Chaining (?.) ใช้เพื่อป้องกัน Error ถ้า Property ไม่มี
     * - data.candidates?.[0]: ถ้ามี candidates และมี Element แรก
     * - ?.content?.parts?.[0]: ถ้ามี content และมี parts และมี Element แรก
     * - ?.text: ถ้ามี text
     * 
     * ถ้าไม่มีข้อความ: คืนค่า "AI ไม่สามารถตอบกลับได้"
     */
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI ไม่สามารถตอบกลับได้";
  } catch (error) {
    /**
     * จัดการ Error เมื่อเกิดปัญหาในการเชื่อมต่อหรือประมวลผล
     * 
     * กรณีที่อาจเกิด Error:
     * - Network Error: ไม่สามารถเชื่อมต่อกับ API ได้
     * - Invalid API Key: API Key ไม่ถูกต้องหรือหมดอายุ
     * - Rate Limit: เรียกใช้ API มากเกินไป
     * - Invalid Request: Request Body ไม่ถูกต้อง
     */
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อ AI";
  }
};


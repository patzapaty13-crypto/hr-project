/**
 * ============================================================================
 * Component: แบบฟอร์มสร้างคำขอใหม่ (SimpleForm.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Popup Modal สำหรับสร้างคำขอใหม่
 * - ให้ผู้ใช้กรอกข้อมูลตำแหน่งงาน (ชื่อตำแหน่ง, ประเภท, จำนวน, รายละเอียด)
 * - มีฟีเจอร์ AI ช่วยร่าง Job Description อัตโนมัติ (ใช้ Gemini API)
 * - บันทึกข้อมูลลง Firestore Database
 * 
 * Props ที่รับมา:
 * - faculty: ข้อมูลคณะที่เลือก (Object มี id และ name)
 * - onClose: ฟังก์ชันสำหรับปิด Popup (เรียกจาก App.jsx)
 * - onSubmit: ฟังก์ชันที่เรียกหลังจากบันทึกข้อมูลสำเร็จ (เรียกจาก App.jsx)
 * - userId: ID ของผู้ใช้ที่สร้างคำขอ (Firebase User ID)
 * 
 * Features:
 * - Form Validation: ตรวจสอบว่ากรอกชื่อตำแหน่งก่อนใช้ AI
 * - AI Integration: ใช้ Gemini AI ช่วยเขียน Job Description
 * - Real-time Update: เมื่อบันทึกข้อมูล Dashboard จะอัปเดตอัตโนมัติ
 * 
 * ============================================================================
 */

import React, { useState } from 'react';

// ============================================================================
// นำเข้า Icons จาก lucide-react
// ============================================================================
// X: Icon สำหรับปุ่มปิด Popup
import { X } from 'lucide-react';

// ============================================================================
// นำเข้า Firestore Functions
// ============================================================================
// collection: สร้าง Reference ไปยัง Collection ใน Firestore
// addDoc: ฟังก์ชันสำหรับเพิ่ม Document ใหม่ลงใน Collection
// serverTimestamp: ฟังก์ชันสำหรับบันทึกเวลาจาก Server
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================================
// นำเข้า Firebase Configuration
// ============================================================================
// db: Firestore Database Instance
// appId: ID ของแอป (ใช้สำหรับสร้าง Path ใน Firestore)
import { db, appId } from '../config/firebase';

// ============================================================================
// นำเข้า Gemini AI Utility
// ============================================================================
// callGemini: ฟังก์ชันสำหรับเรียกใช้ Gemini AI API
import { callGemini } from '../utils/gemini';

/**
 * ============================================================================
 * Component SimpleForm
 * ============================================================================
 */
const SimpleForm = ({ faculty, onClose, onSubmit, userId }) => {
  // ========================================================================
  // State Management
  // ========================================================================
  // form: เก็บข้อมูลฟอร์มทั้งหมด
  // - position: ชื่อตำแหน่งงาน (String)
  // - type: ประเภท ('new' = อัตราใหม่, 'replacement' = ทดแทน)
  // - amount: จำนวนตำแหน่ง (Number)
  // - description: รายละเอียดงาน/คุณสมบัติ (String)
  const [form, setForm] = useState({
    position: '',        // ชื่อตำแหน่งงาน (เริ่มต้น: ว่าง)
    type: 'new',        // ประเภท (เริ่มต้น: 'new' = อัตราใหม่)
    amount: 1,          // จำนวน (เริ่มต้น: 1 ตำแหน่ง)
    description: ''     // รายละเอียด (เริ่มต้น: ว่าง)
  });
  
  // aiLoading: สถานะการโหลด AI (true = กำลังทำงาน, false = เสร็จแล้ว)
  // ใช้สำหรับแสดงข้อความ "กำลังเขียน..." บนปุ่ม AI
  const [aiLoading, setAiLoading] = useState(false);

  // ========================================================================
  // ฟังก์ชันเรียก AI ให้ช่วยเขียน Job Description
  // ========================================================================
  /**
   * handleAI: ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่ม "ให้ AI ช่วยร่าง"
   * 
   * การทำงาน:
   * 1. ตรวจสอบว่ากรอกชื่อตำแหน่งหรือยัง
   * 2. ถ้ายังไม่กรอก -> แสดง Alert และหยุดการทำงาน
   * 3. ถ้ากรอกแล้ว -> เรียก Gemini AI เพื่อสร้าง Job Description
   * 4. ใส่ข้อความที่ได้จาก AI ลงใน description
   */
  const handleAI = async () => {
    // ตรวจสอบว่ากรอกชื่อตำแหน่งหรือยัง
    if (!form.position) {
      alert('กรุณากรอกชื่อตำแหน่งก่อน');
      return;  // หยุดการทำงานถ้ายังไม่กรอก
    }
    
    // ตั้งค่า loading เป็น true เพื่อแสดงข้อความ "กำลังเขียน..."
    setAiLoading(true);
    
    /**
     * สร้าง Prompt สำหรับ Gemini AI
     * Prompt: คำสั่งที่ส่งให้ AI เพื่อให้ AI สร้าง Job Description
     * - ระบุตำแหน่งงาน
     * - ขอให้เขียน Job Description และคุณสมบัติ
     * - กำหนดให้สั้นๆ เป็นทางการ ภาษาไทย
     */
    const prompt = `เขียนรายละเอียดงาน (Job Description) และคุณสมบัติ สำหรับตำแหน่ง "${form.position}" สั้นๆ เป็นทางการ ภาษาไทย`;
    
    /**
     * เรียกใช้ Gemini AI API
     * callGemini จะส่ง Prompt ไปยัง Gemini API และรอรับข้อความตอบกลับ
     */
    const aiResponse = await callGemini(prompt);
    
    /**
     * อัปเดต State description ด้วยข้อความที่ได้จาก AI
     * prev => ({ ...prev, description: aiResponse })
     * - ...prev: คัดลอกค่าทั้งหมดของ form เดิม (position, type, amount)
     * - description: อัปเดตด้วยข้อความใหม่จาก AI
     */
    setForm(prev => ({ ...prev, description: aiResponse }));
    
    // ตั้งค่า loading เป็น false เพราะเสร็จแล้ว
    setAiLoading(false);
  };

  // ========================================================================
  // ฟังก์ชันบันทึกข้อมูลลง Firestore
  // ========================================================================
  /**
   * handleSubmit: ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่ม "บันทึกข้อมูล"
   * 
   * การทำงาน:
   * 1. สร้าง Object ข้อมูลคำขอใหม่
   * 2. บันทึกลง Firestore Database
   * 3. ถ้าสำเร็จ -> เรียก onSubmit เพื่อปิด Popup
   * 4. ถ้าเกิด Error -> แสดง Alert และหยุดการทำงาน
   */
  const handleSubmit = async () => {
    // ตรวจสอบว่ามี db หรือไม่
    if (!db) {
      alert('Firestore ไม่พร้อมใช้งาน ไม่สามารถบันทึกข้อมูลได้\n\nกรุณาตรวจสอบการตั้งค่า Firebase Config ใน index.html');
      return;
    }

    // ตรวจสอบข้อมูลที่กรอก
    if (!form.position || form.position.trim() === '') {
      alert('กรุณากรอกชื่อตำแหน่ง');
      return;
    }

    try {
      /**
       * สร้าง Object ข้อมูลคำขอใหม่
       * ประกอบด้วย:
       * - ...form: ข้อมูลจากฟอร์ม (position, type, amount, description)
       * - facultyId: ID ของคณะที่สร้างคำขอ
       * - facultyName: ชื่อคณะที่สร้างคำขอ
       * - status: สถานะเริ่มต้น ('submitted' = ส่งเรื่องให้ HR)
       * - createdAt: เวลาที่สร้างคำขอ (ใช้เวลาจาก Server)
       * - userId: ID ของผู้ใช้ที่สร้างคำขอ
       */
      const newRequest = {
        ...form,                    // ข้อมูลจากฟอร์ม
        position: form.position.trim(), // ตัดช่องว่างหน้า-หลัง
        facultyId: faculty.id,      // ID ของคณะ
        facultyName: faculty.name,  // ชื่อคณะ
        status: 'submitted',        // สถานะเริ่มต้น: ส่งเรื่องให้ HR แล้ว
        createdAt: serverTimestamp(), // เวลาจาก Server (ไม่ใช่เวลาจาก Client)
        userId                      // ID ของผู้ใช้
      };
      
      /**
       * บันทึกลง Firestore Database
       * 
       * collection(db, 'artifacts', appId, 'public', 'data', 'requests'):
       * - สร้าง Reference ไปยัง Collection 'requests'
       * - Path: artifacts/{appId}/public/data/requests
       * 
       * addDoc(collectionRef, data):
       * - เพิ่ม Document ใหม่ลงใน Collection
       * - Firestore จะสร้าง Document ID ให้อัตโนมัติ
       * - เมื่อบันทึกสำเร็จ Dashboard จะอัปเดตอัตโนมัติ (เพราะใช้ onSnapshot)
       */
      await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', 'requests'),
        newRequest
      );
      
      /**
       * เรียก onSubmit เพื่อปิด Popup
       * onSubmit มาจาก App.jsx และจะทำการ setShowForm(false)
       */
      onSubmit();
    } catch (error) {
      /**
       * จัดการ Error เมื่อบันทึกข้อมูลไม่สำเร็จ
       * - แสดง Error ใน Console สำหรับ Developer
       * - แสดง Alert แจ้งเตือนผู้ใช้
       */
      console.error("Error creating request:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
    }
  };

  // ========================================================================
  // Render: ส่วนแสดงผล UI (Popup Modal)
  // ========================================================================
  // Overlay: พื้นหลังมืดเพื่อเน้น Popup
  // fixed inset-0: ครอบคลุมทั้งหน้าจอ
  // bg-black bg-opacity-50: พื้นหลังสีดำโปร่งใส 50%
  // flex items-center justify-center: จัดให้ Popup อยู่กึ่งกลาง
  // z-50: วางไว้เหนือ Elements อื่นๆ
  return (
    <div className="fixed inset-0 bg-pink-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      {/* 
        Popup Modal: กล่องฟอร์ม
        bg-white: พื้นหลังขาว
        rounded-lg: มุมโค้ง
        max-w-lg: ความกว้างสูงสุด 32rem (512px)
        shadow-xl: เงาเพื่อให้เด่นชัด
        responsive: w-full บน mobile, max-w-lg บน desktop
      */}
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl border-2 border-pink-200 my-auto">
        {/* 
          ====================================================================
          ส่วนหัว Popup: หัวข้อและปุ่มปิด
          ====================================================================
        */}
        <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-gradient-to-r from-pink-600 to-rose-600 rounded-t-xl sm:rounded-t-2xl sticky top-0 z-10">
          {/* หัวข้อ */}
          <h3 className="font-bold text-white text-base sm:text-lg">
            บันทึกข้อความขออัตราใหม่
          </h3>
          {/* ปุ่มปิด (X) */}
          <button 
            onClick={onClose}  // เมื่อกดให้เรียก onClose เพื่อปิด Popup
            aria-label="ปิด"
            className="text-white hover:bg-white/20 rounded-full p-1 transition flex-shrink-0"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* 
          ====================================================================
          เนื้อหาฟอร์ม
          ====================================================================
          space-y-4: ระยะห่างระหว่าง Fields ในแนวตั้ง
        */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 
            Field 1: หน่วยงาน (แสดงเท่านั้น ไม่สามารถแก้ไขได้)
            disabled: ไม่สามารถแก้ไขได้ (เพราะมาจากคณะที่เลือกตอน Login)
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หน่วยงาน
            </label>
            <input 
              type="text" 
              disabled  // ไม่สามารถแก้ไขได้
              value={faculty.name}  // แสดงชื่อคณะที่เลือกตอน Login
              className="w-full bg-gray-100 border px-3 py-2 rounded text-sm"
            />
          </div>

          {/* 
            Field 2: ตำแหน่งที่ต้องการรับ (Input ข้อความ)
            required: บังคับให้กรอก (ควรเพิ่ม validation)
          */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ตำแหน่งที่ต้องการรับ
            </label>
              <input 
                type="text" 
                className="w-full border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                value={form.position}
                onChange={e => setForm({...form, position: e.target.value})}  // อัปเดต position เมื่อพิมพ์
                placeholder="เช่น เจ้าหน้าที่บริหารงานทั่วไป"
              />
          </div>

          {/* 
            Field 3 & 4: ประเภทและจำนวน (อยู่แถวเดียวกัน)
            flex space-x-4: จัดให้อยู่แถวเดียวกัน มีระยะห่างระหว่างกัน
            responsive: flex-col บน mobile, flex-row บน desktop
          */}
          <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 sm:gap-0">
            {/* Field 3: ประเภท (Dropdown) */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <select 
                className="w-full border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}  // อัปเดต type เมื่อเลือก
              >
                <option value="new">อัตราใหม่</option>
                <option value="replacement">ทดแทน</option>
              </select>
            </div>
            {/* Field 4: จำนวน (Input ตัวเลข) */}
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวน
              </label>
              <input 
                type="number" 
                min="1"  // จำนวนขั้นต่ำ 1
                className="w-full border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                value={form.amount}
                onChange={e => {
                  const value = e.target.value;
                  // แปลงเป็นตัวเลข ถ้าเป็นค่าว่างหรือ NaN ให้ใช้ 1
                  setForm({...form, amount: value === '' ? 1 : parseInt(value) || 1});
                }}  // อัปเดต amount เมื่อพิมพ์
              />
            </div>
          </div>

          {/* 
            Field 5: รายละเอียด / คุณสมบัติ (Textarea + ปุ่ม AI)
          */}
          <div>
            {/* ส่วนหัว: Label และปุ่ม AI */}
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                รายละเอียด / คุณสมบัติ
              </label>
              {/* 
                ปุ่มเรียก AI
                disabled: ปิดการใช้งานเมื่อ AI กำลังทำงาน
                aiLoading: สถานะการทำงานของ AI
              */}
                <button 
                  onClick={handleAI}  // เมื่อกดให้เรียก handleAI
                  disabled={aiLoading}  // ปิดการใช้งานเมื่อ AI กำลังทำงาน
                  className="text-xs text-pink-700 border-2 border-pink-300 bg-pink-100 px-3 py-1.5 rounded-lg hover:bg-pink-200 disabled:opacity-50 transition font-medium shadow-sm"
                >
                  {aiLoading ? '⏳ กำลังเขียน...' : '✨ ให้ AI ช่วยร่าง'}
                </button>
            </div>
            {/* Textarea: กรอกรายละเอียดงาน */}
             <textarea 
                rows="5"  // จำนวนแถว 5 แถว
                className="w-full border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none text-sm"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}  // อัปเดต description เมื่อพิมพ์
                placeholder="ระบุหน้าที่ความรับผิดชอบ..."
             />
          </div>
        </div>

        {/* 
          ====================================================================
          ส่วนปุ่มด้านล่าง: ปุ่มยกเลิกและบันทึกข้อมูล
          ====================================================================
          flex justify-end: จัดให้ปุ่มอยู่ทางขวา
          space-x-3: ระยะห่างระหว่างปุ่ม
        */}
        <div className="p-4 sm:p-5 border-t bg-pink-50 rounded-b-xl sm:rounded-b-2xl flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-3 sticky bottom-0">
          {/* ปุ่มยกเลิก: ปิด Popup โดยไม่บันทึกข้อมูล */}
          <button 
            onClick={onClose}  // เมื่อกดให้เรียก onClose เพื่อปิด Popup
            className="px-4 sm:px-5 py-2.5 sm:py-2 text-pink-700 text-sm font-medium hover:bg-pink-100 rounded-lg transition border border-pink-300 w-full sm:w-auto"
          >
            ยกเลิก
          </button>
          {/* ปุ่มบันทึกข้อมูล: บันทึกข้อมูลลง Firestore */}
          <button 
            onClick={handleSubmit}  // เมื่อกดให้เรียก handleSubmit เพื่อบันทึกข้อมูล
            className="px-4 sm:px-5 py-2.5 sm:py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition shadow-md w-full sm:w-auto"
          >
            บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export Component
// ============================================================================
export default SimpleForm;


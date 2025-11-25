/**
 * ============================================================================
 * Component: Train Animation (TrainAnimation.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง animation รถไฟฟ้าวิ่งไปมาบน navbar
 * - ใช้ CSS animation สำหรับการเคลื่อนไหว
 * 
 * ============================================================================
 */

import React from 'react';

const TrainAnimation = () => {
  return (
    <>
      <div className="relative overflow-hidden h-6 w-24 mx-2">
        {/* Track (รางรถไฟฟ้า) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full"></div>
        
        {/* Train (รถไฟฟ้า) */}
        <div 
          className="absolute bottom-0.5 left-0"
          style={{
            animation: 'trainMove 4s ease-in-out infinite'
          }}
        >
          <svg 
            width="28" 
            height="18" 
            viewBox="0 0 28 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-pink-500 drop-shadow-sm"
          >
            {/* รถไฟฟ้า - ตัวรถ */}
            <rect x="2" y="6" width="24" height="10" rx="2" fill="currentColor" />
            {/* หน้าต่าง */}
            <rect x="5" y="8" width="4" height="5" rx="1" fill="white" opacity="0.9" />
            <rect x="11" y="8" width="4" height="5" rx="1" fill="white" opacity="0.9" />
            <rect x="17" y="8" width="4" height="5" rx="1" fill="white" opacity="0.9" />
            {/* หลังคา */}
            <path d="M2 6 L14 2 L26 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* ล้อ */}
            <circle cx="8" cy="16" r="2" fill="currentColor" />
            <circle cx="20" cy="16" r="2" fill="currentColor" />
            {/* เสาไฟ */}
            <line x1="0" y1="4" x2="0" y2="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="28" y1="4" x2="28" y2="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes trainMove {
          0% {
            transform: translateX(-40px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100% + 20px));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default TrainAnimation;


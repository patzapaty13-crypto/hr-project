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
    <div className="relative overflow-hidden h-6 w-20 mx-2">
      {/* Track (รางรถไฟฟ้า) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-full"></div>
      
      {/* Train (รถไฟฟ้า) */}
      <div className="absolute bottom-1 left-0 train-animation">
        <svg 
          width="24" 
          height="16" 
          viewBox="0 0 24 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-pink-500"
        >
          {/* รถไฟฟ้า */}
          <rect x="2" y="4" width="20" height="8" rx="2" fill="currentColor" />
          <rect x="4" y="6" width="3" height="4" rx="1" fill="white" opacity="0.8" />
          <rect x="9" y="6" width="3" height="4" rx="1" fill="white" opacity="0.8" />
          <rect x="14" y="6" width="3" height="4" rx="1" fill="white" opacity="0.8" />
          <rect x="19" y="6" width="3" height="4" rx="1" fill="white" opacity="0.8" />
          {/* หน้าต่าง */}
          <circle cx="6" cy="8" r="1" fill="white" />
          <circle cx="11" cy="8" r="1" fill="white" />
          <circle cx="16" cy="8" r="1" fill="white" />
          <circle cx="21" cy="8" r="1" fill="white" />
          {/* หลังคา */}
          <path d="M2 4 L12 0 L22 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes trainMove {
          0% {
            transform: translateX(-30px);
          }
          50% {
            transform: translateX(calc(100% + 10px));
          }
          100% {
            transform: translateX(-30px);
          }
        }
        
        .train-animation {
          animation: trainMove 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TrainAnimation;


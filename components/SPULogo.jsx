/**
 * ============================================================================
 * Component: Logo SPU (SPULogo.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Logo ของมหาวิทยาลัยศรีปทุม (SRIPATUM UNIVERSITY)
 * - Logo ประกอบด้วย:
 *   - "SPU" ตัวใหญ่อ้วน สีดำ (Top Section)
 *   - "SRIPATUM UNIVERSITY" สีดำ
 *   - แถบสีดำแนวนอน
 * 
 * Props:
 * - size: ขนาดของ Logo ('sm' | 'md' | 'lg' | 'xl') - Default: 'md'
 * - className: CSS classes เพิ่มเติม
 * - onClick: ฟังก์ชันเมื่อคลิก Logo
 * 
 * ============================================================================
 */

import React, { useRef, useEffect, useState } from 'react';

/**
 * ============================================================================
 * Component SPULogo
 * ============================================================================
 */
const SPULogo = ({ size = 'md', className = '', onClick }) => {
  // Refs สำหรับคำนวณความกว้างของ SRIPATUM text
  const sripatumRef = useRef(null);
  const [barWidth, setBarWidth] = useState(80); // default width

  // Callback ref สำหรับคำนวณความกว้างเมื่อ element mount
  const setSripatumRef = (node) => {
    if (node) {
      sripatumRef.current = node;
      // คำนวณความกว้างทันทีเมื่อ element mount
      const width = node.offsetWidth;
      if (width > 0) {
        setBarWidth(width);
      }
    }
  };

  // ฟังก์ชันคำนวณความกว้างของ SRIPATUM text
  const calculateBarWidth = () => {
    if (sripatumRef.current) {
      const width = sripatumRef.current.offsetWidth;
      if (width > 0) {
        setBarWidth(width);
      }
    }
  };

  // คำนวณความกว้างของ SRIPATUM text เพื่อให้แถบยาวเท่ากัน
  useEffect(() => {
    // รอให้ DOM render เสร็จก่อน
    const timer = setTimeout(() => {
      calculateBarWidth();
    }, 100);

    // รีเฟรชเมื่อหน้าจอเปลี่ยนขนาด
    const handleResize = () => {
      calculateBarWidth();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [size]);
  // กำหนดขนาดตาม size prop
  const sizeClasses = {
    sm: {
      spu: 'text-xl sm:text-2xl',           // SPU ขนาดเล็ก - responsive
      university: 'text-[7px] sm:text-[8px]',  // SRIPATUM UNIVERSITY ขนาดเล็ก - responsive
      barHeight: 'h-[1.5px] sm:h-[2px]'      // แถบเล็ก - responsive (ความสูงตามขนาดตัวอักษร)
    },
    md: {
      spu: 'text-3xl sm:text-4xl md:text-5xl',           // SPU ขนาดกลาง - responsive
      university: 'text-[9px] sm:text-[10px] md:text-xs',  // SRIPATUM UNIVERSITY ขนาดกลาง - responsive
      barHeight: 'h-[2px] sm:h-[2.5px] md:h-[3px]'      // แถบกลาง - responsive
    },
    lg: {
      spu: 'text-4xl sm:text-5xl md:text-6xl',          // SPU ขนาดใหญ่ - responsive
      university: 'text-[10px] sm:text-xs md:text-sm',     // SRIPATUM UNIVERSITY ขนาดใหญ่ - responsive
      barHeight: 'h-[2.5px] sm:h-[3px] md:h-[4px]'      // แถบใหญ่ - responsive
    },
    xl: {
      spu: 'text-5xl sm:text-6xl md:text-7xl',         // SPU ขนาดใหญ่มาก - responsive
      university: 'text-xs sm:text-sm md:text-base',   // SRIPATUM UNIVERSITY ขนาดใหญ่มาก - responsive
      barHeight: 'h-[3px] sm:h-[4px] md:h-[5px]'      // แถบใหญ่มาก - responsive
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  // สีดำ (#000000) สำหรับ SRIPATUM UNIVERSITY และแถบ (ตามรูปใหม่)
  const blackColor = '#000000';

  return (
    <div 
      className={`flex flex-col items-start justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ minWidth: 'fit-content' }}
    >
      {/* Top Section: SPU (สีดำ, ตัวใหญ่อ้วน, tracking แน่นมาก) */}
      <div 
        className={`font-black text-black ${sizes.spu} leading-none mb-1 sm:mb-1.5 tracking-tighter text-left`} 
        style={{ 
          fontFamily: 'sans-serif', 
          fontWeight: 900,
          letterSpacing: '-0.02em' // tracking แน่นมาก
        }}
      >
        SPU
      </div>
      
      {/* Bottom Section: SRIPATUM UNIVERSITY (สีดำ - ตามรูปใหม่) */}
      <div className="flex flex-col items-start">
        {/* แถวแรก: SRIPATUM + แถบสีดำแนวนอน (แถบยาวเท่ากับความกว้างของ SRIPATUM) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span 
            ref={setSripatumRef}
            className={`font-bold ${sizes.university} leading-none tracking-wider uppercase whitespace-nowrap`} 
            style={{ 
              color: blackColor,
              fontFamily: 'sans-serif',
              fontWeight: 700
            }}
          >
            SRIPATUM
          </span>
          {/* แถบสีดำแนวนอน - ยาวเท่ากับความกว้างของ SRIPATUM text */}
          <div 
            className={`${sizes.barHeight} bg-black`}
            style={{ 
              backgroundColor: blackColor,
              width: `${barWidth}px`,
              flexShrink: 0
            }}
          ></div>
        </div>
        
        {/* แถวที่สอง: UNIVERSITY (ด้านล่างของ SRIPATUM, จัดชิดซ้ายเหมือนกัน) */}
        <span 
          className={`font-bold ${sizes.university} leading-none tracking-wider uppercase mt-0.5 sm:mt-1`}
          style={{ 
            color: blackColor,
            fontFamily: 'sans-serif',
            fontWeight: 700
          }}
        >
          UNIVERSITY
        </span>
      </div>
    </div>
  );
};

export default SPULogo;


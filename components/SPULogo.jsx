/**
 * ============================================================================
 * Component: Logo SPU (SPULogo.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Logo ของมหาวิทยาลัยศรีปทุม (SRIPATUM UNIVERSITY)
 * - Logo ประกอบด้วย:
 *   - "SPU" ตัวใหญ่อ้วน สีดำ (Top Section)
 *   - "SRIPATUM UNIVERSITY" สีชมพูเข้ม (magenta/hot pink)
 *   - แถบสีชมพูแนวนอน
 * 
 * Props:
 * - size: ขนาดของ Logo ('sm' | 'md' | 'lg' | 'xl') - Default: 'md'
 * - className: CSS classes เพิ่มเติม
 * - onClick: ฟังก์ชันเมื่อคลิก Logo
 * 
 * ============================================================================
 */

import React from 'react';

/**
 * ============================================================================
 * Component SPULogo
 * ============================================================================
 */
const SPULogo = ({ size = 'md', className = '', onClick }) => {
  // กำหนดขนาดตาม size prop
  const sizeClasses = {
    sm: {
      spu: 'text-xl sm:text-2xl',           // SPU ขนาดเล็ก - responsive
      university: 'text-[7px] sm:text-[8px]',  // SRIPATUM UNIVERSITY ขนาดเล็ก - responsive
      bar: 'h-0.5 sm:h-1'                 // แถบเล็ก - responsive
    },
    md: {
      spu: 'text-3xl sm:text-4xl md:text-5xl',           // SPU ขนาดกลาง - responsive
      university: 'text-[9px] sm:text-[10px] md:text-xs',  // SRIPATUM UNIVERSITY ขนาดกลาง - responsive
      bar: 'h-1 sm:h-1.5'                           // แถบกลาง - responsive
    },
    lg: {
      spu: 'text-4xl sm:text-5xl md:text-6xl',          // SPU ขนาดใหญ่ - responsive
      university: 'text-[10px] sm:text-xs md:text-sm',     // SRIPATUM UNIVERSITY ขนาดใหญ่ - responsive
      bar: 'h-1.5 sm:h-2'                            // แถบใหญ่ - responsive
    },
    xl: {
      spu: 'text-5xl sm:text-6xl md:text-7xl',         // SPU ขนาดใหญ่มาก - responsive
      university: 'text-xs sm:text-sm md:text-base',   // SRIPATUM UNIVERSITY ขนาดใหญ่มาก - responsive
      bar: 'h-2 sm:h-2.5'                         // แถบใหญ่มาก - responsive
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  // สี magenta/hot pink (#E91E63) สำหรับ SRIPATUM UNIVERSITY
  const magentaColor = '#E91E63';

  return (
    <div 
      className={`flex flex-col items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ minWidth: 'fit-content' }}
    >
      {/* Top Section: SPU (สีดำ, ตัวใหญ่อ้วน, ตรงกลาง) */}
      <div className={`font-black text-black ${sizes.spu} leading-none mb-1.5 tracking-tight text-center`} style={{ fontFamily: 'sans-serif', fontWeight: 900 }}>
        SPU
      </div>
      
      {/* Bottom Section: SRIPATUM UNIVERSITY (สีชมพูเข้ม - magenta/hot pink) */}
      <div className="flex flex-col items-start w-full">
        {/* แถวแรก: SRIPATUM + แถบสีชมพูแนวนอน */}
        <div className="flex items-center w-full gap-1.5">
          <span 
            className={`font-bold ${sizes.university} leading-none tracking-wider uppercase whitespace-nowrap`} 
            style={{ 
              color: magentaColor,
              fontFamily: 'sans-serif',
              fontWeight: 700
            }}
          >
            SRIPATUM
          </span>
          {/* แถบสีชมพูแนวนอน */}
          <div 
            className={`${sizes.bar} flex-1`}
            style={{ 
              backgroundColor: magentaColor,
              minHeight: sizes.bar === 'h-1' ? '4px' : sizes.bar === 'h-1.5' ? '6px' : sizes.bar === 'h-2' ? '8px' : '10px',
              minWidth: '30px'
            }}
          ></div>
        </div>
        
        {/* แถวที่สอง: UNIVERSITY (ด้านล่างของ SRIPATUM) */}
        <span 
          className={`font-bold ${sizes.university} leading-none tracking-wider uppercase mt-0.5`}
          style={{ 
            color: magentaColor,
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


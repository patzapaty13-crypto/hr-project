/**
 * ============================================================================
 * Component: Logo SPU (SPULogo.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Logo ของมหาวิทยาลัยศรีปทุม (SRIPATUM UNIVERSITY)
 * - Logo ประกอบด้วย:
 *   - "SPU" ตัวใหญ่อ้วน สีดำ (Top Section)
 *   - "SRIPATUM UNIVERSITY" สี hot pink/magenta
 *   - แถบสี hot pink/magenta แนวนอน
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
  // State สำหรับเก็บตำแหน่งและความกว้างของแถบ
  const [barPosition, setBarPosition] = useState({ left: 0, width: 0 });
  const spuRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // ฟังก์ชันคำนวณตำแหน่งและความกว้างของแถบใต้ตัว U
  const calculateBarPosition = () => {
    if (spuRef.current && spuRef.current.offsetWidth > 0) {
      try {
        // หาตำแหน่งของตัว U โดยประมาณ (S + P + spacing)
        const spuWidth = spuRef.current.offsetWidth;
        if (spuWidth > 0) {
          const letterWidth = spuWidth / 3; // ประมาณความกว้างของแต่ละตัวอักษร
          const leftPosition = letterWidth * 2; // ตำแหน่งเริ่มต้นของตัว U
          const barWidth = letterWidth * 0.8; // ความกว้างของแถบประมาณ 80% ของตัวอักษร
          
          setBarPosition({
            left: Math.max(0, leftPosition),
            width: Math.max(10, barWidth)
          });
        }
      } catch (error) {
        console.warn('Error in calculateBarPosition:', error);
        // ตั้งค่า default position
        setBarPosition({ left: 0, width: 30 });
      }
    }
  };

  // Callback ref สำหรับคำนวณตำแหน่งทันทีเมื่อ element mount
  const setSpuRefCallback = (node) => {
    spuRef.current = node;
    
    if (node) {
      try {
        // คำนวณตำแหน่งทันทีเมื่อ element mount - ใช้ setTimeout เพื่อให้แน่ใจว่า DOM render เสร็จแล้ว
        setTimeout(() => {
          calculateBarPosition();
        }, 0);

        // รอให้ fonts โหลดเสร็จ (ถ้ามี)
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            try {
              calculateBarPosition();
            } catch (error) {
              console.warn('Error calculating bar position after fonts loaded:', error);
            }
          });
        }

        // ใช้ ResizeObserver เพื่อตรวจจับการเปลี่ยนแปลงขนาด
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }

        resizeObserverRef.current = new ResizeObserver(() => {
          try {
            calculateBarPosition();
          } catch (error) {
            console.warn('Error in ResizeObserver callback:', error);
          }
        });

        resizeObserverRef.current.observe(node);
      } catch (error) {
        console.warn('Error setting up SPU ref:', error);
      }
    } else {
      // Cleanup เมื่อ element unmount
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    }
  };

  // ใช้ useEffect สำหรับ resize listener และ cleanup
  useEffect(() => {
    const handleResize = () => {
      try {
        calculateBarPosition();
      } catch (error) {
        console.warn('Error calculating bar position:', error);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // รีเฟรชเมื่อ size เปลี่ยน - ใช้ setTimeout เพื่อให้แน่ใจว่า DOM render เสร็จแล้ว
    setTimeout(() => {
      try {
        calculateBarPosition();
      } catch (error) {
        console.warn('Error calculating bar position on mount:', error);
      }
    }, 0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
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

  // สีตามโลโก้จริง: พื้นหลังขาว
  // SPU: สีดำ (#000000)
  // SRIPATUM UNIVERSITY และแถบ: สี hot pink/magenta (#e91e63)
  const spuColor = '#000000'; // สีดำสำหรับ SPU
  const textColor = '#e91e63'; // สี hot pink/magenta สำหรับ SRIPATUM UNIVERSITY และแถบ
  const backgroundColor = '#ffffff'; // พื้นหลังสีขาว

  return (
    <div 
      className={`flex flex-col items-start justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ 
        minWidth: 'fit-content',
        backgroundColor: backgroundColor,
        padding: '0.5rem',
        borderRadius: '0.25rem'
      }}
    >
      {/* Top Section: SPU (สีดำ, ตัวใหญ่อ้วน, tracking แน่นมาก) พร้อมแถบใต้ตัว U */}
      <div className="relative">
        <div 
          ref={setSpuRefCallback}
          className={`font-black ${sizes.spu} leading-none mb-1 sm:mb-1.5 tracking-tighter text-left`} 
          style={{ 
            color: spuColor,
            fontFamily: 'sans-serif', 
            fontWeight: 900,
            letterSpacing: '-0.02em' // tracking แน่นมาก
          }}
        >
          SPU
        </div>
        {/* แถบสี hot pink/magenta แนวนอน - อยู่ใต้ตัว U */}
        {barPosition.width > 0 && (
          <div 
            className={`${sizes.barHeight} absolute`}
            style={{ 
              backgroundColor: textColor,
              left: `${barPosition.left}px`,
              width: `${barPosition.width}px`,
              top: '100%',
              marginTop: '0.125rem'
            }}
          ></div>
        )}
      </div>
      
      {/* Bottom Section: SRIPATUM UNIVERSITY (สี hot pink/magenta) */}
      <div className="flex flex-col items-start mt-1 sm:mt-1.5">
        {/* แถวแรก: SRIPATUM */}
        <span 
          className={`font-bold ${sizes.university} leading-none tracking-wider uppercase whitespace-nowrap`} 
          style={{ 
            color: textColor,
            fontFamily: 'sans-serif',
            fontWeight: 700
          }}
        >
          SRIPATUM
        </span>
        
        {/* แถวที่สอง: UNIVERSITY (ด้านล่างของ SRIPATUM, จัดชิดซ้ายเหมือนกัน) */}
        <span 
          className={`font-bold ${sizes.university} leading-none tracking-wider uppercase mt-0.5 sm:mt-1`}
          style={{ 
            color: textColor,
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


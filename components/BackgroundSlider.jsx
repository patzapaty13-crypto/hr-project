/**
 * ============================================================================
 * Component: Background Slider (BackgroundSlider.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดงรูปภาพ SPU เป็น background slide show
 * - รองรับหลายรูปภาพ
 * - Auto-play และ transition ที่นุ่มนวล
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

// รูปภาพ SPU - ใช้รูปจาก Unsplash หรือ URL จริง
// หมายเหตุ: ควรเปลี่ยนเป็นรูปจริงของ SPU ในอนาคต
const SPU_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80',
    alt: 'SPU Building - Modern Architecture'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80',
    alt: 'SPU Campus View'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80',
    alt: 'SPU University Building'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1920&q=80',
    alt: 'SPU Campus Landscape'
  }
];

const BackgroundSlider = ({ children, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slide show
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SPU_IMAGES.length);
    }, 5000); // เปลี่ยนรูปทุก 5 วินาที

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Background Images */}
      <div className="absolute inset-0">
        {SPU_IMAGES.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Overlay เพื่อให้ข้อความอ่านง่าย */}
            {/* Overlay เพื่อให้ข้อความอ่านง่าย - ใช้ gradient สีชมพูอ่อน */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/70 via-pink-800/60 to-rose-900/70"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {SPU_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundSlider;


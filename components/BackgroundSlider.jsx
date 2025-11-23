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
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());

  // Preload images with error handling
  useEffect(() => {
    const preloadImages = async () => {
      const promises = SPU_IMAGES.map((image) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, image.id]));
            resolve();
          };
          img.onerror = () => {
            setImageErrors(prev => new Set([...prev, image.id]));
            resolve(); // Continue even if image fails
          };
          // Add timeout for image loading
          setTimeout(() => {
            if (!loadedImages.has(image.id) && !imageErrors.has(image.id)) {
              setImageErrors(prev => new Set([...prev, image.id]));
              resolve();
            }
          }, 10000); // 10 second timeout
          img.src = image.url;
        });
      });
      
      // Load first image immediately, others in background
      await promises[0];
      Promise.all(promises.slice(1)).catch(console.error);
    };
    
    preloadImages();
  }, []);

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
        {SPU_IMAGES.map((image, index) => {
          const isVisible = index === currentIndex;
          const isLoaded = loadedImages.has(image.id);
          const hasError = imageErrors.has(image.id);
          
          // Only render visible image or first image
          if (!isVisible && index !== 0 && !isLoaded) {
            return null;
          }
          
          return (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!hasError && (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    setImageErrors(prev => new Set([...prev, image.id]));
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {/* Fallback gradient background if image fails */}
              {hasError && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
              )}
              {/* Overlay เพื่อให้ข้อความอ่านง่าย - ใช้ gradient สีม่วง-น้ำเงินอ่อน */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-indigo-900/70"></div>
            </div>
          );
        })}
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


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // เพิ่ม chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // แบ่ง chunks ตาม vendor และ features
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Charts (ใช้ใน AdminDashboard เท่านั้น)
          'charts-vendor': ['recharts'],
          // Icons
          'icons-vendor': ['lucide-react'],
          // Utilities
          'utils-vendor': ['date-fns', '@emailjs/browser'],
        },
      },
    },
    // เพิ่มประสิทธิภาพการ build
    // ใช้ esbuild (default) แทน terser - เร็วกว่าและไม่ต้องติดตั้งเพิ่ม
    minify: 'esbuild',
    // esbuild ไม่รองรับ drop_console โดยตรง แต่เร็วกว่า terser มาก
    // ถ้าต้องการลบ console.log ต้องใช้ plugin หรือ terser
  },
})


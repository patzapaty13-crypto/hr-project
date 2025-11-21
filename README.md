# SPU Personnel System

ระบบขออนุมัติอัตรากำลังพลออนไลน์สำหรับมหาวิทยาลัยศรีปทุม

## คุณสมบัติ

- 🎨 ธีมสีชมพูแบบนุ่มนวล สบายตา
- 👥 รองรับ 2 บทบาท: คณะ/หน่วยงาน และ HR
- 📝 สร้างคำขออัตรากำลังพลออนไลน์
- 🤖 AI ช่วยร่าง Job Description (ใช้ Gemini API)
- 📊 Dashboard แสดงรายการคำขอแบบ Real-time
- ✅ ระบบอนุมัติแบบ Workflow
- 🔐 Firebase Authentication

## เทคโนโลยีที่ใช้

- **Frontend**: React 18 + Vite
- **UI**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini API
- **Icons**: Lucide React

## การติดตั้ง

```bash
# ติดตั้ง dependencies
npm install --legacy-peer-deps

# รัน development server
npm run dev

# Build สำหรับ production
npm run build
```

## การตั้งค่า

### 1. Firebase Configuration

แก้ไขไฟล์ `index.html` และตั้งค่า Firebase Config:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

### 2. Gemini API Key (Optional)

แก้ไขไฟล์ `utils/gemini.js`:

```javascript
const apiKey = "YOUR_GEMINI_API_KEY";
```

## โครงสร้างโปรเจกต์

```
hr-project/
├── components/          # React Components
│   ├── Dashboard.jsx   # หน้า Dashboard
│   ├── LoginPage.jsx   # หน้า Login
│   ├── SimpleForm.jsx  # Form สร้างคำขอ
│   └── SPULogo.jsx     # Logo Component
├── config/             # Configuration
│   └── firebase.js     # Firebase Setup
├── constants/          # Constants
│   └── index.js        # ค่าคงที่ (คณะ, สถานะ)
├── utils/              # Utilities
│   └── gemini.js       # Gemini AI Integration
├── src/                # Source Files
│   └── main.jsx        # Entry Point
└── App.jsx             # Main App Component
```

## การ Deploy

### Vercel (แนะนำ)

1. ติดตั้ง Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. ติดตั้ง Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

### Firebase Hosting

1. ติดตั้ง Firebase CLI:
```bash
npm i -g firebase-tools
```

2. Login และ Initialize:
```bash
firebase login
firebase init hosting
```

3. Build และ Deploy:
```bash
npm run build
firebase deploy
```

## License

Copyright 2025 Sripatum University. All Rights Reserved.


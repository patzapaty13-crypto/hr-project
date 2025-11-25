# 🚀 Quick Start - ทำงานเป็นทีม

## ✅ สถานะปัจจุบัน

- ✅ Remote Repository: `https://github.com/patzapaty13-crypto/hr-project.git`
- ✅ Branch หลัก: `main`
- ✅ มี Branch: `feature/vercel-config`

---

## 📋 ขั้นตอนสำหรับสมาชิกใหม่ในทีม

### 1. Clone Repository
```bash
git clone https://github.com/patzapaty13-crypto/hr-project.git
cd hr-project
```

### 2. ตั้งค่า Git Config
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. ติดตั้ง Dependencies
```bash
npm install
```

### 4. ตั้งค่า Environment Variables
สร้างไฟล์ `.env`:
```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:3001/api
```

---

## 🔄 Workflow สำหรับทำงานเป็นทีม

### ก่อนเริ่มทำงาน

1. **ดึงโค้ดล่าสุด**
```bash
git checkout main
git pull origin main
```

2. **สร้าง Branch ใหม่สำหรับงานของคุณ**
```bash
git checkout -b feature/your-feature-name
# หรือ
git checkout -b bugfix/your-bugfix-name
```

### ขณะทำงาน

1. **Commit บ่อยๆ**
```bash
git add -A
git commit -m "คำอธิบายการเปลี่ยนแปลง"
```

2. **Push ขึ้น Remote**
```bash
git push -u origin feature/your-feature-name
```

### เมื่อทำงานเสร็จ

1. **ดึงโค้ดล่าสุดจาก main**
```bash
git checkout main
git pull origin main
```

2. **Merge branch ของคุณ**
```bash
git merge feature/your-feature-name
```

3. **Push ขึ้น Remote**
```bash
git push origin main
```

4. **ลบ branch ที่ merge แล้ว**
```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## 📝 ตัวอย่างการทำงาน

### สร้าง Feature ใหม่

```bash
# 1. ดึงโค้ดล่าสุด
git checkout main
git pull origin main

# 2. สร้าง branch ใหม่
git checkout -b feature/add-new-modal

# 3. ทำงาน...
# (แก้ไขโค้ด)

# 4. Commit
git add -A
git commit -m "เพิ่ม Modal สำหรับจัดการข้อมูล"

# 5. Push
git push -u origin feature/add-new-modal

# 6. สร้าง Pull Request บน GitHub
# (ไปที่ GitHub → New Pull Request)

# 7. หลังจาก merge แล้ว
git checkout main
git pull origin main
git branch -d feature/add-new-modal
```

---

## ⚠️ ข้อควรระวัง

### 1. Pull ก่อน Push เสมอ
```bash
# ✅ ดี
git pull origin main
git push origin main

# ❌ ไม่ดี
git push origin main  # อาจเกิด conflict
```

### 2. ใช้ Commit Message ที่ชัดเจน
```bash
# ✅ ดี
git commit -m "เพิ่มฟีเจอร์ AI Analysis สำหรับ Resume"

# ❌ ไม่ดี
git commit -m "update"
```

### 3. อย่า Commit ไฟล์ที่ไม่จำเป็น
```bash
# สร้างไฟล์ .gitignore
# เพิ่ม:
node_modules/
.env
dist/
*.log
```

---

## 🔍 คำสั่งที่มีประโยชน์

```bash
# ดูสถานะ
git status

# ดูการเปลี่ยนแปลง
git diff

# ดู commit history
git log --oneline

# ดู branch ทั้งหมด
git branch -a

# ยกเลิกการเปลี่ยนแปลง (ยังไม่ commit)
git restore <filename>

# เก็บการเปลี่ยนแปลงชั่วคราว
git stash
git stash pop
```

---

## 📚 ดูคู่มือเพิ่มเติม

- `GIT_TEAM_WORKFLOW.md` - คู่มือ Git Workflow แบบละเอียด

---

**Happy Coding! 🚀**


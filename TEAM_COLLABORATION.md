# 👥 Team Collaboration Guide

## 📋 สารบัญ
1. [การ Setup Repository](#การ-setup-repository)
2. [Branch Strategy](#branch-strategy)
3. [Pull Request Process](#pull-request-process)
4. [Code Review Guidelines](#code-review-guidelines)
5. [Conflict Resolution](#conflict-resolution)

---

## 🚀 การ Setup Repository

### สำหรับสมาชิกใหม่

1. **Clone Repository**
```bash
git clone https://github.com/patzapaty13-crypto/hr-project.git
cd hr-project
```

2. **ตั้งค่า Git Config**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

3. **ติดตั้ง Dependencies**
```bash
npm install
```

4. **ตั้งค่า Environment Variables**
```bash
# สร้างไฟล์ .env
cp .env.example .env
# แก้ไข .env ตามที่ต้องการ
```

---

## 🌿 Branch Strategy

### Branch Types

1. **main** - Production-ready code
   - ใช้สำหรับโค้ดที่พร้อมใช้งาน
   - ต้องผ่าน testing และ code review

2. **develop** - Development branch (ถ้ามี)
   - ใช้สำหรับรวม feature ทั้งหมด
   - ใช้สำหรับ testing ร่วมกัน

3. **feature/*** - Feature branches
   - ใช้สำหรับ feature ใหม่
   - ตัวอย่าง: `feature/ai-analysis`, `feature/user-management`

4. **bugfix/*** - Bug fix branches
   - ใช้สำหรับแก้ bug
   - ตัวอย่าง: `bugfix/dashboard-error`

5. **hotfix/*** - Hotfix branches
   - ใช้สำหรับแก้ bug ด่วนใน production
   - ตัวอย่าง: `hotfix/critical-error`

### Naming Convention

```bash
# Feature
feature/add-resume-analysis
feature/update-dashboard-ui

# Bugfix
bugfix/fix-login-error
bugfix/resolve-api-timeout

# Hotfix
hotfix/fix-security-issue
hotfix/fix-data-loss
```

---

## 🔄 Pull Request Process

### 1. สร้าง Feature Branch

```bash
# ดึงโค้ดล่าสุด
git checkout main
git pull origin main

# สร้าง branch ใหม่
git checkout -b feature/your-feature-name
```

### 2. ทำงานและ Commit

```bash
# แก้ไขโค้ด
# ...

# Commit
git add -A
git commit -m "เพิ่มฟีเจอร์..."

# Push
git push -u origin feature/your-feature-name
```

### 3. สร้าง Pull Request

1. ไปที่ GitHub Repository
2. คลิก "New Pull Request"
3. เลือก:
   - Base: `main`
   - Compare: `feature/your-feature-name`
4. กรอกข้อมูล:
   - Title: ชื่อ feature
   - Description: อธิบายสิ่งที่ทำ
5. Request Reviewers: เลือกเพื่อนในทีม
6. สร้าง Pull Request

### 4. Code Review

- Reviewer จะตรวจสอบ code
- อาจจะมี comments หรือ suggestions
- แก้ไขตาม feedback
- Push การแก้ไขใหม่

### 5. Merge Pull Request

- หลังจาก approve แล้ว
- Merge Pull Request
- ลบ branch ที่ merge แล้ว

---

## 👀 Code Review Guidelines

### สำหรับ Reviewer

1. **ตรวจสอบ Code Quality**
   - โค้ดอ่านง่ายหรือไม่
   - มี comments ที่ชัดเจนหรือไม่
   - ใช้ naming convention ที่ถูกต้องหรือไม่

2. **ตรวจสอบ Functionality**
   - ทำงานตามที่ต้องการหรือไม่
   - มี edge cases หรือไม่
   - มี error handling หรือไม่

3. **ตรวจสอบ Best Practices**
   - ใช้ React best practices
   - มี proper error handling
   - มี proper validation

4. **ให้ Feedback**
   - ให้ constructive feedback
   - แนะนำวิธีแก้ไข
   - ชมเมื่อทำดี

### สำหรับ Author

1. **เตรียม Code**
   - ตรวจสอบว่า code ทำงานได้
   - เขียน comments ที่จำเป็น
   - ใช้ commit message ที่ชัดเจน

2. **ตอบ Comments**
   - ตอบทุก comment
   - แก้ไขตาม feedback
   - อธิบายถ้ามีคำถาม

---

## 🔐 Git Permission Issues

### ปัญหา: Permission Denied (403 Error)

**ถ้าเพื่อนเจอ error:**
```
Permission to patzapaty13-crypto/hr-project.git denied
```

**ดูคู่มือ:** [FIX_GIT_PERMISSION_ERROR.md](./FIX_GIT_PERMISSION_ERROR.md)

**Quick Fix:**
1. เจ้าของ repository: เพิ่มเพื่อนเป็น collaborator (Settings → Collaborators)
2. เพื่อน: ใช้ SSH หรือ Personal Access Token

---

## ⚠️ Conflict Resolution

### เมื่อเกิด Conflict

1. **Pull โค้ดล่าสุด**
```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

2. **แก้ไข Conflict**
   - เปิดไฟล์ที่มี conflict
   - หา `<<<<<<<`, `=======`, `>>>>>>>`
   - แก้ไขให้ถูกต้อง
   - ลบ markers

3. **Commit และ Push**
```bash
git add <filename>
git commit -m "แก้ไข conflict"
git push origin feature/your-feature-name
```

---

## 📝 Commit Message Guidelines

### Format
```
<type>: <subject>

<body>
```

### Types
- `feat`: Feature ใหม่
- `fix`: แก้ bug
- `docs`: แก้ไข documentation
- `style`: แก้ไข formatting
- `refactor`: Refactor code
- `test`: เพิ่ม/แก้ไข tests
- `chore`: งานอื่นๆ

### Examples

```bash
# ✅ ดี
git commit -m "feat: เพิ่มฟีเจอร์ AI Analysis สำหรับ Resume"
git commit -m "fix: แก้ไข bug ใน Dashboard loading state"
git commit -m "docs: อัปเดต API documentation"

# ❌ ไม่ดี
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

---

## 🔍 Best Practices

### 1. Pull ก่อน Push
```bash
git pull origin main
git push origin main
```

### 2. Commit บ่อยๆ
- Commit เมื่อทำงานเสร็จแต่ละส่วน
- อย่า commit ครั้งเดียวใหญ่ๆ

### 3. ใช้ Branch สำหรับ Feature
- อย่าแก้ไขโดยตรงใน main
- สร้าง branch ใหม่เสมอ

### 4. Review Code
- ให้เพื่อน review code ก่อน merge
- รับ feedback และแก้ไข

### 5. Test ก่อน Push
- ทดสอบ code ก่อน push
- ตรวจสอบว่าไม่มี error

---

## 📚 Resources

- [Git Workflow Guide](./GIT_TEAM_WORKFLOW.md)
- [Quick Start Guide](./QUICK_START_TEAM.md)
- [GitHub Guides](https://guides.github.com/)
- [Git Documentation](https://git-scm.com/doc)

---

**Happy Collaborating! 🚀**


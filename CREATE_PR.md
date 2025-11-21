# 📝 วิธีสร้าง Pull Request บน GitHub

## ขั้นตอนการสร้าง Pull Request

### 1. ตรวจสอบ Branch ปัจจุบัน

```bash
git branch
# ควรเห็น: * feature/vercel-config
```

### 2. Push Branch ขึ้น GitHub (ถ้ายังไม่ได้ push)

```bash
git push -u origin feature/vercel-config
```

### 3. สร้าง Pull Request บน GitHub

#### วิธีที่ 1: ผ่าน GitHub Website (แนะนำ)

1. **ไปที่ Repository บน GitHub:**
   - ไปที่: https://github.com/patzapaty13-crypto/hr-project

2. **คลิก "Compare & pull request":**
   - GitHub จะแสดงข้อความ "feature/vercel-config had recent pushes"
   - คลิกปุ่ม **"Compare & pull request"**

3. **กรอกข้อมูล Pull Request:**
   - **Title**: `Add Vercel Configuration and UI Improvements`
   - **Description**: คัดลอกจาก `PULL_REQUEST.md` หรือเขียนเอง
   - **Base branch**: `main`
   - **Compare branch**: `feature/vercel-config`

4. **Reviewers (ถ้าต้องการ):**
   - คลิก "Reviewers" → เลือกคนที่ต้องการให้ review

5. **Labels (ถ้าต้องการ):**
   - คลิก "Labels" → เลือก labels เช่น `enhancement`, `documentation`

6. **คลิก "Create pull request"**

#### วิธีที่ 2: ผ่าน GitHub CLI

```bash
# ติดตั้ง GitHub CLI (ถ้ายังไม่มี)
# Windows: winget install GitHub.cli

# Login
gh auth login

# สร้าง Pull Request
gh pr create --title "Add Vercel Configuration and UI Improvements" --body-file PULL_REQUEST.md --base main --head feature/vercel-config
```

### 4. รอ Review และ Merge

- รอให้ Reviewer ตรวจสอบ
- แก้ไขตาม feedback (ถ้ามี)
- เมื่อ approve แล้ว → Merge Pull Request

---

## 📋 Template สำหรับ Pull Request Description

```markdown
## สรุปการเปลี่ยนแปลง

### Features ใหม่
- ✅ เพิ่ม Vercel configuration
- ✅ ปรับปรุง UI ให้มีธีมสีชมพูแบบนุ่มนวล
- ✅ เพิ่ม Logo SPU Component
- ✅ เพิ่ม Documentation

### การแก้ไข
- ✅ แก้ไข Build Command สำหรับ Vercel
- ✅ เพิ่ม Error Handling
- ✅ ปรับปรุง Firebase configuration

## การทดสอบ
- [x] ทดสอบการ Login
- [x] ทดสอบการสร้างคำขอ
- [x] ทดสอบ Error Handling

## Screenshots
(เพิ่ม screenshots ถ้ามี)

## Checklist
- [x] Code ผ่าน Linter
- [x] ไม่มี Error
- [x] มี Documentation
```

---

## 🔗 Links ที่เกี่ยวข้อง

- Repository: https://github.com/patzapaty13-crypto/hr-project
- Pull Requests: https://github.com/patzapaty13-crypto/hr-project/pulls

---

## ✅ หลังจากสร้าง Pull Request แล้ว

1. **ตรวจสอบ Pull Request:**
   - ไปที่แท็บ "Pull requests" ใน GitHub
   - ดู Pull Request ที่สร้างไว้

2. **รอ Review:**
   - รอให้ Reviewer ตรวจสอบ
   - ตอบคำถามหรือแก้ไขตาม feedback

3. **Merge:**
   - เมื่อ approve แล้ว → คลิก "Merge pull request"
   - เลือก "Merge commit" หรือ "Squash and merge"
   - คลิก "Confirm merge"

4. **ลบ Branch (ถ้าต้องการ):**
   - หลังจาก merge แล้ว GitHub จะถามว่าต้องการลบ branch หรือไม่
   - คลิก "Delete branch" เพื่อลบ branch ที่ merge แล้ว

---

**พร้อมสร้าง Pull Request แล้ว! 🚀**


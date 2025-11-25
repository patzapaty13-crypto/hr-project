# 👥 Git Workflow สำหรับทำงานเป็นทีม

## 📋 สารบัญ
1. [การ Setup ครั้งแรก](#การ-setup-ครั้งแรก)
2. [Workflow พื้นฐาน](#workflow-พื้นฐาน)
3. [การทำงานกับ Branch](#การทำงานกับ-branch)
4. [การแก้ไข Conflict](#การแก้ไข-conflict)
5. [Best Practices](#best-practices)

---

## 🚀 การ Setup ครั้งแรก

### 1. Clone Repository (สำหรับสมาชิกใหม่)
```bash
git clone <repository-url>
cd hr-project
```

### 2. ตั้งค่า Git Config
```bash
# ตั้งชื่อและอีเมล
git config user.name "Your Name"
git config user.email "your.email@example.com"

# ตั้งค่า global (สำหรับทุก repository)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. ตรวจสอบ Remote Repository
```bash
git remote -v
```

---

## 📝 Workflow พื้นฐาน

### 1. ดึงโค้ดล่าสุดจาก Remote
```bash
# ดึงโค้ดล่าสุด (ไม่ merge)
git fetch origin

# ดึงโค้ดล่าสุดและ merge
git pull origin main
```

### 2. ตรวจสอบสถานะ
```bash
# ดูไฟล์ที่เปลี่ยนแปลง
git status

# ดูการเปลี่ยนแปลงแบบละเอียด
git diff
```

### 3. เพิ่มไฟล์ที่เปลี่ยนแปลง
```bash
# เพิ่มไฟล์เฉพาะ
git add <filename>

# เพิ่มทุกไฟล์
git add -A
# หรือ
git add .
```

### 4. Commit การเปลี่ยนแปลง
```bash
git commit -m "คำอธิบายการเปลี่ยนแปลง"
```

### 5. Push ขึ้น Remote
```bash
# Push ไป branch ปัจจุบัน
git push origin main

# Push ไป branch อื่น
git push origin <branch-name>
```

---

## 🌿 การทำงานกับ Branch

### สร้าง Branch ใหม่
```bash
# สร้าง branch ใหม่
git branch feature/new-feature

# สร้างและเปลี่ยนไป branch ใหม่
git checkout -b feature/new-feature

# หรือใช้คำสั่งใหม่ (Git 2.23+)
git switch -c feature/new-feature
```

### เปลี่ยน Branch
```bash
# เปลี่ยนไป branch อื่น
git checkout main
# หรือ
git switch main
```

### ดู Branch ทั้งหมด
```bash
# ดู branch ในเครื่อง
git branch

# ดู branch ทั้งหมด (รวม remote)
git branch -a
```

### Push Branch ใหม่
```bash
# Push branch ใหม่ขึ้น remote
git push -u origin feature/new-feature
```

### Merge Branch
```bash
# เปลี่ยนไป main branch
git checkout main

# ดึงโค้ดล่าสุด
git pull origin main

# Merge branch
git merge feature/new-feature

# Push ขึ้น remote
git push origin main
```

### ลบ Branch
```bash
# ลบ branch ในเครื่อง
git branch -d feature/new-feature

# ลบ branch บน remote
git push origin --delete feature/new-feature
```

---

## ⚠️ การแก้ไข Conflict

### เมื่อเกิด Conflict

1. **ดูไฟล์ที่มี Conflict**
```bash
git status
```

2. **แก้ไข Conflict ในไฟล์**
   - เปิดไฟล์ที่มี conflict
   - หา `<<<<<<<`, `=======`, `>>>>>>>`
   - แก้ไขให้ถูกต้อง
   - ลบ markers (`<<<<<<<`, `=======`, `>>>>>>>`)

3. **เพิ่มไฟล์ที่แก้ไขแล้ว**
```bash
git add <filename>
```

4. **Commit**
```bash
git commit -m "แก้ไข conflict"
```

---

## ✅ Best Practices

### 1. Commit Message
```bash
# ✅ ดี
git commit -m "เพิ่มฟีเจอร์ AI Analysis สำหรับ Resume"
git commit -m "แก้ไข bug ใน Dashboard"
git commit -m "อัปเดต API documentation"

# ❌ ไม่ดี
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

### 2. Commit บ่อยๆ
- Commit เมื่อทำงานเสร็จแต่ละส่วน
- อย่า commit ครั้งเดียวใหญ่ๆ

### 3. Pull ก่อน Push
```bash
# ✅ ดี - Pull ก่อน Push เสมอ
git pull origin main
git push origin main

# ❌ ไม่ดี - Push โดยไม่ Pull
git push origin main
```

### 4. ใช้ Branch สำหรับ Feature ใหม่
- สร้าง branch ใหม่สำหรับแต่ละ feature
- อย่าแก้ไขโดยตรงใน main branch

### 5. Review Code ก่อน Merge
- ให้เพื่อนในทีม review code ก่อน merge
- ใช้ Pull Request (ถ้าใช้ GitHub/GitLab)

---

## 🔄 Workflow แนะนำสำหรับทีม

### Feature Development Workflow

1. **ดึงโค้ดล่าสุด**
```bash
git checkout main
git pull origin main
```

2. **สร้าง Branch ใหม่**
```bash
git checkout -b feature/your-feature-name
```

3. **ทำงานและ Commit**
```bash
# แก้ไขโค้ด
# ...

git add -A
git commit -m "เพิ่มฟีเจอร์..."
```

4. **Push Branch ขึ้น Remote**
```bash
git push -u origin feature/your-feature-name
```

5. **สร้าง Pull Request** (บน GitHub/GitLab)
   - ไปที่ repository
   - สร้าง Pull Request จาก `feature/your-feature-name` → `main`
   - รอให้เพื่อน review

6. **Merge Pull Request**
   - หลังจาก review แล้ว
   - Merge Pull Request
   - ลบ branch ที่ merge แล้ว

7. **อัปเดต Local**
```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## 🛠️ คำสั่งที่มีประโยชน์

### ดู History
```bash
# ดู commit history
git log

# ดู commit history แบบย่อ
git log --oneline

# ดู commit history แบบกราฟ
git log --oneline --graph --all
```

### ยกเลิกการเปลี่ยนแปลง
```bash
# ยกเลิกการเปลี่ยนแปลงในไฟล์ (ยังไม่ add)
git restore <filename>

# ยกเลิกการ add (ยังไม่ commit)
git restore --staged <filename>

# ยกเลิก commit ล่าสุด (ยังไม่ push)
git reset --soft HEAD~1
```

### Stash (เก็บการเปลี่ยนแปลงชั่วคราว)
```bash
# เก็บการเปลี่ยนแปลงชั่วคราว
git stash

# ดู stash ทั้งหมด
git stash list

# นำ stash กลับมา
git stash pop

# ลบ stash
git stash drop
```

---

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)

---

## ❓ FAQ

### Q: ควร Commit บ่อยแค่ไหน?
**A:** Commit เมื่อทำงานเสร็จแต่ละส่วน (เช่น เสร็จ 1 feature, แก้ 1 bug)

### Q: ควร Push บ่อยแค่ไหน?
**A:** Push เมื่อ commit ที่สำคัญเสร็จแล้ว หรือเมื่อต้องการ backup

### Q: ควรใช้ Branch อะไร?
**A:** 
- `main` - สำหรับโค้ดที่พร้อมใช้งาน
- `develop` - สำหรับโค้ดที่กำลังพัฒนา
- `feature/*` - สำหรับ feature ใหม่
- `bugfix/*` - สำหรับแก้ bug
- `hotfix/*` - สำหรับแก้ bug ด่วน

### Q: เกิด Conflict ต้องทำอย่างไร?
**A:** 
1. Pull โค้ดล่าสุด
2. แก้ไข conflict ในไฟล์
3. Add และ Commit
4. Push

---

**Happy Coding! 🚀**


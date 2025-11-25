# 🔧 แก้ไขปัญหา Git Permission Error (403)

## ❌ ปัญหาที่พบ

```
fatal: unable to access 'https://github.com/patzapaty13-crypto/hr-project.git/': 
The requested URL returned error: 403

remote: Permission to patzapaty13-crypto/hr-project.git denied to Bobangely.
```

**สาเหตุ:**
- เพื่อนไม่มี permission เข้าถึง repository
- หรือใช้ authentication ที่ไม่ถูกต้อง

---

## ✅ วิธีแก้ไข

### วิธีที่ 1: เพิ่มเพื่อนเป็น Collaborator (แนะนำ)

**เจ้าของ Repository ทำ:**

1. ไปที่ GitHub Repository:
   ```
   https://github.com/patzapaty13-crypto/hr-project
   ```

2. ไปที่ **Settings** → **Collaborators**

3. คลิก **"Add people"**

4. พิมพ์ username ของเพื่อน (เช่น `Bobangely`)

5. เลือก permission: **Write** (เพื่อให้ push ได้)

6. คลิก **"Add [username] to this repository"**

7. เพื่อนจะได้รับ email แจ้งเตือน

**เพื่อนทำ:**

1. ตรวจสอบ email และ accept invitation

2. ลอง push อีกครั้ง:
```bash
git push -u origin feature/my-work
```

---

### วิธีที่ 2: ใช้ Personal Access Token (ถ้าเพื่อนมี access แล้ว)

**เพื่อนทำ:**

1. **สร้าง Personal Access Token:**
   - ไปที่ GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - คลิก **"Generate new token (classic)"**
   - ตั้งชื่อ token (เช่น "hr-project")
   - เลือก scopes: **repo** (ให้สิทธิ์เต็ม)
   - คลิก **"Generate token"**
   - **คัดลอก token** (จะแสดงแค่ครั้งเดียว!)

2. **ใช้ Token แทน Password:**
   ```bash
   # เมื่อ Git ถาม username/password
   Username: Bobangely
   Password: <paste-token-here>  # ใช้ token แทน password
   ```

3. **หรือตั้งค่า Git Credential Helper:**
   ```bash
   # Windows
   git config --global credential.helper wincred
   
   # Mac/Linux
   git config --global credential.helper osxkeychain
   ```

---

### วิธีที่ 3: เปลี่ยนเป็น SSH (แนะนำสำหรับทีม)

**เพื่อนทำ:**

1. **สร้าง SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # กด Enter เพื่อใช้ default location
   # ตั้ง passphrase (หรือ Enter เพื่อไม่ใส่)
   ```

2. **คัดลอก Public Key:**
   ```bash
   # Windows
   type %USERPROFILE%\.ssh\id_ed25519.pub
   
   # Mac/Linux
   cat ~/.ssh/id_ed25519.pub
   ```

3. **เพิ่ม SSH Key ใน GitHub:**
   - ไปที่ GitHub → Settings → SSH and GPG keys
   - คลิก **"New SSH key"**
   - ตั้งชื่อ (เช่น "My Laptop")
   - วาง public key ที่คัดลอกมา
   - คลิก **"Add SSH key"**

4. **เปลี่ยน Remote URL เป็น SSH:**
   ```bash
   # ดู remote URL ปัจจุบัน
   git remote -v
   
   # เปลี่ยนเป็น SSH
   git remote set-url origin git@github.com:patzapaty13-crypto/hr-project.git
   
   # ตรวจสอบ
   git remote -v
   ```

5. **ทดสอบ SSH Connection:**
   ```bash
   ssh -T git@github.com
   # ควรเห็น: "Hi Bobangely! You've successfully authenticated..."
   ```

6. **Push อีกครั้ง:**
   ```bash
   git push -u origin feature/my-work
   ```

---

## 🔍 ตรวจสอบสถานะ

### ตรวจสอบ Remote URL
```bash
git remote -v
```

**ควรเห็น:**
```
origin  git@github.com:patzapaty13-crypto/hr-project.git (fetch)
origin  git@github.com:patzapaty13-crypto/hr-project.git (push)
```

### ตรวจสอบ Git Config
```bash
git config user.name
git config user.email
```

**ควรตั้งค่า:**
```bash
git config user.name "Bobangely"
git config user.email "bobangely@example.com"
```

---

## 🚨 ปัญหาที่พบบ่อย

### ปัญหา: "Permission denied (publickey)"

**แก้ไข:**
- ตรวจสอบว่า SSH key ถูกเพิ่มใน GitHub แล้ว
- ตรวจสอบว่าใช้ SSH URL (`git@github.com:...`) ไม่ใช่ HTTPS

### ปัญหา: "Authentication failed"

**แก้ไข:**
- ใช้ Personal Access Token แทน password
- หรือเปลี่ยนเป็น SSH

### ปัญหา: "Repository not found"

**แก้ไข:**
- ตรวจสอบว่าเพื่อนถูกเพิ่มเป็น collaborator แล้ว
- ตรวจสอบว่า repository name ถูกต้อง

---

## ✅ Checklist สำหรับเพื่อน

- [ ] ถูกเพิ่มเป็น collaborator ใน GitHub repository
- [ ] Accept invitation (ถ้ามี)
- [ ] ตั้งค่า Git user.name และ user.email
- [ ] ใช้ Personal Access Token หรือ SSH
- [ ] ตรวจสอบ remote URL ถูกต้อง

---

## 📝 Quick Fix (แนะนำ)

**สำหรับเพื่อน:**

1. **ขอให้เจ้าของ repository เพิ่มเป็น collaborator**

2. **ใช้ SSH (แนะนำ):**
   ```bash
   # เปลี่ยน remote เป็น SSH
   git remote set-url origin git@github.com:patzapaty13-crypto/hr-project.git
   
   # Push
   git push -u origin feature/my-work
   ```

3. **หรือใช้ Personal Access Token:**
   - สร้าง token ใน GitHub
   - ใช้ token แทน password เมื่อ push

---

## 🆘 ยังไม่ได้ผล?

1. **ตรวจสอบว่าเพื่อนมี access:**
   - ไปที่ repository ใน GitHub
   - ดูว่าสามารถเข้าถึงได้หรือไม่

2. **ตรวจสอบ Git credentials:**
   ```bash
   # Windows - ลบ saved credentials
   git credential-manager-core erase
   
   # หรือ
   git config --global --unset credential.helper
   ```

3. **ลอง clone ใหม่:**
   ```bash
   # Clone ใหม่ด้วย SSH
   git clone git@github.com:patzapaty13-crypto/hr-project.git
   ```

---

**Happy Coding! 🚀**


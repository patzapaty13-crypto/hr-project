# สคริปต์สำหรับ Push ขึ้น GitHub
# ใช้งาน: .\setup-github.ps1

Write-Host "=== SPU Personnel System - GitHub Setup ===" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่าเป็น Git repository หรือไม่
if (-not (Test-Path .git)) {
    Write-Host "❌ ไม่พบ Git repository" -ForegroundColor Red
    exit 1
}

# รับข้อมูลจากผู้ใช้
$username = Read-Host "กรุณากรอก GitHub Username"
$repoName = Read-Host "กรุณากรอก Repository Name (เช่น: spu-personnel-system)"

if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "❌ กรุณากรอกข้อมูลให้ครบถ้วน" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "กำลังตั้งค่า..." -ForegroundColor Yellow

# ตรวจสอบว่ามี remote อยู่แล้วหรือไม่
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  พบ remote ที่มีอยู่แล้ว: $existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "ต้องการแทนที่หรือไม่? (y/n)"
    if ($replace -eq "y" -or $replace -eq "Y") {
        git remote remove origin
    } else {
        Write-Host "❌ ยกเลิกการดำเนินการ" -ForegroundColor Red
        exit 1
    }
}

# เพิ่ม remote
$remoteUrl = "https://github.com/$username/$repoName.git"
git remote add origin $remoteUrl

# เปลี่ยนชื่อ branch เป็น main
git branch -M main

Write-Host ""
Write-Host "✅ ตั้งค่า remote เรียบร้อย: $remoteUrl" -ForegroundColor Green
Write-Host ""
Write-Host "ขั้นตอนต่อไป:" -ForegroundColor Cyan
Write-Host "1. ไปที่ https://github.com/new และสร้าง repository ชื่อ '$repoName'" -ForegroundColor White
Write-Host "2. อย่า check 'Initialize this repository with a README'" -ForegroundColor White
Write-Host "3. กด Create repository" -ForegroundColor White
Write-Host "4. รันคำสั่งต่อไปนี้:" -ForegroundColor White
Write-Host ""
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""

$pushNow = Read-Host "ต้องการ push ตอนนี้เลยหรือไม่? (y/n)"
if ($pushNow -eq "y" -or $pushNow -eq "Y") {
    Write-Host ""
    Write-Host "กำลัง push ขึ้น GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Push สำเร็จ!" -ForegroundColor Green
        Write-Host "🌐 Repository: https://github.com/$username/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Push ไม่สำเร็จ กรุณาตรวจสอบว่าได้สร้าง repository บน GitHub แล้ว" -ForegroundColor Red
    }
}


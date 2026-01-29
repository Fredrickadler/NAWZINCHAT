# راهنمای آپلود روی GitHub

## مراحل آپلود پروژه روی GitHub

### 1. ایجاد Repository در GitHub

1. برو به [github.com](https://github.com)
2. روی **New** یا **+** کلیک کن
3. یک نام برای repository انتخاب کن (مثلاً `nawzin-chat`)
4. **Public** یا **Private** انتخاب کن
5. **Initialize this repository with a README** را تیک نزن (چون ما قبلاً README داریم)
6. روی **Create repository** کلیک کن

### 2. Initialize Git در پروژه

در Terminal یا PowerShell، به مسیر پروژه برو:

```bash
cd "C:\Users\PCMOD\Desktop\nawzin chat\NAWZINCHAT"
```

سپس این دستورات را اجرا کن:

```bash
# Initialize git repository
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: NaWziN Chat application"

# Add remote repository (آدرس repository خودت را جایگزین کن)
git remote add origin https://github.com/YOUR_USERNAME/nawzin-chat.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. اگر قبلاً Repository ساخته‌ای

اگر repository را قبلاً ساخته‌ای و می‌خواهی کدها را push کنی:

```bash
cd "C:\Users\PCMOD\Desktop\nawzin chat\NAWZINCHAT"

git init
git add .
git commit -m "Initial commit: NaWziN Chat application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

### 4. دستورات بعدی (برای تغییرات بعدی)

هر بار که تغییری دادی:

```bash
git add .
git commit -m "توضیح تغییرات"
git push
```

## نکات مهم

### فایل‌هایی که آپلود نمی‌شوند (در `.gitignore`):
- `.env` - فایل environment variables (محرمانه)
- `node_modules/` - پکیج‌های npm
- `.next/` - فایل‌های build شده
- فایل‌های موقت و log

### فایل‌های مهم که آپلود می‌شوند:
- ✅ تمام کدهای source
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ `.env.example` (الگوی environment variables)
- ✅ `README.md`
- ✅ تنظیمات Vercel

## Deploy روی Vercel از GitHub

بعد از آپلود روی GitHub:

1. برو به [vercel.com](https://vercel.com)
2. **Import Project** را بزن
3. Repository خودت را انتخاب کن
4. Environment Variables را اضافه کن:
   - `DATABASE_URL`
   - `JWT_SECRET`
5. **Deploy** را بزن

Vercel به صورت خودکار از GitHub deploy می‌کند!


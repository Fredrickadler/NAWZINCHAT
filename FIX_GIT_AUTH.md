# رفع مشکل Authentication در Git

## مشکل
خطای `403 Permission denied` به این معنی است که Git نمی‌تواند به GitHub دسترسی پیدا کند.

## راه‌حل‌ها

### راه‌حل 1: استفاده از Personal Access Token (پیشنهادی)

#### مرحله 1: ساخت Token در GitHub
1. برو به GitHub.com
2. روی عکس پروفایل → **Settings**
3. در سمت چپ → **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token (classic)**
6. یک نام بده (مثلاً `nawzin-chat-push`)
7. دسترسی‌ها را انتخاب کن:
   - ✅ `repo` (دسترسی کامل به repository)
8. **Generate token** را بزن
9. **Token را کپی کن** (فقط یک بار نمایش داده می‌شود!)

#### مرحله 2: استفاده از Token
وقتی Git ازت password خواست:
- **Username**: نام کاربری GitHub تو
- **Password**: Token که کپی کردی (نه password واقعی!)

یا می‌توانی URL را تغییر دهی:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Fredrickadler/NAWZINCHAT.git
```

### راه‌حل 2: پاک کردن Credentials قدیمی

#### در Windows:
1. **Windows Credential Manager** را باز کن:
   - Windows Key + R
   - تایپ کن: `control /name Microsoft.CredentialManager`
   - Enter
2. **Windows Credentials** را باز کن
3. هر credential مربوط به `github.com` را پیدا کن و **Remove** کن
4. دوباره `git push` را امتحان کن

یا از Command Line:
```powershell
cmdkey /list
cmdkey /delete:git:https://github.com
```

### راه‌حل 3: استفاده از SSH (برای استفاده دائمی)

#### مرحله 1: ساخت SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Enter را بزن (برای مسیر پیش‌فرض)
یک passphrase انتخاب کن (یا خالی بگذار)

#### مرحله 2: اضافه کردن به GitHub
1. محتوای فایل را کپی کن:
```bash
cat ~/.ssh/id_ed25519.pub
```

2. در GitHub:
   - Settings → SSH and GPG keys
   - New SSH key
   - Title: یک نام بده
   - Key: محتوای کپی شده را paste کن
   - Add SSH key

#### مرحله 3: تغییر Remote به SSH
```bash
git remote set-url origin git@github.com:Fredrickadler/NAWZINCHAT.git
```

### راه‌حل 4: استفاده از GitHub CLI

```bash
# نصب GitHub CLI (اگر نصب نیست)
winget install GitHub.cli

# Login
gh auth login

# حالا می‌توانی push کنی
git push
```

## بعد از رفع مشکل

```bash
git push
```

اگر همه چیز درست بود، باید پیام موفقیت ببینی!

## نکات امنیتی

⚠️ **هرگز Token یا Password را در کد commit نکن!**
- Token ها را فقط در Environment Variables یا Secret Managers نگه دار
- از `.gitignore` استفاده کن تا فایل‌های `.env` commit نشوند


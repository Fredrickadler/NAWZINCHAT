# راهنمای Setup Database

## اطلاعات مورد نیاز برای Database

برای راه‌اندازی اپلیکیشن، به یک **PostgreSQL Database** نیاز داری.

### 1. گزینه‌های Database

#### گزینه 1: Supabase (رایگان و آسان) ⭐ پیشنهادی
1. برو به [supabase.com](https://supabase.com)
2. یک حساب بساز (رایگان)
3. **New Project** بزن
4. یک نام برای project انتخاب کن
5. یک password قوی برای database انتخاب کن
6. Region را انتخاب کن (مثلاً `Europe West`)
7. **Create new project** را بزن
8. بعد از ساخت، به **Settings** → **Database** برو
9. **Connection string** را کپی کن (URI format)

#### گزینه 2: Neon (رایگان)
1. برو به [neon.tech](https://neon.tech)
2. Sign up کن
3. **Create Project** بزن
4. Connection string را کپی کن

#### گزینه 3: Railway (رایگان با محدودیت)
1. برو به [railway.app](https://railway.app)
2. Sign up کن
3. **New Project** → **Database** → **PostgreSQL**
4. Connection string را از Variables کپی کن

#### گزینه 4: Database محلی
اگر PostgreSQL روی سیستم خودت نصب داری:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nawzin_chat?schema=public"
```

### 2. اطلاعات مورد نیاز

بعد از ساخت database، این اطلاعات را برایم بفرست:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```

یا اگر می‌خواهی خودت setup کنی، این مراحل را دنبال کن:

### 3. Setup Database (اگر خودت می‌خواهی انجام دهی)

#### مرحله 1: Environment Variables
یک فایل `.env` در root پروژه بساز:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
JWT_SECRET="یک-کلید-تصادفی-قوی-برای-امنیت"
```

#### مرحله 2: Push Schema به Database
```bash
npm run db:push
```

این دستور:
- Schema را به database می‌فرستد
- Tables را می‌سازد (users, chats, messages, chat_members)

#### مرحله 3: Seed Database (ساخت کاربران)
```bash
npm run db:seed
```

این دستور:
- دو کاربر می‌سازد:
  - **Username**: `NaWziN`, **Password**: `Nazi`
  - **Username**: `NaWziN2`, **Password**: `Fredrick`
- یک chat بین این دو کاربر می‌سازد
- چند پیام اولیه اضافه می‌کند

### 4. تست Connection

برای تست اینکه database درست کار می‌کند:

```bash
npm run db:studio
```

این Prisma Studio را باز می‌کند که می‌توانی داده‌ها را ببینی.

### 5. اگر مشکل داشتی

#### خطای Connection
- مطمئن شو database در دسترس است
- Connection string را دوباره چک کن
- اگر از سرویس cloud استفاده می‌کنی، مطمئن شو IP تو whitelist شده

#### خطای Schema
```bash
# پاک کردن و دوباره ساختن
npx prisma migrate reset
npm run db:push
npm run db:seed
```

## خلاصه

**فقط این را برایم بفرست:**
```
DATABASE_URL=postgresql://...
```

و من بقیه کارها را انجام می‌دهم! 🚀


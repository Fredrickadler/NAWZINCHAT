# راهنمای رفع مشکلات

## مشکل: "Invalid credentials" در Login

### بررسی 1: آیا کاربران در database ساخته شده‌اند؟

```bash
npm run db:check
```

اگر کاربری پیدا نشد:
```bash
npm run db:seed
```

### بررسی 2: Environment Variables

مطمئن شو این متغیرها در Vercel یا `.env` تنظیم شده‌اند:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_SECRET`

### بررسی 3: Tables در Supabase

در Supabase SQL Editor، این query را اجرا کن:

```sql
SELECT * FROM users;
```

اگر table خالی است یا وجود ندارد:
1. SQL از `SUPABASE_SETUP.md` را اجرا کن
2. سپس `npm run db:seed` را اجرا کن

### بررسی 4: Username و Password

اطمینان حاصل کن که:
- Username دقیقاً: `NaWziN` یا `NaWziN2` (حساس به حروف بزرگ/کوچک)
- Password دقیقاً: `Nazi` یا `Fredrick` (حساس به حروف بزرگ/کوچک)

### بررسی 5: Logs در Vercel

در Vercel Dashboard → Deployments → Logs:
- خطاهای مربوط به Supabase connection را چک کن
- خطاهای مربوط به missing environment variables را چک کن

---

## مشکل: "Missing Supabase environment variables"

### راه‌حل:
1. در Vercel → Settings → Environment Variables
2. همه متغیرها را اضافه کن
3. Redeploy کن

---

## مشکل: "Table does not exist"

### راه‌حل:
1. در Supabase SQL Editor
2. SQL از `SUPABASE_SETUP.md` را اجرا کن
3. مطمئن شو tables ساخته شده‌اند

---

## مشکل: Seed script خطا می‌دهد

### بررسی:
1. Environment Variables را چک کن
2. Tables را چک کن (باید ساخته شده باشند)
3. Service Role Key را دوباره چک کن

---

## تست سریع

```bash
# 1. چک کردن کاربران
npm run db:check

# 2. اگر کاربری نیست، seed کن
npm run db:seed

# 3. دوباره چک کن
npm run db:check
```


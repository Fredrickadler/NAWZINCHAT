# رفع مشکل 404 در Vercel

## مشکل
خطای `404: NOT_FOUND` در Vercel به این دلایل بود:
1. استفاده از `server.ts` (custom server) که روی Vercel کار نمی‌کند
2. نیاز به تنظیمات خاص برای Vercel

## تغییرات انجام شده

### 1. فایل `vercel.json` اضافه شد
این فایل تنظیمات build برای Vercel را مشخص می‌کند.

### 2. `package.json` به‌روزرسانی شد
- `dev`: حالا از `next dev` استفاده می‌کند (بدون custom server)
- `dev:server`: برای اجرای local با Socket.IO
- `build`: برای Vercel مناسب است

### 3. Socket.IO اختیاری شد
- اپلیکیشن حالا بدون Socket.IO هم کار می‌کند
- از polling استفاده می‌کند (هر 3-5 ثانیه)
- اگر Socket.IO در دسترس باشد، از real-time استفاده می‌کند

### 4. فایل‌های اضافه
- `app/not-found.tsx`: صفحه 404 سفارشی
- `.vercelignore`: فایل‌هایی که نباید deploy شوند

## مراحل Deploy روی Vercel

### 1. Environment Variables
در Vercel Dashboard، این متغیرها را اضافه کن:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=یک-کلید-تصادفی-قوی
```

### 2. Build Settings
Vercel به صورت خودکار این تنظیمات را تشخیص می‌دهد:
- Framework: Next.js
- Build Command: `prisma generate && next build`
- Output Directory: `.next`

### 3. Deploy
```bash
git add .
git commit -m "Fix Vercel deployment"
git push origin main
```

Vercel به صورت خودکار deploy می‌کند.

## نکات مهم

### Database
بعد از deploy، باید database را setup کنی:
1. یک PostgreSQL database بساز (Supabase یا Neon)
2. `DATABASE_URL` را در Vercel تنظیم کن
3. از Vercel CLI یا یک script برای اجرای migration استفاده کن:

```bash
npx vercel env pull
npx prisma db push
npx prisma db seed
```

یا می‌توانی از Vercel Postgres استفاده کنی که به صورت خودکار setup می‌شود.

### Socket.IO (اختیاری)
برای real-time messaging کامل:
- می‌توانی یک سرور جداگانه برای Socket.IO استفاده کنی
- یا از سرویس‌های آماده مثل Pusher استفاده کنی
- یا با polling فعلی کار کنی (کمی کندتر اما کار می‌کند)

## تست Local

برای تست local با Socket.IO:
```bash
npm run dev:server
```

برای تست بدون Socket.IO (مثل Vercel):
```bash
npm run dev
```

## اگر هنوز مشکل داری

1. **Build Logs را چک کن**: در Vercel Dashboard → Deployments → Build Logs
2. **Environment Variables را بررسی کن**: مطمئن شو همه متغیرها تنظیم شده‌اند
3. **Database Connection**: مطمئن شو database در دسترس است
4. **Prisma Generate**: مطمئن شو `prisma generate` در build اجرا می‌شود
 

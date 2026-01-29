# راهنمای Deploy

## Deploy روی Vercel

این اپلیکیشن برای Vercel بهینه شده است. برای deploy:

1. **Push به GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect به Vercel**:
   - برو به [vercel.com](https://vercel.com)
   - Import project از GitHub
   - Environment Variables را تنظیم کن:
     - `DATABASE_URL`: آدرس PostgreSQL database
     - `JWT_SECRET`: یک secret key برای JWT

3. **Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `prisma generate && next build`
   - Install Command: `npm install`

4. **Deploy**:
   - روی Deploy کلیک کن

## نکات مهم

### Socket.IO و Real-time
- روی Vercel (serverless)، Socket.IO به صورت کامل کار نمی‌کند
- اپلیکیشن به صورت خودکار از **polling** استفاده می‌کند (هر 3-5 ثانیه)
- برای real-time کامل، می‌توانی:
  1. یک سرور جداگانه برای Socket.IO استفاده کنی (Railway, Render, etc.)
  2. از سرویس‌های آماده مثل Pusher یا Ably استفاده کنی

### Database
- باید یک PostgreSQL database داشته باشی
- می‌توانی از [Supabase](https://supabase.com) یا [Neon](https://neon.tech) استفاده کنی
- بعد از deploy، باید `prisma db push` و `prisma db seed` را اجرا کنی

### Environment Variables در Vercel
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-here
```

## Deploy روی پلتفرم‌های دیگر

### Railway / Render
این پلتفرم‌ها از custom server پشتیبانی می‌کنند:

1. `package.json` را تغییر بده:
   ```json
   "scripts": {
     "start": "tsx server.ts"
   }
   ```

2. Environment variables را تنظیم کن

3. Deploy کن

### Docker
یک `Dockerfile` اضافه کن و از `server.ts` استفاده کن.


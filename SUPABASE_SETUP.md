# راهنمای Setup با Supabase

## Environment Variables مورد نیاز

در Vercel یا `.env` محلی، این متغیرها را اضافه کن:

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: URL پروژه Supabase تو
- **مثال**: `https://xxxxx.supabase.co`

### 2. SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Service Role Key از Supabase
- **نحوه پیدا کردن**: 
  - Supabase Dashboard → Project Settings → API
  - بخش **Service Role Key** → **Copy**

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY (اختیاری برای client-side)
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Anon/Public Key از Supabase
- **نحوه پیدا کردن**: 
  - Supabase Dashboard → Project Settings → API
  - بخش **Project API keys** → **anon public**

### 4. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: یک کلید تصادفی قوی (حداقل 32 کاراکتر)
- **مثال**: `nawzin-chat-secret-key-2024-super-secure-jwt-token-min-32-chars`

---

## مراحل Setup

### 1. ساخت Tables در Supabase

در Supabase SQL Editor، این SQL را اجرا کن:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- Create chats table
CREATE TABLE IF NOT EXISTS "chats" (
    "id" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- Create chat_members table
CREATE TABLE IF NOT EXISTS "chat_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id")
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "messages_chatId_createdAt_idx" ON "messages"("chatId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "chat_members_userId_chatId_key" ON "chat_members"("userId", "chatId");

-- Add foreign key constraints
ALTER TABLE "chats" ADD CONSTRAINT "chats_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### 2. Seed Data (اضافه کردن کاربران)

بعد از اضافه کردن Environment Variables، این دستور را اجرا کن:

```bash
npm install
npm run db:seed
```

این دو کاربر را می‌سازد:
- **Username**: `NaWziN`, **Password**: `Nazi`
- **Username**: `NaWziN2`, **Password**: `Fredrick`

---

## نکات مهم

⚠️ **Service Role Key محرمانه است!**
- هرگز در کد client-side استفاده نکن
- فقط در server-side استفاده کن
- در Vercel Environment Variables اضافه کن (نه در کد)

✅ **RLS (Row Level Security)**
- Service Role Key از RLS bypass می‌کند
- برای امنیت بیشتر، می‌توانی RLS policies اضافه کنی

---

## Troubleshooting

### خطای "Missing Supabase environment variables"
- مطمئن شو همه Environment Variables را اضافه کرده‌ای
- در Vercel، بعد از اضافه کردن، Redeploy کن

### خطای Connection
- URL و Keys را دوباره چک کن
- مطمئن شو Service Role Key درست است


# NaWziN Chat

A Telegram-like web messaging application built with Next.js, TypeScript, PostgreSQL, and WebSocket.

## Features

- **Authentication**: Username/password login (users pre-created by admin)
- **Chat List**: Telegram-like sidebar with search functionality
- **Real-time Messaging**: WebSocket-based instant messaging
- **Dark Mode**: Modern dark theme UI
- **Message Status**: Seen/delivered indicators
- **Responsive Design**: Desktop-first responsive layout

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase Client SDK
- **Realtime**: Socket.IO

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

3. **Set up the database**:
   - در Supabase SQL Editor، SQL از فایل `SUPABASE_SETUP.md` را اجرا کن
   - یا از SQL که قبلاً داده‌ام استفاده کن

4. **Seed the database**:
   ```bash
   npm run db:seed
   ```

   This creates 2 users:
   - **Username**: `NaWziN`, **Password**: `Nazi`
   - **Username**: `NaWziN2`, **Password**: `Fredrick`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

   **Note**: This project uses Supabase for database. See `SUPABASE_SETUP.md` for detailed setup instructions.

## Usage

1. Login with one of the seeded users:
   - Username: `NaWziN`, Password: `Nazi`
   - Username: `NaWziN2`, Password: `Fredrick`

2. Select a chat from the sidebar to start messaging

3. Type and send messages in real-time

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── chat/         # Chat page
│   ├── login/        # Login page
│   └── layout.tsx    # Root layout
├── components/        # React components
├── lib/              # Utilities (Supabase, auth)
├── scripts/          # Seed scripts
└── server.ts         # Socket.IO server
```

## Database Models

- **User**: User accounts
- **Chat**: Chat rooms (private chats)
- **ChatMember**: Many-to-many relationship between users and chats
- **Message**: Messages in chats

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed the database (create users)

## Notes

- Users must be pre-created (no signup page)
- All messages persist in the database
- WebSocket connection is established per authenticated user
- The application uses Supabase for database operations
- See `SUPABASE_SETUP.md` for detailed setup instructions


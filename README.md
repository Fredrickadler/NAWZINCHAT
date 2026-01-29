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
- **Database**: PostgreSQL
- **ORM**: Prisma
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
   DATABASE_URL="postgresql://user:password@localhost:5432/nawzin_chat?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
   ```

3. **Set up the database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Seed the database**:
   ```bash
   npm run db:seed
   ```

   This creates 4 users (alice, bob, charlie, diana) with password `password123`.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

   **Note**: This project uses a custom Next.js server with Socket.IO integration. The `dev` script runs `server.ts` which handles both Next.js and WebSocket connections.

## Usage

1. Login with one of the seeded users:
   - Username: `alice`, `bob`, `charlie`, or `diana`
   - Password: `password123`

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
├── lib/              # Utilities (Prisma, auth)
├── prisma/           # Prisma schema and seed
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
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## Notes

- Users must be pre-created (no signup page)
- All messages persist in the database
- WebSocket connection is established per authenticated user
- Default password for all seeded users is `password123`
- The application uses a custom Next.js server (`server.ts`) to integrate Socket.IO
- For Windows users: If you encounter issues with the start script, you may need to use `cross-env` or run the server directly with `tsx server.ts`


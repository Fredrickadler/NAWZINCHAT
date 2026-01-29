import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const password = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      password,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      password,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: {},
    create: {
      username: 'charlie',
      password,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
  })

  const user4 = await prisma.user.upsert({
    where: { username: 'diana' },
    update: {},
    create: {
      username: 'diana',
      password,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    },
  })

  // Create private chat between alice and bob
  const chat1 = await prisma.chat.create({
    data: {
      isPrivate: true,
      creatorId: user1.id,
      members: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
        ],
      },
    },
  })

  // Create private chat between alice and charlie
  const chat2 = await prisma.chat.create({
    data: {
      isPrivate: true,
      creatorId: user1.id,
      members: {
        create: [
          { userId: user1.id },
          { userId: user3.id },
        ],
      },
    },
  })

  // Create private chat between alice and diana
  const chat3 = await prisma.chat.create({
    data: {
      isPrivate: true,
      creatorId: user1.id,
      members: {
        create: [
          { userId: user1.id },
          { userId: user4.id },
        ],
      },
    },
  })

  // Add some initial messages
  await prisma.message.createMany({
    data: [
      {
        chatId: chat1.id,
        senderId: user2.id,
        content: 'Hey Alice! How are you?',
        seen: true,
      },
      {
        chatId: chat1.id,
        senderId: user1.id,
        content: 'Hi Bob! I\'m doing great, thanks for asking!',
        seen: true,
      },
      {
        chatId: chat1.id,
        senderId: user2.id,
        content: 'That\'s awesome! Want to grab coffee later?',
        seen: false,
      },
      {
        chatId: chat2.id,
        senderId: user3.id,
        content: 'Hello Alice!',
        seen: false,
      },
      {
        chatId: chat3.id,
        senderId: user4.id,
        content: 'Hi there! 👋',
        seen: false,
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log('Users created:', { user1, user2, user3, user4 })
  console.log('Chats created:', { chat1, chat2, chat3 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


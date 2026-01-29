import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create users with NaWziN username pattern
  // Note: Username must be unique, so we use similar but different usernames
  
  const password1 = await bcrypt.hash('Nazi', 10)
  const password2 = await bcrypt.hash('Fredrick', 10)

  const user1 = await prisma.user.upsert({
    where: { username: 'NaWziN' },
    update: {},
    create: {
      username: 'NaWziN',
      password: password1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN1',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { username: 'NaWziN2' },
    update: {},
    create: {
      username: 'NaWziN2',
      password: password2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN2',
    },
  })

  // Create private chat between the two users
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

  // Add some initial messages
  await prisma.message.createMany({
    data: [
      {
        chatId: chat1.id,
        senderId: user1.id,
        content: 'سلام! چطوری؟',
        seen: false,
      },
      {
        chatId: chat1.id,
        senderId: user2.id,
        content: 'سلام! خوبم ممنون 😊',
        seen: false,
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log('Users created:')
  console.log('  - Username: NaWziN, Password: Nazi')
  console.log('  - Username: NaWziN2, Password: Fredrick')
  console.log('Chat created between the two users')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


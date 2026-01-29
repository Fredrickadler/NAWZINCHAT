import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all chats where user is a member
    const chatMemberships = await prisma.chatMember.findMany({
      where: { userId: user.id },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    lastSeen: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: 'desc',
        },
      },
    })

    // Format chats for frontend
    const chats = await Promise.all(
      chatMemberships.map(async (membership) => {
        const chat = membership.chat
        const otherMembers = chat.members
          .filter((m) => m.userId !== user.id)
          .map((m) => m.user)

        const lastMessage = chat.messages[0] || null

        // Count unread messages (messages not sent by user and not seen)
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: user.id },
            seen: false,
          },
        })

        return {
          id: chat.id,
          isPrivate: chat.isPrivate,
          otherMembers,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                senderUsername: lastMessage.sender.username,
                createdAt: lastMessage.createdAt,
                seen: lastMessage.seen,
              }
            : null,
          unreadCount,
          updatedAt: chat.updatedAt,
        }
      })
    )

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all chat memberships for this user
    const { data: memberships, error: membershipsError } = await supabaseAdmin
      .from('chat_members')
      .select('chatId')
      .eq('userId', user.id)

    if (membershipsError || !memberships || memberships.length === 0) {
      return NextResponse.json({ chats: [] })
    }

    const chatIds = memberships.map((m) => m.chatId)

    // Get all chats
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updatedAt', { ascending: false })

    if (chatsError || !chats) {
      return NextResponse.json({ chats: [] })
    }

    // Format chats for frontend
    const formattedChats = await Promise.all(
      chats.map(async (chat: any) => {
        // Get chat members
        const { data: chatMembers } = await supabaseAdmin
          .from('chat_members')
          .select('userId')
          .eq('chatId', chat.id)

        const memberIds = chatMembers?.map((m: { userId: string }) => m.userId) || []
        const otherMemberIds = memberIds.filter((id: string) => id !== user.id)

        // Get other members info
        const { data: otherMembers } = await supabaseAdmin
          .from('users')
          .select('id, username, avatar, lastSeen')
          .in('id', otherMemberIds)

        // Get last message
        const { data: lastMessages } = await supabaseAdmin
          .from('messages')
          .select('id, content, senderId, createdAt, seen')
          .eq('chatId', chat.id)
          .order('createdAt', { ascending: false })
          .limit(1)

        const lastMessage = lastMessages?.[0] || null

        // Get sender info for last message
        let senderUsername = null
        if (lastMessage) {
          const { data: sender } = await supabaseAdmin
            .from('users')
            .select('username')
            .eq('id', lastMessage.senderId)
            .single()
          senderUsername = sender?.username || null
        }

        // Count unread messages
        const { count: unreadCount } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chatId', chat.id)
          .neq('senderId', user.id)
          .eq('seen', false)

        return {
          id: chat.id,
          isPrivate: chat.isPrivate,
          otherMembers: otherMembers || [],
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                senderUsername,
                createdAt: lastMessage.createdAt,
                seen: lastMessage.seen,
              }
            : null,
          unreadCount: unreadCount || 0,
          updatedAt: chat.updatedAt,
        }
      })
    )

    return NextResponse.json({ chats: formattedChats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


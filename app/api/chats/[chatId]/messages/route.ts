import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params

    // Verify user is a member of this chat
    const { data: membership } = await supabaseAdmin
      .from('chat_members')
      .select('id')
      .eq('chatId', chatId)
      .eq('userId', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('id, content, senderId, createdAt, seen')
      .eq('chatId', chatId)
      .order('createdAt', { ascending: true })

    if (messagesError || !messages) {
      return NextResponse.json({ messages: [] })
    }

    // Get sender info for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message: any) => {
        const { data: sender } = await supabaseAdmin
          .from('users')
          .select('id, username, avatar')
          .eq('id', message.senderId)
          .single()

        return {
          ...message,
          sender: sender || {
            id: message.senderId,
            username: 'Unknown',
            avatar: null,
          },
        }
      })
    )

    // Mark messages as seen
    await supabaseAdmin
      .from('messages')
      .update({ seen: true })
      .eq('chatId', chatId)
      .neq('senderId', user.id)
      .eq('seen', false)

    return NextResponse.json({ messages: messagesWithSenders })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify user is a member of this chat
    const { data: membership } = await supabaseAdmin
      .from('chat_members')
      .select('id')
      .eq('chatId', chatId)
      .eq('userId', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Create message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        chatId,
        senderId: user.id,
        content: content.trim(),
        seen: false,
      })
      .select()
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    // Get sender info
    const { data: sender } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar')
      .eq('id', user.id)
      .single()

    // Update chat updatedAt
    await supabaseAdmin
      .from('chats')
      .update({ updatedAt: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({
      message: {
        ...message,
        sender: sender || {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      },
    })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


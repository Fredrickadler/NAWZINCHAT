import { supabaseAdmin } from '../lib/supabase'
import * as bcrypt from 'bcryptjs'

async function main() {
  console.log('Starting seed...')

  // Create users with NaWziN username pattern
  const password1 = await bcrypt.hash('Nazi', 10)
  const password2 = await bcrypt.hash('Fredrick', 10)

  // Check if users already exist
  const { data: existingUser1 } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', 'NaWziN')
    .single()

  const { data: existingUser2 } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', 'NaWziN2')
    .single()

  let user1, user2

  if (existingUser1) {
    // Update existing user
    const { data: updated } = await supabaseAdmin
      .from('users')
      .update({
        password: password1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN1',
      })
      .eq('id', existingUser1.id)
      .select()
      .single()
    user1 = updated
  } else {
    // Create new user
    const { data: created } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'NaWziN',
        password: password1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN1',
      })
      .select()
      .single()
    user1 = created
  }

  if (existingUser2) {
    // Update existing user
    const { data: updated } = await supabaseAdmin
      .from('users')
      .update({
        password: password2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN2',
      })
      .eq('id', existingUser2.id)
      .select()
      .single()
    user2 = updated
  } else {
    // Create new user
    const { data: created } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'NaWziN2',
        password: password2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NaWziN2',
      })
      .select()
      .single()
    user2 = created
  }

  if (!user1 || !user2) {
    throw new Error('Failed to create users')
  }

  console.log('Users created:', { user1: user1.id, user2: user2.id })

  // Check if chat already exists
  const { data: existingChat } = await supabaseAdmin
    .from('chats')
    .select('id')
    .eq('creatorId', user1.id)
    .single()

  let chat1

  if (existingChat) {
    chat1 = existingChat
  } else {
    // Create private chat between the two users
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert({
        isPrivate: true,
        creatorId: user1.id,
      })
      .select()
      .single()

    if (chatError || !chat) {
      throw new Error('Failed to create chat')
    }

    chat1 = chat

    // Add members to chat
    await supabaseAdmin.from('chat_members').insert([
      { userId: user1.id, chatId: chat1.id },
      { userId: user2.id, chatId: chat1.id },
    ])
  }

  // Check if messages already exist
  const { data: existingMessages } = await supabaseAdmin
    .from('messages')
    .select('id')
    .eq('chatId', chat1.id)
    .limit(1)

  if (!existingMessages || existingMessages.length === 0) {
    // Add some initial messages
    await supabaseAdmin.from('messages').insert([
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
    ])
  }

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
  .finally(() => {
    process.exit(0)
  })


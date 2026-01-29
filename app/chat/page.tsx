'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatList from '@/components/ChatList'
import ChatView from '@/components/ChatView'
import { io, Socket } from 'socket.io-client'

interface User {
  id: string
  username: string
  avatar: string | null
  lastSeen: string
}

interface Chat {
  id: string
  isPrivate: boolean
  otherMembers: User[]
  lastMessage: {
    id: string
    content: string
    senderId: string
    senderUsername: string
    createdAt: string
    seen: boolean
  } | null
  unreadCount: number
  updatedAt: string
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Check authentication
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    if (!user) return

    // Try to initialize socket connection (only if Socket.IO server is available)
    // On Vercel/serverless, this will fail gracefully and app will work without real-time
    try {
      // Get token from cookies
      const getToken = () => {
        return document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]
      }

      // Initialize socket connection
      const socket = io(window.location.origin, {
        auth: {
          token: getToken(),
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Connected to server')
      })

      socket.on('connect_error', (error) => {
        console.log('Socket connection error (this is normal on serverless):', error.message)
        // App will work without real-time updates
      })

      socket.on('newMessage', (message: any) => {
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex((c) => c.id === message.chatId)
          if (chatIndex === -1) return prevChats

          const updatedChats = [...prevChats]
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              senderUsername: message.sender?.username || 'Unknown',
              createdAt: message.createdAt,
              seen: message.seen,
            },
            updatedAt: message.createdAt,
          }

          // Move to top
          const [movedChat] = updatedChats.splice(chatIndex, 1)
          updatedChats.unshift(movedChat)

          return updatedChats
        })
      })

      return () => {
        socket.disconnect()
      }
    } catch (error) {
      console.log('Socket.IO not available (serverless environment)')
      // App will work without real-time updates
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats')
        if (!response.ok) {
          throw new Error('Failed to fetch chats')
        }
        const data = await response.json()
        setChats(data.chats)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching chats:', error)
        setLoading(false)
      }
    }

    fetchChats()

    // Poll for new messages if Socket.IO is not available
    const pollInterval = setInterval(() => {
      fetchChats()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [user])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e1621]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0e1621] overflow-hidden">
      <ChatList
        user={user}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onLogout={handleLogout}
      />
      <ChatView
        chatId={selectedChatId}
        currentUserId={user.id}
        socket={socketRef.current}
      />
    </div>
  )
}


'use client'

import { useEffect, useState, useRef } from 'react'
import { Socket } from 'socket.io-client'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    username: string
    avatar: string | null
  }
  createdAt: string
  seen: boolean
}

interface ChatViewProps {
  chatId: string | null
  currentUserId: string
  socket: Socket | null
}

export default function ChatView({
  chatId,
  currentUserId,
  socket,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`)
        const data = await res.json()
        setMessages(data.messages || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching messages:', error)
        setLoading(false)
      }
    }

    fetchMessages()

    // Poll for new messages if Socket.IO is not available
    const pollInterval = setInterval(() => {
      fetchMessages()
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [chatId])

  useEffect(() => {
    if (!socket || !chatId) return

    const handleNewMessage = (socketMessage: any) => {
      if (socketMessage.chatId === chatId) {
        // Check if message already exists (avoid duplicates)
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === socketMessage.id)
          if (exists) return prev
          
          return [...prev, {
            id: socketMessage.id,
            content: socketMessage.content,
            senderId: socketMessage.senderId,
            sender: socketMessage.sender || {
              id: socketMessage.senderId,
              username: 'Unknown',
              avatar: null,
            },
            createdAt: socketMessage.createdAt,
            seen: socketMessage.seen || false,
          }]
        })
      }
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [socket, chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatId || !newMessage.trim() || sending) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Add message immediately for sender
      setMessages((prev) => {
        // Check if already exists (from socket)
        const exists = prev.some((m) => m.id === data.message.id)
        if (exists) return prev
        return [...prev, data.message]
      })
      
      // Emit via socket to notify other users
      if (socket) {
        socket.emit('sendMessage', {
          chatId,
          message: data.message,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e1621]">
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">Select a chat to start messaging</p>
          <p className="text-sm">Choose a conversation from the list</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0e1621] h-full">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] flex gap-2 ${
                    isOwn ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar (only for received messages) */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {message.sender.avatar ? (
                        <Image
                          src={message.sender.avatar}
                          alt={message.sender.username}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5288c1] flex items-center justify-center text-white text-xs font-semibold">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-[#2b5278] text-white'
                          : 'bg-[#182533] text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn && (
                        <span className="text-xs text-gray-400">
                          {message.seen ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[#2b5278] p-4 bg-[#17212b]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-[#242f3d] border border-[#2b5278] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-[#5288c1] hover:bg-[#4a7aad] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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

interface ChatListProps {
  user: User
  chats: Chat[]
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  onLogout: () => void
}

export default function ChatList({
  user,
  chats,
  selectedChatId,
  onSelectChat,
  onLogout,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return chat.otherMembers.some((member) =>
      member.username.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const getChatName = (chat: Chat) => {
    if (chat.isPrivate && chat.otherMembers.length > 0) {
      return chat.otherMembers[0].username
    }
    return 'Chat'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.isPrivate && chat.otherMembers.length > 0) {
      return chat.otherMembers[0].avatar
    }
    return null
  }

  return (
    <div className="w-80 bg-[#17212b] border-r border-[#2b5278] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#2b5278] flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">NaWziN Chat</h2>
        <button
          onClick={onLogout}
          className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2b5278]">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-[#242f3d] border border-[#2b5278] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent text-sm"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const chatName = getChatName(chat)
            const chatAvatar = getChatAvatar(chat)
            const isSelected = selectedChatId === chat.id

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`px-4 py-3 cursor-pointer border-b border-[#2b5278] transition-colors ${
                  isSelected
                    ? 'bg-[#2b5278]'
                    : 'bg-[#17212b] hover:bg-[#1e2832]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {chatAvatar ? (
                      <Image
                        src={chatAvatar}
                        alt={chatName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#5288c1] flex items-center justify-center text-white font-semibold">
                        {chatName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium truncate">
                        {chatName}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage ? (
                          <>
                            {chat.lastMessage.senderId === user.id && (
                              <span className="text-gray-500">You: </span>
                            )}
                            {chat.lastMessage.content}
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-[#5288c1] text-white text-xs rounded-full flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


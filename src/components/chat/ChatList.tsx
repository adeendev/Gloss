'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, RefreshCw, Phone, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Chat {
  id: string
  customerName: string | null
  customerPhone: string
  lastMessageAt: string
  unreadCount: number
  messages: Array<{
    id: string
    content: string
    direction: 'incoming' | 'outgoing'
    createdAt: string
  }>
}

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onChatSelect: (chat: Chat) => void
  loading: boolean
  onRefresh: () => void
}

export function ChatList({
  chats,
  selectedChat,
  onChatSelect,
  loading,
  onRefresh,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter(chat => {
    const searchLower = searchQuery.toLowerCase()
    const customerName = chat.customerName?.toLowerCase() || ''
    const customerPhone = chat.customerPhone.toLowerCase()
    const lastMessage = chat.messages[0]?.content.toLowerCase() || ''
    
    return (
      customerName.includes(searchLower) ||
      customerPhone.includes(searchLower) ||
      lastMessage.includes(searchLower)
    )
  })

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return phone.slice(-2)
  }

  const formatLastMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch {
      return ''
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Chats</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-sm text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Customer messages will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const lastMessage = chat.messages[0]
              const isSelected = selectedChat?.id === chat.id
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-500 text-white font-semibold">
                          {getInitials(chat.customerName, chat.customerPhone)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {chat.customerName || chat.customerPhone}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatLastMessageTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 min-w-0 flex-1">
                          {lastMessage && (
                            <>
                              {lastMessage.direction === 'outgoing' && (
                                <span className="text-blue-500 text-xs">✓</span>
                              )}
                              <p className={`text-sm truncate ${
                                chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                              }`}>
                                {truncateMessage(lastMessage.content)}
                              </p>
                            </>
                          )}
                        </div>
                        
                        {!chat.customerName && (
                          <Phone className="h-3 w-3 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      {/* Phone number if different from name */}
                      {chat.customerName && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {chat.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
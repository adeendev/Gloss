'use client'

import { useState, useEffect } from 'react'
import { ChatList } from '@/components/chat/ChatList'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Card } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

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

export default function AdminChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchChats = async () => {
    try {
      setLoading(true)
      // Use a default business ID - in a real app, this would come from auth context
      const response = await fetch('/api/whatsapp/messages?businessId=default')
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    // Mark chat as read
    markChatAsRead(chat.id)
  }

  const markChatAsRead = async (chatId: string) => {
    try {
      await fetch(`/api/whatsapp/chats/${chatId}/read`, {
        method: 'POST',
      })
      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ))
    } catch (error) {
      console.error('Failed to mark chat as read:', error)
    }
  }

  const refreshChats = () => {
    fetchChats()
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          WhatsApp Chat Management
        </h1>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r bg-white">
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            loading={loading}
            onRefresh={refreshChats}
          />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-gray-50">
          {selectedChat ? (
            <ChatInterface
              chatId={selectedChat.id}
              customerName={selectedChat.customerName || selectedChat.customerPhone}
              customerPhone={selectedChat.customerPhone}
              businessId="default"
              onMessageSent={refreshChats}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
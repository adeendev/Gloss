'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, Phone, MoreVertical, Paperclip, Smile } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface Message {
  id: string
  content: string
  direction: 'incoming' | 'outgoing'
  createdAt: string
  status?: 'sent' | 'delivered' | 'read'
  messageId?: string
}

interface ChatInterfaceProps {
  chatId: string
  customerName: string
  customerPhone: string
  businessId: string
  onMessageSent?: () => void
}

export function ChatInterface({
  chatId,
  customerName,
  customerPhone,
  businessId,
  onMessageSent,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/whatsapp/messages?chatId=${chatId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    const tempMessage = newMessage
    setNewMessage('')

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerPhone,
          message: tempMessage,
          businessId,
        }),
      })

      if (response.ok) {
        fetchMessages()
        onMessageSent?.()
      } else {
        // Restore message if failed
        setNewMessage(tempMessage)
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(tempMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getMessageStatus = (message: Message) => {
    if (message.direction === 'incoming') return null
    
    switch (message.status) {
      case 'sent':
        return <span className="text-gray-400">✓</span>
      case 'delivered':
        return <span className="text-gray-400">✓✓</span>
      case 'read':
        return <span className="text-blue-400">✓✓</span>
      default:
        return <span className="text-gray-400">✓</span>
    }
  }

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-green-500 text-white font-semibold">
              {getInitials(customerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{customerName}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{customerPhone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Send className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(messages[index - 1].createdAt).toDateString()
              
              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(message.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div
                    className={`flex ${
                      message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.direction === 'outgoing'
                          ? 'bg-green-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                        message.direction === 'outgoing' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          
          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="pr-10 resize-none min-h-[40px] max-h-[120px]"
              style={{ paddingRight: '40px' }}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={sendMessage} 
            disabled={loading || !newMessage.trim()}
            className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
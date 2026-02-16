// ============================================
// FILE: src/app/api/whatsapp/messages/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const businessId = searchParams.get('businessId')

    if (chatId) {
      const messages = await prisma.whatsAppMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
      })
      return NextResponse.json(messages)
    }

    if (businessId) {
      const chats = await prisma.whatsAppChat.findMany({
        where: { businessId },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              direction: true,
              createdAt: true,
              status: true
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  direction: 'incoming',
                  status: { not: 'read' }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
      })

      // Format the response to include computed fields
      const formattedChats = chats.map(chat => ({
        id: chat.id,
        customerName: chat.customerName || chat.customerPhone,
        customerPhone: chat.customerPhone,
        lastMessageAt: chat.lastMessageAt,
        unreadCount: chat._count.messages,
        lastMessage: chat.messages[0] || null,
        businessId: chat.businessId
      }))

      return NextResponse.json(formattedChats)
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

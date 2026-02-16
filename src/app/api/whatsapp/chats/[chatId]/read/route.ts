import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    // Update all incoming messages in this chat to read status
    await prisma.whatsAppMessage.updateMany({
      where: {
        chatId: chatId,
        direction: 'incoming',
        status: {
          not: 'read'
        }
      },
      data: {
        status: 'read'
      }
    })

    // Update the chat's unread count to 0
    await prisma.whatsAppChat.update({
      where: {
        id: chatId
      },
      data: {
        unreadCount: 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking chat as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark chat as read' },
      { status: 500 }
    )
  }
}
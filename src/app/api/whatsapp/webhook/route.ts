
// ============================================
// FILE: src/app/api/whatsapp/webhook/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { whatsappClient } from '@/lib/whatsapp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    // Handle incoming messages
    if (value?.messages?.[0]) {
      const message = value.messages[0]
      const from = message.from
      const messageId = message.id
      const text = message.text?.body || ''
      const businessPhoneId = value.metadata.phone_number_id

      // Find business
      const business = await prisma.business.findFirst({
        where: {
          // Match by phone number ID if stored, otherwise use first business
        },
      })

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }

      // Find or create chat
      let chat = await prisma.whatsAppChat.findUnique({
        where: {
          businessId_customerPhone: {
            businessId: business.id,
            customerPhone: from,
          },
        },
      })

      if (!chat) {
        // Try to find customer name from bookings
        const booking = await prisma.booking.findFirst({
          where: {
            businessId: business.id,
            customerPhone: from,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        chat = await prisma.whatsAppChat.create({
          data: {
            businessId: business.id,
            customerPhone: from,
            customerName: booking?.customerName,
            lastMessageAt: new Date(),
            unreadCount: 1,
          },
        })
      } else {
        // Update existing chat
        await prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: {
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 },
          },
        })
      }

      // Save message
      await prisma.whatsAppMessage.create({
        data: {
          chatId: chat.id,
          messageId,
          direction: 'incoming',
          content: text,
          status: 'received',
        },
      })

      // Mark as read
      await whatsappClient.markAsRead(messageId)
    }

    // Handle message status updates (delivery receipts, read receipts)
    if (value?.statuses?.[0]) {
      const status = value.statuses[0]
      const messageId = status.id
      const statusType = status.status // 'sent', 'delivered', 'read', 'failed'
      const recipientId = status.recipient_id

      // Update message status in database
      try {
        await prisma.whatsAppMessage.updateMany({
          where: {
            messageId: messageId,
            direction: 'outgoing'
          },
          data: {
            status: statusType === 'delivered' ? 'delivered' : 
                   statusType === 'read' ? 'read' : 
                   statusType === 'failed' ? 'failed' : 'sent'
          }
        })

        console.log(`Updated message ${messageId} status to ${statusType}`)
      } catch (error) {
        console.error('Error updating message status:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

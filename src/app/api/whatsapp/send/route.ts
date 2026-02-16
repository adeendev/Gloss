// ============================================
// FILE: src/app/api/whatsapp/send/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { whatsappClient } from '@/lib/whatsapp'
import { whatsappMessageSchema } from '@/lib/validators'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, type, templateName, templateParams } = 
      whatsappMessageSchema.parse(body)

    let result
    if (type === 'template' && templateName) {
      const components = templateParams
        ? [
            {
              type: 'body',
              parameters: templateParams.map((param) => ({
                type: 'text',
                text: param,
              })),
            },
          ]
        : []

      result = await whatsappClient.sendTemplateMessage(
        to,
        templateName,
        'en',
        components
      )
    } else {
      result = await whatsappClient.sendTextMessage(to, message)
    }

    // Find or create chat
    const businessId = body.businessId // Should be passed from frontend
    if (businessId) {
      let chat = await prisma.whatsAppChat.findUnique({
        where: {
          businessId_customerPhone: {
            businessId,
            customerPhone: to,
          },
        },
      })

      if (!chat) {
        chat = await prisma.whatsAppChat.create({
          data: {
            businessId,
            customerPhone: to,
            lastMessageAt: new Date(),
          },
        })
      }

      // Save sent message
      await prisma.whatsAppMessage.create({
        data: {
          chatId: chat.id,
          messageId: result.messages[0].id,
          direction: 'outgoing',
          content: message,
          status: 'sent',
        },
      })
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Send WhatsApp message error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 400 }
    )
  }
}

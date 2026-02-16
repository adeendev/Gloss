// ============================================
// FILE: src/app/api/payments/stripe/webhook/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { whatsappClient } from '@/lib/whatsapp'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const bookingId = paymentIntent.metadata.bookingId
      const paymentType = paymentIntent.metadata.type || 'advance_payment'

      if (paymentType === 'advance_payment') {
        let booking

        if (bookingId && bookingId !== 'prebooking') {
          // Handle existing booking advance payment (legacy flow)
          booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              advancePaid: true,
              status: 'CONFIRMED',
              paymentMethod: 'STRIPE',
            },
            include: {
              service: true,
              business: {
                include: {
                  settings: true,
                },
              },
            },
          })
        } else {
          // Handle new payment-first flow - create booking from metadata
          const metadata = paymentIntent.metadata
          
          // Validate required metadata
          if (!metadata.businessId || !metadata.serviceId || !metadata.customerName || 
              !metadata.customerPhone || !metadata.scheduledAt) {
            throw new Error('Missing required booking data in payment metadata')
          }

          // Create booking from payment metadata
          booking = await prisma.booking.create({
            data: {
              businessId: metadata.businessId,
              serviceId: metadata.serviceId,
              customerName: metadata.customerName,
              customerPhone: metadata.customerPhone,
              customerEmail: metadata.customerEmail || null,
              scheduledAt: new Date(metadata.scheduledAt),
              duration: parseInt(metadata.duration),
              notes: metadata.notes || null,
              status: 'CONFIRMED',
              totalAmount: parseFloat(metadata.totalAmount),
              advanceAmount: parseFloat(metadata.advanceAmount),
              advancePaid: true,
              paymentMethod: 'STRIPE'
            },
            include: {
              service: true,
              business: {
                include: {
                  settings: true,
                },
              },
            },
          })
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: paymentIntent.amount / 100,
            method: 'STRIPE',
            status: 'COMPLETED',
            stripePaymentId: paymentIntent.id,
            paidAt: new Date(),
          },
        })

        // Send WhatsApp confirmation
        if (booking?.business?.settings?.sendWhatsApp) {
          const message = `✅ Booking Confirmed!\n\nHi ${booking.customerName}!\n\nYour ${booking.service?.name} appointment is confirmed for:\n📅 ${formatDate(booking.scheduledAt, 'long')}\n⏰ ${formatTime(booking.scheduledAt)}\n\n💰 Advance Payment Received: ${formatCurrency(booking.advanceAmount)}\n💵 Remaining Balance: ${formatCurrency(booking.totalAmount - booking.advanceAmount)}\n\nWe look forward to serving you!\n\n- ${booking.business?.name}`

          try {
            await whatsappClient.sendTextMessage(booking.customerPhone, message)

            await prisma.notification.create({
              data: {
                bookingId,
                type: 'BOOKING_CONFIRMATION',
                channel: 'whatsapp',
                recipient: booking.customerPhone,
                content: message,
                status: 'sent',
                sentAt: new Date(),
              },
            })
          } catch (error) {
            console.error('WhatsApp notification error:', error)
          }
        }
      } else if (paymentType === 'final_payment') {
        // Handle final payment
        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            fullPaymentPaid: true,
          },
          include: {
            service: true,
            business: {
              include: {
                settings: true,
              },
            },
          },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId,
            amount: paymentIntent.amount / 100,
            method: 'STRIPE',
            status: 'COMPLETED',
            stripePaymentId: paymentIntent.id,
            paidAt: new Date(),
          },
        })

        // Send WhatsApp payment confirmation with Google review link
        try {
          const googleReviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review'
          
          const message = `🎉 Payment Received!\n\nHi ${booking.customerName}!\n\nThank you for your payment of ${formatCurrency(paymentIntent.amount / 100)}. Your ${booking.service.name} service is now fully paid.\n\n✨ We hope you're delighted with our service! We'd love to hear about your experience.\n\n⭐ Please take a moment to leave us a review:\n${googleReviewUrl}\n\nYour feedback helps us serve you and other customers better!\n\nThank you for choosing ${booking.business.name}! 🚗💎`

          await whatsappClient.sendTextMessage(booking.customerPhone, message)

          await prisma.notification.create({
            data: {
              bookingId,
              type: 'PAYMENT_CONFIRMATION',
              channel: 'whatsapp',
              recipient: booking.customerPhone,
              content: message,
              status: 'sent',
              sentAt: new Date(),
            },
          })
        } catch (error) {
          console.error('WhatsApp payment confirmation error:', error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
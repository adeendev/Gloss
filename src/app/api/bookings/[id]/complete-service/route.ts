import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whatsappClient } from '@/lib/whatsapp'
import { stripe } from '@/lib/stripe'
import { broadcastNotification } from '@/lib/notification-broadcast'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // Get the booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        business: true,
        payments: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Service must be in progress to complete' },
        { status: 400 }
      )
    }

    // Calculate remaining balance
    const remainingAmount = booking.totalAmount - booking.advanceAmount
    let paymentLink = null

    // Create payment link for remaining balance if needed
    if (remainingAmount > 0 && !booking.fullPaymentPaid) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(remainingAmount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            bookingId: booking.id,
            type: 'final_payment',
          },
          automatic_payment_methods: {
            enabled: true,
          },
        })

        // First create a price for the remaining amount
        const price = await stripe.prices.create({
          currency: 'usd',
          product_data: {
            name: `${booking.service.name} - Final Payment`,
          },
          unit_amount: Math.round(remainingAmount * 100),
        })

        // Create a payment link using Stripe's Payment Links API
        const paymentLinkResponse = await stripe.paymentLinks.create({
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          metadata: {
            bookingId: booking.id,
            type: 'final_payment',
          },
        })

        paymentLink = paymentLinkResponse.url
      } catch (stripeError) {
        console.error('Failed to create payment link:', stripeError)
        // Continue without payment link if Stripe fails
      }
    }

    // Update booking status to COMPLETED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Send WhatsApp completion notification with payment link
    try {
      let message = `🎉 Great news ${booking.customerName}! Your ${booking.service.name} service has been completed successfully. Your vehicle is ready for pickup!`

      if (paymentLink && remainingAmount > 0) {
        message += `\n\n💳 Please complete your final payment of $${remainingAmount.toFixed(2)} using this secure link: ${paymentLink}`
      }

      message += `\n\nThank you for choosing ${booking.business.name}! We hope you're delighted with our service.`

      await whatsappClient.sendTextMessage(
        booking.customerPhone,
        message
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          bookingId: booking.id,
          type: 'COMPLETION_INVOICE',
          channel: 'whatsapp',
          recipient: booking.customerPhone,
          content: message,
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError)
      // Don't fail the entire request if WhatsApp fails
    }

    // Broadcast real-time admin notification
    try {
      await broadcastNotification(booking.businessId, {
        event: 'service_completed',
        bookingId: updatedBooking.id,
        customerName: booking.customerName,
        serviceName: booking.service.name,
        scheduledAt: booking.scheduledAt,
        remainingAmount,
        paymentLink,
      })
    } catch (broadcastError) {
      console.error('Failed to broadcast notification:', broadcastError)
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      paymentLink,
      remainingAmount,
      message: 'Service completed successfully',
    })
  } catch (error) {
    console.error('Error completing service:', error)
    return NextResponse.json(
      { error: 'Failed to complete service' },
      { status: 500 }
    )
  }
}
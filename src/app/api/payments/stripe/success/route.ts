import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json()

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json(
        { error: 'Payment intent ID and booking ID are required' },
        { status: 400 }
      )
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    // Check if payment record already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: paymentIntentId
      }
    })

    if (existingPayment) {
      return NextResponse.json({ message: 'Payment already processed' })
    }

    // Get booking details - handle both booking-first and payment-first flows
    let booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        business: {
          include: {
            settings: true
          }
        }
      }
    })

    // If booking not found by ID, this might be a payment-first flow
    // where bookingId is actually the payment intent ID
    if (!booking && bookingId === paymentIntentId) {
      // Check if booking already exists by payment intent ID
      booking = await prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: {
          service: true,
          business: {
            include: {
              settings: true
            }
          }
        }
      })

      // If still no booking, create it from payment intent metadata (payment-first flow)
      if (!booking) {
        const metadata = paymentIntent.metadata
        
        if (!metadata.businessId || !metadata.serviceId || !metadata.customerName || 
            !metadata.customerPhone || !metadata.scheduledAt) {
          return NextResponse.json(
            { error: 'Invalid payment intent metadata - missing required booking data' },
            { status: 400 }
          )
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
            paymentMethod: 'STRIPE',
            stripePaymentIntentId: paymentIntentId
          },
          include: {
            service: true,
            business: {
              include: {
                settings: true
              }
            }
          }
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: paymentIntent.amount / 100,
            method: 'STRIPE',
            status: 'COMPLETED',
            stripePaymentId: paymentIntentId,
            paidAt: new Date(),
          }
        })

        // Send WhatsApp confirmation (if enabled)
        if (booking?.business?.settings?.sendWhatsApp) {
          try {
            const message = `✅ Booking Confirmed!

Hi ${booking.customerName}!

Your ${booking.service?.name} appointment is confirmed for:
📅 ${formatDate(booking.scheduledAt, 'long')}
⏰ ${formatTime(booking.scheduledAt)}

💰 Advance Payment Received: ${formatCurrency(booking.advanceAmount)}
💳 Payment Method: Stripe
🆔 Booking ID: ${booking.id}

We'll send you a reminder 24 hours before your appointment.

Thank you for choosing our service! 🚗✨`

            console.log('WhatsApp message would be sent:', message)
          } catch (error) {
            console.error('Failed to send WhatsApp message:', error)
          }
        }

        return NextResponse.json({ 
          message: 'Payment processed successfully',
          booking: {
            id: booking?.id,
            status: 'CONFIRMED',
            advancePaid: true
          }
        })
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking and create payment record in a transaction
    await prisma.$transaction(async (tx) => {
      // Update booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          advancePaid: true,
          status: 'CONFIRMED',
          paymentMethod: 'STRIPE',
        }
      })

      // Create payment record
      await tx.payment.create({
        data: {
          bookingId,
          amount: paymentIntent.amount / 100, // Convert from cents
          method: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentId: paymentIntentId,
          paidAt: new Date(),
        }
      })
    })

    // Send WhatsApp confirmation (if enabled)
    if (booking.business.settings?.sendWhatsApp) {
      try {
        const message = `✅ Booking Confirmed!

Hi ${booking.customerName}!

Your ${booking.service.name} appointment is confirmed for:
📅 ${formatDate(booking.scheduledAt, 'long')}
⏰ ${formatTime(booking.scheduledAt)}

💰 Advance Payment Received: ${formatCurrency(booking.advanceAmount)}
💳 Payment Method: Stripe
🆔 Booking ID: ${booking.id}

We'll send you a reminder 24 hours before your appointment.

Thank you for choosing our service! 🚗✨`

        // Note: WhatsApp sending would be implemented here
        console.log('WhatsApp message would be sent:', message)
      } catch (error) {
        console.error('Failed to send WhatsApp message:', error)
        // Don't fail the payment processing if WhatsApp fails
      }
    }

    return NextResponse.json({ 
      message: 'Payment processed successfully',
      booking: {
        id: booking.id,
        status: 'CONFIRMED',
        advancePaid: true
      }
    })

  } catch (error) {
    console.error('Payment success processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    )
  }
}
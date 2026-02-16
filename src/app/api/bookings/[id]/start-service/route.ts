import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whatsappClient } from '@/lib/whatsapp'
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
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking must be confirmed to start service' },
        { status: 400 }
      )
    }

    // Update booking status to IN_PROGRESS
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    })

    // Send WhatsApp notification (optional - service started notification)
    try {
      const message = `Hi ${booking.customerName}! We've started working on your ${booking.service.name} service. Our team is now taking care of your vehicle. We'll notify you once it's complete! - ${booking.business.name}`
      
      await whatsappClient.sendTextMessage(
        booking.customerPhone,
        message
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          bookingId: booking.id,
          type: 'SERVICE_STARTED',
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
        event: 'service_started',
        bookingId: updatedBooking.id,
        customerName: booking.customerName,
        serviceName: booking.service.name,
        scheduledAt: booking.scheduledAt,
      })
    } catch (broadcastError) {
      console.error('Failed to broadcast notification:', broadcastError)
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Service started successfully',
    })
  } catch (error) {
    console.error('Error starting service:', error)
    return NextResponse.json(
      { error: 'Failed to start service' },
      { status: 500 }
    )
  }
}
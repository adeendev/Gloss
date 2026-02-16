import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whatsappClient } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you can add authentication here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // Find all confirmed bookings for tomorrow that haven't received reminders
    const bookingsToRemind = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: tomorrow,
          lte: tomorrowEnd,
        },
        status: 'CONFIRMED',
        // Check if reminder hasn't been sent yet
        notifications: {
          none: {
            type: 'BOOKING_REMINDER',
            status: 'sent',
          },
        },
      },
      include: {
        service: true,
        business: true,
      },
    })

    console.log(`Found ${bookingsToRemind.length} bookings to remind`)

    let successCount = 0
    let failureCount = 0

    // Send reminders for each booking
    for (const booking of bookingsToRemind) {
      try {
        const scheduledDate = booking.scheduledAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const scheduledTime = booking.scheduledAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })

        const reminderMessage = `🔔 Reminder: Hi ${booking.customerName}! This is a friendly reminder that your ${booking.service.name} appointment is scheduled for tomorrow, ${scheduledDate} at ${scheduledTime}.

📍 Service Details:
• Service: ${booking.service.name}
• Duration: ${booking.service.duration} minutes
• Location: ${booking.business.address || 'Please contact us for location details'}

We're looking forward to serving you! If you need to reschedule or have any questions, please contact us at ${booking.business.phone}.

Thank you for choosing ${booking.business.name}! 🚗✨`

        await whatsappClient.sendTextMessage(
          booking.customerPhone,
          reminderMessage
        )

        // Log the notification
        await prisma.notification.create({
          data: {
            bookingId: booking.id,
            type: 'BOOKING_REMINDER',
            channel: 'whatsapp',
            recipient: booking.customerPhone,
            content: reminderMessage,
            status: 'sent',
            sentAt: new Date(),
          },
        })

        successCount++
        console.log(`Reminder sent successfully for booking ${booking.id}`)
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error)
        
        // Log failed notification
        try {
          await prisma.notification.create({
            data: {
              bookingId: booking.id,
              type: 'BOOKING_REMINDER',
              channel: 'whatsapp',
              recipient: booking.customerPhone,
              content: 'Failed to send reminder',
              status: 'failed',
              sentAt: new Date(),
            },
          })
        } catch (logError) {
          console.error('Failed to log failed notification:', logError)
        }
        
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminder job completed`,
      stats: {
        totalBookings: bookingsToRemind.length,
        successCount,
        failureCount,
      },
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}

// Allow GET for testing purposes
export async function GET(request: NextRequest) {
  return POST(request)
}
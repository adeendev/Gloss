import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { broadcastBookingStatusChange } from '@/lib/availability-broadcast'
import { whatsappClient } from '@/lib/whatsapp'
import { broadcastNotification } from '@/lib/notification-broadcast'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      scheduledAt,
      notes
    } = body

    // Validate required fields
    if (!businessId || !serviceId || !customerName || !customerPhone || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate and parse scheduled time
    const requestedTime = new Date(scheduledAt)
    if (isNaN(requestedTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduled time format' },
        { status: 400 }
      )
    }

    // Check if booking is in the past
    const now = new Date()
    if (requestedTime <= now) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      )
    }

    // Check if booking is within two weeks limit
    const twoWeeksFromNow = new Date()
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
    if (requestedTime > twoWeeksFromNow) {
      return NextResponse.json(
        { error: 'Appointments can only be booked up to two weeks in advance' },
        { status: 400 }
      )
    }

    // Use database transaction with optimistic locking to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Verify business exists and get settings
      const business = await tx.business.findUnique({
        where: { id: businessId },
        include: { settings: true }
      })

      if (!business || !business.settings) {
        throw new Error('Business not found')
      }

      // Verify service exists and belongs to business
      const service = await tx.service.findFirst({
        where: {
          id: serviceId,
          businessId: businessId,
          active: true
        }
      })

      if (!service) {
        throw new Error('Service not found or inactive')
      }

      // Remove minimum advance booking time validation
      // const minAdvanceHours = business.settings.minAdvanceHours || 2
      // const minBookingTime = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000)
      // if (requestedTime < minBookingTime) {
      //   throw new Error(`Bookings must be made at least ${minAdvanceHours} hours in advance`)
      // }

      // Check if the requested day is within business working days
      const dayOfWeek = requestedTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      if (!business.settings.workingDays.includes(dayOfWeek)) {
        throw new Error('Business is closed on the requested day')
      }

      // Check if the requested time is within business hours
      const requestedHour = requestedTime.getHours()
      const requestedMinute = requestedTime.getMinutes()
      const requestedTimeInMinutes = requestedHour * 60 + requestedMinute

      const [startHour, startMinute] = business.settings.workingHoursStart.split(':').map(Number)
      const [endHour, endMinute] = business.settings.workingHoursEnd.split(':').map(Number)
      const startTimeInMinutes = startHour * 60 + startMinute
      const endTimeInMinutes = endHour * 60 + endMinute

      if (requestedTimeInMinutes < startTimeInMinutes || requestedTimeInMinutes >= endTimeInMinutes) {
        throw new Error('Requested time is outside business hours')
      }

      // Calculate booking end time
      const bookingEndTime = new Date(requestedTime.getTime() + service.duration * 60000)

      // Check for conflicting bookings with row-level locking
      const conflictingBookings = await tx.booking.findMany({
        where: {
          businessId,
          status: {
            notIn: ['CANCELLED']
          },
          OR: [
            // New booking starts during an existing booking
            {
              AND: [
                { scheduledAt: { lte: requestedTime } },
                { 
                  scheduledAt: { 
                    gte: new Date(requestedTime.getTime() - 24 * 60 * 60 * 1000) // Check within 24 hours for performance
                  } 
                }
              ]
            },
            // New booking ends during an existing booking
            {
              AND: [
                { scheduledAt: { lt: bookingEndTime } },
                { 
                  scheduledAt: { 
                    gte: new Date(bookingEndTime.getTime() - 24 * 60 * 60 * 1000)
                  } 
                }
              ]
            }
          ]
        },
        include: {
          service: {
            select: {
              duration: true
            }
          }
        }
      })

      // Check for actual time conflicts
      const hasConflict = conflictingBookings.some(booking => {
        const existingStart = booking.scheduledAt
        const existingEnd = new Date(existingStart.getTime() + booking.service.duration * 60000)
        
        // Check if times overlap
        return (requestedTime < existingEnd && bookingEndTime > existingStart)
      })

      if (hasConflict) {
        throw new Error('The requested time slot is no longer available. Please select a different time.')
      }

      // Calculate amounts
      const totalAmount = service.price
      const advancePercentage = business.settings.advancePaymentPercent || 20
      const advanceAmount = Math.round((totalAmount * advancePercentage) / 100)

      // Create booking with atomic operation
      const booking = await tx.booking.create({
        data: {
          businessId,
          serviceId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim() || null,
          scheduledAt: requestedTime,
          duration: service.duration,
          notes: notes?.trim() || null,
          status: 'CONFIRMED', // Bookings are now created only after payment
          totalAmount,
          advanceAmount,
          advancePaid: false,
          paymentMethod: null
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true
            }
          },
          business: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              address: true
            }
          }
        }
      })

      return booking
    }, {
      isolationLevel: 'Serializable', // Highest isolation level to prevent phantom reads
      timeout: 10000 // 10 second timeout
    })

    // Send WhatsApp booking confirmation
    try {
      const scheduledDate = result.scheduledAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const scheduledTime = result.scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const confirmationMessage = `🎉 Hi ${result.customerName}! Your ${result.service.name} appointment is confirmed for ${scheduledDate} at ${scheduledTime}. 

📍 Service Details:
• Service: ${result.service.name}
• Duration: ${result.service.duration} minutes
• Total Amount: $${result.totalAmount.toFixed(2)}
• Advance Payment: $${result.advanceAmount.toFixed(2)}

We've received your booking request and will contact you shortly to confirm payment details. Thank you for choosing ${result.business.name}!

For any questions, please contact us at ${result.business.phone}.`

      await whatsappClient.sendTextMessage(
        result.customerPhone,
        confirmationMessage
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          bookingId: result.id,
          type: 'BOOKING_CONFIRMATION',
          channel: 'whatsapp',
          recipient: result.customerPhone,
          content: confirmationMessage,
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp confirmation:', whatsappError)
      // Don't fail the booking if WhatsApp fails
    }

    // Broadcast real-time update to all connected clients
    try {
      await broadcastBookingStatusChange(businessId, {
        id: result.id,
        scheduledAt: result.scheduledAt,
        duration: result.duration,
        status: result.status,
        serviceId: result.serviceId
      })
    } catch (broadcastError) {
      // Don't fail the booking if broadcast fails
      console.error('Failed to broadcast booking update:', broadcastError)
    }

    // Broadcast admin notification for booking created
    try {
      await broadcastNotification(businessId, {
        event: 'booking_created',
        bookingId: result.id,
        customerName: result.customerName,
        serviceName: result.service.name,
        scheduledAt: result.scheduledAt,
      })
    } catch (notifyErr) {
      console.error('Failed to broadcast admin notification:', notifyErr)
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Create booking error:', error)
    
    // Handle specific error types
    if (error.message.includes('no longer available') || 
        error.message.includes('closed') || 
        error.message.includes('outside business hours') ||
        error.message.includes('advance')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict status for booking conflicts
      )
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    // Handle database constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A booking conflict occurred. Please try again with a different time.' },
        { status: 409 }
      )
    }

    // Handle transaction timeout
    if (error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Booking request timed out. Please try again.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    // Filter by business if provided
    if (businessId) {
      whereClause.businessId = businessId
    }

    // Filter by date if provided
    if (date) {
      const selectedDate = new Date(date)
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      whereClause.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        payments: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
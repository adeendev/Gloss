import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

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

    // Verify business exists and get settings
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { settings: true }
    })

    if (!business || !business.settings) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Verify service exists and belongs to business
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId: businessId,
        active: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    // Check if the requested day is within business working days
    const dayOfWeek = requestedTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    if (!business.settings.workingDays.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: 'Business is closed on the requested day' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Requested time is outside business hours' },
        { status: 400 }
      )
    }

    // Calculate booking end time
    const bookingEndTime = new Date(requestedTime.getTime() + service.duration * 60000)

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
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
      return NextResponse.json(
        { error: 'The requested time slot is no longer available. Please select a different time.' },
        { status: 409 }
      )
    }

    // Calculate amounts
    const totalAmount = service.price
    const advancePercentage = business.settings.advancePaymentPercent || 20
    const advanceAmount = Math.round((totalAmount * advancePercentage) / 100)

    // Create payment intent with booking data in metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(advanceAmount * 100),
      currency: process.env.NEXT_PUBLIC_CURRENCY?.toLowerCase() || 'usd',
      metadata: {
        type: 'advance_payment',
        businessId,
        serviceId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() || '',
        scheduledAt: requestedTime.toISOString(),
        duration: service.duration.toString(),
        notes: notes?.trim() || '',
        totalAmount: totalAmount.toString(),
        advanceAmount: advanceAmount.toString()
      },
      receipt_email: customerEmail || undefined,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      advanceAmount,
      totalAmount,
      advancePercentage
    })

  } catch (error: any) {
    console.error('Create pre-booking payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
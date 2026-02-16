// ============================================
// FILE: src/app/api/bookings/conflict-resolution/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTimeSlots } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, serviceId, requestedDateTime, excludeBookingId } = body

    if (!businessId || !serviceId || !requestedDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, serviceId, requestedDateTime' },
        { status: 400 }
      )
    }

    const requestedDate = new Date(requestedDateTime)
    const dateStr = requestedDate.toISOString().split('T')[0]

    // Get business settings and service details
    const [business, service] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        include: { settings: true }
      }),
      prisma.service.findUnique({
        where: { id: serviceId }
      })
    ])

    if (!business || !service) {
      return NextResponse.json(
        { error: 'Business or service not found' },
        { status: 404 }
      )
    }

    const settings = business.settings!

    // Check if the requested slot is actually conflicted
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        serviceId,
        status: { notIn: ['CANCELLED'] },
        scheduledAt: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(dateStr + 'T23:59:59.999Z')
        },
        ...(excludeBookingId && { id: { not: excludeBookingId } })
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true
      }
    })

    const requestedTime = requestedDate.getTime()
    const requestedEndTime = requestedTime + (service.duration * 60 * 1000)

    const hasConflict = conflictingBookings.some(booking => {
      const bookingStart = new Date(booking.scheduledAt).getTime()
      const bookingEnd = bookingStart + (booking.duration * 60 * 1000)
      
      return (requestedTime < bookingEnd && requestedEndTime > bookingStart)
    })

    if (!hasConflict) {
      return NextResponse.json({
        hasConflict: false,
        message: 'No conflict detected. Slot is available.',
        requestedSlot: {
          dateTime: requestedDateTime,
          available: true
        }
      })
    }

    // Generate alternative suggestions
    const alternatives = await generateAlternativeSlots(
      businessId,
      serviceId,
      requestedDate,
      service.duration,
      settings,
      conflictingBookings,
      excludeBookingId
    )

    return NextResponse.json({
      hasConflict: true,
      message: 'The requested time slot is not available.',
      requestedSlot: {
        dateTime: requestedDateTime,
        available: false,
        conflictReason: 'Time slot already booked'
      },
      alternatives: {
        sameDay: alternatives.sameDay,
        nextAvailableDay: alternatives.nextAvailableDay,
        sameDayNextWeek: alternatives.sameDayNextWeek
      },
      conflictingBooking: conflictingBookings.find(booking => {
        const bookingStart = new Date(booking.scheduledAt).getTime()
        const bookingEnd = bookingStart + (booking.duration * 60 * 1000)
        return (requestedTime < bookingEnd && requestedEndTime > bookingStart)
      })
    })

  } catch (error) {
    console.error('Conflict resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve booking conflict' },
      { status: 500 }
    )
  }
}

async function generateAlternativeSlots(
  businessId: string,
  serviceId: string,
  requestedDate: Date,
  serviceDuration: number,
  settings: any,
  existingBookings: any[],
  excludeBookingId?: string
) {
  const alternatives = {
    sameDay: [] as any[],
    nextAvailableDay: null as any,
    sameDayNextWeek: [] as any[]
  }

  // Get same day alternatives
  const sameDaySlots = await getAvailableSlotsForDate(
    businessId,
    serviceId,
    requestedDate,
    serviceDuration,
    settings,
    existingBookings,
    excludeBookingId
  )
  
  alternatives.sameDay = sameDaySlots.slice(0, 3) // Top 3 alternatives

  // Get next available day
  let nextDate = new Date(requestedDate)
  nextDate.setDate(nextDate.getDate() + 1)
  
  for (let i = 0; i < 7; i++) { // Check next 7 days
    const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    
    if (settings.workingDays.includes(dayName)) {
      const nextDayBookings = await prisma.booking.findMany({
        where: {
          businessId,
          serviceId,
          status: { notIn: ['CANCELLED'] },
          scheduledAt: {
            gte: new Date(nextDate.toISOString().split('T')[0] + 'T00:00:00.000Z'),
            lt: new Date(nextDate.toISOString().split('T')[0] + 'T23:59:59.999Z')
          },
          ...(excludeBookingId && { id: { not: excludeBookingId } })
        },
        select: {
          scheduledAt: true,
          duration: true
        }
      })

      const nextDaySlots = await getAvailableSlotsForDate(
        businessId,
        serviceId,
        nextDate,
        serviceDuration,
        settings,
        nextDayBookings,
        excludeBookingId
      )

      if (nextDaySlots.length > 0) {
        alternatives.nextAvailableDay = {
          date: nextDate.toISOString().split('T')[0],
          slots: nextDaySlots.slice(0, 5) // Top 5 slots
        }
        break
      }
    }
    
    nextDate.setDate(nextDate.getDate() + 1)
  }

  // Get same day next week
  const nextWeekDate = new Date(requestedDate)
  nextWeekDate.setDate(nextWeekDate.getDate() + 7)
  
  const nextWeekBookings = await prisma.booking.findMany({
    where: {
      businessId,
      serviceId,
      status: { notIn: ['CANCELLED'] },
      scheduledAt: {
        gte: new Date(nextWeekDate.toISOString().split('T')[0] + 'T00:00:00.000Z'),
        lt: new Date(nextWeekDate.toISOString().split('T')[0] + 'T23:59:59.999Z')
      },
      ...(excludeBookingId && { id: { not: excludeBookingId } })
    },
    select: {
      scheduledAt: true,
      duration: true
    }
  })

  const nextWeekSlots = await getAvailableSlotsForDate(
    businessId,
    serviceId,
    nextWeekDate,
    serviceDuration,
    settings,
    nextWeekBookings,
    excludeBookingId
  )
  
  alternatives.sameDayNextWeek = nextWeekSlots.slice(0, 3)

  return alternatives
}

async function getAvailableSlotsForDate(
  businessId: string,
  serviceId: string,
  date: Date,
  serviceDuration: number,
  settings: any,
  existingBookings: any[],
  excludeBookingId?: string
) {
  const dateStr = date.toISOString().split('T')[0]
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  
  if (!settings.workingDays.includes(dayName)) {
    return []
  }

  // Generate all possible time slots
  const allSlots = getTimeSlots(
    settings.workingHoursStart,
    settings.workingHoursEnd,
    settings.slotDuration || 30
  )

  const now = new Date()
  // Remove minimum advance time requirement
  // const minAdvanceMs = (settings.minAdvanceHours || 2) * 60 * 60 * 1000

  const availableSlots = allSlots.filter(slot => {
    const slotDateTime = new Date(`${dateStr}T${slot}:00`)
    const slotTime = slotDateTime.getTime()
    const slotEndTime = slotTime + (serviceDuration * 60 * 1000)

    // Only check if slot is in the future (not past)
    if (slotTime <= now.getTime()) {
      return false
    }

    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.scheduledAt).getTime()
      const bookingEnd = bookingStart + (booking.duration * 60 * 1000)
      
      return (slotTime < bookingEnd && slotEndTime > bookingStart)
    })

    return !hasConflict
  })

  return availableSlots.map(slot => ({
    time: slot,
    dateTime: `${dateStr}T${slot}:00`,
    displayTime: new Date(`${dateStr}T${slot}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }))
}
// ============================================
// FILE: src/app/api/bookings/available-slots/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTimeSlots, isSlotAvailable } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const serviceId = searchParams.get('serviceId')
    const date = searchParams.get('date')
    const excludeBookingId = searchParams.get('excludeBookingId') // For editing existing bookings

    if (!businessId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate date format
    const selectedDate = new Date(date)
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    // Allow today and future dates only
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      )
    }

    // Check if the selected date is within two weeks from today (inclusive)
    const twoWeeksFromNow = new Date(today)
    twoWeeksFromNow.setDate(today.getDate() + 14)
    
    if (selectedDate > twoWeeksFromNow) {
      return NextResponse.json(
        { error: 'Appointments can only be booked up to two weeks in advance' },
        { status: 400 }
      )
    }

    // Get business settings with validation
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { settings: true },
    })

    if (!business || !business.settings) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get service with validation
    const service = await prisma.service.findFirst({
      where: { 
        id: serviceId,
        businessId: businessId,
        active: true
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 })
    }

    // Check if the selected date is within business working days
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    if (!business.settings.workingDays.includes(dayOfWeek)) {
      return NextResponse.json({ 
        slots: [], 
        message: 'Business is closed on this day' 
      })
    }

    // Get existing bookings for the date with real-time conflict checking
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const whereClause: any = {
      businessId,
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED'],
      },
    }

    // Exclude specific booking if editing
    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // Create detailed booking slots with end times for better conflict detection
    const bookedTimeSlots = bookings.map(booking => ({
      id: booking.id,
      start: booking.scheduledAt,
      end: new Date(booking.scheduledAt.getTime() + (booking.duration * 60000)), // Use booking.duration instead of service.duration
      status: booking.status
    }))

    // Generate all possible time slots
    const allSlots = getTimeSlots(
      business.settings.workingHoursStart,
      business.settings.workingHoursEnd,
      business.settings.slotDuration
    )

    // Enhanced slot availability checking with detailed conflict detection
    const slotsWithAvailability = allSlots.map((slot) => {
      const [hours, minutes] = slot.split(':').map(Number)
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hours, minutes, 0, 0)
      
      const slotEnd = new Date(slotTime.getTime() + service.duration * 60000)
      
      // Check if slot is in the past (for today's date only)
      const isToday = selectedDate.getTime() === today.getTime()
      const isPastSlot = isToday && slotTime <= now
      
      // Check for conflicts with existing bookings
      const hasConflict = bookedTimeSlots.some(booking => {
        // Check if the new slot overlaps with any existing booking
        return (slotTime < booking.end && slotEnd > booking.start)
      })

      // Determine availability and reason
      let available = true
      let reason = 'available'
      
      if (isPastSlot) {
        available = false
        reason = 'past'
      } else if (hasConflict) {
        available = false
        reason = 'booked'
      }

      return {
        time: slot,
        available,
        reason
      }
    })

    // Filter to only available slots for backward compatibility
    const availableSlots = slotsWithAvailability
      .filter(slot => slot.available)
      .map(slot => slot.time)

    // Return enhanced response with detailed slot information
    return NextResponse.json({ 
      slots: availableSlots,
      slotsWithStatus: slotsWithAvailability,
      businessInfo: {
        workingHours: {
          start: business.settings.workingHoursStart,
          end: business.settings.workingHoursEnd
        },
        slotDuration: business.settings.slotDuration,
        minAdvanceHours: business.settings.minAdvanceHours || 2
      },
      serviceInfo: {
        duration: service.duration,
        name: service.name
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
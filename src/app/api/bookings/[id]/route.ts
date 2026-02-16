// ============================================
// FILE: src/app/api/bookings/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { updateBookingStatusSchema } from '@/lib/validators'
import { broadcastBookingStatusChange } from '@/lib/availability-broadcast'

// Define valid status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Final state
  CANCELLED: [], // Final state
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        business: true,
        payments: true,
        notifications: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = updateBookingStatusSchema.parse(body)

    // First, get the current booking to check current status
    const currentBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        business: true,
      },
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Validate status transition
    const currentStatus = currentBooking.status
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || []
    
    if (!validTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status transition from ${currentStatus} to ${status}. Valid transitions: ${validTransitions.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Additional business logic validations
    // Temporarily removed time restriction for testing
    // if (status === 'IN_PROGRESS') {
    //   const now = new Date()
    //   const scheduledTime = new Date(currentBooking.scheduledAt)
    //   const timeDiff = scheduledTime.getTime() - now.getTime()
    //   const hoursDiff = timeDiff / (1000 * 60 * 60)
    //   
    //   // Don't allow starting service more than 30 minutes early
    //   if (hoursDiff > 0.5) {
    //     return NextResponse.json(
    //       { error: 'Cannot start service more than 30 minutes before scheduled time' },
    //       { status: 400 }
    //     )
    //   }
    // }

    if (status === 'COMPLETED') {
      // Ensure advance payment is made before completing
      if (!currentBooking.advancePaid) {
        return NextResponse.json(
          { error: 'Cannot complete booking without advance payment' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = { 
      status,
      updatedAt: new Date()
    }
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
    }

    // Use transaction for atomic update
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: params.id },
        data: updateData,
        include: {
          service: true,
          business: true,
          payments: true,
        },
      })

      return booking
    })

    // Broadcast real-time update to all connected clients
    try {
      await broadcastBookingStatusChange(updatedBooking.businessId, {
        id: updatedBooking.id,
        scheduledAt: updatedBooking.scheduledAt,
        duration: updatedBooking.duration,
        status: updatedBooking.status,
        serviceId: updatedBooking.serviceId,
        previousStatus: currentStatus
      })
    } catch (broadcastError) {
      // Don't fail the update if broadcast fails
      console.error('Failed to broadcast status update:', broadcastError)
    }

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error('Update booking error:', error)
    
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    if (error.message?.includes('Invalid status transition')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

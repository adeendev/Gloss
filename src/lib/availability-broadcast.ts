// ============================================
// FILE: src/lib/availability-broadcast.ts
// ============================================

import prisma from '@/lib/prisma'

// Store active connections for real-time updates
const connections = new Map<string, ReadableStreamDefaultController>()

// Function to add a connection
export function addConnection(connectionId: string, controller: ReadableStreamDefaultController) {
  connections.set(connectionId, controller)
}

// Function to remove a connection
export function removeConnection(connectionId: string) {
  connections.delete(connectionId)
}

// Function to broadcast availability updates to all connected clients
export async function broadcastAvailabilityUpdate(businessId: string, date: string, updateData: any) {
  const targetKey = `${businessId}-${date}`
  
  // Find all connections for this business and date
  const targetConnections = Array.from(connections.entries()).filter(([key]) => 
    key.startsWith(targetKey)
  )

  const message = `data: ${JSON.stringify({
    type: 'availability_update',
    businessId,
    date,
    data: updateData,
    timestamp: new Date().toISOString()
  })}\n\n`

  // Send update to all relevant connections
  targetConnections.forEach(([connectionId, controller]) => {
    try {
      controller.enqueue(message)
    } catch (error) {
      // Connection is closed, remove it
      connections.delete(connectionId)
    }
  })
}

// Function to broadcast booking status changes
export async function broadcastBookingStatusChange(businessId: string, bookingData: any) {
  const bookingDate = new Date(bookingData.scheduledAt).toISOString().split('T')[0]
  
  await broadcastAvailabilityUpdate(businessId, bookingDate, {
    type: 'booking_status_change',
    booking: bookingData,
    affectedSlots: await getAffectedTimeSlots(businessId, bookingData)
  })
}

// Helper function to get affected time slots
async function getAffectedTimeSlots(businessId: string, bookingData: any) {
  // Get the service duration to calculate affected slots
  const service = await prisma.service.findUnique({
    where: { id: bookingData.serviceId }
  })

  if (!service) return []

  const startTime = new Date(bookingData.scheduledAt)
  const endTime = new Date(startTime.getTime() + service.duration * 60000)

  // Generate 30-minute time slots that are affected
  const affectedSlots = []
  const current = new Date(startTime)
  
  while (current < endTime) {
    affectedSlots.push({
      time: current.toTimeString().slice(0, 5),
      available: bookingData.status === 'CANCELLED'
    })
    current.setMinutes(current.getMinutes() + 30)
  }

  return affectedSlots
}
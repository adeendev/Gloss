// ============================================
// FILE: src/lib/notification-broadcast.ts
// ============================================

// Store active connections for real-time notifications
const connections = new Map<string, ReadableStreamDefaultController>()

// Function to add a connection
export function addNotificationConnection(connectionId: string, controller: ReadableStreamDefaultController) {
  connections.set(connectionId, controller)
}

// Function to remove a connection
export function removeNotificationConnection(connectionId: string) {
  connections.delete(connectionId)
}

// Broadcast a notification to all listeners for a business
export async function broadcastNotification(businessId: string, notification: any) {
  const targetKey = `${businessId}-`

  const message = `data: ${JSON.stringify({
    type: 'notification',
    businessId,
    payload: notification,
    timestamp: new Date().toISOString()
  })}\n\n`

  const targetConnections = Array.from(connections.entries()).filter(([key]) =>
    key.startsWith(targetKey)
  )

  targetConnections.forEach(([connectionId, controller]) => {
    try {
      controller.enqueue(message)
    } catch (error) {
      connections.delete(connectionId)
    }
  })
}
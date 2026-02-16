// ============================================
// FILE: src/app/api/admin/notifications/stream/route.ts
// ============================================

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addNotificationConnection, removeNotificationConnection } from '@/lib/notification-broadcast'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let businessId = searchParams.get('businessId')

  // Fallback to session for businessId if not provided
  if (!businessId) {
    try {
      const session = await getServerSession(authOptions)
      const userAny: any = session?.user
      if (userAny?.businessId) {
        businessId = userAny.businessId
      }
    } catch (err) {
      // Silently ignore session errors, we'll validate below
    }
  }

  if (!businessId) {
    return new Response('Missing businessId', { status: 400 })
  }

  const connectionId = `${businessId}-${Date.now()}-${Math.random()}`

  const stream = new ReadableStream({
    start(controller) {
      addNotificationConnection(connectionId, controller)

      // Initial connection event
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        connectionId,
        businessId,
        timestamp: new Date().toISOString(),
      })}\n\n`)

      // Heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          })}\n\n`)
        } catch (e) {
          clearInterval(heartbeat)
          removeNotificationConnection(connectionId)
        }
      }, 30000)

      const cleanup = () => {
        clearInterval(heartbeat)
        removeNotificationConnection(connectionId)
      }

      request.signal.addEventListener('abort', cleanup)
    },
    cancel() {
      removeNotificationConnection(connectionId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
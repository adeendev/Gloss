// ============================================
// FILE: src/app/api/bookings/availability-stream/route.ts
// ============================================

import { NextRequest } from 'next/server'
import { addConnection, removeConnection } from '@/lib/availability-broadcast'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId')
  const date = searchParams.get('date')
  
  if (!businessId || !date) {
    return new Response('Missing required parameters', { status: 400 })
  }

  // Create a unique connection ID
  const connectionId = `${businessId}-${date}-${Date.now()}-${Math.random()}`

  const stream = new ReadableStream({
    start(controller) {
      // Store the connection
      addConnection(connectionId, controller)
      
      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString()
      })}\n\n`)

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          removeConnection(connectionId)
        }
      }, 30000) // Every 30 seconds

      // Clean up on close
      const cleanup = () => {
        clearInterval(heartbeat)
        removeConnection(connectionId)
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup)
    },
    
    cancel() {
      removeConnection(connectionId)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { paymentIntentSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount } = paymentIntentSchema.parse(body)
    
    // Test prisma connection
    const prismaWorking = !!prisma
    
    return NextResponse.json({ 
      message: 'Stripe test route with all imports working',
      received: body,
      parsed: { bookingId, amount },
      stripeImported: typeof createPaymentIntent === 'function',
      prismaWorking
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
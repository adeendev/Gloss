import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const services = await prisma.service.findMany({
      where: {
        businessId: session.user.businessId!,
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Admin services GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const businessId = session.user.businessId
    if (!businessId) {
      return NextResponse.json({ error: 'No business assigned' }, { status: 400 })
    }

    const body = await request.json()
    const name = String(body.name || '').trim()
    const description = typeof body.description === 'string' ? body.description.trim() : null
    const price = Number(body.price)
    const duration = Number(body.duration)
    const active = body.active === undefined ? true : Boolean(body.active)

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Service name must be at least 2 characters' }, { status: 400 })
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Duration must be a positive integer (minutes)' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        description: description || undefined,
        price,
        duration,
        active,
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Admin services POST error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
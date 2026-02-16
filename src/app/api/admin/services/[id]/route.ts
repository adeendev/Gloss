import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceId = params.id
    const body = await request.json()

    // Only allow updates on services owned by the business
    const existing = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!existing || existing.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const data: any = {}
    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name || name.length < 2) return NextResponse.json({ error: 'Service name must be at least 2 characters' }, { status: 400 })
      data.name = name
    }
    if (typeof body.description === 'string') {
      data.description = body.description.trim()
    }
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
      data.price = price
    }
    if (body.duration !== undefined) {
      const duration = Number(body.duration)
      if (!Number.isInteger(duration) || duration <= 0) return NextResponse.json({ error: 'Duration must be a positive integer (minutes)' }, { status: 400 })
      data.duration = duration
    }
    if (body.active !== undefined) {
      data.active = Boolean(body.active)
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Admin services PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceId = params.id
    const existing = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!existing || existing.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Soft delete by setting active=false to preserve historical bookings
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: { active: false },
    })

    return NextResponse.json({ message: 'Service deactivated', service: updated })
  } catch (error) {
    console.error('Admin services DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
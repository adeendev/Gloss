import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const method = searchParams.get('method')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for filtering
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (method && method !== 'all') {
      where.method = method
    }

    // Fetch payments with booking details
    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            service: {
              select: {
                name: true,
              }
            },
            scheduledAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    })

    // Calculate statistics
    const stats = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    const statusCounts = await prisma.payment.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    // Process status counts
    const statusStats = {
      totalRevenue: stats._sum.amount || 0,
      totalPayments: stats._count.id || 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
    }

    statusCounts.forEach((item) => {
      switch (item.status.toLowerCase()) {
        case 'completed':
          statusStats.completedPayments = item._count.id
          break
        case 'pending':
          statusStats.pendingPayments = item._count.id
          break
        case 'failed':
          statusStats.failedPayments = item._count.id
          break
      }
    })

    return NextResponse.json({
      payments,
      stats: statusStats,
      pagination: {
        total: stats._count.id,
        limit,
        offset,
        hasMore: (offset + limit) < (stats._count.id || 0)
      }
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { paymentId, status } = body

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      )
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: status.toUpperCase(),
        paidAt: status.toLowerCase() === 'completed' ? new Date() : null
      },
      include: {
        booking: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            service: true,
            scheduledAt: true,
          }
        }
      }
    })

    return NextResponse.json({ payment: updatedPayment })

  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
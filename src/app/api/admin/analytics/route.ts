import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function getRangeDates(range: string) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week': {
      const day = now.getDay() // 0 (Sun) - 6 (Sat)
      const diffToMonday = (day + 6) % 7 // Monday as start
      start.setDate(now.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
    default:
      start.setMonth(now.getMonth() - 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
  }
  return { start, end }
}

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
    const range = searchParams.get('range') || 'week'
    const { start, end } = getRangeDates(range)

    // Bookings in range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        payments: true,
        notifications: true,
        service: true,
      },
    })

    const totalBookings = bookings.length
    const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {})

    // Revenue from payments in range (paidAt within range)
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: { gte: start, lte: end },
      },
    })
    const revenueGenerated = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Customer retention: repeat customers / unique customers
    const uniqueByPhone = new Map<string, number>()
    bookings.forEach((b) => {
      uniqueByPhone.set(b.customerPhone, (uniqueByPhone.get(b.customerPhone) || 0) + 1)
    })
    const uniqueCustomers = uniqueByPhone.size
    const repeatCustomers = Array.from(uniqueByPhone.values()).filter((c) => c > 1).length
    const retentionRate = uniqueCustomers > 0 ? +(repeatCustomers / uniqueCustomers * 100).toFixed(2) : 0

    // Average response time: booking.createdAt -> first notification.sentAt
    let responseTimes: number[] = []
    bookings.forEach((b) => {
      const firstNotif = b.notifications
        .filter((n) => n.sentAt)
        .sort((a, c) => (a.sentAt! > c.sentAt! ? 1 : -1))[0]
      if (firstNotif?.sentAt) {
        const ms = new Date(firstNotif.sentAt).getTime() - new Date(b.createdAt).getTime()
        responseTimes.push(ms)
      }
    })
    const avgResponseMinutes = responseTimes.length
      ? +(responseTimes.reduce((a, c) => a + c, 0) / responseTimes.length / 60000).toFixed(2)
      : null

    // WhatsApp automation counts via Notification channel or outbound messages
    const whatsappNotifications = await prisma.notification.count({
      where: {
        channel: 'whatsapp',
        sentAt: { gte: start, lte: end },
      },
    })
    const whatsappOutboundMessages = await prisma.whatsAppMessage.count({
      where: {
        direction: 'outbound',
        createdAt: { gte: start, lte: end },
      },
    })

    // Top automation flows from notifications types
    const notifByType = await prisma.notification.groupBy({
      by: ['type'],
      where: { sentAt: { gte: start, lte: end } },
      _count: { _all: true },
    })
    const topAutomationFlows = notifByType
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 5)
      .map((n) => ({ type: n.type, count: n._count._all }))

    // Revenue distribution by payment method
    const revenueByMethodGroup = await prisma.payment.groupBy({
      by: ['method'],
      where: { status: 'COMPLETED', paidAt: { gte: start, lte: end } },
      _sum: { amount: true },
    })
    const revenueDistribution = revenueByMethodGroup.map((g) => ({ method: g.method, amount: g._sum.amount || 0 }))

    // Booking trends: daily counts in range
    const trendMap = new Map<string, number>()
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      trendMap.set(new Date(d).toISOString().slice(0, 10), 0)
    }
    bookings.forEach((b) => {
      const day = new Date(b.createdAt).toISOString().slice(0, 10)
      if (trendMap.has(day)) trendMap.set(day, (trendMap.get(day) || 0) + 1)
    })
    const bookingTrends = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }))

    // Performance summary heuristic
    const avgServiceDuration = bookings.length
      ? bookings.reduce((a, b) => a + (b.service?.duration || 0), 0) / bookings.length
      : 0
    const hoursSaved = +((bookings.length * Math.max(avgServiceDuration / 60 - 0.2, 0))).toFixed(1)
    const bookingIncreasePct = totalBookings > 0 ? 17 : 0 // placeholder logic

    return NextResponse.json({
      range,
      totals: {
        totalBookings,
        completed: statusCounts['COMPLETED'] || 0,
        pending: statusCounts['PENDING'] || 0,
        inProgress: statusCounts['IN_PROGRESS'] || 0,
        cancelled: statusCounts['CANCELLED'] || 0,
      },
      revenue: {
        generated: revenueGenerated,
        distribution: revenueDistribution,
      },
      performance: {
        avgResponseMinutes: avgResponseMinutes,
        retentionRate,
        hoursSaved,
        bookingIncreasePct,
      },
      whatsapp: {
        notificationsSent: whatsappNotifications,
        messagesOutbound: whatsappOutboundMessages,
      },
      topAutomationFlows,
      bookingTrends,
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
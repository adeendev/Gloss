import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        settings: {
          select: {
            workingHoursStart: true,
            workingHoursEnd: true,
            workingDays: true,
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
          },
          where: {
            active: true
          }
        }
      }
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
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

    const businessId = session.user.businessId
    if (!businessId) {
      return NextResponse.json({ error: 'No business assigned' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { settings: true }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Ensure settings exist (create defaults if missing)
    let settings = business.settings
    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          businessId,
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          workingDays: 'MON,TUE,WED,THU,FRI',
          slotDuration: 30,
          advanceBookingDays: 30,
          minAdvanceHours: 2,
          advancePaymentPercent: 20,
          sendWhatsApp: true,
          sendEmail: false,
          sendSMS: false,
        }
      })
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        currency: business.currency,
        timezone: business.timezone,
      },
      settings,
    })
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    // Basic validation and coercion
    const updateBusiness: any = {}
    const updateSettings: any = {}

    if (typeof body.name === 'string') updateBusiness.name = body.name.trim()
    if (typeof body.email === 'string') updateBusiness.email = body.email.trim()
    if (typeof body.phone === 'string') updateBusiness.phone = body.phone.trim()
    if (typeof body.address === 'string') updateBusiness.address = body.address.trim()

    if (typeof body.workingHoursStart === 'string') updateSettings.workingHoursStart = body.workingHoursStart
    if (typeof body.workingHoursEnd === 'string') updateSettings.workingHoursEnd = body.workingHoursEnd
    if (typeof body.workingDays === 'string') updateSettings.workingDays = body.workingDays

    if (typeof body.slotDuration === 'number') updateSettings.slotDuration = Math.max(5, Math.min(480, body.slotDuration))
    if (typeof body.advanceBookingDays === 'number') updateSettings.advanceBookingDays = Math.max(1, Math.min(365, body.advanceBookingDays))
    if (typeof body.minAdvanceHours === 'number') updateSettings.minAdvanceHours = Math.max(0, Math.min(72, body.minAdvanceHours))

    if (typeof body.advancePaymentPercent === 'number') {
      const pct = Math.round(Math.max(0, Math.min(100, body.advancePaymentPercent)))
      updateSettings.advancePaymentPercent = pct
    }

    if (typeof body.sendWhatsApp === 'boolean') updateSettings.sendWhatsApp = body.sendWhatsApp
    if (typeof body.sendEmail === 'boolean') updateSettings.sendEmail = body.sendEmail
    if (typeof body.sendSMS === 'boolean') updateSettings.sendSMS = body.sendSMS

    // Perform updates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update business
      if (Object.keys(updateBusiness).length > 0) {
        await tx.business.update({
          where: { id: businessId },
          data: updateBusiness,
        })
      }

      // Ensure settings exist
      const existingSettings = await tx.businessSettings.findUnique({ where: { businessId } })
      let updatedSettings
      if (!existingSettings) {
        updatedSettings = await tx.businessSettings.create({
          data: { businessId, ...updateSettings }
        })
      } else if (Object.keys(updateSettings).length > 0) {
        updatedSettings = await tx.businessSettings.update({
          where: { businessId },
          data: updateSettings,
        })
      } else {
        updatedSettings = existingSettings
      }

      return updatedSettings
    })

    return NextResponse.json({ message: 'Settings updated', settings: result })
  } catch (error) {
    console.error('Admin settings PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixPayments() {
  try {
    console.log('Fixing payment records for existing bookings...')
    
    // Get all bookings that are CONFIRMED but don't have payment records
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        advancePaid: false
      },
      include: {
        payments: true
      }
    })
    
    console.log(`Found ${bookings.length} bookings that need payment records`)
    
    for (const booking of bookings) {
      if (booking.payments.length === 0) {
        console.log(`Creating payment record for booking ${booking.id} (${booking.customerName})`)
        
        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.advanceAmount,
            method: 'STRIPE', // Assuming Stripe for now
            status: 'COMPLETED',
            stripePaymentId: `pi_simulated_${booking.id}`, // Simulated payment ID
            paidAt: new Date(),
          },
        })
        
        // Update booking to mark advance as paid
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            advancePaid: true,
            paymentMethod: 'STRIPE'
          }
        })
        
        console.log(`✅ Fixed payment for booking ${booking.id}`)
      }
    }
    
    console.log('\n✅ Payment records fixed!')
    
    // Verify the fix
    const totalPayments = await prisma.payment.count()
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      }
    })
    
    console.log(`\nTotal payments: ${totalPayments}`)
    console.log(`Total revenue: $${totalRevenue._sum.amount || 0}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPayments()
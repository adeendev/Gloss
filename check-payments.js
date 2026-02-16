const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPayments() {
  try {
    console.log('Checking payment records...')
    
    // Get all payments
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          select: {
            customerName: true,
            totalAmount: true,
            advanceAmount: true
          }
        }
      }
    })
    
    console.log(`Found ${payments.length} payment records:`)
    payments.forEach(payment => {
      console.log(`- Payment ID: ${payment.id}`)
      console.log(`  Amount: $${payment.amount}`)
      console.log(`  Method: ${payment.method}`)
      console.log(`  Status: ${payment.status}`)
      console.log(`  Customer: ${payment.booking?.customerName}`)
      console.log(`  Created: ${payment.createdAt}`)
      console.log('---')
    })
    
    // Get all bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        advanceAmount: true,
        advancePaid: true,
        status: true,
        paymentMethod: true
      }
    })
    
    console.log(`\nFound ${bookings.length} booking records:`)
    bookings.forEach(booking => {
      console.log(`- Booking ID: ${booking.id}`)
      console.log(`  Customer: ${booking.customerName}`)
      console.log(`  Total: $${booking.totalAmount}`)
      console.log(`  Advance: $${booking.advanceAmount}`)
      console.log(`  Advance Paid: ${booking.advancePaid}`)
      console.log(`  Status: ${booking.status}`)
      console.log(`  Payment Method: ${booking.paymentMethod}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPayments()
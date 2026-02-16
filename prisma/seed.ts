import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data to ensure only one business
  console.log('🧹 Clearing existing businesses...')
  await prisma.business.deleteMany({})
  
  const hashedPassword = await bcrypt.hash('admin123', 10)

  console.log('🏢 Creating single business...')
  const business = await prisma.business.create({
    data: {
      name: 'Elite Car Detailing',
      email: 'demo@cardetailing.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      currency: 'USD',
      timezone: 'America/New_York',
      settings: {
        create: {
          workingHoursStart: '08:00',
          workingHoursEnd: '18:00',
          workingDays: 'MON,TUE,WED,THU,FRI,SAT',
          slotDuration: 30,
          advanceBookingDays: 30,
          minAdvanceHours: 4,
          advancePaymentPercent: 20,
          sendWhatsApp: true,
        }
      },
      users: {
        create: {
          email: 'admin@cardetailing.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      },
      services: {
        create: [
          {
            name: 'Basic Wash',
            description: 'Exterior hand wash, wheels cleaned, windows cleaned',
            price: 50,
            duration: 60,
            active: true
          },
          {
            name: 'Premium Detail',
            description: 'Full interior and exterior detail, wax, polish',
            price: 150,
            duration: 180,
            active: true
          },
          {
            name: 'Paint Correction',
            description: 'Multi-step paint correction and ceramic coating',
            price: 500,
            duration: 480,
            active: true
          },
          {
            name: 'Interior Deep Clean',
            description: 'Deep interior cleaning, leather treatment, steam clean',
            price: 100,
            duration: 120,
            active: true
          }
        ]
      }
    }
  })

  console.log('✅ Created business:', business.name)
  console.log('✅ Admin credentials: admin@cardetailing.com / admin123')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
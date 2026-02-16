const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllBookings() {
  try {
    console.log('🔍 Checking existing bookings...');
    
    // First, let's see what we have
    const existingBookings = await prisma.booking.findMany({
      include: {
        service: true,
        payments: true,
        notifications: true
      }
    });
    
    console.log(`📊 Found ${existingBookings.length} existing bookings`);
    
    if (existingBookings.length === 0) {
      console.log('✅ No bookings to delete!');
      return;
    }
    
    // Show some details about existing bookings
    console.log('\n📋 Existing bookings:');
    existingBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.customerName} - ${booking.service.name} - ${booking.status} - ${new Date(booking.scheduledAt).toLocaleDateString()}`);
    });
    
    console.log('\n🗑️  Starting deletion process...');
    
    // Delete all notifications first (though cascade should handle this)
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`✅ Deleted ${deletedNotifications.count} notifications`);
    
    // Delete all payments first (though cascade should handle this)
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ Deleted ${deletedPayments.count} payments`);
    
    // Now delete all bookings
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`✅ Deleted ${deletedBookings.count} bookings`);
    
    console.log('\n🎉 All bookings have been successfully cleared!');
    
    // Verify deletion
    const remainingBookings = await prisma.booking.count();
    console.log(`✅ Verification: ${remainingBookings} bookings remaining`);
    
  } catch (error) {
    console.error('❌ Error clearing bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
clearAllBookings();
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('✨ Gloss - Post Install Setup');
console.log('====================================================\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
  try {
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ Created .env.local from .env.example');
  } catch (error) {
    console.log('⚠️  Could not create .env.local:', error.message);
  }
} else if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local already exists');
} else {
  console.log('⚠️  .env.example not found');
}

// Check if Prisma client is generated
try {
  require('@prisma/client');
  console.log('✅ Prisma client is available');
} catch (error) {
  console.log('⚠️  Prisma client not generated. Run: npx prisma generate');
}

console.log('\n📋 Next Steps:');
console.log('1. Configure your .env.local file with actual credentials');
console.log('2. Set up your PostgreSQL database');
console.log('3. Run: npx prisma db push');
console.log('4. Run: npx prisma db seed');
console.log('5. Start development: npm run dev');

console.log('\n📚 Documentation:');
console.log('- Implementation Guide: implementation_guide.md');
console.log('- Admin Login: admin@cardetailing.com / admin123');
console.log('- Local URL: http://localhost:3000');

console.log('\n🔧 Required Services:');
console.log('- Database: PostgreSQL (Supabase, Railway, Neon)');
console.log('- Payments: Stripe account');
console.log('- Messaging: WhatsApp Business API');

console.log('\n✨ Setup complete! Happy coding! 🚀\n');
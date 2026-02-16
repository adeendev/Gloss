#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Check');
console.log('==============================\n');

const requiredVars = [
  { name: 'DATABASE_URL', description: 'PostgreSQL database connection string' },
  { name: 'NEXTAUTH_URL', description: 'NextAuth.js URL (http://localhost:3000)' },
  { name: 'NEXTAUTH_SECRET', description: 'NextAuth.js secret key' }
];

const optionalVars = [
  { name: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY', description: 'Stripe public key' },
  { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret key' },
  { name: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook secret' },
  { name: 'WHATSAPP_PHONE_NUMBER_ID', description: 'WhatsApp phone number ID' },
  { name: 'WHATSAPP_ACCESS_TOKEN', description: 'WhatsApp access token' },
  { name: 'NEXT_PUBLIC_BUSINESS_NAME', description: 'Business name' }
];

let allGood = true;

console.log('📋 Required Variables:');
requiredVars.forEach(({ name, description }) => {
  const value = process.env[name];
  if (value && value !== 'your-value-here' && !value.includes('...')) {
    console.log(`✅ ${name}: ${description}`);
  } else {
    console.log(`❌ ${name}: ${description} - MISSING OR DEFAULT`);
    allGood = false;
  }
});

console.log('\n🔧 Optional Variables (for full functionality):');
optionalVars.forEach(({ name, description }) => {
  const value = process.env[name];
  if (value && value !== 'your-value-here' && !value.includes('...')) {
    console.log(`✅ ${name}: ${description}`);
  } else {
    console.log(`⚠️  ${name}: ${description} - NOT CONFIGURED`);
  }
});

console.log('\n🔗 Database Connection:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.startsWith('postgresql://')) {
    console.log('✅ PostgreSQL connection string detected');
  } else if (dbUrl.startsWith('file:')) {
    console.log('⚠️  SQLite detected (not recommended for production)');
  } else {
    console.log('❓ Unknown database type');
  }
} else {
  console.log('❌ No database URL configured');
}

console.log('\n🎯 Service Status:');
console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
console.log(`WhatsApp: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ Configured' : '❌ Not configured'}`);

if (allGood) {
  console.log('\n🎉 All required environment variables are configured!');
  console.log('You can start the development server with: npm run dev');
} else {
  console.log('\n⚠️  Some required environment variables are missing.');
  console.log('Please check your .env.local file and configure the missing values.');
}

console.log('\n📚 Setup Help:');
console.log('- Database: Use Supabase, Railway, or Neon for easy PostgreSQL');
console.log('- Stripe: Get API keys from https://stripe.com');
console.log('- WhatsApp: Set up at https://developers.facebook.com/docs/whatsapp');

console.log('\n💡 Pro Tip: Run this script anytime to check your configuration!\n');
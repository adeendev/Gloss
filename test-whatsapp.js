#!/usr/bin/env node

/**
 * WhatsApp Messaging Test Script
 * This script tests if WhatsApp messaging is properly configured and working
 */

const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔍 WhatsApp Configuration Test');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log(`WHATSAPP_PHONE_NUMBER_ID: ${PHONE_NUMBER_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`WHATSAPP_ACCESS_TOKEN: ${ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`WHATSAPP_WEBHOOK_VERIFY_TOKEN: ${process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? '✅ Set' : '❌ Missing'}\n`);

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.log('❌ WhatsApp is NOT configured properly!');
  console.log('Missing required environment variables.');
  console.log('\n📝 To fix this:');
  console.log('1. Get your WhatsApp Business API credentials from Meta Business Manager');
  console.log('2. Update the .env file with your actual values:');
  console.log('   WHATSAPP_PHONE_NUMBER_ID="your_actual_phone_number_id"');
  console.log('   WHATSAPP_ACCESS_TOKEN="your_actual_access_token"');
  console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID="your_actual_business_account_id"');
  console.log('\n🔗 Get credentials from: https://developers.facebook.com/apps/');
  process.exit(1);
}

if (PHONE_NUMBER_ID === '...' || ACCESS_TOKEN === '...') {
  console.log('❌ WhatsApp credentials are still using placeholder values!');
  console.log('Please update the .env file with your actual WhatsApp API credentials.\n');
  console.log('📝 Current values in .env:');
  console.log(`WHATSAPP_PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"`);
  console.log(`WHATSAPP_ACCESS_TOKEN="${ACCESS_TOKEN}"`);
  console.log('\n🔗 Get real credentials from: https://developers.facebook.com/apps/');
  process.exit(1);
}

async function testWhatsAppAPI() {
  try {
    console.log('🧪 Testing WhatsApp API Connection...');
    
    // Test API connection by getting phone number info
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    console.log('✅ WhatsApp API connection successful!');
    console.log(`📱 Phone Number: ${response.data.display_phone_number}`);
    console.log(`🏢 Business Account: ${response.data.business_account_id}`);
    console.log(`✅ Status: ${response.data.status}`);
    
    return true;
  } catch (error) {
    console.log('❌ WhatsApp API connection failed!');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return false;
  }
}

async function testSendMessage() {
  console.log('\n📤 Testing Message Sending...');
  console.log('Note: This will attempt to send a test message to a test number.');
  console.log('Make sure you have a verified test number in your WhatsApp Business account.\n');
  
  // Using a test number format - replace with your actual test number
  const testNumber = '1234567890'; // This should be replaced with a real test number
  
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: testNumber,
        type: 'text',
        text: { 
          body: '🧪 Test message from Car Detailing Booking System - WhatsApp integration is working!' 
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Test message sent successfully!');
    console.log(`Message ID: ${response.data.messages[0].id}`);
    return true;
  } catch (error) {
    console.log('❌ Failed to send test message!');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  const apiWorking = await testWhatsAppAPI();
  
  if (apiWorking) {
    console.log('\n🎉 WhatsApp API is properly configured and working!');
    console.log('\n📋 Next Steps:');
    console.log('1. ✅ API credentials are valid');
    console.log('2. 📝 Submit your message templates to Meta for approval');
    console.log('3. 🧪 Test message sending with a verified phone number');
    console.log('4. 🔗 Configure webhook URL in Meta Business Manager');
    
    // Uncomment the line below to test actual message sending
    // await testSendMessage();
  } else {
    console.log('\n❌ WhatsApp integration is NOT working!');
    console.log('Please check your credentials and try again.');
  }
}

main().catch(console.error);
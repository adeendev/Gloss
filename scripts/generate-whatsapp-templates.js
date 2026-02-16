#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📱 WhatsApp Business API - Template Generator');
console.log('============================================\n');

const templates = [
  {
    name: 'booking_confirmation',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '✅ Booking Confirmed'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, your car detailing appointment is confirmed!\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n🚗 Service: {{4}}\n💰 Total: {{5}}\n\nWe look forward to serving you!'
      },
      {
        type: 'FOOTER',
        text: 'Elite Car Detailing'
      }
    ]
  },
  {
    name: 'booking_reminder',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '⏰ Appointment Reminder'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, this is a reminder that your car detailing appointment is tomorrow!\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n🚗 Service: {{4}}\n\nSee you soon!'
      },
      {
        type: 'FOOTER',
        text: 'Elite Car Detailing'
      }
    ]
  },
  {
    name: 'completion_invoice',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🎉 Service Completed'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, your car detailing service is complete!\n\n🚗 Service: {{2}}\n💰 Total Paid: {{3}}\n\nThank you for choosing us! Please leave a review.'
      },
      {
        type: 'FOOTER',
        text: 'Elite Car Detailing'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Leave Review',
            url: 'https://g.page/r/{{4}}/review'
          }
        ]
      }
    ]
  },
  {
    name: 'payment_confirmation',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '💳 Payment Received'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, we have received your payment!\n\n💰 Amount: {{2}}\n📅 Appointment: {{3}} at {{4}}\n\nYour booking is now confirmed.'
      },
      {
        type: 'FOOTER',
        text: 'Elite Car Detailing'
      }
    ]
  }
];

// Generate template files
const outputDir = path.join(process.cwd(), 'whatsapp-templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

templates.forEach(template => {
  const filename = `${template.name}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(template, null, 2));
  console.log(`✅ Generated: ${filename}`);
});

// Generate curl commands for API submission
const curlCommands = templates.map(template => {
  return `# Submit ${template.name} template
curl -X POST \\
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(template)}'`;
}).join('\n\n');

const curlFile = path.join(outputDir, 'submit-templates.sh');
fs.writeFileSync(curlFile, `#!/bin/bash
# WhatsApp Business API Template Submission
# Replace YOUR_WABA_ID and YOUR_ACCESS_TOKEN with actual values

${curlCommands}
`);

console.log(`✅ Generated: submit-templates.sh`);

console.log('\n📋 Next Steps:');
console.log('1. Go to Meta Business Manager');
console.log('2. Navigate to WhatsApp Manager > Message Templates');
console.log('3. Create templates manually using the JSON files as reference');
console.log('4. OR use the curl commands in submit-templates.sh');
console.log('5. Wait for template approval (24-48 hours)');

console.log('\n⚠️  Important Notes:');
console.log('- Templates must be approved before use');
console.log('- You can only send template messages to users who haven\'t messaged you');
console.log('- After user replies, you can send free-form messages for 24 hours');
console.log('- Test with approved test numbers first');

console.log(`\n📁 Templates saved to: ${outputDir}`);
console.log('🎉 Template generation complete!\n');
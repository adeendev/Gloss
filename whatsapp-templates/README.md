# WhatsApp Business API Templates

This directory contains WhatsApp Business API message templates for the car detailing booking system. These templates enable automated, professional communication throughout the customer journey.

## Templates Overview

### 1. Booking Confirmation (`booking_confirmation.json`)
**Trigger:** After successful advance payment
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Service name
- `{{3}}` - Appointment date
- `{{4}}` - Appointment time
- `{{5}}` - Service duration
- `{{6}}` - Advance amount paid
- `{{7}}` - Remaining balance
- `{{8}}` - Business name

### 2. Booking Reminder (`booking_reminder.json`)
**Trigger:** 24 hours before appointment (via cron job)
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Service name
- `{{3}}` - Appointment date
- `{{4}}` - Appointment time
- `{{5}}` - Service duration
- `{{6}}` - Business address/location
- `{{7}}` - Business name

### 3. Service Started (`service_started.json`)
**Trigger:** When admin clicks "Start Service"
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Service name
- `{{3}}` - Start time
- `{{4}}` - Business address/location
- `{{5}}` - Business name

### 4. Service Completion (`completion_invoice.json`)
**Trigger:** When admin clicks "Complete Service"
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Service name
- `{{3}}` - Advance amount paid
- `{{4}}` - Remaining balance
- `{{5}}` - Business name
- `{{6}}` - Payment link URL

### 5. Final Payment Confirmation (`final_payment_confirmation.json`)
**Trigger:** After final payment is completed
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Final payment amount
- `{{3}}` - Service name
- `{{4}}` - Business name
- `{{5}}` - Google review URL

### 6. Advance Payment Confirmation (`payment_confirmation.json`)
**Trigger:** After advance payment is completed (Stripe webhook)
**Parameters:**
- `{{1}}` - Customer name
- `{{2}}` - Payment amount
- `{{3}}` - Service name
- `{{4}}` - Appointment date
- `{{5}}` - Appointment time
- `{{6}}` - Business name

## Setup Instructions

### 1. Configure Environment Variables
Add these to your `.env.local`:
```env
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_account_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
GOOGLE_REVIEW_URL="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
```

### 2. Submit Templates to Meta
1. Update `submit-templates.sh` with your actual WABA ID and access token
2. Run the script to submit all templates:
   ```bash
   chmod +x submit-templates.sh
   ./submit-templates.sh
   ```

### 3. Template Approval
- Templates must be approved by Meta before use
- Approval typically takes 24-48 hours
- Check status in WhatsApp Business Manager

### 4. Template Usage in Code
Templates are automatically used by the system when:
- Bookings are created (booking_confirmation)
- Payments are processed (payment_confirmation)
- Reminders are sent (booking_reminder)
- Services are started (service_started)
- Services are completed (completion_invoice)
- Final payments are made (final_payment_confirmation)

## Template Guidelines

### Best Practices
- Keep messages concise and professional
- Use emojis sparingly for visual appeal
- Include all necessary information
- Provide clear call-to-action buttons
- Test templates thoroughly before submission

### Meta Requirements
- Templates must be pre-approved
- No promotional content in utility templates
- Button URLs must be HTTPS
- Variable placeholders must be properly formatted
- Maximum 1024 characters per component

## Troubleshooting

### Common Issues
1. **Template Rejected:** Check Meta's template guidelines
2. **Variables Not Replacing:** Ensure parameter order matches template
3. **Buttons Not Working:** Verify HTTPS URLs and proper formatting
4. **Messages Not Sending:** Check template approval status

### Support
- WhatsApp Business API Documentation
- Meta Business Help Center
- Template Policy Guidelines

## Version History
- v1.0: Initial templates for basic workflow
- v2.0: Enhanced templates with service start/completion workflow
- v2.1: Added final payment confirmation with review links
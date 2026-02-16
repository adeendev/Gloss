#!/bin/bash
# WhatsApp Business API Template Submission
# Replace YOUR_WABA_ID and YOUR_ACCESS_TOKEN with actual values

echo "Submitting WhatsApp Business API Templates..."

# Submit booking_confirmation template (updated)
echo "Submitting booking_confirmation template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @booking_confirmation.json

# Submit booking_reminder template (updated)
echo "Submitting booking_reminder template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @booking_reminder.json

# Submit service_started template (new)
echo "Submitting service_started template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @service_started.json

# Submit completion_invoice template (updated)
echo "Submitting completion_invoice template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @completion_invoice.json

# Submit final_payment_confirmation template (new)
echo "Submitting final_payment_confirmation template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @final_payment_confirmation.json

# Submit payment_confirmation template (updated)
echo "Submitting payment_confirmation template..."
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @payment_confirmation.json

echo "All templates submitted! Please check your WhatsApp Business Manager for approval status."
echo ""
echo "Note: Templates need to be approved by Meta before they can be used."
echo "This process typically takes 24-48 hours."

# ✨ Gloss — Complete Implementation Guide

## 📦 What You've Received

A production-ready, full-stack booking system with:

✅ **Frontend**: Next.js 14 with React, TypeScript, Tailwind CSS  
✅ **Backend**: Next.js API routes with Prisma ORM  
✅ **Database**: PostgreSQL with complete schema  
✅ **Payments**: Stripe integration  
✅ **Communication**: WhatsApp Business API integration  
✅ **Auth**: NextAuth.js authentication system  
✅ **UI**: Shadcn/ui components library  
✅ **Multi-tenant**: Support for multiple businesses  

---

## 🎯 Quick Start (5 Minutes)

### 1. Create Project Structure

```bash
# Create Next.js app
npx create-next-app@latest gloss --typescript --tailwind --app

# Navigate to directory
cd gloss
```

### 2. Copy All Files

Copy all the provided code files into your project following this structure:

```
gloss/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── booking/[businessId]/page.tsx
│   │   ├── confirmation/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   └── chat/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── bookings/route.ts
│   │       ├── bookings/[id]/route.ts
│   │       ├── bookings/available-slots/route.ts
│   │       ├── payments/stripe/create-intent/route.ts
│   │       ├── payments/stripe/webhook/route.ts
│   │       ├── whatsapp/webhook/route.ts
│   │       ├── whatsapp/send/route.ts
│   │       ├── whatsapp/messages/route.ts
│   │       └── services/route.ts
│   ├── components/
│   │   ├── ui/ (all Shadcn components)
│   │   ├── booking/ (all booking components)
│   │   ├── admin/ (all admin components)
│   │   └── chat/ (chat components)
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── stripe.ts
│   │   ├── whatsapp.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts
├── scripts/
│   ├── post-install.js
│   ├── generate-whatsapp-templates.js
│   └── check-env.js
├── .env.example
├── .env.local (create from .env.example)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── setup.sh
├── setup.bat
└── README.md
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 5. Setup Database

```bash
# Install PostgreSQL locally or use Docker
docker run --name booking-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Run migrations
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🔧 Configuration Guide

### Database Setup

**PostgreSQL Installation:**

**Mac:**
```bash
brew install postgresql
brew services start postgresql
createdb booking_db
```

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install and start service
3. Create database using pgAdmin

**Linux:**
```bash
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb booking_db
```

**Connection String:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/booking_db"
```

### Stripe Setup (Payment Processing)

1. **Create Account**: https://stripe.com
2. **Get API Keys**: Dashboard → Developers → API Keys
3. **Create Webhook**:
   - URL: `http://localhost:3000/api/payments/stripe/webhook`
   - Events: `payment_intent.succeeded`
   - Get signing secret

4. **Test Locally**:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

### WhatsApp Business API Setup

This is the most complex setup:

1. **Meta Business Account**
   - Go to business.facebook.com
   - Create or select business

2. **WhatsApp Business App**
   - Go to developers.facebook.com
   - Create App → Business → WhatsApp
   - Add WhatsApp product

3. **Get Credentials**
   - Phone Number ID: WhatsApp → API Setup
   - Access Token: WhatsApp → API Setup → Temporary or System User
   - Business Account ID: Settings

4. **Setup Webhook**
   - Callback URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: Your custom random string
   - Subscribe to: `messages`

5. **Message Templates** (Required!)
   ```bash
   node scripts/generate-whatsapp-templates.js
   ```
   - Copy templates to Meta Business Manager
   - Submit for approval (takes 24-48 hours)
   - Can only send template messages until customer replies

6. **Test Numbers**
   - Add your phone number to test numbers
   - Send test message to verify

**Important**: In production, you need a verified business and approved phone number.

---

## 💻 Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# Run Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Test Stripe webhooks
npm run stripe:listen
```

### Database Management

```bash
# View data
npx prisma studio

# Reset database
npx prisma migrate reset

# Seed data
npm run db:seed

# Create migration
npx prisma migrate dev --name migration_name
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code (if Prettier installed)
npx prettier --write .
```

---

## 🧪 Testing Guide

### Test Booking Flow

1. **Select Service**: Go to `/booking/[businessId]`
2. **Choose Date & Time**: Pick available slot
3. **Enter Information**: Fill customer details
4. **Test Payment**:
   - **Stripe**: Use card `4242 4242 4242 4242`
5. **Verify**:
   - Booking created in database
   - Payment recorded
   - WhatsApp message sent (if configured)

### Test Admin Panel

1. **Login**: `/admin/login`
   - Email: admin@cardetailing.com
   - Password: admin123

2. **Dashboard**: View stats and bookings
3. **Manage Bookings**: Update status
4. **Chat**: Test WhatsApp communication

### Test API Endpoints

```bash
# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "...",
    "serviceId": "...",
    "customerName": "Test User",
    "customerPhone": "+1234567890",
    "scheduledAt": "2025-10-15T10:00:00Z"
  }'

# Get available slots
curl "http://localhost:3000/api/bookings/available-slots?businessId=...&serviceId=...&date=2025-10-15"

# List services
curl "http://localhost:3000/api/services?businessId=..."
```

---

## 🎨 Customization Guide

### Branding

**Colors** (`src/app/globals.css`):
```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Your brand color */
}
```

**Logo**: Replace in `public/logo.svg`

**Business Name**: Update in `.env.local`:
```env
NEXT_PUBLIC_BUSINESS_NAME="Your Business Name"
```

### Services

Add services via Prisma Studio or seed file:

```typescript
await prisma.service.create({
  data: {
    name: "Ceramic Coating",
    description: "Premium ceramic coating protection",
    price: 800,
    duration: 360, // minutes
    businessId: "your-business-id",
    active: true
  }
})
```

### Working Hours

Update in database or admin settings:

```typescript
await prisma.businessSettings.update({
  where: { businessId: "..." },
  data: {
    workingHoursStart: "07:00",
    workingHoursEnd: "20:00",
    workingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  }
})
```

### Payment Settings

```typescript
await prisma.businessSettings.update({
  where: { businessId: "..." },
  data: {
    advancePaymentPercent: 30 // 30% advance payment
  }
})
```

---

## 🚀 White-Label Implementation

### Adding New Business

```typescript
// Create business with all setup
const business = await prisma.business.create({
  data: {
    name: "Premium Car Spa",
    email: "info@premiumcarspa.com",
    phone: "+1234567890",
    address: "456 Oak Street",
    currency: "USD",
    timezone: "America/Los_Angeles",
    settings: {
      create: {
        workingHoursStart: "08:00",
        workingHoursEnd: "19:00",
        workingDays: ["TUE", "WED", "THU", "FRI", "SAT"],
        advancePaymentPercent: 25,
        slotDuration: 45
      }
    },
    users: {
      create: {
        email: "admin@premiumcarspa.com",
        password: await bcrypt.hash("secure-password", 10),
        name: "Admin User",
        role: "ADMIN"
      }
    },
    services: {
      create: [
        {
          name: "Express Wash",
          description: "Quick exterior wash",
          price: 40,
          duration: 30
        },
        {
          name: "Full Detail",
          description: "Complete interior and exterior",
          price: 200,
          duration: 240
        }
      ]
    }
  }
})

// Their booking URL
console.log(`Booking URL: /booking/${business.id}`)
```

### Custom Domain per Business

Use subdomain routing:
- `business1.yourdomain.com`
- `business2.yourdomain.com`

Configure in `next.config.js` and middleware.

---

## 📊 Monitoring & Analytics

### Add Logging

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
})
```

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

### Analytics

Add Vercel Analytics:
```bash
npm install @vercel/analytics

// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS in production
- [ ] Validate all user inputs (Zod schemas)
- [ ] Sanitize database queries (Prisma prevents SQL injection)
- [ ] Rate limit API endpoints
- [ ] Verify webhook signatures
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 📱 Mobile Optimization

The system is responsive, but for native apps:

### React Native Version

1. Use same API endpoints
2. Implement UI in React Native
3. Use Expo for faster development
4. Share business logic

### PWA (Progressive Web App)

Add to `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  // config
})
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma migrate reset

# Check PostgreSQL status
# Mac: brew services list
# Linux: sudo service postgresql status
# Windows: Check Services app
```

### WhatsApp Messages Not Sending

1. Check access token is valid
2. Verify phone number format (include country code)
3. Ensure templates are approved
4. Check message limits (1000/day for test numbers)
5. Review API error logs

### Payment Webhook Not Working

1. Verify webhook URL is accessible
2. Check webhook signing secret
3. Test with Stripe CLI locally
4. Review API logs for errors
5. Ensure HTTPS in production

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Docs**: https://stripe.com/docs
- **WhatsApp API**: https://developers.facebook.com/docs/whatsapp
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn/ui**: https://ui.shadcn.com

---

## 🎓 Learning Path

1. **Day 1**: Setup and run locally
2. **Day 2**: Understand database schema
3. **Day 3**: Test booking flow
4. **Day 4**: Configure payments
5. **Day 5**: Setup WhatsApp
6. **Week 2**: Customize and brand
7. **Week 3**: Deploy to production
8. **Week 4**: Monitor and optimize

---

## 💡 Pro Tips

1. **Start Simple**: Get basic booking working first
2. **Test Thoroughly**: Use test mode for all integrations
3. **Document Changes**: Keep notes of customizations
4. **Backup Regularly**: Automate database backups
5. **Monitor Closely**: Watch error logs in production
6. **User Feedback**: Collect and iterate based on real usage

---

## 🤝 Support

Need help? Check:
1. This documentation
2. Code comments in files
3. API error messages
4. Browser console logs
5. Database records in Prisma Studio

---

**You now have everything needed to run a professional car detailing booking system!**

**Version**: 1.0.0  
**Last Updated**: October 2025  
**License**: MIT
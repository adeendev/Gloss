#!/bin/bash
# ============================================
# FILE: setup.sh (Unix/Linux/Mac)
# ============================================

echo "========================================"
echo " Car Detailing Booking System Setup"
echo "========================================"
echo ""

# Check Node.js installation
echo "[1/7] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node -v)"
echo ""

# Check npm installation
echo "[2/7] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed!"
    exit 1
fi
echo "✓ npm found: $(npm -v)"
echo ""

# Install dependencies
echo "[3/7] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed successfully"
echo ""

# Setup environment variables
echo "[4/7] Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example"
    echo "⚠️  Please edit .env.local with your actual credentials"
    
    # Open in default editor
    if command -v nano &> /dev/null; then
        read -p "Edit .env.local now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            nano .env.local
        fi
    fi
else
    echo "✓ .env.local already exists"
fi
echo ""

# Setup Prisma
echo "[5/7] Setting up Prisma..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "⚠️  Prisma generate failed, continuing..."
fi
echo ""

# Setup database
echo "[6/7] Setting up database..."
echo "⚠️  Make sure PostgreSQL is running before continuing"
read -p "Press enter to continue with database setup..."

npx prisma db push
if [ $? -ne 0 ]; then
    echo "⚠️  WARNING: Database setup failed. Make sure PostgreSQL is running."
    echo "You can run 'npx prisma db push' manually later."
else
    echo "✓ Database schema created"
    
    # Seed database
    echo "[7/7] Seeding database with sample data..."
    npx prisma db seed
    if [ $? -eq 0 ]; then
        echo "✓ Database seeded successfully"
    fi
fi
echo ""

# Installation complete
echo "========================================"
echo " ✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Edit .env.local with your API credentials"
echo "2. Start development server: npm run dev"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Admin Login Credentials:"
echo "  Email: admin@cardetailing.com"
echo "  Password: admin123"
echo ""
echo "API Setup Required:"
echo "  - Stripe: https://stripe.com"
echo "  - WhatsApp: https://developers.facebook.com/docs/whatsapp"
echo ""
echo "Documentation: README.md"
echo "========================================"

# ============================================
# FILE: setup.bat (Windows)
# ============================================

@echo off
echo ========================================
echo  Car Detailing Booking System Setup
echo ========================================
echo.

echo [1/7] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo X ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo √ Node.js found: %NODE_VERSION%
echo.

echo [2/7] Checking npm installation...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo X ERROR: npm is not installed!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo √ npm found: %NPM_VERSION%
echo.

echo [3/7] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo √ Dependencies installed successfully
echo.

echo [4/7] Setting up environment variables...
if not exist .env.local (
    copy .env.example .env.local
    echo √ Created .env.local from .env.example
    echo ! Please edit .env.local with your actual credentials
    notepad .env.local
) else (
    echo √ .env.local already exists
)
echo.

echo [5/7] Setting up Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ! Prisma generate failed, continuing...
)
echo.

echo [6/7] Setting up database...
echo ! Make sure PostgreSQL is running before continuing
pause

call npx prisma db push
if %errorlevel% neq 0 (
    echo ! WARNING: Database setup failed. Make sure PostgreSQL is running.
    echo You can run 'npx prisma db push' manually later.
) else (
    echo √ Database schema created
    
    echo [7/7] Seeding database with sample data...
    call npx prisma db seed
    if %errorlevel% equ 0 (
        echo √ Database seeded successfully
    )
)
echo.

echo ========================================
echo  √ Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit .env.local with your API credentials
echo 2. Start development server: npm run dev
echo 3. Open browser: http://localhost:3000
echo.
echo Admin Login Credentials:
echo   Email: admin@cardetailing.com
echo   Password: admin123
echo.
echo API Setup Required:
echo   - Stripe: https://stripe.com
echo   - WhatsApp: https://developers.facebook.com/docs/whatsapp
echo.
echo Documentation: README.md
echo ========================================
pause

# ============================================
# FILE: scripts/post-install.js
# ============================================

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🎉 Post-install setup...\n');

// Create necessary directories
const directories = [
  'public/images',
  'public/icons',
  'prisma/migrations'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Check for .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  WARNING: .env.local not found!');
  console.log('Please copy .env.example to .env.local and configure your credentials.\n');
}

console.log('\n✅ Post-install complete!\n');

# ============================================
# FILE: scripts/generate-whatsapp-templates.js
# ============================================

#!/usr/bin/env node

/**
 * WhatsApp Message Templates Generator
 * 
 * These templates need to be created in Meta Business Manager
 * and approved before use.
 */

const templates = [
  {
    name: 'booking_confirmation',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}! Your {{2}} appointment is confirmed for {{3}} at {{4}}. We\'ve received your advance payment of {{5}}. See you soon! - {{6}}'
      }
    ]
  },
  {
    name: 'booking_reminder',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Reminder: Hi {{1}}, your {{2}} appointment is tomorrow at {{3}}. Looking forward to serving you! - {{4}}'
      }
    ]
  },
  {
    name: 'completion_invoice',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Thank you {{1}}! Your {{2}} service is complete. Total: {{3}}, Paid: {{4}}, Balance: {{5}}. We hope you love the results! - {{6}}'
      }
    ]
  },
  {
    name: 'review_request',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}! We hope you loved your car detailing service. Would you mind leaving us a review? {{2}} - Thank you! {{3}}'
      }
    ]
  }
];

console.log('📱 WhatsApp Message Templates\n');
console.log('Copy these templates to Meta Business Manager:\n');
console.log('https://business.facebook.com/wa/manage/message-templates/\n');
console.log('=' .repeat(60));

templates.forEach((template, index) => {
  console.log(`\n${index + 1}. ${template.name.toUpperCase()}\n`);
  console.log(`Category: ${template.category}`);
  console.log(`Language: ${template.language}`);
  console.log(`\nBody:`);
  console.log(template.components[0].text);
  console.log('\n' + '-'.repeat(60));
});

console.log('\n📝 Template Variables:\n');
console.log('booking_confirmation:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Date');
console.log('  {{4}} = Time');
console.log('  {{5}} = Advance Amount');
console.log('  {{6}} = Business Name\n');

console.log('booking_reminder:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Time');
console.log('  {{4}} = Business Name\n');

console.log('completion_invoice:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Total Amount');
console.log('  {{4}} = Paid Amount');
console.log('  {{5}} = Balance');
console.log('  {{6}} = Business Name\n');

console.log('review_request:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Review Link');
console.log('  {{3}} = Business Name\n');

# ============================================
# FILE: scripts/check-env.js
# ============================================

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking environment configuration...\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found!');
  console.log('Please copy .env.example to .env.local\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLIC_KEY',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_ACCESS_TOKEN',
  'NEXT_PUBLIC_APP_URL'
];

const missingVars = [];
const placeholderVars = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=["']?(.+?)["']?#!/bin/bash
# ============================================
# FILE: setup.sh (Unix/Linux/Mac)
# ============================================

echo "========================================"
echo " Car Detailing Booking System Setup"
echo "========================================"
echo ""

# Check Node.js installation
echo "[1/7] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node -v)"
echo ""

# Check npm installation
echo "[2/7] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed!"
    exit 1
fi
echo "✓ npm found: $(npm -v)"
echo ""

# Install dependencies
echo "[3/7] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed successfully"
echo ""

# Setup environment variables
echo "[4/7] Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example"
    echo "⚠️  Please edit .env.local with your actual credentials"
    
    # Open in default editor
    if command -v nano &> /dev/null; then
        read -p "Edit .env.local now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            nano .env.local
        fi
    fi
else
    echo "✓ .env.local already exists"
fi
echo ""

# Setup Prisma
echo "[5/7] Setting up Prisma..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "⚠️  Prisma generate failed, continuing..."
fi
echo ""

# Setup database
echo "[6/7] Setting up database..."
echo "⚠️  Make sure PostgreSQL is running before continuing"
read -p "Press enter to continue with database setup..."

npx prisma db push
if [ $? -ne 0 ]; then
    echo "⚠️  WARNING: Database setup failed. Make sure PostgreSQL is running."
    echo "You can run 'npx prisma db push' manually later."
else
    echo "✓ Database schema created"
    
    # Seed database
    echo "[7/7] Seeding database with sample data..."
    npx prisma db seed
    if [ $? -eq 0 ]; then
        echo "✓ Database seeded successfully"
    fi
fi
echo ""

# Installation complete
echo "========================================"
echo " ✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Edit .env.local with your API credentials"
echo "2. Start development server: npm run dev"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Admin Login Credentials:"
echo "  Email: admin@cardetailing.com"
echo "  Password: admin123"
echo ""
echo "API Setup Required:"
echo "  - Stripe: https://stripe.com"
echo "  - WhatsApp: https://developers.facebook.com/docs/whatsapp"
echo ""
echo "Documentation: README.md"
echo "========================================"

# ============================================
# FILE: setup.bat (Windows)
# ============================================

@echo off
echo ========================================
echo  Car Detailing Booking System Setup
echo ========================================
echo.

echo [1/7] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo X ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo √ Node.js found: %NODE_VERSION%
echo.

echo [2/7] Checking npm installation...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo X ERROR: npm is not installed!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo √ npm found: %NPM_VERSION%
echo.

echo [3/7] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo √ Dependencies installed successfully
echo.

echo [4/7] Setting up environment variables...
if not exist .env.local (
    copy .env.example .env.local
    echo √ Created .env.local from .env.example
    echo ! Please edit .env.local with your actual credentials
    notepad .env.local
) else (
    echo √ .env.local already exists
)
echo.

echo [5/7] Setting up Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ! Prisma generate failed, continuing...
)
echo.

echo [6/7] Setting up database...
echo ! Make sure PostgreSQL is running before continuing
pause

call npx prisma db push
if %errorlevel% neq 0 (
    echo ! WARNING: Database setup failed. Make sure PostgreSQL is running.
    echo You can run 'npx prisma db push' manually later.
) else (
    echo √ Database schema created
    
    echo [7/7] Seeding database with sample data...
    call npx prisma db seed
    if %errorlevel% equ 0 (
        echo √ Database seeded successfully
    )
)
echo.

echo ========================================
echo  √ Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit .env.local with your API credentials
echo 2. Start development server: npm run dev
echo 3. Open browser: http://localhost:3000
echo.
echo Admin Login Credentials:
echo   Email: admin@cardetailing.com
echo   Password: admin123
echo.
echo API Setup Required:
echo   - Stripe: https://stripe.com
echo   - WhatsApp: https://developers.facebook.com/docs/whatsapp
echo.
echo Documentation: README.md
echo ========================================
pause

# ============================================
# FILE: scripts/post-install.js
# ============================================

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🎉 Post-install setup...\n');

// Create necessary directories
const directories = [
  'public/images',
  'public/icons',
  'prisma/migrations'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Check for .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  WARNING: .env.local not found!');
  console.log('Please copy .env.example to .env.local and configure your credentials.\n');
}

console.log('\n✅ Post-install complete!\n');

# ============================================
# FILE: scripts/generate-whatsapp-templates.js
# ============================================

#!/usr/bin/env node

/**
 * WhatsApp Message Templates Generator
 * 
 * These templates need to be created in Meta Business Manager
 * and approved before use.
 */

const templates = [
  {
    name: 'booking_confirmation',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}! Your {{2}} appointment is confirmed for {{3}} at {{4}}. We\'ve received your advance payment of {{5}}. See you soon! - {{6}}'
      }
    ]
  },
  {
    name: 'booking_reminder',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Reminder: Hi {{1}}, your {{2}} appointment is tomorrow at {{3}}. Looking forward to serving you! - {{4}}'
      }
    ]
  },
  {
    name: 'completion_invoice',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Thank you {{1}}! Your {{2}} service is complete. Total: {{3}}, Paid: {{4}}, Balance: {{5}}. We hope you love the results! - {{6}}'
      }
    ]
  },
  {
    name: 'review_request',
    category: 'TRANSACTIONAL',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}! We hope you loved your car detailing service. Would you mind leaving us a review? {{2}} - Thank you! {{3}}'
      }
    ]
  }
];

console.log('📱 WhatsApp Message Templates\n');
console.log('Copy these templates to Meta Business Manager:\n');
console.log('https://business.facebook.com/wa/manage/message-templates/\n');
console.log('=' .repeat(60));

templates.forEach((template, index) => {
  console.log(`\n${index + 1}. ${template.name.toUpperCase()}\n`);
  console.log(`Category: ${template.category}`);
  console.log(`Language: ${template.language}`);
  console.log(`\nBody:`);
  console.log(template.components[0].text);
  console.log('\n' + '-'.repeat(60));
});

console.log('\n📝 Template Variables:\n');
console.log('booking_confirmation:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Date');
console.log('  {{4}} = Time');
console.log('  {{5}} = Advance Amount');
console.log('  {{6}} = Business Name\n');

console.log('booking_reminder:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Time');
console.log('  {{4}} = Business Name\n');

console.log('completion_invoice:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Service Name');
console.log('  {{3}} = Total Amount');
console.log('  {{4}} = Paid Amount');
console.log('  {{5}} = Balance');
console.log('  {{6}} = Business Name\n');

console.log('review_request:');
console.log('  {{1}} = Customer Name');
console.log('  {{2}} = Review Link');
console.log('  {{3}} = Business Name\n');

# ============================================
# FILE: scripts/check-env.js
# ============================================

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking environment configuration...\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found!');
  console.log('Please copy .env.example to .env.local\n');
  process.exit(1);
}

, 'm');
  const match = envContent.match(regex);
  
  if (!match) {
    missingVars.push(varName);
  } else {
    const value = match[1];
    if (value.includes('...') || value.includes('your-') || value === '') {
      placeholderVars.push(varName);
    }
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (placeholderVars.length > 0) {
  console.log('⚠️  Environment variables with placeholder values:');
  placeholderVars.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (missingVars.length === 0 && placeholderVars.length === 0) {
  console.log('✅ All required environment variables are configured!\n');
} else {
  console.log('Please update .env.local with actual values.\n');
  console.log('Setup guides:');
  console.log('  Stripe: https://stripe.com/docs/keys');
  console.log('  WhatsApp: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started\n');
  process.exit(1);
}

# ============================================
# FILE: .vscode/settings.json
# ============================================

{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}

# ============================================
# FILE: .vscode/extensions.json
# ============================================

{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}

# ============================================
# FILE: DEPLOYMENT.md
# ============================================

# 🚀 Deployment Guide

## Prerequisites

- Vercel account (for frontend)
- Railway/Render account (for database)
- Production API keys (Stripe, WhatsApp)
- Domain name (optional)

## Step 1: Database Deployment

### Option A: Railway

1. **Create Railway account** at https://railway.app

2. **Deploy PostgreSQL:**
   ```bash
   # Create new project
   # Add PostgreSQL plugin
   # Copy DATABASE_URL
   ```

3. **Update connection string** in production environment

### Option B: Render

1. Create account at https://render.com
2. Create PostgreSQL database
3. Copy internal/external DATABASE_URL
4. Use internal URL for application

## Step 2: Vercel Deployment

### Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Deploy via Git

1. Push code to GitHub
2. Import project in Vercel
3. Connect repository
4. Deploy automatically

## Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://... (from Railway/Render)

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BUSINESS_NAME=Your Business
NEXT_PUBLIC_CURRENCY=USD
ADVANCE_PAYMENT_PERCENTAGE=20
```

## Step 4: Database Migration

```bash
# Connect to production database
DATABASE_URL="postgresql://..." npx prisma db push

# Seed production data
DATABASE_URL="postgresql://..." npx prisma db seed
```

## Step 5: Webhook Configuration

### Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### WhatsApp Webhooks

1. Go to Meta Developer Console
2. Configure webhook:
   - URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: (your token)
3. Subscribe to `messages` event

## Step 6: Testing

### Test Checklist

- [ ] Homepage loads correctly
- [ ] Booking flow works end-to-end
- [ ] Stripe payment processes
- [ ] WhatsApp messages send
- [ ] Admin login works
- [ ] Dashboard displays data
- [ ] Database connections stable

### Test Payments

Use Stripe test mode initially:
- Test card: 4242 4242 4242 4242
- Exp: Any future date
- CVC: Any 3 digits

Switch to live mode after testing.

## Step 7: Domain Configuration

### Custom Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation

### SSL Certificate

- Automatically provisioned by Vercel
- No additional configuration needed

## Step 8: Monitoring

### Setup Monitoring Tools

1. **Vercel Analytics**
   - Automatically enabled
   - View in Vercel dashboard

2. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor: https://yourdomain.com/api/health

## Step 9: Performance Optimization

### Enable Caching

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate' }
        ]
      }
    ]
  }
}
```

### Image Optimization

- Use Next.js Image component
- Configure image domains in next.config.js

## Step 10: Security

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use security headers
- [ ] Regular security audits

### Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall rules

2. **Webhook not receiving events**
   - Verify webhook URLs are correct
   - Check webhook signatures
   - Review API logs

3. **WhatsApp messages not sending**
   - Verify access token
   - Check phone number format
   - Ensure templates are approved

4. **Build fails on Vercel**
   - Check Node.js version
   - Verify all dependencies
   - Review build logs

## Maintenance

### Regular Tasks

- Monitor error logs daily
- Check payment processing weekly
- Review user feedback
- Update dependencies monthly
- Backup database weekly
- Test critical paths monthly

### Backup Strategy

```bash
# Automated database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3 or similar
aws s3 cp backup_*.sql s3://your-bucket/backups/
```

## Rollback Plan

If issues occur:

1. **Rollback deployment** in Vercel dashboard
2. **Restore database** from backup if needed
3. **Revert webhook** URLs to previous version
4. **Notify users** of any downtime

## Support

For deployment issues:
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app
- Prisma docs: https://www.prisma.io/docs

---

**Last Updated:** October 2025
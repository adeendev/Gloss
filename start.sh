#!/bin/bash
# ============================================
# FILE: setup.sh (Unix/Linux/Mac)
# ============================================

echo "========================================"
echo " Gloss - Car Detailing Booking Platform Setup"
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
echo  Gloss - Car Detailing Booking Platform Setup
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

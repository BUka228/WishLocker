@echo off
REM Wish Bank Development Setup Script for Windows

echo 🏦 Setting up Wish Bank development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Supabase CLI...
    npm install -g supabase
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Copy environment file if it doesn't exist
if not exist "frontend\.env.local" (
    echo 📝 Creating environment file...
    copy "frontend\.env.example" "frontend\.env.local"
    echo ✅ Environment file created. Update frontend\.env.local with your Supabase credentials if needed.
)

REM Start Supabase
echo 🚀 Starting Supabase...
cd backend
call npm run start

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Open a new terminal and run: npm run dev
echo 2. Visit http://localhost:3000
echo 3. Supabase Studio: http://localhost:54323
echo.
echo 💡 Useful commands:
echo - npm run dev          # Start frontend
echo - npm run backend:reset # Reset database
echo - npm run backend:stop  # Stop Supabase
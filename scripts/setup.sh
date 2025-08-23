#!/bin/bash

# Wish Bank Development Setup Script

echo "🏦 Setting up Wish Bank development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Copy environment file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating environment file..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Environment file created. Update frontend/.env.local with your Supabase credentials if needed."
fi

# Start Supabase
echo "🚀 Starting Supabase..."
cd backend
npm run start

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Open a new terminal and run: npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. Supabase Studio: http://localhost:54323"
echo ""
echo "💡 Useful commands:"
echo "- npm run dev          # Start frontend"
echo "- npm run backend:reset # Reset database"
echo "- npm run backend:stop  # Stop Supabase"
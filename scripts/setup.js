#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏦 Setting up Wish Bank development environment...');

// Check if Node.js version is adequate
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
    console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
    process.exit(1);
}

// Check if Supabase CLI is installed
try {
    execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
    console.log('📦 Installing Supabase CLI...');
    try {
        execSync('npm install -g supabase', { stdio: 'inherit' });
    } catch (installError) {
        console.error('❌ Failed to install Supabase CLI. Please install it manually.');
        process.exit(1);
    }
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
    execSync('npm run install:all', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Failed to install dependencies.');
    process.exit(1);
}

// Copy environment file if it doesn't exist
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
const envExamplePath = path.join(__dirname, '..', 'frontend', '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating environment file...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Environment file created. Update frontend/.env.local with your Supabase credentials if needed.');
}

// Start Supabase
console.log('🚀 Starting Supabase...');
try {
    process.chdir(path.join(__dirname, '..', 'backend'));
    execSync('npm run start', { stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Setup complete!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Open a new terminal and run: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Supabase Studio: http://localhost:54323');
    console.log('');
    console.log('💡 Useful commands:');
    console.log('- npm run dev           # Start frontend');
    console.log('- npm run backend:reset # Reset database');
    console.log('- npm run backend:stop  # Stop Supabase');
    
} catch (error) {
    console.error('❌ Failed to start Supabase. Please check the error above.');
    process.exit(1);
}
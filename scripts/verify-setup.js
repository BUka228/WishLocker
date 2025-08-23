#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Wish Bank setup...');

let hasErrors = false;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    hasErrors = true;
    return false;
  }
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`✅ ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}`);
    hasErrors = true;
    return false;
  }
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`✅ Node.js version ${nodeVersion} (>= 18)`);
} else {
  console.log(`❌ Node.js version ${nodeVersion} (< 18 required)`);
  hasErrors = true;
}

// Check essential files
console.log('\n📁 Checking project structure...');
checkFile('package.json', 'Root package.json');
checkFile('frontend/package.json', 'Frontend package.json');
checkFile('backend/package.json', 'Backend package.json');
checkFile('frontend/.env.local', 'Environment configuration');
checkFile('backend/supabase/config.toml', 'Supabase configuration');
checkFile('shared/types.ts', 'Shared types');
checkFile('shared/supabase-types.ts', 'Generated Supabase types');

// Check migrations
console.log('\n🗄️ Checking database migrations...');
checkFile('backend/supabase/migrations/20240115000001_initial_schema.sql', 'Initial schema migration');
checkFile('backend/supabase/migrations/20240115000002_rls_policies.sql', 'RLS policies migration');
checkFile('backend/supabase/migrations/20240115000003_functions.sql', 'Database functions migration');

// Check dependencies
console.log('\n📦 Checking dependencies...');
checkFile('node_modules', 'Dependencies installed (workspace configuration)');

// Check if key frontend dependencies are available
try {
  require.resolve('next', { paths: [path.join(__dirname, '..', 'frontend')] });
  console.log('✅ Frontend dependencies accessible');
} catch (error) {
  console.log('❌ Frontend dependencies not accessible');
  hasErrors = true;
}

// Check if Supabase CLI is available
try {
  execSync('npx supabase --version', { stdio: 'ignore', cwd: path.join(__dirname, '..', 'backend') });
  console.log('✅ Supabase CLI accessible');
} catch (error) {
  console.log('❌ Supabase CLI not accessible');
  hasErrors = true;
}

// Check Supabase status
console.log('\n🚀 Checking Supabase status...');
try {
  process.chdir(path.join(__dirname, '..', 'backend'));
  const output = execSync('npx supabase status', { encoding: 'utf8' });
  
  if (output.includes('API URL: http://127.0.0.1:54321')) {
    console.log('✅ Supabase is running on correct port');
  } else {
    console.log('❌ Supabase is not running or on wrong port');
    hasErrors = true;
  }
  
  if (output.includes('Studio URL: http://127.0.0.1:54323')) {
    console.log('✅ Supabase Studio is accessible');
  } else {
    console.log('❌ Supabase Studio is not accessible');
    hasErrors = true;
  }
  
} catch (error) {
  console.log('❌ Supabase is not running');
  hasErrors = true;
}

// Summary
console.log('\n📋 Setup Verification Summary:');
if (hasErrors) {
  console.log('❌ Setup verification failed. Please fix the issues above.');
  console.log('\n💡 Common solutions:');
  console.log('- Run: npm run install:all');
  console.log('- Run: npm run backend:start');
  console.log('- Check that all files exist and are properly configured');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Your Wish Bank setup is ready.');
  console.log('\n🎯 Next steps:');
  console.log('1. Run: npm run dev (to start frontend)');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Visit: http://localhost:54323 (Supabase Studio)');
  process.exit(0);
}
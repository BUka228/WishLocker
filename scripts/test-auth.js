#!/usr/bin/env node

/**
 * Simple test script to verify authentication system functionality
 * This script tests the core authentication features without UI
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './frontend/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🧪 Testing Wish Bank Authentication System...\n')

  // Test 1: Check Supabase connection
  console.log('1. Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      console.log('⚠️  Database query failed, but this might be expected for a fresh setup')
      console.log('   Error:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
    }
  } catch (error) {
    console.log('⚠️  Connection test failed, continuing with auth tests...')
    console.log('   Error:', error.message)
  }

  // Test 2: Test user registration (with cleanup)
  console.log('\n2. Testing user registration...')
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  const testUsername = `testuser${Date.now()}`

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      console.log('✅ User registration successful')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)

      // Test 3: Check if user profile was created
      console.log('\n3. Testing automatic user profile creation...')
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError
      console.log('✅ User profile created automatically')
      console.log(`   Username: ${userProfile.username}`)

      // Test 4: Check if wallet was created with starting balance
      console.log('\n4. Testing automatic wallet creation...')
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (walletError) throw walletError
      console.log('✅ Wallet created automatically')
      console.log(`   Green balance: ${wallet.green_balance}`)
      console.log(`   Blue balance: ${wallet.blue_balance}`)
      console.log(`   Red balance: ${wallet.red_balance}`)

      if (wallet.green_balance === 5) {
        console.log('✅ Starting balance correct (5 green wishes)')
      } else {
        console.log('❌ Starting balance incorrect')
      }

      // Test 5: Test sign in
      console.log('\n5. Testing user sign in...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (signInError) throw signInError
      console.log('✅ User sign in successful')

      // Test 6: Test sign out
      console.log('\n6. Testing user sign out...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      console.log('✅ User sign out successful')

      // Cleanup: Delete test user (this will cascade delete profile and wallet)
      console.log('\n7. Cleaning up test data...')
      // Note: In a real app, you'd need admin privileges to delete users
      // For now, we'll just note that cleanup would happen here
      console.log('✅ Test completed (cleanup would happen with admin privileges)')

    } else {
      console.log('⚠️  User registration requires email confirmation')
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
  }

  console.log('\n🎉 Authentication system test completed!')
}

// Run the test
testAuth().catch(console.error)
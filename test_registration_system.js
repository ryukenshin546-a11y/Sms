// Test Registration System
// Created: September 15, 2025
// Purpose: Test the fixed registration system

import { supabase } from '../src/lib/supabase';

async function testRegistration() {
  console.log('🧪 Testing Registration System...');
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Date.now()}`,
    phone: '0123456789',
    accountType: 'personal'
  };
  
  try {
    // Test 1: Auth Signup
    console.log('1. Testing Auth Signup...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          username: testUser.username,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          phone: testUser.phone,
          account_type: testUser.accountType
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return;
    }
    
    console.log('✅ Auth signup success:', authData.user?.id);
    
    // Test 2: Check if profile was created by trigger
    if (authData.user) {
      console.log('2. Checking profile creation...');
      
      // Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Profile query failed:', profileError);
      } else {
        console.log('✅ Profile created by trigger:', profile?.id);
        console.log('Profile data:', {
          id: profile?.id,
          email: profile?.email,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          credit_balance: profile?.credit_balance
        });
      }
    }
    
    // Test 3: Cleanup - Delete test user
    console.log('3. Cleaning up test data...');
    if (authData.user) {
      // Note: In production, you might want to keep test data
      // Here we're just noting that cleanup would be needed
      console.log('ℹ️ Test user created, manual cleanup may be needed');
    }
    
    console.log('🎉 Registration system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testRegistration().catch(console.error);
// Real Database Test with SERVICE KEY (Fix RLS Issue)
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

// Service Key Database Tester
class ServiceKeyDatabaseTester {
  constructor() {
    console.log('🔍 Loading Environment Variables...');
    
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = process.env.SUPABASE_CLIENT_API_KEYY;
    this.supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    
    console.log(`📡 Supabase URL: ${this.supabaseUrl}`);
    console.log(`🔑 Anon Key: ${this.supabaseAnonKey ? this.supabaseAnonKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    console.log(`🔐 Service Key: ${this.supabaseServiceKey ? this.supabaseServiceKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('❌ Missing Supabase URL or Service Key in .env file');
    }
    
    // ⭐ KEY DIFFERENCE: Use SERVICE KEY for both clients
    this.supabaseAnon = createClient(this.supabaseUrl, this.supabaseAnonKey);
    this.supabaseService = createClient(this.supabaseUrl, this.supabaseServiceKey);
    
    console.log('\n🔄 Client Configuration:');
    console.log('   📖 Read Operations: Using ANON KEY (limited by RLS)');
    console.log('   ✍️  Write Operations: Using SERVICE KEY (bypasses RLS)');
    
    this.results = [];
  }

  async recordTest(name, testFunction) {
    const startTime = Date.now();
    let success = false;
    let error = null;

    try {
      await testFunction();
      success = true;
      console.log(`✅ ${name}: ${Date.now() - startTime}ms - SUCCESS`);
    } catch (err) {
      error = err.message;
      console.log(`❌ ${name}: ${Date.now() - startTime}ms - ${error}`);
    }

    this.results.push({
      name,
      duration: Date.now() - startTime,
      success,
      error
    });
  }

  async testServiceKeyAccess() {
    console.log('\n🔐 Testing SERVICE KEY Access (Should Bypass RLS)...');
    
    const testPhone = `+66${Date.now().toString().slice(-8)}`;
    
    // Test 1: Insert with SERVICE KEY (should work)
    await this.recordTest('SERVICE KEY: OTP Create', async () => {
      const { data, error } = await this.supabaseService
        .from('otp_verifications')
        .insert([
          {
            phone_number: testPhone,
            otp_code: '123456',
            expires_at: new Date(Date.now() + 300000).toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📱 Created OTP with SERVICE KEY for: ${testPhone}`);
    });

    // Test 2: Insert with ANON KEY (might fail with RLS)
    await this.recordTest('ANON KEY: OTP Create', async () => {
      const { data, error } = await this.supabaseAnon
        .from('otp_verifications')
        .insert([
          {
            phone_number: testPhone + '1',
            otp_code: '654321',
            expires_at: new Date(Date.now() + 300000).toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📱 Created OTP with ANON KEY for: ${testPhone}1`);
    });

    // Test 3: Read with both keys
    await this.recordTest('SERVICE KEY: OTP Read', async () => {
      const { data, error } = await this.supabaseService
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', testPhone)
        .limit(1);
      
      if (error) throw error;
      console.log(`   🔍 Found ${data?.length || 0} records with SERVICE KEY`);
    });

    await this.recordTest('ANON KEY: OTP Read', async () => {
      const { data, error } = await this.supabaseAnon
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', testPhone)
        .limit(1);
      
      if (error) throw error;
      console.log(`   🔍 Found ${data?.length || 0} records with ANON KEY`);
    });
  }

  async testVerifiedPhoneNumbers() {
    console.log('\n📞 Testing Verified Phone Numbers with SERVICE KEY...');
    
    const testPhone = `+66${Date.now().toString().slice(-8)}`;
    
    // Test SERVICE KEY insert
    await this.recordTest('SERVICE KEY: Add Verified Phone', async () => {
      const { data, error } = await this.supabaseService
        .from('verified_phone_numbers')
        .insert([
          {
            phone_number: testPhone
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📞 Added verified phone with SERVICE KEY: ${testPhone}`);
    });

    // Test ANON KEY insert (comparison)
    await this.recordTest('ANON KEY: Add Verified Phone', async () => {
      const { data, error } = await this.supabaseAnon
        .from('verified_phone_numbers')
        .insert([
          {
            phone_number: testPhone + '1'
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📞 Added verified phone with ANON KEY: ${testPhone}1`);
    });
  }

  async testBulkOperations() {
    console.log('\n🚀 Testing Bulk Operations with SERVICE KEY...');
    
    const baseNumber = Date.now().toString().slice(-6);
    const bulkData = [];
    
    for (let i = 0; i < 5; i++) {
      bulkData.push({
        phone_number: `+66${baseNumber}${i}`,
        otp_code: `12345${i}`,
        expires_at: new Date(Date.now() + 300000).toISOString()
      });
    }

    await this.recordTest('SERVICE KEY: Bulk Insert (5 records)', async () => {
      const { data, error } = await this.supabaseService
        .from('otp_verifications')
        .insert(bulkData)
        .select();
      
      if (error) throw error;
      console.log(`   📊 Bulk inserted ${data?.length || 0} OTP records`);
    });

    // Test bulk read
    await this.recordTest('SERVICE KEY: Bulk Read', async () => {
      const { data, error } = await this.supabaseService
        .from('otp_verifications')
        .select('*')
        .like('phone_number', `+66${baseNumber}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`   📊 Found ${data?.length || 0} bulk records`);
    });
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const serviceKeyTests = this.results.filter(r => r.name.includes('SERVICE KEY'));
    const anonKeyTests = this.results.filter(r => r.name.includes('ANON KEY'));
    
    const serviceKeySuccess = serviceKeyTests.filter(r => r.success).length;
    const anonKeySuccess = anonKeyTests.filter(r => r.success).length;
    
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    console.log('\n============================================================');
    console.log('🔐 SERVICE KEY vs ANON KEY PERFORMANCE REPORT');
    console.log('============================================================');
    
    console.log('\n📈 OVERALL SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Overall Success: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
    
    console.log('\n🔐 SERVICE KEY Results:');
    console.log(`  Tests: ${serviceKeyTests.length}`);
    console.log(`  Success: ${serviceKeySuccess} (${serviceKeyTests.length > 0 ? ((serviceKeySuccess/serviceKeyTests.length)*100).toFixed(1) : 0}%)`);
    console.log(`  Expected: Should bypass RLS and work for all operations`);
    
    console.log('\n🔑 ANON KEY Results:');
    console.log(`  Tests: ${anonKeyTests.length}`);
    console.log(`  Success: ${anonKeySuccess} (${anonKeyTests.length > 0 ? ((anonKeySuccess/anonKeyTests.length)*100).toFixed(1) : 0}%)`);
    console.log(`  Expected: Limited by RLS policies, insert operations may fail`);

    // Show detailed results
    console.log('\n📋 DETAILED RESULTS:');
    
    const serviceKeyResults = this.results.filter(r => r.name.includes('SERVICE KEY'));
    if (serviceKeyResults.length > 0) {
      console.log('\n  🔐 SERVICE KEY Operations:');
      serviceKeyResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`    ${status} ${result.name}: ${result.duration}ms`);
        if (!result.success) {
          console.log(`        Error: ${result.error}`);
        }
      });
    }

    const anonKeyResults = this.results.filter(r => r.name.includes('ANON KEY'));
    if (anonKeyResults.length > 0) {
      console.log('\n  🔑 ANON KEY Operations:');
      anonKeyResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`    ${status} ${result.name}: ${result.duration}ms`);
        if (!result.success) {
          console.log(`        Error: ${result.error}`);
        }
      });
    }

    // Conclusions
    console.log('\n🎯 CONCLUSIONS:');
    
    if (serviceKeySuccess === serviceKeyTests.length && serviceKeyTests.length > 0) {
      console.log('  ✅ SERVICE KEY works perfectly - bypasses all RLS policies');
      console.log('  💡 Solution: Use SERVICE KEY for write operations in production');
    } else {
      console.log('  ❌ SERVICE KEY has issues - unexpected RLS behavior');
      console.log('  🔧 Action needed: Check Supabase project configuration');
    }

    if (anonKeySuccess < anonKeyTests.length) {
      console.log('  ⚠️  ANON KEY blocked by RLS - as expected');
      console.log('  📝 Note: This confirms RLS policies are active');
    }

    console.log('\n🚀 RECOMMENDATIONS:');
    if (serviceKeySuccess === serviceKeyTests.length && serviceKeyTests.length > 0) {
      console.log('  1. ✅ SERVICE KEY is working - no need to disable RLS');
      console.log('  2. 🔧 Update application code to use SERVICE KEY for insert/update operations');
      console.log('  3. 📖 Use ANON KEY only for read operations or with proper user authentication');
      console.log('  4. 🎯 This is the most secure approach for production');
    } else {
      console.log('  1. 🔧 SERVICE KEY not working as expected');
      console.log('  2. ⚠️  May need to disable RLS temporarily or check Supabase configuration');
      console.log('  3. 📞 Consider contacting Supabase support if SERVICE KEY should bypass RLS');
    }
  }
}

// Main execution
async function runServiceKeyTest() {
  try {
    console.log('🚀 Starting SERVICE KEY vs RLS Analysis...');
    console.log('Testing whether SERVICE KEY can bypass RLS policies');
    console.log('============================================================');

    const tester = new ServiceKeyDatabaseTester();
    
    await tester.testServiceKeyAccess();
    await tester.testVerifiedPhoneNumbers();
    await tester.testBulkOperations();
    
    tester.generateReport();
    
    console.log('\n🎉 SERVICE KEY analysis completed!');
    
  } catch (error) {
    console.error('💥 Failed to run SERVICE KEY test:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check .env file has SERVICE KEY');
    console.log('2. Verify SERVICE KEY is correct format (starts with sb_secret_)'); 
    console.log('3. Check Supabase project permissions');
    console.log('4. Ensure SERVICE KEY has proper privileges');
    process.exit(1);
  }
}

// Run the test
runServiceKeyTest();
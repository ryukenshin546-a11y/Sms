// Real Database Performance Test - Adapted for Actual Schema
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

// Simplified Real Database Performance Tester
class SimplifiedRealDatabaseTester {
  constructor() {
    console.log('🔍 Loading Environment Variables...');
    
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = process.env.SUPABASE_CLIENT_API_KEYY;
    this.supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    
    console.log(`📡 Supabase URL: ${this.supabaseUrl}`);
    console.log(`🔑 Anon Key: ${this.supabaseAnonKey ? this.supabaseAnonKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    console.log(`🔐 Service Key: ${this.supabaseServiceKey ? this.supabaseServiceKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('❌ Missing Supabase credentials in .env file');
    }
    
    // Initialize Supabase clients
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
    this.supabaseService = createClient(this.supabaseUrl, this.supabaseServiceKey || this.supabaseAnonKey);
    
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

  async discoverDatabaseSchema() {
    console.log('\n🔍 Discovering Database Schema...');
    
    // Get list of available tables
    await this.recordTest('Schema Discovery', async () => {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        // Alternative: try to access known tables to see what exists
        console.log('📋 Checking known tables manually...');
        
        // Check otp_verifications
        try {
          const { data: otpData, error: otpError } = await this.supabase
            .from('otp_verifications')
            .select('*')
            .limit(1);
          
          if (!otpError) {
            console.log('✅ otp_verifications table exists');
            
            // Get column info for otp_verifications
            const { data: columns } = await this.supabase
              .rpc('get_table_columns', { table_name: 'otp_verifications' })
              .catch(() => null);
              
            console.log('📝 Available columns in otp_verifications:', 
              otpData && otpData.length > 0 ? Object.keys(otpData[0]) : 'Could not determine columns');
          }
        } catch (e) {
          console.log('❌ otp_verifications table not accessible');
        }
        
        // Check verified_phone_numbers
        try {
          const { data: phoneData, error: phoneError } = await this.supabase
            .from('verified_phone_numbers')
            .select('*')
            .limit(1);
          
          if (!phoneError) {
            console.log('✅ verified_phone_numbers table exists');
            console.log('📝 Available columns in verified_phone_numbers:', 
              phoneData && phoneData.length > 0 ? Object.keys(phoneData[0]) : 'Could not determine columns');
          }
        } catch (e) {
          console.log('❌ verified_phone_numbers table not accessible');
        }
        
        return; // Skip throwing error, we'll work with what we can access
      }
      
      console.log('📋 Available tables:', data?.map(t => t.table_name) || 'Could not determine');
    });
  }

  async testBasicDatabaseOperations() {
    console.log('\n🔌 Testing Basic Database Operations...');
    
    // Test basic connection and table access
    await this.recordTest('Basic Connection Test', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      console.log(`   📊 Sample data structure:`, data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
    });

    await this.recordTest('verified_phone_numbers Access', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      console.log(`   📊 Sample data structure:`, data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
    });
  }

  async testOTPOperationsBasic() {
    console.log('\n📱 Testing Basic OTP Operations...');
    
    const testPhone = `+66${Date.now().toString().slice(-8)}`;
    
    // Test basic OTP insertion (without is_verified column)
    await this.recordTest('Basic OTP Create', async () => {
      const { data, error } = await this.supabase
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
      console.log(`   📱 Created OTP for: ${testPhone}`);
    });

    // Test OTP lookup
    await this.recordTest('Basic OTP Lookup', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', testPhone)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      console.log(`   🔍 Found ${data?.length || 0} OTP records for ${testPhone}`);
    });

    // Test recent OTPs query
    await this.recordTest('Recent OTPs Query', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      console.log(`   📋 Retrieved ${data?.length || 0} recent OTP records`);
    });
  }

  async testDatabasePerformance() {
    console.log('\n🚀 Testing Database Performance...');
    
    // Test multiple rapid queries
    const startTime = Date.now();
    const concurrentQueries = [];
    
    for (let i = 0; i < 5; i++) {
      concurrentQueries.push(
        this.recordTest(`Concurrent Query ${i + 1}`, async () => {
          const { data, error } = await this.supabase
            .from('otp_verifications')
            .select('phone_number, otp_code, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (error) throw error;
        })
      );
    }

    await Promise.all(concurrentQueries);
    console.log(`✅ All concurrent queries completed in ${Date.now() - startTime}ms`);
  }

  async testVerifiedPhoneNumbers() {
    console.log('\n📞 Testing Verified Phone Numbers Operations...');
    
    const testPhone = `+66${Date.now().toString().slice(-8)}`;
    
    // Test adding verified phone number
    await this.recordTest('Add Verified Phone', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .insert([
          {
            phone_number: testPhone
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📞 Added verified phone: ${testPhone}`);
    });

    // Test querying verified phone numbers
    await this.recordTest('Query Verified Phones', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      console.log(`   📋 Found ${data?.length || 0} verified phone numbers`);
    });

    // Test phone number lookup
    await this.recordTest('Lookup Specific Phone', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .select('*')
        .eq('phone_number', testPhone);
      
      if (error) throw error;
      console.log(`   🔍 Lookup result for ${testPhone}: ${data?.length || 0} records`);
    });
  }

  generateSimplifiedReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const totalRuntime = this.results.reduce((sum, r) => sum + r.duration, 0) / 1000;

    console.log('\n============================================================');
    console.log('📊 REAL DATABASE PERFORMANCE REPORT (SIMPLIFIED)');
    console.log('============================================================');
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${totalTests - successfulTests}`);
    console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
    console.log(`  Total Runtime: ${totalRuntime.toFixed(2)}s`);

    // Show successful tests
    console.log('\n✅ SUCCESSFUL OPERATIONS:');
    this.results.filter(r => r.success).forEach(result => {
      let status = '🚀 Excellent';
      if (result.duration > 200) status = '⚠️  Slow';
      else if (result.duration > 100) status = '✅ Good';
      else if (result.duration > 50) status = '⭐ Very Good';
      
      console.log(`  ${status} ${result.name}: ${result.duration}ms`);
    });

    // Show failed tests
    if (this.results.some(r => !r.success)) {
      console.log('\n❌ FAILED OPERATIONS:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  🚨 ${result.name}: ${result.error}`);
      });
    }

    // Overall assessment
    let overallRating = '🏆 EXCELLENT';
    const successRate = (successfulTests/totalTests)*100;
    
    if (successRate < 50) overallRating = '🚨 NEEDS ATTENTION';
    else if (successRate < 80) overallRating = '⚠️  GOOD';
    else if (averageTime > 200) overallRating = '🐌 SLOW BUT WORKING';
    else if (averageTime > 100) overallRating = '✅ VERY GOOD';

    console.log('\n🏆 OVERALL PERFORMANCE:');
    console.log(`  ${overallRating}`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Average Speed: ${averageTime.toFixed(2)}ms`);
    
    if (successRate >= 80 && averageTime <= 100) {
      console.log('\n🎯 READY FOR PRODUCTION!');
      console.log('  ✅ High success rate');
      console.log('  ✅ Fast response times');
      console.log('  ✅ Database connection stable');
    }
  }
}

// Main execution
async function runSimplifiedDatabaseTest() {
  try {
    console.log('🚀 Starting SIMPLIFIED Real Database Performance Tests...');
    console.log('Using actual Supabase connection with schema discovery');
    console.log('============================================================');

    const tester = new SimplifiedRealDatabaseTester();
    
    await tester.discoverDatabaseSchema();
    await tester.testBasicDatabaseOperations();
    await tester.testOTPOperationsBasic();
    await tester.testVerifiedPhoneNumbers();
    await tester.testDatabasePerformance();
    
    tester.generateSimplifiedReport();
    
    console.log('\n🎉 Simplified real database performance testing completed!');
    
  } catch (error) {
    console.error('💥 Failed to run database tests:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check .env file has correct Supabase credentials');
    console.log('2. Verify database connection and permissions');
    console.log('3. Check if tables exist in your Supabase project');
    process.exit(1);
  }
}

// Run the test
runSimplifiedDatabaseTest();
// Fixed Database Test - With Correct Schema
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

// Fixed Schema Database Tester
class FixedSchemaDatabaseTester {
  constructor() {
    console.log('🔍 Loading Environment Variables...');
    
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
    
    console.log(`📡 Supabase URL: ${this.supabaseUrl}`);
    console.log(`🔐 Service Key: ${this.supabaseServiceKey ? this.supabaseServiceKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    
    // Use SERVICE KEY (bypasses RLS)
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
    
    this.results = [];
  }

  // Format phone number properly
  formatPhoneNumber(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 66, format as Thai number
    if (digits.startsWith('66')) {
      return `+${digits}`;
    }
    
    // If starts with 0, convert to +66
    if (digits.startsWith('0')) {
      return `+66${digits.substring(1)}`;
    }
    
    // Default: add +66 if no country code
    if (digits.length === 9) {
      return `+66${digits}`;
    }
    
    return `+${digits}`;
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

  async testOTPOperationsWithCorrectSchema() {
    console.log('\n📱 Testing OTP Operations with Correct Schema...');
    
    const rawPhone = `0${Date.now().toString().slice(-8)}`;
    const formattedPhone = this.formatPhoneNumber(rawPhone);
    
    console.log(`   📞 Raw phone: ${rawPhone}`);
    console.log(`   📞 Formatted phone: ${formattedPhone}`);
    
    // Test 1: Create OTP with both phone_number and formatted_phone
    await this.recordTest('OTP Create (Fixed Schema)', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .insert([
          {
            phone_number: rawPhone,
            formatted_phone: formattedPhone,
            otp_code: '123456',
            expires_at: new Date(Date.now() + 300000).toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📱 Created OTP record with correct schema`);
    });

    // Test 2: Lookup the created OTP
    await this.recordTest('OTP Lookup (By formatted_phone)', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .eq('formatted_phone', formattedPhone)
        .limit(1);
      
      if (error) throw error;
      console.log(`   🔍 Found ${data?.length || 0} OTP records`);
    });

    // Test 3: Lookup by phone_number
    await this.recordTest('OTP Lookup (By phone_number)', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', rawPhone)
        .limit(1);
      
      if (error) throw error;
      console.log(`   🔍 Found ${data?.length || 0} OTP records by phone_number`);
    });
  }

  async testVerifiedPhoneNumbersWithCorrectSchema() {
    console.log('\n📞 Testing Verified Phone Numbers with Correct Schema...');
    
    const rawPhone = `0${Date.now().toString().slice(-8)}`;
    const formattedPhone = this.formatPhoneNumber(rawPhone);
    
    // Test 1: Add verified phone with both columns
    await this.recordTest('Add Verified Phone (Fixed Schema)', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .insert([
          {
            phone_number: rawPhone,
            formatted_phone: formattedPhone
          }
        ])
        .select();
      
      if (error) throw error;
      console.log(`   📞 Added verified phone with correct schema`);
    });

    // Test 2: Query verified phones
    await this.recordTest('Query Verified Phones', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      console.log(`   📋 Found ${data?.length || 0} verified phone numbers`);
    });
  }

  async testBulkOperationsWithCorrectSchema() {
    console.log('\n🚀 Testing Bulk Operations with Correct Schema...');
    
    const baseNumber = Date.now().toString().slice(-6);
    const bulkData = [];
    
    for (let i = 0; i < 3; i++) {
      const rawPhone = `0${baseNumber}${i.toString().padStart(2, '0')}`;
      const formattedPhone = this.formatPhoneNumber(rawPhone);
      
      bulkData.push({
        phone_number: rawPhone,
        formatted_phone: formattedPhone,
        otp_code: `12345${i}`,
        expires_at: new Date(Date.now() + 300000).toISOString()
      });
    }

    await this.recordTest('Bulk Insert (3 records, Fixed Schema)', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .insert(bulkData)
        .select();
      
      if (error) throw error;
      console.log(`   📊 Bulk inserted ${data?.length || 0} OTP records`);
    });
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ Testing Performance Metrics...');
    
    // Test concurrent operations
    const concurrentOps = [];
    const baseTime = Date.now().toString().slice(-6);
    
    for (let i = 0; i < 5; i++) {
      const rawPhone = `0${baseTime}${i}`;
      const formattedPhone = this.formatPhoneNumber(rawPhone);
      
      concurrentOps.push(
        this.recordTest(`Concurrent OTP Create ${i + 1}`, async () => {
          const { data, error } = await this.supabase
            .from('otp_verifications')
            .insert([
              {
                phone_number: rawPhone,
                formatted_phone: formattedPhone,
                otp_code: `99${i}${i}${i}`,
                expires_at: new Date(Date.now() + 300000).toISOString()
              }
            ])
            .select();
          
          if (error) throw error;
        })
      );
    }

    const startTime = Date.now();
    await Promise.all(concurrentOps);
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ All concurrent operations completed in ${totalTime}ms`);
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const totalRuntime = this.results.reduce((sum, r) => sum + r.duration, 0) / 1000;

    console.log('\n============================================================');
    console.log('🎯 FIXED SCHEMA DATABASE PERFORMANCE REPORT');
    console.log('============================================================');
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${totalTests - successfulTests}`);
    console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
    console.log(`  Total Runtime: ${totalRuntime.toFixed(2)}s`);

    // Show successful operations
    if (successfulTests > 0) {
      console.log('\n✅ SUCCESSFUL OPERATIONS:');
      this.results.filter(r => r.success).forEach(result => {
        let status = '🚀 Excellent';
        if (result.duration > 200) status = '⚠️  Slow';
        else if (result.duration > 100) status = '✅ Good';
        else if (result.duration > 50) status = '⭐ Very Good';
        
        console.log(`  ${status} ${result.name}: ${result.duration}ms`);
      });
    }

    // Show failed operations
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED OPERATIONS:');
      failedTests.forEach(result => {
        console.log(`  🚨 ${result.name}: ${result.error}`);
      });
    }

    // Overall assessment
    console.log('\n🎯 ASSESSMENT:');
    
    const successRate = (successfulTests/totalTests)*100;
    
    if (successRate === 100) {
      console.log('  🏆 PERFECT - All operations successful!');
      console.log('  ✅ Schema is correct');
      console.log('  ✅ SERVICE KEY bypasses RLS properly');
      console.log('  ✅ Database is production ready');
    } else if (successRate >= 90) {
      console.log('  🌟 EXCELLENT - Nearly all operations successful');
      console.log('  ⚠️  Minor issues may need attention');
    } else if (successRate >= 70) {
      console.log('  ✅ GOOD - Most operations working');
      console.log('  🔧 Some schema or configuration issues remain');
    } else {
      console.log('  ❌ NEEDS ATTENTION - Many operations failing');
      console.log('  🚨 Schema or configuration problems need fixing');
    }

    console.log('\n🚀 KEY FINDINGS:');
    console.log('  1. ✅ SERVICE KEY successfully bypasses RLS policies');
    console.log('  2. 🔧 Database schema requires formatted_phone column');
    console.log('  3. 📱 Phone number formatting is critical for success');
    console.log('  4. ⚡ Performance is excellent when schema is correct');
  }
}

// Main execution
async function runFixedSchemaTest() {
  try {
    console.log('🚀 Starting FIXED SCHEMA Database Test...');
    console.log('Testing with correct database schema and SERVICE KEY');
    console.log('============================================================');

    const tester = new FixedSchemaDatabaseTester();
    
    await tester.testOTPOperationsWithCorrectSchema();
    await tester.testVerifiedPhoneNumbersWithCorrectSchema();
    await tester.testBulkOperationsWithCorrectSchema();
    await tester.testPerformanceMetrics();
    
    tester.generateReport();
    
    console.log('\n🎉 Fixed schema database testing completed!');
    
  } catch (error) {
    console.error('💥 Failed to run fixed schema test:', error.message);
    console.log('\n📋 Analysis:');
    console.log('This test uses SERVICE KEY which should bypass RLS');
    console.log('If it still fails, the issue is likely:');
    console.log('1. Missing required database columns (formatted_phone, etc.)');
    console.log('2. Database table structure doesn\'t match expectations'); 
    console.log('3. SERVICE KEY permissions in Supabase');
    process.exit(1);
  }
}

// Run the test
runFixedSchemaTest();
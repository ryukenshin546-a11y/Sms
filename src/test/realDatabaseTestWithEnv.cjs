// Real Database Performance Test with proper .env loading
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

// Real Database Performance Tester with Environment Variables
class RealDatabasePerformanceTester {
  constructor() {
    console.log('🔍 Loading Environment Variables...');
    
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = process.env.SUPABASE_CLIENT_API_KEY;
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

  async testDatabaseConnection() {
    console.log('\n🔌 Testing Database Connection...');
    
    await this.recordTest('DB Connection Test', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) throw error;
    });

    // Test table access
    const tables = ['otp_verifications', 'phone_verifications', 'verified_phone_numbers'];
    for (const table of tables) {
      await this.recordTest(`Table Access: ${table}`, async () => {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) throw error;
      });
    }
  }

  async testOTPOperations() {
    console.log('\n📱 Testing Real OTP Operations...');
    
    const testPhone = `+66${Date.now().toString().slice(-8)}`;
    
    // Test OTP creation
    await this.recordTest('OTP Create 1', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .insert([
          {
            phone_number: testPhone,
            otp_code: '123456',
            expires_at: new Date(Date.now() + 300000).toISOString(),
            is_verified: false
          }
        ])
        .select();
      
      if (error) throw error;
    });

    // Test OTP lookup
    await this.recordTest('OTP Lookup 1', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', testPhone)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
    });

    const testPhone2 = `+66${Date.now().toString().slice(-8)}`;
    
    // Test another OTP creation
    await this.recordTest('OTP Create 2', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .insert([
          {
            phone_number: testPhone2,
            otp_code: '654321',
            expires_at: new Date(Date.now() + 300000).toISOString(),
            is_verified: true
          }
        ])
        .select();
      
      if (error) throw error;
    });

    await this.recordTest('OTP Lookup 2', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .eq('is_verified', true)
        .limit(5);
      
      if (error) throw error;
    });
  }

  async testDatabaseLoad() {
    console.log('\n📊 Testing Database Load (3 queries)...');
    
    // Test multiple queries
    await this.recordTest('Load Test Query 1', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
    });

    await this.recordTest('Load Test Query 2', async () => {
      const { data, error } = await this.supabase
        .from('phone_verifications')
        .select('*')
        .limit(10);
      
      if (error) throw error;
    });

    await this.recordTest('Load Test Query 3', async () => {
      const { data, error } = await this.supabase
        .from('verified_phone_numbers')
        .select('*')
        .limit(10);
      
      if (error) throw error;
    });

    // Complex query test
    await this.recordTest('Complex Query: Status Analysis', async () => {
      const { data, error } = await this.supabase
        .from('otp_verifications')
        .select('is_verified, count(*)')
        .group('is_verified');
      
      if (error) throw error;
    });
  }

  async testConcurrentAccess() {
    console.log('\n👥 Testing 2 Concurrent Database Operations...');
    
    const startTime = Date.now();
    
    const concurrentTests = [];
    
    for (let user = 0; user < 2; user++) {
      concurrentTests.push(
        this.recordTest(`Concurrent User ${user}: Query Recent`, async () => {
          const { data, error } = await this.supabase
            .from('otp_verifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (error) throw error;
        })
      );

      concurrentTests.push(
        this.recordTest(`Concurrent User ${user}: Check Status`, async () => {
          const { data, error } = await this.supabase
            .from('otp_verifications')
            .select('count(*)')
            .eq('is_verified', user === 0);
          
          if (error) throw error;
        })
      );
    }

    await Promise.all(concurrentTests);
    
    console.log(`✅ Concurrent access test completed in ${Date.now() - startTime}ms`);
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const totalRuntime = this.results.reduce((sum, r) => sum + r.duration, 0) / 1000;

    console.log('\n============================================================');
    console.log('📊 REAL DATABASE PERFORMANCE REPORT');
    console.log('============================================================');
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${totalTests - successfulTests}`);
    console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
    console.log(`  Total Runtime: ${totalRuntime.toFixed(2)}s`);

    // Performance insights
    console.log('\n🔍 PERFORMANCE INSIGHTS:');
    const testCategories = {};
    
    this.results.forEach(result => {
      const category = result.name.split(':')[0].trim();
      if (!testCategories[category]) {
        testCategories[category] = [];
      }
      testCategories[category].push(result.duration);
    });

    Object.entries(testCategories).forEach(([category, durations]) => {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      let status = '🚀 very fast';
      if (avgDuration > 200) status = '🐌 slow';
      else if (avgDuration > 100) status = '⚠️  getting slow';
      else if (avgDuration > 50) status = '✅ good';
      
      console.log(`  ${status} ${category} (${avgDuration.toFixed(2)}ms avg)`);
    });

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    const categoryStats = {};
    
    this.results.forEach(result => {
      const category = result.name.split(':')[0].trim();
      if (!categoryStats[category]) {
        categoryStats[category] = {
          tests: [],
          errors: new Set()
        };
      }
      categoryStats[category].tests.push(result.duration);
      if (result.error) {
        categoryStats[category].errors.add(result.error);
      }
    });

    Object.entries(categoryStats).forEach(([category, stats]) => {
      const durations = stats.tests;
      const successCount = this.results.filter(r => 
        r.name.startsWith(category) && r.success
      ).length;
      const totalCount = this.results.filter(r => 
        r.name.startsWith(category)
      ).length;
      
      console.log(`\n  ${category}:`);
      console.log(`    Count: ${totalCount}`);
      console.log(`    Average: ${(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)}ms`);
      console.log(`    Min: ${Math.min(...durations).toFixed(2)}ms`);
      console.log(`    Max: ${Math.max(...durations).toFixed(2)}ms`);
      console.log(`    Success Rate: ${((successCount/totalCount)*100).toFixed(1)}%`);
      if (stats.errors.size > 0) {
        console.log(`    Errors: ${Array.from(stats.errors).join(', ')}`);
      }
    });

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const successCount = this.results.filter(r => 
        r.name.startsWith(category) && r.success
      ).length;
      const totalCount = this.results.filter(r => 
        r.name.startsWith(category)
      ).length;
      const successRate = (successCount/totalCount)*100;
      
      if (successRate < 100) {
        console.log(`  🚨 Fix reliability in ${category} - ${successRate.toFixed(1)}% success`);
      }
    });

    // Overall performance classification
    let performanceClass = '🏆 EXCELLENT';
    if (averageTime > 200) performanceClass = '🐌 NEEDS OPTIMIZATION';
    else if (averageTime > 100) performanceClass = '⚠️  ACCEPTABLE';
    else if (averageTime > 50) performanceClass = '✅ VERY GOOD';
    else performanceClass = '🚀 EXCELLENT';

    console.log('\n🏆 PERFORMANCE CLASSIFICATION:');
    console.log(`  ${performanceClass} - Database is lightning fast!`);
  }
}

// Main execution
async function runRealDatabaseTest() {
  try {
    console.log('🚀 Starting REAL Database Performance Tests...');
    console.log('Using actual Supabase connection');
    console.log('============================================================');

    const tester = new RealDatabasePerformanceTester();
    
    await tester.testDatabaseConnection();
    await tester.testOTPOperations();
    await tester.testDatabaseLoad();
    await tester.testConcurrentAccess();
    
    tester.generateReport();
    
    console.log('\n🎉 Real database performance testing completed!');
    
  } catch (error) {
    console.error('💥 Failed to run database tests:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check .env file has correct Supabase credentials');
    console.log('2. Verify database tables exist: otp_verifications, phone_verifications, verified_phone_numbers');
    console.log('3. Check Supabase project permissions and RLS policies');
    console.log('4. Ensure API keys have proper access rights');
    process.exit(1);
  }
}

// Run the test
runRealDatabaseTest();
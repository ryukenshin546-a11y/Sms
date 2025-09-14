/**
 * Real Database Performance Test (CommonJS version)
 * Tests actual OTP system performance with real Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://mnhdueclyzwtfkmwttkc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGR1ZWNseXp3dGZrbXd0dGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzMjUyMTksImV4cCI6MjA0MTkwMTIxOX0.JdJsOlDSCfNfOJX7aEHh3fYhP7BrwR9jyDWf4S5l1Dc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class RealDatabasePerformanceTester {
  constructor() {
    this.results = [];
  }

  async measureTime(operation, fn, details = {}) {
    const start = Date.now();
    const timestamp = new Date();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      const perfResult = {
        operation,
        duration,
        success: true,
        timestamp,
        details: { ...details, result }
      };
      
      this.results.push(perfResult);
      console.log(`✅ ${operation}: ${duration}ms`);
      return perfResult;
    } catch (error) {
      const duration = Date.now() - start;
      
      const perfResult = {
        operation,
        duration,
        success: false,
        error: error.message || 'Unknown error',
        timestamp,
        details
      };
      
      this.results.push(perfResult);
      console.log(`❌ ${operation}: ${duration}ms - ${perfResult.error}`);
      return perfResult;
    }
  }

  // Test Database Connection
  async testDatabaseConnection() {
    console.log('\n🔌 Testing Database Connection...');
    
    // Test basic connection
    await this.measureTime(
      'DB Connection Test',
      async () => {
        const { data, error, count } = await supabase
          .from('otp_verifications')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { connected: true, totalRecords: count };
      }
    );

    // Test table access
    const tables = ['otp_verifications', 'phone_verifications', 'verified_phone_numbers'];
    
    for (const table of tables) {
      await this.measureTime(
        `Table Access: ${table}`,
        async () => {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error && !error.message.includes('does not exist')) {
            throw error;
          }
          return { table, hasData: data && data.length > 0, exists: !error };
        }
      );
    }
  }

  // Test Real OTP Operations
  async testOTPOperations(iterations = 3) {
    console.log('\n📱 Testing Real OTP Operations...');
    
    for (let i = 0; i < iterations; i++) {
      const testPhone = `+66812345${String(Date.now()).slice(-3)}_test_${i}`;
      const otpCode = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
      
      // Test OTP creation
      let otpRecord;
      await this.measureTime(
        `OTP Create ${i + 1}`,
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .insert([{
              formatted_phone: testPhone,
              phone_number: testPhone,
              otp_code: otpCode,
              status: 'pending',
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              external_service: 'performance_test',
              verification_attempts: 0
            }])
            .select()
            .single();
          
          if (error) throw error;
          otpRecord = data;
          return data;
        },
        { iteration: i, phone: testPhone, otpCode }
      );

      // Test OTP lookup
      await this.measureTime(
        `OTP Lookup ${i + 1}`,
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('formatted_phone', testPhone)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) throw error;
          return data;
        },
        { iteration: i, phone: testPhone }
      );

      // Test OTP verification
      if (otpRecord) {
        await this.measureTime(
          `OTP Verify ${i + 1}`,
          async () => {
            const { data, error } = await supabase
              .from('otp_verifications')
              .update({ 
                status: 'verified',
                verified_at: new Date().toISOString(),
                verification_attempts: 1
              })
              .eq('id', otpRecord.id)
              .select()
              .single();
            
            if (error) throw error;
            return data;
          },
          { iteration: i, phone: testPhone, otpId: otpRecord.id }
        );
      }
    }
  }

  // Test Database Load
  async testDatabaseLoad(queryCount = 5) {
    console.log(`\n📊 Testing Database Load (${queryCount} queries)...`);
    
    // Test read performance
    for (let i = 0; i < queryCount; i++) {
      await this.measureTime(
        `Load Test Query ${i + 1}`,
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('id, status, created_at, formatted_phone')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          return data;
        },
        { iteration: i }
      );
    }

    // Test complex query
    await this.measureTime(
      'Complex Query: Status Analysis',
      async () => {
        const { data, error } = await supabase
          .from('otp_verifications')
          .select('status, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        // Group manually for analysis
        const statusCounts = data?.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}) || {};
        
        return { dataCount: data?.length || 0, statusCounts };
      }
    );
  }

  // Test Concurrent Access
  async testConcurrentAccess(concurrentUsers = 3) {
    console.log(`\n👥 Testing ${concurrentUsers} Concurrent Database Operations...`);
    
    const promises = [];
    
    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.simulateConcurrentUser(user));
    }
    
    const startTime = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Concurrent access test completed in ${totalTime}ms`);
    
    return {
      totalUsers: concurrentUsers,
      totalTime,
      averageTimePerUser: totalTime / concurrentUsers
    };
  }

  async simulateConcurrentUser(userId) {
    const testPhone = `+66812345${String(Date.now()).slice(-3)}_concurrent_${userId}`;
    
    // User queries recent OTP
    await this.measureTime(
      `Concurrent User ${userId}: Query Recent`,
      async () => {
        const { data, error } = await supabase
          .from('otp_verifications')
          .select('*')
          .eq('formatted_phone', testPhone)
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Don't fail if no records found
        if (error && !error.message.includes('No rows found')) {
          throw error;
        }
        return data || [];
      },
      { userId, phone: testPhone }
    );

    // User checks verified phones
    await this.measureTime(
      `Concurrent User ${userId}: Check Status`,
      async () => {
        const { data, error } = await supabase
          .from('verified_phone_numbers')
          .select('*')
          .eq('phone_number', testPhone)
          .limit(1);
        
        // Don't fail if table doesn't exist or no records
        if (error && !error.message.includes('does not exist') && !error.message.includes('No rows')) {
          throw error;
        }
        return data || [];
      },
      { userId, phone: testPhone }
    );
  }

  // Generate Report
  generateReport() {
    const summary = {
      totalTests: this.results.length,
      successfulTests: this.results.filter(r => r.success).length,
      failedTests: this.results.filter(r => !r.success).length,
      averageResponseTime: this.results.length > 0 
        ? this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length 
        : 0,
      testDuration: this.results.length > 0 
        ? this.results[this.results.length - 1].timestamp.getTime() - this.results[0].timestamp.getTime()
        : 0
    };

    // Group by operation type
    const operationGroups = this.results.reduce((groups, result) => {
      const baseOp = result.operation.split(':')[0].trim();
      if (!groups[baseOp]) {
        groups[baseOp] = [];
      }
      groups[baseOp].push(result);
      return groups;
    }, {});

    const byOperation = {};
    const performance_insights = [];
    const recommendations = [];

    Object.entries(operationGroups).forEach(([operation, results]) => {
      const durations = results.map(r => r.duration);
      const successful = results.filter(r => r.success);
      const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown');

      const stats = {
        count: results.length,
        averageTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minTime: Math.min(...durations),
        maxTime: Math.max(...durations),
        successRate: (successful.length / results.length) * 100,
        errors: [...new Set(errors)]
      };

      byOperation[operation] = stats;

      // Generate insights
      if (stats.averageTime < 100) {
        performance_insights.push(`🚀 ${operation} is very fast (${stats.averageTime.toFixed(2)}ms avg)`);
      } else if (stats.averageTime < 300) {
        performance_insights.push(`✅ ${operation} is good (${stats.averageTime.toFixed(2)}ms avg)`);
      } else if (stats.averageTime < 1000) {
        performance_insights.push(`⚠️  ${operation} is getting slow (${stats.averageTime.toFixed(2)}ms avg)`);
      } else {
        performance_insights.push(`🐌 ${operation} is slow (${stats.averageTime.toFixed(2)}ms avg)`);
      }

      // Generate recommendations
      if (stats.averageTime > 1000) {
        recommendations.push(`🔧 Optimize ${operation} - currently ${stats.averageTime.toFixed(2)}ms avg`);
      }
      if (stats.successRate < 95) {
        recommendations.push(`🚨 Fix reliability in ${operation} - ${stats.successRate.toFixed(1)}% success`);
      }
    });

    return {
      summary,
      byOperation,
      performance_insights,
      recommendations
    };
  }

  clearResults() {
    this.results = [];
  }

  getResults() {
    return this.results;
  }
}

// Main test function
async function runRealDatabaseTests() {
  console.log('🚀 Starting REAL Database Performance Tests...');
  console.log('Using actual Supabase connection');
  console.log('='.repeat(60));
  
  const tester = new RealDatabasePerformanceTester();
  
  try {
    const startTime = Date.now();
    
    // Run tests
    await tester.testDatabaseConnection();
    await tester.testOTPOperations(2); // Reduced for initial test
    await tester.testDatabaseLoad(3);   // Reduced for initial test
    await tester.testConcurrentAccess(2); // Reduced for initial test
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 REAL DATABASE PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    const report = tester.generateReport();
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${report.summary.totalTests}`);
    console.log(`  Successful: ${report.summary.successfulTests} (${((report.summary.successfulTests/report.summary.totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${report.summary.failedTests}`);
    console.log(`  Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Total Runtime: ${(totalDuration/1000).toFixed(2)}s`);
    
    // Performance Insights
    console.log('\n🔍 PERFORMANCE INSIGHTS:');
    report.performance_insights.forEach(insight => console.log(`  ${insight}`));
    
    // Detailed Results
    console.log('\n📋 DETAILED RESULTS:');
    Object.entries(report.byOperation).forEach(([operation, stats]) => {
      console.log(`\n  ${operation}:`);
      console.log(`    Count: ${stats.count}`);
      console.log(`    Average: ${stats.averageTime.toFixed(2)}ms`);
      console.log(`    Min: ${stats.minTime.toFixed(2)}ms`);
      console.log(`    Max: ${stats.maxTime.toFixed(2)}ms`);
      console.log(`    Success Rate: ${stats.successRate.toFixed(1)}%`);
      if (stats.errors.length > 0) {
        console.log(`    Errors: ${stats.errors.join(', ')}`);
      }
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`  ${rec}`));
    } else {
      console.log('\n✅ No critical issues detected!');
    }
    
    // Performance Classification
    const avgTime = report.summary.averageResponseTime;
    console.log('\n🏆 PERFORMANCE CLASSIFICATION:');
    if (avgTime < 100) {
      console.log('  🚀 EXCELLENT - Database is lightning fast!');
    } else if (avgTime < 300) {
      console.log('  ✅ VERY GOOD - Database performs excellently');
    } else if (avgTime < 500) {
      console.log('  ⚡ GOOD - Database performs well');
    } else {
      console.log('  ⚠️  NEEDS OPTIMIZATION - Consider Phase 5.1 improvements');
    }
    
    console.log('\n🎉 Real database performance testing completed!');
    return report;
    
  } catch (error) {
    console.error('\n❌ Real database test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('\n🔌 CONNECTION ISSUE - Check internet or Supabase status');
    } else if (error.message.includes('permission') || error.message.includes('JWT')) {
      console.error('\n🔐 AUTHENTICATION ISSUE - Check Supabase keys');
    } else if (error.message.includes('relation') || error.message.includes('table')) {
      console.error('\n📋 SCHEMA ISSUE - Database tables may not exist');
    }
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runRealDatabaseTests().catch(console.error);
}

module.exports = { runRealDatabaseTests, RealDatabasePerformanceTester };
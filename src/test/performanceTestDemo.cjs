/**
 * Simple Performance Test Script (JavaScript version)
 * Can be run directly from terminal
 */

// Mock Supabase for testing
const mockSupabase = {
  from: (table) => ({
    select: (columns) => ({
      order: (column, options) => ({
        limit: (count) => ({
          data: Array.from({ length: Math.min(count, 5) }, (_, i) => ({
            id: i + 1,
            status: 'pending',
            created_at: new Date().toISOString()
          })),
          error: null
        })
      }),
      limit: (count) => ({
        data: Array.from({ length: Math.min(count, 10) }, (_, i) => ({
          id: i + 1,
          status: 'pending'
        })),
        error: null
      })
    })
  })
};

class SimplePerformanceTester {
  constructor() {
    this.results = [];
  }

  async measureTime(operation, fn) {
    const start = Date.now();
    const timestamp = new Date();
    
    try {
      await fn();
      const duration = Date.now() - start;
      
      const result = {
        operation,
        duration,
        success: true,
        timestamp
      };
      
      this.results.push(result);
      console.log(`✅ ${operation}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      const result = {
        operation,
        duration,
        success: false,
        error: error.message || 'Unknown error',
        timestamp
      };
      
      this.results.push(result);
      console.log(`❌ ${operation}: ${duration}ms - ${result.error}`);
      return result;
    }
  }

  async testDatabaseBasics(iterations = 3) {
    console.log('\n🗄️  Testing Database Basic Operations...');
    
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        `DB Query ${i + 1}`,
        async () => {
          // Simulate database query delay
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          const result = mockSupabase
            .from('otp_verifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          return result;
        }
      );
    }
  }

  async testConcurrentAccess(users = 3) {
    console.log(`\n👥 Testing ${users} Concurrent Users...`);
    
    const promises = [];
    for (let i = 0; i < users; i++) {
      promises.push(
        this.measureTime(
          `Concurrent User ${i + 1}`,
          async () => {
            // Simulate user operation delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
            return { userId: i + 1, success: true };
          }
        )
      );
    }
    
    await Promise.all(promises);
  }

  async testComplexOperations(iterations = 2) {
    console.log('\n📊 Testing Complex Operations...');
    
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        `Complex Query ${i + 1}`,
        async () => {
          // Simulate complex database operation
          await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
          return { processed: true, records: i + 1 };
        }
      );
    }
  }

  generateReport() {
    const summary = {
      totalTests: this.results.length,
      successfulTests: this.results.filter(r => r.success).length,
      failedTests: this.results.filter(r => !r.success).length,
      averageResponseTime: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length || 0
    };

    console.log('\n' + '='.repeat(50));
    console.log('📊 PERFORMANCE TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Successful: ${summary.successfulTests} (${((summary.successfulTests/summary.totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);

    // Performance insights
    console.log('\n🔍 PERFORMANCE INSIGHTS:');
    if (summary.averageResponseTime < 100) {
      console.log('  🚀 EXCELLENT - Your system is very fast!');
    } else if (summary.averageResponseTime < 300) {
      console.log('  ✅ GOOD - Your system performs well');
    } else if (summary.averageResponseTime < 1000) {
      console.log('  ⚠️  FAIR - Some optimization recommended');
    } else {
      console.log('  🐌 SLOW - Optimization needed');
    }

    // Detailed breakdown
    console.log('\n📋 DETAILED RESULTS:');
    const operationTypes = {};
    
    this.results.forEach(result => {
      const opType = result.operation.split(' ')[0]; // Group by operation type
      if (!operationTypes[opType]) {
        operationTypes[opType] = [];
      }
      operationTypes[opType].push(result);
    });

    Object.entries(operationTypes).forEach(([type, results]) => {
      const durations = results.map(r => r.duration);
      const avgTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const minTime = Math.min(...durations);
      const maxTime = Math.max(...durations);
      const successRate = (results.filter(r => r.success).length / results.length) * 100;

      console.log(`\n  ${type} Operations:`);
      console.log(`    Count: ${results.length}`);
      console.log(`    Average: ${avgTime.toFixed(2)}ms`);
      console.log(`    Min: ${minTime}ms`);
      console.log(`    Max: ${maxTime}ms`);
      console.log(`    Success Rate: ${successRate.toFixed(1)}%`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    if (summary.averageResponseTime > 500) {
      console.log('  🔧 Consider optimizing slow operations');
    }
    if (summary.failedTests > 0) {
      console.log('  🚨 Investigate failed operations');
    }
    if (summary.averageResponseTime < 200) {
      console.log('  ✅ No performance issues detected!');
    }

    return summary;
  }
}

// Main test function
async function runPerformanceTests() {
  console.log('🚀 Starting Simple Performance Tests...');
  console.log('Note: Using simulated data for demonstration\n');
  
  const tester = new SimplePerformanceTester();
  
  try {
    const startTime = Date.now();
    
    // Run different types of tests
    await tester.testDatabaseBasics(3);
    await tester.testConcurrentAccess(4);
    await tester.testComplexOperations(2);
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Generate comprehensive report
    const report = tester.generateReport();
    
    console.log(`\n⏱️  Total Test Duration: ${(totalDuration/1000).toFixed(2)} seconds`);
    console.log('\n✅ Performance testing completed!');
    console.log('\n💾 Next Steps:');
    console.log('  1. Replace mock data with real Supabase connection');
    console.log('  2. Run tests with actual OTP operations');
    console.log('  3. Use results to identify optimization opportunities');
    console.log('  4. Test with higher user loads for scalability');
    
    return report;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests, SimplePerformanceTester };
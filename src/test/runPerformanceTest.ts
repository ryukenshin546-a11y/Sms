/**
 * Performance Test Runner
 * Simple script to run performance tests and generate reports
 */

import { SimplePerformanceTest } from './simplePerformanceTest';

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests for OTP System...');
  console.log('=' .repeat(60));
  
  const tester = new SimplePerformanceTest();
  
  try {
    // 1. Database Basic Operations
    await tester.testDatabaseBasics(5);
    
    // 2. OTP Operations
    await tester.testOTPOperations(3);
    
    // 3. Table Performance
    await tester.testTablePerformance();
    
    // 4. Concurrent Access (light load)
    await tester.testConcurrentAccess(3);
    
    // Generate and display report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 PERFORMANCE TEST REPORT');
    console.log('=' .repeat(60));
    
    const report = tester.generateReport();
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${report.summary.totalTests}`);
    console.log(`  Successful: ${report.summary.successfulTests} (${((report.summary.successfulTests/report.summary.totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${report.summary.failedTests}`);
    console.log(`  Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Test Duration: ${(report.summary.testDuration/1000).toFixed(2)}s`);
    
    // Performance Insights
    console.log('\n🔍 PERFORMANCE INSIGHTS:');
    report.performance_insights.forEach(insight => console.log(`  ${insight}`));
    
    // Detailed Results by Operation
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
      console.log('\n✅ No performance issues detected!');
    }
    
    // Performance Classification
    console.log('\n🏆 PERFORMANCE CLASSIFICATION:');
    const avgTime = report.summary.averageResponseTime;
    if (avgTime < 100) {
      console.log('  🚀 EXCELLENT - Your system is very fast!');
    } else if (avgTime < 300) {
      console.log('  ✅ GOOD - Your system performs well');
    } else if (avgTime < 1000) {
      console.log('  ⚠️  FAIR - Some optimization recommended');
    } else {
      console.log('  🐌 SLOW - Optimization needed');
    }
    
    // Export detailed results
    const detailedResults = {
      timestamp: new Date().toISOString(),
      report,
      rawResults: tester.getResults()
    };
    
    console.log('\n💾 Results saved to memory. In production, this would be saved to a file.');
    
    return detailedResults;
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  }
}

// Export for use in other files
export { runPerformanceTests };

// If running directly from command line
if (typeof window === 'undefined' && require.main === module) {
  runPerformanceTests()
    .then(results => {
      console.log('\n🎉 Performance testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Performance testing failed:', error);
      process.exit(1);
    });
}
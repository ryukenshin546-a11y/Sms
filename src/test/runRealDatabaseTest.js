/**
 * Real Database Performance Test Runner
 * Run comprehensive performance tests on actual Supabase database
 */

import { RealDatabasePerformanceTester } from './realDatabasePerformanceTest.js';

async function runRealDatabaseTests() {
  console.log('🚀 Starting REAL Database Performance Tests...');
  console.log('Using actual Supabase connection');
  console.log('=' .repeat(60));
  
  const tester = new RealDatabasePerformanceTester();
  
  try {
    const startTime = Date.now();
    
    // 1. Test Database Connection
    await tester.testDatabaseConnection();
    
    // 2. Test Real OTP Operations
    await tester.testOTPOperations(3);
    
    // 3. Test Database Load
    await tester.testDatabaseLoad(5);
    
    // 4. Test Index Performance
    await tester.testIndexPerformance();
    
    // 5. Test Concurrent Access (light load for initial test)
    await tester.testConcurrentAccess(3);
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Generate comprehensive report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 REAL DATABASE PERFORMANCE REPORT');
    console.log('=' .repeat(60));
    
    const report = tester.generateReport();
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${report.summary.totalTests}`);
    console.log(`  Successful: ${report.summary.successfulTests} (${((report.summary.successfulTests/report.summary.totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${report.summary.failedTests}`);
    console.log(`  Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Test Duration: ${(report.summary.testDuration/1000).toFixed(2)}s`);
    console.log(`  Total Runtime: ${(totalDuration/1000).toFixed(2)}s`);
    
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
      console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`  ${rec}`));
    } else {
      console.log('\n✅ No performance issues detected! Your database is well optimized.');
    }
    
    // Performance Classification
    console.log('\n🏆 PERFORMANCE CLASSIFICATION:');
    const avgTime = report.summary.averageResponseTime;
    if (avgTime < 100) {
      console.log('  🚀 EXCELLENT - Your database is lightning fast!');
      console.log('  ✅ Ready for high-load production use');
    } else if (avgTime < 300) {
      console.log('  ✅ VERY GOOD - Your database performs excellently');
      console.log('  👍 Can handle moderate to high loads');
    } else if (avgTime < 500) {
      console.log('  ⚡ GOOD - Your database performs well');
      console.log('  📈 May need optimization for high loads');
    } else if (avgTime < 1000) {
      console.log('  ⚠️  FAIR - Your database needs some optimization');
      console.log('  🔧 Consider Phase 5.1 Database Optimization');
    } else {
      console.log('  🐌 SLOW - Your database needs urgent optimization');
      console.log('  🚨 Phase 5.1 & 5.2 optimizations required');
    }
    
    // Scalability Assessment
    console.log('\n🎯 SCALABILITY ASSESSMENT:');
    const successRate = (report.summary.successfulTests / report.summary.totalTests) * 100;
    
    if (successRate === 100 && avgTime < 200) {
      console.log('  🚀 Ready for Scale - No immediate optimization needed');
      console.log('  📊 Phase 5.2 Scalability can wait until user growth');
    } else if (successRate > 95 && avgTime < 500) {
      console.log('  ⚡ Good Foundation - Minor optimizations recommended');
      console.log('  📈 Consider Phase 5.2 when approaching 100+ concurrent users');
    } else if (successRate > 90 && avgTime < 1000) {
      console.log('  ⚠️  Needs Optimization - Phase 5.1 improvements required');
      console.log('  🔧 Implement Phase 5.2 Scalability soon');
    } else {
      console.log('  🚨 Critical Issues - Immediate optimization required');
      console.log('  🛠️  Must fix before considering scalability');
    }
    
    // Next Steps
    console.log('\n📋 RECOMMENDED NEXT STEPS:');
    if (avgTime < 200 && successRate === 100) {
      console.log('  1. 🎉 System is performing excellently!');
      console.log('  2. 📊 Monitor performance as user base grows');
      console.log('  3. 🚀 Consider Phase 5.2 when reaching 100+ concurrent users');
      console.log('  4. 📈 Focus on other features or Phase 4 Analytics');
    } else if (avgTime < 500 && successRate > 95) {
      console.log('  1. 🔧 Minor database optimizations (check slow queries)');
      console.log('  2. 📊 Monitor performance trends');
      console.log('  3. ⚡ Prepare for Phase 5.2 Scalability');
      console.log('  4. 🧪 Test with higher concurrent user loads');
    } else {
      console.log('  1. 🚨 Fix database performance issues immediately');
      console.log('  2. 🔍 Investigate slow queries and failed operations');
      console.log('  3. 📊 Re-run Phase 5.1 Database Optimization');
      console.log('  4. 🧪 Test again before proceeding to scalability');
    }
    
    console.log('\n🎉 Real database performance testing completed!');
    return report;
    
  } catch (error) {
    console.error('\n❌ Real database performance test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      console.error('\n🔌 DATABASE CONNECTION ISSUE:');
      console.error('  - Check internet connection');
      console.error('  - Verify Supabase URL and keys');
      console.error('  - Ensure Supabase project is active');
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      console.error('\n🔐 PERMISSION ISSUE:');
      console.error('  - Check Supabase API keys');
      console.error('  - Verify table permissions');
      console.error('  - Ensure RLS policies allow operations');
    } else if (error.message.includes('table') || error.message.includes('column')) {
      console.error('\n📋 SCHEMA ISSUE:');
      console.error('  - Verify database schema matches expectations');
      console.error('  - Check table and column names');
      console.error('  - Run database migration if needed');
    }
    
    console.error('\n🛠️  Try running with mock data first: node performanceTestDemo.cjs');
    throw error;
  }
}

// Export for use in other files
export { runRealDatabaseTests };

// If running directly from command line
if (typeof window === 'undefined' && require.main === module) {
  runRealDatabaseTests()
    .then(results => {
      console.log('\n🎯 Real database performance testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Real database performance testing failed:', error.message);
      process.exit(1);
    });
}
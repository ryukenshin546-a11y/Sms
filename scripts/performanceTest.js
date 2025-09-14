// Performance Testing Script
// เปรียบเทียบ Original vs Optimized Auto-Bot Performance

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const testConfig = {
  iterations: 3, // จำนวนครั้งที่จะทดสอบแต่ละ script
  scripts: {
    original: 'node scripts/runAutoBot.js',
    optimized: 'node scripts/runAutoBotOptimized.js'
  }
};

// Performance testing function
async function runPerformanceTest(scriptCommand, scriptName) {
  const results = [];
  
  console.log(`\n🧪 ทดสอบ ${scriptName}...`);
  
  for (let i = 1; i <= testConfig.iterations; i++) {
    console.log(`   🔄 Run ${i}/${testConfig.iterations}`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(scriptCommand, {
        timeout: 120000, // 2 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;
      
      // Parse result from output
      const outputLines = stdout.split('\n');
      const resultLine = outputLines.find(line => line.includes('"success"'));
      
      let success = false;
      let accountCreated = false;
      
      if (resultLine) {
        try {
          const result = JSON.parse(resultLine);
          success = result.success;
          accountCreated = result.data && result.data.accountName ? true : false;
        } catch (parseError) {
          console.log('   ⚠️  Parse error, checking output manually');
          success = stdout.includes('สร้างเสร็จสิ้น') || stdout.includes('สำเร็จ');
        }
      }
      
      results.push({
        run: i,
        success,
        accountCreated,
        executionTime,
        timestamp: new Date().toISOString()
      });
      
      console.log(`   ✅ Run ${i}: ${success ? 'Success' : 'Failed'} (${executionTime.toFixed(2)}s)`);
      
      // Wait between tests to avoid rate limiting
      if (i < testConfig.iterations) {
        console.log('   ⏳ รอ 5 วินาที...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;
      
      results.push({
        run: i,
        success: false,
        accountCreated: false,
        executionTime,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`   ❌ Run ${i}: Error (${executionTime.toFixed(2)}s) - ${error.message}`);
    }
  }
  
  return results;
}

// Calculate statistics
function calculateStats(results, scriptName) {
  const successfulRuns = results.filter(r => r.success);
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
  const minTime = Math.min(...results.map(r => r.executionTime));
  const maxTime = Math.max(...results.map(r => r.executionTime));
  const successRate = (successfulRuns.length / results.length) * 100;
  
  return {
    scriptName,
    totalRuns: results.length,
    successfulRuns: successfulRuns.length,
    failedRuns: results.length - successfulRuns.length,
    successRate: successRate.toFixed(1),
    avgExecutionTime: avgTime.toFixed(2),
    minExecutionTime: minTime.toFixed(2),
    maxExecutionTime: maxTime.toFixed(2),
    results
  };
}

// Main performance comparison function
async function runPerformanceComparison() {
  console.log('🚀 เริ่มต้น Performance Comparison Test');
  console.log('=====================================');
  
  const testResults = {};
  
  // Test Original Script
  try {
    const originalResults = await runPerformanceTest(testConfig.scripts.original, 'Original Script');
    testResults.original = calculateStats(originalResults, 'Original Script');
  } catch (error) {
    console.error('❌ Original script test failed:', error.message);
    testResults.original = {
      scriptName: 'Original Script',
      error: error.message
    };
  }
  
  // Wait between script tests
  console.log('\n⏳ รอ 10 วินาทีก่อนทดสอบ script ถัดไป...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Test Optimized Script  
  try {
    const optimizedResults = await runPerformanceTest(testConfig.scripts.optimized, 'Optimized Script');
    testResults.optimized = calculateStats(optimizedResults, 'Optimized Script');
  } catch (error) {
    console.error('❌ Optimized script test failed:', error.message);
    testResults.optimized = {
      scriptName: 'Optimized Script',
      error: error.message
    };
  }
  
  // Generate comparison report
  console.log('\n📊 PERFORMANCE COMPARISON REPORT');
  console.log('=====================================');
  
  if (testResults.original && testResults.optimized && !testResults.original.error && !testResults.optimized.error) {
    console.log(`\n🔍 Original Script:`);
    console.log(`   📈 Success Rate: ${testResults.original.successRate}%`);
    console.log(`   ⏱️  Avg Time: ${testResults.original.avgExecutionTime}s`);
    console.log(`   📏 Time Range: ${testResults.original.minExecutionTime}s - ${testResults.original.maxExecutionTime}s`);
    
    console.log(`\n⚡ Optimized Script:`);
    console.log(`   📈 Success Rate: ${testResults.optimized.successRate}%`);
    console.log(`   ⏱️  Avg Time: ${testResults.optimized.avgExecutionTime}s`);  
    console.log(`   📏 Time Range: ${testResults.optimized.minExecutionTime}s - ${testResults.optimized.maxExecutionTime}s`);
    
    // Calculate improvement
    const originalAvg = parseFloat(testResults.original.avgExecutionTime);
    const optimizedAvg = parseFloat(testResults.optimized.avgExecutionTime);
    const improvement = ((originalAvg - optimizedAvg) / originalAvg * 100).toFixed(1);
    const timeSaved = (originalAvg - optimizedAvg).toFixed(2);
    
    console.log(`\n🎯 PERFORMANCE IMPROVEMENT:`);
    console.log(`   🚀 Speed Improvement: ${improvement}% faster`);
    console.log(`   ⏰ Time Saved: ${timeSaved} seconds per execution`);
    
    if (optimizedAvg < originalAvg) {
      console.log(`   ✅ Optimization SUCCESSFUL!`);
    } else {
      console.log(`   ❌ Optimization needs more work`);
    }
  }
  
  // Save detailed results
  const report = {
    testDate: new Date().toISOString(),
    testConfig,
    results: testResults,
    summary: {
      originalPerformance: testResults.original,
      optimizedPerformance: testResults.optimized
    }
  };
  
  console.log(`\n📝 Full Test Results:`);
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

// Run the performance comparison
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceComparison()
    .then(() => {
      console.log('\n✅ Performance comparison complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Performance test failed:', error);
      process.exit(1);
    });
}

export default runPerformanceComparison;
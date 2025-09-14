/**
 * Performance Testing Suite for OTP System
 * Tests database queries, API calls, and user flows to identify bottlenecks
 */

import { supabase } from '../lib/supabase';

interface PerformanceResult {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
  details?: any;
}

interface TestConfig {
  iterations: number;
  concurrentUsers?: number;
  dataSize?: 'small' | 'medium' | 'large';
}

class PerformanceTestSuite {
  private results: PerformanceResult[] = [];

  // Utility method to measure execution time
  private async measureTime<T>(
    operation: string,
    fn: () => Promise<T>,
    details?: any
  ): Promise<PerformanceResult> {
    const start = performance.now();
    const timestamp = new Date();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      const perfResult: PerformanceResult = {
        operation,
        duration,
        success: true,
        timestamp,
        details: { ...details, result }
      };
      
      this.results.push(perfResult);
      return perfResult;
    } catch (error) {
      const duration = performance.now() - start;
      
      const perfResult: PerformanceResult = {
        operation,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        details
      };
      
      this.results.push(perfResult);
      return perfResult;
    }
  }

  // 1. Database Performance Tests
  async testDatabaseQueries(config: TestConfig = { iterations: 10 }) {
    console.log('\n🗄️  Testing Database Performance...');
    
    const testPhone = '+66812345678';
    const testOtpCode = '123456';

    // Test OTP insertion
    for (let i = 0; i < config.iterations; i++) {
      await this.measureTime(
        'Database: Insert OTP',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .insert([{
              phone_number: `${testPhone}_${i}`,
              otp_code: testOtpCode,
              is_verified: false,
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            }]);
          
          if (error) throw error;
          return data;
        },
        { iteration: i, phone: `${testPhone}_${i}` }
      );
    }

    // Test OTP verification lookup
    for (let i = 0; i < config.iterations; i++) {
      await this.measureTime(
        'Database: Lookup OTP for Verification',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('phone_number', `${testPhone}_${i}`)
            .eq('otp_code', testOtpCode)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .single();
          
          return data;
        },
        { iteration: i, phone: `${testPhone}_${i}` }
      );
    }

    // Test audit log insertion
    for (let i = 0; i < config.iterations; i++) {
      await this.measureTime(
        'Database: Insert Audit Log',
        async () => {
          const { data, error } = await supabase
            .from('audit_logs')
            .insert([{
              phone_number: `${testPhone}_${i}`,
              action: 'otp_verification_attempt',
              success: true,
              details: { iteration: i, test: 'performance' },
              ip_address: '127.0.0.1',
              user_agent: 'Performance Test Suite'
            }]);
          
          if (error) throw error;
          return data;
        },
        { iteration: i }
      );
    }

    // Test performance metrics view
    await this.measureTime(
      'Database: Query Performance Overview',
      async () => {
        const { data, error } = await supabase
          .from('otp_performance_overview')
          .select('*')
          .limit(100);
        
        return data;
      }
    );

    console.log('✅ Database tests completed');
  }

  // 2. API Performance Tests
  async testSMSAPIPerformance(config: TestConfig = { iterations: 5 }) {
    console.log('\n📱 Testing SMS API Performance...');
    
    const testPhone = '+66812345678';
    
    for (let i = 0; i < config.iterations; i++) {
      await this.measureTime(
        'SMS API: Send OTP',
        async () => {
          // Test with actual SMS service
          const result = await smsAccountService.sendOTP(
            `${testPhone}_test_${i}`,
            `Test${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
          );
          return result;
        },
        { iteration: i, phone: `${testPhone}_test_${i}` }
      );

      // Add delay between API calls to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ SMS API tests completed');
  }

  // 3. Concurrent User Simulation
  async testConcurrentUsers(config: TestConfig = { iterations: 5, concurrentUsers: 10 }) {
    console.log(`\n👥 Testing ${config.concurrentUsers} Concurrent Users...`);
    
    const promises = [];
    
    for (let user = 0; user < (config.concurrentUsers || 10); user++) {
      const userPromise = this.simulateUserFlow(user, config.iterations);
      promises.push(userPromise);
    }
    
    const startTime = performance.now();
    await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    console.log(`✅ Concurrent user test completed in ${totalTime.toFixed(2)}ms`);
    
    return {
      totalUsers: config.concurrentUsers,
      totalTime,
      averageTimePerUser: totalTime / (config.concurrentUsers || 10)
    };
  }

  // Simulate complete user flow
  private async simulateUserFlow(userId: number, iterations: number = 1) {
    const testPhone = `+66812345${String(userId).padStart(3, '0')}`;
    
    for (let i = 0; i < iterations; i++) {
      // Step 1: Request OTP
      await this.measureTime(
        'User Flow: Request OTP',
        async () => {
          const otpCode = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
          
          // Insert OTP to database
          const { data, error } = await supabase
            .from('otp_verifications')
            .insert([{
              phone_number: testPhone,
              otp_code: otpCode,
              is_verified: false,
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            }])
            .select()
            .single();
          
          if (error) throw error;
          return { otpCode, data };
        },
        { userId, iteration: i, step: 'request' }
      );

      // Simulate user delay before entering OTP
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: Verify OTP
      await this.measureTime(
        'User Flow: Verify OTP',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('phone_number', testPhone)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) throw error;
          
          // Mark as verified
          const { data: updateData, error: updateError } = await supabase
            .from('otp_verifications')
            .update({ is_verified: true })
            .eq('id', data.id)
            .select()
            .single();
            
          if (updateError) throw updateError;
          return updateData;
        },
        { userId, iteration: i, step: 'verify' }
      );
    }
  }

  // 4. Memory and Resource Usage Tests
  async testResourceUsage() {
    console.log('\n💾 Testing Resource Usage...');
    
    const initialMemory = process.memoryUsage();
    
    // Simulate heavy database operations
    await this.measureTime(
      'Resource: Heavy Database Load',
      async () => {
        const promises = [];
        
        for (let i = 0; i < 50; i++) {
          promises.push(
            supabase
              .from('otp_verifications')
              .select('*')
              .limit(100)
          );
        }
        
        const results = await Promise.all(promises);
        return results.length;
      }
    );
    
    const finalMemory = process.memoryUsage();
    const memoryUsed = {
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      external: finalMemory.external - initialMemory.external
    };
    
    console.log('Memory usage:', memoryUsed);
    return memoryUsed;
  }

  // Generate comprehensive performance report
  generateReport(): any {
    const report = {
      summary: {
        totalTests: this.results.length,
        successfulTests: this.results.filter(r => r.success).length,
        failedTests: this.results.filter(r => !r.success).length,
        averageResponseTime: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
      },
      byOperation: {} as Record<string, {
        count: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        successRate: number;
        errors: string[];
      }>,
      recommendations: [] as string[]
    };

    // Group results by operation
    const operationGroups = this.results.reduce((groups, result) => {
      if (!groups[result.operation]) {
        groups[result.operation] = [];
      }
      groups[result.operation].push(result);
      return groups;
    }, {} as Record<string, PerformanceResult[]>);

    // Calculate statistics for each operation
    Object.entries(operationGroups).forEach(([operation, results]) => {
      const durations = results.map(r => r.duration);
      const successful = results.filter(r => r.success);
      const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown');

      report.byOperation[operation] = {
        count: results.length,
        averageTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minTime: Math.min(...durations),
        maxTime: Math.max(...durations),
        successRate: (successful.length / results.length) * 100,
        errors: [...new Set(errors)]
      };
    });

    // Generate recommendations based on results
    Object.entries(report.byOperation).forEach(([operation, stats]) => {
      if (stats.averageTime > 1000) {
        report.recommendations.push(`⚠️  ${operation} is slow (${stats.averageTime.toFixed(2)}ms avg) - consider optimization`);
      }
      if (stats.successRate < 95) {
        report.recommendations.push(`🚨 ${operation} has high failure rate (${stats.successRate.toFixed(1)}%) - investigate errors`);
      }
      if (stats.maxTime > 5000) {
        report.recommendations.push(`⏱️  ${operation} has very slow outliers (max: ${stats.maxTime.toFixed(2)}ms) - check for edge cases`);
      }
    });

    return report;
  }

  // Clear results for fresh testing
  clearResults() {
    this.results = [];
  }

  // Export results to JSON file
  exportResults(filename?: string) {
    const report = this.generateReport();
    const data = {
      timestamp: new Date().toISOString(),
      report,
      rawResults: this.results
    };
    
    console.log('\n📊 Performance Test Report:');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(report, null, 2));
    
    return data;
  }
}

export { PerformanceTestSuite, type PerformanceResult, type TestConfig };
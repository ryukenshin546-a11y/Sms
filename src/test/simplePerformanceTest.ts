/**
 * Simple Performance Test Suite for OTP System
 * Tests actual database and API performance to identify bottlenecks
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

class SimplePerformanceTest {
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
      console.log(`✅ ${operation}: ${duration.toFixed(2)}ms`);
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
      console.log(`❌ ${operation}: ${duration.toFixed(2)}ms - ${perfResult.error}`);
      return perfResult;
    }
  }

  // 1. Test Database Basic Operations
  async testDatabaseBasics(iterations: number = 5) {
    console.log('\n🗄️  Testing Database Basic Operations...');
    
    // Test table listing (verify connection)
    await this.measureTime(
      'DB: List Tables',
      async () => {
        // Simple connection test
        const result = await supabase
          .from('otp_verifications')
          .select('id')
          .limit(1);
        return result.data;
      }
    );

    // Test OTP table queries
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        'DB: Query OTP Verifications',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          return data;
        },
        { iteration: i }
      );
    }

    // Test phone verification table
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        'DB: Query Phone Verifications',
        async () => {
          const { data, error } = await supabase
            .from('phone_verifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          return data;
        },
        { iteration: i }
      );
    }

    // Test verified phone numbers
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        'DB: Query Verified Phone Numbers',
        async () => {
          const { data, error } = await supabase
            .from('verified_phone_numbers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          return data;
        },
        { iteration: i }
      );
    }
  }

  // 2. Test OTP Operations Performance
  async testOTPOperations(iterations: number = 3) {
    console.log('\n📱 Testing OTP Operations...');
    
    const testPhone = '+66812345678';
    
    for (let i = 0; i < iterations; i++) {
      const testPhoneNumber = `${testPhone}_perf_test_${i}`;
      
      // Test OTP creation
      await this.measureTime(
        'OTP: Create Record',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .insert([{
              formatted_phone: testPhoneNumber,
              phone_number: testPhoneNumber,
              otp_code: String(Math.floor(Math.random() * 999999)).padStart(6, '0'),
              status: 'pending',
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              external_service: 'performance_test'
            }])
            .select()
            .single();
          
          if (error) throw error;
          return data;
        },
        { iteration: i, phone: testPhoneNumber }
      );

      // Test OTP lookup
      await this.measureTime(
        'OTP: Lookup Record',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('formatted_phone', testPhoneNumber)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) throw error;
          return data;
        },
        { iteration: i, phone: testPhoneNumber }
      );

      // Test OTP verification (mark as verified)
      await this.measureTime(
        'OTP: Mark Verified',
        async () => {
          const { data, error } = await supabase
            .from('otp_verifications')
            .update({ 
              status: 'verified',
              verified_at: new Date().toISOString()
            })
            .eq('formatted_phone', testPhoneNumber)
            .eq('status', 'pending')
            .select()
            .single();
          
          if (error) throw error;
          return data;
        },
        { iteration: i, phone: testPhoneNumber }
      );
    }
  }

  // 3. Test Concurrent Database Access
  async testConcurrentAccess(concurrentUsers: number = 5) {
    console.log(`\n👥 Testing ${concurrentUsers} Concurrent Users...`);
    
    const promises = [];
    const startTime = performance.now();
    
    for (let user = 0; user < concurrentUsers; user++) {
      const userPromise = this.simulateConcurrentUser(user);
      promises.push(userPromise);
    }
    
    await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    console.log(`✅ Concurrent access test completed in ${totalTime.toFixed(2)}ms`);
    
    return {
      totalUsers: concurrentUsers,
      totalTime,
      averageTimePerUser: totalTime / concurrentUsers
    };
  }

  // Simulate a single user's database operations
  private async simulateConcurrentUser(userId: number) {
    const testPhone = `+6681234${String(userId).padStart(4, '0')}`;
    
    // User queries recent OTP
    await this.measureTime(
      `Concurrent User ${userId}: Query Recent OTP`,
      async () => {
        const { data } = await supabase
          .from('otp_verifications')
          .select('*')
          .eq('formatted_phone', testPhone)
          .order('created_at', { ascending: false })
          .limit(1);
        
        return data;
      },
      { userId, phone: testPhone }
    );

    // User checks if phone is verified
    await this.measureTime(
      `Concurrent User ${userId}: Check Phone Status`,
      async () => {
        const { data } = await supabase
          .from('verified_phone_numbers')
          .select('*')
          .eq('phone_number', testPhone)
          .limit(1);
        
        return data;
      },
      { userId, phone: testPhone }
    );
  }

  // 4. Test Table Sizes and Indexes
  async testTablePerformance() {
    console.log('\n📊 Testing Table Performance...');
    
    // Count records in each table
    await this.measureTime(
      'Table: Count OTP Verifications',
      async () => {
        const { count, error } = await supabase
          .from('otp_verifications')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { count };
      }
    );

    await this.measureTime(
      'Table: Count Phone Verifications',
      async () => {
        const { count, error } = await supabase
          .from('phone_verifications')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { count };
      }
    );

    await this.measureTime(
      'Table: Count Verified Phone Numbers',
      async () => {
        const { count, error } = await supabase
          .from('verified_phone_numbers')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { count };
      }
    );

    // Test complex queries
    await this.measureTime(
      'Complex Query: Recent Activity Analysis',
      async () => {
        // Simplified query without GROUP BY
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
        }, {} as Record<string, number>) || {};
        
        return { data, statusCounts };
      }
    );
  }

  // Generate Performance Report
  generateReport(): any {
    const report = {
      summary: {
        totalTests: this.results.length,
        successfulTests: this.results.filter(r => r.success).length,
        failedTests: this.results.filter(r => !r.success).length,
        averageResponseTime: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
        testDuration: this.results.length > 0 ? 
          this.results[this.results.length - 1].timestamp.getTime() - this.results[0].timestamp.getTime() : 0
      },
      byOperation: {} as Record<string, {
        count: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        successRate: number;
        errors: string[];
      }>,
      performance_insights: [] as string[],
      recommendations: [] as string[]
    };

    // Group results by operation
    const operationGroups = this.results.reduce((groups, result) => {
      const baseOp = result.operation.split(':')[0]; // Group by operation type
      if (!groups[baseOp]) {
        groups[baseOp] = [];
      }
      groups[baseOp].push(result);
      return groups;
    }, {} as Record<string, PerformanceResult[]>);

    // Calculate statistics for each operation group
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

      report.byOperation[operation] = stats;

      // Generate insights
      if (stats.averageTime < 100) {
        report.performance_insights.push(`✅ ${operation} is very fast (${stats.averageTime.toFixed(2)}ms avg)`);
      } else if (stats.averageTime < 500) {
        report.performance_insights.push(`⚡ ${operation} is acceptable (${stats.averageTime.toFixed(2)}ms avg)`);
      } else if (stats.averageTime < 1000) {
        report.performance_insights.push(`⚠️  ${operation} is getting slow (${stats.averageTime.toFixed(2)}ms avg)`);
      } else {
        report.performance_insights.push(`🐌 ${operation} is slow (${stats.averageTime.toFixed(2)}ms avg)`);
      }

      // Generate recommendations
      if (stats.averageTime > 1000) {
        report.recommendations.push(`🔧 Optimize ${operation} - currently ${stats.averageTime.toFixed(2)}ms avg`);
      }
      if (stats.successRate < 95) {
        report.recommendations.push(`🚨 Fix reliability issues in ${operation} - ${stats.successRate.toFixed(1)}% success rate`);
      }
      if (stats.maxTime > 5000) {
        report.recommendations.push(`⏱️  Investigate ${operation} performance spikes - max time ${stats.maxTime.toFixed(2)}ms`);
      }
    });

    return report;
  }

  // Clear results for fresh testing
  clearResults() {
    this.results = [];
  }

  // Get raw results
  getResults() {
    return this.results;
  }
}

export { SimplePerformanceTest, type PerformanceResult };
/**
 * Real Database Performance Test
 * Tests actual OTP system performance with real Supabase connection
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://mnhdueclyzwtfkmwttkc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGR1ZWNseXp3dGZrbXd0dGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzMjUyMTksImV4cCI6MjA0MTkwMTIxOX0.JdJsOlDSCfNfOJX7aEHh3fYhP7BrwR9jyDWf4S5l1Dc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PerformanceResult {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
  details?: any;
}

class RealDatabasePerformanceTester {
  private results: PerformanceResult[] = [];

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

  // 1. Test Database Connection and Basic Queries
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
          
          if (error) throw error;
          return { table, hasData: data && data.length > 0 };
        }
      );
    }
  }

  // 2. Test Real OTP Operations
  async testOTPOperations(iterations: number = 3) {
    console.log('\n📱 Testing Real OTP Operations...');
    
    for (let i = 0; i < iterations; i++) {
      const testPhone = `+66812345${String(Date.now()).slice(-3)}_test_${i}`;
      const otpCode = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
      
      // Test OTP creation
      let otpRecord: any;
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
        { iteration: i, phone: testPhone, otpId: otpRecord?.id }
      );
    }
  }

  // 3. Test Concurrent Database Access
  async testConcurrentAccess(concurrentUsers: number = 5) {
    console.log(`\n👥 Testing ${concurrentUsers} Concurrent Database Operations...`);
    
    const promises = [];
    
    for (let user = 0; user < concurrentUsers; user++) {
      const userPromise = this.simulateConcurrentUser(user);
      promises.push(userPromise);
    }
    
    const startTime = performance.now();
    await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    console.log(`✅ Concurrent access test completed in ${totalTime.toFixed(2)}ms`);
    
    return {
      totalUsers: concurrentUsers,
      totalTime,
      averageTimePerUser: totalTime / concurrentUsers
    };
  }

  private async simulateConcurrentUser(userId: number) {
    const testPhone = `+66812345${String(Date.now()).slice(-3)}_concurrent_${userId}`;
    
    // User queries recent OTP
    await this.measureTime(
      `Concurrent User ${userId}: Query Recent OTP`,
      async () => {
        const { data, error } = await supabase
          .from('otp_verifications')
          .select('*')
          .eq('formatted_phone', testPhone)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        return data;
      },
      { userId, phone: testPhone }
    );

    // User checks if phone is verified
    await this.measureTime(
      `Concurrent User ${userId}: Check Phone Status`,
      async () => {
        const { data, error } = await supabase
          .from('verified_phone_numbers')
          .select('*')
          .eq('phone_number', testPhone)
          .limit(1);
        
        if (error) throw error;
        return data;
      },
      { userId, phone: testPhone }
    );
  }

  // 4. Test Database Performance Under Load
  async testDatabaseLoad(queryCount: number = 10) {
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

    // Test complex queries
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
        }, {} as Record<string, number>) || {};
        
        return { data: data?.length, statusCounts };
      }
    );
  }

  // 5. Test Database Indexes Performance
  async testIndexPerformance() {
    console.log('\n🚀 Testing Database Index Performance...');
    
    // Test indexed queries (should be fast)
    const indexedQueries = [
      {
        name: 'Phone Number Lookup',
        query: () => supabase
          .from('otp_verifications')
          .select('*')
          .eq('formatted_phone', '+66812345678')
          .limit(1)
      },
      {
        name: 'Status Filter',
        query: () => supabase
          .from('otp_verifications')
          .select('*')
          .eq('status', 'pending')
          .limit(10)
      },
      {
        name: 'Recent Records',
        query: () => supabase
          .from('otp_verifications')
          .select('*')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .limit(10)
      }
    ];

    for (const testCase of indexedQueries) {
      await this.measureTime(
        `Index Test: ${testCase.name}`,
        async () => {
          const { data, error } = await testCase.query();
          if (error) throw error;
          return data;
        }
      );
    }
  }

  // Generate comprehensive performance report
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

    // Group results by operation type
    const operationGroups = this.results.reduce((groups, result) => {
      const baseOp = result.operation.split(':')[0].trim();
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

      // Generate insights based on real database performance
      if (stats.averageTime < 50) {
        report.performance_insights.push(`🚀 ${operation} is lightning fast (${stats.averageTime.toFixed(2)}ms avg) - excellent indexes!`);
      } else if (stats.averageTime < 200) {
        report.performance_insights.push(`✅ ${operation} is very good (${stats.averageTime.toFixed(2)}ms avg) - well optimized`);
      } else if (stats.averageTime < 500) {
        report.performance_insights.push(`⚡ ${operation} is acceptable (${stats.averageTime.toFixed(2)}ms avg) - good performance`);
      } else if (stats.averageTime < 1000) {
        report.performance_insights.push(`⚠️  ${operation} is getting slow (${stats.averageTime.toFixed(2)}ms avg) - consider optimization`);
      } else {
        report.performance_insights.push(`🐌 ${operation} is slow (${stats.averageTime.toFixed(2)}ms avg) - needs optimization`);
      }

      // Generate recommendations based on real performance
      if (stats.averageTime > 1000) {
        report.recommendations.push(`🔧 ${operation} needs urgent optimization (${stats.averageTime.toFixed(2)}ms avg)`);
      }
      if (stats.successRate < 95) {
        report.recommendations.push(`🚨 ${operation} has reliability issues (${stats.successRate.toFixed(1)}% success rate)`);
      }
      if (stats.maxTime > 5000) {
        report.recommendations.push(`⏱️  ${operation} has performance spikes (max: ${stats.maxTime.toFixed(2)}ms)`);
      }
    });

    // Database-specific recommendations
    const dbOperations = Object.keys(report.byOperation).filter(op => 
      op.includes('DB') || op.includes('OTP') || op.includes('Table')
    );

    if (dbOperations.some(op => report.byOperation[op].averageTime > 200)) {
      report.recommendations.push('📊 Consider adding more database indexes for frequently queried columns');
    }

    if (report.summary.failedTests === 0) {
      report.performance_insights.push('✅ Perfect reliability - no failed database operations!');
    }

    return report;
  }

  clearResults() {
    this.results = [];
  }

  getResults() {
    return this.results;
  }
}

export { RealDatabasePerformanceTester, type PerformanceResult };
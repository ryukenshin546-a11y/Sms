/**
 * Simple Performance Test Script
 * Can be run directly from terminal to test system performance
 */

// Mock Supabase for testing without actual database
const mockSupabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      order: (column: string, options?: any) => ({
        limit: (count: number) => ({
          data: Array.from({ length: Math.min(count, 5) }, (_, i) => ({
            id: i + 1,
            status: 'pending',
            created_at: new Date().toISOString()
          })),
          error: null
        }),
        single: () => ({
          data: {
            id: 1,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          error: null
        }),
        gte: (column: string, value: string) => ({
          data: [
            { id: 1, status: 'pending' },
            { id: 2, status: 'verified' }
          ],
          error: null
        })
      }),
      eq: (column: string, value: any) => ({
        eq: (column2: string, value2: any) => ({
          gt: (column3: string, value3: any) => ({
            order: (column: string, options?: any) => ({
              limit: (count: number) => ({
                single: () => ({
                  data: { id: 1, status: 'pending', created_at: new Date().toISOString() },
                  error: null
                })
              })
            })
          })
        })
      }),
      gte: (column: string, value: string) => ({
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            data: [
              { id: 1, status: 'pending' },
              { id: 2, status: 'verified' }
            ],
            error: null
          })
        })
      }),
      limit: (count: number) => ({
        data: Array.from({ length: Math.min(count, 10) }, (_, i) => ({
          id: i + 1,
          status: 'pending'
        })),
        error: null
      })
    }),
    insert: (data: any[]) => ({
      select: () => ({
        single: () => ({
          data: data[0],
          error: null
        })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: 1 },
            error: null
          })
        })
      })
    })
  })
};

interface PerformanceResult {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

class SimplePerformanceTester {
  private results: PerformanceResult[] = [];

  private async measureTime<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<PerformanceResult> {
    const start = Date.now();
    const timestamp = new Date();
    
    try {
      await fn();
      const duration = Date.now() - start;
      
      const result: PerformanceResult = {
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
      
      const result: PerformanceResult = {
        operation,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      this.results.push(result);
      console.log(`❌ ${operation}: ${duration}ms - ${result.error}`);
      return result;
    }
  }

  async testDatabaseBasics(iterations: number = 3) {
    console.log('\n🗄️  Testing Database Basic Operations...');
    
    for (let i = 0; i < iterations; i++) {
      await this.measureTime(
        `DB Query ${i + 1}`,
        async () => {
          // Simulate database query
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

  async testConcurrentAccess(users: number = 3) {
    console.log(`\n👥 Testing ${users} Concurrent Users...`);
    
    const promises = [];
    for (let i = 0; i < users; i++) {
      promises.push(
        this.measureTime(
          `Concurrent User ${i + 1}`,
          async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
            return { userId: i + 1, success: true };
          }
        )
      );
    }
    
    await Promise.all(promises);
  }

  generateReport() {
    const summary = {
      totalTests: this.results.length,
      successfulTests: this.results.filter(r => r.success).length,
      failedTests: this.results.filter(r => !r.success).length,
      averageResponseTime: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length || 0
    };

    console.log('\n' + '=' .repeat(50));
    console.log('📊 PERFORMANCE TEST REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Successful: ${summary.successfulTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);

    if (summary.averageResponseTime < 100) {
      console.log('🚀 EXCELLENT - Your system is very fast!');
    } else if (summary.averageResponseTime < 300) {
      console.log('✅ GOOD - Your system performs well');
    } else {
      console.log('⚠️  FAIR - Some optimization recommended');
    }

    return summary;
  }
}

// Main test function
async function runPerformanceTests() {
  console.log('🚀 Starting Simple Performance Tests...');
  console.log('Note: Using mock data for demonstration');
  
  const tester = new SimplePerformanceTester();
  
  try {
    await tester.testDatabaseBasics(3);
    await tester.testConcurrentAccess(3);
    
    const report = tester.generateReport();
    
    console.log('\n✅ Performance testing completed!');
    console.log('To test with real database, update the supabase import in the React components.');
    
    return report;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  }
}

// Export for use in other files
export { runPerformanceTests, SimplePerformanceTester };

// If running in Node.js environment
if (typeof window === 'undefined') {
  runPerformanceTests().catch(console.error);
}
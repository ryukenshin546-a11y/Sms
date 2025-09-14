import { DatabaseConnectionPool } from './DatabaseConnectionPool';
import { MemoryCache } from './MemoryCache';
import { DatabaseQueryOptimizer } from './DatabaseQueryOptimizer';
import { createClient } from '@supabase/supabase-js';

/**
 * Performance Integration Service
 * Phase 5.1: Database Optimization and Caching
 * 
 * This service integrates all performance optimization layers:
 * - Connection pooling
 * - Memory caching  
 * - Query optimization
 * - Performance monitoring
 */

interface PerformanceConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  maxConnections?: number;
  cacheSize?: number;
  enableProfiling?: boolean;
}

interface PerformanceMetrics {
  totalRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  poolUtilization: number;
  queryOptimizations: number;
  errorRate: number;
}

interface OptimizedOTPOperation {
  operation: 'send' | 'verify' | 'cleanup';
  phoneNumber: string;
  code?: string;
  cached: boolean;
  responseTime: number;
  connectionPooled: boolean;
}

export class PerformanceIntegrationService {
  private connectionPool: DatabaseConnectionPool;
  private memoryCache: MemoryCache;
  private queryOptimizer: DatabaseQueryOptimizer;
  private metrics: PerformanceMetrics;
  private startTime: Date;

  constructor(config: PerformanceConfig) {
    // Initialize Supabase client
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Initialize performance components
    this.connectionPool = new DatabaseConnectionPool(supabase, {
      maxConnections: config.maxConnections || 20,
      idleTimeout: 30000,
      connectionTimeout: 10000
    });

    this.memoryCache = new MemoryCache(config.cacheSize || 1000);

    this.queryOptimizer = new DatabaseQueryOptimizer(
      this.connectionPool,
      this.memoryCache,
      config.enableProfiling || false
    );

    this.metrics = {
      totalRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      poolUtilization: 0,
      queryOptimizations: 0,
      errorRate: 0
    };

    this.startTime = new Date();

    console.log('🚀 PerformanceIntegrationService initialized');
  }

  /**
   * Optimized OTP Send Operation
   * Uses connection pooling, caching, and query optimization
   */
  async sendOTPOptimized(
    phoneNumber: string,
    code: string,
    expiryMinutes: number = 5
  ): Promise<OptimizedOTPOperation> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalRequests++;

      // Check rate limiting with cache
      const rateLimitKey = `rate_limit:${phoneNumber}`;
      const cached = await this.memoryCache.get(rateLimitKey);
      
      if (cached) {
        throw new Error('Rate limited - too many requests');
      }

      // Execute optimized OTP insertion
      const result = await this.queryOptimizer.executeOTPQuery(
        'insert',
        {
          phoneNumber,
          code,
          expiryMinutes
        }
      );

      // Cache the OTP for quick verification
      const otpCacheKey = `otp:${phoneNumber}:${code}`;
      await this.memoryCache.setOTP(otpCacheKey, {
        code,
        phoneNumber,
        expiresAt: new Date(Date.now() + expiryMinutes * 60000),
        attempts: 0
      });

      // Set rate limiting
      await this.memoryCache.setRateLimit(rateLimitKey, {
        count: 1,
        windowStart: new Date(),
        limit: 5
      });

      const responseTime = performance.now() - startTime;
      
      // Update metrics
      this.updateMetrics(responseTime, true, false);

      return {
        operation: 'send',
        phoneNumber,
        code,
        cached: false,
        responseTime,
        connectionPooled: true
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, false, false);
      
      throw error;
    }
  }

  /**
   * Optimized OTP Verification
   * Prioritizes cache lookup before database query
   */
  async verifyOTPOptimized(
    phoneNumber: string,
    inputCode: string
  ): Promise<OptimizedOTPOperation> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalRequests++;

      // Try cache first
      const otpCacheKey = `otp:${phoneNumber}:${inputCode}`;
      const cachedOTP = await this.memoryCache.getOTP(otpCacheKey);

      if (cachedOTP) {
        // Verify from cache
        if (cachedOTP.expiresAt > new Date() && cachedOTP.attempts < 3) {
          // Update attempts in cache
          cachedOTP.attempts++;
          await this.memoryCache.setOTP(otpCacheKey, cachedOTP);

          const responseTime = performance.now() - startTime;
          this.updateMetrics(responseTime, true, true);

          return {
            operation: 'verify',
            phoneNumber,
            code: inputCode,
            cached: true,
            responseTime,
            connectionPooled: false
          };
        }
      }

      // Fallback to database with optimization
      const result = await this.queryOptimizer.executeOTPQuery(
        'verify',
        {
          phoneNumber,
          inputCode
        }
      );

      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, true, false);

      return {
        operation: 'verify',
        phoneNumber,
        code: inputCode,
        cached: false,
        responseTime,
        connectionPooled: true
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, false, false);
      
      throw error;
    }
  }

  /**
   * Optimized Analytics Data Retrieval
   * Uses aggressive caching for dashboard queries
   */
  async getAnalyticsOptimized(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalRequests++;

      // Check analytics cache first
      const cacheKey = `analytics:${timeRange}`;
      const cached = await this.memoryCache.getAnalytics(cacheKey);

      if (cached) {
        const responseTime = performance.now() - startTime;
        this.updateMetrics(responseTime, true, true);
        
        return cached;
      }

      // Execute optimized analytics query
      const result = await this.queryOptimizer.executeAnalyticsQuery(timeRange);

      // Cache the results with appropriate TTL
      const ttl = this.getAnalyticsCacheTTL(timeRange);
      await this.memoryCache.setAnalytics(cacheKey, result, ttl);

      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, true, false);

      return result;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, false, false);
      
      throw error;
    }
  }

  /**
   * Cleanup Operations with Batch Processing
   * Optimized for bulk operations
   */
  async cleanupOptimized(): Promise<OptimizedOTPOperation> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalRequests++;

      // Execute batch cleanup
      await Promise.all([
        // Clean expired OTPs from cache
        this.memoryCache.cleanupExpired(),
        
        // Clean expired database records
        this.queryOptimizer.executeCleanupQuery('otp_codes'),
        this.queryOptimizer.executeCleanupQuery('audit_logs'),
        this.queryOptimizer.executeCleanupQuery('rate_limits')
      ]);

      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, true, false);

      return {
        operation: 'cleanup',
        phoneNumber: 'batch',
        cached: false,
        responseTime,
        connectionPooled: true
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, false, false);
      
      throw error;
    }
  }

  /**
   * Performance Monitoring and Health Check
   */
  async getPerformanceReport(): Promise<{
    metrics: PerformanceMetrics;
    connectionPool: any;
    memoryCache: any;
    recommendations: string[];
  }> {
    const poolStats = this.connectionPool.getPoolStats();
    const cacheStats = this.memoryCache.getStatistics();
    
    // Calculate current metrics
    const runtime = Date.now() - this.startTime.getTime();
    
    this.metrics.poolUtilization = (poolStats.activeConnections / poolStats.maxConnections) * 100;
    
    if (cacheStats.hits + cacheStats.misses > 0) {
      this.metrics.cacheHitRate = (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (this.metrics.cacheHitRate < 60) {
      recommendations.push('Consider increasing cache TTL or cache size');
    }
    
    if (this.metrics.poolUtilization > 80) {
      recommendations.push('Consider increasing connection pool size');
    }
    
    if (this.metrics.errorRate > 5) {
      recommendations.push('High error rate detected - investigate error patterns');
    }
    
    if (this.metrics.averageResponseTime > 1000) {
      recommendations.push('High response times - consider query optimization');
    }

    return {
      metrics: { ...this.metrics },
      connectionPool: poolStats,
      memoryCache: cacheStats,
      recommendations
    };
  }

  /**
   * Graceful Shutdown
   * Properly cleanup all resources
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down PerformanceIntegrationService...');
    
    try {
      // Get final stats
      const report = await this.getPerformanceReport();
      console.log('📊 Final Performance Report:', report);
      
      // Cleanup resources
      await this.connectionPool.destroy();
      this.memoryCache.clear();
      
      console.log('✅ PerformanceIntegrationService shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  // Private helper methods
  private updateMetrics(
    responseTime: number,
    success: boolean,
    fromCache: boolean
  ): void {
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;

    // Update error rate
    if (!success) {
      this.metrics.errorRate = 
        ((this.metrics.errorRate * (this.metrics.totalRequests - 1)) + 1) / 
        this.metrics.totalRequests;
    }

    // Count optimizations
    if (fromCache) {
      this.metrics.queryOptimizations++;
    }
  }

  private getAnalyticsCacheTTL(timeRange: string): number {
    switch (timeRange) {
      case 'hour': return 300; // 5 minutes
      case 'day': return 900; // 15 minutes
      case 'week': return 3600; // 1 hour
      case 'month': return 7200; // 2 hours
      default: return 600; // 10 minutes
    }
  }
}

// Singleton instance for global use
let performanceService: PerformanceIntegrationService | null = null;

/**
 * Initialize Performance Service
 * Call this once at application startup
 */
export function initializePerformanceService(config: PerformanceConfig): PerformanceIntegrationService {
  if (!performanceService) {
    performanceService = new PerformanceIntegrationService(config);
  }
  return performanceService;
}

/**
 * Get Performance Service Instance
 * Returns the initialized singleton instance
 */
export function getPerformanceService(): PerformanceIntegrationService {
  if (!performanceService) {
    throw new Error('PerformanceIntegrationService not initialized. Call initializePerformanceService() first.');
  }
  return performanceService;
}

/**
 * Utility function for Edge Functions
 * Simplified interface for common operations
 */
export class PerformanceEdgeFunctionUtils {
  private service: PerformanceIntegrationService;

  constructor(service: PerformanceIntegrationService) {
    this.service = service;
  }

  async handleOTPSend(phoneNumber: string, code: string): Promise<Response> {
    try {
      const result = await this.service.sendOTPOptimized(phoneNumber, code);
      
      return new Response(JSON.stringify({
        success: true,
        data: result,
        performance: {
          responseTime: result.responseTime,
          cached: result.cached,
          pooled: result.connectionPooled
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        code: 'OTP_SEND_FAILED'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleOTPVerify(phoneNumber: string, code: string): Promise<Response> {
    try {
      const result = await this.service.verifyOTPOptimized(phoneNumber, code);
      
      return new Response(JSON.stringify({
        success: true,
        data: result,
        performance: {
          responseTime: result.responseTime,
          cached: result.cached,
          pooled: result.connectionPooled
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        code: 'OTP_VERIFY_FAILED'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleAnalytics(timeRange?: string): Promise<Response> {
    try {
      const result = await this.service.getAnalyticsOptimized(
        timeRange as 'hour' | 'day' | 'week' | 'month'
      );
      
      return new Response(JSON.stringify({
        success: true,
        data: result
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        code: 'ANALYTICS_FAILED'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

export default PerformanceIntegrationService;
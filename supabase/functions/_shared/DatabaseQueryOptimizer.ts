/**
 * Database Query Optimizer
 * Optimizes database queries with caching, indexing strategies, and performance monitoring
 * Created: September 14, 2025
 */

import { executeWithPool } from './DatabaseConnectionPool.ts'
import { AnalyticsCache } from './MemoryCache.ts'

interface QueryConfig {
  useCache: boolean
  cacheTTL: number
  timeout: number
  retryAttempts: number
  enableProfiling: boolean
}

interface QueryProfile {
  query: string
  executionTime: number
  rowsAffected: number
  cacheHit: boolean
  timestamp: number
}

interface IndexSuggestion {
  table: string
  columns: string[]
  reason: string
  estimatedImprovement: string
}

class DatabaseQueryOptimizer {
  private queryProfiles: QueryProfile[] = []
  private slowQueryThreshold: number = 1000 // 1 second
  private maxProfileHistory: number = 1000

  constructor() {
    console.log('🔧 Database Query Optimizer initialized')
  }

  /**
   * Execute optimized OTP queries
   */
  async executeOTPQuery<T>(
    operation: string,
    params: any,
    config: Partial<QueryConfig> = {}
  ): Promise<T> {
    const queryConfig: QueryConfig = {
      useCache: config.useCache ?? true,
      cacheTTL: config.cacheTTL ?? 300000, // 5 minutes
      timeout: config.timeout ?? 5000,
      retryAttempts: config.retryAttempts ?? 2,
      enableProfiling: config.enableProfiling ?? true
    }

    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(operation, params)
    let cacheHit = false

    try {
      // Try cache first for read operations
      if (queryConfig.useCache && this.isReadOperation(operation)) {
        const cached = AnalyticsCache.getMetrics<T>(cacheKey)
        if (cached) {
          cacheHit = true
          
          if (queryConfig.enableProfiling) {
            this.profileQuery({
              query: operation,
              executionTime: Date.now() - startTime,
              rowsAffected: 0,
              cacheHit: true,
              timestamp: Date.now()
            })
          }

          console.log(`🚀 Cache hit for query: ${operation}`)
          return cached
        }
      }

      // Execute database query
      const result = await this.executeWithRetry<T>(async () => {
        return executeWithPool(async (client) => {
          return this.executeQuery<T>(client, operation, params)
        })
      }, queryConfig.retryAttempts)

      // Cache result for read operations
      if (queryConfig.useCache && this.isReadOperation(operation)) {
        AnalyticsCache.setMetrics(cacheKey, result, queryConfig.cacheTTL)
      }

      // Profile query
      if (queryConfig.enableProfiling) {
        const executionTime = Date.now() - startTime
        this.profileQuery({
          query: operation,
          executionTime,
          rowsAffected: this.getRowCount(result),
          cacheHit,
          timestamp: Date.now()
        })
      }

      return result

    } catch (error) {
      console.error(`❌ Query execution failed: ${operation}`, error)
      throw error
    }
  }

  /**
   * Execute specific query types with optimizations
   */
  private async executeQuery<T>(client: any, operation: string, params: any): Promise<T> {
    switch (operation) {
      case 'GET_OTP':
        return this.getOTPQuery(client, params)
      case 'CREATE_OTP':
        return this.createOTPQuery(client, params)
      case 'VERIFY_OTP':
        return this.verifyOTPQuery(client, params)
      case 'GET_AUDIT_LOGS':
        return this.getAuditLogsQuery(client, params)
      case 'CREATE_AUDIT_LOG':
        return this.createAuditLogQuery(client, params)
      case 'GET_RATE_LIMIT':
        return this.getRateLimitQuery(client, params)
      case 'UPDATE_RATE_LIMIT':
        return this.updateRateLimitQuery(client, params)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  /**
   * Optimized OTP queries
   */
  private async getOTPQuery<T>(client: any, params: { phoneNumber: string }): Promise<T> {
    const { data, error } = await client
      .from('otp_codes')
      .select('*')
      .eq('phone_number', params.phoneNumber)
      .eq('is_verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  private async createOTPQuery<T>(client: any, params: any): Promise<T> {
    // First, invalidate existing OTPs for this phone number
    await client
      .from('otp_codes')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('phone_number', params.phoneNumber)
      .eq('is_verified', false)

    // Create new OTP
    const { data, error } = await client
      .from('otp_codes')
      .insert(params)
      .select()
      .single()

    if (error) throw error
    return data
  }

  private async verifyOTPQuery<T>(client: any, params: { id: string; phoneNumber: string }): Promise<T> {
    const { data, error } = await client
      .from('otp_codes')
      .update({ 
        is_verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('id', params.id)
      .eq('phone_number', params.phoneNumber)
      .eq('is_verified', false)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Optimized audit log queries
   */
  private async getAuditLogsQuery<T>(client: any, params: any): Promise<T> {
    let query = client
      .from('audit_logs')
      .select('*')

    // Add filters
    if (params.eventType) {
      query = query.eq('event_type', params.eventType)
    }

    if (params.phoneNumber) {
      query = query.eq('phone_number', params.phoneNumber)
    }

    if (params.startTime) {
      query = query.gte('timestamp', params.startTime)
    }

    if (params.endTime) {
      query = query.lte('timestamp', params.endTime)
    }

    // Add ordering and pagination
    query = query
      .order('timestamp', { ascending: false })
      .limit(params.limit || 100)

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 100) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  private async createAuditLogQuery<T>(client: any, params: any): Promise<T> {
    const { data, error } = await client
      .from('audit_logs')
      .insert(params)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Rate limiting queries
   */
  private async getRateLimitQuery<T>(client: any, params: { key: string }): Promise<T> {
    const { data, error } = await client
      .from('rate_limits')
      .select('*')
      .eq('key', params.key)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  private async updateRateLimitQuery<T>(client: any, params: any): Promise<T> {
    const { data, error } = await client
      .from('rate_limits')
      .upsert(params, { onConflict: 'key' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Helper methods
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxAttempts) {
          break
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100
        console.warn(`⚠️ Query attempt ${attempt} failed, retrying in ${delay}ms:`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  private generateCacheKey(operation: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort())
    return `${operation}:${paramString}`
  }

  private isReadOperation(operation: string): boolean {
    return operation.startsWith('GET_') || operation.includes('SELECT')
  }

  private getRowCount(result: any): number {
    if (Array.isArray(result)) return result.length
    if (result && typeof result === 'object') return 1
    return 0
  }

  private profileQuery(profile: QueryProfile): void {
    this.queryProfiles.push(profile)

    // Keep only recent profiles
    if (this.queryProfiles.length > this.maxProfileHistory) {
      this.queryProfiles = this.queryProfiles.slice(-this.maxProfileHistory)
    }

    // Log slow queries
    if (profile.executionTime > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected (${profile.executionTime}ms): ${profile.query}`)
    }
  }

  /**
   * Performance analysis methods
   */
  getQueryStats(): any {
    const profiles = this.queryProfiles
    if (profiles.length === 0) return null

    const totalQueries = profiles.length
    const avgExecutionTime = profiles.reduce((sum, p) => sum + p.executionTime, 0) / totalQueries
    const slowQueries = profiles.filter(p => p.executionTime > this.slowQueryThreshold).length
    const cacheHits = profiles.filter(p => p.cacheHit).length
    const cacheHitRate = (cacheHits / totalQueries) * 100

    return {
      totalQueries,
      avgExecutionTime: Math.round(avgExecutionTime),
      slowQueries,
      slowQueryRate: Math.round((slowQueries / totalQueries) * 100),
      cacheHitRate: Math.round(cacheHitRate),
      recentQueries: profiles.slice(-10)
    }
  }

  getIndexSuggestions(): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = []

    // Analyze slow queries for index opportunities
    const slowQueries = this.queryProfiles.filter(p => p.executionTime > this.slowQueryThreshold)
    
    if (slowQueries.some(q => q.query.includes('phone_number'))) {
      suggestions.push({
        table: 'otp_codes',
        columns: ['phone_number', 'is_verified', 'expires_at'],
        reason: 'Frequent queries filtering by phone_number and verification status',
        estimatedImprovement: '60-80% faster OTP lookups'
      })
    }

    if (slowQueries.some(q => q.query.includes('timestamp'))) {
      suggestions.push({
        table: 'audit_logs',
        columns: ['timestamp', 'event_type'],
        reason: 'Analytics queries often filter by timestamp and event type',
        estimatedImprovement: '40-60% faster analytics queries'
      })
    }

    return suggestions
  }

  /**
   * Generate database optimization SQL
   */
  generateOptimizationSQL(): string[] {
    const sql: string[] = []

    // OTP codes table optimizations
    sql.push(`
-- OTP Codes Table Indexes
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_active 
ON otp_codes (phone_number, is_verified, expires_at) 
WHERE is_verified = false;
`)

    sql.push(`
-- Audit Logs Table Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_type 
ON audit_logs (timestamp DESC, event_type);
`)

    sql.push(`
-- Rate Limits Table Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_updated 
ON rate_limits (key, updated_at) 
WHERE expires_at > NOW();
`)

    // Performance monitoring views
    sql.push(`
-- Query Performance View
CREATE OR REPLACE VIEW query_performance AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan > 0
ORDER BY idx_scan DESC;
`)

    return sql
  }
}

// Global optimizer instance
const queryOptimizer = new DatabaseQueryOptimizer()

/**
 * Optimized OTP operations
 */
export const OptimizedOTP = {
  get: async (phoneNumber: string) => {
    return queryOptimizer.executeOTPQuery('GET_OTP', { phoneNumber })
  },

  create: async (otpData: any) => {
    return queryOptimizer.executeOTPQuery('CREATE_OTP', otpData, { useCache: false })
  },

  verify: async (id: string, phoneNumber: string) => {
    return queryOptimizer.executeOTPQuery('VERIFY_OTP', { id, phoneNumber }, { useCache: false })
  }
}

/**
 * Optimized audit operations
 */
export const OptimizedAudit = {
  getLogs: async (filters: any) => {
    return queryOptimizer.executeOTPQuery('GET_AUDIT_LOGS', filters, { 
      cacheTTL: 120000 // 2 minutes cache
    })
  },

  createLog: async (logData: any) => {
    return queryOptimizer.executeOTPQuery('CREATE_AUDIT_LOG', logData, { useCache: false })
  }
}

export { DatabaseQueryOptimizer, queryOptimizer }
export type { QueryConfig, QueryProfile, IndexSuggestion }
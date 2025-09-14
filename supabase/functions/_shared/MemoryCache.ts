/**
 * In-Memory Caching System for Edge Functions
 * Provides fast data access and reduces database load
 * Created: September 14, 2025
 */

interface CacheItem<T> {
  value: T
  expiresAt: number
  createdAt: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
  totalOperations: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    totalOperations: 0
  }
  private config: CacheConfig
  private cleanupTimer?: number

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60000 // 1 minute
    }

    this.startCleanupTimer()
    console.log('🗄️ Memory cache initialized:', this.config)
  }

  /**
   * Set cache item
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL)
    const now = Date.now()

    const item: CacheItem<T> = {
      value,
      expiresAt,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0
    }

    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldestItems()
    }

    this.cache.set(key, item)
    this.updateStats()

    console.log(`📦 Cache SET: ${key} (expires in ${ttl || this.config.defaultTTL}ms)`)
  }

  /**
   * Get cache item
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined

    if (!item) {
      this.stats.misses++
      this.stats.totalOperations++
      this.updateHitRate()
      console.log(`❌ Cache MISS: ${key}`)
      return null
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.totalOperations++
      this.updateHitRate()
      console.log(`⏰ Cache EXPIRED: ${key}`)
      return null
    }

    // Update access stats
    item.lastAccessed = Date.now()
    item.accessCount++
    
    this.stats.hits++
    this.stats.totalOperations++
    this.updateHitRate()
    this.updateStats()

    console.log(`✅ Cache HIT: ${key} (accessed ${item.accessCount} times)`)
    return item.value
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    this.updateStats()
    
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`)
    }
    
    return deleted
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.updateStats()
      return false
    }

    return true
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      totalOperations: 0
    }
    console.log('🧹 Cache cleared')
  }

  /**
   * Get or set cache item (memoization pattern)
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    console.log(`⚡ Cache factory execution for: ${key}`)
    const value = await factory()
    this.set(key, value, ttl)
    
    return value
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    if (this.stats.totalOperations > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalOperations) * 100
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredItems()
    }, this.config.cleanupInterval)
  }

  /**
   * Clean up expired items
   */
  private cleanupExpiredItems(): void {
    const now = Date.now()
    const before = this.cache.size
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }

    const removed = before - this.cache.size
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired cache items`)
      this.updateStats()
    }
  }

  /**
   * Evict oldest items when cache is full
   */
  private evictOldestItems(): void {
    const items = Array.from(this.cache.entries())
    
    // Sort by last accessed time (oldest first)
    items.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
    
    // Remove 20% of oldest items
    const toRemove = Math.ceil(items.length * 0.2)
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = items[i]
      this.cache.delete(key)
      console.log(`🚮 Evicted old cache item: ${key}`)
    }
    
    this.updateStats()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats()
    this.updateHitRate()
    return { ...this.stats }
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Close cache and cleanup
   */
  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
    console.log('🔒 Memory cache closed')
  }
}

// Global cache instances
const otpCache = new MemoryCache({
  maxSize: 2000,
  defaultTTL: 600000, // 10 minutes for OTP data
  cleanupInterval: 30000 // 30 seconds
})

const rateLimitCache = new MemoryCache({
  maxSize: 5000,
  defaultTTL: 3600000, // 1 hour for rate limit counters
  cleanupInterval: 60000 // 1 minute
})

const analyticsCache = new MemoryCache({
  maxSize: 500,
  defaultTTL: 300000, // 5 minutes for analytics data
  cleanupInterval: 120000 // 2 minutes
})

/**
 * OTP-specific cache operations
 */
export const OTPCache = {
  setOTP: (phoneNumber: string, otp: string, ttl: number = 300000) => {
    const key = `otp:${phoneNumber}`
    otpCache.set(key, { otp, createdAt: Date.now() }, ttl)
  },

  getOTP: (phoneNumber: string) => {
    const key = `otp:${phoneNumber}`
    return otpCache.get<{ otp: string; createdAt: number }>(key)
  },

  deleteOTP: (phoneNumber: string) => {
    const key = `otp:${phoneNumber}`
    return otpCache.delete(key)
  },

  setAttempts: (phoneNumber: string, attempts: number, ttl: number = 3600000) => {
    const key = `attempts:${phoneNumber}`
    otpCache.set(key, attempts, ttl)
  },

  getAttempts: (phoneNumber: string): number => {
    const key = `attempts:${phoneNumber}`
    return otpCache.get<number>(key) || 0
  },

  incrementAttempts: (phoneNumber: string): number => {
    const current = OTPCache.getAttempts(phoneNumber)
    const newCount = current + 1
    OTPCache.setAttempts(phoneNumber, newCount)
    return newCount
  }
}

/**
 * Rate limiting cache operations
 */
export const RateLimitCache = {
  setCounter: (key: string, count: number, ttl: number = 3600000) => {
    rateLimitCache.set(`rate:${key}`, count, ttl)
  },

  getCounter: (key: string): number => {
    return rateLimitCache.get<number>(`rate:${key}`) || 0
  },

  incrementCounter: (key: string, ttl: number = 3600000): number => {
    const current = RateLimitCache.getCounter(key)
    const newCount = current + 1
    RateLimitCache.setCounter(key, newCount, ttl)
    return newCount
  }
}

/**
 * Analytics cache operations
 */
export const AnalyticsCache = {
  setMetrics: (key: string, data: any, ttl: number = 300000) => {
    analyticsCache.set(`analytics:${key}`, data, ttl)
  },

  getMetrics: <T>(key: string): T | null => {
    return analyticsCache.get<T>(`analytics:${key}`)
  },

  getCachedOrFetch: async <T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl: number = 300000
  ): Promise<T> => {
    return analyticsCache.getOrSet(`analytics:${key}`, factory, ttl)
  }
}

/**
 * Get all cache statistics
 */
export const getCacheStats = () => {
  return {
    otp: otpCache.getStats(),
    rateLimit: rateLimitCache.getStats(),
    analytics: analyticsCache.getStats()
  }
}

export { MemoryCache }
export type { CacheItem, CacheStats, CacheConfig }
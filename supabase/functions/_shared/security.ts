// Rate Limiting and Input Validation for SMS API
// Created: September 21, 2025

interface RateLimitEntry {
  count: number
  windowStart: number
  lastRequest: number
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  sanitized?: any
}

interface SMSAccountRequest {
  userId?: string
  username?: string
  creditAmount?: number
}

/**
 * In-memory rate limiter for Edge Functions
 * In production, should use Redis or database for persistence
 */
export class RateLimiter {
  private readonly limits = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxRequests: number
  
  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 10) { // 15 minutes, 10 requests
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now - entry.windowStart >= this.windowMs) {
      // New window or no previous entry
      this.limits.set(identifier, {
        count: 1,
        windowStart: now,
        lastRequest: now
      })
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    // Within existing window
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.windowStart + this.windowMs
      }
    }

    // Update entry
    entry.count++
    entry.lastRequest = now
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.windowStart + this.windowMs
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const expired: string[] = []
    
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.windowStart >= this.windowMs) {
        expired.push(key)
      }
    }
    
    expired.forEach(key => this.limits.delete(key))
    
    if (expired.length > 0) {
      console.log(`🧹 Cleaned up ${expired.length} expired rate limit entries`)
    }
  }

  /**
   * Get current status for identifier
   */
  getStatus(identifier: string): { requests: number; window: number; remaining: number } {
    const entry = this.limits.get(identifier)
    if (!entry) {
      return { requests: 0, window: 0, remaining: this.maxRequests }
    }

    return {
      requests: entry.count,
      window: entry.windowStart,
      remaining: Math.max(0, this.maxRequests - entry.count)
    }
  }
}

/**
 * Input validation and sanitization
 */
export class InputValidator {
  
  /**
   * Validate SMS account creation request
   */
  static validateSMSAccountRequest(data: any): ValidationResult {
    const errors: string[] = []
    const sanitized: SMSAccountRequest = {}

    // Validate userId
    if (data.userId) {
      if (typeof data.userId !== 'string') {
        errors.push('userId must be a string')
      } else if (!this.isValidUUID(data.userId)) {
        errors.push('userId must be a valid UUID')
      } else {
        sanitized.userId = data.userId.trim()
      }
    }

    // Validate username (optional, will be generated if not provided)
    if (data.username) {
      if (typeof data.username !== 'string') {
        errors.push('username must be a string')
      } else if (!this.isValidUsername(data.username)) {
        errors.push('username must be 6-12 characters, alphanumeric only')
      } else {
        sanitized.username = data.username.trim().toUpperCase()
      }
    }

    // Validate creditAmount
    if (data.creditAmount !== undefined) {
      if (typeof data.creditAmount !== 'number') {
        errors.push('creditAmount must be a number')
      } else if (!Number.isInteger(data.creditAmount) || data.creditAmount < 0 || data.creditAmount > 10000) {
        errors.push('creditAmount must be an integer between 0 and 10000')
      } else {
        sanitized.creditAmount = data.creditAmount
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    }
  }

  /**
   * Validate credit sync request
   */
  static validateCreditSyncRequest(data: any): ValidationResult {
    const errors: string[] = []
    const sanitized: any = {}

    if (data.userId) {
      if (typeof data.userId !== 'string') {
        errors.push('userId must be a string')
      } else if (!this.isValidUUID(data.userId)) {
        errors.push('userId must be a valid UUID')
      } else {
        sanitized.userId = data.userId.trim()
      }
    }

    if (data.forceSync !== undefined) {
      if (typeof data.forceSync !== 'boolean') {
        errors.push('forceSync must be a boolean')
      } else {
        sanitized.forceSync = data.forceSync
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    }
  }

  /**
   * Sanitize string for logging (remove potential injection attempts)
   */
  static sanitizeForLogging(input: any): string {
    if (typeof input !== 'string') {
      return String(input)
    }

    return input
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .replace(/[<>'"&]/g, '?') // Replace potential HTML/SQL injection chars
      .substring(0, 100) // Limit length
  }

  /**
   * Check if string is valid UUID
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Check if username is valid
   */
  private static isValidUsername(username: string): boolean {
    // 6-12 characters, alphanumeric only
    const usernameRegex = /^[A-Z0-9]{6,12}$/i
    return usernameRegex.test(username)
  }

  /**
   * Remove sensitive data from object for logging
   */
  static removeSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const sensitiveKeys = [
      'password', 'pass', 'pwd', 'secret', 'token', 'key',
      'credential', 'auth', 'final_password', 'encrypted', 'authorization'
    ]

    const cleaned: any = Array.isArray(obj) ? [] : {}

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase()
      const isSensitive = sensitiveKeys.some(sensitive => keyLower.includes(sensitive))

      if (isSensitive) {
        cleaned[key] = '***REDACTED***'
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = this.removeSensitiveData(value)
      } else {
        cleaned[key] = value
      }
    }

    return cleaned
  }
}

/**
 * Security headers for API responses
 */
export class SecurityHeaders {
  static getSecureHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }

  static getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*', // Should be more restrictive in production
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  }

  static getAllHeaders(): Record<string, string> {
    return {
      ...this.getCorsHeaders(),
      ...this.getSecureHeaders()
    }
  }
}

// Export instances
export const rateLimiter = new RateLimiter()
export const validator = InputValidator
export const securityHeaders = SecurityHeaders
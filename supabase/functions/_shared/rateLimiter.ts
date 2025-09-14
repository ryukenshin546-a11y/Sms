/**
 * Rate Limiting Utility for OTP System
 * Provides IP-based and Phone-based rate limiting functionality
 * Version: 1.0
 * Date: September 14, 2025
 */

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  keyPrefix: string;     // Redis key prefix
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

export class RateLimiter {
  private supabase: any;
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Check rate limit for a given key (IP address or phone number)
   */
  async checkRateLimit(
    key: string, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const rateLimitKey = `${config.keyPrefix}:${key}`;
    
    try {
      // Get existing rate limit data
      const { data: existingData, error: fetchError } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('key', rateLimitKey)
        .gte('timestamp', new Date(windowStart).toISOString())
        .order('timestamp', { ascending: false });

      if (fetchError) {
        console.error('Rate limit fetch error:', fetchError);
        // Allow request if we can't check rate limit
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs,
          totalHits: 1
        };
      }

      // Count requests in current window
      const currentWindowRequests = existingData ? existingData.length : 0;
      
      // Check if rate limit exceeded
      if (currentWindowRequests >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + config.windowMs,
          totalHits: currentWindowRequests
        };
      }

      // Record this request
      const { error: insertError } = await this.supabase
        .from('rate_limits')
        .insert([{
          key: rateLimitKey,
          timestamp: new Date(now).toISOString(),
          request_count: 1
        }]);

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
      }

      // Clean up old entries (optional, can be done by a cron job)
      await this.cleanupOldEntries(rateLimitKey, windowStart);

      return {
        allowed: true,
        remaining: config.maxRequests - currentWindowRequests - 1,
        resetTime: now + config.windowMs,
        totalHits: currentWindowRequests + 1
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request if there's an error
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        totalHits: 1
      };
    }
  }

  /**
   * Clean up old rate limit entries
   */
  private async cleanupOldEntries(keyPattern: string, windowStart: number) {
    try {
      await this.supabase
        .from('rate_limits')
        .delete()
        .eq('key', keyPattern)
        .lt('timestamp', new Date(windowStart).toISOString());
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get client IP address from request
   */
  static getClientIP(request: Request): string {
    // Try various headers for IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    if (cfConnectingIp) {
      return cfConnectingIp;
    }
    
    // Fallback to a default if no IP found
    return 'unknown';
  }

  /**
   * Enhance security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    };
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhoneNumber(phone: string): string | null {
    if (!phone || typeof phone !== 'string') {
      return null;
    }
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Validate Thai phone number format
    const thaiPhoneRegex = /^(?:\+66|66|0)(6|7|8|9)\d{8}$/;
    
    if (!thaiPhoneRegex.test(cleaned)) {
      return null;
    }
    
    // Normalize to 66xxxxxxxxx format
    if (cleaned.startsWith('0')) {
      return '66' + cleaned.substring(1);
    } else if (cleaned.startsWith('66')) {
      return cleaned;
    } else {
      return null;
    }
  }

  /**
   * Validate OTP code format
   */
  static validateOTPCode(otpCode: string): boolean {
    if (!otpCode || typeof otpCode !== 'string') {
      return false;
    }
    
    // OTP should be 4-6 digits (SMS UP Plus typically sends 4-digit OTP)
    return /^\d{4,6}$/.test(otpCode);
  }
}

// Rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  IP_SEND_OTP: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 5,           // 5 requests per minute per IP
    keyPrefix: 'ip_send_otp'
  },
  PHONE_SEND_OTP: {
    windowMs: 5 * 60 * 1000,  // 5 minutes
    maxRequests: 3,           // 3 OTP requests per 5 minutes per phone
    keyPrefix: 'phone_send_otp'
  },
  IP_VERIFY_OTP: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 verify attempts per minute per IP
    keyPrefix: 'ip_verify_otp'
  },
  PHONE_VERIFY_OTP: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 verify attempts per 15 minutes per phone
    keyPrefix: 'phone_verify_otp'
  }
};
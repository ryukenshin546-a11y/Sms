/**
 * Security Headers Management for Production
 * Version: 2.3
 * Date: September 14, 2025
 */

export interface SecurityHeadersConfig {
  enableHSTS: boolean;
  enableCSP: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  corsAllowedOrigins: string[];
}

export class SecurityHeaders {
  private config: SecurityHeadersConfig;
  
  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = {
      enableHSTS: true,
      enableCSP: true,
      enableXFrameOptions: true,
      enableXContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      corsAllowedOrigins: ['*'], // Override in production
      ...config
    };
  }
  
  /**
   * Get comprehensive security headers for Edge Functions
   */
  public getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // CORS Headers
    headers['Access-Control-Allow-Origin'] = this.getCORSOrigin();
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'authorization, x-client-info, apikey, content-type, x-request-id';
    headers['Access-Control-Max-Age'] = '86400'; // 24 hours
    
    // Security Headers
    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }
    
    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = this.getCSPPolicy();
    }
    
    if (this.config.enableXFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }
    
    if (this.config.enableXContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }
    
    if (this.config.enablePermissionsPolicy) {
      headers['Permissions-Policy'] = this.getPermissionsPolicy();
    }
    
    // Additional security headers
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    
    // Custom headers for API
    headers['X-API-Version'] = '2.3';
    headers['X-Security-Policy'] = 'strict';
    
    return headers;
  }
  
  /**
   * Get CORS headers for specific origin
   */
  public getCORSHeaders(origin?: string): Record<string, string> {
    const allowedOrigin = this.isOriginAllowed(origin) ? origin : this.config.corsAllowedOrigins[0];
    
    return {
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
      'Access-Control-Expose-Headers': 'x-request-id, x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset',
      'Access-Control-Max-Age': '86400'
    };
  }
  
  /**
   * Get rate limiting headers
   */
  public getRateLimitHeaders(limit: number, remaining: number, resetTime: number): Record<string, string> {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
    };
  }
  
  /**
   * Get error response headers (sanitized)
   */
  public getErrorHeaders(): Record<string, string> {
    return {
      ...this.getSecurityHeaders(),
      'Content-Type': 'application/json',
      'X-Error-Handled': 'true',
      'Cache-Control': 'no-store'
    };
  }
  
  /**
   * Get success response headers
   */
  public getSuccessHeaders(requestId?: string): Record<string, string> {
    const headers = {
      ...this.getSecurityHeaders(),
      'Content-Type': 'application/json',
      'X-Response-Time': Date.now().toString()
    };
    
    if (requestId) {
      headers['X-Request-ID'] = requestId;
    }
    
    return headers;
  }
  
  private getCORSOrigin(): string {
    if (this.config.corsAllowedOrigins.length === 1 && this.config.corsAllowedOrigins[0] === '*') {
      return '*';
    }
    return this.config.corsAllowedOrigins[0] || '*';
  }
  
  private isOriginAllowed(origin?: string): boolean {
    if (!origin) return false;
    if (this.config.corsAllowedOrigins.includes('*')) return true;
    return this.config.corsAllowedOrigins.includes(origin);
  }
  
  private getCSPPolicy(): string {
    return [
      "default-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  private getPermissionsPolicy(): string {
    return [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()'
    ].join(', ');
  }
}

/**
 * Input Sanitization and Validation
 */
export class InputSanitizer {
  /**
   * Sanitize phone number input
   */
  public static sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }
  
  /**
   * Sanitize user ID input
   */
  public static sanitizeUserId(userId: string): string {
    // Allow only alphanumeric, hyphens, and underscores
    return userId.replace(/[^a-zA-Z0-9\-_]/g, '');
  }
  
  /**
   * Sanitize OTP code input
   */
  public static sanitizeOTPCode(otp: string): string {
    // Allow only digits
    return otp.replace(/\D/g, '');
  }
  
  /**
   * Sanitize string for logging (prevent log injection)
   */
  public static sanitizeForLog(input: string): string {
    return input
      .replace(/[\r\n\t]/g, ' ')  // Replace newlines and tabs
      .replace(/[<>]/g, '')       // Remove HTML tags
      .trim()
      .substring(0, 200);         // Limit length
  }
  
  /**
   * Validate UUID format
   */
  public static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Validate email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate IP address format
   */
  public static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
  
  /**
   * Sanitize error message for client response
   */
  public static sanitizeErrorMessage(error: string): string {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password/gi,
      /secret/gi,
      /key/gi,
      /token/gi,
      /credential/gi,
      /api[_-]?key/gi,
      /auth/gi
    ];
    
    let sanitized = error;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized.substring(0, 100); // Limit error message length
  }
}
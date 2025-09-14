/**
 * Security Configuration for Production Deployment
 * ระบบจัดการความปลอดภัยสำหรับการใช้งานจริง
 */

export interface SecurityHeaders {
  [key: string]: string;
}

export interface CORSConfig {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
}

/**
 * Security Configuration Manager
 */
export class SecurityConfig {
  private static instance: SecurityConfig;
  private environment: string;

  private constructor() {
    this.environment = Deno.env.get('ENVIRONMENT') || 'development';
  }

  public static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      SecurityConfig.instance = new SecurityConfig();
    }
    return SecurityConfig.instance;
  }

  /**
   * Get enhanced security headers
   */
  getSecurityHeaders(): SecurityHeaders {
    const baseHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.getCSPHeader(),
    };

    // เพิ่ม headers เฉพาะ production
    if (this.environment === 'production') {
      return {
        ...baseHeaders,
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
      };
    }

    return baseHeaders;
  }

  /**
   * Get Content Security Policy header
   */
  private getCSPHeader(): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://mnhdueclyzwtfkmwttkc.supabase.co https://web.smsup-plus.com",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ];

    return policies.join('; ');
  }

  /**
   * Get CORS configuration
   */
  getCORSConfig(): CORSConfig {
    const corsOrigins = Deno.env.get('CORS_ORIGINS') || '*';
    
    return {
      origins: corsOrigins === '*' ? ['*'] : corsOrigins.split(',').map(o => o.trim()),
      methods: ['GET', 'POST', 'OPTIONS'],
      headers: [
        'authorization',
        'x-client-info',
        'apikey',
        'content-type',
        'x-request-id',
        'x-user-agent'
      ],
      credentials: false
    };
  }

  /**
   * Generate CORS headers
   */
  getCORSHeaders(origin?: string): SecurityHeaders {
    const corsConfig = this.getCORSConfig();
    const securityHeaders = this.getSecurityHeaders();
    
    // ตรวจสอบ origin
    const allowedOrigin = this.isOriginAllowed(origin, corsConfig.origins) ? 
      origin || '*' : 'null';

    return {
      ...securityHeaders,
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': corsConfig.headers.join(', '),
      'Access-Control-Allow-Methods': corsConfig.methods.join(', '),
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin',
    };
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
    if (!origin || allowedOrigins.includes('*')) {
      return true;
    }
    
    return allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
  }

  /**
   * Validate request headers for security
   */
  validateRequestHeaders(headers: Headers): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // ตรวจสอบ Content-Type
    const contentType = headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      errors.push('Invalid content-type header');
    }

    // ตรวจสอบ User-Agent
    const userAgent = headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      errors.push('Invalid or missing user-agent');
    }

    // ตรวจสอบ Authorization
    const authorization = headers.get('authorization');
    if (authorization && !this.isValidAuthHeader(authorization)) {
      errors.push('Invalid authorization header format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate authorization header
   */
  private isValidAuthHeader(authHeader: string): boolean {
    // Basic validation for Bearer token
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return token.length > 20; // Minimum token length
    }
    return false;
  }

  /**
   * Generate request signature (for API verification)
   */
  generateRequestSignature(method: string, path: string, timestamp: string, body?: string): string {
    const payload = `${method.toUpperCase()}${path}${timestamp}${body || ''}`;
    
    // ใช้ crypto API สำหรับ hash
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    
    // สำหรับ demo - ใน production ควรใช้ HMAC with secret key
    return btoa(payload).substring(0, 32);
  }

  /**
   * Validate request timestamp (prevent replay attacks)
   */
  validateTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
    const now = Math.floor(Date.now() / 1000);
    const reqTime = parseInt(timestamp);
    
    if (isNaN(reqTime)) {
      return false;
    }
    
    const age = now - reqTime;
    return age >= 0 && age <= maxAgeSeconds;
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Check if request is from trusted source
   */
  isTrustedSource(request: Request): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for');
    
    // Basic checks - can be enhanced
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /hack/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
}

/**
 * Environment-specific configurations
 */
export const ENVIRONMENT_CONFIG = {
  development: {
    logLevel: 'debug',
    enableDetailedErrors: true,
    allowTestPhoneNumbers: true,
    rateLimitStrict: false,
  },
  staging: {
    logLevel: 'info',
    enableDetailedErrors: true,
    allowTestPhoneNumbers: true,
    rateLimitStrict: true,
  },
  production: {
    logLevel: 'warn',
    enableDetailedErrors: false,
    allowTestPhoneNumbers: false,
    rateLimitStrict: true,
  }
};

/**
 * Helper functions
 */
export function getEnvironmentConfig() {
  const env = Deno.env.get('ENVIRONMENT') || 'development';
  return ENVIRONMENT_CONFIG[env as keyof typeof ENVIRONMENT_CONFIG] || ENVIRONMENT_CONFIG.development;
}

export function getSecurityHeaders(): SecurityHeaders {
  return SecurityConfig.getInstance().getSecurityHeaders();
}

export function getCORSHeaders(origin?: string): SecurityHeaders {
  return SecurityConfig.getInstance().getCORSHeaders(origin);
}

export function validateRequest(request: Request) {
  const security = SecurityConfig.getInstance();
  return {
    headers: security.validateRequestHeaders(request.headers),
    trusted: security.isTrustedSource(request),
  };
}
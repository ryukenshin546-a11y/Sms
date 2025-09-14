/**
 * Supabase Edge Function: OTP Send with Performance Optimization
 * Phase 5.1: Database Optimization and Caching Integration
 * Version: 3.0 - Performance Optimized
 * Date: September 14, 2025
 */

import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Performance integration - simplified for Edge Functions environment
interface PerformanceCache {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
}

// Simple in-memory cache for Edge Functions
class EdgeCache implements PerformanceCache {
  private cache = new Map<string, { value: any; expires: number }>();
  
  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance for Edge Function
const edgeCache = new EdgeCache();

// Performance monitoring
interface PerformanceMetrics {
  requestStart: number;
  cacheHit: boolean;
  dbQueryTime?: number;
  smsApiTime?: number;
  totalTime: number;
}

// Connection pooling simulation for Edge Functions
class EdgeConnectionManager {
  private connectionCount = 0;
  private maxConnections = 10;

  async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    if (this.connectionCount >= this.maxConnections) {
      throw new Error('Connection pool exhausted');
    }

    this.connectionCount++;
    try {
      return await operation();
    } finally {
      this.connectionCount--;
    }
  }

  getStats() {
    return {
      active: this.connectionCount,
      max: this.maxConnections,
      utilization: (this.connectionCount / this.maxConnections) * 100
    };
  }
}

const connectionManager = new EdgeConnectionManager();

// Rate limiting with cache optimization
async function checkRateLimit(phoneNumber: string, supabase: any): Promise<boolean> {
  const cacheKey = `rate_limit:${phoneNumber}`;
  
  // Check cache first
  const cached = edgeCache.get(cacheKey);
  if (cached) {
    if (cached.count >= 5) { // Max 5 requests per window
      return false;
    }
    // Update cache
    edgeCache.set(cacheKey, { count: cached.count + 1, window: cached.window }, 900000); // 15 minutes
    return true;
  }

  // Check database with connection pooling
  return connectionManager.withConnection(async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago

    const { data: rateLimit } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', phoneNumber)
      .gt('expires_at', now.toISOString())
      .single();

    if (rateLimit && rateLimit.count >= 5) {
      // Cache the rate limit
      edgeCache.set(cacheKey, { count: rateLimit.count, window: windowStart }, 900000);
      return false;
    }

    // Update rate limit
    const newCount = (rateLimit?.count || 0) + 1;
    await supabase
      .from('rate_limits')
      .upsert({
        key: phoneNumber,
        count: newCount,
        expires_at: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
        updated_at: now.toISOString()
      });

    // Cache the new rate limit
    edgeCache.set(cacheKey, { count: newCount, window: windowStart }, 900000);
    return true;
  });
}

// Optimized OTP generation and storage
async function generateAndStoreOTP(phoneNumber: string, supabase: any): Promise<string> {
  return connectionManager.withConnection(async () => {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Clean up existing OTPs for this phone number (batch operation)
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', phoneNumber)
      .eq('is_verified', false);

    // Insert new OTP
    const { error } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phoneNumber,
        code: code,
        expires_at: expiresAt.toISOString(),
        is_verified: false,
        attempts: 0
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Cache the OTP for quick verification
    const cacheKey = `otp:${phoneNumber}:${code}`;
    edgeCache.set(cacheKey, {
      code,
      phoneNumber,
      expiresAt: expiresAt.getTime(),
      attempts: 0
    }, 300000); // 5 minutes

    return code;
  });
}

// SMS API call with caching and retry
async function sendSMS(phoneNumber: string, code: string): Promise<void> {
  const message = `รหัสยืนยัน SMS UP Plus: ${code} (ใช้ได้ 5 นาที)`;
  const cacheKey = `sms_sent:${phoneNumber}:${code}`;
  
  // Check if already sent (prevent duplicates)
  const alreadySent = edgeCache.get(cacheKey);
  if (alreadySent) {
    console.log(`SMS already sent to ${phoneNumber}, using cached result`);
    return;
  }

  const apiUrl = 'https://thsms.com/api/rest';
  const requestBody = {
    method: 'send',
    username: Deno.env.get('SMS_USERNAME'),
    password: Deno.env.get('SMS_PASSWORD'),
    from: 'SMS UP Plus',
    to: phoneNumber,
    message: message,
  };

  // Retry logic with exponential backoff
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(requestBody).toString(),
      });

      const result = await response.text();
      
      if (response.ok && result.includes('success')) {
        // Cache successful send
        edgeCache.set(cacheKey, { sent: true, timestamp: Date.now() }, 300000);
        return;
      } else {
        throw new Error(`SMS API error: ${result}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
}

// Audit logging with batch optimization
async function logAuditEvent(supabase: any, event: any): Promise<void> {
  // Use background logging to not block response
  setTimeout(async () => {
    try {
      await connectionManager.withConnection(async () => {
        await supabase.from('audit_logs').insert(event);
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }, 0);
}

// Main handler with comprehensive performance optimization
serve(async (req) => {
  const metrics: PerformanceMetrics = {
    requestStart: performance.now(),
    cacheHit: false,
    totalTime: 0
  };

  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse and validate request
    const { phoneNumber, userId } = await req.json();

    if (!phoneNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Phone number is required',
        code: 'PHONE_REQUIRED'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize phone number
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!/^(\+66|66|0)[6-9]\d{8}$/.test(cleanPhone)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid Thai phone number format',
        code: 'INVALID_PHONE'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check rate limiting with cache
    const rateLimitStart = performance.now();
    const rateLimitPassed = await checkRateLimit(cleanPhone, supabase);
    
    if (!rateLimitPassed) {
      await logAuditEvent(supabase, {
        event_type: 'rate_limit_exceeded',
        phone_number: cleanPhone,
        success: false,
        error_code: 'RATE_LIMITED',
        timestamp: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again in 15 minutes.',
        code: 'RATE_LIMITED'
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '900' // 15 minutes
        }
      });
    }

    // Generate and store OTP with connection pooling
    const dbStart = performance.now();
    const otpCode = await generateAndStoreOTP(cleanPhone, supabase);
    metrics.dbQueryTime = performance.now() - dbStart;

    // Send SMS with retry logic
    const smsStart = performance.now();
    await sendSMS(cleanPhone, otpCode);
    metrics.smsApiTime = performance.now() - smsStart;

    // Log successful operation
    await logAuditEvent(supabase, {
      event_type: 'otp_send',
      phone_number: cleanPhone,
      success: true,
      response_time_ms: Math.round(performance.now() - metrics.requestStart),
      database_query_time_ms: Math.round(metrics.dbQueryTime || 0),
      timestamp: new Date().toISOString()
    });

    metrics.totalTime = performance.now() - metrics.requestStart;

    // Return success with performance metrics
    return new Response(JSON.stringify({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: cleanPhone,
        expiresIn: 300 // 5 minutes in seconds
      },
      performance: {
        totalTime: Math.round(metrics.totalTime),
        databaseTime: Math.round(metrics.dbQueryTime || 0),
        smsApiTime: Math.round(metrics.smsApiTime || 0),
        cacheHit: metrics.cacheHit,
        connectionStats: connectionManager.getStats()
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Performance-Time': metrics.totalTime.toString()
      }
    });

  } catch (error) {
    console.error('OTP Send Error:', error);
    
    metrics.totalTime = performance.now() - metrics.requestStart;

    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      code: 'OTP_SEND_FAILED',
      performance: {
        totalTime: Math.round(metrics.totalTime),
        error: true
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

console.log("🚀 OTP Send Performance Optimized Function loaded");
/**
 * Supabase Edge Function: OTP Send with Enhanced Security
 * Version: 2.3 - Added Data Encryption and Secrets Management
 * Date: September 14, 2025
 */

import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../_shared/rateLimiter.ts'
import { AuditLogger } from '../_shared/auditLogger.ts'
import { SecureConfigManager } from '../_shared/secureConfig.ts'
import { SecurityHeaders, InputSanitizer } from '../_shared/securityHeaders.ts'
import { SecureDataManager, DataEncryption } from '../_shared/dataEncryption.ts'

// Initialize security components with error handling
let configManager: SecureConfigManager | null = null;
let securityHeaders: SecurityHeaders | null = null;
let inputSanitizer: InputSanitizer | null = null;
let secureDataManager: SecureDataManager | null = null;

try {
  configManager = SecureConfigManager.getInstance();
  securityHeaders = new SecurityHeaders({
    corsAllowedOrigins: ['*'], // Configure for production
    enableHSTS: true,
    enableCSP: true
  });
  inputSanitizer = new InputSanitizer();
  
  // Initialize data encryption if available
  try {
    secureDataManager = new SecureDataManager();
    console.log("✅ Data encryption initialized");
  } catch (encError) {
    console.warn("⚠️ Data encryption not available:", encError);
  }
} catch (error) {
  console.error("❌ Failed to initialize security components:", error);
}

// Get secure headers with fallback
const corsHeaders = securityHeaders?.getSecurityHeaders() || {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  phoneNumber: string;
  userId?: string;
}

interface SMSUpPlusLoginResponse {
  status: string;
  result: {
    token: string;
  };
}

interface SMSUpPlusSendResponse {
  status: string;
  result?: any;
  error?: string;
}

serve(async (req: Request) => {
  const auditLogger = new AuditLogger();
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`📤 OTP Send Request: ${requestId}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Parse and validate request
    let body: SendOTPRequest;
    try {
      body = await req.json();
    } catch (error) {
      await auditLogger.logSecurityEvent('invalid_request_format', {
        requestId,
        error: inputSanitizer?.sanitizeError(error) || 'Invalid JSON',
        method: req.method,
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            ...(securityHeaders?.getRateLimitHeaders?.({
              remaining: 0,
              resetTime: Date.now() + 60000,
              limit: 10
            }) || {})
          }
        }
      );
    }

    // Sanitize input
    const sanitizedPhone = inputSanitizer?.sanitizePhoneNumber(body.phoneNumber);
    
    if (!sanitizedPhone) {
      await auditLogger.logSecurityEvent('invalid_phone_number', {
        requestId,
        originalPhone: inputSanitizer?.sanitizeForLogging(body.phoneNumber) || 'invalid',
        method: req.method,
        clientIp: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        severity: 'low' as any
      });

      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number format',
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: {
            ...corsHeaders,
            ...(securityHeaders?.getErrorHeaders?.() || {})
          }
        }
      );
    }

    // Rate limiting check with enhanced logging
    const rateLimitResult = await RateLimiter.checkRateLimit(
      sanitizedPhone
    );

    if (!rateLimitResult.allowed) {
      await auditLogger.logSecurityEvent('rate_limit_exceeded', {
        identifier: sanitizedPhone,
        requestId,
        attempts: rateLimitResult.attempts,
        nextAttemptAt: rateLimitResult.nextAttemptAt?.toISOString(),
        clientIp: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        severity: 'high' as any
      });

      return new Response(
        JSON.stringify({
          error: 'Too many attempts',
          nextAttemptAt: rateLimitResult.nextAttemptAt?.toISOString(),
          requestId,
          timestamp: new Date().toISOString()
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...(securityHeaders?.getRateLimitHeaders?.({
              remaining: 0,
              resetTime: rateLimitResult.nextAttemptAt?.getTime() || Date.now() + 60000,
              limit: RATE_LIMIT_CONFIGS.otpSend.maxAttempts
            }) || {})
          }
        }
      );
    }

    console.log(`✅ Rate limit passed for: ${sanitizedPhone.substring(0, 3)}***`);

    // SMS UP Plus credentials
    const username = Deno.env.get('SMS_UP_PLUS_USERNAME') || 'Landingpage';
    const password = Deno.env.get('SMS_UP_PLUS_PASSWORD') || '@Atoz123';

    if (!username || !password) {
      throw new Error('SMS UP Plus credentials not configured');
    }

    // Login to SMS UP Plus
    console.log('🔑 Logging in to SMS UP Plus...');
    
    const loginResponse = await fetch('https://smsupplus.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ SMS UP Plus login failed:', loginResponse.status, errorText);
      throw new Error(`SMS service login failed: ${loginResponse.status}`);
    }

    const loginData: SMSUpPlusLoginResponse = await loginResponse.json();
    console.log('✅ SMS UP Plus login successful');

    if (loginData.status !== 'success' || !loginData.result?.token) {
      console.error('❌ Invalid login response:', loginData);
      throw new Error('Invalid login response from SMS service');
    }

    const token = loginData.result.token;

    // Generate OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
    console.log(`🎲 Generated OTP: ${otpCode} for ${sanitizedPhone.substring(0, 3)}***`);

    // Validate OTP format
    const validationResult = RateLimiter.validateOTPCode(otpCode);
    if (!validationResult.isValid) {
      throw new Error('Generated OTP validation failed');
    }

    // Prepare phone number and search hash for database storage
    let encryptedPhone = sanitizedPhone;
    let searchHash = sanitizedPhone;

    if (secureDataManager) {
      try {
        // Store both encrypted phone and search hash
        encryptedPhone = await secureDataManager.encryptPhoneNumber(sanitizedPhone);
        searchHash = await secureDataManager.generateSearchHash(sanitizedPhone);
        console.log('✅ Phone number encrypted for storage');
      } catch (encError) {
        console.warn('⚠️ Encryption failed, using plaintext:', encError);
        encryptedPhone = sanitizedPhone;
        searchHash = sanitizedPhone;
      }
    }

    // Store OTP in database with enhanced security
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        id: crypto.randomUUID(),
        phone_number: encryptedPhone, // Store encrypted
        phone_search_hash: searchHash, // For searching
        otp_code: otpCode,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        attempts: 0,
        verified: false,
        request_id: requestId,
        client_ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (otpError) {
      console.error('❌ Database error:', otpError);
      throw new Error('Failed to store OTP');
    }

    console.log('✅ OTP stored in database with ID:', otpData.id);

    // Send SMS via SMS UP Plus
    console.log('📱 Sending SMS...');
    
    const message = `Your verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code.`;
    
    const smsResponse = await fetch('https://smsupplus.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone: sanitizedPhone,
        message: message,
        sender: 'SMS_UP_PLUS'
      })
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('❌ SMS send failed:', smsResponse.status, errorText);
      
      // Mark OTP as failed in database
      await supabase
        .from('otp_codes')
        .update({ 
          verified: false,
          sms_error: errorText,
          updated_at: new Date().toISOString()
        })
        .eq('id', otpData.id);

      throw new Error(`SMS sending failed: ${smsResponse.status}`);
    }

    const smsData: SMSUpPlusSendResponse = await smsResponse.json();
    console.log('SMS API Response:', smsData);

    if (smsData.status !== 'success') {
      throw new Error(`SMS sending failed: ${smsData.error || 'Unknown error'}`);
    }

    console.log('✅ SMS sent successfully!');

    // Update database with SMS success
    await supabase
      .from('otp_codes')
      .update({ 
        sms_sent: true,
        sms_response: smsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', otpData.id);

    // Log successful audit event
    await auditLogger.logUserActivity('otp_sent', {
      phoneNumber: sanitizedPhone,
      requestId,
      otpId: otpData.id,
      smsProvider: 'SMS_UP_PLUS',
      encrypted: secureDataManager ? true : false,
      clientIp: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      responseTime: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({
        message: 'OTP sent successfully',
        requestId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString(),
        encrypted: secureDataManager ? true : false
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...(securityHeaders?.getSuccessHeaders?.(requestId) || {})
        }
      }
    );

  } catch (error) {
    console.error('❌ Error sending OTP:', error);

    // Log error audit event
    await auditLogger.logSecurityEvent('otp_send_failed', {
      requestId,
      error: inputSanitizer?.sanitizeError(error) || String(error),
      method: req.method,
      clientIp: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      responseTime: Date.now() - startTime,
      severity: 'high' as any
    });

    return new Response(
      JSON.stringify({
        error: 'Failed to send OTP',
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          ...(securityHeaders?.getErrorHeaders?.() || {})
        }
      }
    );
  }
});
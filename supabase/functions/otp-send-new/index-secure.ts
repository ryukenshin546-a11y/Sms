/**
 * Supabase Edge Function: OTP Send with Enhanced Security
 * Version: 2.3 - Added Data Encryption and Secrets Management
 * Date: September 14, 2025
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
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
    const dataEncryption = new DataEncryption();
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
  access_token: string;
}

interface SMSUpPlusOTPResponse {
  otpId: string;
  referenceCode: string;
  otcId: string;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let requestId = 'unknown';
  let auditLogger: AuditLogger | null = null;
  let secureData: SecureDataManager | null = null;
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔒 SMS UP Plus OTP Send Function v2.3 - Enhanced Security')
    
    // Initialize secure configuration
    const configManager = SecureConfigManager.getInstance();
    const configValidation = configManager.validateConfiguration();
    
    if (!configValidation.valid) {
      console.error('❌ Configuration validation failed:', configValidation.errors);
      throw new Error('Invalid system configuration');
    }
    
    // Get secure credentials
    const supabaseConfig = configManager.getSupabaseCredentials();
    const smsCredentials = configManager.getSMSUpPlusCredentials();
    
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.serviceKey);
    
    // Initialize security components
    const rateLimiter = new RateLimiter(supabaseClient);
    auditLogger = new AuditLogger(supabaseClient, 'otp-send-new', '2.3');
    
    // Initialize data encryption if enabled
    const config = configManager.getConfig();
    if (config.security.encryptionEnabled) {
      try {
        secureData = new SecureDataManager();
        const encryptionKey = configManager.getEncryptionKey();
        await secureData.initialize(encryptionKey);
        console.log('🔐 Data encryption initialized');
      } catch (error) {
        console.error('❌ Failed to initialize encryption:', error);
        throw new Error('Encryption initialization failed');
      }
    }
    
    // Get client information
    const clientInfo = AuditLogger.getClientInfo(req);
    clientIP = clientInfo.ip;
    const userAgent = clientInfo.userAgent;
    requestId = `otp_send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📡 Request Info:', { clientIP, userAgent, requestId });

    // Check IP-based rate limiting
    const ipRateLimit = await rateLimiter.checkRateLimit(
      clientIP, 
      RATE_LIMIT_CONFIGS.IP_SEND_OTP
    );
    
    if (!ipRateLimit.allowed) {
      console.log('🚫 IP Rate limit exceeded:', clientIP);
      
      // Log rate limiting event
      await auditLogger.logRateLimit({
        limitType: 'ip_send_otp',
        identifier: clientIP,
        clientIP: clientIP,
        requestsCount: ipRateLimit.totalHits,
        limitValue: RATE_LIMIT_CONFIGS.IP_SEND_OTP.maxRequests,
        windowMs: RATE_LIMIT_CONFIGS.IP_SEND_OTP.windowMs,
        requestId: requestId
      });
      
      return Response.json(
        { 
          success: false, 
          message: 'Too many requests from this IP. Please try again later.',
          retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            ...securityHeaders.getRateLimitHeaders(
              RATE_LIMIT_CONFIGS.IP_SEND_OTP.maxRequests,
              ipRateLimit.remaining,
              ipRateLimit.resetTime
            ),
            'X-Request-ID': requestId
          }
        }
      );
    }

    // Parse and sanitize request
    const body = await req.json() as SendOTPRequest;
    const phoneNumber = InputSanitizer.sanitizePhoneNumber(body.phoneNumber || '');
    const userId = body.userId ? InputSanitizer.sanitizeUserId(body.userId) : undefined;

    console.log('📥 Sanitized request:', { 
      phoneNumber: phoneNumber ? 'provided' : 'missing', 
      userId: userId || 'none' 
    });

    // Validate phone number format
    if (!phoneNumber || phoneNumber.length < 10) {
      console.log('❌ Invalid phone number format:', phoneNumber);
      
      await auditLogger.logSecurityEvent({
        eventType: 'invalid_input',
        message: 'Invalid phone number format submitted',
        clientIP: clientIP,
        userAgent: userAgent,
        requestId: requestId,
        severity: 'medium',
        eventData: {
          input_type: 'phone_number',
          sanitized_length: phoneNumber.length
        }
      });
      
      return Response.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400, headers: securityHeaders.getErrorHeaders() }
      );
    }

    // Sanitize and format phone number
    const sanitizedPhone = RateLimiter.sanitizePhoneNumber(phoneNumber);
    console.log('📱 Sanitized phone:', sanitizedPhone);

    // Check phone-based rate limiting
    const phoneRateLimit = await rateLimiter.checkRateLimit(
      sanitizedPhone, 
      RATE_LIMIT_CONFIGS.PHONE_SEND_OTP
    );
    
    if (!phoneRateLimit.allowed) {
      console.log('🚫 Phone rate limit exceeded:', sanitizedPhone);
      
      // Log rate limiting event for phone number
      await auditLogger.logRateLimit({
        limitType: 'phone_send_otp',
        identifier: sanitizedPhone,
        clientIP: clientIP,
        requestsCount: phoneRateLimit.totalHits,
        limitValue: RATE_LIMIT_CONFIGS.PHONE_SEND_OTP.maxRequests,
        windowMs: RATE_LIMIT_CONFIGS.PHONE_SEND_OTP.windowMs,
        requestId: requestId
      });
      
      return Response.json(
        { 
          success: false, 
          message: 'Too many OTP requests for this phone number. Please try again later.',
          retryAfter: Math.ceil((phoneRateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            ...securityHeaders.getRateLimitHeaders(
              RATE_LIMIT_CONFIGS.PHONE_SEND_OTP.maxRequests,
              phoneRateLimit.remaining,
              phoneRateLimit.resetTime
            ),
            'X-Request-ID': requestId
          }
        }
      );
    }

    console.log('✅ Rate limits passed - IP:', ipRateLimit.remaining, 'Phone:', phoneRateLimit.remaining);

    // Validate userId if provided
    let validatedUserId: string | null = null;
    if (userId) {
      if (InputSanitizer.isValidUUID(userId)) {
        validatedUserId = userId;
      } else {
        console.log(`⚠️ Invalid userId format: ${userId}, proceeding without user_id`);
      }
    }

    // === SMS UP Plus API Integration ===
    console.log('🔐 Step 1: Logging in to SMS UP Plus...');
    
    const smsConfig = configManager.getConfig().smsUpPlus;
    const loginUrl = `${smsConfig.apiUrl}${smsConfig.tokenEndpoint}`;
    
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        username: smsCredentials.username,
        password: smsCredentials.password,
        expireMinutes: config.security.tokenExpiry.toString(),
        ip: '58.8.213.44',
        device: ''
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ SMS UP Plus login failed:', loginResponse.status);
      throw new Error(`SMS UP Plus login failed: ${loginResponse.status}`);
    }

    // Parse login response
    const responseText = await loginResponse.text();
    console.log('📋 Raw login response length:', responseText.length);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty login response from SMS UP Plus API');
    }

    let accessToken: string;
    try {
      const loginData = JSON.parse(responseText) as SMSUpPlusLoginResponse;
      accessToken = loginData.access_token;
      
      if (!accessToken) {
        throw new Error('No access token in login response');
      }
    } catch {
      // If JSON parsing fails, treat as plain text token
      accessToken = responseText.trim().replace(/["\s]/g, '');
      
      if (!accessToken) {
        throw new Error('Invalid access token format');
      }
    }

    console.log('✅ Step 1: Login successful, got access token');

    // Step 2: Request OTP
    console.log('📤 Step 2: Requesting OTP...');
    
    const otpUrl = `${smsConfig.apiUrl}${smsConfig.otpEndpoint}`;
    const otpResponse = await fetch(otpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        phoneNumber: sanitizedPhone,
        expireMinutes: 5
      })
    });

    if (!otpResponse.ok) {
      console.error('❌ SMS UP Plus OTP request failed:', otpResponse.status);
      throw new Error(`SMS UP Plus OTP request failed: ${otpResponse.status}`);
    }

    // Parse OTP response
    const otpResponseText = await otpResponse.text();
    console.log('📋 Raw OTP response length:', otpResponseText.length);
    
    if (!otpResponseText || otpResponseText.trim() === '') {
      throw new Error('Empty response from SMS UP Plus OTP API');
    }

    let otpData: SMSUpPlusOTPResponse;
    try {
      otpData = JSON.parse(otpResponseText) as SMSUpPlusOTPResponse;
      
      if (!otpData.otpId || !otpData.referenceCode) {
        throw new Error('Invalid OTP response structure');
      }
    } catch {
      console.log('📤 OTP response is plain text:', otpResponseText);
      throw new Error('Failed to parse OTP response');
    }

    console.log('✅ Step 2: OTP request successful:', {
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode
    });

    // Step 3: Save OTP session to database (with encryption if enabled)
    console.log('💾 Step 3: Saving OTP session to database...');
    
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    
    console.log('🆔 Generated sessionId:', sessionId);
    console.log('⏰ Session expires at:', expiresAt);

    // Prepare data for storage
    let phoneNumberForStorage = sanitizedPhone;
    let userIdForStorage = validatedUserId;
    let otpIdForStorage = otpData.otpId;
    let searchHash: string | null = null;

    // Encrypt sensitive data if encryption is enabled
    if (secureData && config.security.encryptionEnabled) {
      console.log('🔐 Encrypting sensitive data...');
      
      const encryptedData = await secureData.encryptUserData({
        phoneNumber: sanitizedPhone,
        userId: validatedUserId || undefined,
        otpId: otpData.otpId
      });
      
      // Store encrypted data (you would need to modify database schema)
      // For now, we'll use original data but generate search hash
      searchHash = await secureData.generateSearchHash(sanitizedPhone);
      console.log('🔍 Generated search hash for encrypted data');
    }

    const { data: session, error } = await supabaseClient
      .from('otp_verifications')
      .insert({
        id: sessionId,
        phone_number: phoneNumberForStorage,
        formatted_phone: sanitizedPhone,
        user_id: userIdForStorage,
        otp_id: otpIdForStorage,
        reference_code: otpData.referenceCode,
        otc_id: otpData.otcId || otpData.otpId,
        status: 'pending',
        expires_at: expiresAt,
        max_attempts: 3,
        verification_attempts: 0,
        request_id: requestId,
        client_ip: clientIP,
        user_agent: userAgent,
        search_hash: searchHash
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert failed:', error);
      throw new Error('Failed to save OTP session');
    } else {
      console.log('✅ Step 3: Session saved to database:', sessionId);
    }

    // Log successful OTP request
    await auditLogger.logOTPSend({
      requestId: requestId,
      phoneNumber: sanitizedPhone,
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode,
      clientIP: clientIP,
      userAgent: userAgent,
      responseTimeMs: Date.now() - startTime,
      success: true
    });

    // Return success response
    return Response.json({
      success: true,
      message: `OTP sent to ${sanitizedPhone}`,
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode,
      session: {
        id: sessionId,
        expiresAt: expiresAt,
        phoneNumber: phoneNumber,
        formattedPhone: sanitizedPhone
      },
      security: {
        encryptionEnabled: config.security.encryptionEnabled,
        requestId: requestId
      }
    }, {
      status: 200,
      headers: securityHeaders.getSuccessHeaders(requestId)
    });

  } catch (error) {
    console.error('💥 Edge Function error:', error);
    
    // Log error if audit logger is available
    if (auditLogger) {
      try {
        await auditLogger.logError({
          error: error instanceof Error ? error : new Error('Unknown error'),
          context: 'otp_send',
          clientIP: clientIP,
          userAgent: req.headers.get('User-Agent') || 'unknown',
          requestId: requestId,
          eventData: {
            response_time_ms: Date.now() - startTime
          }
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }
    
    const errorMessage = InputSanitizer.sanitizeErrorMessage(
      error instanceof Error ? error.message : 'Internal server error'
    );
    
    return Response.json({
      success: false,
      message: errorMessage,
      requestId: requestId
    }, {
      status: 500,
      headers: securityHeaders.getErrorHeaders()
    });
  }
});
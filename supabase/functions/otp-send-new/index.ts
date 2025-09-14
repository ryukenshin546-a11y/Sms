/**
 * Supabase Edge Function: OTP Send (SMS UP Plus) with Enhanced Error Messages
 * ส่ง OTP ผ่าน SMS UP Plus API พร้อม Enhanced Error Handling
 * Updated: September 14, 2025 - Added Enhanced Error Messages
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../_shared/rateLimiter.ts'
import { AuditLogger } from '../_shared/auditLogger.ts'
import { EdgeFunctionErrors, createErrorResponse, createSuccessResponse } from '../_shared/enhancedErrors.ts'

// Security configuration - ใช้ environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mnhdueclyzwtfkmwttkc.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY') || 'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf'
const smsUpPlusUrl = Deno.env.get('SMS_UP_PLUS_URL') || 'https://web.smsup-plus.com'
const smsUpPlusUsername = Deno.env.get('SMS_UP_PLUS_USERNAME') || 'Landingpage'
const smsUpPlusPassword = Deno.env.get('SMS_UP_PLUS_PASSWORD') || '@Atoz123'
const smsUpPlusIP = Deno.env.get('SMS_UP_PLUS_IP') || '58.8.213.44'

// CORS headers with security enhancements

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  ...RateLimiter.getSecurityHeaders()
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let requestId = 'unknown';
  let auditLogger: AuditLogger | null = null;
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestStartTime = Date.now();
    console.log('🚀 SMS UP Plus OTP Send Function called with Security & Logging')
    
    // Initialize Supabase client with secure configuration
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey
    )
    
    // Initialize Rate Limiter and Logger
    const rateLimiter = new RateLimiter(supabaseClient)
    auditLogger = new AuditLogger(supabaseClient, 'otp-send-new', '2.0')
    
    // Get client information
    const clientInfo = AuditLogger.getClientInfo(req)
    clientIP = clientInfo.ip
    const userAgent = clientInfo.userAgent
    requestId = `otp_send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('📡 Request Info:', { clientIP, userAgent, requestId })
    
    // Check IP-based rate limiting
    const ipRateLimit = await rateLimiter.checkRateLimit(
      clientIP, 
      RATE_LIMIT_CONFIGS.IP_SEND_OTP
    )
    
    if (!ipRateLimit.allowed) {
      console.log('🚫 IP Rate limit exceeded:', clientIP)
      
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
      
      const retryAfterSeconds = Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000);
      const error = EdgeFunctionErrors.rateLimitExceeded(retryAfterSeconds);
      
      return createErrorResponse(error, 429, {
        'Retry-After': retryAfterSeconds.toString(),
        'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.IP_SEND_OTP.maxRequests.toString(),
        'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
        'X-RateLimit-Reset': ipRateLimit.resetTime.toString(),
        'X-Request-ID': requestId
      });
    }
    
    // Parse request
    const { phoneNumber, userId } = await req.json()
    
    console.log('📥 Received request:', { phoneNumber: phoneNumber ? 'provided' : 'missing', userId })
    
    if (!phoneNumber) {
      return Response.json(
        { success: false, message: 'Phone number is required' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Sanitize phone number
    const sanitizedPhone = RateLimiter.sanitizePhoneNumber(phoneNumber)
    if (!sanitizedPhone) {
      console.log('❌ Invalid phone number format:', phoneNumber)
      return Response.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    console.log('📱 Sanitized phone:', sanitizedPhone)
    
    // Check phone-based rate limiting
    const phoneRateLimit = await rateLimiter.checkRateLimit(
      sanitizedPhone, 
      RATE_LIMIT_CONFIGS.PHONE_SEND_OTP
    )
    
    if (!phoneRateLimit.allowed) {
      console.log('🚫 Phone rate limit exceeded:', sanitizedPhone)
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
            'Retry-After': Math.ceil((phoneRateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PHONE_SEND_OTP.maxRequests.toString(),
            'X-RateLimit-Remaining': phoneRateLimit.remaining.toString(),
            'X-RateLimit-Reset': phoneRateLimit.resetTime.toString()
          }
        }
      )
    }
    
    console.log('✅ Rate limits passed - IP:', ipRateLimit.remaining, 'Phone:', phoneRateLimit.remaining)
    
    // Validate and handle userId - make it optional or generate UUID if not valid
    let validUserId: string | null = null
    if (userId) {
      // Check if userId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (uuidRegex.test(userId)) {
        validUserId = userId
      } else {
        console.log(`⚠️ Invalid userId format: ${userId}, will proceed without user_id`)
      }
    }

    // Step 1: Login to SMS UP Plus
    console.log('🔐 Step 1: Logging in to SMS UP Plus...')
    const loginResponse = await fetch('https://web.smsup-plus.com/api/Token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        username: 'Landingpage',
        password: '@Atoz123',
        expireMinutes: '60',
        ip: '58.8.213.44',
        device: ''
      })
    })

    if (!loginResponse.ok) {
      console.error('❌ SMS UP Plus login failed:', loginResponse.status)
      return Response.json({
        success: false,
        message: 'Failed to authenticate with SMS UP Plus'
      }, {
        status: 500,
        headers: corsHeaders
      })
    }

    // Parse login response - can be either JSON or plain text token
    let accessToken: string
    try {
      const responseText = await loginResponse.text()
      console.log('📋 Raw login response:', responseText)
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty login response from SMS UP Plus API')
      }

      // Try to parse as JSON first
      try {
        const loginData = JSON.parse(responseText)
        accessToken = loginData.access_token || loginData.token || loginData
      } catch {
        // If JSON parsing fails, treat as plain text token
        accessToken = responseText.trim().replace(/["\s]/g, '') // Remove quotes and whitespace
      }

      if (!accessToken) {
        throw new Error('No token found in login response')
      }

    } catch (parseError) {
      console.error('❌ Failed to parse login response:', parseError)
      return Response.json({
        success: false,
        message: 'Invalid login response format from SMS UP Plus API'
      }, {
        status: 500,
        headers: corsHeaders
      })
    }

    console.log('✅ Step 1: Login successful, got access token')

    // Step 2: Request OTP
    console.log('📤 Step 2: Requesting OTP...')
    const otpResponse = await fetch('https://web.smsup-plus.com/OTP/requestOTP', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        otcId: '184c870e-ce42-4c7c-961f-9854d13d0ada', // Fixed otcId as specified
        mobile: sanitizedPhone
      })
    })

    if (!otpResponse.ok) {
      console.error('❌ SMS UP Plus OTP request failed:', otpResponse.status)
      const errorText = await otpResponse.text()
      console.error('❌ Error details:', errorText)
      return Response.json({
        success: false,
        message: `Failed to request OTP: HTTP ${otpResponse.status} - ${errorText}`
      }, {
        status: 500,
        headers: corsHeaders
      })
    }

    // Parse OTP response with better error handling
    let otpData
    try {
      const responseText = await otpResponse.text()
      console.log('📋 Raw OTP response:', responseText)
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from SMS UP Plus OTP API')
      }
      
      // Try to parse as JSON
      try {
        otpData = JSON.parse(responseText)
      } catch {
        // If not JSON, treat as success message
        console.log('📤 OTP response is plain text:', responseText)
        otpData = { 
          success: true, 
          message: responseText.trim(),
          otpId: 'generated' // SMS UP Plus may not return otpId in some cases
        }
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse OTP response:', parseError)
      return Response.json({
        success: false,
        message: 'Invalid response format from SMS UP Plus OTP API'
      }, {
        status: 500,
        headers: corsHeaders
      })
    }
    console.log('✅ Step 2: OTP request successful:', {
      otcId: otpData.otcId,
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode,
      success: otpData.success
    })

    // Step 3: Save session to database
    console.log('💾 Step 3: Saving OTP session to database...')
    
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

    console.log('🆔 Generated sessionId:', sessionId)
    console.log('⏰ Session expires at:', expiresAt)

    const { data: sessionData, error: dbError } = await supabaseClient
      .from('otp_verifications')
      .insert({
        id: sessionId,
        phone_number: phoneNumber,
        formatted_phone: sanitizedPhone,
        external_otp_id: otpData.otpId || sessionId, // Store otpId from SMS UP Plus
        reference_code: otpData.referenceCode || null, // Store referenceCode
        status: 'pending',
        expires_at: expiresAt,
        verification_attempts: 0,
        max_attempts: 3,
        user_id: validUserId, // Use validated userId or null
        external_service: 'sms_up_plus',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          otcId: otpData.otcId,
          accessToken: accessToken
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Failed to save session to database:', dbError)
      // Don't fail the request - OTP was sent successfully
      // Just return without session info
    } else {
      console.log('✅ Step 3: Session saved to database:', sessionId)
    }

    // Log successful OTP request
    await auditLogger.logOTPSend({
      requestId: requestId,
      phoneNumber: sanitizedPhone,
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode,
      clientIP: clientIP,
      userAgent: req.headers.get('User-Agent') || 'unknown',
      responseTimeMs: Date.now() - startTime,
      success: true
    });

    // Return success response with otpId and referenceCode for verification
    return Response.json({
      success: true,
      message: `OTP sent to ${sanitizedPhone}`,
      otpId: otpData.otpId, // Frontend will use this for verification
      referenceCode: otpData.referenceCode, // Frontend will display this to user
      session: {
        id: sessionId,
        expiresAt: expiresAt,
        phoneNumber: phoneNumber,
        formattedPhone: sanitizedPhone
      },
      data: {
        otcId: otpData.otcId,
        otpId: otpData.otpId,
        referenceCode: otpData.referenceCode,
        phoneNumber: phoneNumber,
        formattedPhone: sanitizedPhone,
        accessToken: accessToken
      }
    }, {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('💥 Edge Function error:', error)
    
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
    
    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, {
      status: 500,
      headers: corsHeaders
    })
  }
})

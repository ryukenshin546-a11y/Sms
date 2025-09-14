/**
 * Supabase Edge Function: OTP Verify with Rate Limiting
 * ยืนยัน OTP ผ่าน SMS UP Plus API และอัพเดทสถานะในฐานข้อมูล พร้อม Security Features
 * Updated: September 14, 2025 - Added Rate Limiting & Security
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../_shared/rateLimiter.ts'
import { AuditLogger } from '../_shared/auditLogger.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  ...RateLimiter.getSecurityHeaders()
}

interface VerifyOTPRequest {
  otpId: string;
  referenceCode: string;
  otpCode: string;
}

interface SMSUpPlusVerifyResponse {
  otpId: string;
  result: boolean;
  isErrorCount: boolean;
  isExprCode: boolean;
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
    console.log('🔍 SMS UP Plus OTP Verify Function called with Security')
    
    // Initialize Supabase client with service key for database operations
    const supabaseClient = createClient(
      'https://mnhdueclyzwtfkmwttkc.supabase.co',
      'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf'
    )

    // Initialize Rate Limiter and Logger
    const rateLimiter = new RateLimiter(supabaseClient)
    auditLogger = new AuditLogger(supabaseClient, 'otp-verify', '2.0')
    
    // Get client information
    const clientInfo = AuditLogger.getClientInfo(req)
    clientIP = clientInfo.ip
    const userAgent = clientInfo.userAgent
    requestId = `otp_verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('📡 Request Info:', { clientIP, userAgent, requestId })
    
    // Check IP-based rate limiting for verification
    const ipRateLimit = await rateLimiter.checkRateLimit(
      clientIP, 
      RATE_LIMIT_CONFIGS.IP_VERIFY_OTP
    )
    
    if (!ipRateLimit.allowed) {
      console.log('🚫 IP Rate limit exceeded for verification:', clientIP)
      
      // Log rate limiting event
      await auditLogger.logRateLimit({
        limitType: 'ip_verify_otp',
        identifier: clientIP,
        clientIP: clientIP,
        requestsCount: ipRateLimit.totalHits,
        limitValue: RATE_LIMIT_CONFIGS.IP_VERIFY_OTP.maxRequests,
        windowMs: RATE_LIMIT_CONFIGS.IP_VERIFY_OTP.windowMs,
        requestId: requestId
      });
      
      return Response.json(
        { 
          success: false, 
          message: 'Too many verification attempts from this IP. Please try again later.',
          retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            'Retry-After': Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.IP_VERIFY_OTP.maxRequests.toString(),
            'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
            'X-RateLimit-Reset': ipRateLimit.resetTime.toString(),
            'X-Request-ID': requestId
          }
        }
      )
    }

    // Parse request
    const { otpId, referenceCode, otpCode }: VerifyOTPRequest = await req.json()
    
    console.log('📥 Received request data:', { otpId, referenceCode, otpCode: otpCode ? 'provided' : 'missing' })
    
    if (!otpId || !referenceCode || !otpCode) {
      return Response.json(
        { success: false, message: 'OTP ID, reference code, and OTP code are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate UUID format for otpId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(otpId)) {
      console.error('❌ Invalid UUID format for otpId:', otpId)
      return Response.json(
        { success: false, message: 'Invalid OTP ID format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate OTP code format
    if (!RateLimiter.validateOTPCode(otpCode)) {
      console.error('❌ Invalid OTP code format:', otpCode)
      return Response.json(
        { success: false, message: 'Invalid OTP code format. Must be 4-6 digits.' },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log(`🔍 Verifying OTP - otpId: ${otpId}, referenceCode: ${referenceCode}`)

    // Get OTP session from database using otpId and referenceCode
    const { data: session, error: sessionError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('external_otp_id', otpId)
      .eq('reference_code', referenceCode)
      .single()

    console.log('📋 Database query result:', { session: session ? 'found' : 'null', sessionError })
    
    // If session not found, let's also try to see if there are any sessions with this otpId
    if (!session) {
      const { data: allSessions, error: allError } = await supabaseClient
        .from('otp_verifications')
        .select('id, external_otp_id, reference_code, phone_number, status, created_at')
        .eq('external_otp_id', otpId)
        .order('created_at', { ascending: false })
        .limit(3)
      
      console.log('📊 Sessions with this otpId:', { allSessions, allError })
    }

    if (sessionError) {
      console.error('❌ Database error:', sessionError)
      return Response.json(
        { success: false, message: `Database error: ${sessionError.message}` },
        { status: 500, headers: corsHeaders }
      )
    }

    if (!session) {
      console.error('❌ Session not found for otpId:', otpId, 'referenceCode:', referenceCode)
      return Response.json(
        { success: false, message: 'Invalid OTP ID or reference code' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check phone-based rate limiting for verification
    const sanitizedPhone = RateLimiter.sanitizePhoneNumber(session.phone_number)
    if (sanitizedPhone) {
      const phoneRateLimit = await rateLimiter.checkRateLimit(
        sanitizedPhone, 
        RATE_LIMIT_CONFIGS.PHONE_VERIFY_OTP
      )
      
      if (!phoneRateLimit.allowed) {
        console.log('🚫 Phone rate limit exceeded for verification:', sanitizedPhone)
        
        // Log rate limiting event for phone number
        await auditLogger.logRateLimit({
          limitType: 'phone_verify_otp',
          identifier: sanitizedPhone,
          clientIP: clientIP,
          requestsCount: phoneRateLimit.totalHits,
          limitValue: RATE_LIMIT_CONFIGS.PHONE_VERIFY_OTP.maxRequests,
          windowMs: RATE_LIMIT_CONFIGS.PHONE_VERIFY_OTP.windowMs,
          requestId: requestId
        });
        
        return Response.json(
          { 
            success: false, 
            message: 'Too many verification attempts for this phone number. Please try again later.',
            retryAfter: Math.ceil((phoneRateLimit.resetTime - Date.now()) / 1000)
          },
          { 
            status: 429, 
            headers: {
              ...corsHeaders,
              'Retry-After': Math.ceil((phoneRateLimit.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.PHONE_VERIFY_OTP.maxRequests.toString(),
              'X-RateLimit-Remaining': phoneRateLimit.remaining.toString(),
              'X-RateLimit-Reset': phoneRateLimit.resetTime.toString(),
              'X-Request-ID': requestId
            }
          }
        )
      }
    }

    console.log('✅ Rate limits passed for verification')

    // Check if session is expired
    if (new Date() > new Date(session.expires_at)) {
      await supabaseClient
        .from('otp_verifications')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', session.id)

      return Response.json(
        { success: false, message: 'OTP has expired' },
        { headers: corsHeaders }
      )
    }

    // Check attempt limits
    if (session.verification_attempts >= session.max_attempts) {
      await supabaseClient
        .from('otp_verifications')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', session.id)

      return Response.json(
        { success: false, message: 'Maximum verification attempts exceeded' },
        { headers: corsHeaders }
      )
    }

    // Step 1: Login to SMS UP Plus
    console.log('🔐 Step 1: Logging in to SMS UP Plus...')
    const accessToken = await loginToSMSUpPlus()
    
    if (!accessToken) {
      throw new Error('Failed to authenticate with SMS UP Plus')
    }

    // Step 2: Verify OTP with SMS UP Plus API
    console.log('✅ Step 2: Verifying OTP with SMS UP Plus...')
    const verifyResult = await verifyOTPWithSMSUpPlus(accessToken, session.external_otp_id, otpCode)
    
    // Increment attempt count
    await supabaseClient
      .from('otp_verifications')
      .update({ 
        verification_attempts: session.verification_attempts + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)

    if (!verifyResult.result) {
      // Failed verification
      const newAttempts = session.verification_attempts + 1
      const status = newAttempts >= session.max_attempts ? 'failed' : 'pending'
      
      await supabaseClient
        .from('otp_verifications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', session.id)

      let errorMessage = 'Invalid OTP code'
      if (verifyResult.isExprCode) {
        errorMessage = 'OTP code has expired'
      } else if (verifyResult.isErrorCount) {
        errorMessage = 'Too many incorrect attempts'
      }

      // Log failed verification attempt
      await auditLogger.logOTPVerify({
        requestId: requestId,
        phoneNumber: session.formatted_phone,
        otpId: session.otp_id,
        referenceCode: session.reference_code,
        clientIP: clientIP,
        userAgent: userAgent,
        responseTimeMs: Date.now() - startTime,
        success: false,
        errorMessage: errorMessage
      });

      return Response.json({
        success: false,
        message: errorMessage,
        attemptsRemaining: Math.max(0, session.max_attempts - newAttempts),
        isExpired: verifyResult.isExprCode,
        isErrorCount: verifyResult.isErrorCount
      }, { headers: corsHeaders })
    }

    // Successful verification
    console.log('🎉 OTP verification successful!')
    
    // Update session status
    const { data: verifiedSession, error: updateError } = await supabaseClient
      .from('otp_verifications')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update session:', updateError)
      throw new Error('Failed to update verification status')
    }

    // Add phone number to verified numbers
    const { error: verifyError } = await supabaseClient
      .from('verified_phone_numbers')
      .insert({
        phone_number: session.phone_number,
        formatted_phone: session.formatted_phone,
        user_id: session.user_id,
        otp_verification_id: session.id,
        verification_method: 'sms_otp',
        verified_at: new Date().toISOString(),
        is_active: true
      })

    if (verifyError) {
      console.error('❌ Failed to add verified phone:', verifyError)
      // Don't fail the request - verification still succeeded
    }

    console.log('✅ Phone number added to verified list')

    // Log successful verification
    await auditLogger.logOTPVerify({
      requestId: requestId,
      phoneNumber: session.formatted_phone,
      otpId: session.otp_id,
      referenceCode: session.reference_code,
      clientIP: clientIP,
      userAgent: userAgent,
      responseTimeMs: Date.now() - startTime,
      success: true
    });

    return Response.json({
      success: true,
      message: 'Phone number verified successfully',
      session: {
        id: verifiedSession.id,
        phoneNumber: verifiedSession.phone_number,
        formattedPhone: verifiedSession.formatted_phone,
        status: verifiedSession.status,
        verifiedAt: verifiedSession.verified_at
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('💥 Error in otp-verify function:', error)
    
    // Log error if audit logger is available
    if (auditLogger) {
      try {
        await auditLogger.logError({
          error: error instanceof Error ? error : new Error('Unknown error'),
          context: 'otp_verify',
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
      message: (error as Error).message || 'Internal server error'
    }, {
      status: 500,
      headers: corsHeaders
    })
  }
})

// Helper Functions
async function loginToSMSUpPlus(): Promise<string | null> {
  try {
    const response = await fetch('https://web.smsup-plus.com/api/Token', {
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

    if (!response.ok) {
      throw new Error(`SMS UP Plus login failed: ${response.status}`)
    }

    // Parse login response - can be either JSON or plain text token
    const responseText = await response.text()
    console.log('📋 Raw login response:', responseText)
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty login response from SMS UP Plus API')
    }

    // Try to parse as JSON first
    try {
      const loginData = JSON.parse(responseText)
      return loginData.access_token || loginData.token || loginData
    } catch {
      // If JSON parsing fails, treat as plain text token
      return responseText.trim().replace(/["\s]/g, '') // Remove quotes and whitespace
    }

  } catch (error) {
    console.error('❌ SMS UP Plus login error:', error)
    return null
  }
}

async function verifyOTPWithSMSUpPlus(token: string, otpId: string, otpCode: string): Promise<SMSUpPlusVerifyResponse> {
  try {
    console.log(`📤 Verifying OTP - otpId: ${otpId}, otpCode: ${otpCode}`)
    
    const response = await fetch('https://web.smsup-plus.com/OTP/verifyOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        otpId: otpId,
        otpCode: otpCode
      })
    })

    if (!response.ok) {
      throw new Error(`SMS UP Plus OTP verify failed: HTTP ${response.status}`)
    }

    const responseText = await response.text()
    console.log('📋 Raw verify response:', responseText)
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from SMS UP Plus verify API')
    }

    // Try to parse as JSON
    try {
      const result = JSON.parse(responseText)
      
      return {
        otpId: result.otpId || otpId,
        result: result.result === true,
        isErrorCount: result.isErrorCount === true,
        isExprCode: result.isExprCode === true
      }
    } catch {
      // If not JSON, assume it's an error message
      return {
        otpId: otpId,
        result: false,
        isErrorCount: false,
        isExprCode: false
      }
    }

  } catch (error) {
    console.error('❌ SMS UP Plus OTP verify error:', error)
    return {
      otpId: otpId,
      result: false,
      isErrorCount: false,
      isExprCode: false
    }
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/otp-verify' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

/**
 * Supabase Edge Function: OTP Resend with Enhanced Features
 * Phase 3.1: Advanced resend functionality with limits and tracking
 * Date: September 14, 2025
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../_shared/rateLimiter.ts'
import { AuditLogger } from '../_shared/auditLogger.ts'

console.log("🔄 OTP Resend Function v3.1 - Enhanced Resend with Limits")

interface ResendOTPRequest {
  sessionId: string;
  phoneNumber: string;
  userAgent?: string;
}

interface SMSUpPlusLoginResponse {
  access_token: string;
}

interface SMSUpPlusOTPResponse {
  otpId: string;
  referenceCode: string;
  otcId: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let requestId = 'unknown';
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 OTP Resend Function - Phase 3.1')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Initialize components
    const rateLimiter = new RateLimiter(supabaseClient);
    const auditLogger = new AuditLogger(supabaseClient, 'otp-resend', '3.1');
    
    // Get client information
    const clientInfo = AuditLogger.getClientInfo(req);
    clientIP = clientInfo.ip;
    const userAgent = clientInfo.userAgent;
    requestId = `otp_resend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📡 Resend Request Info:', { clientIP, userAgent, requestId });

    // Parse request
    const body = await req.json() as ResendOTPRequest;
    const { sessionId, phoneNumber } = body;

    if (!sessionId || !phoneNumber) {
      throw new Error('Missing required fields: sessionId and phoneNumber');
    }

    // Rate limiting check - more strict for resend
    const resendRateLimit = await rateLimiter.checkRateLimit(
      phoneNumber, 
      {
        ...RATE_LIMIT_CONFIGS.PHONE_SEND_OTP,
        maxRequests: 2, // Only 2 resends per window
        windowMs: 10 * 60 * 1000 // 10 minutes window
      }
    );
    
    if (!resendRateLimit.allowed) {
      console.log('🚫 Resend rate limit exceeded:', phoneNumber);
      
      await auditLogger.logRateLimit({
        limitType: 'phone_resend_otp',
        identifier: phoneNumber,
        clientIP: clientIP,
        requestsCount: resendRateLimit.totalHits,
        limitValue: 2,
        windowMs: 10 * 60 * 1000,
        requestId: requestId
      });
      
      return Response.json(
        { 
          success: false, 
          message: 'Too many resend attempts. Please wait before trying again.',
          retryAfter: Math.ceil((resendRateLimit.resetTime - Date.now()) / 1000),
          code: 'RESEND_LIMIT_EXCEEDED'
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            'X-Request-ID': requestId
          }
        }
      );
    }

    // Check existing session and validate resend eligibility
    const { data: existingSession, error: sessionError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('id', sessionId)
      .eq('phone_number', phoneNumber)
      .single();

    if (sessionError || !existingSession) {
      console.log('❌ Session not found:', sessionId);
      
      return Response.json(
        { 
          success: false, 
          message: 'Invalid session. Please start OTP process again.',
          code: 'SESSION_NOT_FOUND'
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check session status and limits
    if (existingSession.status === 'verified') {
      return Response.json(
        { 
          success: false, 
          message: 'This phone number is already verified.',
          code: 'ALREADY_VERIFIED'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (existingSession.status === 'expired') {
      return Response.json(
        { 
          success: false, 
          message: 'Session expired. Please start verification process again.',
          code: 'SESSION_EXPIRED'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check resend limits (max 3 resends per session)
    const resendCount = existingSession.resend_count || 0;
    const maxResends = 3;
    
    if (resendCount >= maxResends) {
      console.log(`🚫 Max resends exceeded: ${resendCount}/${maxResends}`);
      
      // Mark session as blocked
      await supabaseClient
        .from('otp_verifications')
        .update({ 
          status: 'blocked',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      return Response.json(
        { 
          success: false, 
          message: `Maximum resend attempts (${maxResends}) exceeded. Please start over.`,
          code: 'MAX_RESENDS_EXCEEDED'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if enough time has passed since last resend (60 seconds)
    const lastResendAt = existingSession.last_resend_at;
    const minResendInterval = 60 * 1000; // 60 seconds
    
    if (lastResendAt) {
      const timeSinceLastResend = Date.now() - new Date(lastResendAt).getTime();
      if (timeSinceLastResend < minResendInterval) {
        const waitTime = Math.ceil((minResendInterval - timeSinceLastResend) / 1000);
        
        return Response.json(
          { 
            success: false, 
            message: `Please wait ${waitTime} seconds before requesting another code.`,
            retryAfter: waitTime,
            code: 'RESEND_TOO_SOON'
          },
          { status: 429, headers: corsHeaders }
        );
      }
    }

    console.log(`📤 Proceeding with resend ${resendCount + 1}/${maxResends}`);

    // SMS UP Plus API Integration
    const username = Deno.env.get('SMS_UP_PLUS_USERNAME') || 'Landingpage';
    const password = Deno.env.get('SMS_UP_PLUS_PASSWORD') || '@Atoz123';

    // Login to SMS UP Plus
    console.log('🔐 Logging in to SMS UP Plus...');
    const loginResponse = await fetch('https://web.smsup-plus.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        username,
        password,
        expireMinutes: '60',
        ip: '58.8.213.44',
        device: ''
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`SMS UP Plus login failed: ${loginResponse.status}`);
    }

    const loginText = await loginResponse.text();
    let accessToken: string;
    
    try {
      const loginData = JSON.parse(loginText) as SMSUpPlusLoginResponse;
      accessToken = loginData.access_token;
    } catch {
      accessToken = loginText.trim().replace(/["\s]/g, '');
    }

    if (!accessToken) {
      throw new Error('Failed to get access token from SMS UP Plus');
    }

    console.log('✅ SMS UP Plus login successful');

    // Request new OTP
    console.log('📤 Requesting new OTP...');
    const otpResponse = await fetch('https://web.smsup-plus.com/api/otp/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        expireMinutes: 5
      })
    });

    if (!otpResponse.ok) {
      throw new Error(`OTP request failed: ${otpResponse.status}`);
    }

    const otpText = await otpResponse.text();
    let otpData: SMSUpPlusOTPResponse;
    
    try {
      otpData = JSON.parse(otpText) as SMSUpPlusOTPResponse;
    } catch {
      throw new Error('Failed to parse OTP response');
    }

    console.log('✅ New OTP requested successfully:', {
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode
    });

    // Update session with new OTP data and resend tracking
    const { data: updatedSession, error: updateError } = await supabaseClient
      .from('otp_verifications')
      .update({
        otp_id: otpData.otpId,
        reference_code: otpData.referenceCode,
        otc_id: otpData.otcId || otpData.otpId,
        resend_count: resendCount + 1,
        last_resend_at: new Date().toISOString(),
        verification_attempts: 0, // Reset verification attempts on resend
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // New 5-minute expiry
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update session:', updateError);
      throw new Error('Failed to update OTP session');
    }

    // Log successful resend
    await auditLogger.logOTPSend({
      requestId,
      phoneNumber,
      otpId: otpData.otpId,
      referenceCode: otpData.referenceCode,
      clientIP,
      userAgent,
      responseTimeMs: Date.now() - startTime,
      success: true,
      isResend: true,
      resendCount: resendCount + 1
    });

    // Return success response with enhanced information
    return Response.json({
      success: true,
      message: `New OTP sent to ${phoneNumber}`,
      session: {
        id: sessionId,
        expiresAt: updatedSession.expires_at,
        resendCount: resendCount + 1,
        maxResends,
        remainingResends: maxResends - (resendCount + 1),
        nextResendAt: new Date(Date.now() + 60 * 1000).toISOString() // 60 seconds
      },
      otp: {
        otpId: otpData.otpId,
        referenceCode: otpData.referenceCode
      },
      requestId
    }, {
      status: 200,
      headers: {
        ...corsHeaders,
        'X-Request-ID': requestId
      }
    });

  } catch (error) {
    console.error('💥 Resend function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return Response.json({
      success: false,
      message: errorMessage,
      requestId,
      code: 'INTERNAL_ERROR'
    }, {
      status: 500,
      headers: {
        ...corsHeaders,
        'X-Request-ID': requestId
      }
    });
  }
});
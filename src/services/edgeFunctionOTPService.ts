/**
 * Supabase Edge Functions OTP Service
 * ใช้ Edge Functions แทนการเรียก API โดยตรง
 * Updated: September 14, 2025
 */

import { supabase } from '../lib/supabase';

export interface SendOTPRequest {
  phoneNumber: string;
  userId?: string;
}

export interface ResendOTPRequest {
  phoneNumber: string;
  otpId: string;
  userId?: string;
}

export interface VerifyOTPRequest {
  otpId: string;
  referenceCode: string;
  otpCode: string;
}

export interface OTPResult {
  success: boolean;
  message: string;
  otpId?: string; // For verification
  referenceCode?: string; // For display to user
  session?: {
    id: string;
    phoneNumber: string;
    formattedPhone: string;
    status: string;
    expiresAt: string;
    verificationAttempts: number;
    maxAttempts: number;
    // SMS UP Plus specific fields
    otcId?: string;
    otpId?: string;
    referenceCode?: string;
    accessToken?: string;
  };
  attemptsRemaining?: number;
}

export class EdgeFunctionOTPService {
  
  /**
   * ส่ง OTP ผ่าน Edge Function (SMS UP Plus)
   */
  async sendOTP(request: SendOTPRequest): Promise<OTPResult> {
    try {
      console.log('📤 Calling SMS UP Plus Edge Function...')
      
      // Ensure we have an anonymous session for Edge Function calls
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('🔑 Creating anonymous session...')
        const { error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) {
          console.error('❌ Anonymous sign-in error:', signInError)
          // Continue anyway - function might still work
        } else {
          console.log('✅ Anonymous session created')
        }
      }
      
      // Use the new SMS UP Plus function
      const { data, error } = await supabase.functions.invoke('otp-send-new', {
        body: {
          phoneNumber: request.phoneNumber,
          userId: request.userId
        }
      })

      if (error) {
        console.error('❌ Edge Function error:', error)
        return {
          success: false,
          message: error.message || 'Failed to send OTP'
        }
      }

      if (!data.success) {
        console.error('❌ SMS UP Plus API error:', data.message)
        return {
          success: false,
          message: data.message || 'Failed to send OTP'
        }
      }

      console.log('✅ SMS UP Plus OTP sent successfully:', {
        otcId: data.data.otcId,
        otpId: data.data.otpId,
        referenceCode: data.data.referenceCode
      })

      // Return structured response with OTP verification data
      return {
        success: true,
        message: data.message,
        otpId: data.otpId, // For verification
        referenceCode: data.referenceCode, // For display to user
        session: {
          id: data.session.id,
          phoneNumber: data.session.phoneNumber,
          formattedPhone: data.session.formattedPhone,
          status: 'pending',
          expiresAt: data.session.expiresAt,
          verificationAttempts: 0,
          maxAttempts: 3,
          // Store SMS UP Plus specific data
          otcId: data.data.otcId,
          otpId: data.data.otpId,
          referenceCode: data.data.referenceCode,
          accessToken: data.data.accessToken
        }
      }

    } catch (error) {
      console.error('💥 Send OTP error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * ส่ง OTP ซ้ำผ่าน Edge Function
   */
  async resendOTP(request: ResendOTPRequest): Promise<OTPResult> {
    try {
      console.log('🔄 Calling otp-resend Edge Function...')
      
      const { data, error } = await supabase.functions.invoke('otp-resend', {
        body: {
          phoneNumber: request.phoneNumber,
          otpId: request.otpId,
          userId: request.userId
        }
      })

      if (error) {
        console.error('❌ Resend OTP Edge Function error:', error)
        return {
          success: false,
          message: error.message || 'Failed to resend OTP'
        }
      }

      console.log('✅ Resend OTP successful:', data)
      return {
        success: true,
        message: data.message || 'OTP resent successfully',
        otpId: data.otpId,
        referenceCode: data.referenceCode,
        session: data.session
      }

    } catch (error) {
      console.error('💥 Resend OTP error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ยืนยัน OTP ผ่าน Edge Function
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<OTPResult> {
    try {
      console.log('🔍 Calling otp-verify Edge Function...')
      
      // Use Supabase client directly with proper authentication
      const { data, error } = await supabase.functions.invoke('otp-verify', {
        body: {
          otpId: request.otpId,
          referenceCode: request.referenceCode,
          otpCode: request.otpCode
        }
      })

      if (error) {
        console.error('❌ Edge Function error:', error)
        return {
          success: false,
          message: error.message || 'Failed to verify OTP'
        }
      }

      console.log('✅ Edge Function response:', data)
      return data as OTPResult

    } catch (error) {
      console.error('💥 Verify OTP error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * ตรวจสอบว่าเบอร์โทรยืนยันแล้วหรือไม่
   */
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      // Simple check - just return false for now, can be improved later
      console.log('📱 Checking phone verification status:', formattedPhone)
      return false

    } catch (error) {
      console.error('💥 Check phone error:', error)
      return false
    }
  }

  /**
   * ได้ข้อมูล OTP Session
   */
  async getSession(sessionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) {
        console.error('❌ Get session error:', error)
        return null
      }

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        formattedPhone: data.formatted_phone,
        status: data.status,
        expiresAt: data.expires_at,
        verificationAttempts: data.max_attempts - (data.max_attempts - 0), // Default to 0 attempts
        maxAttempts: data.max_attempts,
        createdAt: data.created_at
      }

    } catch (error) {
      console.error('💥 Get session error:', error)
      return null
    }
  }

  /**
   * จัดรูปแบบเบอร์โทรศัพท์
   */
  private formatPhoneNumber(phone: string): string {
    const numbers = phone.replace(/\D/g, '')
    
    if (numbers.length === 9 && !numbers.startsWith('66')) {
      return `66${numbers}`
    }
    if (numbers.length === 10 && numbers.startsWith('0')) {
      return `66${numbers.slice(1)}`
    }
    
    return numbers
  }
}

// Export singleton instance
export const edgeFunctionOTPService = new EdgeFunctionOTPService()
export default edgeFunctionOTPService
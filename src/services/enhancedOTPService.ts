/**
 * Enhanced OTP Service with Resend Functionality
 * Phase 3.1: Advanced OTP management with resend limits and tracking
 * Updated: September 14, 2025
 */

import { supabase } from '@/integrations/supabase/client';

export interface ResendOTPRequest {
  sessionId: string;
  phoneNumber: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  session?: {
    id: string;
    expiresAt: string;
    resendCount: number;
    maxResends: number;
    remainingResends: number;
    nextResendAt: string;
  };
  otp?: {
    otpId: string;
    referenceCode: string;
  };
  code?: string;
  requestId?: string;
}

export interface OTPSessionStatus {
  id: string;
  phoneNumber: string;
  status: 'pending' | 'verified' | 'expired' | 'blocked';
  attempts: number;
  maxAttempts: number;
  resendCount: number;
  maxResends: number;
  expiresAt: string;
  lastResendAt?: string;
  canResend: boolean;
  nextResendAvailableAt?: string;
  remainingResends: number;
}

export class EnhancedOTPService {
  private baseUrl = 'https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1';

  /**
   * Get current session status with resend information
   */
  async getSessionStatus(sessionId: string): Promise<OTPSessionStatus | null> {
    try {
      const { data: session, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        console.error('Session not found:', error);
        return null;
      }

      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      const lastResendAt = session.last_resend_at ? new Date(session.last_resend_at) : null;
      
      // Check if can resend (60 seconds cooldown)
      const canResendTime = lastResendAt ? new Date(lastResendAt.getTime() + 60 * 1000) : now;
      const canResend = now >= canResendTime && session.resend_count < session.max_resends;

      return {
        id: session.id,
        phoneNumber: session.phone_number,
        status: session.status as any,
        attempts: session.verification_attempts || 0,
        maxAttempts: session.max_attempts || 3,
        resendCount: session.resend_count || 0,
        maxResends: session.max_resends || 3,
        expiresAt: session.expires_at,
        lastResendAt: session.last_resend_at,
        canResend: canResend && expiresAt > now,
        nextResendAvailableAt: canResend ? null : canResendTime.toISOString(),
        remainingResends: Math.max(0, (session.max_resends || 3) - (session.resend_count || 0))
      };
    } catch (error) {
      console.error('Error getting session status:', error);
      return null;
    }
  }

  /**
   * Request OTP resend with enhanced validation
   */
  async resendOTP(request: ResendOTPRequest): Promise<ResendOTPResponse> {
    try {
      // First validate session status
      const sessionStatus = await this.getSessionStatus(request.sessionId);
      
      if (!sessionStatus) {
        return {
          success: false,
          message: 'ไม่พบ session กรุณาเริ่มกระบวนการใหม่',
          code: 'SESSION_NOT_FOUND'
        };
      }

      if (sessionStatus.status === 'verified') {
        return {
          success: false,
          message: 'หมายเลขนี้ยืนยันแล้ว',
          code: 'ALREADY_VERIFIED'
        };
      }

      if (sessionStatus.status === 'expired') {
        return {
          success: false,
          message: 'Session หมดอายุแล้ว กรุณาเริ่มใหม่',
          code: 'SESSION_EXPIRED'
        };
      }

      if (sessionStatus.status === 'blocked') {
        return {
          success: false,
          message: 'Session ถูกบล็อก กรุณาเริ่มใหม่',
          code: 'SESSION_BLOCKED'
        };
      }

      if (!sessionStatus.canResend) {
        if (sessionStatus.remainingResends <= 0) {
          return {
            success: false,
            message: `ส่งซ้ำครบ ${sessionStatus.maxResends} ครั้งแล้ว`,
            code: 'MAX_RESENDS_EXCEEDED'
          };
        }

        if (sessionStatus.nextResendAvailableAt) {
          const waitTime = Math.ceil((new Date(sessionStatus.nextResendAvailableAt).getTime() - Date.now()) / 1000);
          return {
            success: false,
            message: `กรุณารอ ${waitTime} วินาที`,
            code: 'RESEND_TOO_SOON'
          };
        }
      }

      // Call resend API
      const { data, error } = await supabase.functions.invoke('otp-resend', {
        body: {
          sessionId: request.sessionId,
          phoneNumber: request.phoneNumber,
          userAgent: navigator.userAgent
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Resend API error:', error);
        return {
          success: false,
          message: 'เกิดข้อผิดพลาดในการส่ง OTP',
          code: 'API_ERROR'
        };
      }

      return data as ResendOTPResponse;

    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Check if phone number can receive new OTP (daily limits)
   */
  async canRequestOTP(phoneNumber: string): Promise<{
    allowed: boolean;
    reason?: string;
    nextAllowedAt?: string;
    dailyLimit?: number;
    used?: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('check_daily_resend_limit', {
        p_phone_number: phoneNumber,
        p_daily_limit: 10
      });

      if (error) {
        console.error('Daily limit check error:', error);
        return { allowed: true }; // Fail open
      }

      if (!data) {
        // Get current daily usage
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: usage, error: usageError } = await supabase
          .from('otp_verifications')
          .select('id')
          .eq('phone_number', phoneNumber)
          .gte('created_at', startOfDay.toISOString());

        const used = usage?.length || 0;
        const dailyLimit = 10;

        return {
          allowed: false,
          reason: `เกินขีดจำกัดรายวัน (${used}/${dailyLimit})`,
          dailyLimit,
          used,
          nextAllowedAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking daily limits:', error);
      return { allowed: true }; // Fail open for now
    }
  }

  /**
   * Get resend analytics for a phone number
   */
  async getResendAnalytics(phoneNumber: string, days: number = 7): Promise<{
    totalResends: number;
    avgResendsPerSession: number;
    successRate: number;
    commonFailureReasons: string[];
    dailyPattern: { date: string; resends: number }[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: analytics, error } = await supabase
        .from('otp_resend_analytics')
        .select('*')
        .eq('phone_number', phoneNumber)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Analytics error:', error);
        return {
          totalResends: 0,
          avgResendsPerSession: 0,
          successRate: 0,
          commonFailureReasons: [],
          dailyPattern: []
        };
      }

      const totalResends = analytics?.length || 0;
      const sessions = new Set(analytics?.map(a => a.session_id));
      const avgResendsPerSession = sessions.size > 0 ? totalResends / sessions.size : 0;

      // Calculate daily pattern
      const dailyMap = new Map<string, number>();
      analytics?.forEach(record => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const dailyPattern = Array.from(dailyMap.entries()).map(([date, resends]) => ({
        date,
        resends
      }));

      return {
        totalResends,
        avgResendsPerSession,
        successRate: 85, // Placeholder - would calculate from verification success
        commonFailureReasons: ['Timeout', 'Invalid OTP', 'Network Error'],
        dailyPattern
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalResends: 0,
        avgResendsPerSession: 0,
        successRate: 0,
        commonFailureReasons: [],
        dailyPattern: []
      };
    }
  }

  /**
   * Cancel OTP session (user requested)
   */
  async cancelSession(sessionId: string, reason: string = 'user_cancelled'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { error } = await supabase
        .from('otp_verifications')
        .update({
          status: 'blocked',
          updated_at: new Date().toISOString(),
          notes: `Cancelled: ${reason}`
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Cancel session error:', error);
        return {
          success: false,
          message: 'ไม่สามารถยกเลิก session ได้'
        };
      }

      return {
        success: true,
        message: 'ยกเลิก session แล้ว'
      };
    } catch (error) {
      console.error('Error cancelling session:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการยกเลิก session'
      };
    }
  }
}

// Export singleton instance
export const enhancedOTPService = new EnhancedOTPService();
export default enhancedOTPService;
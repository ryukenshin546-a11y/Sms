/**
 * Comprehensive OTP Service
 * Combines ANTS OTP API with Supabase database management
 * Updated: September 14, 2025
 */

import { ANTSOTPService, OTPRequestResult, OTPVerifyResult } from './antsOTPService';
import { SupabaseOTPService, OTPSession, CreateOTPSessionRequest, UpdateOTPSessionRequest } from './supabaseOTPService';

export interface OTPServiceConfig {
  expiresInMinutes: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
}

export interface SendOTPRequest {
  phoneNumber: string;
  userId?: string;
  sessionToken?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OTPVerificationResult {
  success: boolean;
  session?: OTPSession;
  message: string;
  canResend?: boolean;
  nextResendAt?: Date;
  attemptsRemaining?: number;
}

export class OTPService {
  private antsOTP: ANTSOTPService;
  private supabaseOTP: SupabaseOTPService;
  private config: OTPServiceConfig;

  constructor() {
    this.antsOTP = new ANTSOTPService();
    this.supabaseOTP = new SupabaseOTPService();
    
    // Load configuration from environment
    this.config = {
      expiresInMinutes: parseInt(import.meta.env.VITE_OTP_EXPIRES_IN_MINUTES || '5'),
      maxAttempts: parseInt(import.meta.env.VITE_OTP_MAX_ATTEMPTS || '3'),
      resendCooldownSeconds: parseInt(import.meta.env.VITE_OTP_RESEND_COOLDOWN_SECONDS || '60')
    };
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(request: SendOTPRequest): Promise<OTPVerificationResult> {
    try {
      // Check if phone number is already verified
      const existingVerification = await this.supabaseOTP.isPhoneVerified(request.phoneNumber);
      if (existingVerification) {
        return {
          success: false,
          message: 'Phone number is already verified',
        };
      }

      // Send OTP via ANTS API
      const antsResult = await this.antsOTP.requestOTP(request.phoneNumber);
      
      if (!antsResult.success) {
        return {
          success: false,
          message: antsResult.message || 'Failed to send OTP',
        };
      }

      // Create OTP session in database
      const sessionData: CreateOTPSessionRequest = {
        phoneNumber: request.phoneNumber,
        userId: request.userId,
        sessionToken: request.sessionToken,
        externalOtpId: antsResult.referenceCode,
        referenceCode: antsResult.referenceCode,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
      };

      const session = await this.supabaseOTP.createOTPSession(sessionData);
      if (!session) {
        throw new Error('Failed to create OTP session');
      }

      return {
        success: true,
        session,
        message: 'OTP sent successfully',
        canResend: false,
        nextResendAt: new Date(Date.now() + (this.config.resendCooldownSeconds * 1000)),
        attemptsRemaining: session.maxAttempts,
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(sessionId: string, otpCode: string): Promise<OTPVerificationResult> {
    try {
      // Get session from database
      const session = await this.supabaseOTP.getOTPSession(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Invalid or expired OTP session',
        };
      }

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.supabaseOTP.updateOTPSession(session.id, {
          status: 'expired',
        });

        return {
          success: false,
          message: 'OTP has expired',
        };
      }

      // Check attempt limits
      if (session.verificationAttempts >= session.maxAttempts) {
        await this.supabaseOTP.updateOTPSession({
          sessionId: session.id,
          status: 'failed',
        });

        return {
          success: false,
          message: 'Maximum verification attempts exceeded',
        };
      }

      // Verify OTP with ANTS API
      let antsResult: OTPVerifyResult;
      if (session.externalOtpId) {
        antsResult = await this.antsOTP.verifyOTP(session.externalOtpId, otpCode);
      } else {
        // Fallback verification by phone number
        antsResult = await this.antsOTP.verifyOTP(session.phoneNumber, otpCode);
      }

      // Increment attempt count
      const updatedSession = await this.supabaseOTP.updateOTPSession({
        sessionId: session.id,
        incrementAttempts: true,
      });

      if (!antsResult.success) {
        // Failed verification
        const finalSession = await this.supabaseOTP.updateOTPSession({
          sessionId: session.id,
          status: updatedSession && updatedSession.verificationAttempts >= session.maxAttempts ? 'failed' : 'pending',
        });

        return {
          success: false,
          session: finalSession || updatedSession,
          message: antsResult.message || 'Invalid OTP code',
          attemptsRemaining: finalSession ? Math.max(0, finalSession.maxAttempts - finalSession.verificationAttempts) : 0,
        };
      }

      // Successful verification
      const verifiedSession = await this.supabaseOTP.updateOTPSession({
        sessionId: session.id,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      });

      // Add phone number to verified numbers
      await this.supabaseOTP.addVerifiedPhoneNumber({
        phoneNumber: session.phoneNumber,
        userId: session.userId,
        otpVerificationId: session.id,
        verificationMethod: 'sms_otp',
      });

      return {
        success: true,
        session: verifiedSession,
        message: 'Phone number verified successfully',
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(sessionId: string): Promise<OTPVerificationResult> {
    try {
      const session = await this.supabaseOTP.getOTPSession(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Invalid OTP session',
        };
      }

      // Check cooldown
      const now = new Date();
      const lastSent = new Date(session.createdAt);
      const secondsSinceLastSent = (now.getTime() - lastSent.getTime()) / 1000;
      
      if (secondsSinceLastSent < this.config.resendCooldownSeconds) {
        const nextResendAt = new Date(lastSent.getTime() + (this.config.resendCooldownSeconds * 1000));
        return {
          success: false,
          session,
          message: 'Please wait before requesting another OTP',
          canResend: false,
          nextResendAt,
        };
      }

      // Resend OTP via ANTS API
      const antsResult = await this.antsOTP.resendOTP(session.externalOtpId || session.phoneNumber);
      
      if (!antsResult.success) {
        return {
          success: false,
          session,
          message: antsResult.message || 'Failed to resend OTP',
        };
      }

      // Update session
      const updatedSession = await this.supabaseOTP.updateOTPSession({
        sessionId: session.id,
        status: 'sent',
        resetAttempts: false, // Don't reset attempts on resend
        externalOtpId: antsResult.referenceCode,
        referenceCode: antsResult.referenceCode,
      });

      return {
        success: true,
        session: updatedSession,
        message: 'OTP resent successfully',
        canResend: false,
        nextResendAt: new Date(Date.now() + (this.config.resendCooldownSeconds * 1000)),
        attemptsRemaining: updatedSession ? updatedSession.maxAttempts - updatedSession.verificationAttempts : 0,
      };

    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if phone number is already verified
   */
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      const verified = await this.supabaseOTP.getVerifiedPhoneNumber(phoneNumber);
      return !!verified;
    } catch (error) {
      console.error('Error checking phone verification:', error);
      return false;
    }
  }

  /**
   * Get OTP session status
   */
  async getSessionStatus(sessionId: string): Promise<OTPSession | null> {
    try {
      return await this.supabaseOTP.getOTPSession(sessionId);
    } catch (error) {
      console.error('Error getting session status:', error);
      return null;
    }
  }

  /**
   * Cancel OTP session
   */
  async cancelSession(sessionId: string): Promise<boolean> {
    try {
      const updatedSession = await this.supabaseOTP.updateOTPSession({
        sessionId,
        status: 'failed',
      });
      return !!updatedSession;
    } catch (error) {
      console.error('Error canceling session:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      return await this.supabaseOTP.cleanupExpiredSessions();
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const otpService = new OTPService();
export default otpService;

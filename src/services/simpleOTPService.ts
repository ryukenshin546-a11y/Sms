/**
 * Simple OTP Service
 * Basic OTP verification functionality using ANTS API and Supabase
 * Updated: September 14, 2025
 */

import { ANTSOTPService, OTPRequestResult, OTPVerifyResult } from './antsOTPService';
import { SupabaseOTPService, OTPSession, CreateOTPSessionRequest } from './supabaseOTPService';

export interface SendOTPRequest {
  phoneNumber: string;
  userId?: string;
}

export interface VerifyOTPRequest {
  sessionId: string;
  otpCode: string;
}

export interface OTPResult {
  success: boolean;
  message: string;
  session?: OTPSession;
  data?: any;
}

export class SimpleOTPService {
  private antsOTP: ANTSOTPService;
  private supabaseOTP: SupabaseOTPService;

  constructor() {
    this.antsOTP = new ANTSOTPService();
    this.supabaseOTP = new SupabaseOTPService();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(request: SendOTPRequest): Promise<OTPResult> {
    try {
      // Check if phone is already verified
      const isVerified = await this.supabaseOTP.isPhoneVerified(request.phoneNumber);
      if (isVerified) {
        return {
          success: false,
          message: 'Phone number is already verified'
        };
      }

      // Send OTP via ANTS
      const antsResult = await this.antsOTP.requestOTP(request.phoneNumber);
      if (!antsResult.success) {
        return {
          success: false,
          message: antsResult.message || 'Failed to send OTP'
        };
      }

      // Create session in database
      const sessionData: CreateOTPSessionRequest = {
        phoneNumber: request.phoneNumber,
        userId: request.userId,
        externalOtpId: antsResult.referenceCode,
        referenceCode: antsResult.referenceCode
      };

      const session = await this.supabaseOTP.createOTPSession(sessionData);
      if (!session) {
        return {
          success: false,
          message: 'Failed to create OTP session'
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        session
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<OTPResult> {
    try {
      // Get session
      const session = await this.supabaseOTP.getOTPSession(request.sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Invalid OTP session'
        };
      }

      // Check if expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.supabaseOTP.updateOTPSession(session.id, { status: 'expired' });
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Check attempts
      if (session.verificationAttempts >= session.maxAttempts) {
        await this.supabaseOTP.updateOTPSession(session.id, { status: 'failed' });
        return {
          success: false,
          message: 'Maximum attempts exceeded'
        };
      }

      // Verify with ANTS
      const antsResult = await this.antsOTP.verifyOTP(
        session.externalOtpId || session.phoneNumber,
        request.otpCode
      );

      // Increment attempts
      await this.supabaseOTP.incrementVerificationAttempts(session.id);

      if (!antsResult.success) {
        // Check if max attempts reached after increment
        const updatedSession = await this.supabaseOTP.getOTPSession(request.sessionId);
        if (updatedSession && updatedSession.verificationAttempts >= updatedSession.maxAttempts) {
          await this.supabaseOTP.updateOTPSession(session.id, { status: 'failed' });
        }
        
        return {
          success: false,
          message: antsResult.message || 'Invalid OTP code'
        };
      }

      // Success - mark as verified
      const verifiedSession = await this.supabaseOTP.updateOTPSession(session.id, {
        status: 'verified',
        verifiedAt: new Date().toISOString()
      });

      // Mark phone as verified
      await this.supabaseOTP.markPhoneAsVerified(session.id);

      return {
        success: true,
        message: 'Phone number verified successfully',
        session: verifiedSession
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if phone is verified
   */
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      return await this.supabaseOTP.isPhoneVerified(phoneNumber);
    } catch (error) {
      console.error('Error checking phone verification:', error);
      return false;
    }
  }

  /**
   * Get session status
   */
  async getSession(sessionId: string): Promise<OTPSession | null> {
    try {
      return await this.supabaseOTP.getOTPSession(sessionId);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
}

// Export singleton
export const simpleOTPService = new SimpleOTPService();
export default simpleOTPService;
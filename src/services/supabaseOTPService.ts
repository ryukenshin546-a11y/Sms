/**
 * Supabase OTP Database Service
 * Manages OTP verification sessions in database
 * Updated: September 14, 2025
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];
type OTPVerification = Tables['otp_verifications']['Row'];
type OTPVerificationInsert = Tables['otp_verifications']['Insert'];
type OTPVerificationUpdate = Tables['otp_verifications']['Update'];
type VerifiedPhoneNumber = Tables['verified_phone_numbers']['Row'];
type VerifiedPhoneNumberInsert = Tables['verified_phone_numbers']['Insert'];

// Service types
export interface OTPSession {
  id: string;
  phoneNumber: string;
  formattedPhone: string;
  status: 'pending' | 'sent' | 'verified' | 'failed' | 'expired';
  referenceCode?: string;
  externalOtpId?: string;
  verificationAttempts: number;
  maxAttempts: number;
  expiresAt: string;
  createdAt: string;
}

export interface CreateOTPSessionRequest {
  phoneNumber: string;
  userId?: string;
  sessionToken?: string;
  externalOtpId?: string;
  referenceCode?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateOTPSessionRequest {
  status?: 'pending' | 'sent' | 'verified' | 'failed' | 'expired';
  verificationAttempts?: number;
  verifiedAt?: string;
  externalOtpId?: string;
  referenceCode?: string;
}

export class SupabaseOTPService {
  
  /**
   * Format phone number to standard format (66XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string, countryCode: string = '+66'): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/[^0-9]/g, '');
    
    // Handle Thai phone numbers
    if (countryCode === '+66') {
      // Remove leading 0 if present
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      // Add country code without +
      if (!cleaned.startsWith('66')) {
        cleaned = '66' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * Check if phone number is already verified
   */
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase
        .from('verified_phone_numbers')
        .select('id')
        .eq('formatted_phone', formattedPhone)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking phone verification:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isPhoneVerified:', error);
      return false;
    }
  }

  /**
   * Create new OTP verification session
   */
  async createOTPSession(request: CreateOTPSessionRequest): Promise<OTPSession | null> {
    try {
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);
      
      // Check if phone is already verified
      const isAlreadyVerified = await this.isPhoneVerified(request.phoneNumber);
      if (isAlreadyVerified) {
        throw new Error('Phone number is already verified');
      }

      const insertData: OTPVerificationInsert = {
        phone_number: request.phoneNumber,
        formatted_phone: formattedPhone,
        user_id: request.userId || null,
        session_token: request.sessionToken || null,
        external_otp_id: request.externalOtpId || null,
        external_reference: request.referenceCode || null,
        status: 'pending',
        verification_attempts: 0,
        max_attempts: 5,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        ip_address: request.ipAddress || null,
        user_agent: request.userAgent || null
      };

      const { data, error } = await supabase
        .from('otp_verifications')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating OTP session:', error);
        throw error;
      }

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        formattedPhone: data.formatted_phone,
        status: data.status as any,
        referenceCode: data.external_reference || undefined,
        externalOtpId: data.external_otp_id || undefined,
        verificationAttempts: data.verification_attempts,
        maxAttempts: data.max_attempts,
        expiresAt: data.expires_at!,
        createdAt: data.created_at!
      };

    } catch (error) {
      console.error('Error in createOTPSession:', error);
      throw error;
    }
  }

  /**
   * Get OTP session by ID
   */
  async getOTPSession(sessionId: string): Promise<OTPSession | null> {
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error getting OTP session:', error);
        throw error;
      }

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        formattedPhone: data.formatted_phone,
        status: data.status as any,
        referenceCode: data.external_reference || undefined,
        externalOtpId: data.external_otp_id || undefined,
        verificationAttempts: data.verification_attempts,
        maxAttempts: data.max_attempts,
        expiresAt: data.expires_at!,
        createdAt: data.created_at!
      };

    } catch (error) {
      console.error('Error in getOTPSession:', error);
      throw error;
    }
  }

  /**
   * Update OTP session
   */
  async updateOTPSession(sessionId: string, updates: UpdateOTPSessionRequest): Promise<OTPSession | null> {
    try {
      const updateData: OTPVerificationUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.status === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('otp_verifications')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating OTP session:', error);
        throw error;
      }

      return {
        id: data.id,
        phoneNumber: data.phone_number,
        formattedPhone: data.formatted_phone,
        status: data.status as any,
        referenceCode: data.external_reference || undefined,
        externalOtpId: data.external_otp_id || undefined,
        verificationAttempts: data.verification_attempts,
        maxAttempts: data.max_attempts,
        expiresAt: data.expires_at!,
        createdAt: data.created_at!
      };

    } catch (error) {
      console.error('Error in updateOTPSession:', error);
      throw error;
    }
  }

  /**
   * Mark phone number as verified
   */
  async markPhoneAsVerified(sessionId: string, userId?: string): Promise<VerifiedPhoneNumber | null> {
    try {
      // Get the OTP session
      const session = await this.getOTPSession(sessionId);
      if (!session) {
        throw new Error('OTP session not found');
      }

      if (session.status !== 'verified') {
        throw new Error('OTP session is not verified');
      }

      // Insert into verified_phone_numbers
      const insertData: VerifiedPhoneNumberInsert = {
        phone_number: session.phoneNumber,
        formatted_phone: session.formattedPhone,
        user_id: userId || null,
        verification_method: 'sms_otp',
        otp_verification_id: sessionId,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('verified_phone_numbers')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error marking phone as verified:', error);
        throw error;
      }

      // Update user profile if userId provided
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            phone_verified: true,
            phone_verified_at: new Date().toISOString(),
            verified_phone_id: data.id
          })
          .eq('id', userId);
      }

      return data;

    } catch (error) {
      console.error('Error in markPhoneAsVerified:', error);
      throw error;
    }
  }

  /**
   * Increment verification attempts
   */
  async incrementVerificationAttempts(sessionId: string): Promise<{ attempts: number; maxAttempts: number; exceeded: boolean }> {
    try {
      const session = await this.getOTPSession(sessionId);
      if (!session) {
        throw new Error('OTP session not found');
      }

      const newAttempts = session.verificationAttempts + 1;
      const exceeded = newAttempts >= session.maxAttempts;

      await this.updateOTPSession(sessionId, {
        verificationAttempts: newAttempts,
        status: exceeded ? 'failed' : session.status
      });

      return {
        attempts: newAttempts,
        maxAttempts: session.maxAttempts,
        exceeded
      };

    } catch (error) {
      console.error('Error in incrementVerificationAttempts:', error);
      throw error;
    }
  }

  /**
   * Clean up expired OTP sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .in('status', ['pending', 'sent', 'failed']);

      if (error) {
        console.error('Error cleaning up expired sessions:', error);
        return 0;
      }

      return (data as OTPVerification[])?.length || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredSessions:', error);
      return 0;
    }
  }

  /**
   * Get user's verified phone numbers
   */
  async getUserVerifiedPhones(userId: string): Promise<VerifiedPhoneNumber[]> {
    try {
      const { data, error } = await supabase
        .from('verified_phone_numbers')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user verified phones:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserVerifiedPhones:', error);
      throw error;
    }
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session: OTPSession): boolean {
    return new Date() > new Date(session.expiresAt);
  }

  /**
   * Check if session can be used for verification
   */
  canVerifySession(session: OTPSession): boolean {
    return (
      session.status === 'sent' &&
      !this.isSessionExpired(session) &&
      session.verificationAttempts < session.maxAttempts
    );
  }
}

// Export singleton instance
export const supabaseOTPService = new SupabaseOTPService();
export default supabaseOTPService;
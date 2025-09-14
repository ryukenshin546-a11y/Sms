/**
 * ANTS OTP Service Integration
 * Handles SMS OTP verification through ANTS API
 * Updated: September 14, 2025
 */

// Types for ANTS API
export interface ANTSLoginRequest {
  username: string;
  password: string;
}

export interface ANTSLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ANTSRequestOTPRequest {
  otcId: string;
  mobile: string;
  notifyUrl?: string;
  notifyContentType?: string;
  callbackData?: string;
}

export interface ANTSRequestOTPResponse {
  otcId: string;
  otpId: string;
  referenceCode: string;
  success: {
    message: string;
    description: string;
  };
}

export interface ANTSVerifyOTPRequest {
  otpId: string;
  otpCode: string;
}

export interface ANTSVerifyOTPResponse {
  otpId: string;
  result: boolean;
  isErrorCount: boolean;
  isExprCode: boolean;
}

// Local OTP Types
export interface OTPVerificationSession {
  id: string;
  phoneNumber: string;
  formattedPhone: string;
  otpId?: string;
  referenceCode?: string;
  status: 'pending' | 'sent' | 'verified' | 'failed' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface OTPRequestResult {
  success: boolean;
  sessionId?: string;
  referenceCode?: string;
  otpId?: string;
  message: string;
  error?: string;
}

export interface OTPVerifyResult {
  success: boolean;
  verified: boolean;
  sessionId?: string;
  message: string;
  error?: string;
  attempts?: number;
  maxAttempts?: number;
}

export class ANTSOTPService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private otcId: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_OTP_BASE_URL || 'https://web.smsup-plus.com';
    this.username = import.meta.env.VITE_OTP_USERNAME || 'Landingpage';
    this.password = import.meta.env.VITE_OTP_PASSWORD || '@Atoz123';
    this.otcId = import.meta.env.VITE_OTP_OTC_ID || '184c870e-ce42-4c7c-961f-9854d13d0ada';
  }

  /**
   * Login to ANTS API and get Bearer token
   */
  private async login(): Promise<string> {
    try {
      console.log('🔐 Logging into ANTS OTP API...');
      
      const response = await fetch(`${this.baseUrl}/api/Token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        } as ANTSLoginRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }

      const loginResult: ANTSLoginResponse = await response.json();
      
      // Store token and expiration
      this.accessToken = loginResult.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (loginResult.expires_in * 1000));
      
      console.log('✅ Successfully logged in to ANTS OTP API');
      return this.accessToken;

    } catch (error) {
      console.error('❌ ANTS OTP Login failed:', error);
      throw new Error(`Failed to login to OTP service: ${error.message}`);
    }
  }

  /**
   * Get valid Bearer token (login if needed or token expired)
   */
  private async getValidToken(): Promise<string> {
    // Check if we need to login
    if (!this.accessToken || !this.tokenExpiresAt || new Date() >= this.tokenExpiresAt) {
      console.log('🔄 Token expired or missing, logging in...');
      return await this.login();
    }
    
    return this.accessToken;
  }

  /**
   * Format phone number for ANTS API (Thai format)
   */
  private formatPhoneForAPI(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/[^0-9]/g, '');
    
    // Handle Thai phone numbers
    if (cleaned.startsWith('0')) {
      // Remove leading 0 and add 66
      cleaned = '66' + cleaned.substring(1);
    } else if (!cleaned.startsWith('66')) {
      // Add 66 if not present
      cleaned = '66' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Request OTP via ANTS API
   */
  async requestOTP(phoneNumber: string, options?: {
    notifyUrl?: string;
    callbackData?: string;
  }): Promise<OTPRequestResult> {
    try {
      console.log('📱 Requesting OTP for phone:', phoneNumber);

      // Get valid token
      const token = await this.getValidToken();
      
      // Format phone number
      const formattedPhone = this.formatPhoneForAPI(phoneNumber);
      console.log('📞 Formatted phone:', formattedPhone);

      // Prepare request
      const requestData: ANTSRequestOTPRequest = {
        otcId: this.otcId,
        mobile: formattedPhone,
        notifyUrl: options?.notifyUrl,
        notifyContentType: options?.notifyUrl ? 'application/json' : undefined,
        callbackData: options?.callbackData
      };

      // Send OTP request
      const response = await fetch(`${this.baseUrl}/OTP/requestOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OTP Request failed:', response.status, errorText);
        throw new Error(`OTP request failed: ${response.status} ${errorText}`);
      }

      const otpResult: ANTSRequestOTPResponse = await response.json();
      console.log('✅ OTP requested successfully:', otpResult.referenceCode);

      return {
        success: true,
        otpId: otpResult.otpId,
        referenceCode: otpResult.referenceCode,
        message: 'OTP sent successfully'
      };

    } catch (error) {
      console.error('❌ Request OTP failed:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      };
    }
  }

  /**
   * Verify OTP via ANTS API
   */
  async verifyOTP(otpId: string, otpCode: string): Promise<OTPVerifyResult> {
    try {
      console.log('🔍 Verifying OTP:', otpId, 'Code:', otpCode);

      // Get valid token
      const token = await this.getValidToken();

      // Prepare verification request
      const verifyData: ANTSVerifyOTPRequest = {
        otpId: otpId,
        otpCode: otpCode
      };

      // Send verification request
      const response = await fetch(`${this.baseUrl}/OTP/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(verifyData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OTP Verify failed:', response.status, errorText);
        throw new Error(`OTP verification failed: ${response.status} ${errorText}`);
      }

      const verifyResult: ANTSVerifyOTPResponse = await response.json();
      console.log('📋 OTP Verification result:', verifyResult);

      return {
        success: true,
        verified: verifyResult.result,
        message: verifyResult.result ? 'OTP verified successfully' : 'Invalid OTP code',
        error: verifyResult.result ? undefined : 'OTP verification failed'
      };

    } catch (error) {
      console.error('❌ Verify OTP failed:', error);
      return {
        success: false,
        verified: false,
        message: 'OTP verification failed',
        error: error.message
      };
    }
  }

  /**
   * Resend OTP via ANTS API
   */
  async resendOTP(otpId: string): Promise<OTPRequestResult> {
    try {
      console.log('🔄 Resending OTP:', otpId);

      // Get valid token
      const token = await this.getValidToken();

      // Send resend request
      const response = await fetch(`${this.baseUrl}/OTP/resendOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otpId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OTP Resend failed:', response.status, errorText);
        throw new Error(`OTP resend failed: ${response.status} ${errorText}`);
      }

      const resendResult: ANTSRequestOTPResponse = await response.json();
      console.log('✅ OTP resent successfully:', resendResult.referenceCode);

      return {
        success: true,
        otpId: resendResult.otpId,
        referenceCode: resendResult.referenceCode,
        message: 'OTP resent successfully'
      };

    } catch (error) {
      console.error('❌ Resend OTP failed:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
        error: error.message
      };
    }
  }

  /**
   * Test connection to ANTS API
   */
  async testConnection(): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const token = await this.login();
      return {
        success: true,
        message: 'Successfully connected to ANTS OTP API',
        token: token.substring(0, 20) + '...'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const antsOTPService = new ANTSOTPService();
export default antsOTPService;
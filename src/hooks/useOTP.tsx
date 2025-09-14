/**
 * useOTP Hook
 * React hook for OTP verification functionality
 * Updated: September 14, 2025
 */

import { useState, useCallback } from 'react';
import { simpleOTPService, SendOTPRequest, VerifyOTPRequest, OTPResult } from '@/services/simpleOTPService';

export interface UseOTPOptions {
  onSuccess?: (phoneNumber: string, sessionId: string) => void;
  onError?: (error: string) => void;
  resendCooldownSeconds?: number;
}

export interface UseOTPReturn {
  // State
  loading: boolean;
  error: string | null;
  success: string | null;
  sessionId: string | null;
  isVerified: boolean;
  
  // Actions
  sendOTP: (phoneNumber: string, userId?: string) => Promise<void>;
  verifyOTP: (otpCode: string) => Promise<boolean>;
  checkPhoneVerified: (phoneNumber: string) => Promise<boolean>;
  clearError: () => void;
  clearSuccess: () => void;
  reset: () => void;
}

export const useOTP = (options?: UseOTPOptions): UseOTPReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(null);
    setSessionId(null);
    setIsVerified(false);
  }, []);

  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (numbers.length === 9 && !numbers.startsWith('66')) {
      return `66${numbers}`;
    }
    if (numbers.length === 10 && numbers.startsWith('0')) {
      return `66${numbers.slice(1)}`;
    }
    
    return numbers;
  }, []);

  const sendOTP = useCallback(async (phoneNumber: string, userId?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const request: SendOTPRequest = {
        phoneNumber: formattedPhone,
        userId
      };

      const result = await simpleOTPService.sendOTP(request);
      
      if (result.success && result.session) {
        setSessionId(result.session.id);
        setSuccess('OTP sent successfully to your phone number');
      } else {
        setError(result.message);
        options?.onError?.(result.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      options?.onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [formatPhoneNumber, options]);

  const verifyOTP = useCallback(async (otpCode: string): Promise<boolean> => {
    if (!sessionId) {
      setError('No active OTP session found');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const request: VerifyOTPRequest = {
        sessionId,
        otpCode: otpCode.trim()
      };

      const result = await simpleOTPService.verifyOTP(request);
      
      if (result.success) {
        setIsVerified(true);
        setSuccess('Phone number verified successfully!');
        options?.onSuccess?.('', sessionId); // Phone number will be retrieved from session
        return true;
      } else {
        setError(result.message);
        options?.onError?.(result.message);
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(message);
      options?.onError?.(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [sessionId, options]);

  const checkPhoneVerified = useCallback(async (phoneNumber: string): Promise<boolean> => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      return await simpleOTPService.isPhoneVerified(formattedPhone);
    } catch (err) {
      console.error('Error checking phone verification:', err);
      return false;
    }
  }, [formatPhoneNumber]);

  return {
    // State
    loading,
    error,
    success,
    sessionId,
    isVerified,
    
    // Actions
    sendOTP,
    verifyOTP,
    checkPhoneVerified,
    clearError,
    clearSuccess,
    reset
  };
};

export default useOTP;
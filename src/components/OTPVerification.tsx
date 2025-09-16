/**
 * OTP Verification Component
 * Phone number verification with SMS OTP
 * Updated: September 15, 2025 - Use Edge Function for CORS fix
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { edgeFunctionOTPService } from '@/services/edgeFunctionOTPService';

export interface OTPVerificationProps {
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  initialPhoneNumber?: string;
  userId?: string;
  className?: string;
}

type VerificationStep = 'phone' | 'otp' | 'success';

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onSuccess,
  onError,
  initialPhoneNumber = '',
  userId,
  className = ''
}) => {
  const [step, setStep] = useState<VerificationStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
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
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const result = await edgeFunctionOTPService.sendOTP({
        phoneNumber: formattedPhone,
        userId: userId || 'registration-user-' + Date.now()
      });
      
      if (result.success && result.otpId && result.referenceCode) {
        setSessionId(result.otpId);
        setReferenceCode(result.referenceCode);
        setStep('otp');
        setSuccess(`OTP sent to your phone number (Ref: ${result.referenceCode})`);
        setCountdown(60); // 60 second cooldown
      } else {
        setError(result.message);
        onError?.(result.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length < 4) {
      setError('Please enter the complete OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await edgeFunctionOTPService.verifyOTP({
        otpId: sessionId,
        referenceCode: referenceCode,
        otpCode: otpCode.trim()
      });
      
      if (result.success) {
        setStep('success');
        setSuccess('Phone number verified successfully!');
        onSuccess?.(phoneNumber);
      } else {
        setError(result.message);
        onError?.(result.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setOtpCode('');
    setCountdown(60);
    await handleSendOTP();
  };

  const handleEditPhoneNumber = () => {
    setStep('phone');
    setOtpCode('');
    setSessionId('');
    setError('');
    setSuccess('');
  };

  const renderPhoneStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0812345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Thai phone number (with or without country code)
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSendOTP} 
          disabled={loading || !phoneNumber.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Send Verification Code
        </Button>
      </CardContent>
    </>
  );

  const renderOTPStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Enter Verification Code
        </CardTitle>
        <CardDescription>
          We sent a code to {phoneNumber}
          <Button
            variant="link"
            size="sm"
            onClick={handleEditPhoneNumber}
            className="p-0 h-auto ml-1"
          >
            (Edit)
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 4-6 digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            maxLength={6}
          />
        </div>

        {success && (
          <Alert>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleVerifyOTP} 
          disabled={loading || !otpCode.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Verify Code
        </Button>

        <Button
          variant="outline"
          onClick={handleResendOTP}
          disabled={countdown > 0}
          className="w-full"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </Button>
      </CardContent>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          Verification Complete
        </CardTitle>
        <CardDescription>
          Your phone number has been successfully verified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-green-600">
            Phone number {phoneNumber} is now verified and can be used for registration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </>
  );

  return (
    <Card className={className}>
      {step === 'phone' && renderPhoneStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'success' && renderSuccessStep()}
    </Card>
  );
};

export default OTPVerification;

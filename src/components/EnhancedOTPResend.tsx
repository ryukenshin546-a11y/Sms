/**
 * Enhanced OTP Resend Component
 * Phase 3.1: Advanced OTP functionality with resend limits, better UI
 * Updated: September 14, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Phone, 
  Shield, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Info,
  Timer
} from 'lucide-react';
import { simpleOTPService, SendOTPRequest, VerifyOTPRequest } from '@/services/simpleOTPService';

export interface EnhancedOTPProps {
  onSuccess?: (phoneNumber: string, sessionData: any) => void;
  onError?: (error: string) => void;
  initialPhoneNumber?: string;
  className?: string;
  maxResendAttempts?: number;
  otpExpiryMinutes?: number;
  enableProgressTracking?: boolean;
}

type VerificationStep = 'phone' | 'otp' | 'success' | 'expired';

interface OTPSession {
  id: string;
  phoneNumber: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  resendCount: number;
  maxResends: number;
}

export const EnhancedOTPResend: React.FC<EnhancedOTPProps> = ({
  onSuccess,
  onError,
  initialPhoneNumber = '',
  className = '',
  maxResendAttempts = 3,
  otpExpiryMinutes = 5,
  enableProgressTracking = true
}) => {
  // State Management
  const [step, setStep] = useState<VerificationStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState('');
  const [session, setSession] = useState<OTPSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Countdown & Progress
  const [resendCountdown, setResendCountdown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(0);
  const [resendProgress, setResendProgress] = useState(0);

  // Enhanced timer management
  useEffect(() => {
    const interval = setInterval(() => {
      // Resend countdown
      if (resendCountdown > 0) {
        setResendCountdown(prev => prev - 1);
        const progress = ((60 - resendCountdown) / 60) * 100;
        setResendProgress(progress);
      }

      // Expiry countdown
      if (session && expiryCountdown > 0) {
        setExpiryCountdown(prev => {
          if (prev <= 1) {
            setStep('expired');
            setError('OTP has expired. Please request a new code.');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown, expiryCountdown, session]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced phone number formatting
  const formatPhoneNumber = useCallback((phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 9 && !numbers.startsWith('66')) {
      return `66${numbers}`;
    }
    if (numbers.length === 10 && numbers.startsWith('0')) {
      return `66${numbers.slice(1)}`;
    }
    
    return numbers;
  }, []);

  // Validate phone number
  const isValidPhoneNumber = useCallback((phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length >= 11 && formatted.startsWith('66');
  }, [formatPhoneNumber]);

  // Enhanced OTP sending with progress tracking
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('กรุณาใส่หมายเลขโทรศัพท์');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('หมายเลขโทรศัพท์ไม่ถูกต้อง กรุณาใส่เบอร์ไทย');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const request: SendOTPRequest = {
        phoneNumber: formattedPhone
      };

      const result = await simpleOTPService.sendOTP(request);
      
      if (result.success && result.session) {
        const newSession: OTPSession = {
          id: result.session.id,
          phoneNumber: formattedPhone,
          expiresAt: new Date(result.session.expiresAt || Date.now() + otpExpiryMinutes * 60 * 1000),
          attempts: 0,
          maxAttempts: 3,
          resendCount: session?.resendCount || 0,
          maxResends: maxResendAttempts
        };

        setSession(newSession);
        setStep('otp');
        setSuccess(`รหัส OTP ส่งไปที่ ${formattedPhone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4')} แล้ว`);
        setResendCountdown(60);
        setExpiryCountdown(otpExpiryMinutes * 60);
        setResendProgress(0);
      } else {
        setError(result.message || 'ไม่สามารถส่ง OTP ได้');
        onError?.(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่ง OTP';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced OTP verification
  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length < 4) {
      setError('กรุณาใส่รหัส OTP ให้ครบ');
      return;
    }

    if (!session) {
      setError('ไม่พบ session กรุณาส่ง OTP ใหม่');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: VerifyOTPRequest = {
        sessionId: session.id,
        otpCode: otpCode.trim()
      };

      const result = await simpleOTPService.verifyOTP(request);
      
      if (result.success) {
        setStep('success');
        setSuccess('ยืนยันหมายเลขโทรศัพท์สำเร็จ!');
        onSuccess?.(phoneNumber, { session, result });
      } else {
        const newAttempts = session.attempts + 1;
        const updatedSession = { ...session, attempts: newAttempts };
        setSession(updatedSession);

        if (newAttempts >= session.maxAttempts) {
          setError(`รหัส OTP ไม่ถูกต้อง ใส่ผิด ${newAttempts} ครั้งแล้ว กรุณาขอรหัสใหม่`);
          setStep('expired');
        } else {
          setError(`รหัส OTP ไม่ถูกต้อง (${newAttempts}/${session.maxAttempts})`);
        }
        onError?.(result.message || 'Invalid OTP');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยืนยัน OTP';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced resend with limits
  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    if (!session) {
      setError('ไม่พบ session กรุณาเริ่มใหม่');
      return;
    }

    if (session.resendCount >= session.maxResends) {
      setError(`คุณส่ง OTP ซ้ำเกิน ${session.maxResends} ครั้งแล้ว กรุณารอสักครู่`);
      return;
    }

    const updatedSession = {
      ...session,
      resendCount: session.resendCount + 1,
      attempts: 0 // Reset attempts on resend
    };
    setSession(updatedSession);
    setOtpCode('');
    
    await handleSendOTP();
  };

  // Reset to initial state
  const handleStartOver = () => {
    setStep('phone');
    setOtpCode('');
    setSession(null);
    setError('');
    setSuccess('');
    setResendCountdown(0);
    setExpiryCountdown(0);
    setResendProgress(0);
  };

  // Render phone input step
  const renderPhoneStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          ยืนยันหมายเลขโทรศัพท์
        </CardTitle>
        <CardDescription>
          ใส่หมายเลขโทรศัพท์เพื่อรับรหัสยืนยัน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="08-1234-5678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            className={!isValidPhoneNumber(phoneNumber) && phoneNumber ? 'border-destructive' : ''}
          />
          <p className="text-sm text-muted-foreground">
            ใส่หมายเลขโทรศัพท์มือถือไทย (มีหรือไม่มีรหัสประเทศก็ได้)
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSendOTP} 
          disabled={loading || !isValidPhoneNumber(phoneNumber)}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          ส่งรหัสยืนยัน
        </Button>
      </CardContent>
    </>
  );

  // Render OTP input step with enhanced UI
  const renderOTPStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          ใส่รหัสยืนยัน
        </CardTitle>
        <CardDescription className="space-y-2">
          <div>
            เราได้ส่งรหัสไปที่ {phoneNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4')}
            <Button
              variant="link"
              size="sm"
              onClick={handleStartOver}
              className="p-0 h-auto ml-2 text-xs"
            >
              (แก้ไข)
            </Button>
          </div>
          
          {session && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>หมดอายุใน: {formatTime(expiryCountdown)}</span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>ส่งซ้ำ: {session.resendCount}/{session.maxResends}</span>
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">รหัสยืนยัน</Label>
          <Input
            id="otp"
            type="text"
            placeholder="ใส่รหัส 4-6 หลัก"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          {session && session.attempts > 0 && (
            <p className="text-sm text-destructive">
              ใส่ผิด {session.attempts}/{session.maxAttempts} ครั้ง
            </p>
          )}
        </div>

        {success && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleVerifyOTP} 
          disabled={loading || !otpCode.trim() || step === 'expired'}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          ยืนยันรหัส
        </Button>

        {/* Enhanced Resend Button with Progress */}
        <div className="space-y-2">
          {enableProgressTracking && resendCountdown > 0 && (
            <div className="space-y-1">
              <Progress value={resendProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                ส่งใหม่ได้ใน {resendCountdown} วินาที
              </p>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={
              resendCountdown > 0 || 
              (session && session.resendCount >= session.maxResends) ||
              loading
            }
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {resendCountdown > 0 
              ? `ส่งใหม่ได้ใน ${resendCountdown} วิ` 
              : session && session.resendCount >= session.maxResends
                ? `ส่งซ้ำครบ ${session.maxResends} ครั้งแล้ว`
                : 'ส่งรหัสใหม่'
            }
          </Button>
          
          {session && session.resendCount >= session.maxResends && (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                คุณได้ส่งรหัสซ้ำครบจำนวนแล้ว กรุณารอสักครู่แล้วลองใหม่
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </>
  );

  // Render success step
  const renderSuccessStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          ยืนยันสำเร็จ
        </CardTitle>
        <CardDescription>
          หมายเลขโทรศัพท์ของคุณได้รับการยืนยันเรียบร้อยแล้ว
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-green-600">
            <div className="space-y-1">
              <p>หมายเลข {phoneNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4')} ยืนยันแล้ว</p>
              <p className="text-sm">สามารถใช้งานระบบได้เลย</p>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">
            <CheckCircle className="w-3 h-3 mr-1" />
            ยืนยันแล้ว
          </Badge>
          <Badge variant="outline">
            <Shield className="w-3 h-3 mr-1" />
            ปลอดภัย
          </Badge>
        </div>
      </CardContent>
    </>
  );

  // Render expired step
  const renderExpiredStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Clock className="w-5 h-5" />
          รหัสหมดอายุ
        </CardTitle>
        <CardDescription>
          รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error || 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่'}
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleStartOver} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          เริ่มใหม่
        </Button>
      </CardContent>
    </>
  );

  return (
    <Card className={className}>
      {step === 'phone' && renderPhoneStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'success' && renderSuccessStep()}
      {step === 'expired' && renderExpiredStep()}
    </Card>
  );
};

export default EnhancedOTPResend;
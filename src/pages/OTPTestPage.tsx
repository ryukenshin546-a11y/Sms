/**
 * OTP Test Page - หน้าทดสอบระบบ OTP
 * Updated: September 14, 2025
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Phone, MessageSquare, CheckCircle, XCircle, AlertTriangle, RefreshCw, Timer, Clock } from 'lucide-react';
import { edgeFunctionOTPService } from '@/services/edgeFunctionOTPService';
import { ErrorMessageService, ErrorContext } from '@/lib/errorMessages';
import { EnhancedErrorAlert, SuccessAlert, LoadingAlert } from '@/components/ui/enhanced-alert';

const OTPTestPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'verified' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  
  // Resend functionality states
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [maxResends, setMaxResends] = useState(3);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [enhancedError, setEnhancedError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<any>(null);

  // Timer effect for resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (sessionStarted && resendCount < maxResends) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, sessionStarted, resendCount, maxResends]);

  // Clear enhanced messages after timeout
  useEffect(() => {
    if (enhancedError) {
      const timer = setTimeout(() => setEnhancedError(null), 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [enhancedError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const formatPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
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
      const context: ErrorContext = { action: 'send', phoneNumber };
      const error = ErrorMessageService.getEnhancedError('INVALID_PHONE_FORMAT', context);
      setEnhancedError(error);
      return;
    }

    setLoading(true);
    setMessage('');
    setEnhancedError(null);
    setSuccessMessage(null);

    try {
      addResult(`ส่ง OTP ไปที่: ${phoneNumber}`);
      
      const formattedPhone = formatPhoneNumber(phoneNumber);
      addResult(`เบอร์ที่จัดรูปแบบแล้ว: ${formattedPhone}`);

      const result = await edgeFunctionOTPService.sendOTP({
        phoneNumber: formattedPhone,
        userId: 'test-user-' + Date.now()
      });

      if (result.success && result.otpId && result.referenceCode) {
        setOtpId(result.otpId);
        setReferenceCode(result.referenceCode);
        setStatus('sent');
        setSessionStarted(true);
        setResendCountdown(30);
        setCanResend(false);

        // Enhanced success message
        const success = ErrorMessageService.getSuccessMessage('send', { 
          action: 'send', 
          phoneNumber: formattedPhone 
        });
        setSuccessMessage(success);
        
        addResult(`✅ ส่ง OTP สำเร็จ - Reference Code: ${result.referenceCode}`);
        addResult(`🔍 กรุณาจดจำรหัสอ้างอิง: ${result.referenceCode}`);
        if (result.session) {
          addResult(`⏰ หมดอายุ: ${new Date(result.session.expiresAt).toLocaleString()}`);
        }
      } else {
        setStatus('failed');
        
        // Enhanced error handling
        const context: ErrorContext = { 
          action: 'send', 
          phoneNumber: formattedPhone 
        };
        const errorCode = ErrorMessageService.mapApiErrorToCode(result);
        const error = ErrorMessageService.getEnhancedError(errorCode, context, result.message);
        setEnhancedError(error);
        
        addResult(`❌ ส่ง OTP ไม่สำเร็จ: ${result.message}`);
      }
    } catch (error: any) {
      setStatus('failed');
      
      // Enhanced error handling
      const context: ErrorContext = { 
        action: 'send', 
        phoneNumber: formatPhoneNumber(phoneNumber) 
      };
      const errorCode = ErrorMessageService.mapApiErrorToCode(error);
      const enhancedError = ErrorMessageService.getEnhancedError(errorCode, context, error.message);
      setEnhancedError(enhancedError);
      
      addResult(`❌ Error: ${error.message}`);
      console.error('Send OTP Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setMessage('กรุณาใส่รหัส OTP');
      return;
    }

    if (!otpId || !referenceCode) {
      setMessage('ไม่พบข้อมูล OTP กรุณาส่ง OTP ก่อน');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      addResult(`ตรวจสอบรหัส OTP: ${otpCode}`);

      const result = await edgeFunctionOTPService.verifyOTP({
        otpId,
        referenceCode,
        otpCode: otpCode.trim()
      });

      if (result.success) {
        setStatus('verified');
        setMessage('🎉 ยืนยันรหัส OTP สำเร็จ! เบอร์โทรศัพท์ได้รับการยืนยันแล้ว');
        addResult('🎉 ยืนยัน OTP สำเร็จ - เบอร์โทรยืนยันแล้ว');
      } else {
        setStatus('failed');
        setMessage(`❌ รหัส OTP ไม่ถูกต้อง: ${result.message}`);
        addResult(`❌ ยืนยัน OTP ไม่สำเร็จ: ${result.message}`);
      }
    } catch (error) {
      setStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setMessage(`💥 เกิดข้อผิดพลาด: ${errorMessage}`);
      addResult(`💥 ข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber || !canResend || resendCount >= maxResends) return;
    
    setIsResending(true);
    setMessage('');
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      addResult(`🔄 ส่ง OTP ซ้ำ ครั้งที่ ${resendCount + 1}/${maxResends}`);
      
      // Use sendOTP for resend since we don't have a dedicated resend endpoint yet
      const result = await edgeFunctionOTPService.sendOTP({
        phoneNumber: formattedPhone,
        userId: 'test-user-resend-' + Date.now()
      });
      
      if (result.success && result.otpId && result.referenceCode) {
        // Update states for successful resend
        setOtpId(result.otpId);
        setReferenceCode(result.referenceCode);
        
        setResendCount(prev => prev + 1);
        setResendCountdown(30); // Reset countdown
        setCanResend(false);
        setMessage(`✅ ส่ง OTP ซ้ำสำเร็จ! (${resendCount + 1}/${maxResends})`);
        addResult(`✅ ส่ง OTP ซ้ำสำเร็จ - Reference Code: ${result.referenceCode}`);
        
        // Clear previous OTP input
        setOtpCode('');
      } else {
        setMessage(`❌ ส่ง OTP ซ้ำไม่สำเร็จ: ${result.message || 'ไม่สามารถส่งได้'}`);
        addResult(`❌ ส่ง OTP ซ้ำไม่สำเร็จ: ${result.message || 'ไม่สามารถส่งได้'}`);
      }
    } catch (error: any) {
      setMessage(`💥 เกิดข้อผิดพลาดในการส่งซ้ำ: ${error.message}`);
      addResult(`💥 ข้อผิดพลาดในการส่งซ้ำ: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckPhone = async () => {
    if (!phoneNumber.trim()) {
      setMessage('กรุณาใส่หมายเลขโทรศัพท์');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const isVerified = await edgeFunctionOTPService.isPhoneVerified(formattedPhone);
      
      if (isVerified) {
        setMessage('✅ เบอร์โทรศัพท์นี้ได้รับการยืนยันแล้ว');
        addResult(`✅ เบอร์ ${formattedPhone} ยืนยันแล้ว`);
      } else {
        setMessage('❌ เบอร์โทรศัพท์นี้ยังไม่ได้รับการยืนยัน');
        addResult(`❌ เบอร์ ${formattedPhone} ยังไม่ยืนยัน`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      setMessage(`💥 เกิดข้อผิดพลาด: ${errorMessage}`);
      addResult(`💥 ข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setPhoneNumber('');
    setOtpCode('');
    setOtpId('');
    setReferenceCode('');
    setStatus('idle');
    setMessage('');
    setTestResults([]);
    setSessionStarted(false);
    setCanResend(false);
    setResendCountdown(0);
    setResendCount(0);
    addResult('🔄 รีเซ็ตการทดสอบแล้ว');
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">OTP ส่งแล้ว</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">ยืนยันแล้ว ✓</Badge>;
      case 'failed':
        return <Badge variant="destructive">ไม่สำเร็จ</Badge>;
      default:
        return <Badge variant="outline">รอการทดสอบ</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ทดสอบระบบ SMS OTP
          </h1>
          <p className="text-gray-600">
            ทดสอบการส่งและยืนยันรหัส OTP สำหรับการสมัครสมาชิก
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  ฟอร์มทดสอบ
                </span>
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                กรอกหมายเลขโทรศัพท์และทดสอบการส่ง-ยืนยัน OTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0812345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  รองรับรูปแบบ: 0812345678, 66812345678, 812345678
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendOTP}
                  disabled={loading || !phoneNumber.trim()}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  ส่ง OTP
                </Button>
                <Button
                  onClick={handleCheckPhone}
                  disabled={loading || !phoneNumber.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  ตรวจสอบสถานะ
                </Button>
              </div>

              {/* OTP Code Input */}
              {status === 'sent' && (
                <div className="space-y-2">
                  {/* Reference Code Display */}
                  {referenceCode && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>รหัสอ้างอิง: {referenceCode}</strong>
                        <br />
                        กรุณาจดจำรหัสนี้สำหรับการอ้างอิงในกรณีมีปัญหา
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Label htmlFor="otp">รหัส OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="ใส่รหัส 4-6 หลักจากข้อความ"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleVerifyOTP}
                    disabled={loading || !otpCode.trim()}
                    className="w-full"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    ยืนยันรหัส OTP
                  </Button>
                  
                  {/* Resend Section */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ส่งรหัสซ้ำ</span>
                      <Badge variant="outline">
                        {resendCount}/{maxResends}
                      </Badge>
                    </div>
                    
                    {/* Countdown Progress */}
                    {resendCountdown > 0 && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">รอ {resendCountdown} วินาที</span>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <Progress 
                          value={((30 - resendCountdown) / 30) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {/* Resend Button */}
                    <Button 
                      onClick={handleResendOTP}
                      disabled={!canResend || isResending || resendCount >= maxResends}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : resendCount >= maxResends ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          ครบจำนวนการส่งแล้ว
                        </>
                      ) : !canResend ? (
                        <>
                          <Timer className="w-4 h-4 mr-2" />
                          รอ {resendCountdown} วินาที
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          ส่งรหัสซ้ำ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced Success Message */}
              {successMessage && (
                <SuccessAlert
                  title={successMessage.title}
                  message={successMessage.message}
                  suggestion={successMessage.suggestion}
                  icon={successMessage.icon}
                  onDismiss={() => setSuccessMessage(null)}
                  className="mb-4"
                />
              )}

              {/* Enhanced Error Message */}
              {enhancedError && (
                <EnhancedErrorAlert
                  error={enhancedError}
                  onAction={(actionType) => {
                    console.log('Action clicked:', actionType);
                    // Handle action based on type
                    if (actionType === 'retry') {
                      // Retry the last action
                      if (enhancedError.context?.action === 'send') {
                        handleSendOTP();
                      }
                    } else if (actionType === 'reset') {
                      resetTest();
                    }
                    setEnhancedError(null);
                  }}
                  className="mb-4"
                />
              )}

              {/* Status Message (Legacy - keeping for compatibility) */}
              {message && !enhancedError && !successMessage && (
                <Alert className={
                  status === 'verified' ? 'border-green-200 bg-green-50' :
                  status === 'failed' ? 'border-red-200 bg-red-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  {status === 'verified' ? <CheckCircle className="w-4 h-4" /> :
                   status === 'failed' ? <XCircle className="w-4 h-4" /> :
                   <AlertTriangle className="w-4 h-4" />}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading && (
                <LoadingAlert
                  message={isResending ? "กำลังส่งรหัสซ้ำ..." : "กำลังดำเนินการ..."}
                  details="กรุณารอสักครู่"
                  className="mb-4"
                />
              )}

              {/* Reset Button */}
              <Button 
                onClick={resetTest}
                variant="outline"
                className="w-full"
              >
                เริ่มทดสอบใหม่
              </Button>
            </CardContent>
          </Card>

          {/* Test Results Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Log การทดสอบ
              </CardTitle>
              <CardDescription>
                แสดงผลลัพธ์การทดสอบแบบ Real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto text-sm font-mono">
                {testResults.length === 0 ? (
                  <p className="text-gray-500">รอการทดสอบ...</p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>วิธีทดสอบ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">ขั้นตอนการทดสอบ:</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>กรอกหมายเลขโทรศัพท์ของคุณ</li>
                  <li>กดปุ่ม "ส่ง OTP"</li>
                  <li>รอรับข้อความ SMS (ประมาณ 1-2 นาที)</li>
                  <li>ใส่รหัส OTP ที่ได้รับ</li>
                  <li>กดปุ่ม "ยืนยันรหัส OTP"</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">หมายเหตุ:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>ใช้เบอร์โทรศัพท์จริงเท่านั้น</li>
                  <li>รหัส OTP หมดอายุใน 5 นาที</li>
                  <li>จำกัดการลองยืนยัน 3 ครั้ง</li>
                  <li>ห้ามส่ง OTP ซ้ำใน 60 วินาที</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPTestPage;
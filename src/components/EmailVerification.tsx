import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, XCircle, AlertTriangle, Send } from 'lucide-react';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNotification, createNotification } from '@/hooks/useNotification';
import NotificationList from '@/components/NotificationList';

interface EmailVerificationProps {
  email: string;
  isVerified: boolean;
  onVerificationStatusChange?: (verified: boolean) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  isVerified,
  onVerificationStatusChange
}) => {
  const { sendVerificationEmail, isLoading } = useEmailVerification();
  const { notifications, showNotification, hideNotification } = useNotification();
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);

  const handleSendVerification = async () => {
    const result = await sendVerificationEmail(email);
    
    if (result.success) {
      setLastSentTime(new Date());
      showNotification(createNotification.success(
        'ส่งอีเมลยืนยันสำเร็จ! 📧',
        `เราได้ส่งลิงก์ยืนยันไปยัง ${email} แล้ว กรุณาตรวจสอบอีเมลของคุณ`
      ));
    } else {
      showNotification(createNotification.error(
        'ส่งอีเมลไม่สำเร็จ ❌',
        result.error?.message || 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง'
      ));
    }
  };

  const canResend = () => {
    if (!lastSentTime) return true;
    const timeDiff = new Date().getTime() - lastSentTime.getTime();
    // ⚠️ REMOVED CLIENT-SIDE COOLDOWN - Let Supabase handle rate limiting
    // return timeDiff > 60000; // 1 minute cooldown
    
    // Allow immediate resend - Supabase will handle rate limiting with proper error messages
    return true;
  };

  const getResendCountdown = () => {
    // ⚠️ REMOVED COUNTDOWN - No more artificial client-side delays
    return 0;
  };

  if (isVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center p-4">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">อีเมลได้รับการยืนยันแล้ว</p>
            <p className="text-xs text-green-600 mt-1">{email}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-2 text-orange-600" />
          ยืนยันอีเมล
        </CardTitle>
        <CardDescription className="text-xs">
          กรุณายืนยันอีเมลเพื่อเปิดใช้งานฟีเจอร์ SMS Auto-Bot
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Mail className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <XCircle className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-600">ยังไม่ยืนยัน</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSendVerification}
          disabled={isLoading} // Only disable when loading, no more cooldown
          size="sm"
          className="w-full"
          variant="default" // Always use default variant
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              กำลังส่งอีเมล...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {lastSentTime ? 'ส่งอีเมลอีกครั้ง' : 'ส่งอีเมลยืนยัน'}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 หากไม่พบอีเมล กรุณาตรวจสอบ:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>โฟลเดอร์ Spam หรือ Junk</li>
            <li>โฟลเดอร์ Promotions (Gmail)</li>
            <li>ตรวจสอบการสะกดอีเมลให้ถูกต้อง</li>
          </ul>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700 font-medium">⚠️ เกี่ยวกับ Rate Limiting:</p>
            <p className="text-blue-600">Supabase จำกัดการส่งอีเมลเป็น 1 ครั้งต่อ 2 นาที เพื่อป้องกัน spam หากส่งบ่อยเกินไป ระบบจะไม่ส่งอีเมลโดยไม่แจ้งเตือน</p>
          </div>
        </div>
      </CardContent>
      
      {/* Notifications */}
      <NotificationList 
        notifications={notifications} 
        onHide={hideNotification} 
      />
    </Card>
  );
};

export default EmailVerification;
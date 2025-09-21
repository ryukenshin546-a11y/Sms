import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Mail, Phone, Bot } from 'lucide-react';

interface UserVerificationStatus {
  phone_verified: boolean;
  email_verified: boolean;
  phone_verified_at?: string;
  email_verified_at?: string;
  can_use_autobot: boolean;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface AuthGuardProps {
  children: React.ReactNode;
  requireAutoBot?: boolean; // เมื่อ true จะต้องยืนยันทั้ง phone และ email
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAutoBot = false, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<UserVerificationStatus | null>(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user?.id && !loading) {
      fetchVerificationStatus();
    }
  }, [user?.id, loading]); // Use user.id instead of entire user object

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    setLoadingVerification(true);
    try {
      // Use user_profiles table directly (bypass TypeScript check)
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // For now, assume user doesn't have verification status
        setVerificationStatus({
          phone_verified: false,
          email_verified: false, // Default to false on error
          can_use_autobot: false,
          username: user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || ''
        });
        return;
      }

      // If no profile data found, user needs to complete registration
      if (!profileData) {
        console.log('⚠️ No profile data found for user, using basic info from auth');
        setVerificationStatus({
          phone_verified: false,
          email_verified: false, // Default to false since user hasn't completed registration
          can_use_autobot: false,
          username: user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || ''
        });
        return;
      }

      // Profile data found - use it
      console.log('✅ Profile data found:', profileData);
      console.log('🔍 Email verification status from DB:', profileData.email_verified);
      console.log('🔍 Phone verification status from DB:', profileData.phone_verified);
      const phoneVerified = profileData.phone_verified || false;
      const emailVerified = profileData.email_verified; // Use ONLY database value, no fallback to Supabase auth
      const canUseAutobot = phoneVerified && emailVerified;
      
      console.log('📊 Final verification status:', { phoneVerified, emailVerified, canUseAutobot });
      
      setVerificationStatus({
        phone_verified: phoneVerified,
        email_verified: emailVerified,
        can_use_autobot: canUseAutobot,
        username: profileData.username || user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
        first_name: profileData.first_name || user.user_metadata?.first_name || '',
        last_name: profileData.last_name || user.user_metadata?.last_name || '',
        phone: profileData.phone || user.user_metadata?.phone || '',
        email: user.email || ''
      });

    } catch (error) {
      console.error('Error:', error);
      // Fallback to basic verification status
      setVerificationStatus({
        phone_verified: false,
        email_verified: false, // Default to false in catch block
        can_use_autobot: false,
        username: user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || ''
      });
    } finally {
      setLoadingVerification(false);
    }
  };

  const resendEmailVerification = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        console.error('Error resending email:', error);
        alert('เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน');
      } else {
        console.log('📧 Email verification sent successfully');
        alert('ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน');
    }
  };

  const updateEmailVerificationStatus = async (verified: boolean = true) => {
    if (!user?.id) return;
    
    try {
      const { error } = await (supabase as any)
        .from('user_profiles')
        .update({ email_verified: verified })
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log(`✅ Email verification status updated to: ${verified}`);
      
      // Refresh verification status
      await fetchVerificationStatus();
    } catch (error) {
      console.error('❌ Error updating email verification status:', error);
    }
  };

  // Loading state
  if (loading || loadingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If verification status is not loaded yet, show loading
  if (!verificationStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">กำลังตรวจสอบสถานะ...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if Auto-Bot access is required but user doesn't have permission
  if (requireAutoBot && !verificationStatus.can_use_autobot) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Bot className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">ต้องยืนยันตัวตนก่อนใช้งาน Auto-Bot</CardTitle>
            <CardDescription>
              คุณต้องยืนยันเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน Auto-Bot ได้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verification Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Verification */}
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <Phone className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">เบอร์โทรศัพท์</span>
                    {verificationStatus.phone_verified ? (
                      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        <span>ยืนยันแล้ว</span>
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <XCircle className="h-3 w-3" />
                        <span>ยังไม่ยืนยัน</span>
                      </Badge>
                    )}
                  </div>
                  {verificationStatus.phone && (
                    <p className="text-sm text-gray-600">{verificationStatus.phone}</p>
                  )}
                </div>
              </div>

              {/* Email Verification */}
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <Mail className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">อีเมล</span>
                    {verificationStatus.email_verified ? (
                      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        <span>ยืนยันแล้ว</span>
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <XCircle className="h-3 w-3" />
                        <span>ยังไม่ยืนยัน</span>
                      </Badge>
                    )}
                  </div>
                  {verificationStatus.email && (
                    <p className="text-sm text-gray-600">{verificationStatus.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>วิธีการยืนยันตัวตน:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  {!verificationStatus.phone_verified && (
                    <li>ยืนยันเบอร์โทรศัพท์ผ่าน OTP ในหน้าโปรไฟล์</li>
                  )}
                  {!verificationStatus.email_verified && (
                    <li>ยืนยันอีเมลโดยคลิกลิงก์ที่ส่งไปยังอีเมลของคุณ</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.location.href = '/profile'} 
                className="flex-1"
                variant="default"
              >
                ไปที่โปรไฟล์เพื่อยืนยัน
              </Button>
              
              {!verificationStatus.email_verified && (
                <Button 
                  onClick={resendEmailVerification} 
                  variant="outline"
                  className="flex-1"
                >
                  ส่งอีเมลยืนยันใหม่
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">ความคืบหน้าการยืนยัน</p>
              <div className="flex justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${verificationStatus.phone_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${verificationStatus.email_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${verificationStatus.can_use_autobot ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {verificationStatus.phone_verified && verificationStatus.email_verified 
                  ? 'ยืนยันครบแล้ว! รีเฟรชหน้าเว็บ' 
                  : `เหลืออีก ${2 - (Number(verificationStatus.phone_verified) + Number(verificationStatus.email_verified))} ขั้นตอน`
                }
              </p>
            </div>

            {/* Auto-refresh hint */}
            {verificationStatus.phone_verified && verificationStatus.email_verified && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-center">
                  <strong>ยืนยันครบแล้ว!</strong> หากยังไม่สามารถเข้าใช้งานได้ กรุณารีเฟรชหน้าเว็บ
                  <br />
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="link" 
                    className="mt-2"
                  >
                    รีเฟรชหน้าเว็บ
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
};

export default AuthGuard;

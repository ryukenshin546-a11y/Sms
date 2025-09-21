import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Mail, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmailWithToken, sendVerificationEmail, isLoading } = useEmailVerification();
  const { user } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  // Handle direct Supabase verification (token from Supabase auth endpoint)
  const handleDirectSupabaseVerification = async (token: string, type: string) => {
    try {
      console.log('🚀 Starting direct Supabase verification with token');
      
      // Use the direct token with verifyOtp
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      });

      if (error) {
        console.error('❌ Direct Supabase verification failed:', error);
        
        // Handle specific error types
        if (error.message.includes('expired')) {
          setVerificationStatus('expired');
          setErrorMessage('ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่');
        } else if (error.message.includes('invalid')) {
          setVerificationStatus('invalid');
          setErrorMessage('ลิงก์ยืนยันไม่ถูกต้อง กรุณาตรวจสอบลิงก์จากอีเมลของคุณ');
        } else {
          setVerificationStatus('error');
          setErrorMessage(`การยืนยันล้มเหลว: ${error.message}`);
        }
        return;
      }

      if (!data.user || !data.session) {
        console.error('❌ No user or session from direct verification');
        setVerificationStatus('error');
        setErrorMessage('ไม่สามารถสร้าง session ได้');
        return;
      }

      console.log('✅ Direct verification successful, updating profiles table...');
      
      // Update profiles table to reflect email verification
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', data.user.id);

        if (updateError) {
          console.error('⚠️ Warning: Failed to update profiles table:', updateError);
        } else {
          console.log('✅ Profiles table updated successfully');
        }
      } catch (profileError) {
        console.error('⚠️ Warning: Error updating profiles table:', profileError);
      }

      setVerificationStatus('success');
      
      // Clear URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => navigate('/profile', { replace: true }), 2000);

    } catch (error: any) {
      console.error('❌ Direct verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  // Handle server-side verification (token_hash from query params)
  const handleServerSideVerification = async (tokenHash: string, type: string) => {
    try {
      console.log('🚀 Starting server-side verification with token_hash');
      
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_hash: tokenHash, type })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('❌ Server verification failed:', result.error);
        setVerificationStatus('error');
        setErrorMessage(result.error || 'การยืนยันล้มเหลว');
        return;
      }

      // Set session on client-side
      if (result.session) {
        const { data, error } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });

        if (error) {
          console.error('❌ Session setup failed:', error);
          setVerificationStatus('error');
          setErrorMessage('ไม่สามารถตั้งค่า session ได้');
          return;
        }

        // Update profiles table
        if (data.user) {
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', data.user.id);

            if (updateError) {
              console.error('⚠️ Warning: Failed to update profiles table:', updateError);
            } else {
              console.log('✅ Profiles table updated successfully');
            }
          } catch (profileError) {
            console.error('⚠️ Warning: Error updating profiles table:', profileError);
          }
        }
      }

      console.log('✅ Server-side verification successful');
      setVerificationStatus('success');
      
      // Clear URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => navigate('/profile', { replace: true }), 2000);

    } catch (error: any) {
      console.error('❌ Server verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  // Handle client-side verification (access_token from fragments)
  const handleClientSideVerification = async (hash: string) => {
    try {
      const hashParams = Object.fromEntries(new URLSearchParams(hash.substring(1)));
      const { access_token, refresh_token } = hashParams;
      
      if (!access_token) {
        setVerificationStatus('invalid');
        setErrorMessage('ไม่พบ access token ใน URL');
        return;
      }

      console.log('🚀 Setting session from fragments');
      
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (error) {
        console.error('❌ Client session setup failed:', error);
        setVerificationStatus('error');
        setErrorMessage('ตั้งค่า session ไม่สำเร็จ');
        return;
      }

      console.log('✅ Session set successfully, updating profiles table...');
      
      // Update profiles table to reflect email verification
      if (data.user) {
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', data.user.id);

          if (updateError) {
            console.error('⚠️ Warning: Failed to update profiles table:', updateError);
            // Don't fail the verification for this, just log it
          } else {
            console.log('✅ Profiles table updated successfully');
          }
        } catch (profileError) {
          console.error('⚠️ Warning: Error updating profiles table:', profileError);
          // Don't fail the verification for this
        }
      }

      console.log('✅ Client-side verification successful');
      setVerificationStatus('success');
      
      // Clear URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => navigate('/profile', { replace: true }), 2000);

    } catch (error: any) {
      console.error('❌ Client verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  // Handle verification errors
  const handleVerificationError = (error: string, errorDescription: string | null) => {
    setVerificationStatus('error');
    
    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      setVerificationStatus('expired');
      setErrorMessage('ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่');
    } else if (error === 'otp_expired' || error === 'expired_token') {
      setVerificationStatus('expired');
      setErrorMessage('ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่');
    } else if (error === 'access_denied') {
      setVerificationStatus('invalid');
      setErrorMessage('ลิงก์ยืนยันไม่ถูกต้องหรือถูกปฏิเสธ กรุณาขอลิงก์ใหม่');
    } else {
      setErrorMessage(errorDescription || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const hash = window.location.hash;
      
      console.log('🔍 Raw URL data:', {
        fullURL: window.location.href,
        hash: hash,
        search: url.search,
        hashContent: hash.substring(1)
      });

      // 1. Check for direct Supabase verification URL patterns
      // Handle URLs like: https://xxx.supabase.co/auth/v1/verify?token=xxx&type=magiclink&redirect_to=xxx
      const token = params.get('token');
      const type = params.get('type') || 'magiclink';
      
      if (token) {
        console.log('🔍 Direct Supabase token found in query params');
        await handleDirectSupabaseVerification(token, type);
        return;
      }

      // 2. Check for token_hash in query parameters (server-side flow)
      const token_hash = params.get('token_hash');
      
      if (token_hash) {
        console.log('🔍 Server-side flow: token_hash found in query params');
        await handleServerSideVerification(token_hash, type);
        return;
      }

      // 3. Check for access_token in URL fragments (client-side flow)
      if (hash && hash.includes('access_token')) {
        console.log('🔍 Client-side flow: access_token found in fragments');
        await handleClientSideVerification(hash);
        return;
      }

      // 4. Check for error parameters (both fragments and query)
      let error, errorDescription;
      
      // Check fragments first
      const hashContent = hash.substring(1);
      if (hashContent) {
        const fragmentParams = new URLSearchParams(hashContent);
        error = fragmentParams.get('error');
        errorDescription = fragmentParams.get('error_description');
      }
      
      // Fallback to query parameters
      if (!error) {
        error = params.get('error');
        errorDescription = params.get('error_description');
      }
      
      if (error) {
        console.error('❌ Error found in URL:', error, errorDescription);
        handleVerificationError(error, errorDescription);
        return;
      }

      // 5. No parameters found
      console.log('🔍 No verification parameters found - user accessed directly');
      setVerificationStatus('invalid');
      setErrorMessage('กรุณาคลิกลิงก์ยืนยันจากอีเมลของคุณ หรือส่งลิงก์ยืนยันใหม่');
    };

    verifyEmail();
  }, [navigate]);

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    const result = await sendVerificationEmail(userEmail);
    if (result.success) {
      // Show success message or redirect
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 2000);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-green-600" />;
      case 'expired':
        return <RefreshCw className="w-8 h-8 text-orange-600" />;
      default:
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'กำลังยืนยันอีเมล...';
      case 'success':
        return 'ยืนยันอีเมลสำเร็จ!';
      case 'expired':
        return 'ลิงก์หมดอายุ';
      case 'invalid':
        return 'ลิงก์ไม่ถูกต้อง';
      default:
        return 'การยืนยันล้มเหลว';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'กำลังดำเนินการยืนยันอีเมลของคุณ กรุณารอสักครู่...';
      case 'success':
        return 'ตอนนี้คุณสามารถใช้งาน SMS Auto-Bot ได้แล้ว กำลังพาไปหน้าโปรไฟล์...';
      case 'expired':
        return 'ลิงก์ยืนยันอีเมลของคุณหมดอายุแล้ว กรุณาขอลิงก์ใหม่';
      case 'invalid':
        return 'ลิงก์ยืนยันอีเมลไม่ถูกต้อง กรุณาคลิกลิงก์จากอีเมลของคุณ';
      default:
        return errorMessage;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">SMS UP Plus</h1>
          <p className="text-sm text-gray-600">ระบบยืนยันอีเมล</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-lg">{getStatusTitle()}</CardTitle>
            <CardDescription className="text-sm">
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {verificationStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription className="text-green-800">
                  <strong>ยืนยันเรียบร้อย!</strong> SMS Auto-Bot พร้อมใช้งาน
                </AlertDescription>
              </Alert>
            )}

            {(verificationStatus === 'expired' || verificationStatus === 'error') && userEmail && (
              <div className="space-y-3">
                <Alert className="border-orange-200 bg-orange-50">
                  <Mail className="w-4 h-4" />
                  <AlertDescription className="text-orange-800">
                    <strong>ต้องการส่งอีเมลใหม่?</strong><br />
                    เราจะส่งลิงก์ยืนยันใหม่ไปยัง {userEmail}
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full"
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังส่งอีเมล...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      ส่งอีเมลยืนยันใหม่
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate('/profile', { replace: true })}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปหน้าโปรไฟล์
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            หากมีปัญหา กรุณาติดต่อทีมสนับสนุน
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
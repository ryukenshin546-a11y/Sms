import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2, Mail } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Parse hash fragment for error handling
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log('🔍 Email confirmation - checking URL:', { 
          error, 
          errorDescription,
          hash: window.location.hash
        });

        // Handle error from Supabase
        if (error) {
          const decodedError = decodeURIComponent(errorDescription || error);
          console.error('❌ Supabase error:', decodedError);
          throw new Error(`การยืนยันล้มเหลว: ${decodedError}`);
        }

        // Check if URL contains auth tokens (magic link)
        if (window.location.hash.includes('access_token')) {
          console.log('📧 Magic link detected, processing...');
          
          // Let Supabase process the auth hash
          // The hash will be automatically processed by Supabase client
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for active session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError);
            throw new Error(`เกิดข้อผิดพลาดในการยืนยัน: ${sessionError.message}`);
          }
          
          if (session?.user) {
            console.log('✅ Email confirmed successfully!');
            setUserEmail(session.user.email || '');
            setMessage('ยินดีต้อนรับ! อีเมลได้รับการยืนยันเรียบร้อยแล้ว');
            setStatus('success');

            // Redirect to profile since user is now authenticated
            setTimeout(() => {
              navigate('/profile', { replace: true });
            }, 2000);
            return;
          } else {
            console.warn('⚠️ No session found after processing auth hash');
          }
        }

        // If no magic link tokens, check for traditional query params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        
        if (token && type) {
          console.log('🔐 Traditional token verification...');
          
          const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any
          });

          if (verifyError) {
            console.error('❌ Token verification failed:', verifyError);
            throw new Error(verifyError.message);
          }

          if (authData.user) {
            console.log('✅ Token verified successfully!');
            setUserEmail(authData.user.email || '');
            setMessage('อีเมลได้รับการยืนยันเรียบร้อย กรุณาเข้าสู่ระบบ');
            setStatus('success');

            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: 'บัญชีของคุณพร้อมใช้งานแล้ว กรุณาเข้าสู่ระบบ',
                  email: authData.user.email 
                }
              });
            }, 3000);
            return;
          }
        }

        // If we get here, no valid confirmation method was found
        throw new Error('ไม่พบข้อมูลยืนยันที่ถูกต้อง กรุณาตรวจสอบลิงค์ในอีเมลของคุณ');

      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setMessage(error.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
        setStatus('error');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-professional">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {status === 'loading' && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
                  {status === 'success' && <CheckCircle2 className="w-12 h-12 text-green-500" />}
                  {status === 'error' && <AlertTriangle className="w-12 h-12 text-red-500" />}
                </div>
                
                <CardTitle className="text-2xl">
                  {status === 'loading' && 'กำลังยืนยันอีเมล...'}
                  {status === 'success' && 'ยืนยันสำเร็จ!'}
                  {status === 'error' && 'เกิดข้อผิดพลาด'}
                </CardTitle>
                
                <CardDescription className="text-base mt-2">
                  {message}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {status === 'success' && (
                  <div className="text-center space-y-4">
                    {userEmail && (
                      <div className="p-3 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm text-green-700">
                          <Mail className="w-4 h-4 inline mr-2" />
                          {userEmail}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate('/login', { state: { email: userEmail } })}
                      className="w-full"
                    >
                      เข้าสู่ระบบ
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      กำลังเปลี่ยนหน้าอัตโนมัติใน 3 วินาที...
                    </p>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <Button 
                        onClick={() => navigate('/register')}
                        className="w-full"
                      >
                        กลับไปสมัครสมาชิก
                      </Button>
                      <Button 
                        onClick={() => navigate('/login')}
                        variant="outline"
                        className="w-full"
                      >
                        เข้าสู่ระบบ
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      หากมีปัญหา กรุณาติดต่อฝ่ายสนับสนุน
                    </p>
                  </div>
                )}
                
                {status === 'loading' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      กรุณารอสักครู่...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default EmailConfirmation;
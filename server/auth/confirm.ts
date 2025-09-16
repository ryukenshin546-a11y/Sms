import { createClient } from '@supabase/supabase-js';

// Use Service Role key for server-side verification
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_KEY!, // Service Role key required for verifyOtp
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { token_hash, type = 'email' } = await request.json();
    
    console.log('🔍 Server-side verification request:', {
      token_hash: token_hash?.substring(0, 20) + '...' || 'undefined',
      type
    });

    if (!token_hash) {
      console.error('❌ No token_hash provided');
      return new Response(
        JSON.stringify({ error: 'Missing token_hash' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the OTP token using service role key
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any // 'email' | 'signup' | 'magiclink'
    });

    console.log('📊 Supabase verifyOtp result:', { 
      success: !!data.user, 
      userId: data.user?.id,
      email: data.user?.email,
      error: error?.message 
    });

    if (error) {
      console.error('❌ Server verification error:', error);
      
      // Handle specific error types
      let errorMessage = 'การยืนยันล้มเหลว';
      if (error.message.includes('expired')) {
        errorMessage = 'ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'ลิงก์ยืนยันไม่ถูกต้อง กรุณาตรวจสอบลิงก์จากอีเมลของคุณ';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: error.message 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user || !data.session) {
      console.error('❌ No user or session returned from verification');
      return new Response(
        JSON.stringify({ error: 'ไม่สามารถสร้าง session ได้' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Success - return session data
    console.log('✅ Server verification successful');
    
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }), 
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          // Set session cookies for client
          'Set-Cookie': [
            `sb-access-token=${data.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
            `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
          ].join(', ')
        } 
      }
    );

  } catch (error: any) {
    console.error('❌ Server confirmation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'เกิดข้อผิดพลาดในระบบ',
        details: error.message 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
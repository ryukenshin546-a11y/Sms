// server/routes/auth.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const router = express.Router();

// Use CORS for API routes
router.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:2020',
  credentials: true
}));

// Use Service Role key for server-side verification
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY, // Service Role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST /api/auth/confirm - Server-side email verification
router.post('/confirm', async (req, res) => {
  try {
    const { token_hash, type = 'email' } = req.body;
    
    console.log('🔍 Server-side verification request:', {
      token_hash: token_hash?.substring(0, 20) + '...' || 'undefined',
      type,
      timestamp: new Date().toISOString()
    });

    if (!token_hash) {
      console.error('❌ No token_hash provided');
      return res.status(400).json({ 
        error: 'Missing token_hash',
        message: 'ไม่พบ token สำหรับยืนยัน'
      });
    }

    // Verify the OTP token using service role key
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type // 'email' | 'signup' | 'magiclink'
    });

    console.log('📊 Supabase verifyOtp result:', { 
      success: !!data.user, 
      userId: data.user?.id,
      email: data.user?.email,
      error: error?.message 
    });

    if (error) {
      console.error('❌ Server verification error:', error);
      
      // Handle specific error types with Thai messages
      let errorMessage = 'การยืนยันล้มเหลว';
      let statusCode = 400;
      
      if (error.message.includes('expired') || error.message.includes('Expired')) {
        errorMessage = 'ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่';
        statusCode = 410; // Gone
      } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        errorMessage = 'ลิงก์ยืนยันไม่ถูกต้อง กรุณาตรวจสอบลิงก์จากอีเมลของคุณ';
        statusCode = 400; // Bad Request
      } else if (error.message.includes('not found') || error.message.includes('Not found')) {
        errorMessage = 'ไม่พบข้อมูลการยืนยัน กรุณาขอลิงก์ใหม่';
        statusCode = 404; // Not Found
      }
      
      return res.status(statusCode).json({ 
        error: errorMessage,
        details: error.message,
        code: error.code || 'verification_failed'
      });
    }

    if (!data.user || !data.session) {
      console.error('❌ No user or session returned from verification');
      return res.status(400).json({ 
        error: 'ไม่สามารถสร้าง session ได้',
        details: 'No user or session data returned'
      });
    }

    // Success - return session data
    console.log('✅ Server verification successful for user:', data.user.email);
    
    // Set HTTP-only cookies for security
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };

    // Set session cookies
    res.cookie('sb-access-token', data.session.access_token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 // 1 hour
    });
    
    res.cookie('sb-refresh-token', data.session.refresh_token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'ยืนยันอีเมลสำเร็จ',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        created_at: data.user.created_at
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type
      }
    });

  } catch (error) {
    console.error('❌ Server confirmation error:', error);
    return res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในระบบ',
      details: error.message || 'Internal server error'
    });
  }
});

export default router;
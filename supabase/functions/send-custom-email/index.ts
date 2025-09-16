import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface SendCustomEmailRequest {
  email: string;
  type: 'verification' | 'reset' | 'welcome';
  userId?: string;
  verificationToken?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📧 Custom Email Sender Function Called');

    // Parse request
    const { email, type, userId, verificationToken }: SendCustomEmailRequest = await req.json();

    if (!email) {
      return Response.json({
        success: false,
        error: 'Email is required'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({
        success: false,
        error: 'Invalid email format'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log(`📨 Sending ${type} email to:`, email);

    // Get SMTP credentials from environment
    const smtpHost = Deno.env.get('SMSUP_SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMSUP_SMTP_PORT') || '587');
    const smtpUsername = Deno.env.get('SMSUP_EMAIL_USERNAME');
    const smtpPassword = Deno.env.get('SMSUP_EMAIL_PASSWORD');
    const fromEmail = Deno.env.get('SMSUP_FROM_EMAIL') || smtpUsername;
    const fromName = Deno.env.get('SMSUP_FROM_NAME') || 'SMS-UP+ System';

    if (!smtpUsername || !smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword,
        },
      },
    });

    // Generate email template based on type
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';
    const template = generateEmailTemplate(type, email, baseUrl, verificationToken, userId);

    console.log('📤 Connecting to SMTP server...');
    
    // Send email
    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: template.subject,
      html: template.html,
      content: template.text,
    });

    await client.close();

    console.log('✅ Email sent successfully via SMS UP Plus SMTP');

    return Response.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        email: email,
        type: type,
        timestamp: new Date().toISOString()
      }
    }, { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('💥 Custom Email Sender error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

function generateEmailTemplate(
  type: string, 
  email: string, 
  baseUrl: string, 
  verificationToken?: string, 
  userId?: string
): EmailTemplate {
  switch (type) {
    case 'verification':
      const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      return {
        subject: '🔐 ยืนยันอีเมลของคุณ - SMS-UP+ System',
        html: `
          <!DOCTYPE html>
          <html lang="th">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ยืนยันอีเมล - SMS-UP+</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0066cc; margin: 0; font-size: 28px;">📱 SMS-UP+</h1>
                <p style="color: #666; margin: 10px 0; font-size: 16px;">SMS Marketing Platform</p>
              </div>
              
              <h2 style="color: #333; margin-bottom: 20px;">🔐 ยืนยันอีเมลของคุณ</h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
                สวัสดี! <br>
                กรุณายืนยันอีเมล <strong>${email}</strong> เพื่อเริ่มใช้งาน SMS-UP+ System
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" 
                   style="background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  ✅ ยืนยันอีเมล
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  🔗 หากปุ่มไม่ทำงาน กรุณาคัดลอก URL นี้ไปยัง browser:<br>
                  <span style="word-break: break-all; color: #0066cc;">${verifyUrl}</span>
                </p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  ⏰ ลิงก์นี้จะหมดอายุใน <strong>24 ชั่วโมง</strong><br>
                  🔒 หากคุณไม่ได้ลงทะเบียน กรุณาเพิกเฉยต่ออีเมลนี้<br>
                  📧 อีเมลนี้ส่งจาก SMS-UP+ System อัตโนมัติ
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
🔐 ยืนยันอีเมลของคุณ - SMS-UP+ System

สวัสดี!
กรุณายืนยันอีเมล ${email} เพื่อเริ่มใช้งาน SMS-UP+ System

กรุณาคลิกลิงก์นี้เพื่อยืนยัน:
${verifyUrl}

ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง
หากคุณไม่ได้ลงทะเบียน กรุณาเพิกเฉยต่ออีเมลนี้

--
SMS-UP+ System
        `.trim()
      };

    case 'welcome':
      return {
        subject: '🎉 ยินดีต้อนรับสู่ SMS-UP+ System',
        html: `
          <h1>🎉 ยินดีต้อนรับ!</h1>
          <p>ขอบคุณที่เข้าร่วม SMS-UP+ System</p>
          <p>คุณสามารถเริ่มใช้งานระบบส่ง SMS ได้แล้ว</p>
          <a href="${baseUrl}/dashboard">เริ่มใช้งาน</a>
        `,
        text: `ยินดีต้อนรับสู่ SMS-UP+ System! เริ่มใช้งานได้ที่: ${baseUrl}/dashboard`
      };

    case 'reset':
      const resetUrl = `${baseUrl}/reset-password?token=${verificationToken}`;
      return {
        subject: '🔑 รีเซ็ตรหัสผ่าน - SMS-UP+ System',
        html: `
          <h1>🔑 รีเซ็ตรหัสผ่าน</h1>
          <p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
          <a href="${resetUrl}">รีเซ็ตรหัสผ่าน</a>
          <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        `,
        text: `รีเซ็ตรหัสผ่าน: ${resetUrl}`
      };

    default:
      return {
        subject: '📧 SMS-UP+ System Notification',
        html: '<p>Hello from SMS-UP+ System</p>',
        text: 'Hello from SMS-UP+ System'
      };
  }
}
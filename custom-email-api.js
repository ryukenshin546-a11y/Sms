/**
 * Custom Email API Endpoint
 * Alternative solution for SMTP issues
 */

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// SMTP Configuration
const transporter = nodemailer.createTransporter({
  host: 'win01-mailpro.zth.netdesignhost.com',
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for 587
  auth: {
    user: 'hello@smsup-plus.com',
    pass: 'YOUR_SMTP_PASSWORD'
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Server ready');
  }
});

// API endpoint for sending verification emails
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, verificationUrl } = req.body;
    
    if (!email || !verificationUrl) {
      return res.status(400).json({ 
        error: 'Email and verification URL required' 
      });
    }

    const mailOptions = {
      from: 'SMSUP-PLUS <hello@smsup-plus.com>',
      to: email,
      subject: 'ยืนยันอีเมลของคุณ - SMS UP Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>ยืนยันอีเมลของคุณ</h2>
          <p>สวัสดี,</p>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              ยืนยันอีเมล
            </a>
          </div>
          <p>หรือคลิกลิงก์นี้: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>หากคุณไม่ได้ลงทะเบียนกับ SMS UP Plus กรุณาเพิกเฉยต่ออีเมลนี้</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            อีเมลนี้ส่งจาก SMS UP Plus<br>
            หากมีปัญหา กรุณาติดต่อ: support@smsup-plus.com
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Email API Server running on port ${PORT}`);
});
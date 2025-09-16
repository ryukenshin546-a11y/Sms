# SMTP Troubleshooting Checklist

## 1. ตรวจสอบ SMTP Settings ใน Supabase Dashboard

### Basic Settings:
- **Host**: https://win01-mailpro.zth.netdesignhost.com ✅
- **Port**: 465 ✅ (SSL/TLS port)
- **Username**: hello@smsup-plus.com ✅
- **Password**: ******** (ต้องถูกต้อง)
- **Sender Email**: hello@smsup-plus.com ✅
- **Sender Name**: SMSUP-PLUS ✅

### Security Settings:
- **Port 465**: ใช้ SSL/TLS (Implicit)
- **Port 587**: ใช้ STARTTLS (Explicit)
- **Port 25**: Plain text (ไม่แนะนำ)

## 2. ทดสอบ SMTP Connection

### Test Commands (PowerShell):
```powershell
# Test SMTP connectivity
Test-NetConnection -ComputerName win01-mailpro.zth.netdesignhost.com -Port 465
Test-NetConnection -ComputerName win01-mailpro.zth.netdesignhost.com -Port 587
```

### Alternative Test (Node.js):
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'win01-mailpro.zth.netdesignhost.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'hello@smsup-plus.com',
    pass: 'YOUR_PASSWORD'
  }
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Ready:', success);
  }
});
```

## 3. Common Issues & Solutions

### Issue 1: Port 465 vs 587
- **Port 465**: SSL/TLS (secure from start)
- **Port 587**: STARTTLS (upgrade to secure)
- **Try both ports** if one doesn't work

### Issue 2: Authentication
- **Verify username/password** with mail provider
- **Check if 2FA is enabled** (may need app password)
- **Confirm email account exists** and can send mail

### Issue 3: Firewall/Network
- **Supabase servers** must reach your SMTP server
- **Check if SMTP server** accepts external connections
- **Verify DNS resolution** for your domain

### Issue 4: SSL Certificate
- **SMTP server** must have valid SSL certificate
- **Self-signed certificates** may be rejected
- **Certificate chain** must be complete

## 4. Debugging Steps

1. **Test with Gmail first** (known working SMTP)
2. **Check SMTP server logs** for connection attempts
3. **Try different ports** (465, 587, 25)
4. **Verify credentials** with mail client (Outlook, etc.)
5. **Check domain MX records**

## 5. Alternative Solutions

### Option A: Use Gmail SMTP (Temporary)
```
Host: smtp.gmail.com
Port: 587
Security: STARTTLS
Username: your-gmail@gmail.com
Password: App Password (not regular password)
```

### Option B: Use SendGrid/Mailgun
- More reliable for transactional emails
- Better deliverability
- Detailed analytics

### Option C: Custom Email Service
- Create custom API endpoint
- Handle email sending server-side
- More control over email templates
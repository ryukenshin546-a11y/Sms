# 📧 คู่มือการตั้งค่า SMS UP Plus SMTP สำหรับ Email Verification

## 🎯 การตั้งค่า Email Credentials

### **ขั้นตอนที่ 1: เตรียม Email Credentials ของ SMS UP Plus**

#### **สำหรับ Gmail:**
1. **เปิด 2-Factor Authentication** ในบัญชี Gmail
2. **สร้าง App Password:**
   - ไปที่ [Google Account Settings](https://myaccount.google.com/)
   - เลือก **Security** → **2-Step Verification** → **App passwords**
   - เลือก **Mail** และ **Other (Custom name)**
   - ตั้งชื่อ: `SMS-UP Plus System`
   - คัดลอก **16-digit password** ที่ได้

#### **สำหรับ Custom SMTP:**
- **Host**: ตัวอย่าง `mail.your-domain.com`
- **Port**: 587 (TLS) หรือ 465 (SSL)
- **Username**: email@your-domain.com  
- **Password**: รหัสผ่าน email

---

## ⚙️ การตั้งค่าใน .env Files

### **1. อัปเดต `.env` หลัก:**

```bash
# SMS UP Plus Email SMTP Configuration
SMSUP_SMTP_HOST=smtp.gmail.com
SMSUP_SMTP_PORT=587
SMSUP_EMAIL_USERNAME=your-smsup-email@gmail.com
SMSUP_EMAIL_PASSWORD=your-16-digit-app-password
SMSUP_FROM_EMAIL=your-smsup-email@gmail.com
SMSUP_FROM_NAME=SMS-UP+ System
SITE_URL=http://localhost:5173
```

### **2. อัปเดต `supabase/.env`:**

```bash
# SMS UP Plus Email SMTP Configuration
SMSUP_SMTP_HOST=smtp.gmail.com
SMSUP_SMTP_PORT=587
SMSUP_EMAIL_USERNAME=your-smsup-email@gmail.com
SMSUP_EMAIL_PASSWORD=your-16-digit-app-password
SMSUP_FROM_EMAIL=your-smsup-email@gmail.com
SMSUP_FROM_NAME=SMS-UP+ System
SITE_URL=http://localhost:5173
```

---

## 🚀 การทดสอบระบบ

### **วิธีที่ 1: ใช้ HTML Test File**

```bash
# เปิดไฟล์ทดสอบ
start test-email-verification.html
```

### **วิธีที่ 2: ใช้ Console**

```javascript
// ทดสอบ Custom SMTP
await window.testCustomSMTP();

// ทดสอบ Email Verification Hook
await window.testEmailVerification();
```

### **วิธีที่ 3: ทดสอบใน React App**

```typescript
// ใน React Component
import { useEmailVerification } from '@/hooks/useEmailVerification';

const { sendVerificationEmail } = useEmailVerification();

const handleSendEmail = async () => {
  const result = await sendVerificationEmail('test@example.com');
  console.log(result);
};
```

---

## 🔍 การแก้ไขปัญหา (Troubleshooting)

### **ปัญหา 1: SMTP Authentication Failed**

**สาเหตุ:**
- App Password ไม่ถูกต้อง
- 2FA ยังไม่เปิด

**วิธีแก้:**
```bash
# ตรวจสอบ credentials
echo $SMSUP_EMAIL_USERNAME
echo $SMSUP_EMAIL_PASSWORD
```

### **ปัญหา 2: Port Connection Failed**

**สาเหตุ:**
- Port 587/465 ถูก firewall block
- SMTP Host ผิด

**วิธีแก้:**
```bash
# ทดสอบ connection
telnet smtp.gmail.com 587
```

### **ปัญหา 3: Email ไม่ถึง**

**วิธีตรวจสอบ:**
1. ตรวจ **Spam/Junk** folder
2. ตรวจสอบ Email delivery status ใน logs
3. ทดสอบส่งไป email อื่น

---

## 📊 Email Template Customization

### **แก้ไข Email Template:**

ไฟล์: `supabase/functions/send-custom-email/index.ts`

```typescript
// แก้ไขใน function generateEmailTemplate()
case 'verification':
  return {
    subject: '🔐 ยืนยันอีเมลของคุณ - SMS-UP+ System',
    html: `
      <!-- Your custom HTML template -->
      <h1>ยินดีต้อนรับสู่ SMS-UP+</h1>
      <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมล</p>
      <a href="${verifyUrl}">ยืนยันอีเมล</a>
    `,
    text: 'ยืนยันอีเมลของคุณ...'
  };
```

---

## 🎯 Production Deployment

### **Supabase Dashboard Configuration:**

1. ไปที่ **Supabase Dashboard** → **Settings** → **Environment Variables**
2. เพิ่ม Environment Variables:
   ```
   SMSUP_SMTP_HOST=smtp.gmail.com
   SMSUP_SMTP_PORT=587
   SMSUP_EMAIL_USERNAME=your-email@gmail.com
   SMSUP_EMAIL_PASSWORD=your-app-password
   SMSUP_FROM_EMAIL=your-email@gmail.com
   SMSUP_FROM_NAME=SMS-UP+ System
   SITE_URL=https://your-domain.com
   ```

### **Deploy Edge Functions:**

```bash
# Deploy functions
supabase functions deploy send-custom-email
supabase functions deploy send-email-verification
```

---

## ✅ การทดสอบการทำงาน

### **Expected Results:**

1. **✅ Custom SMTP Success**: Email ส่งผ่าน SMS UP Plus SMTP
2. **✅ Beautiful Email Template**: HTML email พร้อม styling
3. **✅ Fallback System**: หาก SMTP ล้มเหลว จะใช้ Supabase Auth
4. **✅ Email Delivery**: Email ถึง inbox ภายใน 1-2 นาที

### **Debug Information:**

ตรวจสอบ Console logs:
- `📧 Sending verification email to: email@example.com`
- `✅ Email verification sent via Custom SMTP Service`
- `📤 Connecting to SMTP server...`
- `✅ Email sent successfully via SMS UP Plus SMTP`

---

## 🔐 Security Best Practices

1. **ใช้ App Password**: ไม่ใช่รหัสผ่าน Gmail หลัก
2. **Environment Variables**: เก็บ credentials ใน .env
3. **Rate Limiting**: จำกัดการส่ง email
4. **Email Validation**: ตรวจสอบ email format
5. **HTTPS Only**: ใช้ HTTPS ใน production

---

## 📞 การขอความช่วยเหลือ

หากมีปัญหา:
1. ตรวจสอบ Console logs
2. ทดสอบด้วย `test-email-verification.html`
3. ตรวจสอบ SMTP credentials
4. ทดสอบ fallback methods
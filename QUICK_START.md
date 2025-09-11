# 🚀 Quick Start Guide - SMS Auto-Bot System

## ⚡ **การเริ่มต้นใช้งานด่วน**

### 📋 **ขั้นตอนการติดตั้งและใช้งาน**

#### 1. **เตรียมความพร้อม**
```bash
# Clone repository (ถ้ามี)
git clone <repository-url>
cd Sms

# ติดตั้ง dependencies
npm install
```

#### 2. **เริ่มระบบ (2 Terminal)**

**Terminal 1: API Server**
```bash
cd "C:\Users\Sirap\OneDrive\Documents\Sms"
node server/autoBotServer.js
```
*ผลลัพธ์ที่คาดหวัง:*
```
🚀 Auto-Bot API Server เริ่มทำงานที่ http://localhost:3001
📡 API Endpoint: http://localhost:3001/api/auto-bot/generate
```

**Terminal 2: Web UI**
```bash
npm run dev
```
*ผลลัพธ์ที่คาดหวัง:*
```
VITE v5.4.20  ready in 235 ms
➜  Local:   http://localhost:8083/
```

#### 3. **เข้าใช้งาน**
- เปิดเบราว์เซอร์: http://localhost:8083/profile
- กดปุ่ม "🚀 เริ่ม Auto-Bot Generation"
- รอดูผลลัพธ์

---

## 🎯 **การใช้งานผ่าน Web Interface**

### ขั้นตอนการสร้าง SMS Account

1. **เข้าสู่หน้า Profile**
   - URL: http://localhost:8083/profile
   - จะเห็นส่วน "SMS Account Management (Auto-Bot)"

2. **เริ่มกระบวนการ Auto-Bot**
   - กดปุ่ม "🚀 เริ่ม Auto-Bot Generation"
   - Progress bar จะแสดงความคืบหน้า

3. **ดูขั้นตอนการทำงาน**
   - เปิดเบราว์เซอร์...
   - เข้าสู่ระบบ smsup-plus.com
   - กรอกข้อมูล Sub Account
   - บันทึกและยืนยัน

4. **รับผลลัพธ์**
   - Username, Email, Password จะแสดงขึ้น
   - สามารถ Copy ข้อมูลได้ทันที

---

## 🔧 **การใช้งานผ่าน Command Line**

### รัน Auto-Bot โดยตรง
```bash
cd "C:\Users\Sirap\OneDrive\Documents\Sms"
node scripts/runAutoBot.js
```

### ผลลัพธ์ตัวอย่าง
```
🤖 เริ่มต้น Auto-Bot Process...
🤖 เปิดเบราว์เซอร์...
✅ กรอก Account Name: test257
✅ กรอก Username: test257  
✅ กรอก Email: test612@gmail.com
✅ Auto-Bot เสร็จสิ้น! สร้าง Sub Account สำเร็จ
📋 ข้อมูล Sub Account ที่สร้าง:
   Account Name: test257
   Username: test257
   Email: test612@gmail.com
   Password: &2e,F]R)9T$5J1Mq
```

---

## 📂 **ไฟล์สำคัญ**

### ไฟล์หลัก
- `scripts/runAutoBot.js` - Puppeteer Auto-Bot Script
- `server/autoBotServer.js` - Express API Server
- `src/pages/Profile.tsx` - หน้า Web Interface
- `src/services/autoBotApi.ts` - API Integration

### ไฟล์ Configuration
- `package.json` - Dependencies และ scripts
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS config

---

## ⚙️ **Environment Variables**

### ตัวอย่างการตั้งค่า
```bash
# ใส่ใน .env file
VITE_SMS_ADMIN_USERNAME=Landingpage
VITE_SMS_ADMIN_PASSWORD=@Atoz123
VITE_BOT_MODE=production
```

---

## 🔍 **การตรวจสอบสถานะ**

### 1. **ตรวจสอบ API Server**
```bash
curl http://localhost:3001/api/health
```
ตอบกลับ: `{"status":"OK","message":"Auto-Bot API Server is running"}`

### 2. **ตรวจสอบ Web UI**
- เข้าไปที่ http://localhost:8083
- ควรเห็นหน้าแรกของเว็บไซต์

### 3. **ตรวจสอบ Puppeteer**
```bash
node -e "console.log(require('puppeteer').executablePath())"
```

---

## 🎨 **คุณสมบัติของ Web Interface**

### หน้า Profile
- **👤 ข้อมูลผู้ใช้** - แสดงข้อมูล Mock User
- **🎯 SMS Account Management** - ส่วนจัดการ Auto-Bot
- **📊 Progress Tracking** - แสดงความคืบหน้าแบบ Real-time
- **🔐 Credential Display** - แสดงผลลัพธ์พร้อม Copy button

### การนำทาง
- **Home** - หน้าแรก (Landing Page)
- **Profile** - หน้าจัดการ Auto-Bot
- **About Us** - เกี่ยวกับเรา
- **Pricing** - แพ็กเกจราคา

---

## 🚨 **การแก้ไขปัญหาเบื้องต้น**

### ปัญหาที่พบบ่อย

#### 1. **API Server ไม่ทำงาน**
```bash
# ตรวจสอบ port 3001
netstat -an | findstr :3001

# รีสตาร์ท server
Ctrl+C
node server/autoBotServer.js
```

#### 2. **Web UI ไม่แสดงผล**
```bash
# ตรวจสอบ port 8083
netstat -an | findstr :8083

# รีสตาร์ท development server
Ctrl+C
npm run dev
```

#### 3. **Puppeteer Error**
```bash
# ตรวจสอบ Chromium installation
node scripts/runAutoBot.js
```

#### 4. **Permission Error**
- เรียกใช้ Command Prompt หรือ PowerShell ในฐานะ Administrator

---

## 📝 **Log และการติดตาม**

### การดู Log แบบ Real-time

**API Server Log:**
- ดูได้ใน Terminal ที่รัน `node server/autoBotServer.js`
- แสดงข้อมูล Auto-Bot process และ API requests

**Web UI Log:**
- เปิด Developer Tools (F12)
- ไปที่ Console tab เพื่อดู frontend logs

**Auto-Bot Log:**
- แสดงใน API Server Terminal
- บอกขั้นตอนการทำงานของ Puppeteer

---

## 🎯 **Tips สำหรับการใช้งาน**

### เพื่อประสิทธิภาพที่ดีที่สุด
1. **เชื่อมต่ออินเทอร์เน็ตที่เสถียร** - สำคัญสำหรับ Puppeteer
2. **ปิดโปรแกรมที่ไม่จำเป็น** - ประหยัด RAM สำหรับ Chromium
3. **ใช้ incognito mode** - หลีกเลี่ยงการ cache ขัดแย้ง
4. **รอให้ process เสร็จสิ้น** - ไม่ควรหยุดกลางคัน

### การ Backup ข้อมูล
- Copy ข้อมูล Account ทันทีหลังสร้างเสร็จ
- เก็บ Screenshot หน้า SUB ACCOUNTS เป็น proof

---

## 🌟 **ฟีเจอร์พิเศษ**

### Real-time Progress Updates
- แสดงขั้นตอนการทำงานของ Auto-Bot
- Progress bar แบบ smooth animation
- สถานะ loading ที่สวยงาม

### Security Features  
- Password generation ที่ปลอดภัย
- ไม่เก็บข้อมูลอ่อนไหวใน frontend
- Account Name และ Username ที่สอดคล้องกัน

### User Experience
- One-click account generation
- Copy to clipboard ง่ายๆ
- Error handling ที่เป็นมิตร

---

*🎉 พร้อมใช้งานแล้ว! หากมีปัญหาสามารถดูใน TECHNICAL_DOCS.md สำหรับรายละเอียดเพิ่มเติม*

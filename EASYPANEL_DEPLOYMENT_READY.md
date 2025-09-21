# 📋 SMS Auto-Bot System - Easypanel Deployment Guide

## 🚀 การตรวจสอบความพร้อม Deploy

### ✅ สิ่งที่พร้อมแล้ว

#### 1. **Docker Configuration**
- ✅ `Dockerfile` - Multi-stage build สำหรับ production
- ✅ `nginx.conf` - Nginx config พร้อม security headers
- ✅ `.gitignore` - ป้องกัน sensitive files

#### 2. **Environment Configuration**
- ✅ `.env.template` - Template ที่ครบถ้วน
- ✅ `.env.production.example` - Production environment template
- ✅ Security configuration templates

#### 3. **Build System**
- ✅ Package.json scripts พร้อม
- ✅ Vite build configuration
- ✅ TypeScript compilation

#### 4. **Database Schema**
- ✅ Supabase migrations พร้อม (11 migration files)
- ✅ Complete schema ใน `20250101000000_complete_simple_schema.sql`
- ✅ RLS policies configured

#### 5. **API & Services**
- ✅ Express server (`server/index.js`)
- ✅ Supabase Edge Functions
- ✅ OTP services integration

---

## ⚠️ สิ่งที่ต้องดำเนินการก่อน Deploy

### 1. **Environment Variables Setup**
```bash
# คัดลอก template และแก้ไขค่า
cp .env.production.example .env

# แก้ไขค่าต่อไปนี้ให้เป็นค่าจริง:
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_SUPABASE_SERVICE_KEY=your_actual_service_key  
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
```

### 2. **Supabase Configuration**
- ตั้งค่า Supabase project URL
- เปิดใช้ RLS policies
- Deploy Edge Functions
- ตั้งค่า CORS origins

### 3. **Security Setup**
- สร้าง encryption keys ใหม่
- ตั้งค่า CORS สำหรับ production domain  
- ตรวจสอบ CSP headers
- เปิดใช้ rate limiting

---

## 🚀 Easypanel Deployment Steps

### Step 1: Repository Setup
1. Push code ไป Git repository
2. ตรวจสอบให้แน่ใจว่า `Dockerfile` อยู่ใน root directory
3. ไม่ได้ commit `.env` files (ใช้ environment variables ใน Easypanel)

### Step 2: Easypanel Configuration
```yaml
# App Type: Docker
# Repository: your-git-repo-url
# Branch: main (หรือ production)
# Dockerfile Path: ./Dockerfile

# Environment Variables (ตั้งใน Easypanel Dashboard):
NODE_ENV=production
VITE_SUPABASE_URL=https://mnhdueclyzwtfkmwttkc.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
# ... และตัวแปรอื่นๆ จาก .env.production.example
```

### Step 3: Domain & SSL
- ตั้งค่า custom domain
- เปิดใช้ SSL certificate
- อัปเดต CORS origins ให้ตรงกับ domain ใหม่

### Step 4: Database Migration
```sql
-- รัน migration ใน Supabase SQL Editor
-- ไฟล์: supabase/migrations/*.sql
-- เรียงตามลำดับวันที่
```

---

## 📊 Production Checklist

### ✅ ความปลอดภัย
- [ ] Environment variables ไม่มี hardcode secrets
- [ ] SSL/TLS certificates configured
- [ ] CORS origins ตั้งค่าถูกต้อง
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation implemented

### ✅ Performance
- [ ] Gzip compression enabled
- [ ] Static asset caching
- [ ] Database query optimization
- [ ] CDN setup (optional)

### ✅ Monitoring
- [ ] Health check endpoints
- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] Audit logging enabled

### ✅ Backup & Recovery
- [ ] Database backup strategy
- [ ] Environment variables backup
- [ ] Deployment rollback plan

---

## 🎯 Post-Deployment Testing

### 1. **Basic Functionality**
- ✅ Website loads correctly
- ✅ Authentication system works
- ✅ OTP verification functions
- ✅ SMS account generation works

### 2. **API Testing**
```bash
# Health check
curl https://yourdomain.com/health

# API endpoint test  
curl https://yourdomain.com/api/health
```

### 3. **Database Connectivity**
- ตรวจสอบ Supabase connection
- ทดสอบ RLS policies
- ทดสอบ Edge Functions

---

## 🔧 Troubleshooting

### Common Issues:
1. **Environment Variables**: ตรวจสอบให้แน่ใจว่าทุกตัวแปรตั้งค่าถูกต้อง
2. **CORS Errors**: อัปเดต CORS origins ใน Supabase settings
3. **Database Connection**: ตรวจสอบ Supabase URL และ keys
4. **Build Errors**: ตรวจสอบ Node.js version และ dependencies

---

## 📞 Support Information

- **Documentation**: ดู README.md และ TECHNICAL_DOCS.md
- **Database Schema**: `supabase/migrations/` 
- **API Documentation**: `SMS_ACCOUNT_CREATION_API_FLOW.md`
- **Security Guide**: `PHASE_2.3_COMPLETION_SUMMARY.md`

---

**✅ สรุป: โปรเจคพร้อม deploy บน Easypanel แล้ว โดยต้องตั้งค่า environment variables และ domain ให้ถูกต้องก่อนการใช้งานจริง**
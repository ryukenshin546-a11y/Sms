# สรุปโครงสร้างฐานข้อมูลปัจจุบัน (Database Schema Summary)

## 📋 **ตารางที่มีอยู่ในฐานข้อมูล**

### **1. ตารางหลัก (Core Tables)**

#### **🔑 profiles** (Base User Management)
- `id` (uuid, PK)
- `username`, `email` (unique)
- `phone_number`, `full_name`
- `role` ('admin', 'user', 'corporate')
- `status` ('active', 'inactive', 'suspended')
- `account_type` ('personal', 'corporate')
- `email_verified`, `phone_verified` (boolean)
- `company_name`, `company_tax_id` (for corporate)
- `credit_balance` (integer)
- `created_at`, `updated_at`, `last_login_at`

#### **📱 otp_verifications** (OTP System)
- `id` (uuid, PK)
- `phone_number`, `formatted_phone`
- `otp_code`, `reference_code`
- `status` ('pending', 'sent', 'verified', 'failed', 'expired')
- `verification_attempts`, `max_attempts`
- `external_service`, `external_otp_id`
- `expires_at`, `verified_at`
- `user_id` (FK to profiles - optional)
- `ip_address`, `user_agent`

#### **✅ verified_phone_numbers** (Phone Registry)
- `id` (uuid, PK)
- `phone_number`, `formatted_phone` (unique)
- `verified_at`, `verification_method`
- `user_id` (FK to profiles)
- `status` ('active', 'inactive', 'blocked')

#### **💳 sms_accounts** (SMS Account Management)
- `id` (uuid, PK)
- `profile_id` (FK to profiles)
- `account_name`, `phone_number`
- `status` ('pending', 'active', 'suspended', 'expired')
- `total_sms_sent`, `monthly_limit`
- `expires_at`, `last_used_at`

### **2. ตารางติดตามและบันทึก (Logging & Tracking Tables)**

#### **📊 audit_logs** (Comprehensive Logging)
- `id` (uuid, PK)
- `event_type` ('otp_send', 'otp_verify', 'rate_limit', etc.)
- `event_category` ('security', 'otp', 'performance', 'error')
- `severity` ('debug', 'info', 'warn', 'error', 'critical')
- `client_ip`, `user_agent`, `request_id`
- `event_data` (jsonb), `message`
- `service_name`, `service_version`
- `response_time_ms`, `database_query_time_ms`
- `error_code`, `error_message`

#### **⚡ performance_metrics** (Performance Tracking)
- `id` (uuid, PK)
- `service_name`, `operation`
- `response_time_ms`, `database_query_time_ms`
- `api_call_time_ms`
- `success` (boolean), `error_code`
- `metrics_data` (jsonb)

#### **🚦 rate_limits** (Rate Limiting)
- `id` (uuid, PK)
- `key` (varchar) - identifier for rate limiting
- `timestamp`, `request_count`
- `expires_at` (calculated field)

### **3. ตารางสนับสนุน (Support Tables)**

#### **🔐 otp_service_tokens** (API Authentication)
- `id` (uuid, PK)
- `service_name` (default: 'ants')
- `access_token`, `token_type`
- `expires_at`, `refresh_token`

#### **📝 activity_logs** (General System Logs)
- `id` (uuid, PK)
- `profile_id` (FK to profiles)
- `action`, `description`, `category`
- `ip_address`, `user_agent`

#### **📋 sms_account_logs** (SMS Account Activity)
- `id` (uuid, PK)
- `sms_account_id` (FK to sms_accounts)
- `action`, `description`
- `old_status`, `new_status`
- `performed_by` (FK to profiles)

---

## 🔧 **Indexes ที่มีอยู่**

### **Performance Indexes**
- `idx_otp_phone_number` - otp_verifications(formatted_phone)
- `idx_otp_status` - otp_verifications(status)
- `idx_otp_expires_at` - otp_verifications(expires_at)
- `idx_audit_logs_timestamp` - audit_logs(timestamp DESC)
- `idx_audit_logs_event_type` - audit_logs(event_type)
- `idx_performance_metrics_timestamp` - performance_metrics(timestamp DESC)
- `idx_rate_limits_key_timestamp` - rate_limits(key, timestamp DESC)

### **Composite Indexes**
- `idx_audit_logs_type_time` - audit_logs(event_type, timestamp DESC)
- `idx_audit_logs_category_severity` - audit_logs(event_category, severity)

---

## 🔒 **Row Level Security (RLS)**

### **Enabled Tables**
- ✅ `profiles` - Users can view/edit own profile
- ✅ `sms_accounts` - Users can view/edit own accounts
- ✅ `audit_logs` - Service key access only
- ✅ `performance_metrics` - Service key access only
- ✅ `rate_limits` - Service key management, users can read/insert

### **Service Key Permissions**
- `audit_logs` - Full access for logging
- `performance_metrics` - Full access for metrics
- `rate_limits` - Full access for rate limiting

---

## 🚨 **ปัญหาที่ต้องแก้ไข**

### **1. Foreign Key Issues**
- ❌ `otp_verifications.user_id` - FK constraint ไม่ได้ถูกสร้าง
- ❌ `verified_phone_numbers.user_id` - FK constraint ไม่ได้ถูกสร้าง
- ❌ `profiles.verified_phone_id` - FK constraint ไม่ได้ถูกสร้าง

### **2. Missing Tables for Performance Optimization**
- ❓ `otp_codes` - ตารางที่ performance script ต้องการ (ยังไม่มี)
- ✅ `rate_limits` - มีแล้ว แต่ structure อาจไม่ตรงกับ performance script
- ✅ `audit_logs` - มีแล้ว
- ✅ `performance_metrics` - มีแล้ว

### **3. Migration Order Issues**
- ⚠️ Migrations ไม่เรียงลำดับถูกต้อง
- ⚠️ Foreign Key references ถูกสร้างก่อนที่ table ปลายทางจะมี

---

## 🎯 **แผนการแก้ไข**

### **Step 1: แก้ไข Migration Order**
1. สร้าง base schema ก่อน (profiles, base tables)
2. สร้าง OTP tables โดยไม่มี FK constraints
3. เพิ่ม FK constraints ทีหลัง

### **Step 2: ปรับ Performance Optimization Script**
1. ใช้ตาราง `otp_verifications` แทน `otp_codes`
2. ปรับ indexes ให้ตรงกับ schema ที่มี
3. ปรับ cleanup functions ให้ใช้ตารางที่มีจริง

### **Step 3: Safe Database Reset**
1. แก้ไข migration dependencies
2. Reset database ด้วย migrations ที่ถูกต้อง
3. Apply performance optimizations

---

**สถานะ: 🔄 พร้อมสำหรับการแก้ไข**
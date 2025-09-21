# Database Schema vs Edge Function Code Analysis Report

## 📊 Current Database Schema Analysis Results

**Please run `comprehensive_database_analysis.sql` in Supabase first, then come back here with results**

## 🔍 Edge Function Code Analysis

### 1. OTP-SEND-NEW Function Expected Fields:

#### otp_verifications table INSERT fields:
```typescript
{
  id: sessionId,                    // UUID
  phone_number: phoneNumber,        // VARCHAR
  formatted_phone: sanitizedPhone,  // VARCHAR  
  external_otp_id: otpData.otpId,   // VARCHAR
  reference_code: otpData.referenceCode, // VARCHAR (nullable)
  status: 'pending',                // VARCHAR
  expires_at: expiresAt,           // TIMESTAMP
  verification_attempts: 0,         // INTEGER (DEFAULT 0)
  max_attempts: 3,                 // INTEGER
  user_id: validUserId,            // UUID (nullable)
  external_service: 'sms_up_plus', // VARCHAR
  created_at: new Date(),          // TIMESTAMP
  updated_at: new Date(),          // TIMESTAMP
  metadata: { otcId, accessToken } // JSONB
}
```

**⚠️ CRITICAL: otp_code is NOT provided in INSERT - should be nullable**

### 2. OTP-VERIFY Function Expected Fields:

#### otp_verifications table SELECT fields:
```typescript
.select('*')
.eq('external_otp_id', otpId)
.eq('reference_code', referenceCode)
```

#### otp_verifications table UPDATE fields:
```typescript
{
  status: 'verified'|'failed'|'expired',
  verified_at: new Date(),         // TIMESTAMP (nullable)  
  updated_at: new Date()           // TIMESTAMP
}
```

### 3. Audit Logger Expected Fields:

#### audit_logs table INSERT fields:
```typescript
{
  timestamp: new Date().toISOString(),
  event_type: event.eventType,
  event_category: event.eventCategory,  
  severity: event.severity,
  client_ip: event.clientIP,
  user_agent: event.userAgent,
  request_id: event.requestId,
  session_id: event.sessionId,
  event_data: eventData,           // JSONB
  message: event.message,
  phone_number: masked_phone,      // VARCHAR (masked)
  otp_id: event.otpId,
  reference_code: event.referenceCode,
  success: event.success,          // BOOLEAN
  response_time_ms: event.responseTimeMs,    // INTEGER
  database_query_time_ms: event.databaseQueryTimeMs, // INTEGER
  error_code: event.errorCode,
  error_message: event.errorMessage,
  stack_trace: event.stackTrace,
  service_name: this.serviceName,
  service_version: this.serviceVersion
}
```

**⚠️ CRITICAL: 'action' field is NOT provided in INSERT - should be nullable**

### 4. Rate Limiter Expected Fields:

From error logs, rate limiter expects:
```typescript
{
  key: string,           // Missing field!
  identifier: string,
  action: string,
  // ... other fields
}
```

## 🚨 Identified Issues from Error Analysis:

### Issue 1: otp_verifications.otp_code
- **Problem**: NOT NULL constraint but code doesn't provide value
- **Error**: `null value in column "otp_code" violates not-null constraint`
- **Fix**: Make nullable (we don't store actual OTP for security)

### Issue 2: audit_logs.action  
- **Problem**: NOT NULL constraint but auditLogger doesn't provide 'action'
- **Error**: `null value in column "operation" violates not-null constraint`  
- **Fix**: Make 'action' nullable OR provide default value

### Issue 3: rate_limits.key
- **Problem**: Missing column that rate limiter code expects
- **Error**: `column rate_limits.key does not exist`
- **Fix**: Add 'key' column to rate_limits table

### Issue 4: Missing columns in otp_verifications:
- `verification_attempts` - code expects this field
- `external_service` - code inserts this field
- `reference_code` - code inserts this field

### Issue 5: Missing columns in audit_logs:
- All the fields from auditLogger analysis above

## 📋 Comprehensive Fix Strategy:

1. **Make otp_code nullable in otp_verifications**
2. **Make action nullable in audit_logs (or add 'operation' mapping)**
3. **Add rate_limits.key column**
4. **Add missing columns with proper defaults**
5. **Ensure all indexes are present for performance**

## 🎯 Next Steps:

1. Run the database analysis SQL to confirm current schema
2. Compare with this analysis
3. Create targeted fix script
4. Test thoroughly

-- 🎯 FINAL COMPREHENSIVE DATABASE FIX
-- Based on complete schema analysis and Edge Function code review
-- Run this ONCE in Supabase SQL Editor to fix ALL issues

-- =================================================================
-- 1. FIX OTP_VERIFICATIONS TABLE ISSUES
-- =================================================================

-- Make otp_code nullable (Edge Functions don't provide actual OTP for security)
DO $$
BEGIN
    -- Check if otp_code exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'otp_verifications' 
        AND column_name = 'otp_code'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.otp_verifications ALTER COLUMN otp_code DROP NOT NULL;
        RAISE NOTICE '✅ Made otp_code nullable in otp_verifications';
    END IF;
END $$;

-- Add missing columns that Edge Functions expect
ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS reference_code character varying(50) NULL;

ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS external_service character varying(50) NULL DEFAULT 'ants'::character varying;

ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS verification_attempts integer NULL DEFAULT 0;

-- Add verified_at column for successful verifications
ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone NULL;

-- =================================================================
-- 2. FIX AUDIT_LOGS TABLE ISSUES  
-- =================================================================

-- Make action nullable (auditLogger doesn't always provide this)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs' 
        AND column_name = 'action'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.audit_logs ALTER COLUMN action DROP NOT NULL;
        RAISE NOTICE '✅ Made action nullable in audit_logs';
    END IF;
END $$;

-- Add ALL missing columns that auditLogger expects
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS client_ip inet NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone NULL DEFAULT now();
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS event_type character varying(50) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS event_category character varying(50) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS severity character varying(20) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS request_id character varying(255) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS session_id character varying(255) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS event_data jsonb NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS message text NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS phone_number character varying(20) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS otp_id character varying(255) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS reference_code character varying(50) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS success boolean NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS response_time_ms integer NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS database_query_time_ms integer NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS error_code character varying(50) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS error_message text NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS stack_trace text NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS service_name character varying(100) NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS service_version character varying(20) NULL;

-- =================================================================
-- 3. FIX RATE_LIMITS TABLE ISSUES
-- =================================================================

-- Add missing 'key' column that rate limiter expects
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS key character varying(255) NULL;

-- Generate keys for existing records (if any)
UPDATE public.rate_limits 
SET key = identifier || '_' || action 
WHERE key IS NULL;

-- =================================================================
-- 4. CREATE OPTIMIZED INDEXES
-- =================================================================

-- OTP Verifications indexes
CREATE INDEX IF NOT EXISTS idx_otp_reference_code 
ON public.otp_verifications USING btree (reference_code);

CREATE INDEX IF NOT EXISTS idx_otp_external_service 
ON public.otp_verifications USING btree (external_service);

CREATE INDEX IF NOT EXISTS idx_otp_verification_attempts 
ON public.otp_verifications USING btree (verification_attempts);

CREATE INDEX IF NOT EXISTS idx_otp_verified_at 
ON public.otp_verifications USING btree (verified_at);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_client_ip 
ON public.audit_logs USING btree (client_ip);

CREATE INDEX IF NOT EXISTS idx_audit_event_type 
ON public.audit_logs USING btree (event_type);

CREATE INDEX IF NOT EXISTS idx_audit_severity 
ON public.audit_logs USING btree (severity);

CREATE INDEX IF NOT EXISTS idx_audit_request_id 
ON public.audit_logs USING btree (request_id);

CREATE INDEX IF NOT EXISTS idx_audit_otp_id 
ON public.audit_logs USING btree (otp_id);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp 
ON public.audit_logs USING btree (timestamp);

-- Rate Limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_key 
ON public.rate_limits USING btree (key);

-- =================================================================
-- 5. VERIFY ALL FIXES
-- =================================================================

-- Check otp_verifications columns
SELECT 
    '🔍 otp_verifications columns:' as status,
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'otp_verifications'
AND column_name IN ('otp_code', 'reference_code', 'external_service', 'verification_attempts', 'verified_at')
ORDER BY column_name;

-- Check audit_logs columns
SELECT 
    '🔍 audit_logs columns:' as status,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'audit_logs'
AND column_name IN ('action', 'client_ip', 'database_query_time_ms', 'event_type', 'phone_number')
ORDER BY column_name;

-- Check rate_limits columns
SELECT 
    '🔍 rate_limits columns:' as status,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rate_limits'
AND column_name IN ('key', 'identifier', 'action')
ORDER BY column_name;

-- Final summary
SELECT 
    '✅ SUMMARY:' as fix_status,
    'otp_verifications has ' || count(*) || ' columns' as details
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'otp_verifications'

UNION ALL

SELECT 
    '✅ SUMMARY:' as fix_status,
    'audit_logs has ' || count(*) || ' columns' as details
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'audit_logs'

UNION ALL

SELECT 
    '✅ SUMMARY:' as fix_status,
    'rate_limits has ' || count(*) || ' columns' as details
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'rate_limits';

-- =================================================================
-- 🎉 ALL FIXES COMPLETE!
-- Now test your OTP system - it should work perfectly!
-- =================================================================
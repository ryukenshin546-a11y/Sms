-- Fix remaining database issues for OTP system
-- Run this on Supabase SQL Editor AFTER the previous fix

-- 1. Fix audit_logs table - make operation nullable or set default
DO $$
BEGIN
    -- Check if operation column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs' 
        AND column_name = 'action'
        AND is_nullable = 'NO'
    ) THEN
        -- Make operation nullable since Edge Functions don't always provide it
        ALTER TABLE public.audit_logs ALTER COLUMN action DROP NOT NULL;
    END IF;
    
    -- Add operation column if it doesn't exist (some audit logs might expect this)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'operation') THEN
        ALTER TABLE public.audit_logs ADD COLUMN operation character varying(100) NULL;
    END IF;
END $$;

-- 2. Fix otp_verifications table - make otp_code nullable since we don't store the actual OTP
ALTER TABLE public.otp_verifications ALTER COLUMN otp_code DROP NOT NULL;

-- 3. Fix rate_limits table - add missing 'key' column
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS key character varying(255) NULL;

-- Add index for the key column
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits USING btree (key) TABLESPACE pg_default;

-- 4. Update existing rate_limits records to have a proper key
UPDATE public.rate_limits 
SET key = identifier || '_' || action 
WHERE key IS NULL;

-- 5. Verify the fixes
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'audit_logs'
AND column_name IN ('action', 'operation')
ORDER BY column_name;

SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'otp_verifications'
AND column_name = 'otp_code';

SELECT 
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rate_limits'
AND column_name IN ('key', 'identifier', 'action')
ORDER BY column_name;

-- 6. Show current table constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('audit_logs', 'otp_verifications', 'rate_limits')
AND tc.constraint_type = 'NOT NULL'
ORDER BY tc.table_name, kcu.column_name;
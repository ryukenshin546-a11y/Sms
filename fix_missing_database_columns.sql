-- Fix missing database columns for OTP and Audit systems
-- Run this on Supabase SQL Editor

-- 1. Add ALL missing columns to otp_verifications table
ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS reference_code character varying(50) NULL;

ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS external_service character varying(50) NULL DEFAULT 'ants'::character varying;

ALTER TABLE public.otp_verifications 
ADD COLUMN IF NOT EXISTS verification_attempts integer NULL DEFAULT 0;

-- Add indexes for otp_verifications
CREATE INDEX IF NOT EXISTS idx_otp_reference_code 
ON public.otp_verifications USING btree (reference_code) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_otp_external_service 
ON public.otp_verifications USING btree (external_service) TABLESPACE pg_default;

-- 2. Check if audit_logs table exists and add ALL missing columns
DO $$
BEGIN
    -- Check if audit_logs table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        -- Add client_ip column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'client_ip') THEN
            ALTER TABLE public.audit_logs ADD COLUMN client_ip inet NULL;
        END IF;
        
        -- Add database_query_time_ms column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'database_query_time_ms') THEN
            ALTER TABLE public.audit_logs ADD COLUMN database_query_time_ms integer NULL;
        END IF;
        
        -- Add other audit columns that might be missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'timestamp') THEN
            ALTER TABLE public.audit_logs ADD COLUMN timestamp timestamp with time zone NULL DEFAULT now();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'event_type') THEN
            ALTER TABLE public.audit_logs ADD COLUMN event_type character varying(50) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'event_category') THEN
            ALTER TABLE public.audit_logs ADD COLUMN event_category character varying(50) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'severity') THEN
            ALTER TABLE public.audit_logs ADD COLUMN severity character varying(20) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'request_id') THEN
            ALTER TABLE public.audit_logs ADD COLUMN request_id character varying(255) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'session_id') THEN
            ALTER TABLE public.audit_logs ADD COLUMN session_id character varying(255) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'event_data') THEN
            ALTER TABLE public.audit_logs ADD COLUMN event_data jsonb NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'message') THEN
            ALTER TABLE public.audit_logs ADD COLUMN message text NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'phone_number') THEN
            ALTER TABLE public.audit_logs ADD COLUMN phone_number character varying(20) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'otp_id') THEN
            ALTER TABLE public.audit_logs ADD COLUMN otp_id character varying(255) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'reference_code') THEN
            ALTER TABLE public.audit_logs ADD COLUMN reference_code character varying(50) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'success') THEN
            ALTER TABLE public.audit_logs ADD COLUMN success boolean NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'response_time_ms') THEN
            ALTER TABLE public.audit_logs ADD COLUMN response_time_ms integer NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'error_code') THEN
            ALTER TABLE public.audit_logs ADD COLUMN error_code character varying(50) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'error_message') THEN
            ALTER TABLE public.audit_logs ADD COLUMN error_message text NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'stack_trace') THEN
            ALTER TABLE public.audit_logs ADD COLUMN stack_trace text NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'service_name') THEN
            ALTER TABLE public.audit_logs ADD COLUMN service_name character varying(100) NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'service_version') THEN
            ALTER TABLE public.audit_logs ADD COLUMN service_version character varying(20) NULL;
        END IF;
        
        -- Add indexes for audit_logs
        CREATE INDEX IF NOT EXISTS idx_audit_client_ip ON public.audit_logs USING btree (client_ip) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs USING btree (event_type) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_severity ON public.audit_logs USING btree (severity) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_request_id ON public.audit_logs USING btree (request_id) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_otp_id ON public.audit_logs USING btree (otp_id) TABLESPACE pg_default;
        
    ELSE
        -- Create complete audit_logs table if it doesn't exist
        CREATE TABLE public.audit_logs (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            user_id uuid NULL,
            action character varying(100) NOT NULL,
            table_name character varying(100) NULL,
            record_id character varying(255) NULL,
            old_values jsonb NULL,
            new_values jsonb NULL,
            client_ip inet NULL,
            user_agent text NULL,
            timestamp timestamp with time zone NULL DEFAULT now(),
            event_type character varying(50) NULL,
            event_category character varying(50) NULL,
            severity character varying(20) NULL,
            request_id character varying(255) NULL,
            session_id character varying(255) NULL,
            event_data jsonb NULL,
            message text NULL,
            phone_number character varying(20) NULL,
            otp_id character varying(255) NULL,
            reference_code character varying(50) NULL,
            success boolean NULL,
            response_time_ms integer NULL,
            database_query_time_ms integer NULL,
            error_code character varying(50) NULL,
            error_message text NULL,
            stack_trace text NULL,
            service_name character varying(100) NULL,
            service_version character varying(20) NULL,
            created_at timestamp with time zone NULL DEFAULT now(),
            CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
        ) TABLESPACE pg_default;
        
        -- Create indexes for audit_logs
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs USING btree (user_id) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs USING btree (action) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_table_name ON public.audit_logs USING btree (table_name) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_client_ip ON public.audit_logs USING btree (client_ip) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs USING btree (event_type) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_severity ON public.audit_logs USING btree (severity) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_request_id ON public.audit_logs USING btree (request_id) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_otp_id ON public.audit_logs USING btree (otp_id) TABLESPACE pg_default;
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs USING btree (created_at) TABLESPACE pg_default;
    END IF;
END $$;

-- 3. Create rate_limits table if missing
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    identifier character varying(255) NOT NULL, -- IP address, user_id, etc.
    action character varying(100) NOT NULL, -- 'otp_send', 'otp_verify', etc.
    requests integer NOT NULL DEFAULT 1,
    window_start timestamp with time zone NOT NULL DEFAULT now(),
    window_duration_minutes integer NOT NULL DEFAULT 60,
    max_requests integer NOT NULL DEFAULT 5,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT rate_limits_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Add indexes for rate_limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits USING btree (identifier) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON public.rate_limits USING btree (action) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits USING btree (window_start) TABLESPACE pg_default;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique ON public.rate_limits USING btree (identifier, action, window_start) TABLESPACE pg_default;

-- 4. Update existing otp_verifications records to set defaults
UPDATE public.otp_verifications 
SET external_service = 'ants' 
WHERE external_service IS NULL;

UPDATE public.otp_verifications 
SET verification_attempts = 0 
WHERE verification_attempts IS NULL;

-- 5. Clean up expired OTP sessions (this might help with the lookup issue)
DELETE FROM public.otp_verifications 
WHERE expires_at < now() - INTERVAL '1 hour';

-- 6. Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'otp_verifications'
AND column_name IN ('reference_code', 'external_service', 'verification_attempts')
ORDER BY column_name;

-- Check audit_logs columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'audit_logs'
AND column_name IN ('client_ip', 'database_query_time_ms', 'event_type', 'phone_number')
ORDER BY column_name;

-- Check rate_limits table exists
SELECT 
    'Rate limits table exists with ' || count(*) || ' columns' as rate_limits_status
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'rate_limits';

-- Show table structure summary
SELECT 
    'OTP Verifications table has ' || count(*) || ' columns' as summary
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'otp_verifications'

UNION ALL

SELECT 
    'Audit Logs table has ' || count(*) || ' columns' as summary
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'audit_logs';

-- Show recent OTP sessions (for debugging)
SELECT 
    id,
    phone_number,
    formatted_phone,
    external_otp_id,
    reference_code,
    status,
    expires_at,
    created_at
FROM public.otp_verifications 
ORDER BY created_at DESC 
LIMIT 5;
-- Migration: Add missing fields to audit_logs table
-- Date: September 14, 2025

-- Add phone_number field for OTP operations
ALTER TABLE public.audit_logs 
ADD COLUMN phone_number CHARACTER VARYING(20) NULL;

-- Add reference_code field for OTP tracking
ALTER TABLE public.audit_logs 
ADD COLUMN reference_code CHARACTER VARYING(50) NULL;

-- Add otp_id field for OTP session tracking
ALTER TABLE public.audit_logs 
ADD COLUMN otp_id UUID NULL;

-- Add success field for operation status
ALTER TABLE public.audit_logs 
ADD COLUMN success BOOLEAN NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_audit_logs_phone_number ON public.audit_logs USING btree (phone_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_reference_code ON public.audit_logs USING btree (reference_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_otp_id ON public.audit_logs USING btree (otp_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON public.audit_logs USING btree (success);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_phone_time ON public.audit_logs USING btree (phone_number, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_otp_time ON public.audit_logs USING btree (otp_id, "timestamp" DESC);

-- Update event_type constraints to include new types
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_event_type_check;

ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_event_type_check CHECK (
  (event_type)::text = ANY (
    ARRAY[
      'otp_send'::character varying,
      'otp_verify'::character varying,
      'otp_resend'::character varying,
      'rate_limit'::character varying,
      'rate_limit_exceeded'::character varying,
      'system_error'::character varying,
      'security_event'::character varying,
      'performance_metric'::character varying,
      'user_action'::character varying
    ]::text[]
  )
);

-- Add comment for documentation
COMMENT ON COLUMN public.audit_logs.phone_number IS 'Masked phone number for OTP operations';
COMMENT ON COLUMN public.audit_logs.reference_code IS 'OTP reference code for user identification';
COMMENT ON COLUMN public.audit_logs.otp_id IS 'UUID linking to OTP session';
COMMENT ON COLUMN public.audit_logs.success IS 'Operation success status';
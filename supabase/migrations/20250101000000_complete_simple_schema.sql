-- Complete Simple Database Schema Migration
-- Created: January 2025
-- Purpose: Create all necessary tables for SMS OTP system without FK constraint issues

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===================================
-- 1. System Settings Table
-- ===================================

CREATE TABLE IF NOT EXISTS system_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key character varying(100) UNIQUE NOT NULL,
    setting_value text NOT NULL,
    setting_type character varying(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'integer', 'boolean', 'json')),
    description text,
    is_public boolean DEFAULT false,
    is_editable boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- 2. Profiles Table (User Management)
-- ===================================

CREATE TABLE IF NOT EXISTS profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username character varying(50) UNIQUE,
    email character varying(255) UNIQUE,
    full_name character varying(100),
    phone_number character varying(20),
    
    -- Role and Status
    role character varying(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'corporate')),
    status character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    account_type character varying(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'corporate')),
    
    -- Verification Status
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    phone_verified_at timestamp with time zone,
    
    -- Corporate Info (for corporate accounts)
    company_name character varying(200),
    company_tax_id character varying(50),
    company_address text,
    
    -- Credits and Usage
    credit_balance integer DEFAULT 0,
    sms_generated boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_login_at timestamp with time zone,
    
    -- Metadata
    metadata jsonb DEFAULT '{}'::jsonb
);

-- ===================================
-- 3. OTP Verifications Table
-- ===================================

CREATE TABLE IF NOT EXISTS otp_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Phone Number Information
    phone_number character varying(20) NOT NULL,
    formatted_phone character varying(25) NOT NULL,
    country_code character varying(5) DEFAULT '+66',
    
    -- OTP Information
    otp_code character varying(10) NOT NULL,
    otp_length integer DEFAULT 6 CHECK (otp_length BETWEEN 4 AND 10),
    
    -- External Service Integration
    external_otp_id character varying(255), -- SMS service provider OTP ID
    service_provider character varying(50) DEFAULT 'ants',
    service_response jsonb DEFAULT '{}'::jsonb,
    
    -- Status and Timing
    status character varying(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'verified', 'expired', 'failed', 'cancelled')
    ),
    expires_at timestamp with time zone DEFAULT (now() + interval '10 minutes'),
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 5,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- User Association (optional)
    user_id uuid, -- Will reference profiles.id
    session_token character varying(255), -- For anonymous verification
    
    -- Metadata
    ip_address inet,
    user_agent text,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- ===================================
-- 4. Verified Phone Numbers Registry
-- ===================================

CREATE TABLE IF NOT EXISTS verified_phone_numbers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number character varying(20) NOT NULL,
    formatted_phone character varying(25) NOT NULL UNIQUE,
    country_code character varying(5) DEFAULT '+66',
    
    -- Verification Info
    verified_at timestamp with time zone DEFAULT now(),
    verification_method character varying(20) DEFAULT 'sms_otp',
    otp_verification_id uuid, -- Will reference otp_verifications.id
    
    -- User Association
    user_id uuid, -- Will reference profiles.id
    
    -- Status Management
    status character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    blocked_reason text,
    blocked_at timestamp with time zone,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone
);

-- ===================================
-- 5. OTP Service Tokens
-- ===================================

CREATE TABLE IF NOT EXISTS otp_service_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name character varying(50) NOT NULL DEFAULT 'ants',
    
    -- Token Information
    access_token text NOT NULL,
    token_type character varying(20) DEFAULT 'Bearer',
    expires_at timestamp with time zone,
    
    -- Refresh Token (if supported)
    refresh_token text,
    refresh_expires_at timestamp with time zone,
    
    -- Service Configuration
    base_url character varying(255) DEFAULT 'https://web.smsup-plus.com',
    api_username character varying(100),
    otc_id character varying(255), -- ANTS OTC ID
    
    -- Status
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone
);

-- ===================================
-- 6. SMS Accounts Management
-- ===================================

CREATE TABLE IF NOT EXISTS sms_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, -- Will reference profiles.id
    
    -- Account Information
    account_name character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    formatted_phone character varying(25) NOT NULL,
    country_code character varying(5) DEFAULT '+66',
    
    -- Service Configuration
    service_provider character varying(50) DEFAULT 'ants',
    api_credentials jsonb DEFAULT '{}'::jsonb,
    
    -- Status and Usage
    status character varying(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    balance_credits integer DEFAULT 0,
    usage_count integer DEFAULT 0,
    last_used_at timestamp with time zone,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===================================
-- 7. Audit Logs System
-- ===================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Operation Details
    operation character varying(50) NOT NULL,
    table_name character varying(50),
    record_id uuid,
    
    -- User Context
    user_id uuid,
    user_email character varying(255),
    user_role character varying(20),
    
    -- Request Context
    ip_address inet,
    user_agent text,
    session_id character varying(255),
    
    -- Changes
    old_values jsonb,
    new_values jsonb,
    changes jsonb,
    
    -- Status and Outcome
    success boolean DEFAULT true,
    error_message text,
    duration_ms integer,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    
    -- Security Classification
    security_level character varying(20) DEFAULT 'normal' CHECK (
        security_level IN ('low', 'normal', 'high', 'critical')
    )
);

-- ===================================
-- 8. Performance Metrics
-- ===================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Metric Information
    metric_name character varying(100) NOT NULL,
    metric_type character varying(50) NOT NULL,
    metric_value numeric NOT NULL,
    
    -- Context
    operation character varying(100),
    table_name character varying(50),
    user_id uuid,
    
    -- Performance Details
    duration_ms integer,
    memory_usage_mb numeric,
    cpu_usage_percent numeric,
    
    -- Request Context
    ip_address inet,
    user_agent text,
    
    -- Timestamp
    created_at timestamp with time zone DEFAULT now(),
    
    -- Additional Data
    metadata jsonb DEFAULT '{}'::jsonb
);

-- ===================================
-- 9. Create Basic Indexes (Performance)
-- ===================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- OTP Verifications indexes
CREATE INDEX IF NOT EXISTS idx_otp_phone_number ON otp_verifications(formatted_phone);
CREATE INDEX IF NOT EXISTS idx_otp_status ON otp_verifications(status);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_external_id ON otp_verifications(external_otp_id);

-- Verified Phone Numbers indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_verified_phone ON verified_phone_numbers(formatted_phone) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_verified_phone_user ON verified_phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_verified_phone_status ON verified_phone_numbers(status);

-- Service Tokens indexes
CREATE INDEX IF NOT EXISTS idx_otp_tokens_service ON otp_service_tokens(service_name);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_active ON otp_service_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires ON otp_service_tokens(expires_at);

-- SMS Accounts indexes
CREATE INDEX IF NOT EXISTS idx_sms_accounts_user_id ON sms_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_accounts_phone ON sms_accounts(formatted_phone);
CREATE INDEX IF NOT EXISTS idx_sms_accounts_status ON sms_accounts(status);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_security_level ON audit_logs(security_level);

-- Performance Metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);

-- ===================================
-- 10. Enable Row Level Security
-- ===================================

-- Enable RLS on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_service_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 11. Basic RLS Policies
-- ===================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- OTP Verifications policies
CREATE POLICY "Users can view their own OTP verifications" ON otp_verifications
    FOR SELECT USING (
        user_id = auth.uid() OR 
        session_token IS NOT NULL
    );

CREATE POLICY "Users can insert their own OTP verifications" ON otp_verifications
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        user_id IS NULL
    );

CREATE POLICY "Users can update their own OTP verifications" ON otp_verifications
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        session_token IS NOT NULL
    );

-- Verified Phone Numbers policies
CREATE POLICY "Users can view their own verified phone numbers" ON verified_phone_numbers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own verified phone numbers" ON verified_phone_numbers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- SMS Accounts policies
CREATE POLICY "Users can view their own SMS accounts" ON sms_accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own SMS accounts" ON sms_accounts
    FOR ALL USING (user_id = auth.uid());

-- Service Tokens (Admin only)
CREATE POLICY "Only service can access OTP tokens" ON otp_service_tokens
    FOR ALL USING (false); -- Only server-side functions can access

-- Audit Logs (Read-only for users, admin can see all)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- ===================================
-- 12. Utility Functions
-- ===================================

-- Function to clean up expired OTP verifications
CREATE OR REPLACE FUNCTION cleanup_expired_otp_verifications()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- Delete expired OTP verifications older than 1 hour
    DELETE FROM otp_verifications 
    WHERE expires_at < (now() - interval '1 hour')
    AND status IN ('pending', 'sent', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if phone number is already verified
CREATE OR REPLACE FUNCTION is_phone_verified(phone_input text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM verified_phone_numbers 
        WHERE formatted_phone = phone_input 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to format phone number
CREATE OR REPLACE FUNCTION format_phone_number(phone_input text, country_code_input text DEFAULT '+66')
RETURNS text AS $$
DECLARE
    formatted text;
BEGIN
    -- Remove all non-digit characters
    formatted := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Handle Thai phone numbers
    IF country_code_input = '+66' THEN
        -- Remove leading 0 if present
        IF left(formatted, 1) = '0' THEN
            formatted := substring(formatted from 2);
        END IF;
        -- Add country code
        formatted := '66' || formatted;
    END IF;
    
    RETURN formatted;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===================================
-- 13. Update Triggers
-- ===================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_verifications_updated_at 
    BEFORE UPDATE ON otp_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verified_phone_numbers_updated_at 
    BEFORE UPDATE ON verified_phone_numbers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_service_tokens_updated_at 
    BEFORE UPDATE ON otp_service_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_accounts_updated_at 
    BEFORE UPDATE ON sms_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 14. Default System Configuration
-- ===================================

-- Insert default system settings for OTP
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, is_editable)
VALUES 
    ('otp_expiry_minutes', '10', 'integer', 'OTP expiration time in minutes', false, true),
    ('otp_max_attempts', '5', 'integer', 'Maximum OTP verification attempts', false, true),
    ('otp_resend_cooldown_seconds', '60', 'integer', 'Cooldown time between OTP resends', false, true),
    ('otp_service_provider', 'ants', 'string', 'Default OTP service provider', false, true),
    ('phone_verification_required', 'true', 'boolean', 'Require phone verification for registration', false, true),
    ('otp_code_length', '6', 'integer', 'Default OTP code length', false, true),
    ('rate_limit_per_hour', '10', 'integer', 'Maximum OTP requests per hour per phone', false, true),
    ('cleanup_expired_otps_hours', '24', 'integer', 'Hours to keep expired OTP records', false, true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default ANTS OTP service configuration
INSERT INTO otp_service_tokens (
    service_name,
    base_url,
    api_username,
    otc_id,
    access_token,
    is_active
) VALUES (
    'ants',
    'https://web.smsup-plus.com',
    'Landingpage',
    '184c870e-ce42-4c7c-961f-9854d13d0ada',
    'placeholder_token_will_be_updated',
    false
) ON CONFLICT DO NOTHING;

-- Migration completed successfully
-- All tables created without FK constraint dependencies
-- Ready for database reset and performance optimizations
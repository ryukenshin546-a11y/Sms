-- Complete SMS System Schema
-- Version: 3.0 - Simplified and Fixed
-- Date: September 14, 2025
-- Purpose: Create all necessary tables without FK constraint issues

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. PROFILES TABLE (Base User System)
-- ===================================

CREATE TABLE IF NOT EXISTS profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username varchar(50) UNIQUE,
    email varchar(255) UNIQUE,
    full_name varchar(100),
    phone_number varchar(20),
    
    -- User role and status
    role varchar(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'corporate')),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    account_type varchar(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'corporate')),
    
    -- Verification flags
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    
    -- Corporate account info
    company_name varchar(200),
    company_tax_id varchar(50),
    company_address text,
    
    -- Usage and credits
    credit_balance integer DEFAULT 0,
    sms_generated boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    last_login_at timestamptz,
    
    -- Metadata
    metadata jsonb DEFAULT '{}'
);

-- ===================================
-- 2. OTP VERIFICATIONS TABLE (Main OTP System)
-- ===================================

CREATE TABLE IF NOT EXISTS otp_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number varchar(20) NOT NULL,
    country_code varchar(5) DEFAULT '+66',
    formatted_phone varchar(25) NOT NULL,
    
    -- OTP Details
    otp_code varchar(10),
    reference_code varchar(50),
    external_otp_id varchar(255),
    external_reference varchar(100),
    
    -- Status and attempts
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'verified', 'failed', 'expired')),
    verification_attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 5,
    
    -- Service integration
    external_service varchar(50) DEFAULT 'sms_up_plus',
    
    -- Timing
    expires_at timestamptz DEFAULT (NOW() + INTERVAL '10 minutes'),
    verified_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    
    -- User association (nullable for now)
    user_id uuid,
    session_token varchar(255),
    
    -- Request context
    ip_address inet,
    user_agent text,
    metadata jsonb DEFAULT '{}'
);

-- ===================================
-- 3. VERIFIED PHONE NUMBERS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS verified_phone_numbers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number varchar(20) NOT NULL,
    formatted_phone varchar(25) NOT NULL UNIQUE,
    country_code varchar(5) DEFAULT '+66',
    
    -- Verification info
    verified_at timestamptz DEFAULT NOW(),
    verification_method varchar(20) DEFAULT 'sms_otp',
    
    -- User association (nullable for now)
    user_id uuid,
    
    -- Status
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    blocked_reason text,
    blocked_at timestamptz,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    last_used_at timestamptz
);

-- ===================================
-- 4. SMS ACCOUNTS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS sms_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid, -- Will add FK later
    
    -- Account details
    account_name varchar(100) NOT NULL,
    phone_number varchar(20) NOT NULL,
    provider varchar(50) DEFAULT 'sms_up_plus',
    
    -- Status
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'expired')),
    auto_renewal boolean DEFAULT false,
    
    -- Usage tracking
    total_sms_sent integer DEFAULT 0,
    monthly_limit integer DEFAULT 1000,
    current_month_usage integer DEFAULT 0,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    expires_at timestamptz,
    last_used_at timestamptz,
    
    -- Settings
    settings jsonb DEFAULT '{}'
);

-- ===================================
-- 5. AUDIT LOGS TABLE (System Events)
-- ===================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp timestamptz DEFAULT NOW(),
    
    -- Event classification
    event_type varchar(50) NOT NULL,
    event_category varchar(30) NOT NULL DEFAULT 'general',
    severity varchar(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
    
    -- Request context
    client_ip varchar(45),
    user_agent text,
    request_id varchar(100),
    session_id uuid,
    
    -- Event data
    event_data jsonb DEFAULT '{}',
    message text NOT NULL,
    
    -- Service context
    service_name varchar(50) DEFAULT 'otp-system',
    service_version varchar(20) DEFAULT '1.0',
    
    -- Performance data
    response_time_ms integer,
    database_query_time_ms integer,
    
    -- Error details
    error_code varchar(50),
    error_message text,
    stack_trace text,
    
    created_at timestamptz DEFAULT NOW()
);

-- ===================================
-- 6. PERFORMANCE METRICS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp timestamptz DEFAULT NOW(),
    
    -- Service identification
    service_name varchar(50) NOT NULL,
    operation varchar(100) NOT NULL,
    
    -- Performance data
    response_time_ms integer NOT NULL,
    database_query_time_ms integer,
    api_call_time_ms integer,
    
    -- Request context
    client_ip varchar(45),
    request_id varchar(100),
    
    -- Result
    success boolean DEFAULT true,
    error_code varchar(50),
    
    -- Additional metrics
    metrics_data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT NOW()
);

-- ===================================
-- 7. RATE LIMITS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key varchar(255) NOT NULL,
    timestamp timestamptz DEFAULT NOW(),
    request_count integer DEFAULT 1,
    
    -- Window management
    window_start timestamptz DEFAULT NOW(),
    window_duration_seconds integer DEFAULT 3600, -- 1 hour default
    
    created_at timestamptz DEFAULT NOW()
);

-- ===================================
-- 8. ACTIVITY LOGS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid, -- Will add FK later
    
    -- Activity details
    action varchar(100) NOT NULL,
    description text,
    category varchar(50) DEFAULT 'general',
    
    -- Context
    ip_address inet,
    user_agent text,
    
    -- Timestamp
    created_at timestamptz DEFAULT NOW(),
    
    -- Metadata
    metadata jsonb DEFAULT '{}'
);

-- ===================================
-- 9. SMS ACCOUNT LOGS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS sms_account_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sms_account_id uuid, -- Will add FK later
    
    -- Log details
    action varchar(50) NOT NULL,
    description text,
    old_status varchar(20),
    new_status varchar(20),
    
    -- Context
    performed_by uuid, -- Will add FK later
    ip_address inet,
    user_agent text,
    
    -- Timestamp
    created_at timestamptz DEFAULT NOW(),
    
    -- Metadata
    metadata jsonb DEFAULT '{}'
);

-- ===================================
-- 10. BASIC INDEXES FOR PERFORMANCE
-- ===================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- OTP Verifications indexes
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON otp_verifications(formatted_phone);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_status ON otp_verifications(status);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_external_id ON otp_verifications(external_otp_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_created_at ON otp_verifications(created_at DESC);

-- Verified phone numbers indexes
CREATE INDEX IF NOT EXISTS idx_verified_phone_formatted ON verified_phone_numbers(formatted_phone);
CREATE INDEX IF NOT EXISTS idx_verified_phone_status ON verified_phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_verified_phone_user_id ON verified_phone_numbers(user_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON performance_metrics(service_name, operation);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_timestamp ON rate_limits(key, timestamp DESC);

-- SMS accounts indexes
CREATE INDEX IF NOT EXISTS idx_sms_accounts_profile_id ON sms_accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_sms_accounts_status ON sms_accounts(status);

-- ===================================
-- 11. ROW LEVEL SECURITY (RLS) SETUP
-- ===================================

-- Enable RLS on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (service role access)
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON otp_verifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON verified_phone_numbers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON sms_accounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON performance_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rate_limits FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ===================================
-- 12. SUCCESS VERIFICATION
-- ===================================

SELECT 
    'MIGRATION COMPLETED' as status,
    COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show created tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as columns
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
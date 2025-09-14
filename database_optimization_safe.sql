-- Safe Database Optimization Script
-- Phase 5.1: Database Optimization and Caching - SAFE VERSION
-- Created: September 14, 2025
-- This script checks for existing tables before creating indexes

-- ===========================
-- SAFETY CHECKS & TABLE CREATION
-- ===========================

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION create_performance_indexes()
RETURNS void AS $$
BEGIN
    -- Check and create indexes for otp_verifications (main table)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otp_verifications') THEN
        -- Performance indexes for existing otp_verifications table
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_status 
        ON otp_verifications (formatted_phone, status, expires_at);
        
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_created_at 
        ON otp_verifications (created_at DESC) 
        WHERE status IN ('pending', 'sent');
        
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_external_id_status 
        ON otp_verifications (external_otp_id, status);
        
        RAISE NOTICE '✅ Created indexes for otp_verifications table';
    END IF;
    
    -- Check and create indexes for audit_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_type 
        ON audit_logs (timestamp DESC, event_type);
        
        CREATE INDEX IF NOT EXISTS idx_audit_logs_phone_timestamp 
        ON audit_logs (phone_number, timestamp DESC);
        
        CREATE INDEX IF NOT EXISTS idx_audit_logs_success_timestamp 
        ON audit_logs (success, timestamp DESC);
        
        RAISE NOTICE '✅ Created indexes for audit_logs table';
    END IF;
    
    -- Check and create indexes for rate_limits
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        CREATE INDEX IF NOT EXISTS idx_rate_limits_key_active 
        ON rate_limits (key, updated_at) 
        WHERE expires_at > NOW();
        
        RAISE NOTICE '✅ Created indexes for rate_limits table';
    END IF;
    
    -- Check and create indexes for performance_metrics
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp 
        ON performance_metrics (timestamp DESC);
        
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_function_timestamp 
        ON performance_metrics (function_name, timestamp DESC);
        
        RAISE NOTICE '✅ Created indexes for performance_metrics table';
    END IF;
    
    -- Check and create indexes for verified_phone_numbers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verified_phone_numbers') THEN
        CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_status 
        ON verified_phone_numbers (status, created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_user_id 
        ON verified_phone_numbers (user_id, status);
        
        RAISE NOTICE '✅ Created indexes for verified_phone_numbers table';
    END IF;
    
    RAISE NOTICE '🎉 All performance indexes created successfully!';
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- PERFORMANCE VIEWS (SAFE)
-- ===========================

-- OTP Performance View (works with existing tables)
CREATE OR REPLACE VIEW otp_performance_overview AS
SELECT 
    'otp_verifications' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'verified') as verified_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as active_count,
    AVG(EXTRACT(EPOCH FROM (verified_at - created_at))) as avg_verification_time_seconds
FROM otp_verifications
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otp_verifications');

-- Performance monitoring view
CREATE OR REPLACE VIEW system_performance_summary AS
SELECT 
    'Database Performance Summary' as metric_type,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND idx_scan > 0) as used_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE schemaname = 'public') as total_tables,
    NOW() as last_updated;

-- ===========================
-- SAFE PERFORMANCE FUNCTIONS
-- ===========================

-- Function to get OTP statistics (safe version)
CREATE OR REPLACE FUNCTION get_safe_otp_performance_stats(
    time_range interval DEFAULT '24 hours'::interval
)
RETURNS TABLE(
    metric_name text,
    value numeric,
    unit text,
    table_source text
) AS $$
BEGIN
    -- Return stats from otp_verifications (main table)
    RETURN QUERY
    SELECT 
        'total_otp_requests'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE created_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'successful_verifications'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE status = 'verified'
    AND verified_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'failed_verifications'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE status = 'failed'
    AND updated_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'success_rate'::text,
        CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(*) FILTER (WHERE status = 'verified')::numeric / COUNT(*) * 100)
            ELSE 0 
        END,
        'percentage'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE created_at >= NOW() - time_range
    
    UNION ALL
    
    -- Add audit_logs stats if table exists
    SELECT 
        'audit_log_entries'::text,
        COALESCE((
            SELECT COUNT(*)::numeric 
            FROM audit_logs 
            WHERE timestamp >= NOW() - time_range
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs')
        ), 0),
        'entries'::text,
        'audit_logs'::text;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- SAFE CLEANUP FUNCTION
-- ===========================

CREATE OR REPLACE FUNCTION safe_cleanup_old_data()
RETURNS text AS $$
DECLARE
    cleanup_report text := '';
    deleted_count integer;
BEGIN
    -- Clean up expired OTP verifications (main table)
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 day' 
    AND status IN ('expired', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    cleanup_report := cleanup_report || format('Deleted %s expired OTP verifications. ', deleted_count);
    
    -- Clean up old audit logs (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DELETE FROM audit_logs 
        WHERE timestamp < NOW() - INTERVAL '30 days';
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        cleanup_report := cleanup_report || format('Deleted %s old audit logs. ', deleted_count);
    END IF;
    
    -- Clean up expired rate limits (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        DELETE FROM rate_limits 
        WHERE expires_at < NOW();
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        cleanup_report := cleanup_report || format('Deleted %s expired rate limits. ', deleted_count);
    END IF;
    
    -- Update statistics
    ANALYZE otp_verifications;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ANALYZE audit_logs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        ANALYZE rate_limits;
    END IF;
    
    cleanup_report := cleanup_report || 'Statistics updated successfully.';
    
    RETURN cleanup_report;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- EXECUTE SAFE OPTIMIZATION
-- ===========================

-- Run the safe optimization
SELECT create_performance_indexes();

-- Test performance stats
SELECT * FROM get_safe_otp_performance_stats('24 hours');

-- Show optimization results
SELECT 
    'Safe Database Optimization' as status,
    'COMPLETED' as result,
    NOW() as completed_at;

-- Show existing tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

RAISE NOTICE '🎉 Safe database optimization completed successfully!';
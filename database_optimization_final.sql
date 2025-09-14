-- FINAL CORRECTED DATABASE OPTIMIZATION SCRIPT
-- Phase 5.1: Database Optimization and Caching
-- Version: 2.0 - Corrected for Existing Schema
-- Created: September 14, 2025

-- ===========================
-- STEP 1: CREATE PERFORMANCE INDEXES
-- ===========================

-- Enhanced indexes for otp_verifications (main OTP table)
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_status_expires 
ON otp_verifications (formatted_phone, status, expires_at) 
WHERE status IN ('pending', 'sent');

CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_recent 
ON otp_verifications (formatted_phone, created_at DESC) 
WHERE status IN ('pending', 'sent', 'verified');

CREATE INDEX IF NOT EXISTS idx_otp_verifications_external_lookup
ON otp_verifications (external_otp_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_verification_attempts
ON otp_verifications (formatted_phone, verification_attempts, expires_at)
WHERE status != 'expired';

-- Enhanced indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_timestamp 
ON audit_logs (event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp 
ON audit_logs (severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_service_operation
ON audit_logs (service_name, event_type, timestamp DESC);

-- Enhanced indexes for performance_metrics  
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service_operation 
ON performance_metrics (service_name, operation, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time
ON performance_metrics (response_time_ms, timestamp DESC)
WHERE success = true;

-- Enhanced indexes for rate_limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_timestamp_active 
ON rate_limits (key, timestamp DESC);

-- Enhanced indexes for verified_phone_numbers
CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_lookup
ON verified_phone_numbers (formatted_phone, status)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_user_status
ON verified_phone_numbers (user_id, status, verified_at DESC)
WHERE user_id IS NOT NULL;

-- ===========================
-- STEP 2: CREATE PERFORMANCE VIEWS
-- ===========================

-- OTP Performance Overview
CREATE OR REPLACE VIEW otp_performance_overview AS
SELECT 
    'otp_verifications' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'verified') as verified_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as active_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (verified_at - created_at))), 2) as avg_verification_time_seconds
FROM otp_verifications;

-- System Performance Summary
CREATE OR REPLACE VIEW system_performance_summary AS
SELECT 
    'Database Performance Summary' as metric_type,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND idx_scan > 0) as used_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE schemaname = 'public') as total_tables,
    NOW() as last_updated;

-- ===========================
-- STEP 3: CREATE PERFORMANCE FUNCTIONS
-- ===========================

-- OTP Performance Statistics Function
CREATE OR REPLACE FUNCTION get_otp_performance_stats(
    time_range interval DEFAULT '24 hours'::interval
)
RETURNS TABLE(
    metric_name text,
    value numeric,
    unit text,
    source_table text
) AS $$
BEGIN
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
        'failed_attempts'::text,
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
            THEN ROUND((COUNT(*) FILTER (WHERE status = 'verified')::numeric / COUNT(*) * 100), 2)
            ELSE 0 
        END,
        'percentage'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE created_at >= NOW() - time_range;
END;
$$ LANGUAGE plpgsql;

-- Database Cleanup Function
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS text AS $$
DECLARE
    cleanup_report text := '';
    deleted_count integer;
BEGIN
    -- Clean up expired OTP verifications
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 day' 
    AND status IN ('expired', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    cleanup_report := cleanup_report || format('Deleted %s expired OTPs. ', deleted_count);
    
    -- Clean up old verified OTPs (keep for 7 days)
    DELETE FROM otp_verifications 
    WHERE status = 'verified' 
    AND verified_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    cleanup_report := cleanup_report || format('Deleted %s old verified OTPs. ', deleted_count);
    
    -- Clean up old audit logs (keep 30 days)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DELETE FROM audit_logs 
        WHERE timestamp < NOW() - INTERVAL '30 days';
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        cleanup_report := cleanup_report || format('Deleted %s old audit logs. ', deleted_count);
    END IF;
    
    -- Update statistics
    ANALYZE otp_verifications;
    ANALYZE verified_phone_numbers;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ANALYZE audit_logs;
    END IF;
    
    cleanup_report := cleanup_report || 'Statistics updated.';
    RETURN cleanup_report;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- STEP 4: VERIFICATION
-- ===========================

-- Test the performance function
SELECT 'PERFORMANCE TEST' as test_type, * FROM get_otp_performance_stats('1 hour');

-- Show performance overview
SELECT 'PERFORMANCE OVERVIEW' as test_type, * FROM otp_performance_overview;

-- Show system summary  
SELECT 'SYSTEM SUMMARY' as test_type, * FROM system_performance_summary;

-- Verify indexes were created
SELECT 
    'INDEX VERIFICATION' as test_type,
    COUNT(*) as total_new_indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%_performance%' 
OR indexname LIKE 'idx_%_phone_status%'
OR indexname LIKE 'idx_%_external_lookup%';

-- Final success message
SELECT 
    '🎉 DATABASE OPTIMIZATION COMPLETED' as status,
    'Phase 5.1 performance enhancements applied successfully' as message,
    NOW() as completed_at;

-- Success notices (as comments since RAISE NOTICE only works inside functions)
-- ✅ Database optimization completed successfully!
-- 📊 Performance indexes created for existing tables  
-- ⚡ Performance functions ready for use
-- 🧹 Cleanup procedures available

SELECT 'SUCCESS SUMMARY' as final_status, 'All optimizations applied successfully' as result;
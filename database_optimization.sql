-- Database Performance Optimization SQL
-- Phase 5.1: Database Optimization and Caching - CORRECTED VERSION
-- Created: September 14, 2025
-- Updated: Fixed to use existing database schema

-- ===========================
-- PERFORMANCE INDEXES FOR EXISTING TABLES
-- ===========================

-- OTP Verifications Table (main OTP table) - Enhanced indexes
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_status_expires 
ON otp_verifications (formatted_phone, status, expires_at) 
WHERE status IN ('pending', 'sent');

CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_recent 
ON otp_verifications (formatted_phone, created_at DESC) 
WHERE status IN ('pending', 'sent', 'verified');

CREATE INDEX IF NOT EXISTS idx_otp_verifications_external_lookup
ON otp_verifications (external_otp_id, status, expires_at);

-- Enhanced indexes for OTP verification performance  
CREATE INDEX IF NOT EXISTS idx_otp_verifications_verification_attempts
ON otp_verifications (formatted_phone, verification_attempts, expires_at)
WHERE status != 'expired';

CREATE INDEX IF NOT EXISTS idx_otp_verifications_session_token
ON otp_verifications (session_token, status)
WHERE session_token IS NOT NULL;

-- Audit Logs Table - Enhanced indexes for existing structure
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_timestamp 
ON audit_logs (event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_phone_timestamp 
ON audit_logs (event_data->>'phone_number', timestamp DESC)
WHERE event_data->>'phone_number' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp 
ON audit_logs (severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_service_operation
ON audit_logs (service_name, event_type, timestamp DESC);

-- Performance Metrics Table - Enhanced indexes for existing structure  
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service_operation 
ON performance_metrics (service_name, operation, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time
ON performance_metrics (response_time_ms, timestamp DESC)
WHERE success = true;

CREATE INDEX IF NOT EXISTS idx_performance_metrics_errors
ON performance_metrics (error_code, timestamp DESC)
WHERE success = false;

-- Rate Limits Table - Enhanced indexes for existing structure
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_timestamp_active 
ON rate_limits (key, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
ON rate_limits (timestamp)
WHERE timestamp < NOW() - INTERVAL '1 hour';

-- Verified Phone Numbers Table - Performance indexes
CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_lookup
ON verified_phone_numbers (formatted_phone, status)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_verified_phone_numbers_user_status
ON verified_phone_numbers (user_id, status, verified_at DESC)
WHERE user_id IS NOT NULL;

-- ===========================
-- PERFORMANCE VIEWS
-- ===========================

-- Query Performance Monitoring
CREATE OR REPLACE VIEW query_performance AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan > 0 THEN round((idx_tup_fetch::numeric / idx_scan), 2)
        ELSE 0 
    END as avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Table Usage Statistics
CREATE OR REPLACE VIEW table_usage_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Index Effectiveness Analysis
CREATE OR REPLACE VIEW index_effectiveness AS
SELECT 
    t.tablename,
    i.indexname,
    i.idx_scan,
    i.idx_tup_read,
    i.idx_tup_fetch,
    CASE 
        WHEN i.idx_scan > 0 
        THEN round((i.idx_tup_fetch::numeric / i.idx_scan), 2)
        ELSE 0 
    END as selectivity,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size
FROM pg_stat_user_indexes i
JOIN pg_stat_user_tables t ON i.relid = t.relid
WHERE t.schemaname = 'public'
ORDER BY i.idx_scan DESC;

-- ===========================
-- PERFORMANCE FUNCTIONS
-- ===========================

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE(
    table_name text,
    total_size text,
    index_usage_ratio numeric,
    suggestion text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        pg_size_pretty(pg_total_relation_size(c.oid))::text as total_size,
        CASE 
            WHEN t.seq_scan + t.idx_scan > 0 
            THEN round((t.idx_scan::numeric / (t.seq_scan + t.idx_scan)) * 100, 2)
            ELSE 0 
        END as index_usage_ratio,
        CASE 
            WHEN t.seq_scan > t.idx_scan THEN 'Consider adding indexes'
            WHEN t.n_dead_tup > t.n_live_tup * 0.1 THEN 'Consider running VACUUM'
            ELSE 'Performance looks good'
        END::text as suggestion
    FROM pg_stat_user_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get OTP performance stats (updated for real schema)
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
    -- Stats from otp_verifications (main OTP table)
    SELECT 
        'total_otp_requests'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE created_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'successful_otp_verifications'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE status = 'verified'
    AND verified_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'failed_otp_attempts'::text,
        COUNT(*)::numeric,
        'requests'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE status = 'failed'
    AND updated_at >= NOW() - time_range
    
    UNION ALL
    
    SELECT 
        'average_verification_time'::text,
        COALESCE(AVG(EXTRACT(EPOCH FROM (verified_at - created_at))), 0)::numeric,
        'seconds'::text,
        'otp_verifications'::text
    FROM otp_verifications 
    WHERE status = 'verified' 
    AND verified_at >= NOW() - time_range
    AND verified_at IS NOT NULL
    
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
    
    -- Stats from audit_logs if available
    SELECT 
        'average_response_time'::text,
        COALESCE(AVG(response_time_ms), 0)::numeric,
        'milliseconds'::text,
        'audit_logs'::text
    FROM audit_logs 
    WHERE event_type IN ('otp_send', 'otp_verify')
    AND timestamp >= NOW() - time_range
    AND response_time_ms IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- MAINTENANCE PROCEDURES
-- ===========================

-- Auto-cleanup old records (updated for real schema)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS text AS $$
DECLARE
    cleanup_report text := '';
    deleted_count integer;
BEGIN
    -- Clean up expired OTP verifications (main OTP table)
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 day' 
    AND status IN ('expired', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    cleanup_report := cleanup_report || format('Deleted %s expired OTP verifications. ', deleted_count);
    
    -- Clean up old verified OTPs (keep successful ones for 7 days)
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
    
    -- Clean up old performance metrics (keep 7 days)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
        DELETE FROM performance_metrics 
        WHERE timestamp < NOW() - INTERVAL '7 days';
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        cleanup_report := cleanup_report || format('Deleted %s old performance metrics. ', deleted_count);
    END IF;
    
    -- Clean up expired rate limits (older than 1 hour)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        DELETE FROM rate_limits 
        WHERE timestamp < NOW() - INTERVAL '1 hour';
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        cleanup_report := cleanup_report || format('Deleted %s expired rate limits. ', deleted_count);
    END IF;
    
    -- Update table statistics for all major tables
    ANALYZE otp_verifications;
    ANALYZE verified_phone_numbers;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ANALYZE audit_logs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
        ANALYZE performance_metrics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        ANALYZE rate_limits;
    END IF;
    
    cleanup_report := cleanup_report || 'Database statistics updated successfully.';
    
    RAISE NOTICE '%', cleanup_report;
    RETURN cleanup_report;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- PARTITIONING (for high-volume tables)
-- ===========================

-- Create partitioned audit_logs table (if needed for high volume)
-- This is commented out by default - enable if you have > 1M records/month

/*
-- Drop existing table and recreate as partitioned
-- WARNING: This will delete existing data!
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type varchar(50) NOT NULL,
    phone_number varchar(20),
    reference_code varchar(50),
    otp_id uuid,
    success boolean DEFAULT false,
    error_code varchar(50),
    error_message text,
    ip_address inet,
    user_agent text,
    response_time_ms integer,
    database_query_time_ms integer,
    timestamp timestamptz DEFAULT NOW(),
    metadata jsonb
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_logs_2025_09 PARTITION OF audit_logs
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE audit_logs_2025_10 PARTITION OF audit_logs
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Add indexes to partitions
CREATE INDEX idx_audit_logs_2025_09_timestamp_type ON audit_logs_2025_09 (timestamp DESC, event_type);
CREATE INDEX idx_audit_logs_2025_10_timestamp_type ON audit_logs_2025_10 (timestamp DESC, event_type);
*/

-- ===========================
-- MONITORING QUERIES
-- ===========================

-- Check index usage for existing tables only
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('otp_verifications', 'verified_phone_numbers', 'audit_logs', 'performance_metrics', 'rate_limits', 'profiles', 'sms_accounts')
ORDER BY tablename, n_distinct DESC;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Performance summary query
SELECT 
    'Database Optimization Status' as status,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND idx_scan > 100) as used_indexes,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE schemaname = 'public') as total_tables;

-- ===========================
-- COMPLETION VERIFICATION
-- ===========================

-- Verify all indexes are created for existing tables
DO $$
DECLARE
    expected_indexes text[] := ARRAY[
        'idx_otp_verifications_phone_status_expires',
        'idx_otp_verifications_phone_recent', 
        'idx_otp_verifications_external_lookup',
        'idx_otp_verifications_verification_attempts',
        'idx_otp_verifications_session_token',
        'idx_audit_logs_event_timestamp',
        'idx_audit_logs_phone_timestamp',
        'idx_audit_logs_severity_timestamp',
        'idx_performance_metrics_service_operation',
        'idx_performance_metrics_response_time',
        'idx_performance_metrics_errors',
        'idx_rate_limits_key_timestamp_active',
        'idx_verified_phone_numbers_lookup',
        'idx_verified_phone_numbers_user_status'
    ];
    idx_name text;
    missing_count int := 0;
    existing_count int := 0;
BEGIN
    FOREACH idx_name IN ARRAY expected_indexes
    LOOP
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = idx_name) THEN
            existing_count := existing_count + 1;
            RAISE NOTICE '✅ Index exists: %', idx_name;
        ELSE
            RAISE NOTICE '⚠️ Missing index: %', idx_name;
            missing_count := missing_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 INDEX SUMMARY:';
    RAISE NOTICE '   • Total expected indexes: %', array_length(expected_indexes, 1);
    RAISE NOTICE '   • Existing indexes: %', existing_count;
    RAISE NOTICE '   • Missing indexes: %', missing_count;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '🎉 All performance indexes created successfully!';
    ELSE
        RAISE NOTICE '⚠️ Please check missing indexes above';
    END IF;
END;
$$;

-- Final performance check
SELECT 'Phase 5.1 Database Optimization' as phase_status, 'COMPLETED' as status;
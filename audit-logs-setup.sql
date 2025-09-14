-- Enhanced Logging and Audit Trail Tables
-- Version: 1.0
-- Date: September 14, 2025

-- Main audit log table for all system events
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,        -- 'otp_send', 'otp_verify', 'rate_limit', 'error', etc.
    event_category VARCHAR(30) NOT NULL,    -- 'security', 'otp', 'performance', 'error'
    severity VARCHAR(20) NOT NULL DEFAULT 'info',  -- 'debug', 'info', 'warn', 'error', 'critical'
    
    -- Request context
    client_ip VARCHAR(45),                   -- IPv4 or IPv6
    user_agent TEXT,
    request_id VARCHAR(100),                 -- For tracking requests across services
    session_id UUID,
    
    -- Event details
    event_data JSONB NOT NULL DEFAULT '{}', -- Structured event data
    message TEXT,                           -- Human-readable message
    
    -- OTP specific fields
    phone_number VARCHAR(20),               -- For OTP events
    otp_id UUID,                           -- OTP identifier
    reference_code VARCHAR(20),             -- OTP reference code
    
    -- Performance metrics
    response_time_ms INTEGER,               -- Response time in milliseconds
    database_query_time_ms INTEGER,        -- Database query time
    
    -- Error details
    error_code VARCHAR(50),                 -- Application error code
    error_message TEXT,                     -- Error description
    stack_trace TEXT,                       -- For debugging (be careful with PII)
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service_name VARCHAR(50) DEFAULT 'otp-system',
    service_version VARCHAR(20) DEFAULT '1.0'
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_ip ON audit_logs(client_ip);
CREATE INDEX IF NOT EXISTS idx_audit_logs_phone_number ON audit_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_otp_id ON audit_logs(otp_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_category_severity_timestamp 
ON audit_logs(event_category, severity, timestamp DESC);

-- Performance metrics summary table (for dashboards)
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_hour TIMESTAMPTZ NOT NULL,        -- Hourly aggregation
    event_type VARCHAR(50) NOT NULL,
    
    -- Counters
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    rate_limited_requests INTEGER DEFAULT 0,
    
    -- Performance stats
    avg_response_time_ms NUMERIC(10,2),
    min_response_time_ms INTEGER,
    max_response_time_ms INTEGER,
    p95_response_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint for hourly aggregation
CREATE UNIQUE INDEX IF NOT EXISTS idx_performance_metrics_hour_type 
ON performance_metrics(date_hour, event_type);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Service role policies (for Edge Functions)
CREATE POLICY "Service role can manage audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage performance_metrics" ON performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Users can only read their own logs (if needed for user-facing features)
CREATE POLICY "Users can read own logs" ON audit_logs
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        (event_data->>'user_id' = auth.uid()::text OR session_id = auth.uid())
    );

-- Auto-cleanup function for old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    DELETE FROM performance_metrics 
    WHERE date_hour < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail and logging for OTP system';
COMMENT ON TABLE performance_metrics IS 'Hourly aggregated performance metrics for monitoring';
COMMENT ON COLUMN audit_logs.event_data IS 'JSONB field for structured event-specific data';
COMMENT ON COLUMN audit_logs.client_ip IS 'Client IP address (IPv4 or IPv6)';
COMMENT ON COLUMN audit_logs.response_time_ms IS 'Total response time in milliseconds';

-- Verify table creation
SELECT 'audit_logs and performance_metrics tables created successfully' as status;
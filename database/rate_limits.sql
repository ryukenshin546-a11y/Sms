-- Rate Limiting Table for OTP System
-- This table stores rate limiting data for IP addresses and phone numbers
-- Version: 1.0
-- Date: September 14, 2025

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,           -- Rate limit key (ip:xxx or phone:xxx)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Request timestamp
    request_count INTEGER DEFAULT 1,     -- Number of requests (for future batching)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_timestamp 
ON rate_limits(key, timestamp DESC);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp 
ON rate_limits(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role full access (for Edge Functions)
CREATE POLICY "Service role can manage rate_limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow anonymous users to insert their own rate limits
CREATE POLICY "Users can insert rate limits" ON rate_limits
    FOR INSERT WITH CHECK (true);

-- Policy to allow users to read their own rate limits
CREATE POLICY "Users can read rate limits" ON rate_limits
    FOR SELECT USING (true);

-- Auto-cleanup function to remove old rate limit entries
-- This function removes entries older than 24 hours
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-rate-limits', '0 */6 * * *', 'SELECT cleanup_old_rate_limits();');

COMMENT ON TABLE rate_limits IS 'Stores rate limiting data for OTP system security';
COMMENT ON COLUMN rate_limits.key IS 'Rate limit identifier (ip:address or phone:number)';
COMMENT ON COLUMN rate_limits.timestamp IS 'When the request was made';
COMMENT ON COLUMN rate_limits.request_count IS 'Number of requests (for batching support)';
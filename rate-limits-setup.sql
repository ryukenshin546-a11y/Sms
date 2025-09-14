-- Rate Limits Table Creation Script
-- Copy and paste this entire script into Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_timestamp 
ON rate_limits(key, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp 
ON rate_limits(timestamp);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate_limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert rate limits" ON rate_limits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read rate limits" ON rate_limits
    FOR SELECT USING (true);

-- Verify table creation
SELECT 'rate_limits table created successfully' as status;
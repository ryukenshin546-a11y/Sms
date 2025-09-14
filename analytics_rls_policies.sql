-- Analytics RLS Policies
-- Created: September 14, 2025
-- Purpose: Allow Edge Functions to access audit_logs table for analytics

-- Allow service role to read all audit logs
CREATE POLICY "Allow service role full access to audit_logs"
ON "public"."audit_logs"
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon role to read aggregate analytics data through Edge Functions
-- (This policy allows read access but actual data access is controlled by Edge Functions)
CREATE POLICY "Allow anon access for analytics"
ON "public"."audit_logs"
AS PERMISSIVE  
FOR SELECT
TO anon
USING (true);

-- Similar policy for performance_metrics if needed
CREATE POLICY "Allow service role full access to performance_metrics"
ON "public"."performance_metrics"
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon access for performance analytics"
ON "public"."performance_metrics"
AS PERMISSIVE  
FOR SELECT
TO anon
USING (true);
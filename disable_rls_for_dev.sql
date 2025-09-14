-- Temporarily disable RLS for development
-- Run this in Supabase SQL Editor

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('audit_logs', 'performance_metrics');

-- Disable RLS on audit_logs table for development
ALTER TABLE "public"."audit_logs" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on performance_metrics table for development  
ALTER TABLE "public"."performance_metrics" DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('audit_logs', 'performance_metrics');
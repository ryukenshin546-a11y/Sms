-- Comprehensive Database Schema Analysis
-- Run this in Supabase SQL Editor to get complete current state

-- 1. Get complete otp_verifications table structure
SELECT 
    'otp_verifications' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'otp_verifications'
ORDER BY ordinal_position;

-- 2. Get complete audit_logs table structure
SELECT 
    'audit_logs' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 3. Get rate_limits table structure
SELECT 
    'rate_limits' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'rate_limits'
ORDER BY ordinal_position;

-- 4. Get user_profiles table structure for reference
SELECT 
    'user_profiles' as table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Check all NOT NULL constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('otp_verifications', 'audit_logs', 'rate_limits', 'user_profiles')
AND tc.constraint_type IN ('NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.table_name, kcu.column_name;

-- 6. Check all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('otp_verifications', 'audit_logs', 'rate_limits', 'user_profiles')
ORDER BY tablename, indexname;

-- 7. Check table relationships/foreign keys
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('otp_verifications', 'audit_logs', 'rate_limits', 'user_profiles');

-- 8. Count current records in each table
SELECT 
    'otp_verifications' as table_name, 
    count(*) as record_count,
    count(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
    count(CASE WHEN expires_at > now() THEN 1 END) as active_count
FROM public.otp_verifications
UNION ALL
SELECT 
    'audit_logs' as table_name, 
    count(*) as record_count,
    count(CASE WHEN event_type = 'otp_send' THEN 1 END) as otp_send_count,
    count(CASE WHEN created_at > now() - INTERVAL '1 day' THEN 1 END) as recent_count
FROM public.audit_logs
UNION ALL
SELECT 
    'rate_limits' as table_name, 
    count(*) as record_count,
    0 as second_count,
    count(CASE WHEN window_start > now() - INTERVAL '1 hour' THEN 1 END) as active_count
FROM public.rate_limits
UNION ALL
SELECT 
    'user_profiles' as table_name, 
    count(*) as record_count,
    count(CASE WHEN phone_verified = true THEN 1 END) as phone_verified_count,
    count(CASE WHEN email_verified = true THEN 1 END) as email_verified_count
FROM public.user_profiles;
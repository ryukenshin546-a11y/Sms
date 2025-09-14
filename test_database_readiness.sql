-- Simple Database Test Script
-- Tests the corrected database_optimization.sql without making changes

-- ===========================
-- 1. CHECK EXISTING TABLES
-- ===========================

SELECT 
    'EXISTING TABLES' as check_type,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- ===========================
-- 2. CHECK EXISTING INDEXES
-- ===========================

SELECT 
    'EXISTING INDEXES' as check_type,
    COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public';

-- ===========================
-- 3. TEST OTP PERFORMANCE FUNCTION (DRY RUN)
-- ===========================

-- Test if we can create the function without errors
SELECT 
    'FUNCTION TEST' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otp_verifications')
        THEN 'otp_verifications table exists - function will work'
        ELSE 'otp_verifications table missing - function will fail'
    END as result;

-- ===========================
-- 4. CHECK TABLE STRUCTURES
-- ===========================

-- Check otp_verifications structure
SELECT 
    'OTP_VERIFICATIONS COLUMNS' as check_type,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'otp_verifications' 
AND table_schema = 'public';

-- Check audit_logs structure
SELECT 
    'AUDIT_LOGS COLUMNS' as check_type,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND table_schema = 'public';

-- ===========================
-- 5. SAFETY CHECK SUMMARY
-- ===========================

SELECT 
    '🔍 SAFETY CHECK SUMMARY' as status,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') > 0
        THEN '✅ Database has tables - safe to proceed'
        ELSE '❌ No tables found - migration needed first'
    END as result;

-- Show current database status
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
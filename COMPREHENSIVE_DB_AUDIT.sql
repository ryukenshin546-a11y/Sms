-- COMPREHENSIVE DATABASE AUDIT
-- Check all tables, triggers, policies, and constraints

-- 1. Check if user_profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check all triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 3. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Check recent auth users without profiles
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    u.email_confirmed_at,
    u.raw_user_meta_data,
    p.id as profile_id,
    p.username,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Check for any constraint violations
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'user_profiles' 
    AND tc.table_schema = 'public';
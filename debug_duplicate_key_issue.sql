-- เช็คสาเหตุของ duplicate key error 
-- รันใน Supabase SQL Editor

-- 1. เช็คว่ามี trigger สร้าง profile อัตโนมัติเมื่อสร้าง auth.user หรือไม่
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid  
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND NOT t.tgisinternal
  AND t.tgenabled != 'D'
ORDER BY t.tgname;

-- 2. เช็ค function ที่อาจสร้าง profile
SELECT 
    n.nspname,
    p.proname,
    p.prosrc
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    p.prosrc ILIKE '%profiles%' 
    OR p.prosrc ILIKE '%INSERT INTO%profiles%'
    OR p.prosrc ILIKE '%INSERT INTO public.profiles%'
)
AND n.nspname IN ('public', 'auth', 'extensions');

-- 3. เช็คข้อมูลล่าสุดใน auth.users vs profiles
WITH recent_users AS (
  SELECT id, email, created_at as auth_created
  FROM auth.users 
  WHERE email = 'riwkindo123@gmail.com'
),
recent_profiles AS (
  SELECT id, email, created_at as profile_created
  FROM public.profiles
  WHERE email = 'riwkindo123@gmail.com'
)
SELECT 
    u.id,
    u.email,
    u.auth_created,
    p.profile_created,
    CASE 
        WHEN p.id IS NULL THEN 'NO_PROFILE'
        WHEN u.auth_created = p.profile_created THEN 'CREATED_SAME_TIME'
        WHEN u.auth_created < p.profile_created THEN 'PROFILE_CREATED_AFTER'
        ELSE 'UNKNOWN_TIMING'
    END as creation_timing
FROM recent_users u
LEFT JOIN recent_profiles p ON u.id = p.id;

-- 4. เช็ค RLS policy ที่อาจทำให้ query ล้มเหลว
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;
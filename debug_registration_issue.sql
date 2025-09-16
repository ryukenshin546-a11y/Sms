-- ตรวจสอบ Database Triggers และ Functions ที่เกี่ยวข้องกับการสร้าง Profile อัตโนมัติ

-- 1. ตรวจสอบ Triggers ทั้งหมดในตาราง auth.users
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
AND c.relname = 'users'
AND NOT t.tgisinternal;

-- 2. ตรวจสอบ Functions ที่อาจถูกเรียกโดย Triggers
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    prosrc as function_body
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
AND (
    p.proname ILIKE '%profile%' 
    OR p.proname ILIKE '%user%'
    OR prosrc ILIKE '%profiles%'
)
ORDER BY n.nspname, p.proname;

-- 3. ตรวจสอบ Triggers บนตาราง profiles 
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname = 'profiles'
AND NOT t.tgisinternal;

-- 4. ตรวจสอบ RLS Policies บนตาราง profiles
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
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. ตรวจสอบข้อมูลล่าสุดในตาราง auth.users และ profiles
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_records,
    MAX(created_at) as latest_created_at
FROM auth.users

UNION ALL

SELECT 
    'public.profiles' as table_name,
    COUNT(*) as total_records,
    MAX(created_at) as latest_created_at
FROM public.profiles;

-- 6. ตรวจสอบ User ล่าสุด 5 คน
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created_at,
    p.created_at as profile_created_at,
    CASE 
        WHEN p.id IS NULL THEN 'NO_PROFILE'
        WHEN u.created_at = p.created_at THEN 'SAME_TIME'
        WHEN u.created_at < p.created_at THEN 'PROFILE_AFTER_AUTH'
        ELSE 'PROFILE_BEFORE_AUTH'
    END as timing
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 7. หา duplicate records ในตาราง profiles
SELECT 
    id,
    COUNT(*) as count
FROM public.profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- 8. ตรวจสอบ Supabase Webhooks (ถ้ามี)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE pg_get_triggerdef(t.oid) ILIKE '%webhook%'
AND NOT t.tgisinternal;
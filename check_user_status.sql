-- ตรวจสอบสถานะ Users ที่สมัครแล้วแต่ยังไม่ยืนยันอีเมล
-- รันใน Supabase SQL Editor

-- 1. ดู users ที่ยังไม่ยืนยันอีเมล
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'first_name' as first_name,
    raw_user_meta_data->>'last_name' as last_name
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 2. ดู users ที่ยืนยันอีเมลแล้ว
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. ดูข้อมูลใน user_profiles table
SELECT 
    up.*,
    au.email,
    au.email_confirmed_at
FROM public.user_profiles up
RIGHT JOIN auth.users au ON up.id = au.id
ORDER BY au.created_at DESC
LIMIT 5;

-- 4. นับจำนวน users แต่ละสถานะ
SELECT 
    'Total Users' as status,
    COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 
    'Confirmed Users' as status,
    COUNT(*) as count
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL

UNION ALL

SELECT 
    'Unconfirmed Users' as status,
    COUNT(*) as count
FROM auth.users 
WHERE email_confirmed_at IS NULL

UNION ALL

SELECT 
    'Users with Profiles' as status,
    COUNT(*) as count
FROM public.user_profiles;
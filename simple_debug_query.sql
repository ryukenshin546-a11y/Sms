-- Simple query เพื่อตรวจสอบ triggers และ functions ที่เกี่ยวข้องกับ profiles

-- 1. ตรวจสอบ triggers บน auth.users table ง่าย ๆ
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- 2. ตรวจสอบ functions ที่มีคำว่า 'profile'
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE prosrc ILIKE '%profiles%'
  AND pronamespace IN (
    SELECT oid FROM pg_namespace WHERE nspname IN ('public', 'auth')
  );

-- 3. ตรวจสอบข้อมูลใน profiles table สำหรับ user ที่มีปัญหา
SELECT 
    id,
    email,
    username,
    created_at
FROM public.profiles 
WHERE email = 'riwkindo123@gmail.com'
ORDER BY created_at DESC;

-- 4. ตรวจสอบข้อมูลใน auth.users สำหรับ user ที่มีปัญหา
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'riwkindo123@gmail.com'
ORDER BY created_at DESC;

-- 5. เช็คว่ามี duplicate หรือไม่
SELECT 
    id,
    COUNT(*) as duplicate_count
FROM public.profiles 
GROUP BY id
HAVING COUNT(*) > 1;
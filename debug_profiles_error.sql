-- ตรวจสอบและแก้ไขปัญหา profiles table ที่หายไป
-- รันใน Supabase SQL Editor

-- 1. ตรวจสอบ triggers ทั้งหมดที่อ้างถึง profiles
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE pg_get_triggerdef(t.oid) ILIKE '%profiles%'
  AND NOT t.tgisinternal;

-- 2. ตรวจสอบ functions ทั้งหมดที่อ้างถึง profiles
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%profiles%'
  AND p.prokind = 'f';

-- 3. ดูว่ามี table profiles หรือ user_profiles อะไรบ้าง
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename ILIKE '%profile%'
ORDER BY schemaname, tablename;

-- 4. ตรวจสอบ trigger ปัจจุบันที่เรา handle_email_confirmation
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND t.tgname = 'on_email_confirmed'
  AND NOT t.tgisinternal;
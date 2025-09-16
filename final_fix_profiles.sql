-- แก้ไขปัญหาสุดท้าย - ลบ functions เก่าที่อ้างถึง profiles table
-- รันใน Supabase SQL Editor

-- 1. ลบ trigger ที่เรียกใช้ sync_email_verification ก่อน
DROP TRIGGER IF EXISTS sync_email_verification_trigger ON auth.users;

-- 2. ลบ functions เก่าที่อ้างถึง profiles table
DROP FUNCTION IF EXISTS public.sync_all_email_verification();
DROP FUNCTION IF EXISTS public.sync_email_verification();

-- 3. ตรวจสอบว่า functions เก่าถูกลบแล้ว
SELECT 
    p.proname as function_name,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%profiles%'
  AND p.prokind = 'f'
  AND p.proname NOT IN ('handle_email_confirmation', 'get_user_profile');

-- ผลลัพธ์ควรเป็นว่าง (ไม่มี functions เก่าที่อ้างถึง profiles)
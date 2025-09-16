-- สร้าง profiles view สำหรับ compatibility กับ frontend
-- รันใน Supabase SQL Editor

-- 1. สร้าง profiles view ที่ชี้ไป user_profiles table
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    up.id,
    up.first_name,
    up.last_name,
    up.phone,
    up.account_type,
    up.company_name,
    up.tax_id,
    up.business_address,
    up.credit_balance,
    up.status,
    up.created_at,
    up.updated_at,
    -- เพิ่ม fields ที่ frontend ต้องการ
    au.email,
    au.email_confirmed_at,
    (au.email_confirmed_at IS NOT NULL) as email_verified,
    false as phone_verified, -- default false for now
    up.first_name as username -- use first_name as username for now
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id;

-- 2. ตรวจสอบว่า view ถูกสร้างแล้ว
SELECT * FROM public.profiles LIMIT 1;
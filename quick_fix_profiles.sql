-- แก้ปัญหาเร่งด่วน - สร้าง profiles VIEW
-- รันใน Supabase SQL Editor

-- สร้าง profiles view ที่ชี้ไป user_profiles
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id,
    first_name,
    last_name,
    phone,
    account_type,
    company_name,
    tax_id,
    business_address,
    credit_balance,
    status,
    created_at,
    updated_at
FROM public.user_profiles;

-- ตรวจสอบว่า view สร้างสำเร็จ
SELECT * FROM public.profiles LIMIT 1;
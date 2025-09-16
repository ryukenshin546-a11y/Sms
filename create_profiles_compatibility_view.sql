-- สร้าง profiles view เพื่อ compatibility กับ frontend
-- รันใน Supabase SQL Editor หลังจาก update_user_profiles_schema.sql

-- สร้าง profiles view ที่ชี้ไป user_profiles table
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
  up.email_verified,
  up.phone_verified,
  up.username,
  up.can_use_autobot,
  -- เพิ่มข้อมูลจาก auth.users
  au.email
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id;

-- Enable RLS on the view
ALTER VIEW public.profiles SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;

-- Test the view
SELECT * FROM public.profiles LIMIT 1;
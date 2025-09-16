-- แก้ไข RLS permissions สำหรับ profiles view
-- รันใน Supabase SQL Editor

-- 1. ลบ view เก่าที่มีปัญหา permissions
DROP VIEW IF EXISTS public.profiles;

-- 2. สร้าง view ใหม่โดยไม่ JOIN กับ auth.users (เพื่อหลีกเลี่ยงปัญหา RLS)
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
  up.can_use_autobot
FROM public.user_profiles up;

-- 3. สร้าง RLS policies สำหรับ profiles view
CREATE POLICY "Users can view own profile via view" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile via view" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile via view" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- 4. Enable RLS on the view (if supported)
-- Note: RLS on views might not work, so we rely on underlying table RLS

-- 5. Grant permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated; 
GRANT INSERT ON public.profiles TO authenticated;

-- 6. ทดสอบ view ใหม่
SELECT * FROM public.profiles WHERE id = auth.uid() LIMIT 1;
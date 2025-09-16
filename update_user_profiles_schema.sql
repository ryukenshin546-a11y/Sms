-- เพิ่ม fields ที่ Frontend ต้องการใน user_profiles table
-- รันใน Supabase SQL Editor

-- 1. เพิ่ม fields ที่ Frontend ใช้
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS can_use_autobot boolean GENERATED ALWAYS AS (email_verified AND phone_verified) STORED;

-- 5. อัปเดต username ที่เป็น null ให้มีค่า
UPDATE public.user_profiles 
SET username = first_name || '_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;

-- 6. อัปเดต handle_email_confirmation function ให้ตั้ง email_verified = true
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- เมื่อ user ยืนยันอีเมลแล้ว (email_confirmed_at มีค่า) 
  -- และยังไม่มี user profile
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    
    -- สร้าง user profile จาก metadata ใน user_profiles table
    INSERT INTO public.user_profiles (
      id,
      first_name,
      last_name,
      phone,
      account_type,
      company_name,
      tax_id,
      business_address,
      username,
      email_verified, -- ตั้งเป็น true เมื่อยืนยันอีเมลแล้ว
      phone_verified,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal'),
      COALESCE(NEW.raw_user_meta_data->>'company_name_th', ''),
      COALESCE(NEW.raw_user_meta_data->>'tax_id', ''),
      COALESCE(NEW.raw_user_meta_data->>'business_address', ''),
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'user_' || substring(NEW.id::text, 1, 8)),
      true, -- email_verified = true เพราะยืนยันแล้ว
      false, -- phone_verified = false (default)
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email_verified = true, -- อัปเดตสถานะยืนยันอีเมล
      updated_at = now();
    
    RAISE NOTICE 'Created/updated user profile for user %', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. สร้าง view compatibility กับ frontend (optional)
CREATE OR REPLACE VIEW public.user_profile_view AS
SELECT 
  up.*,
  au.email,
  au.email_confirmed_at
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id;

-- 4. ตรวจสอบ schema ใหม่
\d public.user_profiles;
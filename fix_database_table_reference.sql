-- แก้ไข Database Function ให้อ้างถึงตาราง user_profiles ที่ถูกต้อง
-- รันใน Supabase SQL Editor

-- 1. ลบ trigger ที่เชื่อมต่อกับ function เก่าก่อน
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

-- 2. ลบ function เก่าที่อ้างถึง profiles table ผิด
DROP FUNCTION IF EXISTS public.handle_email_confirmation();

-- 3. สร้าง function ใหม่ที่อ้างถึง user_profiles table ที่ถูกต้อง
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- เมื่อ user ยืนยันอีเมลแล้ว (email_confirmed_at มีค่า) 
  -- และยังไม่มี user profile
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    
    -- สร้าง user profile จาก metadata ใน user_profiles table (ไม่ใช่ profiles)
    INSERT INTO public.user_profiles (
      id,
      first_name,
      last_name,
      phone,
      account_type,
      company_name,
      tax_id,
      business_address,
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
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING; -- ป้องกัน duplicate
    
    RAISE NOTICE 'Created user profile for user %', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. สร้าง trigger ใหม่ที่เชื่อมต่อกับ function ใหม่
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_email_confirmation();

-- 5. ตรวจสอบว่า trigger ถูกสร้างแล้ว
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
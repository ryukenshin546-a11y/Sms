-- แก้ไข Database Function ให้ใช้ username จาก metadata ที่ถูกต้อง
-- รันใน Supabase SQL Editor

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
      -- ✅ แก้ไขให้ใช้ username จาก metadata ที่ถูกต้อง
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'first_name', 'user_' || substring(NEW.id::text, 1, 8)),
      true, -- email_verified = true เพราะยืนยันแล้ว
      false, -- phone_verified = false (default)
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email_verified = true, -- อัปเดตสถานะยืนยันอีเมล
      username = COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'first_name', 'user_' || substring(NEW.id::text, 1, 8)),
      updated_at = now();
    
    RAISE NOTICE 'Created/updated user profile for user %', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;
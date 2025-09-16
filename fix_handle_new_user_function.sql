-- แก้ไขปัญหา duplicate key โดยปรับ handle_new_user() function
-- รันใน Supabase SQL Editor

-- 1. ลบ function เก่า
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. สร้าง function ใหม่ที่ใช้ UPSERT แทน INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Use UPSERT (INSERT ... ON CONFLICT DO UPDATE) to handle potential duplicates
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    username, 
    email,
    phone,
    account_type,
    role,
    credit_balance,
    email_verified,
    phone_verified,
    status,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'account_type', 'personal'),
    'user',
    100, -- Free credits
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    false,
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    account_type = EXCLUDED.account_type,
    email_verified = EXCLUDED.email_verified,
    updated_at = now();
  
  RETURN new;
END;
$$;

-- 3. ตรวจสอบว่า trigger ยังคงทำงาน
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND t.tgname = 'on_auth_user_created'
  AND NOT t.tgisinternal;
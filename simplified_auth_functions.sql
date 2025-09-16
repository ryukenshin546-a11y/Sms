-- Email Confirmation Handler Function
-- สร้าง function สำหรับจัดการ email confirmation และสร้าง user profile

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- เมื่อ user ยืนยันอีเมลแล้ว (email_confirmed_at มีค่า) 
  -- และยังไม่มี profile
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    
    -- สร้าง user profile จาก metadata
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
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'tax_id', ''),
      COALESCE(NEW.raw_user_meta_data->>'business_address', ''),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING; -- ป้องกัน duplicate
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- ลบ trigger เก่า (ถ้ามี)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- สร้าง trigger ใหม่ที่ทำงานเมื่อ email ถูกยืนยัน
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_email_confirmation();

-- สร้าง function สำหรับ get user profile พร้อม auth data  
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  account_type text,
  company_name text,
  tax_id text,
  business_address text,
  credit_balance decimal,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  email_confirmed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.account_type,
    p.company_name,
    p.tax_id,
    p.business_address,
    p.credit_balance,
    p.status,
    p.created_at,
    p.updated_at,
    u.email_confirmed_at
  FROM public.user_profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = auth.uid();
$$;
-- เพิ่ม columns ที่ขาดหายใน user_profiles table
-- รันใน Supabase SQL Editor

-- เพิ่ม phone_verified_at column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz NULL;

-- เพิ่ม email_verified_at column (ถ้าต้องการ)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified_at timestamptz NULL;

-- ตรวจสอบ schema ใหม่
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY column_name;
-- อัปเดต username ที่ผิดให้ถูกต้อง
-- รันใน Supabase SQL Editor

-- ตรวจสอบ metadata ของ user ปัจจุบัน
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as metadata_username,
  raw_user_meta_data->>'first_name' as metadata_first_name
FROM auth.users 
WHERE id = '08dfad09-ca7e-4e65-95c7-d9cb8b11f26d';

-- อัปเดต username ใน user_profiles ให้ตรงกับ metadata
-- หาก metadata มี username ให้ใช้ username นั้น
UPDATE public.user_profiles 
SET username = CASE
  WHEN (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = user_profiles.id) IS NOT NULL 
    AND (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = user_profiles.id) != ''
  THEN (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = user_profiles.id)
  ELSE username -- เก็บค่าเดิม
END,
updated_at = now()
WHERE id = '08dfad09-ca7e-4e65-95c7-d9cb8b11f26d';

-- ตรวจสอบผลลัพธ์
SELECT username FROM public.user_profiles 
WHERE id = '08dfad09-ca7e-4e65-95c7-d9cb8b11f26d';
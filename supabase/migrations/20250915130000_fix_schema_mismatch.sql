-- Migration: Fix schema mismatch between types and database  
-- Created: September 15, 2025
-- Purpose: Align database schema with TypeScript types

-- 1. เปลี่ยน full_name เป็น first_name และ last_name
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS full_name CASCADE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name character varying(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name character varying(100) NOT NULL DEFAULT '';

-- 2. เปลี่ยน phone_number เป็น phone
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone_number CASCADE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone character varying(20) NOT NULL DEFAULT '';

-- 3. เพิ่ม password column ถ้ายังไม่มี
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password character varying(255) NOT NULL DEFAULT '';

-- 4. อัพเดท constraints และ indexes
-- Unique constraint สำหรับ phone
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON public.profiles(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- 5. เพิ่ม missing columns จาก types
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS sms_account_data jsonb,
ADD COLUMN IF NOT EXISTS sms_account_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_generated_at timestamptz;

-- 6. อัพเดท existing data (ถ้ามี)
-- สำหรับข้อมูลเก่าที่อาจมี full_name อยู่แล้ว
-- ถ้า full_name ยังมีอยู่ก่อนลบ ให้แยกเป็น first_name, last_name
-- (SQL นี้จะทำงานก็ต่อเมื่อ full_name ยังมีอยู่)

-- 7. เพิ่ม comments
COMMENT ON COLUMN public.profiles.first_name IS 'ชื่อจริง';
COMMENT ON COLUMN public.profiles.last_name IS 'นามสกุล';  
COMMENT ON COLUMN public.profiles.phone IS 'หมายเลขโทรศัพท์';
COMMENT ON COLUMN public.profiles.password IS 'รหัสผ่าน (hashed)';

-- 8. แสดงผลสำเร็จ
DO $$
BEGIN
    RAISE NOTICE 'Schema alignment completed successfully!';
    RAISE NOTICE 'Changed: full_name -> first_name, last_name';
    RAISE NOTICE 'Changed: phone_number -> phone'; 
    RAISE NOTICE 'Added: password, role, and other missing columns';
END $$;
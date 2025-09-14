-- Migration: Add business_type column to profiles table
-- Created: September 15, 2025
-- Migration file: 20250915120000_add_business_type_column.sql

-- เพิ่ม business_type column สำหรับ corporate accounts
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_type character varying(100) null;

-- เพิ่ม comment สำหรับ documentation  
COMMENT ON COLUMN public.profiles.business_type IS 'ประเภทธุรกิจ (สำหรับนิติบุคคล)';

-- เพิ่ม index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON public.profiles(business_type)
WHERE business_type IS NOT NULL;

-- แสดงผลสำเร็จ
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: business_type column added to profiles table';
    RAISE NOTICE 'This column is used for corporate account business type classification';
END $$;
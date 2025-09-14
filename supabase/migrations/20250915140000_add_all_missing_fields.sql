-- Migration: Add all missing fields to match TypeScript types exactly
-- Created: September 15, 2025 
-- Purpose: Complete alignment between database and TypeScript interfaces

-- เพิ่ม missing fields ที่ยังไม่มีใน database
ALTER TABLE public.profiles
-- Individual account fields (from migration 20250915000000)
ADD COLUMN IF NOT EXISTS id_card character varying(13) null,
ADD COLUMN IF NOT EXISTS address text null,
ADD COLUMN IF NOT EXISTS use_same_address boolean null default false,
ADD COLUMN IF NOT EXISTS billing_address text null,

-- Corporate account fields (from migration 20250915000000)  
ADD COLUMN IF NOT EXISTS company_registration character varying(13) null,
ADD COLUMN IF NOT EXISTS company_name_th character varying(255) null,
ADD COLUMN IF NOT EXISTS company_name_en character varying(255) null,
ADD COLUMN IF NOT EXISTS company_address text null,
ADD COLUMN IF NOT EXISTS tax_id character varying(13) null,
ADD COLUMN IF NOT EXISTS company_phone character varying(20) null,
ADD COLUMN IF NOT EXISTS authorized_person character varying(255) null,
ADD COLUMN IF NOT EXISTS position character varying(100) null,
ADD COLUMN IF NOT EXISTS use_same_address_for_billing boolean null default false,
ADD COLUMN IF NOT EXISTS business_type character varying(100) null,

-- Missing system fields from TypeScript types
ADD COLUMN IF NOT EXISTS company character varying(255) null,
ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at timestamptz,  
ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS sms_account_data jsonb,
ADD COLUMN IF NOT EXISTS sms_account_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_generated_at timestamptz;

-- เพิ่ม constraints
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS profiles_role_check 
CHECK (role IN ('admin', 'user', 'corporate'));

-- เพิ่ม indexes สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON public.profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_sms_account_generated ON public.profiles(sms_account_generated);

-- Comments
COMMENT ON COLUMN public.profiles.company IS 'ชื่อบริษัท (สำหรับทั้ง personal และ corporate)';
COMMENT ON COLUMN public.profiles.business_type IS 'ประเภทธุรกิจ (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.role IS 'บทบาทในระบบ: admin, user, corporate';
COMMENT ON COLUMN public.profiles.sms_account_data IS 'ข้อมูล SMS account ที่สร้าง';
COMMENT ON COLUMN public.profiles.sms_account_generated IS 'สถานะการสร้าง SMS account';

-- แสดงผลสำเร็จ
DO $$
BEGIN
    RAISE NOTICE 'All missing fields added successfully!';
    RAISE NOTICE 'Database schema now matches TypeScript types completely';
END $$;
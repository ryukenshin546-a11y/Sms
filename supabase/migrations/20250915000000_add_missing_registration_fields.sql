-- Migration: Add missing registration fields to profiles table
-- Created: September 15, 2025
-- Migration file: 20250915000000_add_missing_registration_fields.sql

-- ===================================
-- 1. เพิ่มฟิลด์ที่ขาดหายไป
-- ===================================

-- เพิ่มฟิลด์สำหรับบุคคลธรรมดา
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS id_card character varying(13) null,
ADD COLUMN IF NOT EXISTS address text null,
ADD COLUMN IF NOT EXISTS use_same_address boolean null default false,
ADD COLUMN IF NOT EXISTS billing_address text null;

-- เพิ่มฟิลด์สำหรับนิติบุคคล
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_registration character varying(13) null,
ADD COLUMN IF NOT EXISTS company_name_th character varying(255) null,
ADD COLUMN IF NOT EXISTS company_name_en character varying(255) null,
ADD COLUMN IF NOT EXISTS company_address text null,
ADD COLUMN IF NOT EXISTS tax_id character varying(13) null,
ADD COLUMN IF NOT EXISTS company_phone character varying(20) null,
ADD COLUMN IF NOT EXISTS authorized_person character varying(255) null,
ADD COLUMN IF NOT EXISTS position character varying(100) null,
ADD COLUMN IF NOT EXISTS use_same_address_for_billing boolean null default false;

-- ===================================
-- 2. เพิ่ม Constraints สำหรับ validation
-- ===================================

-- เพิ่ม constraint สำหรับ id_card (13 หลัก)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_id_card_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_id_card_check
        CHECK (id_card IS NULL OR id_card ~ '^[0-9]{13}$');
    END IF;
END $$;

-- เพิ่ม constraint สำหรับ company_registration (13 หลัก)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_company_registration_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_company_registration_check
        CHECK (company_registration IS NULL OR company_registration ~ '^[0-9]{13}$');
    END IF;
END $$;

-- เพิ่ม constraint สำหรับ tax_id (13 หลัก)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_tax_id_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_tax_id_check
        CHECK (tax_id IS NULL OR tax_id ~ '^[0-9]{13}$');
    END IF;
END $$;

-- ===================================
-- 3. เพิ่ม Indexes สำหรับ performance
-- ===================================

-- Index สำหรับฟิลด์ใหม่
CREATE INDEX IF NOT EXISTS idx_profiles_id_card ON public.profiles(id_card)
WHERE id_card IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_company_registration ON public.profiles(company_registration)
WHERE company_registration IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);

CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON public.profiles(phone_verified);

-- ===================================
-- 4. เพิ่ม Comments สำหรับ documentation
-- ===================================

COMMENT ON COLUMN public.profiles.id_card IS 'เลขบัตรประจำตัวประชาชน 13 หลัก (สำหรับบุคคลธรรมดา)';
COMMENT ON COLUMN public.profiles.address IS 'ที่อยู่ปัจจุบัน (สำหรับบุคคลธรรมดา)';
COMMENT ON COLUMN public.profiles.use_same_address IS 'ใช้ที่อยู่เดียวกันสำหรับออกใบเสร็จ (สำหรับบุคคลธรรมดา)';
COMMENT ON COLUMN public.profiles.billing_address IS 'ที่อยู่สำหรับออกใบเสร็จ';
COMMENT ON COLUMN public.profiles.company_registration IS 'เลขทะเบียนบริษัท 13 หลัก (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.company_name_th IS 'ชื่อบริษัทภาษาไทย (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.company_name_en IS 'ชื่อบริษัทภาษาอังกฤษ (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.company_address IS 'ที่อยู่บริษัท (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.tax_id IS 'เลขประจำตัวผู้เสียภาษี 13 หลัก (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.company_phone IS 'เบอร์โทรศัพท์บริษัท (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.authorized_person IS 'ชื่อผู้มีอำนาจลงนาม (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.position IS 'ตำแหน่งของผู้มีอำนาจลงนาม (สำหรับนิติบุคคล)';
COMMENT ON COLUMN public.profiles.use_same_address_for_billing IS 'ใช้ที่อยู่บริษัทเดียวกันสำหรับออกใบเสร็จ (สำหรับนิติบุคคล)';

-- ===================================
-- 5. ตรวจสอบข้อมูลที่มีอยู่ (Optional - for verification)
-- ===================================

-- แสดงจำนวน records ที่มีข้อมูลแต่ละประเภท
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added missing fields: id_card, address, use_same_address, billing_address';
    RAISE NOTICE 'Added corporate fields: company_registration, company_name_th, company_name_en, company_address, tax_id, company_phone, authorized_person, position, use_same_address_for_billing';
    RAISE NOTICE 'Added constraints for ID validation (13-digit format)';
    RAISE NOTICE 'Added performance indexes for new fields';
END $$;
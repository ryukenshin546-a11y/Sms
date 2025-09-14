-- Migration Script: Add missing fields to profiles table
-- Created: September 15, 2025
-- This script adds the missing fields from the registration form to the existing profiles table

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
COMMENT ON COLUMN public.profiles.use_same_address_for_billing IS 'ใช้ที่อยู่บริษัทเดียวกันสำหรับออกใบเสร็จ (สำหรับนิติบุคคล)';

-- ===================================
-- 5. ตรวจสอบข้อมูลที่มีอยู่
-- ===================================

-- แสดงจำนวน records ที่มีข้อมูล corporate แต่ไม่มีฟิลด์ใหม่
SELECT
    account_type,
    COUNT(*) as total_records,
    COUNT(company_registration) as has_company_registration,
    COUNT(company_name_th) as has_company_name_th,
    COUNT(id_card) as has_id_card,
    COUNT(address) as has_address
FROM public.profiles
GROUP BY account_type
ORDER BY account_type;

-- แสดงตัวอย่างข้อมูลเพื่อตรวจสอบ
SELECT
    id,
    account_type,
    first_name,
    last_name,
    username,
    email,
    company_registration,
    company_name_th,
    id_card,
    address
FROM public.profiles
WHERE account_type = 'corporate'
LIMIT 5;

SELECT
    id,
    account_type,
    first_name,
    last_name,
    username,
    email,
    id_card,
    address
FROM public.profiles
WHERE account_type = 'individual'
LIMIT 5;
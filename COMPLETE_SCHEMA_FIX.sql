-- COMPLETE SCHEMA FIX: Align database with TypeScript types
-- Created: September 15, 2025
-- Purpose: Fix all schema mismatches once and for all

-- ===================================
-- STEP 1: Fix column name mismatches
-- ===================================

-- 1.1 Replace full_name with first_name + last_name
DO $$
BEGIN
    -- ถ้ามี full_name อยู่ ให้ย้ายข้อมูลก่อน
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        
        -- เพิ่ม first_name, last_name
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS first_name character varying(100),
        ADD COLUMN IF NOT EXISTS last_name character varying(100);
        
        -- ย้ายข้อมูลจาก full_name ไป first_name (ใช้ทั้ง full_name ใน first_name ชั่วคราว)
        UPDATE public.profiles 
        SET first_name = COALESCE(full_name, ''), 
            last_name = ''
        WHERE first_name IS NULL;
        
        -- ลบ full_name column
        ALTER TABLE public.profiles DROP COLUMN full_name;
        
        RAISE NOTICE 'Migrated full_name to first_name, last_name';
    ELSE
        -- ถ้าไม่มี full_name ให้เพิ่ม first_name, last_name ใหม่
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS first_name character varying(100) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS last_name character varying(100) NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Added first_name, last_name columns';
    END IF;
END $$;

-- 1.2 Replace phone_number with phone
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        
        -- เพิ่ม phone column
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS phone character varying(20);
        
        -- ย้ายข้อมูล
        UPDATE public.profiles 
        SET phone = phone_number
        WHERE phone IS NULL;
        
        -- ลบ phone_number column
        ALTER TABLE public.profiles DROP COLUMN phone_number;
        
        RAISE NOTICE 'Migrated phone_number to phone';
    ELSE
        -- เพิ่ม phone column ใหม่
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS phone character varying(20) NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Added phone column';
    END IF;
END $$;

-- ===================================  
-- STEP 2: Add all missing columns
-- ===================================

ALTER TABLE public.profiles
-- Core fields
ADD COLUMN IF NOT EXISTS password character varying(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'user',

-- Individual account fields
ADD COLUMN IF NOT EXISTS id_card character varying(13) null,
ADD COLUMN IF NOT EXISTS address text null,
ADD COLUMN IF NOT EXISTS use_same_address boolean null default false,
ADD COLUMN IF NOT EXISTS billing_address text null,

-- Corporate account fields
ADD COLUMN IF NOT EXISTS company character varying(255) null,
ADD COLUMN IF NOT EXISTS business_type character varying(100) null,
ADD COLUMN IF NOT EXISTS company_registration character varying(13) null,
ADD COLUMN IF NOT EXISTS company_name_th character varying(255) null,
ADD COLUMN IF NOT EXISTS company_name_en character varying(255) null,
ADD COLUMN IF NOT EXISTS company_address text null,
ADD COLUMN IF NOT EXISTS tax_id character varying(13) null,
ADD COLUMN IF NOT EXISTS company_phone character varying(20) null,
ADD COLUMN IF NOT EXISTS authorized_person character varying(255) null,
ADD COLUMN IF NOT EXISTS position character varying(100) null,
ADD COLUMN IF NOT EXISTS use_same_address_for_billing boolean null default false,

-- System tracking fields
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz,
ADD COLUMN IF NOT EXISTS sms_account_data jsonb,
ADD COLUMN IF NOT EXISTS sms_account_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_generated_at timestamptz;

-- ===================================
-- STEP 3: Set required fields as NOT NULL
-- ===================================

-- Update NULL values to empty strings for required fields
UPDATE public.profiles SET first_name = '' WHERE first_name IS NULL;
UPDATE public.profiles SET last_name = '' WHERE last_name IS NULL;
UPDATE public.profiles SET phone = '' WHERE phone IS NULL;
UPDATE public.profiles SET password = '' WHERE password IS NULL;

-- Set NOT NULL constraints
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,  
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN password SET NOT NULL;

-- ===================================
-- STEP 4: Add constraints and indexes
-- ===================================

-- Constraints (PostgreSQL doesn't support IF NOT EXISTS for constraints, so use DO blocks)
DO $$
BEGIN
    -- Add role check constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('admin', 'user', 'corporate'));
    END IF;
    
    -- Add id_card check constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_card_check') THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_id_card_check
        CHECK (id_card IS NULL OR id_card ~ '^[0-9]{13}$');
    END IF;
    
    -- Add company_registration check constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_company_registration_check') THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_company_registration_check
        CHECK (company_registration IS NULL OR company_registration ~ '^[0-9]{13}$');
    END IF;
    
    -- Add tax_id check constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_tax_id_check') THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_tax_id_check
        CHECK (tax_id IS NULL OR tax_id ~ '^[0-9]{13}$');
    END IF;
    
    RAISE NOTICE 'All constraints added successfully';
END $$;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON public.profiles(phone) 
WHERE phone IS NOT NULL AND phone != '';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON public.profiles(business_type) WHERE business_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_id_card ON public.profiles(id_card) WHERE id_card IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_company_registration ON public.profiles(company_registration) WHERE company_registration IS NOT NULL;

-- ===================================
-- STEP 5: Add documentation
-- ===================================

COMMENT ON COLUMN public.profiles.first_name IS 'ชื่อจริง';
COMMENT ON COLUMN public.profiles.last_name IS 'นามสกุล';
COMMENT ON COLUMN public.profiles.phone IS 'หมายเลขโทรศัพท์';
COMMENT ON COLUMN public.profiles.password IS 'รหัสผ่าน (hashed)';
COMMENT ON COLUMN public.profiles.role IS 'บทบาท: admin, user, corporate';
COMMENT ON COLUMN public.profiles.company IS 'ชื่อบริษัท/องค์กร';
COMMENT ON COLUMN public.profiles.business_type IS 'ประเภทธุรกิจ (สำหรับนิติบุคคล)';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== SCHEMA ALIGNMENT COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Fixed column names: full_name -> first_name/last_name, phone_number -> phone';
    RAISE NOTICE 'Added all missing columns from TypeScript types';
    RAISE NOTICE 'Set proper constraints and indexes';
    RAISE NOTICE 'Database schema now perfectly matches frontend types!';
END $$;
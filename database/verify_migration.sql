-- Verification Script: Check profiles table after migration
-- Run this after applying the migration to verify the changes

-- ===================================
-- ตรวจสอบโครงสร้างตารางหลัง migration
-- ===================================

-- แสดงฟิลด์ทั้งหมดในตาราง profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ===================================
-- ตรวจสอบ Constraints
-- ===================================

-- แสดง constraints ที่เกี่ยวข้อง
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
    AND conname LIKE '%profiles%'
ORDER BY conname;

-- ===================================
-- ตรวจสอบ Indexes
-- ===================================

-- แสดง indexes ที่เกี่ยวข้อง
SELECT
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE tablename = 'profiles'
    AND schemaname = 'public'
ORDER BY indexname;

-- ===================================
-- ตรวจสอบข้อมูลที่มีอยู่
-- ===================================

-- แสดงข้อมูลทั้งหมดในตาราง profiles (5 records ล่าสุด)
SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 5;

-- สถิติข้อมูลตามประเภทบัญชี (ใช้เฉพาะฟิลด์ที่มีอยู่จริง)
SELECT
    account_type,
    COUNT(*) as total_records,
    COUNT(id_card) as has_id_card,
    COUNT(address) as has_address,
    COUNT(billing_address) as has_billing_address,
    COUNT(company_registration) as has_company_registration,
    COUNT(company_name_th) as has_company_name_th
FROM public.profiles
GROUP BY account_type
ORDER BY account_type;

-- แสดงตัวอย่างข้อมูล corporate (5 records) - ใช้เฉพาะฟิลด์ที่มีอยู่จริง
SELECT
    id,
    account_type,
    username,
    email,
    company_registration,
    company_name_th,
    id_card,
    address,
    billing_address,
    created_at
FROM public.profiles
WHERE account_type = 'corporate'
ORDER BY created_at DESC
LIMIT 5;

-- แสดงตัวอย่างข้อมูล individual (5 records) - ใช้เฉพาะฟิลด์ที่มีอยู่จริง
SELECT
    id,
    account_type,
    username,
    email,
    id_card,
    address,
    billing_address,
    created_at
FROM public.profiles
WHERE account_type = 'individual'
ORDER BY created_at DESC
LIMIT 5;

-- ===================================
-- ตรวจสอบ Comments
-- ===================================

-- แสดง comments ของ columns
SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    pgd.description
FROM pg_catalog.pg_statio_all_tables AS st
INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c ON (
    pgd.objsubid = c.ordinal_position
    AND c.table_schema = st.schemaname
    AND c.table_name = st.relname
)
WHERE c.table_schema = 'public'
    AND c.table_name = 'profiles'
    AND c.column_name IN ('id_card', 'address', 'use_same_address', 'billing_address', 'use_same_address_for_billing', 'company_registration', 'company_name_th', 'company_name_en', 'company_address', 'tax_id', 'company_phone', 'authorized_person', 'position')
ORDER BY c.column_name;
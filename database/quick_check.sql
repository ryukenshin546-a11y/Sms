-- Quick Check: Simple verification after migration
-- Run this to quickly verify the migration worked

-- 1. Check if new columns exist
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN (
        'id_card', 'address', 'use_same_address', 'billing_address',
        'company_registration', 'company_name_th', 'company_name_en',
        'company_address', 'tax_id', 'company_phone', 'authorized_person',
        'position', 'use_same_address_for_billing'
    )
ORDER BY column_name;

-- 2. Check table structure
SELECT COUNT(*) as total_columns FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 3. Check if we have any data
SELECT
    account_type,
    COUNT(*) as records_count
FROM public.profiles
GROUP BY account_type;

-- 4. Success message
SELECT 'Migration verification completed!' as status;
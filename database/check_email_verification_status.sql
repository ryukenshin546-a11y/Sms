-- Check current email verification status for all users
-- This query compares auth.users.email_confirmed_at with profiles.email_verified

SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    (au.email_confirmed_at IS NOT NULL) as auth_verified,
    p.email_verified as profile_verified,
    p.updated_at,
    CASE 
        WHEN (au.email_confirmed_at IS NOT NULL) = p.email_verified THEN '✅ Synced'
        ELSE '❌ Not Synced'
    END as sync_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.email;

-- Count sync status summary
SELECT 
    CASE 
        WHEN (au.email_confirmed_at IS NOT NULL) = p.email_verified THEN 'Synced'
        ELSE 'Not Synced'
    END as status,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
GROUP BY (au.email_confirmed_at IS NOT NULL) = p.email_verified;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'sync_email_verification_trigger';

-- Check if functions exist
SELECT 
    proname as function_name,
    proowner,
    prokind
FROM pg_proc 
WHERE proname IN ('sync_email_verification', 'sync_all_email_verification');
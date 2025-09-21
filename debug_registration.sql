-- DEBUG: Check current function and test it
-- Let's see what the current function looks like and debug it

-- 1. Check current function definition
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 2. Check if there are any recent auth.users entries without profiles
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    u.created_at as user_created,
    p.id as profile_id,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.created_at > NOW() - INTERVAL '1 day'
ORDER BY u.created_at DESC;

-- 3. Let's also check for any errors in the trigger
-- This will help us see if the trigger is failing silently
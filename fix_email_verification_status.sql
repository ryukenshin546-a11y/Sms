-- Manual fix for existing users with verified emails but false email_verified
-- Run this once to fix existing data inconsistency

UPDATE public.user_profiles 
SET 
  email_verified = true,
  updated_at = NOW()
WHERE 
  user_id IN (
    SELECT id 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
  )
  AND email_verified = false;

-- Show results
SELECT 
  up.id,
  up.user_id,
  up.email,
  up.email_verified,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Should be true'
    ELSE 'Should be false'
  END as expected_status
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC
LIMIT 10;
-- Test Query: ตรวจสอบว่า sms_accounts มี credentials ถูกต้องไหม
SELECT 
    user_id,
    api_credentials->>'username' as username,
    api_credentials->>'password' as password,
    created_at
FROM sms_accounts
ORDER BY created_at DESC;

-- Test Query: ตรวจสอบการ sync เครดิตล่าสุด
SELECT 
    up.user_id,
    up.credit_balance,
    up.updated_at,
    sa.api_credentials->>'username' as sms_username
FROM user_profiles up
LEFT JOIN sms_accounts sa ON up.user_id = sa.user_id
WHERE up.credit_balance IS NOT NULL
ORDER BY up.updated_at DESC;
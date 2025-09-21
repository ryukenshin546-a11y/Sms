-- Quick check if SMS accounts table has the required columns for API integration
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sms_accounts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the new columns exist
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_accounts' 
      AND column_name = 'sender_name'
      AND table_schema = 'public'
) as sender_name_exists,
EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_accounts' 
      AND column_name = 'api_account_id'
      AND table_schema = 'public'
) as api_account_id_exists,
EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_accounts' 
      AND column_name = 'api_response_data'
      AND table_schema = 'public'
) as api_response_data_exists;
-- Migration instructions for applying the database schema
-- Run this in Supabase SQL Editor

-- Step 1: Create the schema
-- Copy and paste the contents of 01_initial_schema.sql

-- Step 2: Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Step 3: Check if default settings were inserted
SELECT setting_key, setting_value 
FROM system_settings 
WHERE is_public = true;

-- Step 4: Test RLS policies (should return empty for anonymous users)
SELECT * FROM users LIMIT 1;

-- Step 5: Test enum types
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

-- Expected results:
-- Tables: users, sms_accounts, generation_jobs, activity_logs, system_settings, api_keys, notifications
-- Settings: 12 default system settings
-- Enums: user_role, account_status, generation_status, job_priority
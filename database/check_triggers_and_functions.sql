-- Check for database triggers that might auto-create profiles
-- This helps identify if there are triggers causing duplicate profile creation

-- Check all triggers on auth.users table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check all triggers on profiles table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
  AND event_object_table = 'profiles'
ORDER BY trigger_name;

-- Check all functions that might create profiles automatically
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_definition ILIKE '%profiles%' OR 
    routine_definition ILIKE '%INSERT INTO profiles%'
  )
ORDER BY routine_name;

-- Check for any policies or functions with "create" in the name
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name ILIKE '%create%profile%'
ORDER BY routine_name;
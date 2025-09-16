-- Add policy for anonymous users to create profile during registration
-- This allows new users to create their profile during the signup process

-- Allow anonymous users to insert their own profile during registration
CREATE POLICY "anon_users_can_insert_profile" ON profiles
  FOR INSERT 
  TO anon
  WITH CHECK (true); -- Allow anon to insert any profile during registration

-- Alternative: More secure version that checks the user exists in auth.users
-- CREATE POLICY "anon_users_can_insert_verified_profile" ON profiles
--   FOR INSERT 
--   TO anon
--   WITH CHECK (
--     -- Only allow if the user ID exists in auth.users
--     EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id)
--   );

-- Grant INSERT permission to anon role
GRANT INSERT ON profiles TO anon;

-- Check updated policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
-- Clean up duplicate RLS policies for profiles table
-- Remove all existing policies and create clean, consistent ones

-- Drop ALL existing policies (including the old ones)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create clean, consistent policies
-- 1. Service role has full access
CREATE POLICY "service_role_full_access" ON profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Users can select their own profile
CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- 3. Users can insert their own profile during registration
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Optional: Users can delete their own profile
CREATE POLICY "users_delete_own_profile" ON profiles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary table permissions
GRANT ALL ON profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Check the final policies
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
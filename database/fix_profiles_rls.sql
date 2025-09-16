-- Fix RLS policies for profiles table registration issue
-- This fixes the "permission denied for table profiles" error during registration

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 1. SELECT policy - Users can read their own profile
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. INSERT policy - Users can create their own profile during registration
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE policy - Users can update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. DELETE policy - Users can delete their own profile (optional)
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE 
  USING (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON profiles TO authenticated;

-- Also grant permissions to anon role for initial registration
GRANT SELECT, INSERT ON profiles TO anon;

-- Test the policies with a sample query
-- This should work for authenticated users
-- SELECT * FROM profiles WHERE id = auth.uid();

-- Check current policies
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
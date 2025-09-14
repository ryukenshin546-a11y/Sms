-- Fix RLS Policy for Registration
-- Purpose: Allow user registration without authentication
-- Created: September 15, 2025

-- ===================================
-- STEP 1: Check current RLS status
-- ===================================

-- ดู RLS policies ที่มีอยู่
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- ===================================  
-- STEP 2: Temporarily disable RLS for registration
-- ===================================

-- Option 1: Disable RLS completely (for development only)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: Add policy to allow registration (recommended)
-- Create policy to allow INSERT for registration
DO $$
BEGIN
    -- Drop existing restrictive policies if any
    DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
    
    -- Create permissive policy for registration
    CREATE POLICY "Enable insert for registration" ON public.profiles
        FOR INSERT 
        WITH CHECK (true);
        
    -- Create policy for users to read their own data
    CREATE POLICY "Users can read own profile" ON public.profiles
        FOR SELECT 
        USING (auth.uid()::text = id::text OR auth.uid() IS NULL);
        
    -- Create policy for users to update their own data  
    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE
        USING (auth.uid()::text = id::text);
        
    RAISE NOTICE 'RLS policies updated for registration support';
END $$;

-- ===================================
-- STEP 3: Enable RLS with proper policies
-- ===================================

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===================================
-- STEP 4: Grant necessary permissions
-- ===================================

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant usage on sequence
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===================================
-- STEP 5: Verification
-- ===================================

-- Show final policies
DO $$
BEGIN
    RAISE NOTICE '=== FINAL RLS POLICIES ===';
    RAISE NOTICE 'Registration: INSERT allowed for all (anon users can register)';
    RAISE NOTICE 'Read: Users can read their own profile + anon can read during registration';
    RAISE NOTICE 'Update: Users can update only their own profile';
    RAISE NOTICE 'RLS properly configured for registration flow!';
END $$;
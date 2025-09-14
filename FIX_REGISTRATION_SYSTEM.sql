-- Fix Registration System with Proper Auth Flow
-- Created: September 15, 2025
-- Purpose: Use Supabase Auth + RLS for secure registration

-- ===================================
-- STEP 1: Create proper RLS policies for auth users
-- ===================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid()::text = id::text);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text);

-- ===================================
-- STEP 2: Grant proper permissions
-- ===================================

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Remove anon permissions (security)
REVOKE ALL ON public.profiles FROM anon;

-- ===================================
-- STEP 3: Create trigger for profile creation (Optional)
-- ===================================

-- Function to create profile automatically after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record when new user signs up
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    username, 
    email,
    phone,
    account_type,
    role,
    credit_balance,
    email_verified,
    phone_verified,
    status,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'account_type', 'personal'),
    'user',
    100, -- Free credits
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    false,
    'active',
    now(),
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- STEP 4: Success message
-- ===================================

DO $$
BEGIN
    RAISE NOTICE '=== REGISTRATION SYSTEM FIXED ===';
    RAISE NOTICE 'Using Supabase Auth + RLS for secure registration';
    RAISE NOTICE 'Profile creation trigger added';
    RAISE NOTICE 'Proper permissions granted to authenticated users only';
    RAISE NOTICE 'Ready for secure user registration!';
END $$;
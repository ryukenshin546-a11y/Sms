-- QUICK FIX: Temporarily disable RLS for development
-- WARNING: This is for development only, not for production!

-- Disable RLS temporarily to test registration
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to anon role for testing
GRANT ALL ON public.profiles TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== TEMPORARY FIX APPLIED ===';
    RAISE NOTICE 'RLS disabled for profiles table';
    RAISE NOTICE 'Full permissions granted to anon role';
    RAISE NOTICE 'WARNING: This is for development only!';
    RAISE NOTICE 'Re-enable RLS before production deployment';
END $$;
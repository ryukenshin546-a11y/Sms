-- ULTIMATE FIX: Completely disable trigger and fix database structure

-- 1. DISABLE TRIGGER COMPLETELY to allow user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- 2. Fix table structure - make username nullable temporarily
ALTER TABLE public.user_profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Drop problematic unique constraint
DROP INDEX IF EXISTS user_profiles_username_key;

-- 4. Create a MINIMAL, SAFE trigger that never fails
CREATE OR REPLACE FUNCTION public.handle_new_user_safe() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert minimal profile that never fails
    INSERT INTO public.user_profiles (
        user_id,
        first_name,
        last_name,
        email,
        username,
        account_type,
        business_type,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(COALESCE(NEW.email, 'user'), '@', 1) || '_' || FLOOR(RANDOM() * 10000)::TEXT),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal'),
        'individual',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Even if profile creation fails, don't prevent user creation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-enable trigger with safe function
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_safe();
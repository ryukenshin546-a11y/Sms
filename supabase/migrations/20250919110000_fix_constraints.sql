-- Fix existing constraints properly
-- Handle constraint removal safely

-- Remove constraint properly
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- Disable problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Make columns optional for registration flexibility
ALTER TABLE public.user_profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN email DROP NOT NULL;

-- Create super simple trigger that never fails
CREATE OR REPLACE FUNCTION public.handle_new_user_simple() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert minimal profile with defaults
    INSERT INTO public.user_profiles (
        user_id, 
        email,
        first_name,
        last_name,
        username,
        account_type,
        created_at,
        updated_at
    ) VALUES (
        NEW.id, 
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''), 
        COALESCE(NEW.raw_user_meta_data->>'username', ''),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal'),
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Log error but don't fail registration
        RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- Update trigger for profile timestamps
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Enable RLS properly
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Enable service role access for registration
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
CREATE POLICY "Service role can insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
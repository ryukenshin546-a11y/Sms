-- COMPLETE FIX for Registration System
-- This fixes all issues with user profile creation

-- 1. First, ensure user_profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    username TEXT,
    business_type TEXT DEFAULT 'individual',
    account_type TEXT DEFAULT 'personal',
    status TEXT DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    credit_balance INTEGER DEFAULT 0,
    
    -- Personal account fields
    id_card TEXT,
    address TEXT,
    billing_address TEXT,
    
    -- Corporate account fields
    company_name_th TEXT,
    company_name_en TEXT,
    tax_id TEXT,
    company_address TEXT,
    company_phone TEXT,
    authorized_person TEXT,
    position TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create unique index on username (allow nulls)
DROP INDEX IF EXISTS idx_user_profiles_username_unique;
CREATE UNIQUE INDEX idx_user_profiles_username_unique ON public.user_profiles(username) WHERE username IS NOT NULL;

-- 3. Create other indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create the FIXED handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    profile_username TEXT;
BEGIN
    -- Generate username from email if not provided
    profile_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Make username unique if it already exists
    WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = profile_username) LOOP
        profile_username := profile_username || '_' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;

    INSERT INTO public.user_profiles (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        username,
        account_type,
        business_type,
        email_verified,
        
        -- Personal account fields
        id_card,
        address,
        billing_address,
        
        -- Corporate account fields
        company_name_th,
        company_name_en,
        tax_id,
        company_address,
        company_phone,
        authorized_person,
        position
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        profile_username,
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'account_type' = 'corporate' THEN 'business'
            ELSE 'individual'
        END,
        NEW.email_confirmed_at IS NOT NULL,
        
        -- Personal account fields
        NEW.raw_user_meta_data->>'id_card',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'billing_address',
        
        -- Corporate account fields
        NEW.raw_user_meta_data->>'company_name_th',
        NEW.raw_user_meta_data->>'company_name_en',
        NEW.raw_user_meta_data->>'tax_id',
        NEW.raw_user_meta_data->>'company_address',
        NEW.raw_user_meta_data->>'company_phone',
        NEW.raw_user_meta_data->>'authorized_person',
        NEW.raw_user_meta_data->>'position'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
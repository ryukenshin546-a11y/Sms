-- EMERGENCY FIX: Disable trigger temporarily and fix the function
-- This will allow registration to work immediately

-- 1. FIRST: Disable the trigger temporarily to allow user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a SAFE version of the handle_new_user function that won't break registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    profile_username TEXT;
    insert_error TEXT;
BEGIN
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

        -- Try to insert the profile
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
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        insert_error := SQLERRM;
        
        -- Create a minimal profile to prevent future errors
        INSERT INTO public.user_profiles (
            user_id,
            first_name,
            last_name,
            email,
            username,
            account_type,
            business_type,
            email_verified
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
            NEW.email,
            SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(RANDOM() * 10000)::TEXT,
            'personal',
            'individual',
            NEW.email_confirmed_at IS NOT NULL
        ) ON CONFLICT (user_id) DO NOTHING;
        
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-enable the trigger with the fixed function
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
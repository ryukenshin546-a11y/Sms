-- Fix phone field missing in trigger function
-- Add phone field to handle_new_user_simple function

CREATE OR REPLACE FUNCTION public.handle_new_user_simple() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert complete profile including phone
    INSERT INTO public.user_profiles (
        user_id, 
        email,
        first_name,
        last_name,
        username,
        phone,
        account_type,
        created_at,
        updated_at
    ) VALUES (
        NEW.id, 
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''), 
        COALESCE(NEW.raw_user_meta_data->>'username', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),  -- เพิ่ม phone field
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
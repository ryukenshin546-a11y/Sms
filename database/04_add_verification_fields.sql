-- Migration: Add verification fields for multi-step registration
-- Created: September 15, 2025
-- Description: Add phone_verified, email_verified fields and update user registration flow

-- Add verification columns to auth.users metadata (Supabase handles this automatically)
-- But we need to track verification status in our application

-- Create users table if not exists (for custom user data)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('personal', 'corporate')) DEFAULT 'personal',
  
  -- Verification fields
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  
  -- Account fields
  credit_balance INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  -- Personal account fields
  id_card TEXT,
  address TEXT,
  use_same_address BOOLEAN DEFAULT FALSE,
  billing_address TEXT,
  
  -- Corporate account fields
  company TEXT,
  business_type TEXT,
  company_registration TEXT,
  company_name_th TEXT,
  company_name_en TEXT,
  company_address TEXT,
  tax_id TEXT,
  company_phone TEXT,
  authorized_person TEXT,
  position TEXT,
  use_same_address_for_billing BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON public.users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Enable RLS (Row Level Security) on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    first_name,
    last_name,
    phone,
    account_type,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update email verification status
CREATE OR REPLACE FUNCTION public.update_user_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update our users table when email is confirmed in auth.users
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET 
      email_verified = TRUE,
      email_verified_at = NEW.email_confirmed_at,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification updates
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_user_email_verification();

-- Function to check if user can use auto-bot (both phone and email verified)
CREATE OR REPLACE FUNCTION public.can_use_autobot(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record public.users%ROWTYPE;
BEGIN
  SELECT * INTO user_record FROM public.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN user_record.phone_verified AND user_record.email_verified AND user_record.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark phone as verified (called from OTP verification)
CREATE OR REPLACE FUNCTION public.mark_phone_verified(user_id UUID, phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users 
  SET 
    phone_verified = TRUE,
    phone_verified_at = NOW(),
    phone = phone_number,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create view for user verification status
CREATE OR REPLACE VIEW public.user_verification_status AS
SELECT 
  u.id,
  u.username,
  u.first_name,
  u.last_name,
  u.phone,
  au.email,
  u.phone_verified,
  u.email_verified,
  u.phone_verified_at,
  u.email_verified_at,
  public.can_use_autobot(u.id) as can_use_autobot,
  u.status,
  u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id;

-- Enable RLS on the view
ALTER VIEW public.user_verification_status SET (security_barrier = true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.user_verification_status TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{"username": "testuser", "first_name": "Test", "last_name": "User", "phone": "0812345678", "account_type": "personal"}'::jsonb
-- );

COMMENT ON TABLE public.users IS 'Extended user profiles with verification status';
COMMENT ON COLUMN public.users.phone_verified IS 'Whether phone number has been verified via OTP';
COMMENT ON COLUMN public.users.email_verified IS 'Whether email address has been verified';
COMMENT ON FUNCTION public.can_use_autobot(UUID) IS 'Check if user can access auto-bot features (requires both phone and email verification)';
COMMENT ON FUNCTION public.mark_phone_verified(UUID, TEXT) IS 'Mark user phone as verified after OTP confirmation';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added verification fields and functions for multi-step registration';
  RAISE NOTICE 'Users table created with RLS policies';
  RAISE NOTICE 'Triggers created for automatic profile creation and email verification';
END $$;
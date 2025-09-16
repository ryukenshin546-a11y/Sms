-- Sync email_verified status from auth.users to profiles table
-- This ensures consistency between auth table and profiles table

-- Function to sync email verification status
CREATE OR REPLACE FUNCTION sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when auth.users.email_confirmed_at changes
  IF OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at THEN
    UPDATE profiles 
    SET 
      email_verified = (NEW.email_confirmed_at IS NOT NULL),
      updated_at = NOW()
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Email verification synced for user %: %', NEW.id, (NEW.email_confirmed_at IS NOT NULL);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS sync_email_verification_trigger ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER sync_email_verification_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION sync_email_verification();

-- Also create a function to manually sync all users
CREATE OR REPLACE FUNCTION sync_all_email_verification()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    email_verified = (auth_users.email_confirmed_at IS NOT NULL),
    updated_at = NOW()
  FROM auth.users auth_users
  WHERE profiles.id = auth_users.id
    AND profiles.email_verified != (auth_users.email_confirmed_at IS NOT NULL);
  
  RAISE NOTICE 'Synced email verification status for all users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run initial sync for existing users
SELECT sync_all_email_verification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_email_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_email_verification() TO service_role;
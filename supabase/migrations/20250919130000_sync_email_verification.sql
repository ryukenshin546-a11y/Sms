-- Create database trigger to auto-update email_verified when auth.users.email_confirmed_at is updated
-- This ensures user_profiles.email_verified stays in sync with auth.users

-- Function to sync email verification status
CREATE OR REPLACE FUNCTION sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when email_confirmed_at changes from null to not null
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.user_profiles 
    SET 
      email_verified = true,
      updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RAISE LOG 'Email verification synced for user %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS sync_email_verification_trigger ON auth.users;
CREATE TRIGGER sync_email_verification_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION sync_email_verification();
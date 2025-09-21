-- Migration: Update SMS Accounts Table for API Integration
-- Created: September 19, 2025
-- Description: Update sms_accounts table to support direct API integration

-- Add new columns if they don't exist
ALTER TABLE public.sms_accounts 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS api_account_id INTEGER,
ADD COLUMN IF NOT EXISTS api_response_data JSONB DEFAULT '{}';

-- Add comments for new columns
COMMENT ON COLUMN public.sms_accounts.sender_name IS 'SMS Sender name (Averin, Brivon, Clyrex)';
COMMENT ON COLUMN public.sms_accounts.api_account_id IS 'Account ID from SMS-UP API response';
COMMENT ON COLUMN public.sms_accounts.api_response_data IS 'Full API response data for debugging';

-- Create index for sender_name for better performance
CREATE INDEX IF NOT EXISTS idx_sms_accounts_sender_name ON public.sms_accounts(sender_name);
CREATE INDEX IF NOT EXISTS idx_sms_accounts_api_account_id ON public.sms_accounts(api_account_id);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view their own SMS accounts" ON public.sms_accounts;
CREATE POLICY "Users can view their own SMS accounts" ON public.sms_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own SMS accounts" ON public.sms_accounts;
CREATE POLICY "Users can insert their own SMS accounts" ON public.sms_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own SMS accounts" ON public.sms_accounts;
CREATE POLICY "Users can update their own SMS accounts" ON public.sms_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to log SMS account creation
CREATE OR REPLACE FUNCTION public.log_sms_account_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the creation in activity_logs if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    INSERT INTO public.activity_logs (
      user_id,
      sms_account_id,
      action,
      description,
      metadata,
      created_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'sms_account_created',
      'SMS Account created via Direct API',
      jsonb_build_object(
        'username', NEW.username,
        'email', NEW.email,
        'sender_name', NEW.sender_name,
        'method', 'direct_api'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging
DROP TRIGGER IF EXISTS trigger_log_sms_account_creation ON public.sms_accounts;
CREATE TRIGGER trigger_log_sms_account_creation
  AFTER INSERT ON public.sms_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sms_account_creation();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.sms_accounts TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update any existing records to have default sender if null
UPDATE public.sms_accounts 
SET sender_name = 'Averin' 
WHERE sender_name IS NULL;

-- Create view for SMS account summary
CREATE OR REPLACE VIEW public.sms_accounts_summary AS
SELECT 
  sa.id,
  sa.user_id,
  sa.account_name,
  sa.username,
  sa.email,
  sa.sender_name,
  sa.status,
  sa.created_at,
  sa.updated_at,
  CASE 
    WHEN sa.encrypted_password IS NOT NULL THEN true 
    ELSE false 
  END as has_credentials,
  up.first_name,
  up.last_name
FROM public.sms_accounts sa
LEFT JOIN public.user_profiles up ON sa.user_id = up.id
WHERE sa.status != 'deleted';

-- Grant access to the view
GRANT SELECT ON public.sms_accounts_summary TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.sms_accounts_summary SET (security_invoker = on);

COMMENT ON VIEW public.sms_accounts_summary IS 'Summary view of SMS accounts with user information';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== SMS ACCOUNTS TABLE MIGRATION COMPLETED ===';
    RAISE NOTICE 'SMS Accounts table updated for Direct API integration';
    RAISE NOTICE 'New columns added: sender_name, api_account_id, api_response_data';
    RAISE NOTICE 'RLS policies updated';
    RAISE NOTICE 'Activity logging enabled';
    RAISE NOTICE 'Summary view created: sms_accounts_summary';
END $$;
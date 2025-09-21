-- Add API Integration columns to existing sms_accounts table
-- This migration is safe to run multiple times

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add sender_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sms_accounts' AND column_name = 'sender_name') THEN
        ALTER TABLE public.sms_accounts ADD COLUMN sender_name TEXT;
        COMMENT ON COLUMN public.sms_accounts.sender_name IS 'SMS Sender name (Averin, Brivon, Clyrex)';
    END IF;

    -- Add api_account_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sms_accounts' AND column_name = 'api_account_id') THEN
        ALTER TABLE public.sms_accounts ADD COLUMN api_account_id INTEGER;
        COMMENT ON COLUMN public.sms_accounts.api_account_id IS 'Account ID from SMS-UP API response';
    END IF;

    -- Add api_response_data column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sms_accounts' AND column_name = 'api_response_data') THEN
        ALTER TABLE public.sms_accounts ADD COLUMN api_response_data JSONB DEFAULT '{}';
        COMMENT ON COLUMN public.sms_accounts.api_response_data IS 'Full API response data for debugging';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_accounts_sender_name ON public.sms_accounts(sender_name);
CREATE INDEX IF NOT EXISTS idx_sms_accounts_api_account_id ON public.sms_accounts(api_account_id);

-- Update RLS policies if needed
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own SMS accounts" ON public.sms_accounts;
    DROP POLICY IF EXISTS "Users can insert their own SMS accounts" ON public.sms_accounts;
    DROP POLICY IF EXISTS "Users can update their own SMS accounts" ON public.sms_accounts;

    -- Create new RLS policies
    CREATE POLICY "Users can view their own SMS accounts" ON public.sms_accounts
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own SMS accounts" ON public.sms_accounts
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own SMS accounts" ON public.sms_accounts
      FOR UPDATE USING (auth.uid() = user_id);
END $$;

-- Enable RLS if not enabled
ALTER TABLE public.sms_accounts ENABLE ROW LEVEL SECURITY;
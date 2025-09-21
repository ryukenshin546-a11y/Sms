-- Create credit_balance table for tracking user credit balances from external API
CREATE TABLE IF NOT EXISTS public.credit_balance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(10,2) NOT NULL DEFAULT 0.00,
  last_sync_at timestamp with time zone DEFAULT now(),
  sync_status text DEFAULT 'success' CHECK (sync_status IN ('success', 'error', 'pending')),
  error_message text,
  api_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_balance_user_id ON public.credit_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balance_last_sync ON public.credit_balance(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_credit_balance_status ON public.credit_balance(sync_status);

-- Enable Row Level Security
ALTER TABLE public.credit_balance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_balance' 
        AND policyname = 'Users can view own credit balance'
    ) THEN
        CREATE POLICY "Users can view own credit balance" ON public.credit_balance
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_balance' 
        AND policyname = 'Users can insert own credit balance'
    ) THEN
        CREATE POLICY "Users can insert own credit balance" ON public.credit_balance
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credit_balance' 
        AND policyname = 'Users can update own credit balance'
    ) THEN
        CREATE POLICY "Users can update own credit balance" ON public.credit_balance
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER handle_credit_balance_updated_at 
  BEFORE UPDATE ON public.credit_balance
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.credit_balance IS 'ตารางเก็บยอดเครดิตคงเหลือของผู้ใช้จาก API ภายนอก';
COMMENT ON COLUMN public.credit_balance.balance IS 'ยอดเครดิตคงเหลือจาก SMSUP API';
COMMENT ON COLUMN public.credit_balance.last_sync_at IS 'เวลาที่ sync ข้อมูลครั้งล่าสุด';
COMMENT ON COLUMN public.credit_balance.sync_status IS 'สถานะการ sync (success/error/pending)';
COMMENT ON COLUMN public.credit_balance.api_response IS 'ข้อมูล response จาก SMSUP API เต็ม';
COMMENT ON COLUMN public.credit_balance.error_message IS 'ข้อความ error หากการ sync ล้มเหลว';
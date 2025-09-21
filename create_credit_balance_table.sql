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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_balance_user_id ON public.credit_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balance_last_sync ON public.credit_balance(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_credit_balance_status ON public.credit_balance(sync_status);

-- Enable RLS
ALTER TABLE public.credit_balance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own credit balance" ON public.credit_balance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit balance" ON public.credit_balance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit balance" ON public.credit_balance
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_credit_balance_updated_at 
  BEFORE UPDATE ON public.credit_balance
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Comments
COMMENT ON TABLE public.credit_balance IS 'ตารางเก็บยอดเครดิตคงเหลือของผู้ใช้';
COMMENT ON COLUMN public.credit_balance.balance IS 'ยอดเครดิตคงเหลือจาก API';
COMMENT ON COLUMN public.credit_balance.last_sync_at IS 'เวลาที่ sync ข้อมูลครั้งล่าสุด';
COMMENT ON COLUMN public.credit_balance.sync_status IS 'สถานะการ sync (success/error/pending)';
COMMENT ON COLUMN public.credit_balance.api_response IS 'ข้อมูล response จาก API เต็ม';
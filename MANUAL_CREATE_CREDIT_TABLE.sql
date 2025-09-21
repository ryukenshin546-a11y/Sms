-- สร้างตาราง credit_balance แบบ manual ใน Supabase SQL Editor
-- Copy และรันใน Dashboard -> SQL Editor

-- 1. สร้างตาราง
CREATE TABLE IF NOT EXISTS public.credit_balance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(10,2) NOT NULL DEFAULT 0.00,
  last_sync_at timestamp with time zone DEFAULT now(),
  sync_status text DEFAULT 'success' CHECK (sync_status IN ('success', 'error', 'pending')),
  error_message text,
  api_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- เพิ่ม UNIQUE constraint สำหรับ user_id
  UNIQUE(user_id)
);

-- 2. สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_credit_balance_user_id ON public.credit_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balance_last_sync ON public.credit_balance(last_sync_at);
CREATE INDEX IF NOT EXISTS idx_credit_balance_status ON public.credit_balance(sync_status);

-- 3. เปิด RLS
ALTER TABLE public.credit_balance ENABLE ROW LEVEL SECURITY;

-- 4. สร้าง RLS policies (ตรวจสอบก่อนสร้าง)
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

-- 5. สร้าง trigger function สำหรับ updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. สร้าง trigger
CREATE TRIGGER handle_credit_balance_updated_at 
  BEFORE UPDATE ON public.credit_balance
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- 7. เพิ่ม comments
COMMENT ON TABLE public.credit_balance IS 'ตารางเก็บยอดเครดิตคงเหลือของผู้ใช้จาก SMSUP API';
COMMENT ON COLUMN public.credit_balance.balance IS 'ยอดเครดิตคงเหลือจาก SMSUP API';
COMMENT ON COLUMN public.credit_balance.last_sync_at IS 'เวลาที่ sync ข้อมูลครั้งล่าสุด';
COMMENT ON COLUMN public.credit_balance.sync_status IS 'สถานะการ sync (success/error/pending)';
COMMENT ON COLUMN public.credit_balance.api_response IS 'ข้อมูล response จาก SMSUP API เต็ม';
COMMENT ON COLUMN public.credit_balance.error_message IS 'ข้อความ error หากการ sync ล้มเหลว';
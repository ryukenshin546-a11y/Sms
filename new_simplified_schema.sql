-- ระบบใหม่: Database Schema ที่เรียบง่าย
-- แทนที่ระบบเก่าที่ซับซ้อน

-- 1. ลบตาราง profiles เก่า (หลังจาก backup ข้อมูล)
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. สร้างตารางใหม่ที่เรียบง่าย
CREATE TABLE public.user_profiles (
  -- Primary key เชื่อมกับ auth.users
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- ข้อมูลส่วนตัวพื้นฐาน
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  
  -- ประเภทบัญชี
  account_type text DEFAULT 'personal' 
    CHECK (account_type IN ('personal', 'business')),
  
  -- ข้อมูลธุรกิจ (เฉพาะ account_type = 'business')
  company_name text,
  tax_id text,
  business_address text,
  
  -- ข้อมูลระบบ
  credit_balance decimal DEFAULT 100.00,
  status text DEFAULT 'active' 
    CHECK (status IN ('active', 'suspended', 'inactive')),
    
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. สร้าง RLS policies ที่เรียบง่าย
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and edit their own profile
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- 4. สร้าง function สำหรับ auto-update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. สร้าง trigger สำหรับ updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. สร้าง indexes สำหรับ performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (id);
CREATE INDEX idx_user_profiles_status ON public.user_profiles USING btree (status);
CREATE INDEX idx_user_profiles_account_type ON public.user_profiles USING btree (account_type);
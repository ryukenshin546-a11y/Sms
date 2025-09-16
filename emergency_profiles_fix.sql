-- แก้ไขปัญหาเร่งด่วน - สร้าง profiles table ชั่วคราวเพื่อให้ระบบทำงาน
-- รันใน Supabase SQL Editor

-- 1. สร้าง profiles table ชั่วคราว (ให้เหมือน user_profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    phone text,
    account_type text DEFAULT 'personal'::text,
    company_name text,
    tax_id text,
    business_address text,
    credit_balance numeric DEFAULT 100.00,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 2. หรือ สร้าง VIEW ที่ชี้ไป user_profiles (วิธีที่ดีกว่า)
DROP VIEW IF EXISTS public.profiles;
CREATE VIEW public.profiles AS
SELECT * FROM public.user_profiles;

-- 3. เพิ่ม trigger ให้ profiles view ก็ทำงานได้
CREATE OR REPLACE RULE profiles_insert AS
    ON INSERT TO public.profiles
    DO INSTEAD
    INSERT INTO public.user_profiles VALUES (NEW.*);

CREATE OR REPLACE RULE profiles_update AS
    ON UPDATE TO public.profiles
    DO INSTEAD
    UPDATE public.user_profiles 
    SET 
        first_name = NEW.first_name,
        last_name = NEW.last_name,
        phone = NEW.phone,
        account_type = NEW.account_type,
        company_name = NEW.company_name,
        tax_id = NEW.tax_id,
        business_address = NEW.business_address,
        credit_balance = NEW.credit_balance,
        status = NEW.status,
        updated_at = NEW.updated_at
    WHERE id = NEW.id;

CREATE OR REPLACE RULE profiles_delete AS
    ON DELETE TO public.profiles
    DO INSTEAD
    DELETE FROM public.user_profiles WHERE id = OLD.id;
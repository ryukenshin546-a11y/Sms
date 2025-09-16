-- แก้ไข RLS Policies ที่อาจทำให้เกิด 406 Not Acceptable error
-- รันใน Supabase SQL Editor

-- 1. ลบ policies เก่าที่อาจมีปัญหา
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert during registration" ON public.profiles;
DROP POLICY IF EXISTS "Allow anonymous insert for new users" ON public.profiles;

-- 2. สร้าง policies ใหม่ที่ง่ายและชัดเจน
-- Policy สำหรับ SELECT - อนุญาตให้ user ดู profile ตัวเอง
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy สำหรับ INSERT - อนุญาต authenticated users สร้าง profile
CREATE POLICY "profiles_insert_authenticated" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy สำหรับ INSERT - อนุญาต anon users สร้าง profile ในระหว่าง registration
CREATE POLICY "profiles_insert_anon_registration" 
ON public.profiles FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy สำหรับ UPDATE - อนุญาตให้ user แก้ไข profile ตัวเอง
CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- 3. เปิดใช้ RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. ตรวจสอบ policies ที่สร้างแล้ว
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY cmd, policyname;
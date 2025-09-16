-- ทางเลือกที่ 2: ปิดการสร้าง profile อัตโนมัติ (ถ้าไม่ต้องการ)
-- รันใน Supabase SQL Editor หากต้องการใช้ manual profile creation เท่านั้น

-- 1. ลบ trigger ที่สร้าง profile อัตโนมัติ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. ลบ function (ถ้าไม่ใช้แล้ว)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. ตรวจสอบว่า trigger ถูกลบแล้ว
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND t.tgname = 'on_auth_user_created'
  AND NOT t.tgisinternal;

-- หาก query นี้ไม่คืนผลลัพธ์ แสดงว่า trigger ถูกลบสำเร็จ
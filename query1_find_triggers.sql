-- รัน Query นี้ใน Supabase SQL Editor เพื่อหาปัญหา
-- (รันทีละส่วน)

-- Query 1: ค้นหา triggers ที่อ้างถึง profiles
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE pg_get_triggerdef(t.oid) ILIKE '%profiles%'
  AND NOT t.tgisinternal;
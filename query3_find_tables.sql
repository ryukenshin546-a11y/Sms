-- Query 3: ดู tables ทั้งหมดที่เกี่ยวข้องกับ profile
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename ILIKE '%profile%'
ORDER BY schemaname, tablename;
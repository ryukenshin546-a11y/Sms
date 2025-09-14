# คู่มือการตรวจสอบ Audit Logs ใน Supabase Dashboard
# Guide สำหรับดู Logging Data และ Performance Metrics

Write-Host "📊 คู่มือตรวจสอบ Audit Logs ใน Supabase Dashboard" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n🔍 ขั้นตอนการดู Audit Logs:" -ForegroundColor Green
Write-Host "1. เปิด Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. เลือกโปรเจ็ค: mnhdueclyzwtfkmwttkc" -ForegroundColor White
Write-Host "3. ไปที่ Database > Tables" -ForegroundColor White
Write-Host "4. ดูตาราง audit_logs และ performance_metrics" -ForegroundColor White

Write-Host "`n📋 SQL Queries สำหรับตรวจสอบข้อมูล:" -ForegroundColor Green

Write-Host "`n-- 1. ดู Audit Logs ล่าสุด 10 รายการ" -ForegroundColor Yellow
$query1 = @"
SELECT 
    timestamp,
    event_type,
    severity,
    message,
    client_ip,
    request_id,
    event_data
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;
"@
Write-Host $query1 -ForegroundColor White

Write-Host "`n-- 2. ดูเฉพาะเหตุการณ์ OTP ที่เกิดขึ้นในชั่วโมงล่าสุด" -ForegroundColor Yellow
$query2 = @"
SELECT 
    timestamp,
    event_type,
    message,
    event_data->>'success' as success_status,
    event_data->>'sms_provider' as provider
FROM audit_logs 
WHERE event_type IN ('otp_send', 'otp_verify')
    AND timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
"@
Write-Host $query2 -ForegroundColor White

Write-Host "`n-- 3. ดู Rate Limiting Events" -ForegroundColor Yellow
$query3 = @"
SELECT 
    timestamp,
    message,
    client_ip,
    event_data->>'limitType' as limit_type,
    event_data->>'requestsCount' as requests_count,
    event_data->>'limitValue' as limit_value
FROM audit_logs 
WHERE event_type = 'rate_limit'
ORDER BY timestamp DESC;
"@
Write-Host $query3 -ForegroundColor White

Write-Host "`n-- 4. ดู Error Events พร้อมรายละเอียด" -ForegroundColor Yellow
$query4 = @"
SELECT 
    timestamp,
    severity,
    message,
    error_message,
    client_ip,
    service_name
FROM audit_logs 
WHERE event_category = 'error'
ORDER BY timestamp DESC;
"@
Write-Host $query4 -ForegroundColor White

Write-Host "`n-- 5. ดู Performance Metrics" -ForegroundColor Yellow
$query5 = @"
SELECT 
    timestamp,
    operation,
    response_time_ms,
    database_query_time_ms,
    success,
    client_ip
FROM performance_metrics 
ORDER BY timestamp DESC
LIMIT 10;
"@
Write-Host $query5 -ForegroundColor White

Write-Host "`n-- 6. สถิติ Performance แบบสรุป" -ForegroundColor Yellow
$query6 = @"
SELECT 
    operation,
    COUNT(*) as total_requests,
    AVG(response_time_ms) as avg_response_time,
    MAX(response_time_ms) as max_response_time,
    SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success_count,
    ROUND(
        (SUM(CASE WHEN success = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2
    ) as success_rate_percent
FROM performance_metrics 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY operation;
"@
Write-Host $query6 -ForegroundColor White

Write-Host "`n📊 วิธีใช้งาน SQL Editor ใน Supabase:" -ForegroundColor Green
Write-Host "1. ไปที่ SQL Editor ในเมนูด้านซ้าย" -ForegroundColor White
Write-Host "2. Copy SQL query ข้างต้นไปวาง" -ForegroundColor White
Write-Host "3. กด Run เพื่อดูผลลัพธ์" -ForegroundColor White
Write-Host "4. สามารถ Export ผลลัพธ์เป็น CSV ได้" -ForegroundColor White

Write-Host "`n🔍 View สำเร็จรูปที่สร้างไว้:" -ForegroundColor Green
$viewQuery = @"
-- ดู Critical Events ใน 24 ชั่วโมงล่าสุด
SELECT * FROM recent_critical_events
LIMIT 20;
"@
Write-Host $viewQuery -ForegroundColor White

Write-Host "`n⚡ Real-time Monitoring:" -ForegroundColor Green
Write-Host "• ใน Table Editor สามารถดูข้อมูลแบบ real-time ได้" -ForegroundColor White
Write-Host "• สามารถตั้ง Filter เพื่อดูเฉพาะเหตุการณ์ที่สนใจ" -ForegroundColor White
Write-Host "• ใช้ Refresh เพื่อดูข้อมูลล่าสุด" -ForegroundColor White

Write-Host "`n🎯 สิ่งที่ควรติดตาม:" -ForegroundColor Green
Write-Host "• จำนวน OTP requests และ success rate" -ForegroundColor White
Write-Host "• Rate limiting events และ patterns" -ForegroundColor White
Write-Host "• Error frequency และ types" -ForegroundColor White
Write-Host "• Response time trends" -ForegroundColor White
Write-Host "• Security events และ suspicious activities" -ForegroundColor White

Write-Host "`n✅ ข้อมูลที่ได้จากการทดสอบ:" -ForegroundColor Green
Write-Host "• OTP send events" -ForegroundColor White
Write-Host "• OTP verification failures" -ForegroundColor White
Write-Host "• Rate limiting demonstrations" -ForegroundColor White
Write-Host "• Performance metrics" -ForegroundColor White
Write-Host "• Client information tracking" -ForegroundColor White

Write-Host "`n🔗 Direct Links:" -ForegroundColor Green
Write-Host "Dashboard: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc" -ForegroundColor Blue
Write-Host "SQL Editor: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Blue
Write-Host "Tables: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/editor" -ForegroundColor Blue

Write-Host "`n📈 การวิเคราะห์ข้อมูล:" -ForegroundColor Green
Write-Host "• สามารถสร้าง Charts และ Graphs จากข้อมูล" -ForegroundColor White
Write-Host "• Export ข้อมูลเพื่อวิเคราะห์เพิ่มเติม" -ForegroundColor White
Write-Host "• ตั้ง Alerts สำหรับเหตุการณ์ผิดปกติ" -ForegroundColor White

Write-Host "`n🎉 ระบบ Audit Logging พร้อมใช้งานแล้ว!" -ForegroundColor Green
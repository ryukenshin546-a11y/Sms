# Supabase Audit Logs Dashboard Guide
# How to view and analyze audit logs and performance metrics

Write-Host "Supabase Audit Logs Dashboard Guide" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

Write-Host "`nStep 1: Access Supabase Dashboard" -ForegroundColor Green
Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select project: mnhdueclyzwtfkmwttkc" -ForegroundColor White
Write-Host "3. Navigate to: Database > Tables" -ForegroundColor White

Write-Host "`nStep 2: Key Tables to Check" -ForegroundColor Green
Write-Host "- audit_logs: All system events and security logs" -ForegroundColor White
Write-Host "- performance_metrics: Performance and timing data" -ForegroundColor White
Write-Host "- recent_critical_events: View for critical events" -ForegroundColor White

Write-Host "`nStep 3: Useful SQL Queries" -ForegroundColor Green

Write-Host "`n-- Recent Audit Logs:" -ForegroundColor Yellow
Write-Host "SELECT timestamp, event_type, severity, message, client_ip" -ForegroundColor White
Write-Host "FROM audit_logs ORDER BY timestamp DESC LIMIT 10;" -ForegroundColor White

Write-Host "`n-- OTP Events in Last Hour:" -ForegroundColor Yellow  
Write-Host "SELECT timestamp, event_type, message," -ForegroundColor White
Write-Host "       event_data->>'success' as success" -ForegroundColor White
Write-Host "FROM audit_logs" -ForegroundColor White
Write-Host "WHERE event_type IN ('otp_send', 'otp_verify')" -ForegroundColor White
Write-Host "  AND timestamp >= NOW() - INTERVAL '1 hour';" -ForegroundColor White

Write-Host "`n-- Rate Limiting Events:" -ForegroundColor Yellow
Write-Host "SELECT timestamp, message, client_ip," -ForegroundColor White
Write-Host "       event_data->>'limitType' as limit_type" -ForegroundColor White
Write-Host "FROM audit_logs WHERE event_type = 'rate_limit';" -ForegroundColor White

Write-Host "`n-- Performance Summary:" -ForegroundColor Yellow
Write-Host "SELECT operation, COUNT(*) as requests," -ForegroundColor White
Write-Host "       AVG(response_time_ms) as avg_time" -ForegroundColor White
Write-Host "FROM performance_metrics" -ForegroundColor White
Write-Host "WHERE timestamp >= NOW() - INTERVAL '24 hours'" -ForegroundColor White
Write-Host "GROUP BY operation;" -ForegroundColor White

Write-Host "`nStep 4: Using SQL Editor" -ForegroundColor Green
Write-Host "1. Go to SQL Editor in left menu" -ForegroundColor White
Write-Host "2. Copy and paste queries above" -ForegroundColor White
Write-Host "3. Click Run to execute" -ForegroundColor White
Write-Host "4. Export results as CSV if needed" -ForegroundColor White

Write-Host "`nStep 5: What to Monitor" -ForegroundColor Green
Write-Host "- OTP success/failure rates" -ForegroundColor White
Write-Host "- Rate limiting patterns" -ForegroundColor White
Write-Host "- Response time trends" -ForegroundColor White
Write-Host "- Error frequency and types" -ForegroundColor White
Write-Host "- Security events" -ForegroundColor White

Write-Host "`nDirect Links:" -ForegroundColor Green
Write-Host "Dashboard: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc" -ForegroundColor Blue
Write-Host "SQL Editor: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Blue

Write-Host "`nTesting Data Available:" -ForegroundColor Green
Write-Host "- OTP send events from tests" -ForegroundColor White
Write-Host "- OTP verification failures" -ForegroundColor White
Write-Host "- Rate limiting demonstrations" -ForegroundColor White
Write-Host "- Performance metrics" -ForegroundColor White

Write-Host "`nAudit Logging System is Ready!" -ForegroundColor Green
# Test Audit Logging System
# Tests the comprehensive logging and monitoring features

Write-Host "🔍 Testing Enhanced Logging and Audit Trail System" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Test Configuration
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGR1ZWNseXp3dGZrbXd0dGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyNzk3OTUsImV4cCI6MjA0MTg1NTc5NX0.G3Pv8OjPfDYRQW1ybcBVqICeYKRkh5AY5iOFG0RG0zs"
    "Content-Type" = "application/json"
}

# Test 1: OTP Send with Logging
Write-Host "`n🧪 Test 1: OTP Send with Audit Logging" -ForegroundColor Green
$sendBody = '{"phoneNumber":"0812345678","userId":"test-audit-1"}'

try {
    $sendResponse = Invoke-WebRequest -Uri "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-send-new" -Method Post -Body $sendBody -Headers $headers
    $sendData = $sendResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Status: $($sendResponse.StatusCode)" -ForegroundColor Yellow
    Write-Host "✅ Success: $($sendData.success)" -ForegroundColor Yellow
    Write-Host "✅ OTP ID: $($sendData.otpId)" -ForegroundColor Yellow
    Write-Host "✅ Request ID in headers: $($sendResponse.Headers.'X-Request-ID')" -ForegroundColor Yellow
    
    # Store for verification test
    $otpId = $sendData.otpId
    $referenceCode = $sendData.referenceCode
    
} catch {
    Write-Host "❌ OTP Send failed: $($_.Exception.Message)" -ForegroundColor Red
    return
}

Start-Sleep -Seconds 2

# Test 2: Invalid OTP Verification (to test failure logging)
Write-Host "`n🧪 Test 2: Invalid OTP Verification (Testing Failure Logging)" -ForegroundColor Green
$verifyBody = @{
    otpId = $otpId
    referenceCode = $referenceCode  
    otpCode = "123456"  # Wrong OTP
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-WebRequest -Uri "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-verify" -Method Post -Body $verifyBody -Headers $headers
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Status: $($verifyResponse.StatusCode)" -ForegroundColor Yellow
    Write-Host "✅ Success: $($verifyData.success)" -ForegroundColor Yellow
    Write-Host "✅ Message: $($verifyData.message)" -ForegroundColor Yellow
    Write-Host "✅ Attempts Remaining: $($verifyData.attemptsRemaining)" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ OTP Verify failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Rate Limiting (to test rate limit logging)
Write-Host "`n🧪 Test 3: Rate Limiting Test (Testing Rate Limit Logging)" -ForegroundColor Green
for ($i = 1; $i -le 3; $i++) {
    Write-Host "Request $i of 3..." -ForegroundColor Cyan
    
    try {
        $rateTestBody = '{"phoneNumber":"0812345679","userId":"rate-test-' + $i + '"}'
        $rateResponse = Invoke-WebRequest -Uri "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-send-new" -Method Post -Body $rateTestBody -Headers $headers
        $rateData = $rateResponse.Content | ConvertFrom-Json
        
        Write-Host "  ✅ Success: $($rateData.success), Remaining: $($rateResponse.Headers.'X-RateLimit-Remaining')" -ForegroundColor Green
        
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse.StatusCode -eq 429) {
            Write-Host "  🚫 Rate limited (as expected): $($errorResponse.StatusCode)" -ForegroundColor Yellow
            Write-Host "  🚫 Retry After: $($errorResponse.Headers.'Retry-After') seconds" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n📊 Audit Log Summary" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray
Write-Host "The following events should now be logged in the audit_logs table:" -ForegroundColor White
Write-Host "• OTP send request with success/failure status" -ForegroundColor Green
Write-Host "• OTP verification attempt with failure details" -ForegroundColor Green  
Write-Host "• Rate limiting events with detailed metrics" -ForegroundColor Green
Write-Host "• Performance metrics for all operations" -ForegroundColor Green
Write-Host "• Client IP addresses and user agents" -ForegroundColor Green
Write-Host "• Request IDs for tracing across services" -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check Supabase Dashboard -> Database -> Tables -> audit_logs" -ForegroundColor Yellow
Write-Host "2. View performance_metrics table for timing data" -ForegroundColor Yellow
Write-Host "3. Use recent_critical_events view for error monitoring" -ForegroundColor Yellow
Write-Host "4. Implement dashboard for real-time log monitoring" -ForegroundColor Yellow

Write-Host "`n✅ Enhanced Logging Test Completed!" -ForegroundColor Green
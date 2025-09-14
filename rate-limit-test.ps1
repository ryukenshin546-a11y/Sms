# Rate Limiting Test Script
param(
    [string]$AuthToken = "",
    [int]$TestRequests = 7
)

Write-Host "Testing Rate Limiting with $TestRequests requests..." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $AuthToken"
    "apikey" = "sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH"
    "Content-Type" = "application/json"
}

$baseUrl = "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-send-new"

Write-Host "Sending $TestRequests OTP requests rapidly to test IP rate limiting..." -ForegroundColor Yellow
Write-Host "Expected: First 5 should succeed, then rate limited" -ForegroundColor Cyan

for ($i = 1; $i -le $TestRequests; $i++) {
    $phoneNumber = "6691779970$i"
    $startTime = Get-Date
    
    try {
        $body = @{
            phoneNumber = $phoneNumber
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "Request $i SUCCESS - ${responseTime}ms" -ForegroundColor Green
        Write-Host "  Phone: $phoneNumber"
        Write-Host "  OTP ID: $($result.otpId)"
        Write-Host "  Reference Code: $($result.referenceCode)"
        
    } catch {
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 429) {
            Write-Host "Request $i RATE LIMITED (429) - ${responseTime}ms" -ForegroundColor Red
            Write-Host "  Phone: $phoneNumber"
            Write-Host "  Rate limit reached as expected!" -ForegroundColor Yellow
        } else {
            Write-Host "Request $i FAILED ($statusCode) - ${responseTime}ms" -ForegroundColor Red  
            Write-Host "  Phone: $phoneNumber"
            Write-Host "  Error: $($_.Exception.Message)"
        }
    }
    
    # Small delay between requests
    Start-Sleep -Milliseconds 100
}

Write-Host "`nRate Limiting Test Completed!" -ForegroundColor Green
Write-Host "Expected behavior:" -ForegroundColor Yellow
Write-Host "  - First 5 requests should succeed" 
Write-Host "  - Requests 6-7 should be rate limited (429)"
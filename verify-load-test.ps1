# OTP Verification Load Test
param(
    [string]$AuthToken = "",
    [int]$VerifyRequests = 3
)

Write-Host "Starting OTP Verification Load Test..." -ForegroundColor Green

# Use some of the OTPs we just generated for verification test
$otpTests = @(
    @{otpId="93d03721-e11e-4348-a310-0fa1df4e13f4"; refCode="DOniq0sOE"; phone="66917799631"},
    @{otpId="1a8531ce-eacf-4b7e-bdf7-0875eafd7714"; refCode="J4ncY6IaL"; phone="66917799632"},
    @{otpId="d7c5df60-c3a1-43d8-ab89-0688e60911ab"; refCode="MKWHVKCZv"; phone="66917799633"}
)

$headers = @{
    "Authorization" = "Bearer $AuthToken"
    "apikey" = "sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH"
    "Content-Type" = "application/json"
}

$verifyUrl = "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-verify"

Write-Host "Testing OTP verification with wrong codes (for performance testing)..." -ForegroundColor Yellow

foreach ($i in 0..($VerifyRequests-1)) {
    $test = $otpTests[$i]
    $startTime = Get-Date
    
    try {
        $body = @{
            otpId = $test.otpId
            referenceCode = $test.refCode
            otpCode = "999999"  # Wrong code for testing
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri $verifyUrl -Method POST -Headers $headers -Body $body
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "  Verify Request $($i+1) (Phone: $($test.phone)): SUCCESS - ${responseTime}ms"
        Write-Host "    Result: $($result.message), Attempts Remaining: $($result.attemptsRemaining)"
        
    } catch {
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "  Verify Request $($i+1): FAILED - ${responseTime}ms"
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "OTP Verification Load Test completed!" -ForegroundColor Green
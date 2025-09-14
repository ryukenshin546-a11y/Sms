# Load Testing Script for OTP System
# Version: 1.0
# Date: September 14, 2025

param(
    [int]$ConcurrentRequests = 5,
    [string]$Write-Host "LOAD TEST RESULTS:" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor GreenthToken = "",
    [string]$TestPhoneBase = "6691779960"
)

Write-Host "Starting Load Test with $ConcurrentRequests concurrent requests..." -ForegroundColor Green

# Headers for API calls
$headers = @{
    "Authorization" = "Bearer $AuthToken"
    "apikey" = "sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH"
    "Content-Type" = "application/json"
}

$baseUrl = "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-send-new"

# Function to make single OTP request
function Send-OTPRequest {
    param(
        [int]$RequestId,
        [string]$PhoneNumber
    )
    
    $startTime = Get-Date
    try {
        $body = @{
            phoneNumber = $PhoneNumber
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $body
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        return @{
            RequestId = $RequestId
            PhoneNumber = $PhoneNumber
            Success = $true
            ResponseTime = $responseTime
            OtpId = $result.otpId
            ReferenceCode = $result.referenceCode
            Error = $null
        }
    }
    catch {
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        return @{
            RequestId = $RequestId
            PhoneNumber = $PhoneNumber
            Success = $false
            ResponseTime = $responseTime
            OtpId = $null
            ReferenceCode = $null
            Error = $_.Exception.Message
        }
    }
}

# Start concurrent requests
Write-Host "Sending $ConcurrentRequests concurrent OTP requests..." -ForegroundColor Yellow

$jobs = @()
$overallStartTime = Get-Date

for ($i = 1; $i -le $ConcurrentRequests; $i++) {
    $phoneNumber = "$TestPhoneBase$i"
    
    $job = Start-Job -ScriptBlock {
        param($RequestId, $PhoneNumber, $BaseUrl, $Headers)
        
        # Import the function into job scope
        function Send-OTPRequest {
            param(
                [int]$RequestId,
                [string]$PhoneNumber
            )
            
            $startTime = Get-Date
            try {
                $body = @{
                    phoneNumber = $PhoneNumber
                } | ConvertTo-Json
                
                $result = Invoke-RestMethod -Uri $using:BaseUrl -Method POST -Headers $using:Headers -Body $body
                $endTime = Get-Date
                $responseTime = ($endTime - $startTime).TotalMilliseconds
                
                return @{
                    RequestId = $RequestId
                    PhoneNumber = $PhoneNumber
                    Success = $true
                    ResponseTime = $responseTime
                    OtpId = $result.otpId
                    ReferenceCode = $result.referenceCode
                    Error = $null
                }
            }
            catch {
                $endTime = Get-Date
                $responseTime = ($endTime - $startTime).TotalMilliseconds
                
                return @{
                    RequestId = $RequestId
                    PhoneNumber = $PhoneNumber
                    Success = $false
                    ResponseTime = $responseTime
                    OtpId = $null
                    ReferenceCode = $null
                    Error = $_.Exception.Message
                }
            }
        }
        
        Send-OTPRequest -RequestId $RequestId -PhoneNumber $PhoneNumber
    } -ArgumentList $i, $phoneNumber, $baseUrl, $headers
    
    $jobs += $job
    Write-Host "  Started request $i for phone: $phoneNumber" -ForegroundColor Cyan
}

# Wait for all jobs to complete
Write-Host "Waiting for all requests to complete..." -ForegroundColor Yellow
$results = @()

foreach ($job in $jobs) {
    $result = Receive-Job -Job $job -Wait
    $results += $result
    Remove-Job -Job $job
}

$overallEndTime = Get-Date
$totalTestTime = ($overallEndTime - $overallStartTime).TotalMilliseconds

# Analyze results
Write-Host "`n📈 LOAD TEST RESULTS:" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green

Write-Host "Overall Statistics:" -ForegroundColor Yellow
Write-Host "  Total Test Time: $([math]::Round($totalTestTime, 2)) ms"
Write-Host "  Concurrent Requests: $ConcurrentRequests"

$successCount = ($results | Where-Object { $_.Success }).Count
$failureCount = ($results | Where-Object { -not $_.Success }).Count
$successRate = ($successCount / $ConcurrentRequests) * 100

Write-Host "  Success Count: $successCount"
Write-Host "  Failure Count: $failureCount"
Write-Host "  Success Rate: $([math]::Round($successRate, 2))%"

if ($successCount -gt 0) {
    $successfulResults = $results | Where-Object { $_.Success }
    $avgResponseTime = ($successfulResults | Measure-Object -Property ResponseTime -Average).Average
    $minResponseTime = ($successfulResults | Measure-Object -Property ResponseTime -Minimum).Minimum
    $maxResponseTime = ($successfulResults | Measure-Object -Property ResponseTime -Maximum).Maximum
    
    Write-Host "  Average Response Time: $([math]::Round($avgResponseTime, 2)) ms"
    Write-Host "  Min Response Time: $([math]::Round($minResponseTime, 2)) ms"
    Write-Host "  Max Response Time: $([math]::Round($maxResponseTime, 2)) ms"
}

Write-Host "Individual Request Results:" -ForegroundColor Yellow
foreach ($result in $results) {
    $status = if ($result.Success) { "SUCCESS" } else { "FAILED" }
    $time = [math]::Round($result.ResponseTime, 2)
    
    Write-Host "  Request $($result.RequestId) ($($result.PhoneNumber)): $status - ${time}ms"
    
    if ($result.Success) {
        Write-Host "    OTP ID: $($result.OtpId)"
        Write-Host "    Reference Code: $($result.ReferenceCode)"
    } else {
        Write-Host "    Error: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host "PERFORMANCE ANALYSIS:" -ForegroundColor Green
if ($successRate -eq 100) {
    Write-Host "All requests successful - System handling concurrent load well!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "Most requests successful - Some optimization may be needed" -ForegroundColor Yellow
} else {
    Write-Host "High failure rate - System struggling with concurrent load!" -ForegroundColor Red
}

if ($successCount -gt 0 -and $avgResponseTime -lt 5000) {
    Write-Host "Response times acceptable (< 5 seconds)" -ForegroundColor Green
} elseif ($successCount -gt 0 -and $avgResponseTime -lt 10000) {
    Write-Host "Response times slow but acceptable (5-10 seconds)" -ForegroundColor Yellow
} elseif ($successCount -gt 0) {
    Write-Host "Response times very slow (> 10 seconds)" -ForegroundColor Red
}

Write-Host "Test completed at $(Get-Date)" -ForegroundColor Green
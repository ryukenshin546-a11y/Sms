# Test script for create-sms-account Edge Function
Write-Host "Testing create-sms-account Edge Function..." -ForegroundColor Cyan

$PROJECT_URL = "https://mnhdueclyzwtfkmwttkc.supabase.co"
$FUNCTION_URL = "$PROJECT_URL/functions/v1/create-sms-account"

Write-Host "Function URL: $FUNCTION_URL" -ForegroundColor Yellow

try {
    Write-Host "Test 1: CORS Preflight check..." -ForegroundColor Green
    
    $corsResponse = Invoke-WebRequest -Uri $FUNCTION_URL -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "authorization, content-type"
    } -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($corsResponse.StatusCode -eq 200) {
        Write-Host "CORS preflight successful" -ForegroundColor Green
    } else {
        Write-Host "CORS preflight failed: $($corsResponse.StatusCode)" -ForegroundColor Red
    }

    Write-Host "Test 2: Unauthorized access check..." -ForegroundColor Green
    
    try {
        $unauthorizedResponse = Invoke-WebRequest -Uri $FUNCTION_URL -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
        Write-Host "Should have failed with unauthorized" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "Correctly returns 401 Unauthorized" -ForegroundColor Green
        } else {
            Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    Write-Host "Function deployment verification..." -ForegroundColor Green
    Write-Host "Edge Function is accessible at: $FUNCTION_URL" -ForegroundColor Green
    
} catch {
    Write-Host "Error testing Edge Function: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Edge Function Testing Complete!" -ForegroundColor Cyan
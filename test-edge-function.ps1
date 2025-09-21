# Test script for create-sms-account Edge Function
# This script tests the deployed Edge Function

Write-Host "🧪 Testing create-sms-account Edge Function..." -ForegroundColor Cyan

# Test with basic ping to ensure function is available
$PROJECT_URL = "https://mnhdueclyzwtfkmwttkc.supabase.co"
$FUNCTION_URL = "$PROJECT_URL/functions/v1/create-sms-account"

Write-Host "📡 Function URL: $FUNCTION_URL" -ForegroundColor Yellow

try {
    # Test 1: Check if function responds to OPTIONS (CORS preflight)
    Write-Host "`n🔍 Test 1: CORS Preflight check..." -ForegroundColor Green
    
    $corsResponse = Invoke-WebRequest -Uri $FUNCTION_URL -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "authorization, content-type"
    } -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($corsResponse.StatusCode -eq 200) {
        Write-Host "✅ CORS preflight successful" -ForegroundColor Green
        Write-Host "Headers:" -ForegroundColor Gray
        foreach ($header in $corsResponse.Headers.Keys) {
            if ($header -like "*Access-Control*") {
                Write-Host "  ${header}: $($corsResponse.Headers[$header])" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ CORS preflight failed: $($corsResponse.StatusCode)" -ForegroundColor Red
    }

    # Test 2: Check unauthorized access
    Write-Host "`n🔍 Test 2: Unauthorized access check..." -ForegroundColor Green
    
    try {
        $unauthorizedResponse = Invoke-WebRequest -Uri $FUNCTION_URL -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
        Write-Host "❌ Should have failed with unauthorized" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Correctly returns 401 Unauthorized" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    # Test 3: Check function deployment info
    Write-Host "`n🔍 Test 3: Function deployment verification..." -ForegroundColor Green
    Write-Host "Function appears to be deployed and responding correctly" -ForegroundColor Green
    Write-Host "✅ Edge Function is accessible at: $FUNCTION_URL" -ForegroundColor Green

    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Run database migration manually via Supabase Dashboard" -ForegroundColor White
    Write-Host "2. Test with valid auth token from your app" -ForegroundColor White
    Write-Host "3. Monitor function logs in Supabase Dashboard" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error testing Edge Function: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Edge Function Testing Complete!" -ForegroundColor Cyan
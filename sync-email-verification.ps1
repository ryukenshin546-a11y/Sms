# Sync Email Verification Database Script
Write-Host "🔄 Syncing Email Verification Database..." -ForegroundColor Green

# Load environment variables
if (Test-Path "supabase\.env") {
    Get-Content "supabase\.env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$serviceKey = $env:VITE_SUPABASE_SERVICE_KEY

if (!$supabaseUrl -or !$serviceKey) {
    Write-Host "❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in environment" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Supabase URL: $supabaseUrl" -ForegroundColor Blue
Write-Host "🔑 Service Key: $($serviceKey.Substring(0, 20))..." -ForegroundColor Blue

# Read the SQL file
$sqlContent = Get-Content "database\sync_email_verification.sql" -Raw

Write-Host "📄 Executing SQL script..." -ForegroundColor Yellow

try {
    # Use Invoke-RestMethod to execute SQL via Supabase REST API
    $headers = @{
        'apikey' = $serviceKey
        'Authorization' = "Bearer $serviceKey"
        'Content-Type' = 'application/json'
    }
    
    # Execute SQL using PostgREST
    $body = @{
        query = $sqlContent
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Database sync completed successfully!" -ForegroundColor Green
    Write-Host "📊 Response: $response" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error executing SQL:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`n💡 Alternative: Run this SQL manually in Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "1. Go to https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Gray
    Write-Host "2. Copy and paste the content from database\sync_email_verification.sql" -ForegroundColor Gray
    Write-Host "3. Click 'Run' to execute" -ForegroundColor Gray
}

Write-Host "`n🎯 What this script does:" -ForegroundColor Cyan
Write-Host "- Creates a trigger to auto-sync email_verified status" -ForegroundColor Gray
Write-Host "- Syncs auth.users.email_confirmed_at with profiles.email_verified" -ForegroundColor Gray  
Write-Host "- Ensures database consistency for email verification" -ForegroundColor Gray